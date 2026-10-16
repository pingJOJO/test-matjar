'use client';

import React from 'react';
import { Star, ShieldCheck, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguageStore } from '@/stores/useLanguageStore';

export function ReviewsSection() {
  const { lang, dir } = useLanguageStore();
  const isAr = lang === 'ar';

  const reviews = [
    {
      author: 'Marcus Vance',
      company: 'Highland Earthworks LLC',
      location: 'Texas, USA',
      fleet: '14 Excavators & Wheel Loaders',
      partPurchased: 'Komatsu PC200-8 Hydraulic Main Pump',
      oem: '708-2L-00300',
      stars: 5,
      date: '2 weeks ago',
      content:
        'Direct bolt-on fitment. The pump arrived crated with zero shipping damage and holding complete pressure calibration. Ended our excavator downtime in 36 hours. Best pricing in North America.',
      contentAr:
        'مطابقة تامة لفتحات التثبيت. وصلت المضخة في صندوق خشبي محكم بدون أي خدش ومضبوطة الضغط بالكامل. أنهت توقف الحفار خلال 36 ساعة فقط.',
    },
    {
      author: 'Eng. Tareq Al-Ghamdi',
      company: 'Desert Stone Mining & Quarries',
      location: 'Riyadh, Saudi Arabia',
      fleet: '28 Heavy Fleets',
      partPurchased: 'CAT 320D Injector Set (RE529118)',
      oem: '320-0680 / RE529118',
      stars: 5,
      date: '1 month ago',
      content:
        'Engine purrs like new. The common-rail injectors were dimensionally verified with certified test reports. Fast delivery to our quarry location and official VAT tax invoice provided immediately.',
      contentAr:
        'المحرك يعمل بأعلى كفاءة. تم فحص رشاشات الديزل ومطابقتها لتقارير المصنع، مع إرسال سريع للمحجر وتوفير فاتورة ضريبية إلكترونية معتمدة فوراً.',
    },
    {
      author: 'Brett Kowalski',
      company: 'Great Lakes Utility Contractors',
      location: 'Michigan, USA',
      fleet: '9 Bobcat Skid Steers',
      partPurchased: 'Bobcat T190 Final Drive Travel Motor',
      oem: '6686154',
      stars: 5,
      date: '3 weeks ago',
      content:
        'OEM dealer quoted us 3 weeks backorder. A2Z Parts had it in stock and shipped same day. Track drive torque is 100% matched to factory specifications. Will buy all our undercarriage parts here.',
      contentAr:
        'الوكيل الأصلي طلب انتظار 3 أسابيع، بينما وفرت A2Z Parts القطعة فوراً وشحنتها في نفس اليوم. عزم الدوران مطابق تماماً لمواصفات المصنع.',
    },
  ];

  return (
    <section className="bg-slate-50 py-16 border-b border-border" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>3,840+ VERIFIED STORE REVIEWS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {isAr ? 'ماذا يقول عملاؤنا ومشغلو الأساطيل' : 'What Our Customers Are Saying'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
              {isAr
                ? 'تقييمات موثقة من مدراء مشاريع البنية التحتية، شركات المقاولات، ومشغلي المحاجر'
                : 'Real feedback from infrastructure contractors, mining operators, and field mechanics'}
            </p>
          </div>

          {/* Google Score Widget */}
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-white border border-border shadow-e1">
            <div className="text-center">
              <div className="text-2xl font-black text-foreground font-mono">4.4 / 5.0</div>
              <div className="flex items-center gap-0.5 text-[#FFB800] mt-0.5 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-[#FFB800]" />
                ))}
              </div>
            </div>
            <div className="border-s border-border ps-4 text-xs">
              <div className="font-bold text-foreground">Google Store Rating</div>
              <div className="text-[11px] text-muted-foreground font-mono">3,840 verified reviews</div>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-white p-6 shadow-e1 hover:shadow-e2 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Rating and date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-[#FFB800]">
                    {[...Array(r.stars)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[#FFB800]" />
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">{r.date}</span>
                </div>

                {/* Part info badge */}
                <div className="p-2 rounded-lg bg-muted/50 border border-border/80 text-[11px]">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                    {isAr ? 'القطعة المشتراة:' : 'Part Purchased:'}
                  </span>
                  <span className="font-bold text-foreground block font-mono">{r.partPurchased}</span>
                  <span className="text-[10px] text-primary font-mono font-semibold">OEM: {r.oem}</span>
                </div>

                {/* Review body */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  "{isAr ? r.contentAr : r.content}"
                </p>
              </div>

              {/* Author footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-foreground">{r.author}</h4>
                  <span className="text-[11px] text-muted-foreground block">{r.company}</span>
                  <span className="text-[10px] text-slate-400 block">{r.location}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Verified Fleet</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
