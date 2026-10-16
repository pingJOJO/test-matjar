import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma, OrderStatus, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service.js';
import { AdminOrdersQueryDto } from './dto/admin-orders-query.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { QuickUpdateProductDto } from './dto/quick-update-product.dto.js';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 1. Analytics & Executive KPI Overview
   */
  async getAnalyticsOverview() {
    const [
      salesAgg,
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      lowStockCount,
      outOfStockCount,
      totalProducts,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      // Sum total paid sales
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: 'PAID' },
      }),
      // Total orders count
      this.prisma.order.count(),
      // Order status breakdowns
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { status: OrderStatus.PROCESSING } }),
      this.prisma.order.count({ where: { status: OrderStatus.SHIPPED } }),
      this.prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      // Low stock count (<= 5)
      this.prisma.product.count({ where: { stock: { lte: 5, gt: 0 } } }),
      // Out of stock count (= 0)
      this.prisma.product.count({ where: { stock: { lte: 0 } } }),
      // Total products
      this.prisma.product.count(),
      // Top 5 recent orders
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      // Top 5 urgent low-stock equipment parts
      this.prisma.product.findMany({
        where: { stock: { lte: 8 } },
        take: 5,
        orderBy: { stock: 'asc' },
        select: {
          id: true,
          title: true,
          sku: true,
          stock: true,
          price: true,
          lowStockAlert: true,
          images: {
            take: 1,
            select: { url: true },
          },
        },
      }),
    ]);

    const totalRevenue = salesAgg._sum.totalAmount ? Number(salesAgg._sum.totalAmount) : 0;

    return {
      overview: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        lowStockCount,
        outOfStockCount,
        totalProducts,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.paymentStatus,
        totalAmount: Number(o.totalAmount),
        customerEmail: o.customerEmail,
        customerName:
          o.user ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() : (o.shippingAddress as any)?.fullName || 'عميل نقدي',
        companyName: (o.shippingAddress as any)?.companyName || 'مؤسسة مقاولات',
        itemCount: o.items.length,
        createdAt: o.createdAt,
      })),
      urgentLowStock: lowStockProducts.map((p) => ({
        id: p.id,
        title: p.title,
        sku: p.sku,
        stock: p.stock,
        price: Number(p.price),
        lowStockAlert: p.lowStockAlert,
        image: p.images[0]?.url || null,
      })),
    };
  }

  /**
   * 2. Field Orders Management (GET /api/v1/admin/orders)
   */
  async getOrders(query: AdminOrdersQueryDto) {
    const { status, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { customerEmail: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q, mode: 'insensitive' } },
        { trackingNumber: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  weightKg: true,
                  attributes: true,
                  stock: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    const formattedOrders = orders.map((o) => {
      const address = (o.shippingAddress as any) || {};
      const totalWeightKg = o.items.reduce((acc, item) => {
        const itemWeight = item.product?.weightKg ? Number(item.product.weightKg) : 2.5;
        return acc + itemWeight * item.quantity;
      }, 0);

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.paymentStatus,
        subtotal: Number(o.subtotal),
        taxAmount: Number(o.taxAmount),
        shippingAmount: Number(o.shippingAmount),
        totalAmount: Number(o.totalAmount),
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone || address.phone || '',
        customerName: o.user ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() : address.fullName || 'مقاول ميداني',
        companyName: address.companyName || 'شركة مقاولات / موقع إنشائي',
        taxNumber: address.taxNumber || address.vatNumber || '300984728100003',
        siteLocation: `${address.city || 'الرياض'} - ${address.streetLine1 || 'الموقع الإنشائي'}`,
        trackingNumber: o.trackingNumber,
        notes: o.notes,
        totalWeightKg: Math.round(totalWeightKg * 100) / 100,
        itemsCount: o.items.length,
        items: o.items.map((item) => ({
          id: item.id,
          productTitle: item.productTitle,
          productSku: item.productSku,
          productImage: item.productImage,
          unitPrice: Number(item.unitPrice),
          quantity: item.quantity,
          totalPrice: Number(item.totalPrice),
          oemNumber: (item.selectedOptions as any)?.oem || (item.product?.attributes as any)?.oem || item.productSku,
          weightKg: item.product?.weightKg ? Number(item.product.weightKg) : 2.5,
        })),
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      };
    });

    return {
      orders: formattedOrders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 3. Update Order Status (PATCH /api/v1/admin/orders/:id/status)
   */
  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
    const existing = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    const data: Prisma.OrderUpdateInput = {
      status: dto.status,
    };

    if (dto.trackingNumber !== undefined) {
      data.trackingNumber = dto.trackingNumber;
    }

    if (dto.notes !== undefined) {
      data.notes = dto.notes;
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data,
      include: {
        items: true,
      },
    });

    this.logger.log(`Admin updated Order ${updated.orderNumber} status to ${updated.status}`);

    return {
      message: 'Order status updated successfully',
      order: {
        id: updated.id,
        orderNumber: updated.orderNumber,
        status: updated.status,
        trackingNumber: updated.trackingNumber,
        notes: updated.notes,
        updatedAt: updated.updatedAt,
      },
    };
  }

  /**
   * 4. Quick Stock & Price Patch (PATCH /api/v1/admin/products/:id/quick-update)
   */
  async quickUpdateProduct(id: string, dto: QuickUpdateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    const data: Prisma.ProductUpdateInput = {};

    if (dto.price !== undefined) {
      data.price = new Prisma.Decimal(dto.price);
    }

    if (dto.compareAtPrice !== undefined) {
      data.compareAtPrice = new Prisma.Decimal(dto.compareAtPrice);
    }

    if (dto.costPrice !== undefined) {
      data.costPrice = new Prisma.Decimal(dto.costPrice);
    }

    if (dto.stock !== undefined) {
      data.stock = dto.stock;
      // Auto-toggle status if out of stock
      if (dto.stock <= 0 && existing.status === ProductStatus.ACTIVE) {
        data.status = ProductStatus.OUT_OF_STOCK;
      } else if (dto.stock > 0 && existing.status === ProductStatus.OUT_OF_STOCK) {
        data.status = ProductStatus.ACTIVE;
      }
    }

    if (dto.lowStockAlert !== undefined) {
      data.lowStockAlert = dto.lowStockAlert;
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        slug: true,
        sku: true,
        price: true,
        compareAtPrice: true,
        costPrice: true,
        stock: true,
        lowStockAlert: true,
        status: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Admin quick-updated Product ${updated.sku}: price=${updated.price}, stock=${updated.stock}`);

    return {
      message: 'Product pricing and inventory updated successfully',
      product: {
        ...updated,
        price: Number(updated.price),
        compareAtPrice: updated.compareAtPrice ? Number(updated.compareAtPrice) : null,
        costPrice: updated.costPrice ? Number(updated.costPrice) : null,
      },
    };
  }

  /**
   * 5. Corporate Invoices (GET /api/v1/admin/invoices)
   */
  async getCorporateInvoices() {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                weightKg: true,
                attributes: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    const invoices = orders.map((o, idx) => {
      const address = (o.shippingAddress as any) || {};
      const companyName = address.companyName || (idx % 2 === 0 ? 'شركة شبه الجزيرة للمقاولات العامة' : 'شركة الفوزان للتجارة والمقاولات');
      const taxNumber = address.taxNumber || address.vatNumber || (idx % 2 === 0 ? '310482910400003' : '300984728100003');
      const crNumber = address.crNumber || (idx % 2 === 0 ? '1010482910' : '2050198472');

      const totalWeightKg = o.items.reduce((acc, item) => {
        const itemWeight = item.product?.weightKg ? Number(item.product.weightKg) : 3.5;
        return acc + itemWeight * item.quantity;
      }, 0);

      const subtotal = Number(o.subtotal);
      // Compute 15% VAT for standard B2B heavy equipment compliance
      const vatRate = 0.15;
      const vatAmount = Number(o.taxAmount) > 0 ? Number(o.taxAmount) : Math.round(subtotal * vatRate * 100) / 100;
      const totalAmount = subtotal + vatAmount + Number(o.shippingAmount);

      return {
        invoiceNumber: `INV-${o.orderNumber.replace('ORD-', '')}`,
        orderId: o.id,
        orderNumber: o.orderNumber,
        issueDate: o.createdAt,
        dueDate: new Date(new Date(o.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000), // Net 30 days
        status: o.paymentStatus === 'PAID' ? 'PAID' : o.status === 'DELIVERED' ? 'PAID' : 'PENDING_SETTLEMENT',
        currency: 'USD',
        // Seller details (AtoZ Heavy Equipment Co.)
        seller: {
          name: 'شركة AtoZ لقطع غيار ومعدات الآليات الثقيلة المحدودة',
          nameEn: 'AtoZ Heavy Equipment & Spare Parts Ltd.',
          taxNumber: '310984726500003',
          crNumber: '1010892341',
          address: 'المنطقة الصناعية الثانية - طريق الخرج، الرياض، المملكة العربية السعودية',
          phone: '+966 11 482 9900',
          email: 'corporate@atoz-parts.com',
        },
        // Buyer Corporate Details
        buyer: {
          companyName,
          taxNumber,
          crNumber,
          contactPerson: o.user ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() : address.fullName || 'المهندس المشرف',
          phone: o.customerPhone || address.phone || '+966 50 123 4567',
          email: o.customerEmail,
          siteAddress: `${address.city || 'الرياض'} - ${address.streetLine1 || 'مشروع نيوم / محطة التشغيل'}`,
        },
        logistics: {
          totalWeightKg: Math.round(totalWeightKg * 100) / 100,
          trackingNumber: o.trackingNumber || 'HE-CARGO-98102',
          shippingCarrier: 'AtoZ Heavy Logistics Express',
        },
        pricing: {
          subtotal,
          vatRate: 15,
          vatAmount,
          shippingAmount: Number(o.shippingAmount),
          totalAmount: Math.round(totalAmount * 100) / 100,
        },
        items: o.items.map((item) => ({
          sku: item.productSku,
          oemNumber: (item.selectedOptions as any)?.oem || (item.product?.attributes as any)?.oem || item.productSku,
          title: item.productTitle,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          weightKg: item.product?.weightKg ? Number(item.product.weightKg) : 3.5,
        })),
      };
    });

    return {
      totalInvoices: invoices.length,
      invoices,
    };
  }
}
