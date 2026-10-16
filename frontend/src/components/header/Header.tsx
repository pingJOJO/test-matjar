'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  PhoneCall,
  User,
  Globe,
  ChevronDown,
  Menu,
  X,
  Truck,
  ShieldCheck,
  Wrench,
  Flame,
  Check,
  Coins,
  MapPin,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  LogOut,
  Package,
  AlertCircle,
} from 'lucide-react';
import { useCartStore } from '@/stores/useCartStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { useCurrencyStore, SUPPORTED_CURRENCIES, CurrencyCode } from '@/stores/useCurrencyStore';
import { useMachineStore } from '@/stores/useMachineStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { PartFinderModal } from '@/components/navigation/PartFinderModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function Header() {
  const router = useRouter();

  // Stores
  const { totalQuantity, openCart } = useCartStore();
  const { lang, dir, toggleLanguage, t } = useLanguageStore();
  const { currency, setCurrency } = useCurrencyStore();
  const { activeMachine, clearActiveMachine, setFinderOpen } = useMachineStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const isAr = lang === 'ar';

  // State
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [brandsMenuOpen, setBrandsMenuOpen] = useState(false);
  const [equipmentMenuOpen, setEquipmentMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [shipToMenuOpen, setShipToMenuOpen] = useState(false);
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<'US' | 'SA' | 'AE' | 'JO'>('US');
  const [accessDeniedAlert, setAccessDeniedAlert] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('denied') === '1' || params.get('error') === 'access_denied') {
        setAccessDeniedAlert(true);
      }
    }
  }, []);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const currencyMenuRef = useRef<HTMLDivElement>(null);
  const shipToMenuRef = useRef<HTMLDivElement>(null);
  const accountPopoverRef = useRef<HTMLDivElement>(null);

  // Rotating Announcements (§2.1 Band 0)
  const announcements = [
    {
      en: 'Direct Jobsite Freight on Orders Over $150 · Fast USA & Gulf Dispatch',
      ar: 'شحن مباشر ومجاني لمواقع العمل للمشتريات فوق $150 · إرسال سريع للمحاجر والمشاريع',
    },
    {
      en: '100% OEM Compatibility Guaranteed · Strict Dimensional Tolerances',
      ar: 'مطابقة تامة لأبعاد ومواصفات مصنع OEM بنسبة 100% مع ضمان استبدال',
    },
    {
      en: '1-Year Full Replacement Warranty on All Hydraulic Pumps & Turbochargers',
      ar: 'ضمان استبدال شامل لمدة عام على كافة طلمبات الهيدروليك وشواحن التيربو',
    },
  ];

  // Rotate announcements every 6s
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  // Click outside listeners
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target as Node)) {
        setCurrencyMenuOpen(false);
      }
      if (shipToMenuRef.current && !shipToMenuRef.current.contains(event.target as Node)) {
        setShipToMenuOpen(false);
      }
      if (accountPopoverRef.current && !accountPopoverRef.current.contains(event.target as Node)) {
        setAccountPopoverOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
      setMobileMenuOpen(false);
    }
  };

  const handleSuggestionClick = (query: string) => {
    setSearchQuery(query);
    setSearchFocused(false);
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  // 9 Top-Level Category groups from §2.3
  const categoryTaxonomy = [
    {
      titleEn: 'Engine Spare Parts',
      titleAr: 'قطع غيار المحركات',
      slug: 'cat-diesel-engines',
      items: [
        'Injectors & Nozzles',
        'Fuel Injection Pumps',
        'Water Pumps & Cooling',
        'Turbochargers',
        'Cylinder Heads & Blocks',
        'Overhaul Rebuild Kits',
        'Crankshafts & Camshafts',
        'Oil Pumps & Coolers',
      ],
    },
    {
      titleEn: 'Hydraulic & Pneumatic Parts',
      titleAr: 'الهيدروليك والنيوماتيك',
      slug: 'hydraulics-systems',
      items: [
        'Main Hydraulic Pumps',
        'Final Drive Travel Motors',
        'Swing Motors & Gearboxes',
        'Main Control Valves',
        'Hydraulic Cylinders',
        'Hydraulic Seal Kits',
      ],
    },
    {
      titleEn: 'Transmission & Undercarriage',
      titleAr: 'الهيكل السفلي والجنازير',
      slug: 'undercarriage-tracks',
      items: [
        'Track Rollers (Bottom/Top)',
        'Drive Sprockets',
        'Front Idlers',
        'Rubber & Steel Tracks',
        'Track Link Assemblies',
        'Transmission Friction Plates',
      ],
    },
    {
      titleEn: 'Electrical Parts',
      titleAr: 'المنظومة الكهربائية',
      slug: 'electrical',
      items: [
        'Starter Motors (12V/24V)',
        'Heavy Alternators',
        'Electronic Control Modules (ECM)',
        'Pressure & Temp Sensors',
        'Solenoid Valves',
        'Wiring Harnesses',
      ],
    },
    {
      titleEn: 'Seals, Filters & Maintenance',
      titleAr: 'الفلاتر والصيانة',
      slug: 'filtration-lubricants',
      items: [
        'Fuel & Water Separators',
        'Engine Oil Filters',
        'Hydraulic Return Filters',
        'Air Intake Cleaners',
        'O-Ring Service Kits',
        'Gasket Kits',
      ],
    },
    {
      titleEn: 'Cab, Body & Buckets',
      titleAr: 'الكابينة والأسنان',
      slug: 'boom-bucket-parts',
      items: [
        'Bucket Teeth & Adapters',
        'Side Cutters & Cutting Edges',
        'Bucket Pins & Bushings',
        'Cab Glass & Windows',
        'Operator Seats',
        'Hydraulic Joysticks',
      ],
    },
    {
      titleEn: 'HVAC & Air Conditioning',
      titleAr: 'التكييف والتبريد',
      slug: 'cooling-hvac',
      items: [
        'AC Compressors (12V/24V)',
        'Condensers & Evaporators',
        'Blower Motors & Fans',
        'Receiver Driers & Expansion',
      ],
    },
    {
      titleEn: 'Tools & Diagnostics',
      titleAr: 'العدد والفحص',
      slug: 'tools',
      items: [
        'Electronic Diagnostic Adapters',
        'Hydraulic Pressure Test Kits',
        'Heavy Torque Wrenches',
        'Grease Guns & Injectors',
      ],
    },
  ];

  const topBrands = [
    'Caterpillar',
    'Komatsu',
    'Kubota',
    'John Deere',
    'Bobcat',
    'JCB',
    'Cummins',
    'Yanmar',
    'Volvo CE',
    'Hitachi',
    'Perkins',
    'Deutz',
    'Doosan',
    'Case',
    'Isuzu',
    'Hyundai',
  ];

  const equipmentTypes = [
    { titleEn: 'Excavators', titleAr: 'حفارات هيدروليكية', query: 'Excavator' },
    { titleEn: 'Wheel Loaders', titleAr: 'لوادر عجلات ومجنزرة', query: 'Loader' },
    { titleEn: 'Bulldozers', titleAr: 'بلدوزرات تسوية', query: 'Dozer' },
    { titleEn: 'Compact Loaders / Skid Steer', titleAr: 'بوبكات ولوادر مدمجة', query: 'Bobcat' },
    { titleEn: 'Tractors & Agriculture', titleAr: 'جرارات زراعية', query: 'Tractor' },
    { titleEn: 'Diesel Engines & Gensets', titleAr: 'محركات ديزل ومولدات', query: 'Engine' },
    { titleEn: 'Forklifts & Telehandlers', titleAr: 'رافعات شوكية وتيلي هاندلر', query: 'Forklift' },
    { titleEn: 'Aerial Lifts & Scissor Lifts', titleAr: 'منصات رفع هيدروليكية', query: 'Lift' },
    { titleEn: 'Transport Refrigeration', titleAr: 'تبريد النقل والشاحنات', query: 'Reefer' },
    { titleEn: 'Marine & Industrial', titleAr: 'محركات بحرية وصناعية', query: 'Marine' },
  ];

  return (
    <>
      <PartFinderModal />

      {accessDeniedAlert && (
        <div className="bg-rose-600 text-white text-xs py-2 px-4 shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-white" />
              <span className="font-bold">
                {isAr
                  ? 'غير مصرح لك بدخول لوحة الإدارة (Access Denied) - هذه الصفحة مخصصة لمدراء النظام والمشرفين فقط.'
                  : 'Access Denied: The admin dashboard is restricted to authorized administrator accounts only.'}
              </span>
            </div>
            <button
              onClick={() => setAccessDeniedAlert(false)}
              className="text-white hover:text-rose-200 p-1 cursor-pointer"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full shadow-e1 font-sans bg-white border-b border-border" dir={dir}>
        {/* ========================================================
            BAND 0: ANNOUNCEMENT BAR (36px, --ink background)
        ======================================================== */}
        {!announcementDismissed && (
          <div className="bg-[#111827] text-white text-xs h-9 px-4 border-b border-slate-800 flex items-center justify-between">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
              {/* Rotating Announcement */}
              <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                <Truck className="h-3.5 w-3.5 text-[#FFB800] shrink-0" />
                <span className="text-slate-200 transition-opacity duration-300 font-medium">
                  {isAr ? announcements[announcementIndex].ar : announcements[announcementIndex].en}
                </span>
              </div>

              {/* Utility shortcuts: Ship-To, Currency, Language */}
              <div className="hidden md:flex items-center gap-4 text-slate-300 text-[11px]">
                {/* Ship-To Country Selector */}
                <div className="relative" ref={shipToMenuRef}>
                  <button
                    onClick={() => setShipToMenuOpen(!shipToMenuOpen)}
                    className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <MapPin className="h-3 w-3 text-[#FFB800]" />
                    <span>Ship to: <strong className="text-white">{selectedCountry}</strong></span>
                    <ChevronDown className="h-2.5 w-2.5" />
                  </button>

                  {shipToMenuOpen && (
                    <div className="absolute top-full mt-1.5 right-0 z-50 w-44 rounded-lg bg-white text-slate-900 shadow-e3 border border-border p-1.5 text-xs">
                      <div className="font-bold text-[10px] text-muted-foreground uppercase px-2 py-1">
                        Select Destination
                      </div>
                      {(['US', 'SA', 'AE', 'JO'] as const).map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setSelectedCountry(c);
                            setShipToMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                            selectedCountry === c ? 'bg-primary-subtle text-primary font-bold' : 'hover:bg-muted'
                          }`}
                        >
                          <span>{c === 'US' ? 'United States (US)' : c === 'SA' ? 'Saudi Arabia (SA)' : c === 'AE' ? 'United Arab Emirates (AE)' : 'Jordan (JO)'}</span>
                          {selectedCountry === c && <Check className="h-3.5 w-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span>•</span>

                {/* Currency Quick Switcher */}
                <div className="relative" ref={currencyMenuRef}>
                  <button
                    onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)}
                    className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <Coins className="h-3 w-3 text-emerald-400" />
                    <span>Currency: <strong className="text-white font-mono">{currency}</strong></span>
                    <ChevronDown className="h-2.5 w-2.5" />
                  </button>

                  {currencyMenuOpen && (
                    <div className="absolute top-full mt-1.5 right-0 z-50 w-48 rounded-lg bg-white text-slate-900 shadow-e3 border border-border p-1.5 text-xs">
                      {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                        <button
                          key={c.code}
                          onClick={() => {
                            setCurrency(c.code as CurrencyCode);
                            setCurrencyMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                            currency === c.code ? 'bg-primary-subtle text-primary font-bold' : 'hover:bg-muted'
                          }`}
                        >
                          <span className="font-mono">{c.code} ({isAr ? c.symbolAr : c.symbolEn})</span>
                          {currency === c.code && <Check className="h-3.5 w-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span>•</span>

                {/* Language Switcher */}
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Globe className="h-3 w-3 text-blue-400" />
                  <span className="font-semibold">{lang === 'ar' ? 'English (LTR)' : 'العربية (RTL)'}</span>
                </button>

                {/* Dismiss button */}
                <button
                  onClick={() => setAnnouncementDismissed(true)}
                  className="text-slate-400 hover:text-white ms-2"
                  aria-label="Dismiss banner"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            BAND 1: MAIN BAR (Logo, Select Model, Search, Cart)
        ======================================================== */}
        <div className="bg-[#0D5CB6] text-white py-3.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0D5CB6] font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                A2Z
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black text-white tracking-tight">A2Z</span>
                  <span className="text-xl font-bold text-[#FFB800]">PARTS</span>
                </div>
                <div className="text-[10px] text-blue-100 font-mono tracking-wider uppercase font-semibold hidden sm:block">
                  Heavy Machinery Aftermarket Fleet
                </div>
              </div>
            </Link>

            {/* Select Model Trigger (§4.1 Active Machine Chip) */}
            <div className="hidden sm:flex shrink-0">
              {activeMachine ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400 text-white text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono">Fits: {activeMachine.label}</span>
                  <button
                    onClick={clearActiveMachine}
                    className="p-0.5 text-white/70 hover:text-white hover:bg-emerald-600/50 rounded"
                    aria-label="Clear active machine"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <Button
                  onClick={() => setFinderOpen(true)}
                  variant="royalOutline"
                  size="sm"
                  className="bg-white text-[#0D5CB6] hover:bg-blue-50 border-white h-10 px-3.5 text-xs font-bold shadow-sm cursor-pointer gap-2"
                >
                  <Wrench className="h-4 w-4 text-[#0D5CB6]" />
                  <span>{isAr ? 'اختر الآلية والموديل' : 'Select Model'}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              )}
            </div>

            {/* Global Search Combobox (§2.2) */}
            <div className="flex-1 max-w-2xl relative" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className={`absolute ${isAr ? 'right-3.5' : 'left-3.5'} h-4 w-4 text-slate-400 pointer-events-none`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder={
                    isAr
                      ? 'ابحث برقم القطعة OEM، الماركة (CAT, Komatsu)، أو موديل المعدة...'
                      : 'Search by part number, OEM number or machine model...'
                  }
                  className={`w-full h-11 rounded-xl bg-white text-slate-900 text-xs sm:text-sm shadow-inner placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFB800] transition-all ${
                    isAr ? 'pr-10 pl-24' : 'pl-10 pr-24'
                  }`}
                />

                {/* Clear button if text */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className={`absolute ${isAr ? 'left-20' : 'right-20'} p-1 text-slate-400 hover:text-slate-700 cursor-pointer`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                <Button
                  type="submit"
                  variant="royal"
                  size="sm"
                  className={`absolute ${isAr ? 'left-1' : 'right-1'} h-9 px-4 bg-[#0A192F] hover:bg-slate-800 text-white font-bold text-xs rounded-lg`}
                >
                  {isAr ? 'بحث' : 'Search'}
                </Button>
              </form>

              {/* Categorized Suggestions Panel (§2.2) */}
              {searchFocused && (
                <div
                  className="absolute top-full mt-2 left-0 right-0 z-50 bg-white rounded-xl shadow-e3 border border-border overflow-hidden text-slate-900 text-xs animate-in fade-in duration-150"
                  dir={dir}
                >
                  {searchQuery.trim() ? (
                    <div className="divide-y divide-border">
                      {/* 1. Exact OEM Match */}
                      <div className="p-3 bg-blue-50/60">
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1.5">
                          {isAr ? 'مطابقة رقم OEM دقيقة' : 'Exact OEM Part Hit'}
                        </span>
                        <button
                          onClick={() => handleSuggestionClick(searchQuery.trim())}
                          className="w-full flex items-center justify-between text-left hover:text-primary font-mono font-bold text-sm"
                        >
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-primary" />
                            OEM: {searchQuery.trim().toUpperCase()}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-sans">
                            {isAr ? 'عرض المنتج وبدائله' : 'View exact cross-reference'}
                          </span>
                        </button>
                      </div>

                      {/* 2. Products Matching */}
                      <div className="p-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                          {isAr ? 'المنتجات والمنظومات' : 'Product Matches'}
                        </span>
                        <div className="space-y-1">
                          {['Fuel Injector Assembly', 'Main Hydraulic Pump', 'Turbocharger Cartridge'].map((p) => (
                            <button
                              key={p}
                              onClick={() => handleSuggestionClick(`${searchQuery} ${p}`)}
                              className="w-full text-left py-1 px-2 rounded-md hover:bg-muted flex items-center justify-between"
                            >
                              <span>{searchQuery} - {p}</span>
                              <ChevronDown className="h-3 w-3 text-muted-foreground -rotate-90" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. Machine Models */}
                      <div className="p-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                          {isAr ? 'موديلات الآليات المتوافقة' : 'Equipment Models'}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {['PC200-8', '320D', 'KX080-4', 'S185', '3CX'].map((m) => (
                            <button
                              key={m}
                              onClick={() => handleSuggestionClick(m)}
                              className="px-2.5 py-1 rounded bg-muted hover:bg-primary-subtle hover:text-primary font-mono font-semibold"
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Empty query: Recent searches & Popular categories */
                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                          {isAr ? 'عمليات البحث الأكثر طلباً بالمستودع:' : 'Popular Equipment & Parts Searches:'}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'Komatsu PC200-8 Water Pump',
                            'CAT 320D Injector RE529118',
                            'Kubota KX080-4 Starter',
                            'Bobcat S185 Hydraulic Valve',
                            'Cummins 6BT Oil Cooler',
                          ].map((term) => (
                            <button
                              key={term}
                              onClick={() => handleSuggestionClick(term)}
                              className="px-2.5 py-1 rounded-md bg-muted hover:bg-primary-subtle hover:text-primary text-xs transition-colors"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Action Icons (Contact, Account, Cart) */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Emergency Hotline Helpline */}
              <a
                href="tel:+18002297278"
                className="hidden xl:flex items-center gap-2 text-white hover:text-[#FFB800] transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700/60 border border-blue-400/30">
                  <PhoneCall className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-[11px] leading-tight">
                  <span className="text-blue-200 block">{isAr ? 'استشارة مهندسي القطع' : 'Parts Specialist'}</span>
                  <span className="font-bold font-mono">+1-800-A2Z-PART</span>
                </div>
              </a>

              {/* Account Dropdown & Popover */}
              <div className="relative" ref={accountPopoverRef}>
                <button
                  type="button"
                  onClick={() => setAccountPopoverOpen(!accountPopoverOpen)}
                  className={`flex items-center gap-1.5 p-2 rounded-lg transition-colors text-white text-xs font-semibold cursor-pointer ${
                    accountPopoverOpen ? 'bg-blue-800' : 'hover:bg-blue-700/60'
                  }`}
                  aria-label="Account menu"
                  aria-expanded={accountPopoverOpen}
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">
                    {isAuthenticated && user
                      ? user.firstName || user.email.split('@')[0]
                      : isAr
                      ? 'حسابي'
                      : 'Account'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </button>

                {/* Account Popover Menu */}
                {accountPopoverOpen && (
                  <div
                    className={`absolute top-full mt-2 ${
                      isAr ? 'left-0' : 'right-0'
                    } z-50 w-72 sm:w-80 rounded-xl bg-white text-slate-900 shadow-e3 border border-slate-200 p-5 text-xs animate-in fade-in zoom-in-95 duration-150`}
                    dir={dir}
                  >
                    {isAuthenticated && user ? (
                      /* Authenticated User Menu */
                      <div className="space-y-3">
                        <div className="pb-3 border-b border-slate-100 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#0D5CB6] text-white flex items-center justify-center font-bold text-base shrink-0 overflow-hidden">
                            {user.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.avatarUrl}
                                alt={user.firstName || user.email}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              (user.firstName?.[0] || user.email[0]).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 truncate text-sm">
                              {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email.split('@')[0]}
                            </div>
                            <div className="text-slate-500 text-[11px] truncate font-mono">
                              {user.email}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1 font-semibold">
                          <Link
                            href="/orders"
                            onClick={() => setAccountPopoverOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-primary transition-colors"
                          >
                            <Package className="h-4 w-4 text-slate-400" />
                            <span>{isAr ? 'طلباتي والشحنات' : 'My Orders & Shipments'}</span>
                          </Link>

                          {user.role === 'ADMIN' && (
                            <Link
                              href="/admin"
                              onClick={() => setAccountPopoverOpen(false)}
                              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 hover:bg-amber-500/20 font-bold transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-amber-600" />
                                <span>{isAr ? 'لوحة الإدارة (Admin Dashboard)' : 'Admin Dashboard'}</span>
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-black uppercase">
                                ADMIN
                              </span>
                            </Link>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={async () => {
                              await logout();
                              setAccountPopoverOpen(false);
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold transition-colors cursor-pointer"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Guest Visitor Popover (§ Exact Industrial Spec) */
                      <div className="space-y-3">
                        {/* 1. Solid Yellow Button: Sign In */}
                        <Link
                          href="/login"
                          onClick={() => setAccountPopoverOpen(false)}
                          className="flex h-11 w-full items-center justify-center rounded-lg bg-[#FFB800] hover:bg-[#F0AA00] text-slate-950 font-bold text-sm tracking-wide transition-colors shadow-xs"
                        >
                          {isAr ? 'تسجيل الدخول' : 'Sign In'}
                        </Link>

                        {/* 2. Outlined Yellow Button: Register & Get US$5 Off */}
                        <Link
                          href="/register"
                          onClick={() => setAccountPopoverOpen(false)}
                          className="flex h-11 w-full items-center justify-center rounded-lg border-2 border-[#FFB800] text-[#B45309] hover:bg-amber-50 font-bold text-sm transition-colors shadow-xs"
                        >
                          {isAr ? 'تسجيل جديد واحصل على خصم $5' : 'Register & Get US$5 Off'}
                        </Link>

                        {/* 3. Elegant Gray Divider: OR */}
                        <div className="relative my-3 flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                          </div>
                          <span className="relative bg-white px-3 text-slate-400 font-bold text-xs uppercase tracking-wider">
                            OR
                          </span>
                        </div>

                        {/* 4. Google Sign In Button: White with gray border and official colored SVG */}
                        <GoogleAuthButton
                          label="Google"
                          onSuccess={() => setAccountPopoverOpen(false)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Shopping Cart Drawer Trigger */}
              <button
                onClick={openCart}
                className="relative flex items-center gap-2 p-2 rounded-xl bg-[#FFB800] text-slate-950 font-bold hover:bg-[#F0AA00] transition-all shadow-md cursor-pointer"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline text-xs font-black">
                  {isAr ? 'السلة' : 'Cart'}
                </span>
                {totalQuantity > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-black text-white font-mono shadow-xs">
                    {totalQuantity}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            BAND 2: PRIMARY NAVIGATION BAR (Mega Menu, Brands, Equipment)
        ======================================================== */}
        <div className="hidden lg:block bg-white text-slate-900 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-bold">
            <nav className="flex items-center gap-1" aria-label="Primary navigation">
              {/* Category Mega Menu Trigger */}
              <div
                className="relative"
                onMouseEnter={() => setCategoryMenuOpen(true)}
                onMouseLeave={() => setCategoryMenuOpen(false)}
              >
                <button
                  onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                  className={`flex items-center gap-1.5 py-3 px-3.5 transition-colors cursor-pointer ${
                    categoryMenuOpen ? 'text-primary bg-muted' : 'text-slate-900 hover:text-primary'
                  }`}
                >
                  <Layers className="h-4 w-4 text-primary" />
                  <span>{isAr ? 'كافة الأصناف والمنظومات' : 'Category'}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>

                {/* Mega Menu Dropdown (§2.3) */}
                {categoryMenuOpen && (
                  <div className="absolute top-full left-0 z-50 w-[840px] bg-white rounded-b-2xl shadow-e3 border border-border p-6 text-slate-900 animate-in fade-in duration-150">
                    <div className="grid grid-cols-4 gap-6">
                      {categoryTaxonomy.map((cat) => (
                        <div key={cat.titleEn} className="space-y-2">
                          <Link
                            href={`/products?categorySlug=${cat.slug}`}
                            onClick={() => setCategoryMenuOpen(false)}
                            className="font-bold text-slate-900 hover:text-primary block border-b border-border pb-1"
                          >
                            {isAr ? cat.titleAr : cat.titleEn}
                          </Link>
                          <ul className="space-y-1 text-[11px] text-muted-foreground font-normal">
                            {cat.items.slice(0, 5).map((sub) => (
                              <li key={sub}>
                                <Link
                                  href={`/products?search=${encodeURIComponent(sub)}`}
                                  onClick={() => setCategoryMenuOpen(false)}
                                  className="hover:text-primary transition-colors block py-0.5"
                                >
                                  {sub}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* All Brands Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setBrandsMenuOpen(true)}
                onMouseLeave={() => setBrandsMenuOpen(false)}
              >
                <button
                  onClick={() => setBrandsMenuOpen(!brandsMenuOpen)}
                  className={`flex items-center gap-1.5 py-3 px-3.5 transition-colors cursor-pointer ${
                    brandsMenuOpen ? 'text-primary bg-muted' : 'text-slate-900 hover:text-primary'
                  }`}
                >
                  <span>{isAr ? 'كافة الماركات (All Brands)' : 'All Brands'}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>

                {brandsMenuOpen && (
                  <div className="absolute top-full left-0 z-50 w-72 bg-white rounded-b-xl shadow-e3 border border-border p-3 grid grid-cols-2 gap-1.5 text-xs">
                    {topBrands.map((b) => (
                      <Link
                        key={b}
                        href={`/products?search=${encodeURIComponent(b)}`}
                        onClick={() => setBrandsMenuOpen(false)}
                        className="p-1.5 rounded hover:bg-muted font-semibold hover:text-primary transition-colors"
                      >
                        {b}
                      </Link>
                    ))}
                    <Link
                      href="/products"
                      onClick={() => setBrandsMenuOpen(false)}
                      className="col-span-2 text-center text-[11px] font-bold text-primary hover:underline pt-1 border-t border-border"
                    >
                      {isAr ? 'عرض كافة الماركات A–Z' : 'View All Brands A–Z →'}
                    </Link>
                  </div>
                )}
              </div>

              {/* All Equipment Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setEquipmentMenuOpen(true)}
                onMouseLeave={() => setEquipmentMenuOpen(false)}
              >
                <button
                  onClick={() => setEquipmentMenuOpen(!equipmentMenuOpen)}
                  className={`flex items-center gap-1.5 py-3 px-3.5 transition-colors cursor-pointer ${
                    equipmentMenuOpen ? 'text-primary bg-muted' : 'text-slate-900 hover:text-primary'
                  }`}
                >
                  <span>{isAr ? 'كافة الآليات (All Equipment)' : 'All Equipment'}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>

                {equipmentMenuOpen && (
                  <div className="absolute top-full left-0 z-50 w-80 bg-white rounded-b-xl shadow-e3 border border-border p-3 grid grid-cols-2 gap-1.5 text-xs">
                    {equipmentTypes.map((eq) => (
                      <Link
                        key={eq.titleEn}
                        href={`/products?search=${encodeURIComponent(eq.query)}`}
                        onClick={() => setEquipmentMenuOpen(false)}
                        className="p-1.5 rounded hover:bg-muted font-medium hover:text-primary transition-colors"
                      >
                        {isAr ? eq.titleAr : eq.titleEn}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Must Buy (Fast-moving high demand) */}
              <Link
                href="/products?productSort=salesCount_desc"
                className="py-3 px-3.5 text-slate-900 hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Badge variant="discount" className="text-[10px] py-0 px-1.5">HOT</Badge>
                <span>{isAr ? 'الأكثر طلباً (Must Buy)' : 'Must Buy'}</span>
              </Link>

              {/* Member Club */}
              <Link
                href="/#member-club"
                className="py-3 px-3.5 text-[#0F766E] hover:text-teal-800 transition-colors flex items-center gap-1.5"
              >
                <Flame className="h-4 w-4 text-[#FFB800] fill-[#FFB800]" />
                <span>{isAr ? 'نادي الأعضاء (Member Club)' : 'Member Club'}</span>
              </Link>

              {/* About */}
              <Link
                href="/#trust-bar"
                className="py-3 px-3.5 text-slate-600 hover:text-primary transition-colors"
              >
                {isAr ? 'عن A2Z Parts' : 'About A2Z'}
              </Link>
            </nav>

            {/* Warehouse Dispatch Tag */}
            <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>36,000+ Parts In Stock · Direct Jobsite Delivery</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            MOBILE DRAWER (Stack navigation)
        ======================================================== */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex" dir={dir}>
            <div className="w-4/5 max-w-sm bg-white h-full shadow-e4 p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2 font-black text-lg text-primary">
                  <span>A2Z PARTS</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Select Model Trigger in Mobile Menu */}
              <div>
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setFinderOpen(true);
                  }}
                  variant="royal"
                  className="w-full text-xs font-bold gap-2"
                >
                  <Wrench className="h-4 w-4" />
                  <span>{activeMachine ? `Active: ${activeMachine.label}` : (isAr ? 'اختر معدتك (Select Model)' : 'Select Equipment Model')}</span>
                </Button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 text-sm font-semibold">
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded-lg hover:bg-muted"
                >
                  {isAr ? 'كافة قطع الغيار' : 'All Parts Catalog'}
                </Link>
                <Link
                  href="/products?productSort=salesCount_desc"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded-lg hover:bg-muted text-rose-600 font-bold"
                >
                  {isAr ? 'القطع الأكثر طلباً (Must Buy)' : 'Must Buy'}
                </Link>
                <Link
                  href="/#member-club"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded-lg hover:bg-muted text-teal-700 font-bold"
                >
                  {isAr ? 'نادي الأعضاء (Member Club)' : 'Member Club'}
                </Link>
                {isAuthenticated && (
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 px-3 rounded-lg hover:bg-muted text-slate-700 font-semibold"
                  >
                    {isAr ? 'طلباتي والشحنات' : 'My Orders & Shipments'}
                  </Link>
                )}
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 px-3 rounded-lg bg-amber-500/10 text-amber-900 border border-amber-500/20 font-bold"
                  >
                    {isAr ? 'لوحة الإدارة (Admin Dashboard)' : 'Admin Dashboard'}
                  </Link>
                )}
              </div>

              {/* Language & Currency in Mobile */}
              <div className="pt-4 border-t border-border space-y-3 text-xs">
                <button
                  onClick={toggleLanguage}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-muted text-foreground font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span>Language</span>
                  </span>
                  <span className="font-bold">{lang === 'ar' ? 'English (LTR)' : 'العربية (RTL)'}</span>
                </button>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted text-foreground font-semibold">
                  <span className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-emerald-600" />
                    <span>Currency</span>
                  </span>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="bg-transparent font-mono font-bold text-xs"
                  >
                    {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbolEn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}
      </header>
    </>
  );
}
