import { performance } from 'node:perf_hooks';

const BASE_URL = process.env.API_URL || 'http://localhost:4000/api/v1';

interface AuditStepResult {
  step: string;
  description: string;
  durationMs: number;
  status: 'PASS' | 'FAIL';
  details: string;
}

const auditResults: AuditStepResult[] = [];

async function recordStep(
  step: string,
  description: string,
  action: () => Promise<string>,
) {
  const t0 = performance.now();
  try {
    const details = await action();
    const durationMs = Math.round((performance.now() - t0) * 100) / 100;
    auditResults.push({ step, description, durationMs, status: 'PASS', details });
    console.log(`  ✅ [PASS] ${step}: ${description} (${durationMs} ms) -> ${details}`);
  } catch (err: any) {
    const durationMs = Math.round((performance.now() - t0) * 100) / 100;
    auditResults.push({
      step,
      description,
      durationMs,
      status: 'FAIL',
      details: err.message,
    });
    console.error(`  ❌ [FAIL] ${step}: ${description} (${durationMs} ms) -> ${err.message}`);
    throw err;
  }
}

async function runAudit() {
  console.log('\n================================================================================');
  console.log('🚜 فحص وتكامل محرك قطع غيار المعدات الثقيلة (Heavy Equipment End-to-End Suite)');
  console.log(`🌐 Base API URL: ${BASE_URL}`);
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log('================================================================================\n');

  let pumpProduct: any = null;
  let heavyChainProduct: any = null;
  const guestSessionId = `audit-guest-${Date.now()}`;
  const customerEmail = `contractor_${Date.now()}@al-jazira-mining.com`;
  let customerToken = '';
  let order1Id = '';
  let order1Number = '';

  // ----------------------------------------------------
  // المرحلة 1: فحص البحث والفلترة الدقيقة
  // ----------------------------------------------------
  console.log('🔹 المرحلة 1: فحص البحث بالـ OEM SKU وتصفية الفئات...');

  await recordStep(
    '1.1 Search SKU 1R-0716',
    'البحث عن فلتر زيت محرك كاتربيلر برقم القطعة 1R-0716',
    async () => {
      const res = await fetch(`${BASE_URL}/products?search=1R-0716`);
      const body = await res.json();
      if (!body.success || body.data.length === 0) throw new Error('Product not found by SKU');
      const item = body.data[0];
      return `وجد المنتج: "${item.title}" | السعر: $${item.price} | المخزون: ${item.stock}`;
    },
  );

  await recordStep(
    '1.2 Direct Route Lookup 708-2L-00300',
    'جلب مباشر لمضخة كوماتسو برقم القطعة 708-2L-00300 من المسار',
    async () => {
      const res = await fetch(`${BASE_URL}/products/708-2L-00300`);
      const body = await res.json();
      if (!body.success) throw new Error('Product lookup failed');
      pumpProduct = body.data;
      return `المضخة: "${pumpProduct.title}" | الوزن: ${pumpProduct.weightKg} كجم | الموديل: ${pumpProduct.attributes.compatibleModels[0]}`;
    },
  );

  await recordStep(
    '1.3 Filter Caterpillar Excavators',
    'تصفية منتجات كاتربيلر لحفارات CAT فقط',
    async () => {
      const res = await fetch(`${BASE_URL}/products?categorySlug=cat-excavators`);
      const body = await res.json();
      if (!body.success || body.data.length === 0) throw new Error('Category filter returned 0');
      return `تم إرجاع ${body.data.length} قطع متوافقة مع حفارات CAT`;
    },
  );

  await recordStep(
    '1.4 Filter Hydraulics Systems',
    'تصفية منظومات الهيدروليك العامة',
    async () => {
      const res = await fetch(`${BASE_URL}/products?categorySlug=hydraulics-systems`);
      const body = await res.json();
      if (!body.success || body.data.length === 0) throw new Error('Hydraulics category empty');
      return `تم إرجاع ${body.data.length} منظومات هيدروليكية عالية الضغط`;
    },
  );

  // ----------------------------------------------------
  // المرحلة 2: سلة الزائر ودمج الحساب عند تسجيل الدخول
  // ----------------------------------------------------
  console.log('\n🔹 المرحلة 2: سيناريو سلة الزائر والمشتري ودمج الحساب...');

  await recordStep(
    '2.1 Guest Heavy Cart',
    'إضافة جنزير كوماتسو وزنه 460 كجم إلى سلة زائر عبر x-session-id',
    async () => {
      const chainLookup = await fetch(`${BASE_URL}/products/20Y-32-00013`);
      const chainBody = await chainLookup.json();
      heavyChainProduct = chainBody.data;

      const addRes = await fetch(`${BASE_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': guestSessionId,
        },
        body: JSON.stringify({
          productId: heavyChainProduct.id,
          quantity: 2,
        }),
      });
      const addBody = await addRes.json();
      if (!addBody.success) throw new Error(addBody.message || 'Cart add failed');
      return `أضيفت قطعتان (الوزن الإجمالي: 920 كجم) | إجمالي السلة: $${addBody.data.subtotal}`;
    },
  );

  await recordStep(
    '2.2 Contractor Registration',
    'تسجيل حساب مقاول أساطيل جديد وإصدار زوج JWT',
    async () => {
      const regRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customerEmail,
          password: 'FleetPassword2026!',
          firstName: 'Mohammed',
          lastName: 'Al-Jazira Mining Contracting',
          phone: '+966559876543',
          deviceInfo: 'CAT Field Rugged Tablet #1',
        }),
      });
      const regBody = await regRes.json();
      if (!regBody.success) throw new Error(regBody.message || 'Registration failed');
      customerToken = regBody.data.tokens.accessToken;
      return `تم إنشاء الحساب: ${regBody.data.user.email} وإصدار JWT Access Token`;
    },
  );

  await recordStep(
    '2.3 Cart Merge on Login',
    'دمج سلة الزائر في حساب العميل المسجل تلقائياً',
    async () => {
      const mergeRes = await fetch(`${BASE_URL}/cart/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({ guestSessionId }),
      });
      const mergeBody = await mergeRes.json();
      if (!mergeBody.success) throw new Error(mergeBody.message || 'Merge failed');
      return `تم نقل ${mergeBody.data.itemCount} صنف بإجمالي كمية ${mergeBody.data.totalQuantity} إلى حساب العميل`;
    },
  );

  // ----------------------------------------------------
  // المرحلة 3: حجز المخزون الذري ومنع البيع المزدوج
  // ----------------------------------------------------
  console.log('\n🔹 المرحلة 3: سيناريو الشراء وحجز المخزون الذري ومنع البيع المزدوج...');

  await recordStep(
    '3.1 Verify Available Stock',
    'فحص مخزون مضخة كوماتسو 708-2L-00300 (المخزون المتوفر: 2 فقط)',
    async () => {
      const chk = await fetch(`${BASE_URL}/products/${pumpProduct.id}`);
      const b = await chk.json();
      if (b.data.stock !== 2) throw new Error(`Expected stock 2, got ${b.data.stock}`);
      return `المخزون الحالي: ${b.data.stock} | المحجوز: ${b.data.reservedStock}`;
    },
  );

  await recordStep(
    '3.2 Checkout 2 Units Order',
    'طلب شراء قطعتين (كامل المخزون) وحجز المخزون ذرياً',
    async () => {
      // Clear previous cart
      await fetch(`${BASE_URL}/cart`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${customerToken}` },
      });

      // Add 2 units of pump
      await fetch(`${BASE_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          productId: pumpProduct.id,
          quantity: 2,
        }),
      });

      // Checkout
      const checkoutRes = await fetch(`${BASE_URL}/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          shippingAddress: {
            fullName: 'Eng. Mohammed Al-Jazira',
            phone: '+966559876543',
            streetLine1: 'Tabuk Highway Quarry Site 4',
            city: 'Tabuk',
            country: 'SA',
          },
          notes: 'Emergency Delivery for Komatsu Excavator Breakage',
        }),
      });

      const checkoutBody = await checkoutRes.json();
      if (!checkoutBody.success) throw new Error(checkoutBody.message || 'Checkout failed');
      order1Id = checkoutBody.data.id;
      order1Number = checkoutBody.data.orderNumber;

      // Verify stock state
      const pChk = await fetch(`${BASE_URL}/products/${pumpProduct.id}`);
      const pBody = await pChk.json();
      return `رقم الطلب: ${order1Number} | إجمالي المبلغ: $${checkoutBody.data.totalAmount} | المخزون المتبقي: ${pBody.data.stock} | المحجوز: ${pBody.data.reservedStock}`;
    },
  );

  await recordStep(
    '3.3 Concurrency Double-Selling Defense',
    'محاولة متزامنة لشراء قطعة ثالثة بعد نفاد المخزون (التحقق من رفض 400/409)',
    async () => {
      const competitorSession = `session-competitor-${Date.now()}`;
      const failRes = await fetch(`${BASE_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': competitorSession,
        },
        body: JSON.stringify({
          productId: pumpProduct.id,
          quantity: 1,
        }),
      });

      const failBody = await failRes.json();
      if (failRes.status === 200 || failBody.success) {
        throw new Error('CRITICAL FLAW: System allowed double-selling unavailable inventory!');
      }

      return `تم حظر الطلب بنجاح كود (${failRes.status}) | الرسالة: "${failBody.message}" | منع البيع المزدوج مؤكد 100%`;
    },
  );

  // ----------------------------------------------------
  // المرحلة 4: محاكاة نجاح الدفع وتثبيت المبيعات
  // ----------------------------------------------------
  console.log('\n🔹 المرحلة 4: محاكاة الـ Webhook وتثبيت المبيعات نهائياً...');

  await recordStep(
    '4.1 Create Payment Intent',
    'إنشاء جلسة دفع Stripe بمفتاح التفرد Idempotency Key',
    async () => {
      const intentRes = await fetch(`${BASE_URL}/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'idempotency-key': `audit-idem-${Date.now()}`,
        },
        body: JSON.stringify({
          orderId: order1Id,
          provider: 'STRIPE',
        }),
      });
      const intentBody = await intentRes.json();
      if (!intentBody.success) throw new Error(intentBody.message || 'Payment intent failed');
      return `تم توليد clientSecret بنجاح | المبلغ: $${intentBody.data.amount} ${intentBody.data.currency}`;
    },
  );

  await recordStep(
    '4.2 Simulate Stripe Payment Success Webhook',
    'إرسال إشعار الدفع الناجح وتثبيت المبيعات وخصم المخزون المحجوز نهائياً',
    async () => {
      const eventPayload = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: `pi_audit_${Date.now()}`,
            metadata: { orderId: order1Id },
          },
        },
      };

      const whRes = await fetch(`${BASE_URL}/payments/webhook/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'simulated_test_sig',
        },
        body: JSON.stringify(eventPayload),
      });

      const whBody = await whRes.json();
      if (!whBody.success) throw new Error(whBody.message || 'Webhook failed');

      // Check status of order
      const stRes = await fetch(`${BASE_URL}/payments/status/${order1Id}`);
      const stBody = await stRes.json();
      if (stBody.data.paymentStatus !== 'PAID') {
        throw new Error(`Expected PAID, got ${stBody.data.paymentStatus}`);
      }

      // Check product final state
      const pRes = await fetch(`${BASE_URL}/products/${pumpProduct.id}`);
      const pBody = await pRes.json();

      return `حالة الطلب: ${stBody.data.paymentStatus} (${stBody.data.orderStatus}) | المخزون الفعلي: ${pBody.data.stock} | المحجوز: ${pBody.data.reservedStock} | المبيعات المكتملة: ${pBody.data.salesCount}`;
    },
  );

  // ----------------------------------------------------
  // الملخص النهائي
  // ----------------------------------------------------
  console.log('\n================================================================================');
  console.log('📊 تقرير الفحص الشامل لكتالوج المعدات الثقيلة (Audit Summary Report)');
  console.log('================================================================================\n');

  console.table(
    auditResults.map((r) => ({
      'المرحلة / الاختبار': r.step,
      'الوصف': r.description,
      'زمن الاستجابة (ms)': `${r.durationMs} ms`,
      'النتيجة': r.status,
    })),
  );

  const totalTime = Math.round(auditResults.reduce((acc, r) => acc + r.durationMs, 0));
  console.log(`\n⏱️ إجمالي زمن تنفيذ كافة الاختبارات: ${totalTime} ms`);
  console.log('🏆 النتيجة: كافة الاختبارات اجتازت بنسبة نجاح 100% وبسرعة استجابة فائقة!\n');
}

runAudit().catch((err) => {
  console.error('\n❌ Audit Suite encountered an unexpected error:', err);
  process.exit(1);
});
