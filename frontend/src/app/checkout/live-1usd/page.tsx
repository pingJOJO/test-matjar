'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  ExternalLink,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  'pk_live_51UOpHiBF7CiYZCwvAEjbHII5QFA3zYoMhlQfxROpJ2qyWdwlqjFyAvJYp05taaler8uj1pZSPr9cIkM2HTuTgxpv00IMrUNZJD';

const stripePromise = loadStripe(stripePublishableKey);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#0f172a',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '15px',
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

function LiveOneDollarCheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [customerName, setCustomerName] = useState('A2Z Verified Purchaser');
  const [customerEmail, setCustomerEmail] = useState('client-test@atozparts.com');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<string>('جاهز لإدخال البطاقة');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setErrorMessage('جاري تحميل برمجية Stripe... يرجى المحاولة بعد لحظة.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage('تعذر العثور على حقل إدخال البطاقة.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Prepare/ensure 1.00 USD order
      setCurrentStep('1. تجهيز الطلب بقيمة $1.00 USD...');
      const prepRes = await apiFetch('/payments/prepare-live-1usd', {
        method: 'POST',
      });
      const orderId = prepRes.data?.orderId || 'ORDER-LIVE-1USD';
      const orderNumber = prepRes.data?.orderNumber || 'ORD-LIVE-1USD';

      // 2. Create PaymentIntent on Stripe Live API
      setCurrentStep('2. إنشاء نية الدفع عبر Stripe Live API (100 Cents)...');
      const intentRes = await apiFetch('/payments/create-intent', {
        method: 'POST',
        headers: {
          'idempotency-key': `live-web-${Date.now()}`,
        },
        body: JSON.stringify({
          orderId,
          provider: 'STRIPE',
          idempotencyKey: `live-web-${Date.now()}`,
        }),
      });

      const clientSecret = intentRes.data?.clientSecret;
      if (!clientSecret) {
        throw new Error('لم يتم استلام client_secret من سيرفر Stripe.');
      }

      // 3. Confirm Card Payment via Stripe.js Client SDK
      setCurrentStep('3. تفويض وسحب $1.00 بأمان عبر بوابة Stripe المشفرة...');
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: customerName,
              email: customerEmail,
            },
          },
        },
      );

      if (stripeError) {
        throw new Error(stripeError.message || 'فشلت معالجة البطاقة من قبل البنك.');
      }

      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        throw new Error(`حالة المعاملة لم تكتمل بنجاح: ${paymentIntent?.status}`);
      }

      // 4. Confirm settlement on Backend immediately
      setCurrentStep('4. تسجيل وتأكيد المعاملة في قاعدة البيانات (PAID & PROCESSING)...');
      const confirmRes = await apiFetch('/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({
          orderId,
          provider: 'STRIPE',
          transactionId: paymentIntent.id,
          idempotencyKey: intentRes.data?.idempotencyKey || `live-confirm-${Date.now()}`,
          paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
        }),
      });

      setPaymentSuccess({
        orderNumber,
        transactionId: paymentIntent.id,
        amount: '$1.00 USD (100 Cents)',
        status: confirmRes.data?.orderStatus || 'PROCESSING',
        paymentStatus: confirmRes.data?.paymentStatus || 'PAID',
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'حدث خطأ غير متوقع أثناء معالجة الدفع.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-white p-8 sm:p-10 shadow-lg text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div>
          <Badge variant="cat" className="text-xs mb-2">
            معاملة إنتاج حقيقية ناجحة (Stripe Live Verified)
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            تم سحب $1.00 USD بنجاح ببطاقتك البنكية!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            تم الاتصال بسيرفرات Stripe الحقيقية وتفويض وسحب مبلغ دولار واحد وتأكيد الطلب فوراً.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-xs space-y-2.5 max-w-md mx-auto text-right">
          <div className="flex justify-between">
            <span className="text-slate-500">رقم الطلب (Order Number):</span>
            <span className="font-bold text-slate-900 font-mono">{paymentSuccess.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">معرّف Stripe PaymentIntent:</span>
            <span className="font-bold text-blue-600 font-mono text-[11px] truncate max-w-[200px]">
              {paymentSuccess.transactionId}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">المبلغ المسدد:</span>
            <span className="font-bold text-emerald-700 font-mono text-sm">{paymentSuccess.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">حالة الدفع (Payment Status):</span>
            <span className="font-bold text-emerald-600 font-mono">{paymentSuccess.paymentStatus} ✅</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">حالة الطلب (Order Status):</span>
            <span className="font-bold text-blue-600 font-mono">{paymentSuccess.status} ✅</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/products">
            <Button variant="cat" size="lg" className="w-full sm:w-auto font-bold cursor-pointer">
              العودة إلى كتالوج المنتجات
            </Button>
          </Link>
          <Link href="/checkout">
            <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold cursor-pointer">
              صفحة Checkout العامة
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handlePay} className="space-y-6">
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">تنبيه أثناء معالجة الدفع:</div>
            <div className="text-[11px] leading-relaxed opacity-95">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Customer Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">
            الاسم على البطاقة البنكية *
          </label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-[#FFB800] focus:outline-none"
            placeholder="مثال: صالح الحربي"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">
            البريد الإلكتروني للإيصال البنكي *
          </label>
          <input
            type="email"
            required
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-[#FFB800] focus:outline-none"
            placeholder="name@example.com"
          />
        </div>
      </div>

      {/* Stripe Secure Card Element */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#FFB800]" />
            بيانات البطاقة البنكية الحقيقية (Stripe Live Iframe)
          </span>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <Lock className="h-2.5 w-2.5" /> 256-Bit SSL Encrypted
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 focus-within:border-[#FFB800] focus-within:bg-white transition-all">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>

        <p className="text-[10px] text-slate-500 leading-normal">
          🔒 تُرسل أرقام البطاقة مباشرة وبشكل مشفر تماماً إلى خوادم Stripe المعتمدة بمعايير PCI-DSS Level 1، ولا يتم تخزين أي رقم بطاقة داخل سيرفراتنا.
        </p>
      </div>

      {isProcessing && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 flex items-center gap-2.5 animate-pulse">
          <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
          <span className="font-mono text-[11px] font-bold">{currentStep}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isProcessing}
        isLoading={isProcessing}
        variant="cat"
        size="lg"
        className="w-full h-13 text-sm font-black shadow-md hover:shadow-lg cursor-pointer"
      >
        {isProcessing ? 'جاري معالجة الدفع عبر Stripe...' : 'تأكيد ودفع $1.00 USD الآن ببطاقتي البنكية'}
      </Button>

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <span>قيمة المعاملة المخصومة: 1.00 دولار أمريكي فقط ($1.00 USD = 100 Cents)</span>
      </div>
    </form>
  );
}

export default function LiveOneDollarCheckoutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header Banner */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="cat" className="text-xs">
              Stripe Production Live Mode
            </Badge>
            <span className="text-xs font-mono text-emerald-700 font-bold flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Live Gateway
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            شراء اختبار حقيقي بقيمة $1.00 USD
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            تم تخصيص هذه الصفحة لتنفيذ عملية شراء وإنتاج حقيقية على بوابة Stripe Live بالمفتاح المعتمد الخاص بك،
            بأقل تكلفة تجريبية ممكنة وهي دولار واحد فقط ($1.00 USD).
          </p>
        </div>

        {/* Product Card Summary */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-amber-500" />
            تفاصيل السلعة والفاتورة
          </h2>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="space-y-1">
              <div className="font-bold text-slate-900 text-sm">
                A2Z Live Verification Token (قطعة اختبار حقيقية)
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                SKU: A2Z-LIVE-TOKEN-01 • الكمية: 1
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-black text-slate-900 font-mono">$1.00 USD</div>
              <div className="text-[10px] text-emerald-600 font-bold">شحن مجاني</div>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-1">
            <div className="flex justify-between text-slate-500">
              <span>المجموع الفرعي:</span>
              <span className="font-mono font-bold text-slate-800">$1.00 USD</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>مصاريف الشحن:</span>
              <span className="font-bold text-emerald-600">$0.00 (مشمول)</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>الضريبة:</span>
              <span className="font-mono font-bold text-slate-800">$0.00</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-black text-slate-950">
              <span>المبلغ الإجمالي النهائي:</span>
              <span className="text-amber-600 font-mono text-xl">$1.00 USD</span>
            </div>
          </div>
        </div>

        {/* Stripe Elements Form Wrapper */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <Elements stripe={stripePromise}>
            <LiveOneDollarCheckoutForm />
          </Elements>
        </div>
      </div>
    </div>
  );
}
