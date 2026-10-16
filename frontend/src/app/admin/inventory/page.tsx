'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Boxes,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Save,
  X,
  TrendingUp,
  Percent,
  RefreshCw,
  HardHat,
  Sparkles,
} from 'lucide-react';
import { api, ProductItem } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Edit form state
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [editCostPrice, setEditCostPrice] = useState<number>(0);
  const [editCompareAtPrice, setEditCompareAtPrice] = useState<number>(0);
  const [editLowStockAlert, setEditLowStockAlert] = useState<number>(5);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch up to 50 items for admin inventory table
      const res = await api.getProducts({ limit: 50 });
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to load products for inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openQuickEdit = (product: ProductItem) => {
    setSelectedProduct(product);
    setEditPrice(Number(product.price));
    setEditStock(product.stock);
    setEditCostPrice(Number((product as any).costPrice) || Math.round(Number(product.price) * 0.65));
    setEditCompareAtPrice(Number(product.compareAtPrice) || 0);
    setEditLowStockAlert((product as any).lowStockAlert || 5);
  };

  const handleSaveQuickEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setIsSaving(true);
      const res = await api.quickUpdateProduct(selectedProduct.id, {
        price: editPrice,
        stock: editStock,
        costPrice: editCostPrice,
        compareAtPrice: editCompareAtPrice > 0 ? editCompareAtPrice : undefined,
        lowStockAlert: editLowStockAlert,
      });

      if (res.success && res.data) {
        const updated = res.data.product;
        setProducts((prev) =>
          prev.map((p) =>
            p.id === selectedProduct.id
              ? {
                  ...p,
                  price: updated.price,
                  stock: updated.stock,
                  compareAtPrice: updated.compareAtPrice ?? undefined,
                  costPrice: updated.costPrice ?? undefined,
                }
              : p,
          ),
        );
        setSelectedProduct(null);
        showNotification(`تم تحديث القطعة (${updated.sku}) بنجاح`);
      }
    } catch (err: any) {
      showNotification(err.message || 'فشل تحديث بيانات القطعة');
    } finally {
      setIsSaving(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Filter products by search and low-stock filter
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const oem = ((p.attributes as any)?.oem || '').toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        oem.includes(q) ||
        (p.category?.name || '').toLowerCase().includes(q);

      const matchesLowStock = lowStockOnly ? p.stock <= 8 : true;

      return matchesSearch && matchesLowStock;
    });
  }, [products, searchQuery, lowStockOnly]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 px-5 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2 border border-amber-300 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>محرك التعديل السريع للمخزون والأسعار</span>
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg font-mono font-bold">
              36+ قطع غيار
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            تعديل فوري ومباشر لسعر البيع، كمية المخزون المادي، وأسعار التكلفة بدون إعادة رفع كامل بيانات الكتالوج
          </p>
        </div>

        <Button
          onClick={fetchProducts}
          variant="outline"
          className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 self-start sm:self-auto gap-2"
        >
          <RefreshCw className="w-4 h-4 text-amber-500" />
          <span>تحديث المستودع</span>
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث فوري برقم الـ SKU، رقم OEM (مثل: 1R-0716)، أو اسم القطعة..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Low Stock Filter Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
              lowStockOnly
                ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-lg shadow-red-500/10'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${lowStockOnly ? 'text-red-400' : 'text-slate-500'}`} />
            <span>تنبيه نقص المخزون (Low Stock &le; 8)</span>
            {lowStockOnly && <span className="bg-red-500 text-slate-950 px-1.5 py-0.2 rounded font-mono text-[10px]">مفعل</span>}
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-4 px-4">صورة القطعة</th>
                <th className="py-4 px-4">اسم القطعة والمعدة</th>
                <th className="py-4 px-4">رقم SKU و OEM</th>
                <th className="py-4 px-4">المخزون الميداني</th>
                <th className="py-4 px-4">سعر البيع</th>
                <th className="py-4 px-4">سعر التكلفة التقديري</th>
                <th className="py-4 px-4">هامش الربح</th>
                <th className="py-4 px-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>جاري تحميل بيانات الكتالوج والمخزون...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    لم يتم العثور على أي قطعة تطابق شروط البحث الحالية
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const salePrice = Number(p.price);
                  const costPrice =
                    Number((p as any).costPrice) || Math.round(salePrice * 0.65);
                  const profit = Math.max(0, salePrice - costPrice);
                  const marginPct = salePrice > 0 ? Math.round((profit / salePrice) * 100) : 0;
                  const oem = (p.attributes as any)?.oem || p.sku;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center overflow-hidden shrink-0">
                          {p.images && p.images[0]?.url ? (
                            <img
                              src={p.images[0].url}
                              alt={p.title}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Boxes className="w-6 h-6 text-slate-600" />
                          )}
                        </div>
                      </td>

                      {/* Title & Brand */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-200 text-xs line-clamp-1">
                          {p.title}
                        </div>
                        <div className="text-[10px] text-amber-500 font-semibold mt-0.5">
                          {p.category?.name || 'معدات ثقيلة'}
                        </div>
                      </td>

                      {/* SKU & OEM */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-amber-400 text-xs">
                          {p.sku}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          OEM: {oem}
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-black border ${
                            p.stock === 0
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : p.stock <= 8
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          <span>{p.stock}</span>
                          <span className="text-[10px] font-normal">
                            {p.stock === 0 ? 'نفد' : 'قطعة'}
                          </span>
                        </span>
                      </td>

                      {/* Sale Price */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white text-sm">
                          ${salePrice.toLocaleString()}
                        </div>
                        {p.compareAtPrice && Number(p.compareAtPrice) > salePrice && (
                          <div className="text-[10px] text-slate-500 line-through font-mono">
                            ${Number(p.compareAtPrice).toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Cost Price */}
                      <td className="py-3 px-4 font-mono text-slate-400 text-xs">
                        ${costPrice.toLocaleString()}
                      </td>

                      {/* Margin % */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400">
                          <TrendingUp className="w-3 h-3" />
                          <span>{marginPct}%</span>
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono">
                          +${profit.toFixed(0)}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => openQuickEdit(p)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل سريع</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Edit Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    تعديل سريع للقطعة والمخزون
                  </h3>
                  <p className="text-xs text-amber-400 font-mono">
                    SKU: {selectedProduct.sku}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveQuickEdit} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                <div className="font-bold text-white text-sm mb-1">{selectedProduct.title}</div>
                <div className="text-slate-500 text-[11px]">
                  التصنيف: {selectedProduct.category?.name || 'معدات ثقيلة'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Sale Price */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    سعر البيع الحالي ($ USD):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    المخزون المتوفر (قطع):
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editStock}
                    onChange={(e) => setEditStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-amber-400 font-mono focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    سعر التكلفة ($ Cost):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Compare At Price */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    سعر الشطب القديم ($ Compare):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editCompareAtPrice}
                    onChange={(e) => setEditCompareAtPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Threshold */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  حد التحذير من انخفاض المخزون (Low Stock Alert):
                </label>
                <input
                  type="number"
                  min="1"
                  value={editLowStockAlert}
                  onChange={(e) => setEditLowStockAlert(parseInt(e.target.value, 10) || 5)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={isSaving}
                  variant="cat"
                  className="flex-1 font-bold py-2.5 rounded-xl justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>حفظ التعديلات فورياً في قاعدة البيانات</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  variant="outline"
                  className="border-slate-800 bg-slate-950 text-slate-300 px-4 py-2.5 rounded-xl"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
