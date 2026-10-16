import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    example: 2,
    description: 'Updated product quantity (must be >= 1)',
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity!: number;

  @ApiPropertyOptional({
    example: 'guest-session-uuid-12345',
    description: 'Guest session identifier (for unauthenticated web or mobile clients)',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
