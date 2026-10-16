'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Search,
  Building2,
  Calendar,
  Weight,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  X,
  HardHat,
  QrCode,
  Truck,
  Download,
  RefreshCw,
  Stamp,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminInvoices();
      if (res.success && res.data) {
        setInvoices(res.data.invoices);
      }
    } catch (err) {
      console.error('Failed to load corporate invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.orderNumber.toLowerCase().includes(q) ||
      inv.buyer.companyName.toLowerCase().includes(q) ||
      inv.buyer.taxNumber.includes(q)
    );
  });

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>الفواتير الضريبية للشركات والمقاولين</span>
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg font-mono font-bold">
              ZATCA B2B Invoices
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            إصدار وطباعة الفواتير الضريبية المعتمدة لقطاع الإنشاءات والمعدات الثقيلة مع حساب الأوزان والضريبة (15%)
          </p>
        </div>

        <Button
          onClick={fetchInvoices}
          variant="outline"
          className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 self-start sm:self-auto gap-2"
        >
          <RefreshCw className="w-4 h-4 text-amber-500" />
          <span>تحديث الفواتير</span>
        </Button>
      </div>

      {/* Search Input */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم الفاتورة (INV-...)، اسم شركة المقاولات، أو الرقم الضريبي..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-4 px-4">رقم الفاتورة / الطلب</th>
                <th className="py-4 px-4">شركة المقاولات والمشتري</th>
                <th className="py-4 px-4">الرقم الضريبي (VAT ID)</th>
                <th className="py-4 px-4">تاريخ الإصدار</th>
                <th className="py-4 px-4">وزن الشحنة</th>
                <th className="py-4 px-4">المجموع شامل الضريبة (15%)</th>
                <th className="py-4 px-4">حالة التسوية</th>
                <th className="py-4 px-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>جاري تجميع الفواتير الضريبية للشركات...</span>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    لا توجد فواتير ضريبية تطابق معايير البحث
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.invoiceNumber} className="hover:bg-slate-800/40 transition-colors">
                    {/* Invoice & Order Number */}
                    <td className="py-4 px-4">
                      <div className="font-mono font-bold text-amber-400 text-sm">
                        {inv.invoiceNumber}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        أمر الشراء: {inv.orderNumber}
                      </div>
                    </td>

                    {/* Buyer Company */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{inv.buyer.companyName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {inv.buyer.contactPerson} ({inv.buyer.siteAddress})
                      </div>
                    </td>

                    {/* VAT ID */}
                    <td className="py-4 px-4">
                      <div className="font-mono font-semibold text-slate-300">
                        {inv.buyer.taxNumber}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        س.ت: {inv.buyer.crNumber}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 font-mono text-slate-400">
                      {new Date(inv.issueDate).toLocaleDateString('ar-SA')}
                    </td>

                    {/* Cargo Weight */}
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1 font-mono text-slate-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md text-[11px]">
                        <Weight className="w-3 h-3 text-amber-500" />
                        <span>{inv.logistics.totalWeightKg} kg</span>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-4">
                      <div className="font-mono font-black text-white text-sm">
                        ${inv.pricing.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-amber-400 font-mono">
                        (شامل ضريبة ${inv.pricing.vatAmount})
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{inv.status}</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>عرض وطباعة</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Tax Invoice Printable Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          {/* Printable Container */}
          <div className="bg-white text-slate-900 rounded-3xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl relative my-auto print:m-0 print:p-8 print:w-full print:shadow-none print:rounded-none">
            {/* Modal Controls (Hidden in print) */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                  معاينة الفاتورة الضريبية الرسمية
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedInvoice.invoiceNumber}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePrint}
                  variant="cat"
                  className="text-xs font-bold py-2 px-4 rounded-xl gap-2 shadow-md shadow-amber-500/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الفاتورة (Print / PDF)</span>
                </Button>

                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ====== INVOICE DOCUMENT HEADER ====== */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-slate-900">
              {/* Seller Details */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                    <HardHat className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      AtoZ Heavy Equipment Co.
                    </h2>
                    <p className="text-xs font-bold text-amber-600">
                      شركة AtoZ لقطع غيار ومعدات الآليات الثقيلة المحدودة
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-0.5">
                  <p>الرقم الضريبي (VAT ID): <strong className="font-mono text-slate-900">{selectedInvoice.seller.taxNumber}</strong></p>
                  <p>السجل التجاري (CR): <strong className="font-mono text-slate-900">{selectedInvoice.seller.crNumber}</strong></p>
                  <p>{selectedInvoice.seller.address}</p>
                  <p>هاتف: {selectedInvoice.seller.phone} | بريد: {selectedInvoice.seller.email}</p>
                </div>
              </div>

              {/* Invoice Meta & QR Code */}
              <div className="flex items-start gap-4 self-end sm:self-auto text-left" dir="ltr">
                <div className="space-y-1 text-xs">
                  <div className="bg-slate-900 text-amber-400 font-mono font-bold px-3 py-1 rounded-lg text-sm text-center">
                    TAX INVOICE
                  </div>
                  <p className="font-mono font-bold text-slate-800 text-sm">
                    {selectedInvoice.invoiceNumber}
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    Order: <span className="font-mono font-bold">{selectedInvoice.orderNumber}</span>
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    Date: {new Date(selectedInvoice.issueDate).toLocaleDateString('en-GB')}
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    Due: {new Date(selectedInvoice.dueDate).toLocaleDateString('en-GB')}
                  </p>
                </div>

                {/* Simulated ZATCA QR Code */}
                <div className="w-24 h-24 border-2 border-slate-900 rounded-xl p-1 flex flex-col items-center justify-center bg-white shadow-inner">
                  <QrCode className="w-16 h-16 text-slate-900" />
                  <span className="text-[8px] font-mono font-bold uppercase text-slate-600">
                    ZATCA QR
                  </span>
                </div>
              </div>
            </div>

            {/* Buyer & Logistics Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
              {/* Buyer Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-slate-400 font-bold block mb-1">
                  العميل المشتري (Buyer Information):
                </span>
                <div className="text-sm font-bold text-slate-900 mb-1">
                  {selectedInvoice.buyer.companyName}
                </div>
                <div className="text-slate-700 space-y-0.5">
                  <p>الرقم الضريبي للمشتري: <strong className="font-mono text-slate-900">{selectedInvoice.buyer.taxNumber}</strong></p>
                  <p>السجل التجاري: <strong className="font-mono text-slate-900">{selectedInvoice.buyer.crNumber}</strong></p>
                  <p>المهندس المشرف: {selectedInvoice.buyer.contactPerson}</p>
                  <p>موقع التوريد: {selectedInvoice.buyer.siteAddress}</p>
                </div>
              </div>

              {/* Logistics & Cargo Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-slate-400 font-bold block mb-1">
                  بيانات الشحنة واللوجستيات (Cargo & Freight):
                </span>
                <div className="text-slate-700 space-y-1">
                  <p>الناقل الرسمي: <strong>{selectedInvoice.logistics.shippingCarrier}</strong></p>
                  <p>رقم البوليصة: <strong className="font-mono text-slate-900">{selectedInvoice.logistics.trackingNumber}</strong></p>
                  <div className="inline-flex items-center gap-1.5 mt-2 bg-amber-100 text-amber-950 font-mono font-bold px-3 py-1 rounded-xl text-xs">
                    <Weight className="w-3.5 h-3.5" />
                    <span>الوزن القائم الإجمالي: {selectedInvoice.logistics.totalWeightKg} kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-6">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">بيان القطعة والمعدة</th>
                    <th className="py-2.5 px-3">رقم OEM</th>
                    <th className="py-2.5 px-3">الوزن</th>
                    <th className="py-2.5 px-3">الكمية</th>
                    <th className="py-2.5 px-3">سعر الوحدة</th>
                    <th className="py-2.5 px-3 text-left">المجموع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedInvoice.items?.map((item: any, idx: number) => (
                    <tr key={item.sku} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {item.title}
                        <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-700">
                        {item.oemNumber}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {item.weightKg} kg
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        x{item.quantity}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        ${item.unitPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 text-left">
                        ${item.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tax Calculation & Settlement Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pt-4 border-t border-slate-300">
              {/* Authorized Stamp & Signatures */}
              <div className="w-full sm:w-1/2 space-y-4">
                <div className="p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex items-center gap-4">
                  <div className="w-14 h-14 border-2 border-emerald-600 text-emerald-700 rounded-full flex flex-col items-center justify-center font-bold text-[9px] uppercase leading-tight rotate-[-6deg]">
                    <span>ATOZ</span>
                    <span>VERIFIED</span>
                    <span>PAID</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <p className="font-bold text-slate-900">الاعتماد المالي ومستودع الشحن</p>
                    <p>فاتورة ضريبية رسمية صادرة إلكترونياً ومطابقة للمواصفات</p>
                  </div>
                </div>
              </div>

              {/* Totals Table */}
              <div className="w-full sm:w-1/2 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                  <span>المجموع الخاضع للضريبة (Subtotal):</span>
                  <span className="font-mono font-bold text-slate-900">
                    ${selectedInvoice.pricing.subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                  <span>ضريبة القيمة المضافة 15% (VAT 15%):</span>
                  <span className="font-mono font-bold text-amber-700">
                    ${selectedInvoice.pricing.vatAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                  <span>أجور الشحن والنقل الثقيل (Heavy Freight):</span>
                  <span className="font-mono font-bold text-slate-900">
                    ${selectedInvoice.pricing.shippingAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-2 text-base font-black text-slate-900 bg-amber-100 px-3 rounded-xl">
                  <span>المجموع الإجمالي الكلي (Total Due):</span>
                  <span className="font-mono">
                    ${selectedInvoice.pricing.totalAmount.toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
