'use client';

import React from 'react';
import Link from 'next/link';
import { Tag, Building2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { Button } from '@/components/ui/button';

export function PromoPairSection() {
  const { lang, dir } = useLanguageStore();
  const isAr = lang === 'ar';

  return (
    <section className="bg-slate-50 py-14 border-b border-border" id="pro-fleet" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Promo Card 1: Clearance & Special Offers */}
          <div className="relative rounded-2xl bg-[#0A192F] text-white p-8 overflow-hidden shadow-e2 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold">
                <Tag className="h-3.5 w-3.5" />
                <span>UP TO 53% OFF SELECT PARTS</span>
              </div>

              <h3 className="text-2xl font-black text-white">
                {isAr ? 'عروض وتخفيضات القطع المختارة' : 'Explore Current Deals & Clearance'}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
                {isAr
                  ? 'أسعار تصفية على مضخات الوقود، شواحن التيربو، وبكرات الجنازير لكاتربيلر وكوماتسو مع ضمان استبدال كامل.'
                  : 'Limited-time pricing on fuel pumps, turbochargers, and track rollers for CAT & Komatsu fleets.'}
              </p>
            </div>

            <div className="relative z-10 pt-6">
              <Link href="/products?productSort=salesCount_desc">
                <Button
                  variant="royal"
                  size="default"
                  className="bg-[#FFB800] hover:bg-[#F0AA00] text-slate-950 font-black text-xs h-11 px-6 shadow-sm gap-2"
                >
                  <span>{isAr ? 'تصفح كافة العروض والتخفيضات' : 'See All Offers'}</span>
                  <ArrowRight className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Promo Card 2: Shop With Pros / A2Z Pro Fleet Club */}
          <div className="relative rounded-2xl bg-[#0D2340] text-white p-8 overflow-hidden shadow-e2 flex flex-col justify-between border border-blue-900">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-mono font-bold">
                <Building2 className="h-3.5 w-3.5" />
                <span>B2B WHOLESALE CONTRACTOR FLEET</span>
              </div>

              <h3 className="text-2xl font-black text-white">
                {isAr ? 'A2Z PRO FLEET: حسابات شركات المقاولات' : 'Shop With Pros: Fleet Wholesale'}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
                {isAr
                  ? 'خصومات كميات حصرية، مهندس حسابات مخصص لمتابعة أسطولك، فواتير ضريبية فورية، وتسهيلات دفع Net 30.'
                  : 'Wholesale pricing tiers, dedicated technical parts engineer, certified VAT tax invoicing, and Net 30 credit lines.'}
              </p>
            </div>

            <div className="relative z-10 pt-6">
              <Link href="/#pro-fleet">
                <Button
                  variant="royal"
                  size="default"
                  className="bg-[#0D5CB6] hover:bg-[#0B4F9C] text-white font-black text-xs h-11 px-6 shadow-sm gap-2"
                >
                  <span>{isAr ? 'التقديم لحساب أساطيل المقاولين' : 'Shop With Pros (Wholesale)'}</span>
                  <ArrowRight className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
