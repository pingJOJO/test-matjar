import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

import {
  MOCK_CATEGORIES_TREE,
  MOCK_CATEGORIES_FLAT,
} from '../../database/catalog-data.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get hierarchical category tree (Parent -> Children) with product counts
   */
  async findAllTree(onlyActive = true) {
    if (!this.prisma.isConnected) {
      return MOCK_CATEGORIES_TREE;
    }

    try {
      const whereClause: any = {
        parentId: null, // Top-level root categories
      };

      if (onlyActive) {
        whereClause.isActive = true;
      }

      return await this.prisma.category.findMany({
        where: whereClause,
        include: {
          children: {
            where: onlyActive ? { isActive: true } : undefined,
            include: {
              _count: {
                select: { products: true },
              },
            },
            orderBy: { order: 'asc' },
          },
          _count: {
            select: { products: true },
          },
        },
        orderBy: { order: 'asc' },
      });
    } catch {
      return MOCK_CATEGORIES_TREE;
    }
  }

  /**
   * Get flat list of all categories
   */
  async findAllFlat(onlyActive = true) {
    if (!this.prisma.isConnected) {
      return MOCK_CATEGORIES_FLAT;
    }

    try {
      return await this.prisma.category.findMany({
        where: onlyActive ? { isActive: true } : undefined,
        include: {
          parent: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { products: true },
          },
        },
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
      });
    } catch {
      return MOCK_CATEGORIES_FLAT;
    }
  }

  /**
   * Find a category by UUID or SEO slug
   */
  async findByIdOrSlug(idOrSlug: string) {
    if (!this.prisma.isConnected) {
      const cat = MOCK_CATEGORIES_FLAT.find(
        (c) => c.id === idOrSlug || c.slug === idOrSlug,
      );
      if (!cat) throw new NotFoundException(`Category '${idOrSlug}' not found`);
      return cat;
    }

    try {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          idOrSlug,
        );

      const category = await this.prisma.category.findUnique({
        where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
        include: {
          parent: true,
          children: {
            include: {
              _count: {
                select: { products: true },
              },
            },
            orderBy: { order: 'asc' },
          },
          _count: {
            select: { products: true },
          },
        },
      });

      if (!category) {
        throw new NotFoundException(`Category '${idOrSlug}' not found`);
      }

      return category;
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
      const cat = MOCK_CATEGORIES_FLAT.find(
        (c) => c.id === idOrSlug || c.slug === idOrSlug,
      );
      if (!cat) throw new NotFoundException(`Category '${idOrSlug}' not found`);
      return cat;
    }
  }

  /**
   * Create category with automatic slug generation
   */
  async create(dto: CreateCategoryDto) {
    const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);

    const existingSlug = await this.prisma.category.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      throw new ConflictException(`Category slug '${slug}' already exists`);
    }

    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException(`Parent category with ID '${dto.parentId}' does not exist`);
      }
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        parentId: dto.parentId,
        isActive: dto.isActive ?? true,
        order: dto.order ?? 0,
      },
    });
  }

  /**
   * Update category
   */
  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }

    let slug = category.slug;
    if (dto.slug && dto.slug !== category.slug) {
      slug = this.slugify(dto.slug);
      const existing = await this.prisma.category.findUnique({ where: { slug } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Slug '${slug}' is already taken`);
      }
    } else if (dto.name && !dto.slug && dto.name !== category.name) {
      // Keep existing slug unless explicitly changed
    }

    if (dto.parentId && dto.parentId === id) {
      throw new BadRequestException('A category cannot be its own parent');
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        parentId: dto.parentId,
        isActive: dto.isActive,
        order: dto.order,
      },
    });
  }

  /**
   * Delete category
   */
  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, children: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }

    if (category._count.products > 0) {
      throw new BadRequestException(
        `Cannot delete category containing ${category._count.products} products. Reassign or remove products first, or set isActive: false.`,
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
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
