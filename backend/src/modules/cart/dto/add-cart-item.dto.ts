import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({
    example: 'd9b7b91b-689c-4993-979a-b47e25471c61',
    description: 'Product UUID to add to the cart',
  })
  @IsString({ message: 'Product ID must be a string' })
  @IsNotEmpty({ message: 'Product ID is required' })
  productId!: string;

  @ApiProperty({
    example: 1,
    description: 'Quantity of the product to add',
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number = 1;

  @ApiPropertyOptional({
    example: 'guest-session-uuid-12345',
    description: 'Guest session identifier (for unauthenticated web or mobile clients)',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
