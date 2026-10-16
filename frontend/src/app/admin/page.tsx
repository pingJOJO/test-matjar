'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Package,
  AlertTriangle,
  Clock,
  Boxes,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Truck,
  CheckCircle2,
  ChevronLeft,
  XCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = async () => {
    try {
      setRefreshing(true);
      const res = await api.getAdminAnalytics();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" dir="rtl">
        <div className="h-8 bg-slate-800 rounded-lg w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  const overview = data?.overview || {
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalProducts: 36,
  };

  const recentOrders = data?.recentOrders || [];
  const urgentLowStock = data?.urgentLowStock || [];

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header with Title and Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>لوحة المؤشرات والعمليات المركزية</span>
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg font-mono font-bold">
              Heavy Parts Fleet
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            متابعة فورية للمبيعات، تجهيز شحنات المقاولات، وحركات مستودعات الآليات الثقيلة
          </p>
        </div>

        <Button
          onClick={fetchOverview}
          disabled={refreshing}
          variant="outline"
          className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 self-start sm:self-auto gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-500' : ''}`} />
          <span>تحديث المؤشرات</span>
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">إجمالي المبيعات المحصلة</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              ${overview.totalRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>مبيعات مدفوعة ومؤكدة عبر البوابة</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
        </div>

        {/* Card 2: Field Orders */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">الطلبات وقيد التجهيز</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {overview.totalOrders}
            </div>
            <div className="text-[11px] text-amber-400 flex items-center gap-1 mt-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{overview.processingOrders} طلبات بالمستودع للتحميل</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors" />
        </div>

        {/* Card 3: Low Stock Alerts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-red-500/40 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">تنبيهات نقص المخزون</span>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-red-400 font-mono">
              {overview.lowStockCount}
            </div>
            <div className="text-[11px] text-red-400/80 flex items-center gap-1 mt-1 font-mono">
              <XCircle className="w-3.5 h-3.5" />
              <span>{overview.outOfStockCount} قطع نفدت بالكامل</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-colors" />
        </div>

        {/* Card 4: Catalog Fleet */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">إجمالي قطع الكتالوج</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {overview.totalProducts}
            </div>
            <div className="text-[11px] text-blue-400 flex items-center gap-1 mt-1 font-mono">
              <span>CAT • Komatsu • JCB • Bobcat</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
        </div>
      </div>

      {/* Middle Split: Recent Orders & Low Stock Alert Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Latest Field Orders */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                <span>أحدث طلبات المقاولات والمشاريع</span>
              </h2>
              <p className="text-xs text-slate-400">سجل فوري لعمليات الشراء والتعميد الميداني</p>
            </div>

            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <span>عرض كافة الطلبات</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">رقم الطلب</th>
                  <th className="pb-3 font-semibold">الجهة / المقاول</th>
                  <th className="pb-3 font-semibold">القطع</th>
                  <th className="pb-3 font-semibold">المبلغ</th>
                  <th className="pb-3 font-semibold">الحالة</th>
                  <th className="pb-3 font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      لا توجد طلبات مسجلة بعد
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 font-mono font-bold text-amber-400">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5">
                        <div className="font-semibold text-slate-200">{order.companyName}</div>
                        <div className="text-[10px] text-slate-500">{order.customerName}</div>
                      </td>
                      <td className="py-3.5 font-mono text-slate-300">
                        {order.itemCount} قطعة
                      </td>
                      <td className="py-3.5 font-mono font-bold text-white">
                        ${order.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : order.status === 'SHIPPED'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : order.status === 'PROCESSING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {order.status === 'DELIVERED' && <CheckCircle2 className="w-3 h-3" />}
                          {order.status === 'SHIPPED' && <Truck className="w-3 h-3" />}
                          {order.status === 'PROCESSING' && <Clock className="w-3 h-3" />}
                          <span>{order.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-400 font-mono text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (1 col): Urgent Low Stock */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span>تنبيهات المخزون الحرج</span>
                </h2>
                <p className="text-xs text-slate-400">قطع غيار أوشكت على النفاد بالمستودعات</p>
              </div>

              <Link
                href="/admin/inventory"
                className="text-xs font-semibold text-amber-400 hover:text-amber-300"
              >
                تعديل المخزون
              </Link>
            </div>

            <div className="space-y-3">
              {urgentLowStock.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  كافة القطع متوفرة بمستويات آمنة
                </div>
              ) : (
                urgentLowStock.map((part: any) => (
                  <div
                    key={part.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-200 truncate">
                        {part.title}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        SKU: {part.sku}
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span
                        className={`inline-block font-mono font-black text-xs px-2.5 py-1 rounded-lg ${
                          part.stock === 0
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {part.stock === 0 ? 'نفد (0)' : `${part.stock} متبقي`}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        ${part.price}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <Link href="/admin/inventory">
              <Button
                variant="cat"
                className="w-full text-xs font-bold py-2.5 rounded-xl gap-2 justify-center shadow-lg shadow-amber-500/10"
              >
                <span>الانتقال لمحرك التعديل السريع للمخزون والأسعار</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
