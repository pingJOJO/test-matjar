import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentProvider } from '@prisma/client';

export class ConfirmPaymentDto {
  @ApiProperty({
    example: 'd9b7b91b-689c-4993-979a-b47e25471c61',
    description: 'Order UUID or Order Number (e.g. TEST-A2Z-59) to confirm payment completion for',
  })
  @IsString({ message: 'Order ID must be a string' })
  @IsNotEmpty({ message: 'Order ID is required' })
  orderId!: string;

  @ApiProperty({
    enum: PaymentProvider,
    example: PaymentProvider.STRIPE,
    description: 'Payment gateway provider',
  })
  @IsEnum(PaymentProvider)
  provider!: PaymentProvider;

  @ApiProperty({
    example: 'pi_3MtwBwLkdIwHu7ix28a3tqPa',
    description: 'Gateway transaction reference (e.g. Stripe PaymentIntent ID or PayPal Capture ID)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Transaction ID is required' })
  transactionId!: string;

  @ApiProperty({
    example: 'idem-uuid-987654321',
    description: 'Idempotency key associated with this payment charge',
  })
  @IsString()
  @IsNotEmpty({ message: 'Idempotency key is required' })
  idempotencyKey!: string;

  @ApiPropertyOptional({
    example: 'visa',
    description: 'Payment method brand or wallet name',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
