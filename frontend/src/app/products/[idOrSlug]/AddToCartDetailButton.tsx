'use client';

import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { useCartStore } from '@/stores/useCartStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { Button } from '@/components/ui/button';

interface AddToCartDetailButtonProps {
  productId: string;
  stock: number;
}

export function AddToCartDetailButton({ productId, stock }: AddToCartDetailButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCartStore();
  const { lang, t } = useLanguageStore();

  const isAr = lang === 'ar';
  const isOutOfStock = stock <= 0;

  const handleAdd = async () => {
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    try {
      await addItem(productId, quantity);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err: any) {
      alert(err.message || (isAr ? 'فشلت إضافة القطعة إلى السلة' : 'Failed to add item to cart'));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      {/* Quantity counter */}
      <div className="flex h-12 w-full sm:w-auto items-center justify-between border-2 border-slate-200 rounded-xl px-2 bg-slate-50">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1 || isOutOfStock}
          className="p-2 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="px-4 text-sm font-black text-slate-900 font-mono">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
          disabled={quantity >= stock || isOutOfStock}
          className="p-2 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Main Add Button */}
      <Button
        variant={isOutOfStock ? "outline" : isAdded ? "success" : "royal"}
        size="lg"
        disabled={isOutOfStock || isAdding}
        onClick={handleAdd}
        className="w-full sm:flex-1 h-12 font-black text-sm gap-2 shadow-md hover:shadow-lg cursor-pointer"
      >
        {isAdded ? (
          <>
            <Check className="h-5 w-5" />
            {isAr ? 'تمت الإضافة للسلة بنجاح' : 'Added to Cart Successfully'}
          </>
        ) : isOutOfStock ? (
          isAr ? 'القطعة غير متوفرة حالياً' : 'Out of Stock'
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            {isAr
              ? `إضافة ${quantity > 1 ? `(${quantity}) قطع` : ''} إلى السلة`
              : `Add ${quantity > 1 ? `(${quantity})` : ''} to Cart`}
          </>
        )}
      </Button>
    </div>
  );
}
