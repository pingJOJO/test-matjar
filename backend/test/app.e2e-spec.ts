import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { TransformResponseInterceptor } from './../src/common/interceptors/transform-response.interceptor.js';
import { AllExceptionsFilter } from './../src/common/filters/http-exception.filter.js';

describe('AtoZ E2E Tests (App, Auth, Catalog, Cart, & Orders)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(new TransformResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1 (GET) - System Status Envelope', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('operational');
  });

  const testEmail = `test_${Date.now()}@example.com`;
  let accessToken = '';
  let refreshToken = '';
  let sampleProductId = '';
  let initialStock = 0;
  let orderNumber = '';
  let orderId = '';

  it('/api/v1/auth/register (POST) - Register customer & issue JWT pair', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'Customer',
        deviceInfo: 'Vitest e2e Runner',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();
    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
  });

  it('/api/v1/categories (GET) - Hierarchical category tree', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/categories')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('/api/v1/products (GET) - Capped catalog search & pagination', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/products?limit=5')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta.limit).toBe(5);
    sampleProductId = res.body.data[0].id;
    initialStock = res.body.data[0].stock;
  });

  it('/api/v1/cart/items (POST) - Add product to authenticated cart', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        productId: sampleProductId,
        quantity: 2,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.itemCount).toBe(1);
    expect(res.body.data.totalQuantity).toBe(2);
    expect(res.body.data.items[0].productId).toBe(sampleProductId);
  });

  it('/api/v1/cart (GET) - Check cart calculation and stock check', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.subtotal).toBeGreaterThan(0);
    expect(res.body.data.hasOutOfStockItems).toBe(false);
  });

  it('/api/v1/orders/checkout (POST) - Atomic checkout with stock lock', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/orders/checkout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        shippingAddress: {
          fullName: 'Test Customer',
          phone: '+966500000000',
          streetLine1: 'King Fahd Road',
          city: 'Riyadh',
          country: 'SA',
        },
        notes: 'Handle with care',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toBeDefined();
    expect(res.body.data.status).toBe('PENDING');
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.reservations.length).toBe(1);
    orderNumber = res.body.data.orderNumber;
    orderId = res.body.data.id;

    // Verify product stock was decremented atomically!
    const productRes = await request(app.getHttpServer())
      .get(`/api/v1/products/${sampleProductId}`)
      .expect(200);

    expect(productRes.body.data.stock).toBe(initialStock - 2);
    expect(productRes.body.data.reservedStock).toBeGreaterThanOrEqual(2);

    // Verify cart was cleared after successful checkout
    const cartRes = await request(app.getHttpServer())
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(cartRes.body.data.itemCount).toBe(0);
  });

  it('/api/v1/orders/:idOrOrderNumber (GET) - Fetch placed order details', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/orders/${orderNumber}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toBe(orderNumber);
    expect(res.body.data.items.length).toBe(1);
  });

  // ==========================================
  // PHASE 5: PAYMENTS ENGINE TESTS
  // ==========================================

  const testIdempotencyKey = `idem-test-${Date.now()}`;
  let stripeClientSecret = '';

  it('/api/v1/payments/create-intent (POST) - Rejects without Idempotency Key', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/payments/create-intent')
      .send({
        orderId,
        provider: 'STRIPE',
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Idempotency Key is required');
  });

  it('/api/v1/payments/create-intent (POST) - Create Stripe Payment Intent with Idempotency Key', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/payments/create-intent')
      .set('idempotency-key', testIdempotencyKey)
      .send({
        orderId,
        provider: 'STRIPE',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.orderId).toBe(orderId);
    expect(res.body.data.provider).toBe('STRIPE');
    expect(res.body.data.clientSecret).toBeDefined();
    expect(res.body.data.idempotencyKey).toBe(testIdempotencyKey);
    stripeClientSecret = res.body.data.clientSecret;
  });

  it('/api/v1/payments/create-intent (POST) - Idempotent replay returns cached secret without duplicate charge', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/payments/create-intent')
      .set('idempotency-key', testIdempotencyKey)
      .send({
        orderId,
        provider: 'STRIPE',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.clientSecret).toBe(stripeClientSecret);
    expect(res.body.data.idempotencyKey).toBe(testIdempotencyKey);
  });

  it('/api/v1/payments/create-intent (POST) - Create PayPal session with approveUrl', async () => {
    const paypalIdemKey = `paypal-idem-${Date.now()}`;
    const res = await request(app.getHttpServer())
      .post('/api/v1/payments/create-intent')
      .set('idempotency-key', paypalIdemKey)
      .send({
        orderId,
        provider: 'PAYPAL',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.provider).toBe('PAYPAL');
    expect(res.body.data.approveUrl).toBeDefined();
    expect(res.body.data.paypalOrderId).toBeDefined();
  });

  it('/api/v1/payments/status/:orderId (GET) - Check initial payment status', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/payments/status/${orderId}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toBe(orderNumber);
    expect(res.body.data.paymentStatus).toBe('UNPAID');
  });

  it('/api/v1/payments/confirm (POST) - Confirm payment, commit inventory & mark PAID', async () => {
    const confirmIdemKey = `confirm-idem-${Date.now()}`;
    const res = await request(app.getHttpServer())
      .post('/api/v1/payments/confirm')
      .send({
        orderId,
        provider: 'STRIPE',
        transactionId: 'pi_test_settled_123',
        idempotencyKey: confirmIdemKey,
        paymentMethod: 'visa',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.paymentStatus).toBe('PAID');
    expect(res.body.data.orderStatus).toBe('PROCESSING');

    // Check payment status endpoint
    const statusRes = await request(app.getHttpServer())
      .get(`/api/v1/payments/status/${orderId}`)
      .expect(200);

    expect(statusRes.body.data.paymentStatus).toBe('PAID');
    expect(statusRes.body.data.orderStatus).toBe('PROCESSING');

    // Verify salesCount was incremented and reservedStock decremented
    const productRes = await request(app.getHttpServer())
      .get(`/api/v1/products/${sampleProductId}`)
      .expect(200);

    expect(productRes.body.data.salesCount).toBeGreaterThanOrEqual(2);
  });

  it('/api/v1/payments/webhook/stripe (POST) - Payment failure rolls back reserved inventory', async () => {
    // 1. Put 1 item into cart and checkout a 2nd order
    await request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ productId: sampleProductId, quantity: 1 })
      .expect(201);

    const order2Res = await request(app.getHttpServer())
      .post('/api/v1/orders/checkout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        shippingAddress: {
          fullName: 'Rollback Tester',
          phone: '+966511111111',
          streetLine1: 'Olaya St',
          city: 'Riyadh',
          country: 'SA',
        },
      })
      .expect(201);

    const order2Id = order2Res.body.data.id;

    // Check stock before failure
    const beforeFailRes = await request(app.getHttpServer())
      .get(`/api/v1/products/${sampleProductId}`)
      .expect(200);
    const stockBeforeFail = beforeFailRes.body.data.stock;
    const reservedBeforeFail = beforeFailRes.body.data.reservedStock;

    // 2. Trigger Stripe payment failure webhook
    const failEvent = {
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: `pi_failed_${Date.now()}`,
          metadata: { orderId: order2Id },
          last_payment_error: { message: 'Card declined - Insufficient Funds' },
        },
      },
    };

    const webhookRes = await request(app.getHttpServer())
      .post('/api/v1/payments/webhook/stripe')
      .send(failEvent)
      .expect(200);

    expect(webhookRes.body.success).toBe(true);

    // 3. Verify order status is FAILED
    const statusRes = await request(app.getHttpServer())
      .get(`/api/v1/payments/status/${order2Id}`)
      .expect(200);

    expect(statusRes.body.data.paymentStatus).toBe('FAILED');

    // 4. Verify inventory was rolled back (stock restored, reservedStock decreased)
    const afterFailRes = await request(app.getHttpServer())
      .get(`/api/v1/products/${sampleProductId}`)
      .expect(200);

    expect(afterFailRes.body.data.stock).toBe(stockBeforeFail + 1);
    expect(afterFailRes.body.data.reservedStock).toBe(reservedBeforeFail - 1);
  });
});
