import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ProductsService } from './products.service.js';
import { QueryProductsDto } from './dto/query-products.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'List & Search Products (Scale: 20,000+ items)',
    description:
      'High-performance public catalog query. Supports both Offset Pagination (Web pages) ' +
      'and Cursor-based Pagination (Mobile App infinite scrolling). ' +
      'Maximum 50 items returned per request to prevent server strain. ' +
      'Includes category relation and images gallery in a single query (Zero N+1 problem).',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Paginated list of products matching filter criteria',
  })
  async findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get(':idOrSlug')
  @ApiOperation({
    summary: 'Get Product Details by ID or Slug',
    description:
      'Fetches full product details, image gallery, and category metadata using either UUID or SEO-friendly slug. ' +
      'Automatically increments view analytics asynchronously.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Product details found',
  })
  @SwaggerResponse({
    status: 404,
    description: 'Product not found',
  })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.productsService.findByIdOrSlug(idOrSlug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create New Product (Admin/Manager)',
    description:
      'Creates a new catalog product with images, inventory stock level, and category assignment.',
  })
  @SwaggerResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @SwaggerResponse({
    status: 403,
    description: 'Forbidden: Requires ADMIN or MANAGER role',
  })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update Product (Admin/Manager)',
    description: 'Updates product pricing, inventory stock, or metadata.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Archive Product (Admin/Manager)',
    description: 'Soft-archives product from public catalog visibility.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Product successfully archived',
  })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
