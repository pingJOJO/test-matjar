'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Check, Tag, ShieldCheck } from 'lucide-react';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { Button } from '@/components/ui/button';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { lang, dir } = useLanguageStore();
  const isAr = lang === 'ar';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
    }
  };

  return (
    <section className="bg-[#111827] text-white py-14" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Coupon Artwork */}
          <div className="lg:col-span-5 flex items-center gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-e2">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#FFB800] text-slate-950 font-black text-2xl shadow-inner font-mono">
              $20
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FFB800] uppercase tracking-wider">
                <Tag className="h-3 w-3" />
                <span>FIRST ORDER VOUCHER</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {isAr ? 'احصل على قسيمة $20 فورية لطلبك الأول' : 'Get a $20 Coupon for Your First Order'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isAr
                  ? 'صالحة لكافة قطع الغيار ومضخات الهيدروليك للطلبات فوق $150'
                  : 'Valid on all engine, hydraulic, and undercarriage parts over $150'}
              </p>
            </div>
          </div>

          {/* Right: Input Form and Consent */}
          <div className="lg:col-span-7 space-y-3">
            {subscribed ? (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm font-bold">
                <Check className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>
                  {isAr
                    ? 'شكراً لك! تم إرسال كود الخصم الحصري إلى بريدك الإلكتروني.'
                    : 'Thank you! Your $20 voucher code has been sent to your email.'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Mail className={`absolute ${isAr ? 'right-3.5' : 'left-3.5'} top-3 h-4 w-4 text-slate-400`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isAr ? 'أدخل بريدك الإلكتروني المؤسسي...' : 'Enter your corporate email address...'}
                    className={`w-full h-11 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FFB800] ${
                      isAr ? 'pr-10 pl-3' : 'pl-10 pr-3'
                    }`}
                  />
                </div>
                <Button
                  type="submit"
                  variant="royal"
                  className="h-11 px-7 bg-[#FFB800] hover:bg-[#F0AA00] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer shrink-0"
                >
                  {isAr ? 'إرسال القسيمة (GO!)' : 'CLAIM $20 (GO!)'}
                </Button>
              </form>
            )}

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr ? (
                <>
                  بالتسجيل، أنت توافق على تلقي النشرات الفنية وتحديثات عروض القطع. يمكنك إلغاء الاشتراك في أي وقت. راجع{' '}
                  <Link href="/#trust-bar" className="underline hover:text-white">
                    سياسة الخصوصية وملفات تعريف الارتباط
                  </Link>.
                </>
              ) : (
                <>
                  By subscribing, you agree to receive technical bulletins and fleet discount alerts. You can unsubscribe anytime. Read our{' '}
                  <Link href="/#trust-bar" className="underline hover:text-white">
                    Privacy & Cookie Policy
                  </Link>.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
