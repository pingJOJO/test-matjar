'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  ShoppingCart,
  PhoneCall,
  SlidersHorizontal,
  ShieldCheck,
} from 'lucide-react';
import { useCartStore } from '@/stores/useCartStore';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { totalQuantity, openCart } = useCartStore();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Catalog', href: '/products', icon: Search },
    { label: 'Brands', href: '/#brands', icon: SlidersHorizontal },
    {
      label: 'Cart',
      onClick: openCart,
      icon: ShoppingCart,
      badge: totalQuantity > 0 ? totalQuantity : null,
    },
    {
      label: 'Portal',
      href: '/admin',
      icon: ShieldCheck,
      highlight: true,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl safe-area-bottom">
      <nav className="flex items-center justify-around px-2 py-2">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = item.href ? pathname === item.href : false;

          if (item.onClick) {
            return (
              <button
                key={idx}
                onClick={item.onClick}
                className="relative flex flex-col items-center justify-center p-1 text-slate-600 hover:text-[#0D5CB6] active:scale-95 transition-all cursor-pointer"
              >
                <div className="relative">
                  <Icon className="h-5 w-5 text-slate-700" />
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0D5CB6] px-1 text-[10px] font-black text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold mt-1">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={idx}
              href={item.href!}
              className={`relative flex flex-col items-center justify-center p-1 transition-all active:scale-95 ${
                isActive
                  ? 'text-[#0D5CB6] font-bold'
                  : 'text-slate-600 hover:text-[#0D5CB6]'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-[#0D5CB6]' : 'text-slate-600'}`} />
              <span className="text-[10px] font-semibold mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
