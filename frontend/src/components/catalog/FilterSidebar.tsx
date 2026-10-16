'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
  Star,
  RotateCcw,
  Plus,
  Minus,
} from 'lucide-react';
import { ProductItem } from '@/lib/api';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { useCurrencyStore } from '@/stores/useCurrencyStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface FilterOption {
  id: string;
  label: string;
  labelAr?: string;
  count?: number;
}

export const BRAND_OPTIONS: FilterOption[] = [
  { id: 'cat', label: 'For CAT' },
  { id: 'john deere', label: 'For JOHN DEERE' },
  { id: 'komatsu', label: 'For KOMATSU' },
  { id: 'volvo', label: 'For VOLVO' },
  { id: 'kubota', label: 'For KUBOTA' },
  { id: 'hyundai', label: 'For HYUNDAI' },
  { id: 'doosan', label: 'For DOOSAN' },
  { id: 'bobcat', label: 'For BOBCAT' },
  { id: 'jcb', label: 'For JCB' },
  { id: 'hitachi', label: 'For HITACHI' },
  { id: 'case', label: 'For CASE' },
  { id: 'yanmar', label: 'For YANMAR' },
  { id: 'other brand', label: 'For OTHER BRAND' },
];

export const EQUIPMENT_OPTIONS: FilterOption[] = [
  { id: 'excavator', label: 'Excavator' },
  { id: 'wheel loader', label: 'Wheel Loader' },
  { id: 'tractor', label: 'Tractor' },
  { id: 'engine', label: 'Engine' },
  { id: 'bulldozer', label: 'Bulldozer' },
  { id: 'forklift', label: 'Forklift' },
  { id: 'generator', label: 'Generator' },
  { id: 'truck', label: 'Truck' },
  { id: 'marine', label: 'Marine' },
  { id: 'sport utv/atv', label: 'Sport UTV/ATV' },
];

export const ENGINE_BRAND_OPTIONS: FilterOption[] = [
  { id: 'cummins', label: 'For CUMMINS' },
  { id: 'isuzu', label: 'For ISUZU' },
  { id: 'cat', label: 'For CAT' },
  { id: 'deutz', label: 'For DEUTZ' },
  { id: 'perkins', label: 'For PERKINS' },
  { id: 'yanmar', label: 'For YANMAR' },
  { id: 'mitsubishi', label: 'For MITSUBISHI' },
  { id: 'kubota', label: 'For KUBOTA' },
  { id: 'other engine brand', label: 'Other Engine Brand' },
];

interface FilterSidebarProps {
  selectedBrands: string[];
  selectedEquipmentTypes: string[];
  selectedEngineBrands: string[];
  onToggleBrand: (brand: string) => void;
  onToggleEquipmentType: (eq: string) => void;
  onToggleEngineBrand: (eng: string) => void;
  onClearAll: () => void;
  featuredProducts?: ProductItem[];
  totalResultsCount?: number;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

export function FilterSidebar({
  selectedBrands,
  selectedEquipmentTypes,
  selectedEngineBrands,
  onToggleBrand,
  onToggleEquipmentType,
  onToggleEngineBrand,
  onClearAll,
  featuredProducts = [],
  totalResultsCount,
  isMobileDrawer = false,
  onCloseMobile,
}: FilterSidebarProps) {
  const { lang, dir } = useLanguageStore();
  const { formatPrice } = useCurrencyStore();
  const isAr = lang === 'ar';

  // Collapsible Accordion States (Open by default)
  const [brandsOpen, setBrandsOpen] = useState(true);
  const [equipmentOpen, setEquipmentOpen] = useState(true);
  const [engineOpen, setEngineOpen] = useState(true);

  // View More / View Less States (default shows 8 items)
  const [showMoreBrands, setShowMoreBrands] = useState(false);
  const [showMoreEquipment, setShowMoreEquipment] = useState(false);
  const [showMoreEngine, setShowMoreEngine] = useState(false);

  const totalActiveFilters =
    selectedBrands.length +
    selectedEquipmentTypes.length +
    selectedEngineBrands.length;

  const visibleBrands = showMoreBrands
    ? BRAND_OPTIONS
    : BRAND_OPTIONS.slice(0, 8);

  const visibleEquipment = showMoreEquipment
    ? EQUIPMENT_OPTIONS
    : EQUIPMENT_OPTIONS.slice(0, 8);

  const visibleEngines = showMoreEngine
    ? ENGINE_BRAND_OPTIONS
    : ENGINE_BRAND_OPTIONS.slice(0, 8);

  const sidebarContent = (
    <div className="space-y-6 text-xs text-slate-800 select-none" dir={dir}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#0D5CB6]" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {isAr ? 'تصفية النتائج' : 'Filter Parts'}
          </h3>
          {totalActiveFilters > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[11px] font-bold rounded-full bg-[#0D5CB6] text-white">
              {totalActiveFilters}
            </span>
          )}
        </div>

        {totalActiveFilters > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{isAr ? 'مسح الكل' : 'Clear All'}</span>
          </button>
        )}
      </div>

      {/* Group 1: Brand */}
      <div className="border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => setBrandsOpen(!brandsOpen)}
          className="w-full flex items-center justify-between py-1.5 text-left font-bold text-slate-900 hover:text-[#0D5CB6] transition-colors cursor-pointer"
        >
          <span className="text-sm font-extrabold uppercase tracking-wide">
            {isAr ? 'ماركة المعدة (Brand)' : 'Brand'}
          </span>
          <span className="p-1 text-slate-500">
            {brandsOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        </button>

        {brandsOpen && (
          <div className="mt-2.5 space-y-2 pt-1 animate-in fade-in duration-150">
            {visibleBrands.map((opt) => {
              const checked = selectedBrands.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  className="flex items-center gap-2.5 group cursor-pointer hover:text-slate-950 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleBrand(opt.id)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0D5CB6] focus:ring-[#0D5CB6] cursor-pointer"
                  />
                  <span
                    className={`text-xs transition-colors ${
                      checked
                        ? 'font-bold text-[#0D5CB6]'
                        : 'font-normal text-slate-700 group-hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </span>
                </label>
              );
            })}

            {BRAND_OPTIONS.length > 8 && (
              <button
                type="button"
                onClick={() => setShowMoreBrands(!showMoreBrands)}
                className="mt-2 pt-1 text-xs font-bold text-[#0D5CB6] hover:text-[#0B4F9C] flex items-center gap-1 cursor-pointer"
              >
                {showMoreBrands ? (
                  <>
                    <Minus className="h-3 w-3" />
                    <span>{isAr ? 'عرض أقل (View Less)' : 'View Less'}</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3" />
                    <span>
                      {isAr
                        ? `عرض المزيد (${BRAND_OPTIONS.length - 8}+)`
                        : `View More (${BRAND_OPTIONS.length - 8}+)`}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Group 2: Equipment Type */}
      <div className="border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => setEquipmentOpen(!equipmentOpen)}
          className="w-full flex items-center justify-between py-1.5 text-left font-bold text-slate-900 hover:text-[#0D5CB6] transition-colors cursor-pointer"
        >
          <span className="text-sm font-extrabold uppercase tracking-wide">
            {isAr ? 'نوع الآلية (Equipment Type)' : 'Equipment Type'}
          </span>
          <span className="p-1 text-slate-500">
            {equipmentOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        </button>

        {equipmentOpen && (
          <div className="mt-2.5 space-y-2 pt-1 animate-in fade-in duration-150">
            {visibleEquipment.map((opt) => {
              const checked = selectedEquipmentTypes.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  className="flex items-center gap-2.5 group cursor-pointer hover:text-slate-950 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleEquipmentType(opt.id)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0D5CB6] focus:ring-[#0D5CB6] cursor-pointer"
                  />
                  <span
                    className={`text-xs transition-colors ${
                      checked
                        ? 'font-bold text-[#0D5CB6]'
                        : 'font-normal text-slate-700 group-hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </span>
                </label>
              );
            })}

            {EQUIPMENT_OPTIONS.length > 8 && (
              <button
                type="button"
                onClick={() => setShowMoreEquipment(!showMoreEquipment)}
                className="mt-2 pt-1 text-xs font-bold text-[#0D5CB6] hover:text-[#0B4F9C] flex items-center gap-1 cursor-pointer"
              >
                {showMoreEquipment ? (
                  <>
                    <Minus className="h-3 w-3" />
                    <span>{isAr ? 'عرض أقل (View Less)' : 'View Less'}</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3" />
                    <span>
                      {isAr
                        ? `عرض المزيد (${EQUIPMENT_OPTIONS.length - 8}+)`
                        : `View More (${EQUIPMENT_OPTIONS.length - 8}+)`}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Group 3: Engine Brand */}
      <div className="border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => setEngineOpen(!engineOpen)}
          className="w-full flex items-center justify-between py-1.5 text-left font-bold text-slate-900 hover:text-[#0D5CB6] transition-colors cursor-pointer"
        >
          <span className="text-sm font-extrabold uppercase tracking-wide">
            {isAr ? 'ماركة المحرك (Engine Brand)' : 'Engine Brand'}
          </span>
          <span className="p-1 text-slate-500">
            {engineOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        </button>

        {engineOpen && (
          <div className="mt-2.5 space-y-2 pt-1 animate-in fade-in duration-150">
            {visibleEngines.map((opt) => {
              const checked = selectedEngineBrands.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  className="flex items-center gap-2.5 group cursor-pointer hover:text-slate-950 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleEngineBrand(opt.id)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0D5CB6] focus:ring-[#0D5CB6] cursor-pointer"
                  />
                  <span
                    className={`text-xs transition-colors ${
                      checked
                        ? 'font-bold text-[#0D5CB6]'
                        : 'font-normal text-slate-700 group-hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </span>
                </label>
              );
            })}

            {ENGINE_BRAND_OPTIONS.length > 8 && (
              <button
                type="button"
                onClick={() => setShowMoreEngine(!showMoreEngine)}
                className="mt-2 pt-1 text-xs font-bold text-[#0D5CB6] hover:text-[#0B4F9C] flex items-center gap-1 cursor-pointer"
              >
                {showMoreEngine ? (
                  <>
                    <Minus className="h-3 w-3" />
                    <span>{isAr ? 'عرض أقل (View Less)' : 'View Less'}</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3" />
                    <span>
                      {isAr
                        ? `عرض المزيد (${ENGINE_BRAND_OPTIONS.length - 8}+)`
                        : `View More (${ENGINE_BRAND_OPTIONS.length - 8}+)`}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Group 4: Featured Products Widget (§ Exact industrial 60x60 mini card) */}
      {featuredProducts && featuredProducts.length > 0 && (
        <div className="pt-2">
          <div className="pb-3 border-b border-slate-200">
            <h4 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
              {isAr ? 'قطع مميزة (Featured Products)' : 'Featured Products'}
            </h4>
          </div>

          <div className="mt-3 space-y-4">
            {featuredProducts.slice(0, 4).map((item) => {
              const imgUrl =
                item.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80';
              const priceNum = Number(item.price) || 0;
              const compareNum = item.compareAtPrice
                ? Number(item.compareAtPrice)
                : 0;

              return (
                <Link
                  key={item.id}
                  href={`/products/${item.sku || item.slug}`}
                  className="group flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                >
                  {/* Thumbnail (60x60px) */}
                  <div className="w-[60px] h-[60px] rounded-md border border-slate-200 bg-white p-1 shrink-0 overflow-hidden relative flex items-center justify-center">
                    <Image
                      src={imgUrl}
                      alt={item.title}
                      width={60}
                      height={60}
                      className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h5 className="text-[12px] font-semibold text-slate-800 group-hover:text-[#0D5CB6] line-clamp-2 leading-tight">
                      {item.title}
                    </h5>

                    {/* 5 Yellow Stars */}
                    <div className="flex items-center gap-0.5 my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-3 w-3 fill-[#FFB800] text-[#FFB800]"
                        />
                      ))}
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="font-bold text-slate-950 text-xs">
                        {formatPrice(priceNum)}
                      </span>
                      {compareNum > priceNum && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatPrice(compareNum)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // If rendered inside a mobile Drawer/Modal
  if (isMobileDrawer) {
    return (
      <div className="p-4 sm:p-6 bg-white min-h-full">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-[#0D5CB6]" />
            <span className="font-black text-slate-900 text-base">
              {isAr ? 'فلاتر الكتالوج' : 'Filters'}
            </span>
            {totalActiveFilters > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#0D5CB6] text-white">
                {totalActiveFilters}
              </span>
            )}
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {sidebarContent}

        <div className="sticky bottom-0 left-0 right-0 pt-4 mt-6 bg-white border-t border-slate-200 flex items-center gap-3">
          {totalActiveFilters > 0 && (
            <Button
              variant="outline"
              onClick={onClearAll}
              className="flex-1 font-bold text-xs h-10 border-slate-300"
            >
              {isAr ? 'مسح الفلاتر' : 'Clear All'}
            </Button>
          )}
          <Button
            onClick={onCloseMobile}
            className="flex-1 font-bold text-xs h-10 bg-[#0D5CB6] hover:bg-[#0B4F9C] text-white"
          >
            {isAr ? 'تطبيق الفلاتر وعرض النتائج' : 'Apply Filters'}
          </Button>
        </div>
      </div>
    );
  }

  // Standard Desktop Aside
  return (
    <aside className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      {sidebarContent}
    </aside>
  );
}
