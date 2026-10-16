import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service.js';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';
import { MOCK_PRODUCTS } from '../../database/catalog-data.js';

interface InMemoryCartItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  createdAt: Date;
}

interface InMemoryCart {
  id: string;
  sessionId?: string;
  userId?: string;
  items: Map<string, InMemoryCartItem>;
}

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  private readonly inMemoryCarts = new Map<string, InMemoryCart>();

  constructor(private readonly prisma: PrismaService) {}

  private getOrCreateCartInMemory(userId?: string, sessionId?: string) {
    const key = userId ? `user_${userId}` : sessionId ? `session_${sessionId}` : `session_${randomUUID()}`;
    let cart = this.inMemoryCarts.get(key);
    if (!cart) {
      cart = {
        id: randomUUID(),
        userId,
        sessionId: !userId ? (sessionId || key.replace('session_', '')) : undefined,
        items: new Map(),
      };
      this.inMemoryCarts.set(key, cart);
    }
    return cart;
  }

  /**
   * Find or initialize a cart for either an authenticated user or a guest session
   */
  async getOrCreateCart(userId?: string, sessionId?: string) {
    if (!this.prisma.isConnected) {
      return this.getOrCreateCartInMemory(userId, sessionId);
    }

    try {
      if (userId) {
        let cart = await this.prisma.cart.findUnique({
          where: { userId },
        });

        if (!cart) {
          cart = await this.prisma.cart.create({
            data: { userId },
          });
        }
        return cart;
      }

      if (sessionId) {
        let cart = await this.prisma.cart.findUnique({
          where: { sessionId },
        });

        if (!cart) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);
          cart = await this.prisma.cart.create({
            data: { sessionId, expiresAt },
          });
        }
        return cart;
      }

      // Generate brand new guest session cart
      const newSessionId = randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      return await this.prisma.cart.create({
        data: {
          sessionId: newSessionId,
          expiresAt,
        },
      });
    } catch (e) {
      this.logger.warn(`Database getOrCreateCart failed, using memory: ${(e as Error).message}`);
      return this.getOrCreateCartInMemory(userId, sessionId);
    }
  }

  /**
   * Helper: Get rich cart contents from in-memory fallback store
   */
  private getCartDetailsInMemory(userId?: string, sessionId?: string) {
    const key = userId ? `user_${userId}` : sessionId ? `session_${sessionId}` : null;
    const cart = key ? this.inMemoryCarts.get(key) : null;
    if (!cart || cart.items.size === 0) {
      return {
        id: cart?.id || null,
        sessionId: sessionId || null,
        items: [],
        itemCount: 0,
        totalQuantity: 0,
        subtotal: 0,
        hasOutOfStockItems: false,
      };
    }

    let totalQuantity = 0;
    let subtotal = 0;
    let hasOutOfStockItems = false;
    const formattedItems: any[] = [];

    for (const item of cart.items.values()) {
      const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);
      if (!product) continue;

      const currentPrice = Number(product.price);
      const isAvailable = product.stock >= item.quantity;
      if (!isAvailable) {
        hasOutOfStockItems = true;
      }

      const itemTotal = currentPrice * item.quantity;
      totalQuantity += item.quantity;
      subtotal += itemTotal;

      formattedItems.push({
        id: item.id,
        productId: item.productId,
        product: {
          id: product.id,
          title: product.title,
          slug: product.slug,
          sku: product.sku,
          price: currentPrice,
          stock: product.stock,
          status: product.status,
          primaryImage: product.images[0]?.url || null,
          category: product.category,
        },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        currentPrice,
        priceChanged: item.unitPrice !== currentPrice,
        totalPrice: itemTotal,
        isAvailable,
      });
    }

    return {
      id: cart.id,
      sessionId: cart.sessionId,
      userId: cart.userId,
      items: formattedItems,
      itemCount: formattedItems.length,
      totalQuantity,
      subtotal: Math.round(subtotal * 100) / 100,
      hasOutOfStockItems,
    };
  }

  /**
   * Get rich cart contents with real-time stock checks, totals, and pricing comparisons
   */
  async getCartDetails(userId?: string, sessionId?: string) {
    if (!this.prisma.isConnected) {
      return this.getCartDetailsInMemory(userId, sessionId);
    }

    try {
      const cart = await this.findCart(userId, sessionId);

      if (!cart) {
        return {
          id: null,
          sessionId: sessionId || null,
          items: [],
          itemCount: 0,
          totalQuantity: 0,
          subtotal: 0,
          hasOutOfStockItems: false,
        };
      }

      const items = await this.prisma.cartItem.findMany({
        where: { cartId: cart.id },
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: 'asc' },
              },
              category: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      let totalQuantity = 0;
      let subtotal = 0;
      let hasOutOfStockItems = false;

      const formattedItems = items
        .filter((item) => item.product != null)
        .map((item) => {
          const currentPrice = Number(item.product.price);
          const isAvailable =
            item.product.status === ProductStatus.ACTIVE &&
            item.product.stock >= item.quantity;

          if (!isAvailable) {
            hasOutOfStockItems = true;
          }

          const itemTotal = currentPrice * item.quantity;
          totalQuantity += item.quantity;
          subtotal += itemTotal;

          return {
            id: item.id,
            productId: item.productId,
            product: {
              id: item.product.id,
              title: item.product.title,
              slug: item.product.slug,
              sku: item.product.sku,
              price: currentPrice,
              stock: item.product.stock,
              status: item.product.status,
              primaryImage: item.product.images[0]?.url || null,
              category: item.product.category,
            },
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            currentPrice,
            priceChanged: Number(item.unitPrice) !== currentPrice,
            totalPrice: itemTotal,
            isAvailable,
          };
        });

      return {
        id: cart.id,
        sessionId: cart.sessionId,
        userId: cart.userId,
        items: formattedItems,
        itemCount: formattedItems.length,
        totalQuantity,
        subtotal: Math.round(subtotal * 100) / 100,
        hasOutOfStockItems,
      };
    } catch (error) {
      this.logger.warn(
        `Database cart retrieval failed, falling back to memory: ${(error as Error).message}`,
      );
      return this.getCartDetailsInMemory(userId, sessionId);
    }
  }

  /**
   * Add a product to the cart with inventory pre-validation
   */
  private addItemInMemory(dto: AddCartItemDto, userId?: string, sessionId?: string) {
    const product = MOCK_PRODUCTS.find((p) => p.id === dto.productId);
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException('Product not found or unavailable');
    }
    if (product.stock <= 0) {
      throw new BadRequestException('This product is currently out of stock');
    }

    const cart = this.getOrCreateCartInMemory(userId, sessionId || dto.sessionId);
    const key = userId ? `user_${userId}` : `session_${cart.sessionId}`;
    const inMemCart = this.inMemoryCarts.get(key) || cart;
    const existing = inMemCart.items.get(dto.productId);
    const targetQuantity = existing ? existing.quantity + dto.quantity : dto.quantity;

    if (targetQuantity > product.stock) {
      throw new BadRequestException(
        `Cannot add ${dto.quantity} items. Only ${product.stock} units currently available.`,
      );
    }

    if (existing) {
      existing.quantity = targetQuantity;
      existing.unitPrice = Number(product.price);
    } else {
      inMemCart.items.set(dto.productId, {
        id: randomUUID(),
        productId: dto.productId,
        quantity: dto.quantity,
        unitPrice: Number(product.price),
        createdAt: new Date(),
      });
    }

    return this.getCartDetails(userId, cart.sessionId || undefined);
  }

  /**
   * Add a product to the cart with inventory pre-validation
   */
  async addItem(dto: AddCartItemDto, userId?: string, sessionId?: string) {
    if (!this.prisma.isConnected) {
      return this.addItemInMemory(dto, userId, sessionId);
    }

    try {
      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
      });

      if (!product || product.status !== ProductStatus.ACTIVE) {
        throw new NotFoundException('Product not found or unavailable');
      }

      if (product.stock <= 0) {
        throw new BadRequestException('This product is currently out of stock');
      }

      const cart = await this.getOrCreateCart(userId, sessionId || dto.sessionId);

      // Check if product already exists in this cart
      const existingItem = await this.prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: dto.productId,
          },
        },
      });

      const targetQuantity = existingItem
        ? existingItem.quantity + dto.quantity
        : dto.quantity;

      if (targetQuantity > product.stock) {
        throw new BadRequestException(
          `Cannot add ${dto.quantity} items. Only ${product.stock} units currently available.`,
        );
      }

      if (existingItem) {
        await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: targetQuantity,
            unitPrice: product.price,
          },
        });
      } else {
        await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: dto.productId,
            quantity: dto.quantity,
            unitPrice: product.price,
          },
        });
      }

      return this.getCartDetails(userId, cart.sessionId || undefined);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.warn(`addItem database query failed, falling back to memory: ${(error as Error).message}`);
      return this.addItemInMemory(dto, userId, sessionId);
    }
  }

  /**
   * Update item quantity in cart
   */
  async updateItemQuantity(
    productId: string,
    quantity: number,
    userId?: string,
    sessionId?: string,
  ) {
    if (!this.prisma.isConnected) {
      const key = userId ? `user_${userId}` : sessionId ? `session_${sessionId}` : null;
      const cart = key ? this.inMemoryCarts.get(key) : null;
      if (!cart) {
        throw new NotFoundException('Shopping cart not found');
      }

      const item = cart.items.get(productId);
      if (!item) {
        throw new NotFoundException('Item not found in shopping cart');
      }

      const product = MOCK_PRODUCTS.find((p) => p.id === productId);
      if (product && quantity > product.stock) {
        throw new BadRequestException(
          `Requested quantity (${quantity}) exceeds available stock (${product.stock})`,
        );
      }

      item.quantity = quantity;
      return this.getCartDetails(userId, cart.sessionId || undefined);
    }

    const cart = await this.findCart(userId, sessionId);
    if (!cart) {
      throw new NotFoundException('Shopping cart not found');
    }

    const item = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      include: { product: true },
    });

    if (!item) {
      throw new NotFoundException('Item not found in shopping cart');
    }

    if (quantity > item.product.stock) {
      throw new BadRequestException(
        `Requested quantity (${quantity}) exceeds available stock (${item.product.stock})`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: {
        quantity,
        unitPrice: item.product.price,
      },
    });

    return this.getCartDetails(userId, cart.sessionId || undefined);
  }

  /**
   * Remove specific product from cart
   */
  async removeItem(productId: string, userId?: string, sessionId?: string) {
    if (!this.prisma.isConnected) {
      const key = userId ? `user_${userId}` : sessionId ? `session_${sessionId}` : null;
      const cart = key ? this.inMemoryCarts.get(key) : null;
      if (!cart) {
        throw new NotFoundException('Shopping cart not found');
      }

      cart.items.delete(productId);
      return this.getCartDetails(userId, cart.sessionId || undefined);
    }

    const cart = await this.findCart(userId, sessionId);
    if (!cart) {
      throw new NotFoundException('Shopping cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    return this.getCartDetails(userId, cart.sessionId || undefined);
  }

  /**
   * Empty entire cart
   */
  async clearCart(userId?: string, sessionId?: string) {
    if (!this.prisma.isConnected) {
      const key = userId ? `user_${userId}` : sessionId ? `session_${sessionId}` : null;
      const cart = key ? this.inMemoryCarts.get(key) : null;
      if (cart) {
        cart.items.clear();
      }
      return {
        success: true,
        message: 'Shopping cart cleared successfully',
      };
    }

    const cart = await this.findCart(userId, sessionId);
    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return {
      success: true,
      message: 'Shopping cart cleared successfully',
    };
  }

  /**
   * Merge guest session cart into logged-in user cart upon authentication
   */
  async mergeCart(guestSessionId: string, userId: string) {
    if (!guestSessionId || !userId) {
      return this.getCartDetails(userId);
    }

    try {
      // 1. Merge in-memory guest cart if present
      const inMemKey = `session_${guestSessionId}`;
      const inMemCart = this.inMemoryCarts.get(inMemKey);
      if (inMemCart && inMemCart.items.size > 0) {
        const userMemCart = this.getOrCreateCartInMemory(userId);
        for (const [prodId, inMemItem] of inMemCart.items.entries()) {
          const existing = userMemCart.items.get(prodId);
          if (existing) {
            existing.quantity += inMemItem.quantity;
          } else {
            userMemCart.items.set(prodId, { ...inMemItem });
          }
        }
        this.inMemoryCarts.delete(inMemKey);
      }

      if (!this.prisma.isConnected) {
        return this.getCartDetails(userId);
      }

      const guestCart = await this.prisma.cart.findUnique({
        where: { sessionId: guestSessionId },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      if (!guestCart || guestCart.items.length === 0) {
        return this.getCartDetails(userId);
      }

      const userCart = await this.getOrCreateCart(userId);

      // Merge each item from guest cart into user cart
      for (const guestItem of guestCart.items) {
        const productStock = guestItem.product?.stock ?? 99;
        const productPrice = guestItem.product ? Number(guestItem.product.price) : Number(guestItem.unitPrice);

        const existingUserItem = await this.prisma.cartItem.findUnique({
          where: {
            cartId_productId: {
              cartId: userCart.id,
              productId: guestItem.productId,
            },
          },
        });

        if (existingUserItem) {
          const combinedQuantity = Math.min(
            existingUserItem.quantity + guestItem.quantity,
            productStock,
          );
          await this.prisma.cartItem.update({
            where: { id: existingUserItem.id },
            data: {
              quantity: combinedQuantity,
              unitPrice: productPrice,
            },
          });
        } else {
          const quantity = Math.min(guestItem.quantity, productStock);
          if (quantity > 0) {
            await this.prisma.cartItem.create({
              data: {
                cartId: userCart.id,
                productId: guestItem.productId,
                quantity,
                unitPrice: productPrice,
              },
            });
          }
        }
      }

      // Clean up guest cart safely
      await this.prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } });
      await this.prisma.cart.delete({ where: { id: guestCart.id } }).catch(() => {});

      this.logger.log(`Merged guest cart (${guestSessionId}) into user cart (${userId})`);
      return this.getCartDetails(userId);
    } catch (error) {
      this.logger.warn(`Cart merge non-fatal failure: ${(error as Error).message}`);
      return this.getCartDetails(userId);
    }
  }

  private async findCart(userId?: string, sessionId?: string) {
    try {
      if (!this.prisma.isConnected) return null;
      if (userId) {
        return await this.prisma.cart.findUnique({ where: { userId } });
      }
      if (sessionId) {
        return await this.prisma.cart.findUnique({ where: { sessionId } });
      }
    } catch (e) {
      this.logger.warn(`findCart database error: ${(e as Error).message}`);
      return null;
    }
    return null;
  }
}
