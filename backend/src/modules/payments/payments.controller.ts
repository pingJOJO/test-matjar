import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { PaymentsService } from './payments.service.js';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto.js';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto.js';
import {
  PaymentIntentResponseDto,
  PaymentStatusResponseDto,
} from './dto/payment-response.dto.js';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('prepare-live-1usd')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Prepare real 1.00 USD Stripe Live test order',
    description: 'Initializes or retrieves the official $1.00 USD verification order',
  })
  async prepareLive1Usd() {
    return this.paymentsService.prepareLive1UsdOrder();
  }

  @Post('create-intent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create payment session (Stripe or PayPal) with Idempotency Key',
    description:
      'Creates a gateway payment intent/order for a specific checkout order. ' +
      'Requires an Idempotency Key via header or body to guarantee zero double-charging. ' +
      'Returns clientSecret for Stripe or approveUrl for PayPal.',
  })
  @ApiHeader({
    name: 'idempotency-key',
    required: false,
    description:
      'Idempotency key to safely retry payment session creation without double billing',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Payment session created or returned from idempotent cache',
    type: PaymentIntentResponseDto,
  })
  @SwaggerResponse({
    status: 400,
    description: 'Invalid input, already paid, or missing Idempotency Key',
  })
  @SwaggerResponse({
    status: 404,
    description: 'Order not found',
  })
  async createPaymentIntent(
    @Body() dto: CreatePaymentIntentDto,
    @Headers('idempotency-key') idempotencyKeyHeader?: string,
  ): Promise<PaymentIntentResponseDto> {
    const effectiveKey = idempotencyKeyHeader || dto.idempotencyKey;
    if (!effectiveKey) {
      throw new BadRequestException(
        'Idempotency Key is required. Please provide it via the "idempotency-key" header or "idempotencyKey" body field.',
      );
    }

    return this.paymentsService.createPaymentIntent(dto, effectiveKey);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm client payment completion and settle order inventory',
    description:
      'Called by web or mobile frontend upon receiving successful payment confirmation from Stripe/PayPal SDK. ' +
      'Atomically locks sales, decrements reserved stock, and advances order status to PROCESSING.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Payment successfully settled',
  })
  async confirmPayment(@Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirmPayment(dto);
  }

  @Post('webhook/stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stripe Webhook Listener with Cryptographic Signature Verification',
    description:
      'Receives and cryptographically verifies asynchronous webhook events from Stripe (e.g. payment_intent.succeeded). ' +
      'Processes inventory commitment or rollback automatically.',
  })
  @ApiHeader({
    name: 'stripe-signature',
    required: false,
    description: 'Stripe cryptographic webhook signature',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Webhook acknowledged and processed',
  })
  async stripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request,
  ) {
    const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body || {}));
    return this.paymentsService.processStripeWebhook(signature, rawBody);
  }

  @Post('webhook/paypal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'PayPal Webhook Listener',
    description:
      'Receives PayPal Orders v2 webhook events (e.g. PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.DENIED). ' +
      'Settles or rolls back inventory atomically.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Webhook processed',
  })
  async payPalWebhook(@Body() payload: any) {
    return this.paymentsService.processPayPalWebhook(payload);
  }

  @Get('status/:orderId')
  @ApiOperation({
    summary: 'Get payment status of an order',
    description:
      'Retrieves payment and fulfillment status for an order by Order UUID or human-readable orderNumber.',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order UUID or orderNumber (e.g. ORD-20261010-XXXX)',
    example: 'd9b7b91b-689c-4993-979a-b47e25471c61',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Order payment status',
    type: PaymentStatusResponseDto,
  })
  @SwaggerResponse({
    status: 404,
    description: 'Order not found',
  })
  async getPaymentStatus(
    @Param('orderId') orderId: string,
  ): Promise<PaymentStatusResponseDto> {
    return this.paymentsService.getPaymentStatus(orderId);
  }
}
