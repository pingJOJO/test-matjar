'use client';

import React from 'react';
import { ShieldCheck, Truck, Clock, Headphones } from 'lucide-react';
import { useLanguageStore } from '@/stores/useLanguageStore';

export function TrustBar() {
  const { lang, dir } = useLanguageStore();
  const isAr = lang === 'ar';

  const items = [
    {
      icon: ShieldCheck,
      titleEn: "100k+ Customers' Top Choice",
      titleAr: 'أكثر من 100,000+ عميل معتمد',
      subtitleEn: 'Trusted globally by heavy fleet contractors & mines',
      subtitleAr: 'موثوق به لدى كبرى شركات المقاولات والتعدين',
    },
    {
      icon: Clock,
      titleEn: '1-Year Full Warranty',
      titleAr: 'ضمان استبدال شامل لمدة عام',
      subtitleEn: 'Comprehensive peace of mind on all parts & assemblies',
      subtitleAr: 'تغطية وضمان استبدال كامل لكافة القطع',
    },
    {
      icon: Truck,
      titleEn: '90-Day Returns Policy',
      titleAr: 'سياسة إرجاع مرنة لمدة 90 يوماً',
      subtitleEn: 'Hassle-free dimensional verification & returns',
      subtitleAr: 'استرجاع واستبدال مرن وفوري بدون تعقيد',
    },
    {
      icon: Headphones,
      titleEn: '24/7 Parts Specialist Service',
      titleAr: 'خدمة فنيين ومهندسين 24/7',
      subtitleEn: '+1-800-A2Z-PART direct engineering helpline',
      subtitleAr: 'خط ساخن للتنسيق اللوجستي واستشارات الأعطال',
    },
  ];

  return (
    <section className="bg-white border-y border-border py-6" id="trust-bar" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3.5 p-2">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">
                    {isAr ? item.titleAr : item.titleEn}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isAr ? item.subtitleAr : item.subtitleEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
