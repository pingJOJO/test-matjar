'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Save,
  X,
  AlertCircle,
  Weight,
  Building2,
  MapPin,
  Phone,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Edit details modal state
  const [editTrackingNumber, setEditTrackingNumber] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminOrders({
        status: statusFilter,
        search: searchQuery,
      });
      if (res.success && res.data) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdatingStatus(orderId);
      const res = await api.updateAdminOrderStatus(orderId, { status: newStatus });
      if (res.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord)),
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
        }
        showNotification(`تم تحديث حالة الطلب إلى [${newStatus}] بنجاح`);
      }
    } catch (err: any) {
      showNotification(err.message || 'فشل تحديث حالة الطلب');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleSaveOrderDetails = async () => {
    if (!selectedOrder) return;
    try {
      setIsSavingDetails(true);
      const res = await api.updateAdminOrderStatus(selectedOrder.id, {
        status: selectedOrder.status,
        trackingNumber: editTrackingNumber,
        notes: editNotes,
      });
      if (res.success) {
        setOrders((prev) =>
          prev.map((ord) =>
            ord.id === selectedOrder.id
              ? { ...ord, trackingNumber: editTrackingNumber, notes: editNotes }
              : ord,
          ),
        );
        setSelectedOrder((prev: any) => ({
          ...prev,
          trackingNumber: editTrackingNumber,
          notes: editNotes,
        }));
        showNotification('تم حفظ رقم التتبع وملاحظات التجهيز');
      }
    } catch (err: any) {
      showNotification(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setIsSavingDetails(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setEditTrackingNumber(order.trackingNumber || '');
    setEditNotes(order.notes || '');
  };

  const statusOptions = [
    { value: 'ALL', label: 'كافة الحالات' },
    { value: 'PENDING', label: 'معلق' },
    { value: 'PROCESSING', label: 'قيد التجهيز' },
    { value: 'SHIPPED', label: 'جاري الشحن' },
    { value: 'DELIVERED', label: 'تم التسليم' },
    { value: 'CANCELLED', label: 'ملغي' },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 px-5 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2 border border-amber-300 animate-in fade-in slide-in-from-top-4 duration-300">
          <FileCheck className="w-5 h-5" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>إدارة طلبات المقاولات والمشاريع الميدانية</span>
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg font-mono font-bold">
              {orders.length} طلبات
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            التحكم في أوامر التوريد، تتبع أرقام البوالص، وتحديث حالات الشحن الفورية
          </p>
        </div>

        <Button
          onClick={fetchOrders}
          variant="outline"
          className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 self-start sm:self-auto gap-2"
        >
          <RefreshCw className="w-4 h-4 text-amber-500" />
          <span>تحديث الطلبات</span>
        </Button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === opt.value
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الطلب (ORD-...)، اسم المقاول، أو التتبع..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-4 px-4">رقم الطلب / التاريخ</th>
                <th className="py-4 px-4">شركة المقاولات / المهندس</th>
                <th className="py-4 px-4">الموقع الميداني</th>
                <th className="py-4 px-4">الوزن الإجمالي</th>
                <th className="py-4 px-4">المبلغ الكلي</th>
                <th className="py-4 px-4">حالة الطلب (تغيير فوري)</th>
                <th className="py-4 px-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>جاري تحميل بيانات الطلبات...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    لم يتم العثور على أي طلبات تطابق الفلتر الحالي
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Order Number & Date */}
                    <td className="py-4 px-4">
                      <div className="font-mono font-bold text-amber-400 text-sm">
                        {order.orderNumber}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('ar-SA')} -{' '}
                        {new Date(order.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Contractor & Company */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{order.companyName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {order.customerName} ({order.customerPhone})
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        الرقم الضريبي: {order.taxNumber}
                      </div>
                    </td>

                    {/* Site Location */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{order.siteLocation}</span>
                      </div>
                    </td>

                    {/* Weight */}
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1 font-mono font-semibold text-slate-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md text-[11px]">
                        <Weight className="w-3 h-3 text-amber-500" />
                        <span>{order.totalWeightKg} kg</span>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-4">
                      <div className="font-mono font-bold text-white text-sm">
                        ${order.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        {order.paymentStatus}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-4 px-4">
                      <div className="relative">
                        <select
                          disabled={isUpdatingStatus === order.id}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`bg-slate-950 border text-xs font-bold font-mono rounded-xl px-3 py-1.5 focus:outline-none transition-colors cursor-pointer ${
                            order.status === 'DELIVERED'
                              ? 'border-emerald-500/50 text-emerald-400'
                              : order.status === 'SHIPPED'
                              ? 'border-blue-500/50 text-blue-400'
                              : order.status === 'PROCESSING'
                              ? 'border-amber-500/50 text-amber-400'
                              : order.status === 'CANCELLED'
                              ? 'border-red-500/50 text-red-400'
                              : 'border-slate-700 text-slate-300'
                          }`}
                        >
                          <option value="PENDING">PENDING (معلق)</option>
                          <option value="PROCESSING">PROCESSING (قيد التجهيز)</option>
                          <option value="SHIPPED">SHIPPED (جاري الشحن)</option>
                          <option value="DELIVERED">DELIVERED (تم التسليم)</option>
                          <option value="CANCELLED">CANCELLED (ملغي)</option>
                        </select>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all"
                      >
                        <span>قطع الـ OEM</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <span>تفاصيل أمر التوريد:</span>
                    <span className="font-mono text-amber-400">{selectedOrder.orderNumber}</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    الحالة الحالية: <span className="text-white font-bold">{selectedOrder.status}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs">
              {/* Contractor & Location Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="space-y-1.5">
                  <span className="text-slate-400 block font-semibold">بيانات المقاول والشركة:</span>
                  <div className="font-bold text-white text-sm">{selectedOrder.companyName}</div>
                  <div className="text-slate-300">المهندس المسؤول: {selectedOrder.customerName}</div>
                  <div className="text-slate-400 font-mono">هاتف: {selectedOrder.customerPhone}</div>
                  <div className="text-amber-400 font-mono text-[11px]">
                    الرقم الضريبي: {selectedOrder.taxNumber}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-slate-400 block font-semibold">موقع التوريد الميداني:</span>
                  <div className="text-slate-200 font-medium">{selectedOrder.siteLocation}</div>
                  <div className="text-slate-400">البريد الإلكتروني: {selectedOrder.customerEmail}</div>
                  <div className="inline-flex items-center gap-1.5 mt-2 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 font-mono">
                    <Weight className="w-3.5 h-3.5 text-amber-500" />
                    <span>الوزن الإجمالي: {selectedOrder.totalWeightKg} kg</span>
                  </div>
                </div>
              </div>

              {/* OEM Parts List */}
              <div>
                <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-500" />
                  <span>قطع الغيار المطلوبة بأرقام الـ OEM الحقيقية:</span>
                </h3>

                <div className="border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <th className="py-2.5 px-3">القطعة</th>
                        <th className="py-2.5 px-3">رقم OEM</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">الوزن</th>
                        <th className="py-2.5 px-3">الكمية</th>
                        <th className="py-2.5 px-3">السعر</th>
                        <th className="py-2.5 px-3">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                      {selectedOrder.items?.map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-semibold text-slate-200">
                            {item.productTitle}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                            {item.oemNumber}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-400">
                            {item.productSku}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-300">
                            {item.weightKg} kg
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-white">
                            x{item.quantity}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-300">
                            ${item.unitPrice}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                            ${item.totalPrice}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Warehouse Tracking & Fulfillment Notes Form */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Save className="w-4 h-4 text-amber-500" />
                  <span>تحديث بوليصة الشحن وملاحظات التجهيز بالمستودع:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs mb-1 font-semibold">
                      رقم التتبع / بوليصة الشحن (Tracking Number):
                    </label>
                    <input
                      type="text"
                      value={editTrackingNumber}
                      onChange={(e) => setEditTrackingNumber(e.target.value)}
                      placeholder="DHL-SA-98214 أو ARAMEX-HE-..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs mb-1 font-semibold">
                      ملاحظات المستودع وفريق التحميل:
                    </label>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="تم التغليف بالصناديق الخشبية المقواة..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveOrderDetails}
                  disabled={isSavingDetails}
                  variant="cat"
                  className="w-full text-xs font-bold py-2 rounded-xl justify-center gap-2"
                >
                  {isSavingDetails ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>حفظ بوليصة الشحن والملاحظات</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
