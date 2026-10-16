'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  Flame,
  Search,
} from 'lucide-react';
import { ProductItem } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { PartFinderInline } from '@/components/home/PartFinderInline';
import { TrustBar } from '@/components/home/TrustBar';
import { CategoryTabsSection } from '@/components/home/CategoryTabsSection';
import { ReviewsSection } from '@/components/home/ReviewsSection';
import { PrideEditorialSection } from '@/components/home/PrideEditorialSection';
import { CommunityBanner } from '@/components/home/CommunityBanner';
import { PromoPairSection } from '@/components/home/PromoPairSection';
import { BlogArticlesSection } from '@/components/home/BlogArticlesSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguageStore } from '@/stores/useLanguageStore';

interface HomeClientViewProps {
  featuredParts: ProductItem[];
  fastMovingParts: ProductItem[];
}

export function HomeClientView({ featuredParts, fastMovingParts }: HomeClientViewProps) {
  const { lang, dir } = useLanguageStore();
  const isAr = lang === 'ar';

  // Section 6 Brands Wall (§3.1 section 6)
  const brandButtons = [
    { name: 'CATERPILLAR (CAT)', query: 'Caterpillar', oemCount: '8,400+ Parts' },
    { name: 'KOMATSU', query: 'Komatsu', oemCount: '7,150+ Parts' },
    { name: 'KUBOTA', query: 'Kubota', oemCount: '5,200+ Parts' },
    { name: 'JOHN DEERE', query: 'John Deere', oemCount: '4,850+ Parts' },
    { name: 'BOBCAT', query: 'Bobcat', oemCount: '3,900+ Parts' },
    { name: 'JCB', query: 'JCB', oemCount: '3,400+ Parts' },
    { name: 'CUMMINS', query: 'Cummins', oemCount: '4,100+ Parts' },
    { name: 'YANMAR', query: 'Yanmar', oemCount: '2,900+ Parts' },
    { name: 'VOLVO CE', query: 'Volvo', oemCount: '3,650+ Parts' },
    { name: 'HITACHI', query: 'Hitachi', oemCount: '2,800+ Parts' },
    { name: 'PERKINS', query: 'Perkins', oemCount: '2,400+ Parts' },
    { name: 'DEUTZ', query: 'Deutz', oemCount: '2,150+ Parts' },
    { name: 'DOOSAN', query: 'Doosan', oemCount: '2,300+ Parts' },
    { name: 'CASE', query: 'Case', oemCount: '2,600+ Parts' },
    { name: 'ISUZU', query: 'Isuzu', oemCount: '1,950+ Parts' },
    { name: 'HYUNDAI', query: 'Hyundai', oemCount: '1,800+ Parts' },
  ];

  // Section 7 Machine Types (§3.1 section 7)
  const machineTypes = [
    { titleEn: 'Excavators', titleAr: 'حفارات هيدروليكية', query: 'Excavator', desc: 'Mini & Heavy 1T–90T' },
    { titleEn: 'Wheel Loaders', titleAr: 'لوادر مجنزرة وعجلات', query: 'Loader', desc: 'Compact to 35T Fleets' },
    { titleEn: 'Bulldozers', titleAr: 'بلدوزرات تسوية', query: 'Dozer', desc: 'Track Dozers & Rippers' },
    { titleEn: 'Compact Loaders', titleAr: 'بوبكات ولوادر مدمجة', query: 'Bobcat', desc: 'Skid Steers & Track' },
    { titleEn: 'Tractors & Ag', titleAr: 'جرارات زراعية', query: 'Tractor', desc: 'Row-Crop & Utility' },
    { titleEn: 'Forklifts & Telehandlers', titleAr: 'رافعات شوكية وتيلي هاندلر', query: 'Forklift', desc: 'Rough Terrain & Diesel' },
    { titleEn: 'Diesel Generators', titleAr: 'مولدات ديزل صناعية', query: 'Generator', desc: '15kVA – 2000kVA Gensets' },
    { titleEn: 'Heavy Engines', titleAr: 'محركات ديزل صناعية', query: 'Engine', desc: 'Complete & Short Blocks' },
    { titleEn: 'Scissor Lifts', titleAr: 'رافعات مقصية وهيدروليك', query: 'Lift', desc: 'Aerial Work Platforms' },
  ];

  return (
    <div className="bg-white text-slate-900 min-h-screen" dir={dir}>
      {/* ========================================================
          1. SECTION 2: HERO CAROUSEL (§3.1 section 2)
      ======================================================== */}
      <HeroCarousel />

      {/* ========================================================
          2. SECTION 3: INLINE PART FINDER (§3.1 section 3)
      ======================================================== */}
      <section className="relative z-20 -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <PartFinderInline />
      </section>

      {/* ========================================================
          3. SECTION 4: VALUE / TRUST STRIP (§3.1 section 4)
      ======================================================== */}
      <TrustBar />

      {/* ========================================================
          4. SECTION 5: FIND PARTS BY CATEGORY (§3.1 section 5)
      ======================================================== */}
      <CategoryTabsSection />

      {/* ========================================================
          5. SECTION 6: FIND AFTERMARKET PARTS BY BRAND (§3.1 section 6)
      ======================================================== */}
      <section className="py-16 bg-slate-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                {isAr ? 'الماركات والمصنعين' : 'Global Equipment Manufacturers'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {isAr ? 'قطع الغيار البديلة حسب الماركة العالمية' : 'Find Aftermarket Parts by Brand'}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {isAr
                  ? 'مكونات مصنعة بأعلى معايير الجودة لتلائم مواصفات كبرى شركات المعدات الثقيلة في العالم'
                  : 'Certified replacement components engineered for the world’s leading heavy machinery brands'}
              </p>
            </div>

            <Link
              href="/products"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>{isAr ? 'عرض كافة الماركات A–Z' : 'View All Brands A–Z'}</span>
              <ArrowRight className={`h-3.5 w-3.5 ${isAr ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          {/* 6 Columns Desktop, 3 Mobile (§3.1 section 6) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {brandButtons.map((brand) => (
              <Link
                key={brand.query}
                href={`/products?search=${encodeURIComponent(brand.query)}`}
                className="group flex flex-col justify-between p-4 rounded-xl border border-border bg-white hover:border-primary hover:shadow-e2 transition-all duration-200"
              >
                <div>
                  <div className="h-10 flex items-center justify-center font-black text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors text-center font-mono">
                    {brand.name}
                  </div>
                </div>
                <div className="pt-2 border-t border-border/60 text-center">
                  <span className="text-[10px] text-muted-foreground font-mono font-medium block">
                    {brand.oemCount}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          6. SECTION 7: FIND PARTS BY MACHINE (§3.1 section 7)
      ======================================================== */}
      <section className="py-16 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
              {isAr ? 'تصنيفات المعدات والآليات' : 'Machinery & Equipment Fleet'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {isAr ? 'البحث عن القطع حسب نوع الآلية والمعدة' : 'Find Parts by Machine Type'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {isAr
                ? 'حدد صنف معدتك لاستعراض كافة منظومات الهيدروليك والمحركات والهيكل السفلي المناسبة لها'
                : 'Browse targeted components filtered specifically for your machine category'}
            </p>
          </div>

          {/* Machine Type Technical Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {machineTypes.map((mach, idx) => (
              <Link
                key={idx}
                href={`/products?search=${encodeURIComponent(mach.query)}`}
                className="group p-5 rounded-2xl border border-border bg-white hover:border-primary hover:shadow-e2 transition-all flex flex-col items-center text-center space-y-2.5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-primary border border-blue-100 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                  <SlidersHorizontal className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {isAr ? mach.titleAr : mach.titleEn}
                  </h3>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    {mach.desc}
                  </span>
                </div>
              </Link>
            ))}

            {/* View All Tile */}
            <Link
              href="/products"
              className="group p-5 rounded-2xl border-2 border-dashed border-border hover:border-primary bg-muted/30 transition-all flex flex-col items-center justify-center text-center space-y-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ArrowRight className={`h-5 w-5 ${isAr ? 'rotate-180' : ''}`} />
              </div>
              <span className="text-xs font-bold text-primary">
                {isAr ? 'كافة أنواع الآليات' : 'View All Equipment'}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          FAST-MOVING INVENTORY & MUST BUY (Connected to Live API)
      ======================================================== */}
      {fastMovingParts.length > 0 && (
        <section className="py-16 bg-slate-50 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold font-mono mb-2">
                  <Flame className="h-3.5 w-3.5 text-rose-600 fill-rose-600" />
                  <span>HIGH-DEMAND FLEET REPAIR</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {isAr ? 'قطع غيار الآليات الثقيلة سريعة الحركة' : 'Fast-Moving Aftermarket Heavy Parts'}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {isAr
                    ? 'مكونات مجربة ميدانياً مع مخزون فوري معتمد وجاهز للإرسال المباشر للمحاجر ومواقع العمل'
                    : 'Jobsite-tested OEM replacements ready for immediate dispatch from our regional hubs'}
                </p>
              </div>

              <Link
                href="/products?productSort=salesCount_desc"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>{isAr ? 'عرض كامل المخزون المتوفر' : 'View Complete Stock'}</span>
                <ArrowRight className={`h-3.5 w-3.5 ${isAr ? 'rotate-180' : ''}`} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {fastMovingParts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          7. SECTION 8: WHAT OUR CUSTOMERS ARE SAYING (§3.1 section 8)
      ======================================================== */}
      <ReviewsSection />

      {/* ========================================================
          8. SECTION 9: WHY TAKE PRIDE IN WHAT WE DO (§3.1 section 9)
      ======================================================== */}
      <PrideEditorialSection />

      {/* ========================================================
          9. SECTION 10: COMMUNITY BANNER (§3.1 section 10)
      ======================================================== */}
      <CommunityBanner />

      {/* ========================================================
          10. SECTION 11: OFFERS PAIR (§3.1 section 11)
      ======================================================== */}
      <PromoPairSection />

      {/* ========================================================
          11. SECTION 12: MORE REASONS TO LOVE US / BLOG (§3.1 section 12)
      ======================================================== */}
      <BlogArticlesSection />

      {/* ========================================================
          12. SECTION 13: COUPON NEWSLETTER STRIP (§3.1 section 13)
      ======================================================== */}
      <NewsletterSection />
    </div>
  );
}
