import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service.js';
import { QueryProductsDto, ProductSortBy } from './dto/query-products.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { MOCK_PRODUCTS } from '../../database/catalog-data.js';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * High-Performance Products Listing (Scale: 20,000+ items)
   * Supports both Offset pagination (Web) & Cursor-based pagination (Mobile Infinite Scroll)
   * Eliminates N+1 queries through eager relations and database index alignment
   */
  async findAll(query: QueryProductsDto) {
    if (!this.prisma.isConnected) {
      return this.findAllInMemory(query);
    }

    // 1. Enforce strict pagination ceiling (Max 50 items per query)
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 50);
    const page = Math.max(Number(query.page) || 1, 1);

    // 2. Build indexed Prisma WHERE clause
    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
    };

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured;
    }

    if (query.inStockOnly) {
      where.stock = { gt: 0 };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) {
        where.price.gte = new Prisma.Decimal(query.minPrice);
      }
      if (query.maxPrice !== undefined) {
        where.price.lte = new Prisma.Decimal(query.maxPrice);
      }
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    } else if (query.categorySlug) {
      where.category = {
        slug: query.categorySlug,
      };
    }

    if (query.search && query.search.trim().length > 0) {
      const searchTerm = query.search.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { sku: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { has: searchTerm.toLowerCase() } },
      ];
    }

    // Advanced Industrial Facet Filters: Brand, Equipment Type, Engine Brand
    const andFilters: Prisma.ProductWhereInput[] = [];

    if (query.brand && query.brand.trim().length > 0) {
      const brandList = query.brand.split(',').map((s) => s.trim()).filter(Boolean);
      if (brandList.length > 0) {
        const orList: Prisma.ProductWhereInput[] = [];
        for (const b of brandList) {
          const clean = b.replace(/^for\s+/i, '').trim();
          if (clean.toLowerCase() === 'cat') {
            orList.push(
              { brand: { equals: 'CAT', mode: 'insensitive' } },
              { brand: { contains: 'Caterpillar', mode: 'insensitive' } },
              { title: { contains: 'Caterpillar', mode: 'insensitive' } },
              { title: { contains: ' CAT ', mode: 'insensitive' } },
              { title: { startsWith: 'CAT ', mode: 'insensitive' } },
              { category: { slug: { startsWith: 'cat-' } } },
              { category: { slug: { equals: 'caterpillar-cat' } } },
            );
          } else {
            orList.push(
              { brand: { contains: clean, mode: 'insensitive' } },
              { title: { contains: clean, mode: 'insensitive' } },
              { category: { name: { contains: clean, mode: 'insensitive' } } },
              { category: { slug: { contains: clean.toLowerCase() } } },
            );
          }
        }
        if (orList.length > 0) {
          andFilters.push({ OR: orList });
        }
      }
    }

    if (query.equipmentType && query.equipmentType.trim().length > 0) {
      const equipList = query.equipmentType.split(',').map((s) => s.trim()).filter(Boolean);
      if (equipList.length > 0) {
        const orList: Prisma.ProductWhereInput[] = [];
        for (const eq of equipList) {
          orList.push(
            { equipmentType: { contains: eq, mode: 'insensitive' } },
            { title: { contains: eq, mode: 'insensitive' } },
            { description: { contains: eq, mode: 'insensitive' } },
            { category: { name: { contains: eq, mode: 'insensitive' } } },
            { category: { slug: { contains: eq.toLowerCase() } } },
          );
        }
        if (orList.length > 0) {
          andFilters.push({ OR: orList });
        }
      }
    }

    if (query.engineBrand && query.engineBrand.trim().length > 0) {
      const engineList = query.engineBrand.split(',').map((s) => s.trim()).filter(Boolean);
      if (engineList.length > 0) {
        const orList: Prisma.ProductWhereInput[] = [];
        for (const eng of engineList) {
          const clean = eng.replace(/^for\s+/i, '').trim();
          if (clean.toLowerCase() === 'cat') {
            orList.push(
              { engineBrand: { equals: 'CAT', mode: 'insensitive' } },
              { engineBrand: { contains: 'Caterpillar', mode: 'insensitive' } },
              { title: { contains: 'Caterpillar', mode: 'insensitive' } },
              { title: { contains: ' CAT ', mode: 'insensitive' } },
              { title: { startsWith: 'CAT ', mode: 'insensitive' } },
            );
          } else {
            orList.push(
              { engineBrand: { contains: clean, mode: 'insensitive' } },
              { title: { contains: clean, mode: 'insensitive' } },
              { description: { contains: clean, mode: 'insensitive' } },
            );
          }
        }
        if (orList.length > 0) {
          andFilters.push({ OR: orList });
        }
      }
    }

    if (andFilters.length > 0) {
      where.AND = andFilters;
    }

    // 3. Map Sorting to composite DB indexes
    const orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
    switch (query.productSort) {
      case ProductSortBy.PRICE_ASC:
        orderBy.push({ price: 'asc' });
        break;
      case ProductSortBy.PRICE_DESC:
        orderBy.push({ price: 'desc' });
        break;
      case ProductSortBy.BESTSELLING:
      case ProductSortBy.SALES_COUNT_DESC:
        orderBy.push({ salesCount: 'desc' });
        break;
      case ProductSortBy.NEWEST:
      default:
        orderBy.push({ createdAt: 'desc' });
        break;
    }

    // 4. Execute optimized queries: Cursor-based (Mobile) vs Offset (Web)
    let products: any[];
    let totalItems = 0;

    if (query.cursor) {
      // Cursor-based pagination for Mobile App Infinite Scroll
      products = await this.prisma.product.findMany({
        where,
        take: limit + 1, // Fetch +1 to check for hasNextPage
        cursor: { id: query.cursor },
        skip: 1, // Skip the cursor itself
        orderBy,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      });

      const hasNextPage = products.length > limit;
      if (hasNextPage) {
        products.pop(); // Remove the extra record
      }

      const nextCursor =
        hasNextPage && products.length > 0
          ? products[products.length - 1].id
          : null;

      return {
        data: products,
        meta: {
          limit,
          hasNextPage,
          nextCursor,
        },
      };
    } else {
      // Standard bounded Offset pagination for Web Pages
      const skip = (page - 1) * limit;

      const [count, items] = await Promise.all([
        this.prisma.product.count({ where }),
        this.prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
            },
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        }),
      ]);

      totalItems = count;
      products = items;

      const totalPages = Math.ceil(totalItems / limit) || 1;
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        data: products,
        meta: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      };
    }
  }

  /**
   * Find product by UUID or SEO Slug
   */
  async findByIdOrSlug(idOrSlug: string, incrementView = true) {
    if (!this.prisma.isConnected) {
      return this.findByIdOrSlugInMemory(idOrSlug);
    }

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    let product = await this.prisma.product.findUnique({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        category: {
          include: {
            parent: true,
          },
        },
      },
    });

    // Support direct lookup by OEM SKU / Part Number
    if (!product && !isUuid) {
      product = await this.prisma.product.findUnique({
        where: { sku: idOrSlug },
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          category: {
            include: {
              parent: true,
            },
          },
        },
      });
    }

    if (!product) {
      throw new NotFoundException(`Product with ID, Slug or SKU '${idOrSlug}' not found`);
    }

    if (incrementView) {
      // Non-blocking asynchronous view count increment
      this.prisma.product
        .update({
          where: { id: product.id },
          data: { viewCount: { increment: 1 } },
        })
        .catch((err) =>
          this.logger.warn(`Failed to increment views for ${product.id}: ${err.message}`),
        );
    }

    return product;
  }

  /**
   * Create Product with nested images and unique slug/SKU enforcement
   */
  async create(dto: CreateProductDto) {
    const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.title);

    const existingSlug = await this.prisma.product.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      throw new ConflictException(`Product slug '${slug}' already exists`);
    }

    const existingSku = await this.prisma.product.findUnique({
      where: { sku: dto.sku.trim() },
    });
    if (existingSku) {
      throw new ConflictException(`Product SKU '${dto.sku}' already exists`);
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new BadRequestException(
          `Category ID '${dto.categoryId}' does not exist`,
        );
      }
    }

    const imagesData = dto.images?.map((img, index) => ({
      url: img.url,
      altText: img.altText || dto.title,
      sortOrder: img.sortOrder ?? index,
      isPrimary: img.isPrimary ?? index === 0,
    }));

    return this.prisma.product.create({
      data: {
        title: dto.title,
        slug,
        sku: dto.sku.trim(),
        description: dto.description,
        shortDescription: dto.shortDescription,
        price: new Prisma.Decimal(dto.price),
        compareAtPrice: dto.compareAtPrice
          ? new Prisma.Decimal(dto.compareAtPrice)
          : null,
        costPrice: dto.costPrice ? new Prisma.Decimal(dto.costPrice) : null,
        stock: dto.stock,
        lowStockAlert: dto.lowStockAlert ?? 5,
        categoryId: dto.categoryId,
        status: dto.status ?? ProductStatus.ACTIVE,
        isFeatured: dto.isFeatured ?? false,
        attributes: dto.attributes ?? Prisma.JsonNull,
        tags: dto.tags || [],
        weightKg: dto.weightKg ? new Prisma.Decimal(dto.weightKg) : null,
        images: imagesData && imagesData.length > 0 ? { create: imagesData } : undefined,
      },
      include: {
        images: true,
        category: true,
      },
    });
  }

  /**
   * Update Product
   */
  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    let slug = product.slug;
    if (dto.slug && dto.slug !== product.slug) {
      slug = this.slugify(dto.slug);
      const existing = await this.prisma.product.findUnique({ where: { slug } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Slug '${slug}' is already in use`);
      }
    }

    if (dto.sku && dto.sku !== product.sku) {
      const existingSku = await this.prisma.product.findUnique({
        where: { sku: dto.sku.trim() },
      });
      if (existingSku && existingSku.id !== id) {
        throw new ConflictException(`SKU '${dto.sku}' is already in use`);
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        title: dto.title,
        slug,
        sku: dto.sku?.trim(),
        description: dto.description,
        shortDescription: dto.shortDescription,
        price: dto.price !== undefined ? new Prisma.Decimal(dto.price) : undefined,
        compareAtPrice:
          dto.compareAtPrice !== undefined
            ? new Prisma.Decimal(dto.compareAtPrice)
            : undefined,
        costPrice:
          dto.costPrice !== undefined
            ? new Prisma.Decimal(dto.costPrice)
            : undefined,
        stock: dto.stock,
        lowStockAlert: dto.lowStockAlert,
        categoryId: dto.categoryId,
        status: dto.status,
        isFeatured: dto.isFeatured,
        attributes: dto.attributes ? dto.attributes : undefined,
        tags: dto.tags,
        weightKg:
          dto.weightKg !== undefined
            ? new Prisma.Decimal(dto.weightKg)
            : undefined,
      },
      include: {
        images: true,
        category: true,
      },
    });
  }

  /**
   * Delete or Archive Product
   */
  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    return this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.ARCHIVED },
    });
  }

  private findAllInMemory(query: QueryProductsDto) {
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 50);
    const page = Math.max(Number(query.page) || 1, 1);

    let items = [...MOCK_PRODUCTS];

    if (query.isFeatured !== undefined) {
      items = items.filter((p) => p.isFeatured === query.isFeatured);
    }

    if (query.inStockOnly) {
      items = items.filter((p) => p.stock > 0);
    }

    if (query.minPrice !== undefined) {
      items = items.filter((p) => p.price >= Number(query.minPrice));
    }
    if (query.maxPrice !== undefined) {
      items = items.filter((p) => p.price <= Number(query.maxPrice));
    }

    if (query.categoryId) {
      items = items.filter((p) => p.categoryId === query.categoryId);
    } else if (query.categorySlug) {
      items = items.filter((p) => p.category?.slug === query.categorySlug);
    }

    if (query.search && query.search.trim().length > 0) {
      const q = query.search.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q),
      );
    }

    if (query.brand && query.brand.trim().length > 0) {
      const brandList = query.brand
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      items = items.filter((p) =>
        brandList.some(
          (b) =>
            (p.brand && p.brand.toLowerCase().includes(b)) ||
            p.title.toLowerCase().includes(b) ||
            p.category?.name.toLowerCase().includes(b) ||
            p.category?.slug.toLowerCase().includes(b),
        ),
      );
    }

    if (query.equipmentType && query.equipmentType.trim().length > 0) {
      const equipList = query.equipmentType
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      items = items.filter((p) =>
        equipList.some(
          (eq) =>
            (p.attributes?.equipmentType &&
              String(p.attributes.equipmentType).toLowerCase().includes(eq)) ||
            p.title.toLowerCase().includes(eq) ||
            p.description.toLowerCase().includes(eq),
        ),
      );
    }

    if (query.engineBrand && query.engineBrand.trim().length > 0) {
      const engineList = query.engineBrand
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      items = items.filter((p) =>
        engineList.some(
          (eng) =>
            (p.attributes?.engineBrand &&
              String(p.attributes.engineBrand).toLowerCase().includes(eng)) ||
            p.title.toLowerCase().includes(eng) ||
            p.description.toLowerCase().includes(eng),
        ),
      );
    }

    // Sort order
    switch (query.productSort) {
      case ProductSortBy.PRICE_ASC:
        items.sort((a, b) => a.price - b.price);
        break;
      case ProductSortBy.PRICE_DESC:
        items.sort((a, b) => b.price - a.price);
        break;
      case ProductSortBy.BESTSELLING:
      case ProductSortBy.SALES_COUNT_DESC:
        items.sort((a, b) => b.salesCount - a.salesCount);
        break;
      case ProductSortBy.NEWEST:
      default:
        break;
    }

    const totalItems = items.length;

    if (query.cursor) {
      const cursorIndex = items.findIndex((p) => p.id === query.cursor);
      const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
      const paginated = items.slice(startIndex, startIndex + limit);
      const hasNextPage = startIndex + limit < totalItems;
      const nextCursor =
        hasNextPage && paginated.length > 0
          ? paginated[paginated.length - 1].id
          : null;
      return {
        data: paginated,
        meta: {
          limit,
          hasNextPage,
          nextCursor,
        },
      };
    } else {
      const skip = (page - 1) * limit;
      const paginated = items.slice(skip, skip + limit);
      const totalPages = Math.ceil(totalItems / limit) || 1;
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        data: paginated,
        meta: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      };
    }
  }

  private findByIdOrSlugInMemory(idOrSlug: string) {
    const term = idOrSlug.trim().toLowerCase();
    const product = MOCK_PRODUCTS.find(
      (p) =>
        p.id.toLowerCase() === term ||
        p.slug.toLowerCase() === term ||
        p.sku.toLowerCase() === term,
    );

    if (!product) {
      throw new NotFoundException(
        `Product with ID, Slug or SKU '${idOrSlug}' not found`,
      );
    }

    return {
      ...product,
      category: {
        ...product.category,
        parent: null,
      },
    };
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
