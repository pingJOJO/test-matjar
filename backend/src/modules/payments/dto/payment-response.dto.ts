import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentProvider, PaymentTransactionStatus } from '@prisma/client';

export class PaymentIntentResponseDto {
  @ApiProperty({ example: 'd9b7b91b-689c-4993-979a-b47e25471c61' })
  orderId!: string;

  @ApiProperty({ enum: PaymentProvider, example: PaymentProvider.STRIPE })
  provider!: PaymentProvider;

  @ApiProperty({ example: 124.99 })
  amount!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty({ example: 'idem-uuid-987654321' })
  idempotencyKey!: string;

  @ApiPropertyOptional({
    example: 'pi_3MtwBwLkdIwHu7ix28a3tqPa_secret_Yr38eJ...',
    description: 'Stripe clientSecret used by Stripe.js / mobile SDKs to confirm card payment',
  })
  clientSecret?: string;

  @ApiPropertyOptional({
    example: 'https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T',
    description: 'PayPal approval URL for customer redirect on web or in-app webview',
  })
  approveUrl?: string;

  @ApiPropertyOptional({
    example: '5O190127TN364715T',
    description: 'PayPal Order ID',
  })
  paypalOrderId?: string;
}

export class PaymentStatusResponseDto {
  @ApiProperty({ example: 'ORD-20261010-84729' })
  orderNumber!: string;

  @ApiProperty({ example: 'PROCESSING' })
  orderStatus!: string;

  @ApiProperty({ example: 'PAID' })
  paymentStatus!: string;

  @ApiProperty({ example: 124.99 })
  totalAmount!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiPropertyOptional({
    enum: PaymentTransactionStatus,
    example: PaymentTransactionStatus.SUCCESS,
    nullable: true,
  })
  latestTransactionStatus?: PaymentTransactionStatus | null;

  @ApiPropertyOptional({ example: 'STRIPE', nullable: true })
  provider?: string | null;

  @ApiPropertyOptional({ example: 'pi_3MtwBwLkdIwHu7ix28a3tqPa', nullable: true })
  transactionId?: string | null;
}
