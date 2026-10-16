import { create } from 'zustand';
import arDict from '@/locales/ar.json';
import enDict from '@/locales/en.json';

export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

interface LanguageState {
  lang: Language;
  dir: Direction;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const dictionaries: Record<Language, any> = {
  ar: arDict,
  en: enDict,
};

function getNestedTranslation(obj: any, path: string): string | undefined {
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  lang: 'ar',
  dir: 'rtl',

  setLanguage: (newLang: Language) => {
    const newDir: Direction = newLang === 'ar' ? 'rtl' : 'ltr';

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('a2z_selected_lang', newLang);
        document.documentElement.lang = newLang;
        document.documentElement.dir = newDir;
      } catch (err) {
        console.error('Failed to persist language in localStorage:', err);
      }
    }

    set({ lang: newLang, dir: newDir });
  },

  toggleLanguage: () => {
    const current = get().lang;
    const target: Language = current === 'ar' ? 'en' : 'ar';
    get().setLanguage(target);
  },

  t: (path: string, params?: Record<string, string | number>): string => {
    const currentLang = get().lang;
    let translation =
      getNestedTranslation(dictionaries[currentLang], path) ??
      getNestedTranslation(dictionaries.en, path) ??
      path;

    if (typeof translation === 'string' && params) {
      Object.entries(params).forEach(([key, val]) => {
        translation = (translation as string).replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
      });
    }

    return String(translation);
  },
}));
