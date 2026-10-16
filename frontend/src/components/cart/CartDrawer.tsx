'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  Truck,
  ShieldCheck,
  Scale,
  Lock,
} from 'lucide-react';
import { useCartStore } from '@/stores/useCartStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { useCurrencyStore } from '@/stores/useCurrencyStore';
import { Button } from '@/components/ui/button';
import { formatWeight } from '@/lib/utils';

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    subtotal,
    totalWeightKg,
    totalQuantity,
    updateQuantity,
    removeItem,
    clearCart,
    isLoading,
  } = useCartStore();

  const { lang, dir, t } = useLanguageStore();
  const { currency, formatPrice } = useCurrencyStore();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeCart();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'}`} dir={dir}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeCart}
      />

      {/* Slide-over Panel */}
      <div
        className={`relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in ${
          dir === 'rtl' ? 'slide-in-from-left' : 'slide-in-from-right'
        } duration-300 font-sans`}
      >
        {/* Header (Royal Blue) */}
        <div className="flex items-center justify-between border-b border-blue-900 px-5 py-4 bg-[#0D5CB6] text-white">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="h-5 w-5 text-[#FFB800]" />
            <h2 className="text-base font-bold">{t('cart.title')}</h2>
            <span className="rounded-full bg-[#FFB800] px-2 py-0.5 text-xs font-bold text-slate-950 font-mono">
              {t('cart.items_count', { count: totalQuantity })}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="rounded-lg p-1.5 text-blue-100 hover:bg-blue-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping & Freight Weight Bar */}
        <div className="bg-blue-50 px-5 py-2.5 text-xs font-medium text-slate-700 border-b border-blue-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[#0D5CB6] font-bold">
            <Truck className="h-4 w-4" />
            <span>
              {subtotal >= 150 ? t('cart.free_freight_qualified') : t('cart.free_freight_over')}
            </span>
          </span>
          {totalWeightKg > 0 && (
            <span className="flex items-center gap-1 font-mono text-slate-600">
              <Scale className="h-3.5 w-3.5 text-slate-400" />
              <span>{formatWeight(totalWeightKg, lang)}</span>
            </span>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingCart className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{t('cart.empty_title')}</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  {t('cart.empty_desc')}
                </p>
              </div>
              <Button
                variant="royal"
                size="sm"
                onClick={closeCart}
                className="mt-2"
              >
                {t('cart.browse_btn')}
              </Button>
            </div>
          ) : (
            items.map((item) => {
              const product = item.product;
              const imgUrl =
                product.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80';
              const weightKg = Number(product.weightKg) || 0;

              return (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white border border-slate-200 p-1">
                    <Image
                      src={imgUrl}
                      alt={product.title}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] bg-slate-900 text-[#FFB800] font-mono font-bold px-1.5 py-0.2 rounded">
                          {t('common.oem')}: {product.sku}
                        </span>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <h4
                        className="text-xs font-bold text-slate-900 line-clamp-1 mt-1"
                        title={product.title}
                      >
                        {product.title}
                      </h4>

                      {weightKg > 0 && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Scale className="h-3 w-3 text-slate-400" />
                          <span>{formatWeight(weightKg * item.quantity, lang)}</span>
                        </span>
                      )}
                    </div>

                    {/* Quantity controls & price */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center border border-slate-200 rounded-md">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                          }
                          disabled={item.quantity <= 1 || isLoading}
                          className="p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-900 min-w-5 text-center font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={isLoading}
                          className="p-1 text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black text-[#0D5CB6] font-mono">
                          {formatPrice(Number(item.unitPrice) * item.quantity, currency, lang)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {formatPrice(item.unitPrice, currency, lang)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 p-5 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{t('cart.subtotal')}</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {formatPrice(subtotal, currency, lang)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('cart.vat_tax')}</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {formatPrice(subtotal * 0.05, currency, lang)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('cart.freight')}</span>
                <span className="font-semibold text-emerald-700 font-mono">
                  {subtotal >= 150 ? t('cart.free') : formatPrice(15, currency, lang)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-950">
                <span>{t('cart.total_due')}</span>
                <span className="text-base text-[#0D5CB6] font-mono font-black">
                  {formatPrice(subtotal * 1.05 + (subtotal >= 150 ? 0 : 15), currency, lang)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D5CB6] hover:bg-[#0B4F9C] px-4 py-3 text-sm font-bold text-white shadow-md active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>{t('cart.proceed_checkout')}</span>
                <ArrowRight className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              </Link>

              <button
                onClick={clearCart}
                className="text-center text-xs text-slate-500 hover:text-rose-600 transition-colors py-1 cursor-pointer"
              >
                {t('cart.clear_cart')}
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 pt-2 border-t border-slate-200">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-emerald-600" /> {t('cart.ssl_secure')}
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-blue-600" /> {t('cart.fitment_match')}
              </span>
              <span className="flex items-center gap-1">
                <Truck className="h-3 w-3 text-amber-600" /> {t('cart.jobsite_dispatch')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
