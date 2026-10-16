import { create } from 'zustand';

export type CurrencyCode = 'USD' | 'SAR' | 'AED' | 'JOD' | 'EUR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbolEn: string;
  symbolAr: string;
  rate: number; // Conversion rate from USD
  nameEn: string;
  nameAr: string;
  decimals: number;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbolEn: '$',
    symbolAr: '$',
    rate: 1.0,
    nameEn: 'USD - US Dollar',
    nameAr: 'USD - دولار أمريكي',
    decimals: 2,
  },
  SAR: {
    code: 'SAR',
    symbolEn: 'SAR',
    symbolAr: 'ر.س',
    rate: 3.75,
    nameEn: 'SAR - Saudi Riyal',
    nameAr: 'SAR - ريال سعودي',
    decimals: 2,
  },
  AED: {
    code: 'AED',
    symbolEn: 'AED',
    symbolAr: 'د.إ',
    rate: 3.67,
    nameEn: 'AED - UAE Dirham',
    nameAr: 'AED - درهم إماراتي',
    decimals: 2,
  },
  JOD: {
    code: 'JOD',
    symbolEn: 'JOD',
    symbolAr: 'د.أ',
    rate: 0.71,
    nameEn: 'JOD - Jordanian Dinar',
    nameAr: 'JOD - دينار أردني',
    decimals: 3,
  },
  EUR: {
    code: 'EUR',
    symbolEn: '€',
    symbolAr: '€',
    rate: 0.92,
    nameEn: 'EUR - Euro',
    nameAr: 'EUR - يورو',
    decimals: 2,
  },
};

export interface CurrencyState {
  currency: CurrencyCode;
  currentCurrency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  convertAmount: (amountInUSD: number | string) => number;
  formatPrice: (amountInUSD: number | string, customCode?: CurrencyCode, lang?: 'ar' | 'en') => string;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currency: 'USD',
  currentCurrency: 'USD',

  setCurrency: (newCode: CurrencyCode) => {
    if (!SUPPORTED_CURRENCIES[newCode]) return;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('a2z_selected_currency', newCode);
      } catch (err) {
        console.error('Failed to persist currency in localStorage:', err);
      }
    }

    set({ currency: newCode, currentCurrency: newCode });
  },

  convertAmount: (amountInUSD: number | string): number => {
    const num = typeof amountInUSD === 'string' ? parseFloat(amountInUSD) : amountInUSD;
    if (isNaN(num)) return 0;
    const currentCode = get().currency;
    const rate = SUPPORTED_CURRENCIES[currentCode]?.rate ?? 1.0;
    return num * rate;
  },

  formatPrice: (
    amountInUSD: number | string,
    customCode?: CurrencyCode,
    lang?: 'ar' | 'en',
  ): string => {
    const num = typeof amountInUSD === 'string' ? parseFloat(amountInUSD) : amountInUSD;
    if (isNaN(num)) return '0.00';

    const targetCode = customCode || get().currency;
    const config = SUPPORTED_CURRENCIES[targetCode] || SUPPORTED_CURRENCIES.USD;
    const converted = num * config.rate;

    const formattedNumber = converted.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    });

    if (lang === 'ar') {
      return `${formattedNumber} ${config.symbolAr}`;
    }

    // English formatting:
    if (config.code === 'USD' || config.code === 'EUR') {
      return `${config.symbolEn}${formattedNumber}`;
    }
    return `${formattedNumber} ${config.symbolEn}`;
  },
}));
