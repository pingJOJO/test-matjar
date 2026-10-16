'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Truck, Award, Wrench, ArrowRight } from 'lucide-react';
import { useLanguageStore } from '@/stores/useLanguageStore';

export function PrideEditorialSection() {
  const { lang, dir } = useLanguageStore();
  const isAr = lang === 'ar';

  const cards = [
    {
      icon: Truck,
      tagEn: 'SUSTAINABILITY & LOGISTICS',
      tagAr: 'الاستدامة والخدمات اللوجستية',
      titleEn: 'UPS Green Direct Freight Initiative',
      titleAr: 'مبادرة الشحن المباشر والمستدام مع UPS',
      descEn:
        'Partnering with global carriers to optimize consolidated heavy freight routes, reducing transit time to mining camps while offsetting jobsite dispatch carbon footprint.',
      descAr:
        'شراكة استراتيجية لتحسين مسارات توريد الشحنات الثقيلة وتقليل زمن التوقف في مواقع التعدين مع تقليل الانبعاثات الكربونية.',
      link: '/#trust-bar',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    },
    {
      icon: Award,
      tagEn: 'GLOBAL EXHIBITIONS',
      tagAr: 'المعارض الدولية المعتمدة',
      titleEn: 'Exhibiting at Bauma & ConExpo Machinery Expos',
      titleAr: 'المشاركة في معارض باوما وكونيكسبو العالمية',
      descEn:
        'Showcasing next-generation aftermarket metallurgy, high-flow hydraulic pumps, and extreme heat cooling assemblies directly to fleet maintenance managers.',
      descAr:
        'استعراض أحدث تقنيات السبائك المعدنية، طلمبات الهيدروليك عالية التدفق، ومنظومات التبريد مع كبرى شركات المقاولات العالمية.',
      link: '/products',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    },
    {
      icon: Wrench,
      tagEn: 'ENGINEERING BENCHMARKS',
      tagAr: 'المعايير الهندسية والفحص',
      titleEn: 'Master Technician Dimensional Verification',
      titleAr: 'الفحص الميكانيكي والمعايرة الدقيقة لأبعاد OEM',
      descEn:
        'Every single turbocharger, hydraulic valve, and diesel injector batch undergoes strict micrometric calibration and pressure test-bench trials before dispatch.',
      descAr:
        'تخضع كافة شواحن التيربو، صمامات الهيدروليك، ورشاشات الديزل لمعايرة ميكرومترية واختبارات ضغط دقيقة على منصات فحص المصنع قبل الإرسال.',
      link: '/products?isFeatured=true',
      image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80',
    },
  ];

  return (
    <section className="bg-white py-16 border-b border-border" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
            {isAr ? 'قيم ومبادئ العمل' : 'Our Professional Commitment'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            {isAr ? 'لماذا نفخر بما نقدمه لقطاع المعدات' : 'Why Take Pride in What We Do'}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isAr
              ? 'معايير جودة لا تقبل التنازل لدعم مشاريع البنية التحتية وأساطيل المقاولات في كافة الظروف'
              : 'Engineering excellence, sustainable dispatch, and verified metallurgical standards for the worlds hardest jobsites'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="group rounded-2xl border border-border bg-white overflow-hidden shadow-e1 hover:shadow-e2 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-16/9 w-full overflow-hidden bg-muted">
                    <Image
                      src={card.image}
                      alt={card.titleEn}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 start-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111827]/80 text-white text-[10px] font-mono font-bold backdrop-blur-xs">
                      <Icon className="h-3 w-3 text-[#FFB800]" />
                      <span>{isAr ? card.tagAr : card.tagEn}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {isAr ? card.titleAr : card.titleEn}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                      {isAr ? card.descAr : card.descEn}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={card.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover group-hover:underline"
                  >
                    <span>{isAr ? 'اقرأ المزيد عن المعايير' : 'Explore Initiative'}</span>
                    <ArrowRight className={`h-3.5 w-3.5 ${isAr ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
