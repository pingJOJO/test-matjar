'use client';

import React from 'react';
import Link from 'next/link';
import {
  PhoneCall,
  Mail,
  MapPin,
  Truck,
  ShieldCheck,
  Clock,
  Lock,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { useLanguageStore } from '@/stores/useLanguageStore';

export function Footer() {
  const { lang, dir } = useLanguageStore();
  const isAr = lang === 'ar';

  return (
    <footer className="border-t border-border bg-[#0A192F] text-white" dir={dir}>
      {/* 1. Upper Features / Value Strip */}
      <div className="border-b border-slate-800 bg-[#0D2340] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-[#60A5FA] border border-blue-400/20">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100">
                  {isAr ? 'شحن مباشر للمواقع والمحاجر' : 'Direct Jobsite Freight'}
                </h4>
                <p className="text-slate-400 mt-0.5">
                  {isAr ? 'إرسال عاجل لمواقع الإنشاءات ومخيمات التعدين' : 'Fast dispatch to construction sites & mining fleets'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-[#60A5FA] border border-blue-400/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100">
                  {isAr ? 'مطابقة 100% لأبعاد OEM' : '100% OEM Compatibility'}
                </h4>
                <p className="text-slate-400 mt-0.5">
                  {isAr ? 'فحص دقيق لتوافق الأبعاد وجودة السبائك' : 'Strict quality & dimensional interchange verified'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-[#60A5FA] border border-blue-400/20">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100">
                  {isAr ? 'ضمان شامل لمدة عام' : '1-Year Full Warranty'}
                </h4>
                <p className="text-slate-400 mt-0.5">
                  {isAr ? 'راحة بال تامة وتغطية شاملة لكافة القطع' : 'Comprehensive peace of mind on all parts'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-[#60A5FA] border border-blue-400/20">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100">
                  {isAr ? 'مهندسو معدات متخصصون' : 'Heavy Equipment Engineers'}
                </h4>
                <p className="text-slate-400 mt-0.5 font-mono">
                  +1-800-A2Z-PART (24/7 Helpline)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Link Clusters (§2.5) */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info & Google Rating */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D5CB6] text-white font-black text-xl shadow-inner">
                A2Z
              </div>
              <div>
                <span className="text-xl font-black text-white">A2Z</span>
                <span className="text-xl font-bold text-[#FFB800] ms-1">PARTS</span>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  Heavy Equipment Fleet
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr
                ? 'موزعك المباشر لقطع الغيار البديلة المعتمدة للمعدات الثقيلة لكوماتسو، كاتربيلر، كوبوتا، جون دير، بوبكات، وكمنز.'
                : 'Your premier direct distributor for heavy machinery aftermarket replacement parts. Specializing in excavators, wheel loaders, bulldozers, and diesel engines.'}
            </p>

            {/* Google Rating Badge */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white font-mono">4.4 / 5.0</span>
                <div className="flex text-[#FFB800]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-[#FFB800]" />
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Google Store Rating (3,840 reviews)</div>
            </div>
          </div>

          {/* Cluster 1: Shop */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-blue-300 border-b border-slate-800 pb-1">
              {isAr ? 'التسوق والكتالوج' : 'Shop'}
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li><Link href="/products" className="hover:text-[#FFB800] transition-colors">All Categories</Link></li>
              <li><Link href="/products" className="hover:text-[#FFB800] transition-colors">All Brands A–Z</Link></li>
              <li><Link href="/products" className="hover:text-[#FFB800] transition-colors">All Equipment Types</Link></li>
              <li><Link href="/products?productSort=salesCount_desc" className="hover:text-[#FFB800] transition-colors">Must Buy (Hot Parts)</Link></li>
              <li><Link href="/#pro-fleet" className="hover:text-[#FFB800] transition-colors">Clearance & Deals</Link></li>
              <li><Link href="/products?search=Battery" className="hover:text-[#FFB800] transition-colors">Heavy Batteries & Starters</Link></li>
            </ul>
          </div>

          {/* Cluster 2: Support */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-blue-300 border-b border-slate-800 pb-1">
              {isAr ? 'الدعم الفني والخدمات' : 'Support'}
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="tel:+18002297278" className="hover:text-[#FFB800] transition-colors">Contact a Parts Specialist</a></li>
              <li><Link href="/checkout" className="hover:text-[#FFB800] transition-colors">Track Order Status</Link></li>
              <li><Link href="/#trust-bar" className="hover:text-[#FFB800] transition-colors">Jobsite Freight Rates</Link></li>
              <li><Link href="/#trust-bar" className="hover:text-[#FFB800] transition-colors">90-Day Returns Policy</Link></li>
              <li><Link href="/#trust-bar" className="hover:text-[#FFB800] transition-colors">1-Year Warranty Terms</Link></li>
              <li><Link href="/#trust-bar" className="hover:text-[#FFB800] transition-colors">Certified VAT Tax Invoicing</Link></li>
            </ul>
          </div>

          {/* Cluster 3: Member Club */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-blue-300 border-b border-slate-800 pb-1">
              {isAr ? 'نادي الأعضاء والشركات' : 'Member Club'}
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li><Link href="/#member-club" className="hover:text-[#FFB800] transition-colors">Personal Membership (2-5% Points)</Link></li>
              <li><Link href="/#pro-fleet" className="hover:text-[#FFB800] transition-colors">A2Z PRO Fleet (Up to 10% Off)</Link></li>
              <li><Link href="/#pro-fleet" className="hover:text-[#FFB800] transition-colors">Contractor Credit & Net 30</Link></li>
              <li><Link href="/#pro-fleet" className="hover:text-[#FFB800] transition-colors">Volume Tier Discounts</Link></li>
              <li><Link href="/#pro-fleet" className="hover:text-[#FFB800] transition-colors">Fleet Account Manager</Link></li>
            </ul>
          </div>

          {/* Cluster 4: Company & Legal */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-blue-300 border-b border-slate-800 pb-1">
              {isAr ? 'الشركة والسياسات' : 'Company & Legal'}
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li><Link href="/#trust-bar" className="hover:text-[#FFB800] transition-colors">About A2Z Parts Inc.</Link></li>
              <li><Link href="/#trust-bar" className="hover:text-[#FFB800] transition-colors">UPS Green Sustainability</Link></li>
              <li><Link href="/#trust-bar" className="hover:text-[#FFB800] transition-colors">Trade Shows (Bauma & ConExpo)</Link></li>
              <li><Link href="/#trust-bar" className="hover:text-[#FFB800] transition-colors">Field Maintenance Blog</Link></li>
              <li><Link href="/#trust-bar" className="hover:text-[#FFB800] transition-colors">Privacy & Cookie Policy</Link></li>
              <li><Link href="/#trust-bar" className="hover:text-[#FFB800] transition-colors">Terms & Conditions of Sale</Link></li>
            </ul>
          </div>
        </div>

        {/* 3. SEO Link Silos (§2.5) */}
        <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          {/* Silo 1: Popular Brands */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Popular Machinery Brands (12)
            </h5>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-400 text-[11px]">
              {['Caterpillar (CAT)', 'Komatsu', 'Kubota', 'John Deere', 'Bobcat', 'Cummins', 'Yanmar', 'Volvo CE', 'Hitachi', 'Perkins', 'Deutz', 'Doosan'].map((b) => (
                <Link key={b} href={`/products?search=${encodeURIComponent(b.split(' ')[0])}`} className="hover:text-[#FFB800] transition-colors">
                  {b}
                </Link>
              ))}
            </div>
          </div>

          {/* Silo 2: Popular Equipment */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Popular Equipment Types (8)
            </h5>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-400 text-[11px]">
              {['Excavators', 'Wheel Loaders', 'Bulldozers', 'Skid Steer Loaders', 'Tractors', 'Diesel Gensets', 'Forklifts', 'Scissor Lifts'].map((eq) => (
                <Link key={eq} href={`/products?search=${encodeURIComponent(eq.split(' ')[0])}`} className="hover:text-[#FFB800] transition-colors">
                  {eq}
                </Link>
              ))}
            </div>
          </div>

          {/* Silo 3: Popular Parts */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Popular Aftermarket Parts (12)
            </h5>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-400 text-[11px]">
              {['Fuel Injectors', 'Hydraulic Pumps', 'Water Pumps', 'Turbochargers', 'Track Rollers', 'Starter Motors', 'Alternators', 'Engine Overhaul Kits', 'Oil Filters', 'Final Drive Motors', 'Control Valves', 'Bucket Teeth'].map((pt) => (
                <Link key={pt} href={`/products?search=${encodeURIComponent(pt)}`} className="hover:text-[#FFB800] transition-colors">
                  {pt}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 4. OEM Disclaimer (§2.5) */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <p>
            <strong>Disclaimer:</strong> A2Z Parts Inc. is an independent global supplier of high-quality replacement aftermarket parts. All manufacturer names, symbols, brand names (such as Caterpillar, CAT, Komatsu, Bobcat, JCB, Cummins, Kubota, Yanmar, Volvo, John Deere), and OEM part numbers are used strictly for reference and equipment identification purposes only. A2Z Parts is not affiliated with, endorsed by, or sponsored by these equipment manufacturers.
          </p>
        </div>

        {/* 5. Payments, Security & Legal Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            &copy; {new Date().getFullYear()} A2Z Parts Inc. All rights reserved. Precision Heavy Equipment Aftermarket Solutions.
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit SSL Encrypted Checkout</span>
            </span>
            <span>•</span>
            <span className="font-bold text-blue-300">VISA · MASTERCARD · AMEX · PAYPAL · APPLE PAY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
