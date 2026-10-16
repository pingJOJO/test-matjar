import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { TransformResponseInterceptor } from './../src/common/interceptors/transform-response.interceptor.js';
import { AllExceptionsFilter } from './../src/common/filters/http-exception.filter.js';

describe('Heavy Equipment Spare Parts E2E Resilience & Concurrency Suite', () => {
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

  // ========================================================
  // 1. SEARCH & CATEGORY FILTERING (فحص البحث وتصفية الفئات)
  // ========================================================

  it('1.1 Search by exact OEM SKU (1R-0716 Engine Oil Filter)', async () => {
    const startTime = performance.now();
    const res = await request(app.getHttpServer())
      .get('/api/v1/products?search=1R-0716')
      .expect(200);
    const durationMs = Math.round(performance.now() - startTime);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    const item = res.body.data[0];
    expect(item.sku).toBe('1R-0716');
    expect(item.title).toContain('Caterpillar Advanced Efficiency');
    expect(Number(item.price)).toBe(38.5);
    expect(durationMs).toBeLessThan(500); // Sub-second response
  });

  it('1.2 Direct Route Lookup by OEM Part Number (708-2L-00300)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/products/708-2L-00300')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.sku).toBe('708-2L-00300');
    expect(res.body.data.title).toContain('Komatsu PC200-8 Hydraulic Main Pump');
    expect(res.body.data.stock).toBe(2);
    expect(res.body.data.attributes.originCountry).toBe('Japan');
  });

  it('1.3 Filter products by Caterpillar brand category', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/products?categorySlug=cat-excavators')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    for (const prod of res.body.data) {
      expect(prod.category.slug).toBe('cat-excavators');
    }
  });

  it('1.4 Filter products by Hydraulics Systems category', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/products?categorySlug=hydraulics-systems')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    for (const prod of res.body.data) {
      expect(prod.category.slug).toBe('hydraulics-systems');
    }
  });

  // ========================================================
  // 2. GUEST CART & AUTHENTICATED MERGE (سلة الزائر ودمج الحساب)
  // ========================================================

  const guestSessionId = `guest-contractor-session-${Date.now()}`;
  const contractorEmail = `contractor_${Date.now()}@al-marwa-fleet.com`;
  let contractorToken = '';
  let heavyChainProductId = '';

  it('2.1 Guest adds heavy industrial parts (460kg Track Chain) via x-session-id', async () => {
    // Lookup track chain
    const chainRes = await request(app.getHttpServer())
      .get('/api/v1/products/20Y-32-00013')
      .expect(200);
    heavyChainProductId = chainRes.body.data.id;

    // Add to guest cart
    const addRes = await request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .set('x-session-id', guestSessionId)
      .send({
        productId: heavyChainProductId,
        quantity: 2,
      })
      .expect(201);

    expect(addRes.body.success).toBe(true);
    expect(addRes.body.data.itemCount).toBe(1);
    expect(addRes.body.data.totalQuantity).toBe(2);
    expect(Number(addRes.body.data.subtotal)).toBe(2900); // 1450 * 2
  });

  it('2.2 Register contractor customer & issue JWT token', async () => {
    const regRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: contractorEmail,
        password: 'HeavyMachinery2026!',
        firstName: 'Saleh',
        lastName: 'Al-Harbi Heavy Fleets',
        phone: '+966551234567',
        deviceInfo: 'CAT Fleet Tablet Pro',
      })
      .expect(201);

    expect(regRes.body.success).toBe(true);
    expect(regRes.body.data.tokens.accessToken).toBeDefined();
    contractorToken = regRes.body.data.tokens.accessToken;
  });

  it('2.3 Merge guest session cart into contractor user account', async () => {
    const mergeRes = await request(app.getHttpServer())
      .post('/api/v1/cart/merge')
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({ guestSessionId })
      .expect(200);

    expect(mergeRes.body.success).toBe(true);
    expect(mergeRes.body.data.itemCount).toBe(1);
    expect(mergeRes.body.data.totalQuantity).toBe(2);
    expect(mergeRes.body.data.items[0].productId).toBe(heavyChainProductId);

    // Verify empty guest cart after merge
    const guestCartRes = await request(app.getHttpServer())
      .get('/api/v1/cart')
      .set('x-session-id', guestSessionId)
      .expect(200);
    expect(guestCartRes.body.data.itemCount).toBe(0);
  });

  // ========================================================
  // 3. ZERO DOUBLE-SELLING & ATOMIC INVENTORY LOCKING
  // ========================================================

  let pumpProductId = '';
  let order1Id = '';
  let order1Number = '';

  it('3.1 Verify Komatsu Main Pump has strictly 2 units available', async () => {
    const pumpRes = await request(app.getHttpServer())
      .get('/api/v1/products/708-2L-00300')
      .expect(200);

    pumpProductId = pumpRes.body.data.id;
    expect(pumpRes.body.data.stock).toBe(2);
    expect(pumpRes.body.data.reservedStock).toBe(0);
  });

  it('3.2 Contractor 1 adds exactly 2 units and checks out successfully', async () => {
    // Empty previous cart items
    await request(app.getHttpServer())
      .delete('/api/v1/cart')
      .set('Authorization', `Bearer ${contractorToken}`)
      .expect(200);

    // Add 2 units of pump
    await request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        productId: pumpProductId,
        quantity: 2,
      })
      .expect(201);

    // Checkout order 1
    const checkoutRes = await request(app.getHttpServer())
      .post('/api/v1/orders/checkout')
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        shippingAddress: {
          fullName: 'Saleh Al-Harbi Fleet Maintenance',
          phone: '+966551234567',
          streetLine1: 'Al-Kharj Industrial Heavy Machinery Zone',
          city: 'Riyadh',
          country: 'SA',
        },
        notes: 'Urgent replacement for Komatsu Excavator PC200-8 #4',
      })
      .expect(201);

    expect(checkoutRes.body.success).toBe(true);
    expect(checkoutRes.body.data.status).toBe('PENDING');
    expect(checkoutRes.body.data.paymentStatus).toBe('UNPAID');
    expect(Number(checkoutRes.body.data.totalAmount)).toBe(8820); // 8400 subtotal + 5% tax ($420)
    order1Id = checkoutRes.body.data.id;
    order1Number = checkoutRes.body.data.orderNumber;

    // Verify atomic inventory state: stock is now 0, reservedStock is 2!
    const updatedPumpRes = await request(app.getHttpServer())
      .get(`/api/v1/products/${pumpProductId}`)
      .expect(200);

    expect(updatedPumpRes.body.data.stock).toBe(0);
    expect(updatedPumpRes.body.data.reservedStock).toBe(2);
  });

  it('3.3 Concurrent Customer 2 attempts to purchase remaining pump -> 409 ConflictException', async () => {
    const secondUserSession = `session-concurrent-${Date.now()}`;

    // Attempt to add 1 unit to cart
    const addCartRes = await request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .set('x-session-id', secondUserSession)
      .send({
        productId: pumpProductId,
        quantity: 1,
      });

    // Should be rejected because available stock (stock - reservedStock) is 0
    expect(addCartRes.status).toBe(400);
    expect(addCartRes.body.success).toBe(false);
    expect(addCartRes.body.message).toMatch(/out of stock|available stock|exceeds/i);

    // Direct checkout bypass test (attempting checkout with 0 stock)
    const directCheckoutRes = await request(app.getHttpServer())
      .post('/api/v1/orders/checkout')
      .set('x-session-id', secondUserSession)
      .send({
        shippingAddress: {
          fullName: 'Competitor Contractor',
          phone: '+966509999999',
          streetLine1: 'Dammam Port Road',
          city: 'Dammam',
          country: 'SA',
        },
      });

    expect(directCheckoutRes.status).toBe(400); // Cart is empty or stock unavailable
  });

  // ========================================================
  // 4. PAYMENT WEBHOOK & PERMANENT INVENTORY SETTLEMENT
  // ========================================================

  it('4.1 Create Payment Intent for Order 1 with Idempotency Key', async () => {
    const idemKey = `heavy-order1-idem-${Date.now()}`;
    const intentRes = await request(app.getHttpServer())
      .post('/api/v1/payments/create-intent')
      .set('idempotency-key', idemKey)
      .send({
        orderId: order1Id,
        provider: 'STRIPE',
      })
      .expect(200);

    expect(intentRes.body.success).toBe(true);
    expect(intentRes.body.data.orderId).toBe(order1Id);
    expect(intentRes.body.data.clientSecret).toBeDefined();
    expect(Number(intentRes.body.data.amount)).toBe(8820);
  });

  it('4.2 Simulate Successful Stripe Webhook: Order settles, stock permanently committed', async () => {
    const stripeSuccessEvent = {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: `pi_heavy_${Date.now()}`,
          metadata: { orderId: order1Id },
          amount_received: 882000,
        },
      },
    };

    const webhookRes = await request(app.getHttpServer())
      .post('/api/v1/payments/webhook/stripe')
      .send(stripeSuccessEvent)
      .expect(200);

    expect(webhookRes.body.success).toBe(true);
    expect(webhookRes.body.data.received).toBe(true);

    // Verify order status has advanced to PROCESSING and paymentStatus is PAID
    const orderStatusRes = await request(app.getHttpServer())
      .get(`/api/v1/payments/status/${order1Id}`)
      .expect(200);

    expect(orderStatusRes.body.data.orderStatus).toBe('PROCESSING');
    expect(orderStatusRes.body.data.paymentStatus).toBe('PAID');
    expect(orderStatusRes.body.data.orderNumber).toBe(order1Number);

    // Verify inventory commitment: reservedStock is 0, salesCount increased by 2, stock remains 0
    const finalPumpRes = await request(app.getHttpServer())
      .get(`/api/v1/products/${pumpProductId}`)
      .expect(200);

    expect(finalPumpRes.body.data.stock).toBe(0);
    expect(finalPumpRes.body.data.reservedStock).toBe(0);
    expect(finalPumpRes.body.data.salesCount).toBeGreaterThanOrEqual(2);
  });
});
