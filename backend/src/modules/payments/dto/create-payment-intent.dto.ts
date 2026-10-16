import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentProvider } from '@prisma/client';

export class CreatePaymentIntentDto {
  @ApiProperty({
    example: 'd9b7b91b-689c-4993-979a-b47e25471c61',
    description: 'Order UUID or Order Number (e.g. TEST-A2Z-59) to initiate payment for',
  })
  @IsString({ message: 'Order ID must be a string' })
  @IsNotEmpty({ message: 'Order ID is required' })
  orderId!: string;

  @ApiProperty({
    enum: PaymentProvider,
    example: PaymentProvider.STRIPE,
    description: 'Payment gateway provider: STRIPE (Credit/Debit Visa/Mastercard) or PAYPAL',
  })
  @IsEnum(PaymentProvider, { message: 'Provider must be STRIPE or PAYPAL' })
  provider!: PaymentProvider;

  @ApiPropertyOptional({
    example: 'idem-uuid-987654321',
    description: 'Idempotency key to prevent accidental duplicate payment intents (can also be passed via idempotency-key header)',
  })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
