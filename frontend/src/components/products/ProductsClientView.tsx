'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  ChevronRight,
  Filter,
  Package,
  RotateCcw,
  Check,
} from 'lucide-react';
import { ProductItem, CategoryItem } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { FilterSidebar } from '@/components/catalog/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { useCurrencyStore } from '@/stores/useCurrencyStore';

interface ProductsClientViewProps {
  products: ProductItem[];
  categories: CategoryItem[];
  featuredProducts?: ProductItem[];
  search: string;
  categorySlug: string;
  inStockOnly: boolean;
  productSort: string;
  brand: string;
  equipmentType: string;
  engineBrand: string;
}

export function ProductsClientView({
  products,
  categories,
  featuredProducts = [],
  search,
  categorySlug,
  inStockOnly,
  productSort,
  brand,
  equipmentType,
  engineBrand,
}: ProductsClientViewProps) {
  const router = useRouter();
  const { lang, dir } = useLanguageStore();
  const { formatPrice } = useCurrencyStore();
  const isAr = lang === 'ar';

  // Layout View Mode (Grid vs List)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mobile Drawer State
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Parse comma-separated active filter values
  const selectedBrands = brand
    ? brand.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    : [];
  const selectedEquipmentTypes = equipmentType
    ? equipmentType.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    : [];
  const selectedEngineBrands = engineBrand
    ? engineBrand.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    : [];

  const totalActiveFacetFilters =
    selectedBrands.length +
    selectedEquipmentTypes.length +
    selectedEngineBrands.length;

  // Helper to build URL with updated search params
  const updateUrlWithParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams();

    // Preserve existing params unless overridden or nullified
    if (search && updates.search !== null) params.set('search', search);
    if (categorySlug && updates.categorySlug !== null) params.set('categorySlug', categorySlug);
    if (inStockOnly && updates.inStockOnly !== null) params.set('inStockOnly', 'true');
    if (productSort && productSort !== 'newest' && updates.productSort === undefined) {
      params.set('productSort', productSort);
    }

    // Facet filters
    const currentBrands = updates.brand !== undefined ? updates.brand : brand;
    if (currentBrands) params.set('brand', currentBrands);

    const currentEquip = updates.equipmentType !== undefined ? updates.equipmentType : equipmentType;
    if (currentEquip) params.set('equipmentType', currentEquip);

    const currentEng = updates.engineBrand !== undefined ? updates.engineBrand : engineBrand;
    if (currentEng) params.set('engineBrand', currentEng);

    // Explicit updates
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else if (val !== undefined) {
        params.set(key, val);
      }
    });

    const qs = params.toString();
    router.push(`/products${qs ? `?${qs}` : ''}`);
  };

  // Toggle Handlers
  const handleToggleBrand = (brandId: string) => {
    const normalized = brandId.toLowerCase();
    const next = selectedBrands.includes(normalized)
      ? selectedBrands.filter((b) => b !== normalized)
      : [...selectedBrands, normalized];
    updateUrlWithParams({ brand: next.length > 0 ? next.join(',') : null });
  };

  const handleToggleEquipmentType = (eqId: string) => {
    const normalized = eqId.toLowerCase();
    const next = selectedEquipmentTypes.includes(normalized)
      ? selectedEquipmentTypes.filter((eq) => eq !== normalized)
      : [...selectedEquipmentTypes, normalized];
    updateUrlWithParams({ equipmentType: next.length > 0 ? next.join(',') : null });
  };

  const handleToggleEngineBrand = (engId: string) => {
    const normalized = engId.toLowerCase();
    const next = selectedEngineBrands.includes(normalized)
      ? selectedEngineBrands.filter((eng) => eng !== normalized)
      : [...selectedEngineBrands, normalized];
    updateUrlWithParams({ engineBrand: next.length > 0 ? next.join(',') : null });
  };

  const handleClearAllFacets = () => {
    updateUrlWithParams({
      brand: null,
      equipmentType: null,
      engineBrand: null,
    });
  };

  const handleSortChange = (newSort: string) => {
    updateUrlWithParams({ productSort: newSort });
  };

  // Find active category hierarchy for breadcrumbs
  const activeCategory = categories.find((c) => c.slug === categorySlug);
  const parentCategory = activeCategory?.parentId
    ? categories.find((c) => c.id === activeCategory.parentId)
    : null;

  const pageTitle = categorySlug
    ? activeCategory?.name || categorySlug.toUpperCase()
    : search
    ? isAr
      ? `نتائج البحث: "${search}"`
      : `Search Results for "${search}"`
    : isAr
    ? 'كتالوج قطع غيار المعدات الثقيلة'
    : 'Heavy Equipment Spare Parts';

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 pb-24 md:pb-16 font-sans" dir={dir}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ========================================================
            1. BREADCRUMBS & PAGE HEADER (§3.1 Exact Specification)
        ======================================================== */}
        <div className="mb-6 space-y-2.5">
          {/* Breadcrumbs: Home > Engine Spare Parts > Fuel System > Fuel Pump */}
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-[#0D5CB6] transition-colors">
              {isAr ? 'الرئيسية' : 'Home'}
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
            <Link href="/products" className="hover:text-[#0D5CB6] transition-colors">
              {isAr ? 'قطع غيار المعدات' : 'Engine Spare Parts'}
            </Link>
            {parentCategory && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="text-slate-600 font-medium">{parentCategory.name}</span>
              </>
            )}
            <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="font-bold text-slate-900 truncate">{pageTitle}</span>
          </nav>

          {/* H1 Heading + Promotional Subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {pageTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {isAr
                ? 'خصومات تصل حتى 63% على قطع مختارة مع شحن سريع لمواقع العمل والمحاجر'
                : 'Up to 63% OFF Selected Parts'}
            </p>
          </div>
        </div>

        {/* ========================================================
            2. ACTIVE FILTERS CHIPS (Pills)
        ======================================================== */}
        {(totalActiveFacetFilters > 0 || search || categorySlug || inStockOnly) && (
          <div className="mb-6 flex flex-wrap items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-[#0D5CB6]" />
              <span>{isAr ? 'الفلاتر النشطة:' : 'Active Filters:'}</span>
            </span>

            {/* Brand Pills */}
            {selectedBrands.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0D5CB6] border border-blue-200"
              >
                <span>{b.toUpperCase()}</span>
                <button
                  type="button"
                  onClick={() => handleToggleBrand(b)}
                  className="hover:text-rose-600 cursor-pointer p-0.5"
                  aria-label={`Remove filter ${b}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {/* Equipment Type Pills */}
            {selectedEquipmentTypes.map((eq) => (
              <span
                key={eq}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                <span className="capitalize">{eq}</span>
                <button
                  type="button"
                  onClick={() => handleToggleEquipmentType(eq)}
                  className="hover:text-rose-600 cursor-pointer p-0.5"
                  aria-label={`Remove filter ${eq}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {/* Engine Brand Pills */}
            {selectedEngineBrands.map((eng) => (
              <span
                key={eng}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFB800]/10 text-[#B45309] border border-[#FFB800]/30"
              >
                <span>{eng.toUpperCase()}</span>
                <button
                  type="button"
                  onClick={() => handleToggleEngineBrand(eng)}
                  className="hover:text-rose-600 cursor-pointer p-0.5"
                  aria-label={`Remove filter ${eng}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {/* Keyword Search Pill */}
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                <span>{isAr ? `بحث: ${search}` : `Keyword: ${search}`}</span>
                <button
                  type="button"
                  onClick={() => updateUrlWithParams({ search: null })}
                  className="hover:text-rose-600 cursor-pointer p-0.5"
                  aria-label="Remove search"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* In-stock Pill */}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                <span>{isAr ? 'المتوفر بالمخزون' : 'In Stock'}</span>
                <button
                  type="button"
                  onClick={() => updateUrlWithParams({ inStockOnly: null })}
                  className="hover:text-rose-600 cursor-pointer p-0.5"
                  aria-label="Remove in-stock filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Clear All Button */}
            <button
              type="button"
              onClick={handleClearAllFacets}
              className={`text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer flex items-center gap-1 ${
                isAr ? 'mr-auto' : 'ml-auto'
              }`}
            >
              <RotateCcw className="h-3 w-3" />
              <span>{isAr ? 'مسح الفلاتر' : 'Clear All'}</span>
            </button>
          </div>
        )}

        {/* ========================================================
            3. MAIN LAYOUT: SIDEBAR (1 COL) + CONTROLS & GRID (3 COLS)
        ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-24">
            <FilterSidebar
              selectedBrands={selectedBrands}
              selectedEquipmentTypes={selectedEquipmentTypes}
              selectedEngineBrands={selectedEngineBrands}
              onToggleBrand={handleToggleBrand}
              onToggleEquipmentType={handleToggleEquipmentType}
              onToggleEngineBrand={handleToggleEngineBrand}
              onClearAll={handleClearAllFacets}
              featuredProducts={featuredProducts}
              totalResultsCount={products.length}
            />
          </aside>

          {/* Right Main Column */}
          <main className="lg:col-span-3 space-y-5">
            {/* Controls Bar: Sort Dropdown + Mobile Filter Trigger + View Toggle */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              {/* Left: Mobile Filter Button + Results Count */}
              <div className="flex items-center justify-between sm:justify-start gap-3">
                {/* Mobile Drawer Trigger */}
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="h-4 w-4 text-[#0D5CB6]" />
                  <span>{isAr ? 'الفلاتر والتصنيفات' : 'Filters'}</span>
                  {totalActiveFacetFilters > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#0D5CB6] text-white">
                      {totalActiveFacetFilters}
                    </span>
                  )}
                </button>

                <span className="text-xs text-slate-500 font-medium">
                  {isAr ? (
                    <>
                      عرض <strong>{products.length}</strong> من قطع الغيار المعتمدة
                    </>
                  ) : (
                    <>
                      Showing <strong>{products.length}</strong> certified parts
                    </>
                  )}
                </span>
              </div>

              {/* Right: Sort By Dropdown & View Mode Switcher */}
              <div className="flex items-center justify-between sm:justify-end gap-3">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 text-xs">
                  <label htmlFor="sort-select" className="text-slate-500 font-bold shrink-0">
                    {isAr ? 'الترتيب حسب:' : 'Sort By:'}
                  </label>
                  <select
                    id="sort-select"
                    value={productSort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#0D5CB6] focus:ring-1 focus:ring-[#0D5CB6] cursor-pointer"
                  >
                    <option value="newest">{isAr ? 'الأفضل مطابقة (Best Match)' : 'Best Match'}</option>
                    <option value="price_asc">{isAr ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                    <option value="price_desc">{isAr ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                    <option value="newest">{isAr ? 'الأحدث أولاً' : 'Newest'}</option>
                    <option value="salesCount_desc">{isAr ? 'الأكثر مبيعاً' : 'Best Selling'}</option>
                  </select>
                </div>

                {/* View Switcher (Grid vs List) */}
                <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white text-[#0D5CB6] shadow-xs'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-white text-[#0D5CB6] shadow-xs'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================
                4. PRODUCT GRID (4 Columns Grid on Desktop)
            ======================================================== */}
            {products.length === 0 ? (
              /* Empty State */
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isAr ? 'لم يتم العثور على قطع غيار مطابقة' : 'No matching spare parts found'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    {isAr
                      ? 'جرب تقليل الفلاتر المختارة أو البحث برقم الـ OEM الأصلي مباشرة.'
                      : 'Try broadening your filter criteria or searching directly by OEM part number.'}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleClearAllFacets}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0D5CB6] hover:bg-[#0B4F9C] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>{isAr ? 'إعادة ضبط كافة الفلاتر' : 'Reset All Filters'}</span>
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              /* 4 Columns Responsive Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode="grid" />
                ))}
              </div>
            ) : (
              /* List Mode */
              <div className="space-y-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode="list" />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ========================================================
          5. MOBILE FILTER DRAWER / SHEET
      ======================================================== */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div
            className={`relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl overflow-y-auto flex flex-col z-10 animate-in slide-in-from-${
              isAr ? 'left' : 'right'
            } duration-200`}
            dir={dir}
          >
            <FilterSidebar
              selectedBrands={selectedBrands}
              selectedEquipmentTypes={selectedEquipmentTypes}
              selectedEngineBrands={selectedEngineBrands}
              onToggleBrand={handleToggleBrand}
              onToggleEquipmentType={handleToggleEquipmentType}
              onToggleEngineBrand={handleToggleEngineBrand}
              onClearAll={handleClearAllFacets}
              featuredProducts={featuredProducts}
              totalResultsCount={products.length}
              isMobileDrawer={true}
              onCloseMobile={() => setMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
