import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

export enum ProductSortBy {
  NEWEST = 'newest',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  BESTSELLING = 'bestselling',
  SALES_COUNT_DESC = 'salesCount_desc',
}

export class QueryProductsDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by category UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by category SEO slug (e.g., "smartphones")',
    example: 'smartphones',
  })
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({
    description: 'Minimum price filter',
    example: 50.0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter',
    example: 1000.0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Filter only featured products for homepage/marketing banners',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Show only items currently in stock (stock > 0)',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  inStockOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by one or more brands (comma-separated, e.g. cat,komatsu)',
    example: 'cat,komatsu',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    description: 'Filter by one or more equipment types (comma-separated, e.g. excavator,loader)',
    example: 'excavator,loader',
  })
  @IsOptional()
  @IsString()
  equipmentType?: string;

  @ApiPropertyOptional({
    description: 'Filter by one or more engine brands (comma-separated, e.g. cummins,isuzu)',
    example: 'cummins,isuzu',
  })
  @IsOptional()
  @IsString()
  engineBrand?: string;

  @ApiPropertyOptional({
    description: 'Sorting criteria',
    enum: ProductSortBy,
    default: ProductSortBy.NEWEST,
  })
  @IsOptional()
  @IsEnum(ProductSortBy)
  productSort?: ProductSortBy = ProductSortBy.NEWEST;
}
