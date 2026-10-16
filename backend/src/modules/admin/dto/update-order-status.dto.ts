import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    description: 'Updated lifecycle status of the order',
    example: OrderStatus.PROCESSING,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({
    description: 'Shipment tracking number (e.g. DHL, FedEx, Aramex tracking ID)',
    example: 'DHL-SA-9823145',
  })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({
    description: 'Internal fulfillment or warehouse notes',
    example: 'تم تجهيز الشحنة من مستودع الدمام المركزي وجاهزة للتحميل',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
