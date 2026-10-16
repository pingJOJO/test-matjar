'use client';

import { useEffect } from 'react';
import { useLanguageStore, Language } from '@/stores/useLanguageStore';
import { useCurrencyStore, CurrencyCode, SUPPORTED_CURRENCIES } from '@/stores/useCurrencyStore';
import { useCartStore } from '@/stores/useCartStore';
import { useMachineStore } from '@/stores/useMachineStore';
import { useAuthStore } from '@/stores/useAuthStore';

export function StoreInitializer() {
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const setActiveMachine = useMachineStore((state) => state.setActiveMachine);
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    // 1. Hydrate Language & Direction
    try {
      const savedLang = localStorage.getItem('a2z_selected_lang') as Language | null;
      if (savedLang === 'ar' || savedLang === 'en') {
        setLanguage(savedLang);
      } else {
        setLanguage('ar');
      }
    } catch {
      setLanguage('ar');
    }

    // 2. Hydrate Currency
    try {
      const savedCurr = localStorage.getItem('a2z_selected_currency') as CurrencyCode | null;
      if (savedCurr && SUPPORTED_CURRENCIES[savedCurr]) {
        setCurrency(savedCurr);
      }
    } catch {
      // Keep default USD
    }

    // 3. Hydrate Active Machine (Garage)
    try {
      const savedMachineStr = localStorage.getItem('a2z_active_machine');
      if (savedMachineStr) {
        const parsed = JSON.parse(savedMachineStr);
        if (parsed && parsed.model) {
          setActiveMachine(parsed);
        }
      }
    } catch {
      // ignore
    }

    // 4. Hydrate Cart from API / guest session
    fetchCart();

    // 5. Hydrate Auth Session
    initAuth();
  }, [setLanguage, setCurrency, fetchCart, setActiveMachine, initAuth]);

  return null;
}
