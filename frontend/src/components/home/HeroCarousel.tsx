'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Truck, Flame, Wrench } from 'lucide-react';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { Button } from '@/components/ui/button';

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { lang, dir } = useLanguageStore();
  const isAr = lang === 'ar';

  const slides = [
    {
      id: 1,
      badgeEn: 'HEAVY MACHINERY AFTERMARKET FLEET',
      badgeAr: 'أسطول قطع غيار المعدات الثقيلة المعتمدة',
      titleEn: 'Fix It Right. End Downtime.',
      titleAr: 'إصلاح فوري دقيق، وإنهاء توقف المعدات.',
      subtitleEn:
        '36,000+ certified aftermarket replacement parts for Caterpillar, Komatsu, Kubota, John Deere, Bobcat, and Cummins. 100% OEM dimensional interchange match.',
      subtitleAr:
        'أكثر من 36,000 قطعة غيار بديلة معتمدة لكوماتسو، كاتربيلر، كوبوتا، جون دير، بوبكات، وكمنز مع مطابقة أبعاد المصنع 100%.',
      ctaTextEn: 'Explore Parts Catalog',
      ctaTextAr: 'تصفح كتالوج قطع الغيار',
      ctaLink: '/products',
      secondaryTextEn: 'Fast-Moving Parts',
      secondaryTextAr: 'القطع الأكثر طلباً',
      secondaryLink: '/products?productSort=salesCount_desc',
      image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=1600&q=80',
    },
    {
      id: 2,
      badgeEn: 'USA & REGIONAL DISTRIBUTION HUBS',
      badgeAr: 'مستودعات مركزية وشحن سريع',
      titleEn: 'Direct Jobsite & Quarry Freight Dispatch',
      titleAr: 'شحن مباشر للمواقع والمحاجر ومخيمات التعدين',
      subtitleEn:
        'Free direct freight on qualifying orders over $150. Heavy liftgate trucks dispatched directly to remote construction sites within 24 hours.',
      subtitleAr:
        'شحن سريع ومجاني للطلبات المؤهلة فوق $150. شاحنات مجهزة برافعات هيدروليكية مخصصة للمشاريع والمواقع النائية.',
      ctaTextEn: 'Shop In-Stock Parts',
      ctaTextAr: 'تسوق القطع المتوفرة',
      ctaLink: '/products?inStockOnly=true',
      secondaryTextEn: 'Track Order',
      secondaryTextAr: 'تتبع الشحنة',
      secondaryLink: '/checkout',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80',
    },
    {
      id: 3,
      badgeEn: '100% OEM SPECIFICATION INTERCHANGE',
      badgeAr: 'مطابقة تامة لأبعاد ومواصفات المصنع',
      titleEn: 'Engineering Precision for Excavators & Loaders',
      titleAr: 'هندسة دقيقة للحفارات واللوادر والبلدوزرات',
      subtitleEn:
        'Direct bolt-on fitment without modifications. Verified alloy metallurgical standards tested for extreme quarry and construction environments.',
      subtitleAr:
        'تركيب مباشر دون أي تعديل. سبائك معدنية معالجة حرارياً لتحمل أقسى ظروف التشغيل ودرجات الحرارة العالية.',
      ctaTextEn: 'Browse by Machine',
      ctaTextAr: 'البحث بنوع الآلية',
      ctaLink: '/products',
      secondaryTextEn: 'Engine Rebuild Kits',
      secondaryTextAr: 'أطقم توضيب المحركات',
      secondaryLink: '/products?categorySlug=cat-diesel-engines',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80',
    },
    {
      id: 4,
      badgeEn: 'CRITICAL OPERATION SYSTEMS',
      badgeAr: 'منظومات التشغيل الحرجة',
      titleEn: 'Heavy Water Pumps & Engine Cooling',
      titleAr: 'طلمبات المياه ومنظومات تبريد محركات الديزل',
      subtitleEn:
        'High-flow water pumps, heavy-duty radiators, and oil coolers designed to withstand extreme 55°C desert and quarry heat without power loss.',
      subtitleAr:
        'طلمبات مياه عالية التدفق ومبردات زيت مصممة لتحمل حرارة الأجواء الصعبة حتى 55°C بدون انخفاض كفاءة المحرك.',
      ctaTextEn: 'Shop Cooling Systems',
      ctaTextAr: 'تسوق قطع التبريد',
      ctaLink: '/products?categorySlug=cooling-hvac',
      secondaryTextEn: 'Hydraulic Pumps',
      secondaryTextAr: 'طلمبات الهيدروليك',
      secondaryLink: '/products?categorySlug=hydraulics-systems',
      image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=1600&q=80',
    },
    {
      id: 5,
      badgeEn: 'A2Z PRO FLEET & MEMBER CLUB',
      badgeAr: 'نادي أساطيل المقاولات والشركات',
      titleEn: 'Save Up to 10% with Pro Member Pricing',
      titleAr: 'وفر حتى 10% مع أسعار أساطيل المقاولين',
      subtitleEn:
        'Exclusive contractor volume pricing, dedicated technical account managers, Net 30 terms, and priority emergency dispatch.',
      subtitleAr:
        'تخفيضات كميات حصرية، مهندسو حسابات قطع مخصصون، تسهيلات دفع Net 30، وأولوية شحن طوارئ للمحاجر والمشاريع الكبرى.',
      ctaTextEn: 'Join Pro Fleet Club',
      ctaTextAr: 'الانضمام لنادي المقاولين',
      ctaLink: '/#pro-fleet',
      secondaryTextEn: 'Contact Fleet Specialist',
      secondaryTextAr: 'استشارة أخصائي الأسطول',
      secondaryLink: '/admin',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?w=1600&q=80',
    },
  ];

  // Autoplay 6s, paused on hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const slide = slides[currentSlide];

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0A192F] text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      dir={dir}
    >
      {/* 16:5 Aspect Ratio Container Desktop, 4:3 Mobile */}
      <div className="relative min-h-[460px] sm:min-h-[500px] lg:min-h-[520px] flex items-center">
        {/* Background Image with art-directed overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={slide.image}
            alt={slide.titleEn}
            fill
            priority={currentSlide === 0}
            sizes="100vw"
            className="object-cover opacity-25 scale-105 transition-all duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F] via-[#0A192F]/85 to-transparent" />
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        {/* Slide Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="max-w-2xl space-y-5 animate-in fade-in duration-300">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-[#60A5FA] text-xs font-mono font-bold tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{isAr ? slide.badgeAr : slide.badgeEn}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              {isAr ? slide.titleAr : slide.titleEn}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
              {isAr ? slide.subtitleAr : slide.subtitleEn}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href={slide.ctaLink}>
                <Button
                  variant="royal"
                  size="lg"
                  className="bg-[#0D5CB6] hover:bg-[#0B4F9C] text-white font-extrabold text-sm h-12 px-6 shadow-md cursor-pointer gap-2"
                >
                  <span>{isAr ? slide.ctaTextAr : slide.ctaTextEn}</span>
                  <ArrowRight className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
                </Button>
              </Link>

              <Link href={slide.secondaryLink}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-600 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-bold text-sm h-12 px-6 cursor-pointer"
                >
                  {isAr ? slide.secondaryTextAr : slide.secondaryTextEn}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 transition-colors cursor-pointer`}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className={`absolute ${isAr ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 transition-colors cursor-pointer`}
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentSlide === idx ? 'w-8 bg-[#FFB800]' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
