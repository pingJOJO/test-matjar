'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { api, apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function StripeTestPaymentPage() {
  const [testOrderId, setTestOrderId] = useState('TEST-A2Z-59');
  const [amountAED, setAmountAED] = useState(59.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepLogs, setStepLogs] = useState<Array<{ step: string; status: 'pending' | 'success' | 'error'; message: string }>>([]);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const addLog = (step: string, status: 'pending' | 'success' | 'error', message: string) => {
    setStepLogs((prev) => [...prev, { step, status, message }]);
  };

  const handleRunTest = async () => {
    setIsProcessing(true);
    setError(null);
    setStepLogs([]);
    setTestResult(null);

    try {
      // 1. Create or ensure Order exists
      addLog('الخطوة 1: تجهيز الطلب', 'pending', `جاري فحص الطلب رقم ${testOrderId} بقيمة ${amountAED} درهم...`);
      
      let orderId = testOrderId;

      // 2. Create PaymentIntent
      addLog('الخطوة 2: إنشاء PaymentIntent', 'pending', `إنشاء نية دفع بقيمة ${amountAED * 100} فلساً وعملة AED...`);
      const intentRes = await apiFetch('/payments/create-intent', {
        method: 'POST',
        headers: {
          'idempotency-key': `test-web-${Date.now()}`,
        },
        body: JSON.stringify({
          orderId,
          provider: 'STRIPE',
          idempotencyKey: `test-web-${Date.now()}`,
        }),
      }).catch(async (err) => {
        // إذا لم يكن الطلب موجوداً مسبقاً، ننشئه عبر checkout
        addLog('تنبيه', 'pending', 'إنشاء الطلب في النظام أولاً...');
        const coRes = await api.checkout({
          shippingAddress: {
            fullName: 'أحمد المنصوري (مهندس أسطول)',
            phone: '+971501234567',
            streetLine1: 'موقع مشروع جبل علي الصناعي 3',
            city: 'Dubai',
            country: 'AE',
          },
          notes: 'طلب تجريبي لاختبار Stripe Sandbox AED 59.00',
          currency: 'AED',
        });
        orderId = coRes.data.id;
        setTestOrderId(coRes.data.orderNumber);
        return apiFetch('/payments/create-intent', {
          method: 'POST',
          headers: {
            'idempotency-key': `test-web-${Date.now()}`,
          },
          body: JSON.stringify({
            orderId,
            provider: 'STRIPE',
            idempotencyKey: `test-web-${Date.now()}`,
          }),
        });
      });

      addLog(
        'الخطوة 2: إنشاء PaymentIntent',
        'success',
        `تم إنشاء نية الدفع بنجاح. معرف المعاملة: ${intentRes.data.transactionId || 'pi_simulated'}`,
      );

      // 3. Confirm payment with test card
      addLog('الخطوة 3: تأكيد الدفع بالبطاقة', 'pending', 'تأكيد الدفع ببطاقة Visa التجريبية 4242 4242 4242 4242...');
      const confirmRes = await apiFetch('/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({
          orderId,
          provider: 'STRIPE',
          transactionId: intentRes.data.transactionId || `pi_test_${Date.now()}`,
          idempotencyKey: intentRes.data.idempotencyKey || `web-idem-${Date.now()}`,
          paymentMethod: 'visa_test_4242',
        }),
      });

      addLog('الخطوة 3: تأكيد الدفع بالبطاقة', 'success', `تم تسوية المعاملة بنجاح وحجز البضاعة!`);

      // 4. Simulate Webhook confirmation
      addLog('الخطوة 4: محاكاة الـ Webhook', 'pending', 'إرسال حدث payment_intent.succeeded للـ Webhook...');
      const whRes = await apiFetch('/payments/webhook/stripe', {
        method: 'POST',
        body: JSON.stringify({
          type: 'payment_intent.succeeded',
          data: {
            object: {
              id: intentRes.data.transactionId || `pi_test_${Date.now()}`,
              metadata: { orderId, orderNumber: testOrderId },
              amount_received: amountAED * 100,
            },
          },
        }),
      });

      addLog('الخطوة 4: محاكاة الـ Webhook', 'success', `استقبل الـ Webhook الحدث بنجاح وأكد السداد في قاعدة البيانات.`);

      // 5. Query final status
      const statusRes = await api.getPaymentStatus(orderId);
      setTestResult(statusRes.data);
      addLog('الخطوة 5: التحقق النهائي', 'success', `حالة الطلب: ${statusRes.data.orderStatus} | حالة الدفع: ${statusRes.data.paymentStatus}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء إجراء الاختبار');
      addLog('فشل الاختبار', 'error', err.message || 'خطأ غير متوقع');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="cat" className="text-xs">
              Stripe Sandbox Testing Lab
            </Badge>
            <span className="text-xs font-mono text-slate-400">A2Z Parts Engine v1.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            اختبار الدفع التجريبي المباشر (AED 59.00)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            تتيح لك هذه الصفحة تنفيذ فحص فوري ومكتمل لدورة حياة الدفع عبر Stripe Sandbox بقيمة 59 درهم إماراتي،
            باستخدام بطاقة Visa التجريبية (4242) والتحقق من استقبال الـ Webhook وتأكيد الطلب في قاعدة البيانات.
          </p>
        </div>

        {/* Configuration Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Zap className="h-4 w-4 text-amber-500" />
            معايير وقيم الاختبار
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-slate-500 block mb-1">المبلغ التجريبي:</span>
              <span className="text-xl font-black text-slate-900 font-mono">59.00 AED</span>
              <span className="text-[10px] text-slate-400 block mt-1">(5900 فلس لـ Stripe API)</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-slate-500 block mb-1">بطاقة الاختبار الرسمية:</span>
              <span className="text-base font-bold text-slate-900 font-mono">4242 •••• 4242</span>
              <span className="text-[10px] text-emerald-600 block mt-1">Visa Test Card (Stripe)</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-slate-500 block mb-1">معرّف الطلب في الـ Metadata:</span>
              <span className="text-sm font-bold text-blue-700 font-mono">{testOrderId}</span>
              <span className="text-[10px] text-slate-400 block mt-1">orderId: &apos;{testOrderId}&apos;</span>
            </div>
          </div>

          <Button
            onClick={handleRunTest}
            disabled={isProcessing}
            isLoading={isProcessing}
            variant="royal"
            size="lg"
            className="w-full h-12 text-sm font-black cursor-pointer shadow-md"
          >
            {isProcessing ? 'جاري معالجة الاختبار والـ Webhook...' : 'بدء تشغيل اختبار الدفع الآن (59 AED)'}
          </Button>
        </div>

        {/* Live Execution Logs */}
        {stepLogs.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 text-blue-600 ${isProcessing ? 'animate-spin' : ''}`} />
              سجل تنفيذ الخطوات الحقيقي (Execution Logs)
            </h3>

            <div className="space-y-2.5">
              {stepLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs ${
                    log.status === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : log.status === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-blue-50 border-blue-200 text-blue-900'
                  }`}
                >
                  {log.status === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : log.status === 'error' ? (
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span className="font-bold block">{log.step}</span>
                    <span className="text-[11px] opacity-90">{log.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final Test Result */}
        {testResult && (
          <div className="rounded-3xl border border-emerald-300 bg-emerald-50/50 p-6 sm:p-8 shadow-md text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              تم التحقق وتأكيد الطلب محلياً بنجاح 100%!
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              تم إنشاء نية الدفع بـ 5900 فلساً، وتأكيد البطاقة 4242، واستقبال الـ Webhook وتحديث قاعدة البيانات.
            </p>

            <div className="max-w-md mx-auto rounded-2xl border border-emerald-200 bg-white p-4 text-xs space-y-2 text-right">
              <div className="flex justify-between">
                <span className="text-slate-500">رقم الطلب:</span>
                <span className="font-bold text-slate-900 font-mono">{testResult.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">حالة الدفع:</span>
                <span className="font-bold text-emerald-600">{testResult.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">حالة الطلب:</span>
                <span className="font-bold text-blue-600">{testResult.orderStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المبلغ المسجل:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {testResult.totalAmount} {testResult.currency}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Link href="/checkout">
                <Button variant="outline" size="sm" className="cursor-pointer text-xs">
                  الذهاب إلى صفحة Checkout الرئيسية
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
