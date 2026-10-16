import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Smartphones',
    description: 'Category display name',
  })
  @IsString()
  @IsNotEmpty({ message: 'Category name is required' })
  name!: string;

  @ApiPropertyOptional({
    example: 'smartphones',
    description: 'URL-friendly unique slug. If omitted, will be auto-generated from name.',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    example: 'Latest mobile devices and accessories',
    description: 'Category description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
    description: 'Category thumbnail or banner image URL',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 'e5b7b91b-689c-4993-979a-b47e25471c61',
    description: 'Parent category UUID if this is a subcategory',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Parent ID must be a valid UUID' })
  parentId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Visibility status of the category',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    example: 1,
    description: 'Sort ordering weight for displaying categories',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number = 0;
}
