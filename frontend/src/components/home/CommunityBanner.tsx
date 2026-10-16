'use client';

import React from 'react';
import Link from 'next/link';
import { Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { Button } from '@/components/ui/button';

export function CommunityBanner() {
  const { lang, dir } = useLanguageStore();
  const isAr = lang === 'ar';

  return (
    <section className="bg-gradient-to-r from-[#0D5CB6] to-[#0A3D78] text-white py-10" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-[#FFB800]">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-blue-200 text-[10px] font-mono uppercase tracking-wider mb-1">
                <span>HEAVY FLEET & CONTRACTOR COMMUNITY</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">
                {isAr
                  ? 'انضم إلى مجتمع مهندسي وفنيي المعدات الثقيلة'
                  : 'Join 15,000+ Heavy Machinery Equipment Operators'}
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
                {isAr
                  ? 'تبادل نصائح الصيانة الميدانية، حلول أكواد الأعطال، ومخططات تركيب قطع الغيار مع مهندسين معتمدين'
                  : 'Troubleshoot diagnostic codes, share repair blueprints, and access exclusive group bulk discounts'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link href="/#pro-fleet">
              <Button
                variant="royal"
                size="lg"
                className="bg-[#FFB800] hover:bg-[#F0AA00] text-slate-950 font-black text-xs sm:text-sm h-11 px-6 shadow-md cursor-pointer gap-2"
              >
                <span>{isAr ? 'الانضمام لمجتمع المقاولين' : 'Join Contractor Group'}</span>
                <ArrowRight className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
