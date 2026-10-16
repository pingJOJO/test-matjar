'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { useCurrencyStore } from '@/stores/useCurrencyStore';
import { api, CustomerOrder } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { lang, dir } = useLanguageStore();
  const { formatPrice } = useCurrencyStore();
  const isAr = lang === 'ar';

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    setErrorMessage(null);
    try {
      const res = await api.getMyOrders({ limit: 50 });
      if (res && res.data) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || (isAr ? 'تعذر جلب قائمة الطلبات' : 'Failed to load your orders'),
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchOrders();
      } else {
        setLoadingOrders(false);
      }
    }
  }, [authLoading, isAuthenticated]);

  const getOrderStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{isAr ? 'تم التسليم' : 'Delivered'}</span>
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <Truck className="h-3.5 w-3.5" />
            <span>{isAr ? 'تم الشحن' : 'Shipped'}</span>
          </span>
        );
      case 'PROCESSING':
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="h-3.5 w-3.5" />
            <span>{isAr ? 'قيد التجهيز' : 'Processing'}</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="h-3.5 w-3.5" />
            <span>{isAr ? 'ملغي' : 'Cancelled'}</span>
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5" />
            <span>{isAr ? 'قيد الانتظار' : 'Pending'}</span>
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="h-3 w-3" />
            <span>{isAr ? 'مدفوع' : 'Paid'}</span>
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
            <span>{isAr ? 'مسترجع' : 'Refunded'}</span>
          </span>
        );
      case 'UNPAID':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
            <CreditCard className="h-3 w-3" />
            <span>{isAr ? 'بانتظار الدفع' : 'Unpaid'}</span>
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat(isAr ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return dateString;
    }
  };

  // 1. Loading State
  if (authLoading || (loadingOrders && isAuthenticated)) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8" dir={dir}>
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-white rounded-xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-slate-50 flex items-center justify-center py-12 px-4" dir={dir}>
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#0D5CB6]/10 text-[#0D5CB6] mx-auto flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              {isAr ? 'سجل الدخول لعرض طلباتك' : 'Sign in to view your orders'}
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr
                ? 'يرجى تسجيل الدخول إلى حسابك الشخصي لمتابعة طلبات قطع الغيار وحالات الشحن والتسليم الميداني.'
                : 'Please sign in to track your equipment parts orders, shipments, and delivery status.'}
            </p>
          </div>
          <Link
            href="/login?redirect=/orders"
            className="flex h-11 w-full items-center justify-center rounded-lg bg-[#0D5CB6] hover:bg-[#0B4F9C] text-white font-bold text-sm transition-colors shadow-xs"
          >
            {isAr ? 'تسجيل الدخول الآن' : 'Sign In Now'}
          </Link>
          <div className="pt-2">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1 font-semibold"
            >
              <span>{isAr ? 'العودة للصفحة الرئيسية' : 'Back to Home'}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans" dir={dir}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <Link href="/" className="hover:text-primary transition-colors">
            {isAr ? 'الرئيسية' : 'Home'}
          </Link>
          <span>/</span>
          <span className="text-slate-900">{isAr ? 'طلباتي والشحنات' : 'My Orders'}</span>
        </div>

        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
              <Package className="h-7 w-7 text-[#0D5CB6]" />
              <span>{isAr ? 'طلباتي وتتبع الشحنات' : 'My Orders & Shipments'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isAr
                ? 'متابعة سجل المشتريات، القطع المطلوبة، وحالات الشحن الميداني للطلبات الخاصة بك.'
                : 'Track your equipment spare parts order history, dispatch progress, and delivery details.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 gap-1.5 text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{isAr ? 'تحديث' : 'Refresh'}</span>
            </Button>
            <Link href="/products">
              <Button
                variant="default"
                size="sm"
                className="bg-[#0D5CB6] hover:bg-[#0B4F9C] text-white gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>{isAr ? 'تصفح الكتالوج' : 'Browse Parts'}</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={fetchOrders}
              className="text-xs underline text-rose-900 hover:text-rose-950 font-bold cursor-pointer"
            >
              {isAr ? 'إعادة المحاولة' : 'Try Again'}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loadingOrders && orders.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {isAr ? 'لا توجد طلبات مسجلة حتى الآن' : 'No orders found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {isAr
                  ? 'لم تقم بإنشاء أي طلبات قطع غيار حتى الآن. تصفح كتالوج الآليات الثقيلة واختر القطع المطلوبة لمعداتك.'
                  : 'You have not placed any orders yet. Explore our comprehensive heavy equipment catalog and place your first order.'}
              </p>
            </div>
            <div className="pt-2">
              <Link href="/products">
                <Button
                  className="bg-[#0D5CB6] hover:bg-[#0B4F9C] text-white font-bold text-xs h-10 px-6 cursor-pointer shadow-xs"
                >
                  <span>{isAr ? 'تصفح كافة قطع الغيار' : 'Browse All Parts'}</span>
                  <ArrowRight className={`h-4 w-4 ms-2 ${isAr ? 'rotate-180' : ''}`} />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Orders List */}
        {!loadingOrders && orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => {
              const subtotalNum = Number(order.subtotal) || 0;
              const totalAmountNum = Number(order.totalAmount) || 0;
              const shippingNum = Number(order.shippingAmount) || 0;
              const taxNum = Number(order.taxAmount) || 0;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      {/* Order Number */}
                      <div>
                        <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                          {isAr ? 'رقم الطلب' : 'Order Number'}
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {order.orderNumber}
                        </span>
                      </div>

                      {/* Date */}
                      <div>
                        <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                          {isAr ? 'تاريخ الطلب' : 'Placed On'}
                        </span>
                        <span className="font-medium text-slate-700 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{formatDate(order.createdAt)}</span>
                        </span>
                      </div>

                      {/* Total Amount */}
                      <div>
                        <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                          {isAr ? 'المبلغ الإجمالي' : 'Total Amount'}
                        </span>
                        <span className="font-mono font-black text-slate-900 text-sm text-[#0D5CB6]">
                          {formatPrice(totalAmountNum)}
                        </span>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-2">
                      {getPaymentStatusBadge(order.paymentStatus)}
                      {getOrderStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Card Body: Items */}
                  <div className="p-4 sm:p-6 divide-y divide-slate-100">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item) => (
                        <div
                          key={item.id}
                          className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Product Thumbnail */}
                            <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                              {item.productImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.productImage}
                                  alt={item.productTitle}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-slate-400" />
                              )}
                            </div>

                            {/* Title & SKU */}
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                                {item.productTitle}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">
                                  SKU: {item.productSku}
                                </span>
                                <span>•</span>
                                <span>
                                  {isAr ? 'الكمية:' : 'Qty:'} <strong className="text-slate-900">{item.quantity}</strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                              {formatPrice(Number(item.totalPrice) || Number(item.unitPrice) * item.quantity)}
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {formatPrice(Number(item.unitPrice))} {isAr ? '/ للقطعة' : 'ea'}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-xs text-slate-400 text-center font-medium">
                        {isAr ? 'لا توجد تفاصيل للقطع' : 'No line items recorded'}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Summary & Destination */}
                  <div className="px-4 sm:px-6 py-3 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        {isAr ? 'وجهة الشحن:' : 'Ship to:'}{' '}
                        <strong className="text-slate-800">
                          {order.shippingAddress?.fullName || order.customerEmail || 'Jobsite'}
                        </strong>
                        {order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ''}
                        {order.shippingAddress?.country ? ` (${order.shippingAddress.country})` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
                      {shippingNum > 0 && (
                        <span>
                          {isAr ? 'الشحن:' : 'Freight:'} {formatPrice(shippingNum)}
                        </span>
                      )}
                      {taxNum > 0 && (
                        <span>
                          {isAr ? 'الضريبة:' : 'Tax:'} {formatPrice(taxNum)}
                        </span>
                      )}
                      <span>
                        {isAr ? 'إجمالي الطلب:' : 'Total:'}{' '}
                        <strong className="text-slate-900 font-bold">{formatPrice(totalAmountNum)}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
