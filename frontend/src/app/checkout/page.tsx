'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Scale,
  ShoppingBag,
  Building2,
  Phone,
  MapPin,
  AlertCircle,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useCartStore } from '@/stores/useCartStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { useCurrencyStore } from '@/stores/useCurrencyStore';
import { api, apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatWeight } from '@/lib/utils';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

const isLiveMode = stripePublishableKey.startsWith('pk_live_');
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#0f172a',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '14px',
      '::placeholder': {
        color: '#94a3b8',
      },
    },
    invalid: {
      color: '#e11d48',
      iconColor: '#e11d48',
    },
  },
  hidePostalCode: true,
};

function CheckoutForm() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { items, subtotal, totalWeightKg, clearCart } = useCartStore();
  const { lang, dir, t } = useLanguageStore();
  const { currentCurrency, formatPrice } = useCurrencyStore();

  const isAr = lang === 'ar';

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    companyName: '',
    streetLine1: '',
    city: 'Riyadh',
    country: 'SA',
    notes: '',
  });

  const [paymentProvider, setPaymentProvider] = useState<'STRIPE' | 'PAYPAL'>('STRIPE');
  const [cardData, setCardData] = useState({
    cardNumber: '4242 4242 4242 4242',
    expDate: '12/28',
    cvc: '123',
    cardholderName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fillTestCard = () => {
    setCardData({
      cardNumber: '4242 4242 4242 4242',
      expDate: '12/28',
      cvc: '123',
      cardholderName: formData.fullName || (isAr ? 'صالح الحربي' : 'Saleh Al-Harbi'),
    });
  };

  const shippingCost = subtotal >= 150 ? 0 : 15;
  const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
  const totalAmount = subtotal + shippingCost + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Create Order via Checkout Endpoint with USD default currency
      const checkoutRes = await api.checkout({
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          streetLine1: `${formData.companyName ? `[${formData.companyName}] ` : ''}${formData.streetLine1}`,
          city: formData.city,
          country: formData.country,
        },
        notes: formData.notes,
        currency: currentCurrency || 'USD',
      });

      if (!checkoutRes.success || !checkoutRes.data) {
        throw new Error(isAr ? 'فشل إنشاء الطلب' : 'Failed to create order');
      }

      const orderData = checkoutRes.data;

      // 2. Create Payment Intent with Idempotency Key
      const paymentRes = await api.createPaymentIntent(orderData.id, paymentProvider);

      let finalTransactionId = paymentRes.data?.transactionId || `pi_client_${Date.now()}`;

      // 3. If Live Stripe Mode, process real CardElement through Stripe.js
      if (paymentProvider === 'STRIPE' && isLiveMode && stripe && elements) {
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error(isAr ? 'حقل إدخال البطاقة غير جاهز' : 'Card element not mounted');
        }

        const clientSecret = paymentRes.data?.clientSecret;
        if (!clientSecret) {
          throw new Error(isAr ? 'لم يتم استلام مفتاح العميل من Stripe' : 'Missing client_secret from Stripe');
        }

        const { paymentIntent, error: stripeErr } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: formData.fullName,
              phone: formData.phone,
            },
          },
        });

        if (stripeErr) {
          throw new Error(stripeErr.message || (isAr ? 'فشلت معالجة البطاقة البنكية' : 'Card payment failed'));
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          finalTransactionId = paymentIntent.id;
        }
      }

      // 4. Confirm payment settlement on backend
      await apiFetch('/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({
          orderId: orderData.id,
          provider: paymentProvider,
          transactionId: finalTransactionId,
          idempotencyKey: paymentRes.data?.idempotencyKey || `web-confirm-${Date.now()}`,
          paymentMethod: paymentProvider === 'STRIPE' ? 'card' : 'paypal_wallet',
        }),
      });

      setOrderSuccess(orderData);
      await clearCart();
    } catch (err: any) {
      console.error(err);
      setError(err.message || (isAr ? 'حدث خطأ أثناء معالجة الطلب والدفع' : 'An error occurred during checkout'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4" dir={dir}>
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-lg space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div>
            <Badge variant="cat" className="text-xs mb-2">
              {isAr ? 'معاملة معتمدة ودفع ناجح' : 'Verified Transaction & Paid'}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isAr ? 'تم استلام طلب قطع الغيار بنجاح!' : 'Order Placed Successfully!'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              {isAr ? 'رقم تتبع الطلب:' : 'Order Tracking Number:'}{' '}
              <strong className="text-slate-900 font-mono text-base">{orderSuccess.orderNumber}</strong>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">{isAr ? 'حالة الطلب:' : 'Order Status:'}</span>
              <span className="font-bold text-blue-600">
                {isAr ? 'قيد التجهيز والشحن (PROCESSING)' : 'Processing Dispatch'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isAr ? 'حالة الدفع:' : 'Payment Status:'}</span>
              <span className="font-bold text-emerald-600">
                {isAr ? 'مدفوع بالكامل (PAID)' : 'Paid in Full (PAID)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isAr ? 'طريقة الدفع:' : 'Payment Provider:'}</span>
              <span className="font-bold text-slate-900 font-mono">{paymentProvider}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-950 text-sm">
              <span>{isAr ? 'المبلغ الإجمالي المسدد:' : 'Total Amount Paid:'}</span>
              <span className="text-amber-600 font-mono">
                {formatPrice(orderSuccess.totalAmount, currentCurrency, lang)}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            {isAr
              ? 'تم تخصيص شاحنة الشحن ونقل البضاعة من المستودع المركزي. سيتصل بك مهندس التنسيق اللوجستي لتأكيد إحداثيات موقع الآلية.'
              : 'Direct freight dispatch has been assigned. Logistics dispatch will coordinate GPS coordinates and delivery timing.'}
          </p>

          <Button variant="cat" size="lg" className="w-full font-bold cursor-pointer" onClick={() => router.push('/products')}>
            {isAr ? 'العودة إلى كتالوج قطع الغيار' : 'Return to Parts Catalog'}
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4 text-center" dir={dir}>
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {isAr ? 'سلة الشراء فارغة' : 'Your Shopping Cart is Empty'}
          </h2>
          <p className="text-xs text-slate-500">
            {isAr
              ? 'يرجى إضافة قطع الغيار المطلوبة إلى السلة أولاً لمتابعة الشحن والدفع.'
              : 'Please add required machinery parts to your cart before proceeding to checkout.'}
          </p>

          <div className="pt-2 flex flex-col gap-2">
            <Link href="/checkout/live-1usd">
              <Button variant="cat" className="w-full font-bold cursor-pointer">
                {isAr ? '🚀 تجربة شراء حقيقي فوري بـ $1.00 USD' : '🚀 Try Live $1.00 Test Checkout'}
              </Button>
            </Link>
            <Button variant="outline" className="w-full cursor-pointer" onClick={() => router.push('/products')}>
              {isAr ? 'تصفح كتالوج قطع الغيار' : 'Browse Parts Catalog'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-28 md:pb-16" dir={dir}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Live Mode Notice & 1 USD Quick Link */}
        {isLiveMode && (
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 p-4 text-xs">
            <div className="flex items-center gap-2.5 text-amber-900 font-bold">
              <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                {isAr
                  ? 'بوابة Stripe Live مفعلة للإنتاج الحقيقي. لتقليل التكلفة يمكنك إجراء اختبار الشراء المباشر بقيمة $1.00 USD فقط.'
                  : 'Stripe Live Gateway active. For minimal testing cost, use the dedicated $1.00 USD verification page.'}
              </span>
            </div>
            <Link href="/checkout/live-1usd">
              <Button size="sm" variant="cat" className="text-xs font-bold shrink-0 cursor-pointer">
                {isAr ? 'فتح صفحة اختبار $1.00 USD' : 'Open $1.00 USD Checkout'}
              </Button>
            </Link>
          </div>
        )}

        <div className="mb-8 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            {isAr ? 'إتمام طلب قطع الغيار وشحن الموقع' : 'Secure Jobsite Checkout & Freight Dispatch'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isAr
              ? 'أدخل بيانات شركة المقاولات وموقع المعدة لتأكيد شاحنة التوريد والفاتورة الضريبية'
              : 'Enter jobsite delivery coordinates and company invoicing information'}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Shipping & Company Info (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Recipient Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building2 className="h-4 w-4 text-[#FFB800]" />
                {isAr ? 'بيانات المستلم وشركة المقاولات' : 'Contact & Contractor Information'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'اسم المهندس أو المستلم المسؤول *' : 'Site Engineer / Contact Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder={isAr ? 'مثال: م. صالح الحربي' : 'e.g. John Doe / Eng. Saleh'}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-[#FFB800] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'رقم الجوال للتنسيق الميداني *' : 'Mobile Phone for Freight Dispatch *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+966 55 123 4567"
                    dir="ltr"
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-[#FFB800] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'اسم الشركة أو المؤسسة (اختياري للفاتورة الضريبية)' : 'Company Name (Optional for Tax Invoice)'}
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder={isAr ? 'مثال: شركة الجزيرة للتعدين والمقاولات' : 'e.g. Heavy Earthworks Ltd.'}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-[#FFB800] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Site Location */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin className="h-4 w-4 text-[#FFB800]" />
                {isAr ? 'موقع العمل أو ورشة الصيانة' : 'Jobsite or Workshop Delivery Location'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'العنوان أو اسم المشروع / المحجر *' : 'Project / Quarry Site Address *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.streetLine1}
                    onChange={(e) => setFormData({ ...formData, streetLine1: e.target.value })}
                    placeholder={isAr ? 'مثال: موقع مشروع طريق الخرج، محجر رقم 4' : 'e.g. Highway Project Site 4, Industrial Area'}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-[#FFB800] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'المدينة *' : 'City *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-[#FFB800] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'الدولة' : 'Country'}
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Saudi Arabia (SA) / GCC"
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 p-2.5 text-xs text-slate-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'ملاحظات لفني الشحن أو رقم شاسيه الآلية' : 'Logistics Notes or Equipment Serial Number'}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={
                      isAr
                        ? 'مثال: عطل طارئ بحفار كوماتسو PC200-8، يرجى التوصيل برافعة تفريغ.'
                        : 'e.g. Urgent repair for Komatsu PC200-8 excavator, liftgate required.'
                    }
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-[#FFB800] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Gateway Selection */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <CreditCard className="h-4 w-4 text-[#FFB800]" />
                {isAr ? 'طريقة الدفع الإلكتروني المعتمدة' : 'Select Payment Method'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  onClick={() => setPaymentProvider('STRIPE')}
                  className={`flex items-center gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentProvider === 'STRIPE'
                      ? 'border-[#FFB800] bg-amber-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="provider"
                    checked={paymentProvider === 'STRIPE'}
                    onChange={() => setPaymentProvider('STRIPE')}
                    className="accent-[#FFB800]"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-950">
                      {isAr ? 'بطاقات Visa / MasterCard (Stripe Live)' : 'Credit Card (Stripe Live)'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {isAr ? 'دفع فوري آمن ومحمي بأعلى معايير PCI-DSS' : 'Instant 256-Bit SSL Encrypted Checkout'}
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentProvider('PAYPAL')}
                  className={`flex items-center gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentProvider === 'PAYPAL'
                      ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="provider"
                    checked={paymentProvider === 'PAYPAL'}
                    onChange={() => setPaymentProvider('PAYPAL')}
                    className="accent-blue-600"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-950">PayPal Orders v2</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {isAr ? 'الدفع عبر محفظة باي بال العالمية' : 'Global PayPal Wallet'}
                    </div>
                  </div>
                </label>
              </div>

              {/* Stripe Credit Card Section */}
              {paymentProvider === 'STRIPE' && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-amber-600" />
                      {isLiveMode
                        ? isAr
                          ? 'بيانات البطاقة البنكية الحقيقية (Stripe Live 🔒)'
                          : 'Card Details (Stripe Live 🔒)'
                        : isAr
                        ? 'بيانات البطاقة البنكية (Stripe Sandbox)'
                        : 'Card Details (Stripe Sandbox)'}
                    </span>

                    {/* Automatically HIDE 4242 fill button when in Live mode */}
                    {!isLiveMode && (
                      <button
                        type="button"
                        onClick={fillTestCard}
                        className="text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300 transition-colors cursor-pointer"
                      >
                        {isAr ? '⚡ تعبئة بطاقة Visa التجريبية (4242)' : '⚡ Fill Visa Test Card (4242)'}
                      </button>
                    )}
                  </div>

                  {/* If in Live mode, render real Stripe CardElement */}
                  {isLiveMode ? (
                    <div className="space-y-2">
                      <div className="rounded-xl border border-slate-300 bg-white p-3.5 focus-within:border-[#FFB800] transition-colors">
                        <CardElement options={CARD_ELEMENT_OPTIONS} />
                      </div>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Lock className="h-3 w-3 text-emerald-600 shrink-0" />
                        {isAr
                          ? 'بوابة الدفع الحقيقية مفعّلة ومشفرة بنظام PCI-DSS مباشرة مع خوادم Stripe.'
                          : 'Live PCI-DSS compliant payment iframe connected directly to Stripe servers.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          {isAr ? 'رقم البطاقة (Visa Sandbox)' : 'Card Number (Visa Sandbox)'}
                        </label>
                        <input
                          type="text"
                          value={cardData.cardNumber}
                          onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                          placeholder="4242 4242 4242 4242"
                          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-mono tracking-wider text-slate-900 focus:border-[#FFB800] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          {isAr ? 'تاريخ الانتهاء (MM/YY)' : 'Exp Date (MM/YY)'}
                        </label>
                        <input
                          type="text"
                          value={cardData.expDate}
                          onChange={(e) => setCardData({ ...cardData, expDate: e.target.value })}
                          placeholder="12/28"
                          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-mono text-slate-900 focus:border-[#FFB800] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          {isAr ? 'رمز الأمان (CVC)' : 'Security Code (CVC)'}
                        </label>
                        <input
                          type="text"
                          value={cardData.cvc}
                          onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                          placeholder="123"
                          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-mono text-slate-900 focus:border-[#FFB800] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary & Pricing (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                {isAr
                  ? `ملخص شحنة قطع الغيار (${items.length} أصناف)`
                  : `Order Summary (${items.length} items)`}
              </h3>

              {/* Items summary */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 line-clamp-1">{item.product.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        OEM: {item.product.sku} • {item.quantity} {isAr ? 'قطع' : 'units'}
                      </div>
                    </div>
                    <div className="font-bold text-slate-950 font-mono shrink-0">
                      {formatPrice(Number(item.unitPrice) * item.quantity, currentCurrency, lang)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Weight Notice */}
              {totalWeightKg > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Scale className="h-4 w-4 text-amber-600" />
                    {isAr ? 'إجمالي وزن الشحنة:' : 'Total Freight Weight:'}
                  </span>
                  <span className="font-extrabold text-slate-950">{formatWeight(totalWeightKg, lang)}</span>
                </div>
              )}

              {/* Pricing breakdown */}
              <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {formatPrice(subtotal, currentCurrency, lang)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{isAr ? 'ضريبة القيمة المضافة (5% VAT):' : 'Estimated VAT (5%):'}</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {formatPrice(taxAmount, currentCurrency, lang)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{isAr ? 'الشحن الميداني واللوجستي:' : 'Jobsite Freight:'}</span>
                  <span className="font-semibold text-emerald-700">
                    {shippingCost === 0
                      ? isAr
                        ? 'مجاني (أكثر من $150)'
                        : 'FREE (Over $150)'
                      : formatPrice(shippingCost, currentCurrency, lang)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-black text-slate-950">
                  <span>{isAr ? 'المبلغ الإجمالي النهائي:' : 'Total Due:'}</span>
                  <span className="text-[#0D5CB6] font-mono text-xl">
                    {formatPrice(totalAmount, currentCurrency, lang)}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="royal"
                size="lg"
                disabled={isSubmitting}
                isLoading={isSubmitting}
                className="w-full h-12 text-sm font-black shadow-md hover:shadow-lg cursor-pointer"
              >
                {isAr
                  ? `تأكيد الطلب والدفع الفوري (${formatPrice(totalAmount, currentCurrency, lang)})`
                  : `Confirm & Pay Now (${formatPrice(totalAmount, currentCurrency, lang)})`}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  {isAr
                    ? 'حجز ذري للمخزون بدون بيع مزدوج مع تشفير كامل للبيانات'
                    : 'Atomic stock reservation with 256-Bit SSL encryption'}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
