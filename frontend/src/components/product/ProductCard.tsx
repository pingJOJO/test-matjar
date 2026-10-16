'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingCart,
  Check,
  Star,
  Heart,
  Sparkles,
} from 'lucide-react';
import { ProductItem } from '@/lib/api';
import { useCartStore } from '@/stores/useCartStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { useCurrencyStore } from '@/stores/useCurrencyStore';
import { useMachineStore } from '@/stores/useMachineStore';

interface ProductCardProps {
  product: ProductItem;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const { addItem } = useCartStore();
  const { lang, dir } = useLanguageStore();
  const { currency, formatPrice } = useCurrencyStore();
  const { activeMachine, checkFit } = useMachineStore();

  const isAr = lang === 'ar';

  const primaryImage =
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80';

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const replacementPartNumbers = (product.attributes as any)
    ?.replacementPartNumbers as string[] | undefined;
  const oemNumber =
    (product.attributes as any)?.oem ||
    replacementPartNumbers?.[0] ||
    product.sku;

  // Pricing & Discounts
  const regularPrice = Number(product.price);
  const listPrice = product.compareAtPrice ? Number(product.compareAtPrice) : 0;
  const hasDiscount = listPrice > regularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((listPrice - regularPrice) / listPrice) * 100)
    : 0;

  // Member price is ~5% lower
  const memberPrice = Math.round(regularPrice * 0.95 * 100) / 100;

  // Fit check with active machine
  const fitStatus = checkFit(product);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    try {
      await addItem(product.id, 1);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // ==========================================
  // LIST VIEW LAYOUT
  // ==========================================
  if (viewMode === 'list') {
    return (
      <div
        className="group bg-white border border-slate-200 rounded-lg p-4 relative flex flex-col sm:flex-row items-center gap-4 transition-all duration-200 hover:shadow-md hover:border-slate-300"
        dir={dir}
      >
        {/* Favorite Button */}
        <button
          type="button"
          onClick={toggleFavorite}
          className="absolute top-3.5 left-3.5 sm:left-auto sm:right-3.5 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shadow-xs border border-slate-100"
          aria-label="Add to Wishlist"
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
            }`}
          />
        </button>

        {/* Thumbnail Image */}
        <div className="relative aspect-square w-32 sm:w-40 shrink-0 overflow-hidden rounded-md bg-white border border-slate-100 p-2 flex items-center justify-center">
          <Link
            href={`/products/${product.sku || product.slug}`}
            className="block relative w-full h-full"
          >
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              sizes="160px"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Clearance Badge */}
          {(hasDiscount || product.isFeatured) && (
            <span className="absolute top-2 left-2 bg-[#DC2626] text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-xs">
              CLEARANCE
            </span>
          )}
        </div>

        {/* Middle Info Column */}
        <div className="flex-1 min-w-0 space-y-1.5 text-left">
          {oemNumber && (
            <span className="inline-block text-[11px] font-bold text-slate-600 font-mono tracking-tight bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              OEM {oemNumber}
            </span>
          )}

          <Link
            href={`/products/${product.sku || product.slug}`}
            className="block group-hover:text-[#0D5CB6] transition-colors"
          >
            <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* 5 Yellow Stars */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5 fill-[#FFB800] text-[#FFB800]"
                />
              ))}
            </div>
            <span className="text-[11px] text-slate-400 font-semibold font-mono">
              (5.0)
            </span>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description}
          </p>
        </div>

        {/* Right CTA Column */}
        <div className="w-full sm:w-48 shrink-0 flex flex-col justify-between items-start sm:items-end border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4 space-y-2">
          <div className="text-left sm:text-right w-full">
            <div className="flex items-baseline gap-2 sm:justify-end">
              <span
                className={`text-lg font-black font-mono ${
                  hasDiscount ? 'text-[#B91C1C]' : 'text-slate-900'
                }`}
              >
                {formatPrice(regularPrice, currency, lang)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  {formatPrice(listPrice, currency, lang)}
                </span>
              )}
            </div>

            <div className="mt-1 text-[11px] text-emerald-700 font-semibold flex items-center sm:justify-end gap-1">
              <span className="bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                Member Price
              </span>
              <span className="font-mono font-bold">
                {formatPrice(memberPrice, currency, lang)}
              </span>
            </div>
          </div>

          {/* Solid Industrial Yellow Button */}
          <button
            type="button"
            disabled={isOutOfStock || isAdding}
            onClick={handleAddToCart}
            className="bg-[#FFB800] hover:bg-[#F0AA00] text-slate-950 font-bold rounded-full py-1.5 px-4 text-xs w-full text-center mt-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {isAdded ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>{isAr ? 'تمت الإضافة' : 'Added to Cart'}</span>
              </>
            ) : isOutOfStock ? (
              <span>{isAr ? 'نفد المخزون' : 'Out of Stock'}</span>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>{isAr ? 'أضف للسلة' : 'Add to Cart'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // GRID VIEW CARD LAYOUT (§ Exact Specification)
  // ==========================================
  return (
    <div
      className="bg-white border border-slate-200 rounded-lg p-3 relative flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-slate-300 group"
      dir={dir}
    >
      <div>
        {/* Favorite Heart Icon in Top-Right Corner */}
        <button
          type="button"
          onClick={toggleFavorite}
          className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shadow-xs border border-slate-100"
          aria-label="Add to Wishlist"
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
            }`}
          />
        </button>

        {/* Clearance Red Badge in Top-Left Corner */}
        {(hasDiscount || product.isFeatured) && (
          <div className="absolute top-2.5 left-2.5 z-20">
            <span className="bg-[#DC2626] text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-xs">
              CLEARANCE
            </span>
          </div>
        )}

        {/* 1:1 Isolated White Background Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-white border border-slate-100 p-2 mb-2 flex items-center justify-center">
          <Link
            href={`/products/${product.sku || product.slug}`}
            className="block relative w-full h-full"
          >
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        </div>

        {/* OEM Part Number Pill */}
        {oemNumber && (
          <div className="mb-1">
            <span className="inline-block text-[10px] font-bold text-slate-500 font-mono tracking-tight bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              OEM {oemNumber}
            </span>
          </div>
        )}

        {/* Title: 13-14px readable with line-clamp-3 */}
        <Link
          href={`/products/${product.sku || product.slug}`}
          className="block mb-1.5 group-hover:text-[#0D5CB6] transition-colors"
        >
          <h3 className="text-[13px] sm:text-[14px] font-semibold text-slate-900 line-clamp-3 leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* 5 Technical Yellow Stars */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-3.5 w-3.5 fill-[#FFB800] text-[#FFB800]"
              />
            ))}
          </div>
        </div>

        {/* Price Block: Bold in black or red, compare-at strikethrough, Member Price */}
        <div className="space-y-1 mb-2">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-base font-black font-mono ${
                hasDiscount ? 'text-[#B91C1C]' : 'text-slate-900'
              }`}
            >
              {formatPrice(regularPrice, currency, lang)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through font-mono">
                {formatPrice(listPrice, currency, lang)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
            <span className="bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded text-[10px] font-bold">
              Member Price
            </span>
            <span className="font-mono font-bold">
              {formatPrice(memberPrice, currency, lang)}
            </span>
          </div>
        </div>
      </div>

      {/* Add to Cart Button (§ Solid Industrial Yellow) */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isOutOfStock || isAdding}
          onClick={handleAddToCart}
          className="bg-[#FFB800] hover:bg-[#F0AA00] text-slate-950 font-bold rounded-full py-1.5 px-4 text-xs w-full text-center mt-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
        >
          {isAdded ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>{isAr ? 'تمت الإضافة' : 'Added to Cart'}</span>
            </>
          ) : isOutOfStock ? (
            <span>{isAr ? 'غير متوفر حالياً' : 'Out of Stock'}</span>
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>{isAr ? 'أضف للسلة' : 'Add to Cart'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
