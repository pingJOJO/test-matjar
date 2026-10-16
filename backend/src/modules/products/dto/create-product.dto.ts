import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class ProductImageDto {
  @ApiProperty({
    example: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab',
    description: 'Direct image URL',
  })
  @IsString()
  @IsNotEmpty()
  url!: string;

  @ApiPropertyOptional({
    example: 'iPhone 15 Pro front view',
    description: 'Image alt text for accessibility and SEO',
  })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Display order (0 = primary/first)',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number = 0;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this image is the main catalog thumbnail',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean = false;
}

export class CreateProductDto {
  @ApiProperty({
    example: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
    description: 'Full product title',
  })
  @IsString()
  @IsNotEmpty({ message: 'Product title is required' })
  title!: string;

  @ApiPropertyOptional({
    example: 'apple-iphone-15-pro-max-256gb-natural-titanium',
    description: 'Unique SEO slug (auto-generated from title if omitted)',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    example: 'APL-IPH15PM-256-NAT',
    description: 'Stock Keeping Unit (SKU) identifier',
  })
  @IsString()
  @IsNotEmpty({ message: 'SKU is required' })
  sku!: string;

  @ApiProperty({
    example: 'Forged in titanium and featuring the groundbreaking A17 Pro chip...',
    description: 'Detailed product description with rich formatting support',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description!: string;

  @ApiPropertyOptional({
    example: 'iPhone 15 Pro Max. Titanium design, A17 Pro chip, 48MP Main camera.',
    description: 'Brief summary for catalog cards and search previews',
  })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({
    example: 1199.99,
    description: 'Retail selling price in USD',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Price must be greater than zero' })
  price!: number;

  @ApiPropertyOptional({
    example: 1299.99,
    description: 'Original or strike-through compare price',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  compareAtPrice?: number;

  @ApiPropertyOptional({
    example: 950.0,
    description: 'Wholesale / cost price for margin calculation (Admin only)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice?: number;

  @ApiProperty({
    example: 45,
    description: 'Available on-hand stock quantity',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Stock cannot be negative' })
  stock!: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Low stock threshold for automated inventory alerts',
    default: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lowStockAlert?: number = 5;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Category UUID',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid category UUID' })
  categoryId?: string;

  @ApiPropertyOptional({
    example: ProductStatus.ACTIVE,
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus = ProductStatus.ACTIVE;

  @ApiPropertyOptional({
    example: true,
    description: 'Featured flag for home screen spotlight',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @ApiPropertyOptional({
    type: [ProductImageDto],
    description: 'List of product images',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @ApiPropertyOptional({
    example: { color: ['Natural Titanium', 'Black'], storage: ['256GB', '512GB'] },
    description: 'Dynamic JSON attributes for product variants/filters',
  })
  @IsOptional()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({
    example: ['apple', 'iphone', 'flagship', 'smartphone'],
    description: 'Search tags',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    example: 0.221,
    description: 'Weight in kilograms for shipping calculation',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  weightKg?: number;
}
