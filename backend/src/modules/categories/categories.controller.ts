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
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get Category Tree / List',
    description:
      'Public endpoint returning the hierarchical category taxonomy (parent/child) with product counts.',
  })
  @ApiQuery({
    name: 'flat',
    required: false,
    type: Boolean,
    description: 'If true, returns a flat array instead of a nested tree',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive categories (Admin preview)',
  })
  @SwaggerResponse({
    status: 200,
    description: 'List or tree of categories retrieved successfully',
  })
  async findAll(
    @Query('flat') flat?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const onlyActive = includeInactive !== 'true';
    if (flat === 'true') {
      return this.categoriesService.findAllFlat(onlyActive);
    }
    return this.categoriesService.findAllTree(onlyActive);
  }

  @Get(':idOrSlug')
  @ApiOperation({
    summary: 'Get Category Details by ID or Slug',
    description:
      'Fetches full category metadata and child subcategories using either UUID or friendly SEO slug.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Category details found',
  })
  @SwaggerResponse({
    status: 404,
    description: 'Category not found',
  })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.categoriesService.findByIdOrSlug(idOrSlug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create Category (Admin/Manager)',
    description: 'Creates a new category with optional parent relationship and auto-generated slug.',
  })
  @SwaggerResponse({
    status: 201,
    description: 'Category created successfully',
  })
  @SwaggerResponse({
    status: 403,
    description: 'Forbidden: Insufficient permissions',
  })
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update Category (Admin/Manager)',
    description: 'Updates category attributes, slug, or parent hierarchy.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Category updated successfully',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete Category (Admin/Manager)',
    description: 'Permanently removes an empty category.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Category deleted successfully',
  })
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
