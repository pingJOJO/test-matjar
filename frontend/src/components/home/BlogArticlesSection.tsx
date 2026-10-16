'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';
import { useLanguageStore } from '@/stores/useLanguageStore';

export function BlogArticlesSection() {
  const { lang, dir } = useLanguageStore();
  const isAr = lang === 'ar';

  const articles = [
    {
      id: 1,
      categoryEn: 'DIAGNOSTIC GUIDES',
      categoryAr: 'أدلة الفحص والأعطال',
      titleEn: 'Common Rail Injector Failure: 5 Symptoms Before Engine Seizure',
      titleAr: 'أعطال رشاشات الديزل المشتركة: 5 علامات تحذيرية قبل توقف المحرك',
      readTimeEn: '6 min read',
      readTimeAr: 'قراءة في 6 دقائق',
      excerptEn:
        'Learn how particulate contamination destroys needle valves, causes black smoke under load, and how to verify return flow rates on CAT 320D and Komatsu PC200.',
      excerptAr:
        'كيف تؤدي الرواسب إلى تآكل إبرة البخاخ وانبعاث الدخان الأسود تحت الحمل، وطريقة قياس تدفق الراجع لمحركات CAT و Komatsu.',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
    },
    {
      id: 2,
      categoryEn: 'HYDRAULICS',
      categoryAr: 'الهيدروليك والمضخات',
      titleEn: 'Hydraulic Pump Cavitation: Benchmarks for Relief Valve Calibration',
      titleAr: 'ظاهرة التكهف بطلمبات الهيدروليك: معايرة صمامات تصريف الضغط',
      readTimeEn: '8 min read',
      readTimeAr: 'قراءة في 8 دقائق',
      excerptEn:
        'Step-by-step diagnostic benchmark for main hydraulic pump cavitation, aeration noise, and swashplate wear tolerances under high working temperatures.',
      excerptAr:
        'دليل تفصيلي لفحص أسباب أصوات التكهف وتآكل أقراص التوجيه في مضخات الهيدروليك الرئيسية تحت درجات حرارة الزيت المرتفعة.',
      image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80',
    },
    {
      id: 3,
      categoryEn: 'FLEET MAINTENANCE',
      categoryAr: 'صيانة الأساطيل والجنازير',
      titleEn: 'Undercarriage Wear Limits: When to Turn Pins & Bushings',
      titleAr: 'حدود تآكل الهيكل السفلي: متى تقلب البنزات والجلب في الجنزير؟',
      readTimeEn: '5 min read',
      readTimeAr: 'قراءة في 5 دقائق',
      excerptEn:
        'Prevent costly track derailment in rocky quarries. Dimensional wear charts for bottom rollers, front idlers, and drive sprockets for 20T to 50T excavators.',
      excerptAr:
        'تجنب انزلاق وتفكك الجنازير في المحاجر الصخرية. جداول قياسات التآكل المسموح بها للبكرات والعجلات المسننة للحفارات.',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    },
  ];

  return (
    <section className="bg-white py-16 border-b border-border" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
              {isAr ? 'المقالات والأدلة الميدانية' : 'Field Engineering & Tech Insights'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {isAr ? 'أدلة الصيانة الميدانية للمعدات الثقيلة' : 'More Reasons to Love Us'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {isAr
                ? 'أحدث مقالات فحص الأعطال وتوصيات مهندسي الصيانة للمعدات والآليات الثقيلة'
                : 'Actionable diagnostic advice and field maintenance guides written by heavy equipment engineers'}
            </p>
          </div>

          <Link
            href="/products"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>{isAr ? 'تصفح كافة المقالات' : 'View All Articles'}</span>
            <ArrowRight className={`h-3.5 w-3.5 ${isAr ? 'rotate-180' : ''}`} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((art) => (
            <article
              key={art.id}
              className="group rounded-2xl border border-border bg-white overflow-hidden shadow-e1 hover:shadow-e2 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
                  <Image
                    src={art.image}
                    alt={art.titleEn}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 start-3 z-10 px-2.5 py-1 rounded bg-[#111827]/85 text-white text-[10px] font-mono font-bold backdrop-blur-xs">
                    {isAr ? art.categoryAr : art.categoryEn}
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{isAr ? art.readTimeAr : art.readTimeEn}</span>
                  </div>

                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {isAr ? art.titleAr : art.titleEn}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {isAr ? art.excerptAr : art.excerptEn}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:text-primary-hover group-hover:underline"
                >
                  <span>{isAr ? 'قراءة الدليل بالكامل' : 'Read Full Guide'}</span>
                  <ArrowRight className={`h-3.5 w-3.5 ${isAr ? 'rotate-180' : ''}`} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
