import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import {
  Prisma,
  OrderStatus,
  PaymentStatus,
  ReservationStatus,
  ProductStatus,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { QueryOrdersDto } from './dto/query-orders.dto.js';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Atomic Order Checkout with PostgreSQL Transaction & Stock Reservation
   * Enforces zero double-selling via atomic UPDATE:
   * UPDATE products SET stock = stock - qty, reservedStock = reservedStock + qty WHERE id = ? AND stock >= qty
   */
  async checkout(
    dto: CheckoutDto,
    userId?: string,
    sessionId?: string,
    userEmail?: string,
  ) {
    // 1. Locate active cart
    let cart: any = null;
    if (userId) {
      cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { orderBy: { sortOrder: 'asc' } },
                },
              },
            },
          },
        },
      });
    }

    if (!cart && (sessionId || dto.sessionId)) {
      const activeSession = sessionId || dto.sessionId;
      cart = await this.prisma.cart.findUnique({
        where: { sessionId: activeSession },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { orderBy: { sortOrder: 'asc' } },
                },
              },
            },
          },
        },
      });
    }

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Your shopping cart is empty');
    }

    // 2. Validate customer contact info
    const customerEmail = userEmail || dto.customerEmail;
    if (!customerEmail) {
      throw new BadRequestException(
        'Customer email address is required to place an order',
      );
    }

    // 3. Compute accurate monetary amounts
    let subtotal = 0;
    for (const item of cart.items) {
      subtotal += Number(item.product.price) * item.quantity;
    }

    const shippingAmount = subtotal >= 150 ? 0.0 : 15.0; // Free shipping over $150
    const taxAmount = Math.round(subtotal * 0.05 * 100) / 100; // 5% tax
    const totalAmount =
      Math.round((subtotal + shippingAmount + taxAmount) * 100) / 100;

    // 4. Generate unique readable order number (ORD-YYYYMMDD-XXXXX)
    const dateSegment = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSegment = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `ORD-${dateSegment}-${randomSegment}`;

    // 5. Reservation window: 30 minutes to finalize payment
    const reservationExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // 6. Execute atomic reservation and order placement within a single PG transaction
    const order = await this.prisma.$transaction(
      async (tx) => {
        // Step A: Atomic conditional stock deduction for every single line item
        for (const item of cart.items) {
          if (item.product.status !== ProductStatus.ACTIVE) {
            throw new ConflictException(
              `Product "${item.product.title}" is currently unavailable.`,
            );
          }

          // Atomic query: decrement stock, increment reservedStock ONLY if stock >= quantity
          const updatedRows = await tx.$executeRaw`
            UPDATE "products"
            SET "stock" = "stock" - ${item.quantity},
                "reservedStock" = "reservedStock" + ${item.quantity},
                "updatedAt" = NOW()
            WHERE "id" = ${item.productId} AND "stock" >= ${item.quantity}
          `;

          if (updatedRows === 0) {
            throw new ConflictException(
              `Insufficient stock for "${item.product.title}". It may have just sold out. Available: ${item.product.stock}`,
            );
          }
        }

        // Step B: Persist Order and immutable snapshots
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            userId: userId || null,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.UNPAID,
            currency: (dto.currency || 'USD').toUpperCase(),
            subtotal: new Prisma.Decimal(subtotal),
            taxAmount: new Prisma.Decimal(taxAmount),
            shippingAmount: new Prisma.Decimal(shippingAmount),
            discountAmount: new Prisma.Decimal(0.0),
            totalAmount: new Prisma.Decimal(totalAmount),
            shippingAddress: dto.shippingAddress as any,
            billingAddress: (dto.billingAddress || dto.shippingAddress) as any,
            customerEmail,
            customerPhone: dto.customerPhone || dto.shippingAddress.phone,
            notes: dto.notes,
            items: {
              create: cart.items.map((item: any) => ({
                productId: item.productId,
                productTitle: item.product.title,
                productSku: item.product.sku,
                productImage: item.product.images[0]?.url || null,
                unitPrice: item.product.price,
                quantity: item.quantity,
                totalPrice: new Prisma.Decimal(
                  Number(item.product.price) * item.quantity,
                ),
              })),
            },
            reservations: {
              create: cart.items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                status: ReservationStatus.RESERVED,
                expiresAt: reservationExpiresAt,
              })),
            },
          },
          include: {
            items: true,
            reservations: true,
          },
        });

        // Step C: Flush processed items from the shopping cart
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        return newOrder;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    this.logger.log(
      `Order placed: ${order.orderNumber} (Total: $${order.totalAmount}) with atomic stock lock`,
    );

    return order;
  }

  /**
   * List paginated orders for customer or admin
   */
  async findAll(query: QueryOrdersDto, userId?: string, isAdmin = false) {
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 50);
    const page = Math.max(Number(query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (!isAdmin && userId) {
      where.userId = userId;
    } else if (isAdmin && query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { customerEmail: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.orderStatus) {
      where.status = query.orderStatus;
    }

    if (query.paymentStatus) {
      where.paymentStatus = query.paymentStatus;
    }

    const [totalItems, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          _count: {
            select: { items: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      data: orders,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get single order details by UUID or orderNumber
   */
  async findByIdOrOrderNumber(
    idOrOrderNumber: string,
    userId?: string,
    isAdmin = false,
  ) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrOrderNumber,
      );

    const order = await this.prisma.order.findUnique({
      where: isUuid ? { id: idOrOrderNumber } : { orderNumber: idOrOrderNumber },
      include: {
        items: true,
        payments: true,
        reservations: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order '${idOrOrderNumber}' not found`);
    }

    // Strict Authorization / IDOR Protection:
    // 1. Admins and Managers have global read access
    if (isAdmin) {
      return order;
    }

    // 2. If the order belongs to a registered customer account, require authentication as that specific user
    if (order.userId) {
      if (!userId || order.userId !== userId) {
        throw new ForbiddenException('You do not have permission to view this order');
      }
      return order;
    }

    // 3. If it's a guest order (placed without an account):
    // Guests can ONLY access order details via the secure cryptographic UUID (returned directly upon checkout),
    // and CANNOT enumerate or probe orders via the sequential/predictable orderNumber.
    if (!isUuid) {
      throw new ForbiddenException(
        'For guest orders, access requires the secure order tracking UUID provided at checkout',
      );
    }

    return order;
  }
}
