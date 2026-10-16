'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  FileText,
  Store,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Menu,
  X,
  HardHat,
  ChevronLeft,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const isAdmin = Boolean(isAuthenticated && user && user.role === 'ADMIN');

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace('/?denied=1');
    }
  }, [isLoading, isAdmin, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Nav items
  const navItems = [
    {
      title: 'نظرة عامة والتحليلات',
      subtitle: 'Overview & Analytics',
      href: '/admin',
      icon: LayoutDashboard,
      badge: 'KPIs',
    },
    {
      title: 'إدارة الطلبات الميدانية',
      subtitle: 'Field Orders',
      href: '/admin/orders',
      icon: Package,
      badge: null,
    },
    {
      title: 'المخزون والتعديل السريع',
      subtitle: 'Stock & Pricing Patch',
      href: '/admin/inventory',
      icon: Boxes,
      badge: '36+ قطع',
    },
    {
      title: 'الفواتير الضريبية للشركات',
      subtitle: 'B2B Tax Invoices',
      href: '/admin/invoices',
      icon: FileText,
      badge: 'ZATCA',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white" dir="rtl">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">جاري فحص صلاحيات الإدارة...</p>
      </div>
    );
  }

  // If user is not authenticated or not ADMIN, render Access Denied while redirecting
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md bg-slate-900 border border-rose-900/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white">
            غير مصرح لك بدخول هذه الصفحة (Access Denied)
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            هذه اللوحة مخصصة لحسابات المشرفين والمدراء فقط. جاري إعادتك الآن إلى الصفحة الرئيسية للمتجر...
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              العودة للمتجر فوراً
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col lg:flex-row" dir="rtl">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">لوحة الإدارة والمستودع</span>
            <span className="text-[10px] text-amber-400 block font-mono">A2Z Admin</span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-72 bg-slate-900/95 backdrop-blur-md border-l border-slate-800 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-white tracking-wide">A2Z</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                  HEAVY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">لوحة تحكم العمليات المركزية</p>
            </div>
          </div>

          {/* System status pill */}
          <div className="mt-4 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Postgres & Redis Online</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950' : 'text-amber-500'}`} />
                  <div>
                    <div className="leading-snug">{item.title}</div>
                    <div className={`text-[10px] ${isActive ? 'text-slate-800' : 'text-slate-500'} font-mono`}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-slate-950 text-amber-400'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <Store className="w-4 h-4 text-amber-500" />
            <span>العودة لمتجر المعدات والكتالوج</span>
            <ChevronLeft className="w-3.5 h-3.5 mr-auto text-slate-500" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors text-right cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>تسجيل الخروج (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Desktop Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">بيئة التشغيل:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Production Ready (20k+ SKU Engine)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>مدير العمليات:</span>
              <span className="font-mono text-amber-400 font-bold">{user?.email}</span>
            </div>
          </div>
        </header>

        {/* Injected View Content */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
