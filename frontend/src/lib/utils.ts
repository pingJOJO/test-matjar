import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useCurrencyStore, CurrencyCode } from "@/stores/useCurrencyStore";
import { useLanguageStore } from "@/stores/useLanguageStore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number | string,
  currency?: CurrencyCode,
  lang?: 'ar' | 'en',
): string {
  const currentLang = lang || (typeof window !== 'undefined' ? useLanguageStore.getState().lang : 'ar');
  return useCurrencyStore.getState().formatPrice(price, currency, currentLang);
}

export function formatWeight(
  weightKg: number | string | null | undefined,
  lang?: 'ar' | 'en',
): string {
  if (!weightKg) return 'N/A';
  const num = typeof weightKg === 'string' ? parseFloat(weightKg) : weightKg;
  const currentLang = lang || (typeof window !== 'undefined' ? useLanguageStore.getState().lang : 'ar');
  const formatted = num.toLocaleString(currentLang === 'ar' ? 'ar-SA' : 'en-US', { maximumFractionDigits: 1 });
  return `${formatted} ${currentLang === 'ar' ? 'كجم' : 'kg'}`;
}
