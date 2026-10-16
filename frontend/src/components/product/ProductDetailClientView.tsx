"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Wrench,
  Scale,
  ShieldCheck,
  Truck,
  PhoneCall,
  FileText,
  Copy,
  Check,
  Sparkles,
  Clock,
  RotateCcw,
  Headphones,
  AlertTriangle,
} from "lucide-react";
import { ProductItem } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { useMachineStore } from "@/stores/useMachineStore";
import { formatWeight } from "@/lib/utils";
import { AddToCartDetailButton } from "@/app/products/[idOrSlug]/AddToCartDetailButton";

interface ProductDetailClientViewProps {
  product: ProductItem;
}

export function ProductDetailClientView({
  product,
}: ProductDetailClientViewProps) {
  const { lang, dir, t } = useLanguageStore();
  const { currency, formatPrice } = useCurrencyStore();
  const { activeMachine, checkFit, setFinderOpen } = useMachineStore();
  const [copiedSku, setCopiedSku] = useState(false);

  const isAr = lang === "ar";

  const primaryImage =
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80";

  const [activeImage, setActiveImage] = useState<string>(primaryImage);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const rawComp = product.attributes?.compatibleModels;
  const compatibleModels: string[] = Array.isArray(rawComp)
    ? rawComp
    : typeof rawComp === 'string'
    ? rawComp.split(',').map((s) => s.trim())
    : [];
  const replacementPartNumbers =
    (product.attributes?.replacementPartNumbers as string[]) || [];
  const engineModels = (product.attributes?.engineModels as string[]) || [];
  const fitmentNotes = (product.attributes?.fitmentNotes as string[]) || [];
  const equipmentTypes = (product.attributes?.equipmentTypes as string[]) || [];
  const detailLines = product.description
    ? product.description
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    : [];
  const originCountry = product.attributes?.originCountry as string | undefined;
  const manufacturer = product.attributes?.manufacturer as string | undefined;
  const warrantyMonths = (product.attributes?.warrantyMonths as number) || 12;
  const weightKg = Number(product.weightKg || (product.attributes?.weightKg as number) || 0);

  const regularPrice = Number(product.price);
  const listPrice = product.compareAtPrice ? Number(product.compareAtPrice) : 0;
  const hasDiscount = listPrice > regularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((listPrice - regularPrice) / listPrice) * 100)
    : 0;

  // Member price is 5% lower
  const memberPrice = Math.round(regularPrice * 0.95 * 100) / 100;

  // Fit status
  const fitStatus = checkFit(product);

  const handleCopySku = () => {
    if (typeof navigator !== "undefined" && product.sku) {
      navigator.clipboard.writeText(product.sku);
      setCopiedSku(true);
      setTimeout(() => setCopiedSku(false), 2000);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 py-8 pb-28 md:pb-16 font-sans"
      dir={dir}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-primary transition-colors">
            {isAr ? "الرئيسية" : "Home"}
          </Link>
          <span>/</span>
          <Link
            href="/products"
            className="hover:text-primary transition-colors"
          >
            {isAr ? "كتالوج قطع الغيار" : "Parts Catalog"}
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/products?categorySlug=${product.category.slug}`}
                className="hover:text-primary transition-colors font-mono"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="font-bold text-foreground sku-mono">
            {product.sku}
          </span>
        </div>

        {/* Product Main Section: Gallery (58%) & Buy Box (42%) (§3.3) */}
        <div className="rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-e1 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Gallery Container (Left 6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white border border-border p-4 shadow-xs">
              <Image
                src={activeImage}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain transition-all duration-200"
              />

              {/* Discount and OEM Badges */}
              <div
                className={`absolute top-4 ${isAr ? "right-4" : "left-4"} z-10 flex flex-col gap-1.5`}
              >
                {hasDiscount && (
                  <span className="bg-[#DC2626] text-white text-xs font-black px-2.5 py-1 rounded-full shadow-xs">
                    −{discountPercent}%
                  </span>
                )}
                {product.isFeatured && (
                  <span className="bg-[#0D5CB6] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-xs">
                    MUST BUY
                  </span>
                )}
              </div>

              <div
                className={`absolute top-4 ${isAr ? "left-4" : "right-4"} z-10`}
              >
                <span className="bg-[#111827] text-white text-xs font-bold font-mono px-3 py-1 rounded-md shadow-xs">
                  OEM: {product.sku}
                </span>
              </div>
            </div>

            {/* Gallery Thumbnails Strip (Angles & Views) */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto py-2 px-1 scrollbar-thin">
                {product.images.map((img, idx) => {
                  const isSelected = activeImage === img.url;
                  return (
                    <button
                      key={img.id || `${img.url}-${idx}`}
                      type="button"
                      onClick={() => setActiveImage(img.url)}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all p-1 bg-white cursor-pointer ${
                        isSelected
                          ? "border-[#0D5CB6] ring-2 ring-[#0D5CB6]/30 shadow-sm scale-102"
                          : "border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100"
                      }`}
                      title={img.altText || `${product.title} - angle ${idx + 1}`}
                    >
                      <Image
                        src={img.url}
                        alt={img.altText || `${product.title} - angle ${idx + 1}`}
                        fill
                        sizes="80px"
                        className="object-contain"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Heavy Freight Notice if > 50kg (§3.4) */}
            {weightKg > 50 && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                <Truck className="h-5 w-5 text-amber-600 shrink-0" />
                <span>
                  {isAr ? (
                    <>
                      <strong>شحن بضائع ثقيلة (Freight):</strong> هذه القطعة تزن{" "}
                      {formatWeight(weightKg, "ar")} وتتطلب شاحنة نقل مجهزة
                      برافعة هيدروليكية للتفريغ المباشر في موقع العمل.
                    </>
                  ) : (
                    <>
                      <strong>Heavy Freight Shipment:</strong> This assembly
                      weighs {formatWeight(weightKg, "en")} and requires a
                      dedicated liftgate freight truck to jobsite.
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Buy Box (Right 6 cols) (§3.3) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Status */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  {product.category?.name || "Heavy Equipment Aftermarket"}
                </span>

                <div>
                  {isOutOfStock ? (
                    <Badge variant="destructive">
                      {isAr ? "نفد المخزون" : "Out of Stock"}
                    </Badge>
                  ) : isLowStock ? (
                    <Badge variant="warning">
                      {isAr
                        ? `متبقي ${product.stock} قطع بالمستودع فقط!`
                        : `Only ${product.stock} left in stock!`}
                    </Badge>
                  ) : (
                    <Badge variant="success">
                      {isAr
                        ? `متوفر بالمستودع (${product.stock} قطع)`
                        : `In Stock (${product.stock} available)`}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">
                {product.title}
              </h1>

              {/* Fits Summary Line (§3.3) */}
              {compatibleModels.length > 0 && (
                <p className="text-xs text-muted-foreground font-medium">
                  {isAr ? "متوافق مع: " : "Fits: "}
                  <span className="font-semibold text-foreground">
                    {compatibleModels.slice(0, 4).join(", ")}
                    {compatibleModels.length > 4
                      ? ` · +${compatibleModels.length - 4} more machines`
                      : ""}
                  </span>
                </p>
              )}

              {/* Sku & OEM in Mono with Copy Button (§3.3) */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-mono border-y border-border py-2.5">
                <div className="flex items-center gap-1.5">
                  <span>
                    OEM / Part No:{" "}
                    <strong className="text-foreground sku-mono">
                      {product.sku}
                    </strong>
                  </span>
                  <button
                    onClick={handleCopySku}
                    className="p-1 text-slate-400 hover:text-foreground rounded cursor-pointer"
                    title="Copy Part Number"
                  >
                    {copiedSku ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                {manufacturer && (
                  <span>
                    Make:{" "}
                    <strong className="text-foreground">{manufacturer}</strong>
                  </span>
                )}
                {originCountry && (
                  <span>
                    Origin:{" "}
                    <strong className="text-foreground">{originCountry}</strong>
                  </span>
                )}
              </div>

              {/* Compatibility Fit Banner (§4.2) */}
              {activeMachine ? (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    fitStatus === "exact"
                      ? "bg-[#DCFCE7] border-[#15803D]/30 text-[#15803D]"
                      : fitStatus === "likely"
                        ? "bg-[#FEF3C7] border-[#B45309]/30 text-[#B45309]"
                        : "bg-muted border-border text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span className="font-bold">
                      {fitStatus === "exact"
                        ? `Guaranteed 100% Fit for your ${activeMachine.label}`
                        : fitStatus === "likely"
                          ? `Likely compatible with ${activeMachine.make}`
                          : `Compatibility with ${activeMachine.label} requires verification`}
                    </span>
                  </div>
                  <button
                    onClick={() => setFinderOpen(true)}
                    className="text-[11px] font-bold underline cursor-pointer"
                  >
                    Change Machine
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setFinderOpen(true)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 text-[#0D5CB6] text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    <span>Check Compatibility with Your Equipment</span>
                  </div>
                  <span>Select Model →</span>
                </button>
              )}

              {/* Price Block (§3.3) */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-3">
                    <div className="text-3xl font-black text-[#B91C1C] sku-mono tracking-tight">
                      {formatPrice(regularPrice, currency, lang)}
                    </div>
                    {hasDiscount && (
                      <span className="text-sm text-muted-foreground line-through sku-mono">
                        {formatPrice(listPrice, currency, lang)}
                      </span>
                    )}
                  </div>

                  {hasDiscount && (
                    <Badge variant="discount">
                      Save{" "}
                      {formatPrice(listPrice - regularPrice, currency, lang)} (
                      {discountPercent}%)
                    </Badge>
                  )}
                </div>

                {/* Member Club Savings Strip (§3.3) */}
                <div className="flex items-center justify-between pt-2 border-t border-border/80 text-xs text-[#0F766E]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="bg-[#0F766E]/10 border border-[#0F766E]/30 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      Member Price
                    </span>
                    <span className="sku-mono font-bold text-sm">
                      {formatPrice(memberPrice, currency, lang)}
                    </span>
                  </div>
                  <Link
                    href="/#member-club"
                    className="text-[11px] hover:underline font-medium"
                  >
                    Earn 2-5% cashback points · Join Club
                  </Link>
                </div>
              </div>

              {/* Advisory Callout (§3.3) */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900">
                <AlertTriangle className="h-4 w-4 text-[#0D5CB6] shrink-0" />
                <span>
                  <strong>Advisory:</strong> Certified master technician
                  installation recommended. Clean fuel and hydraulic lines
                  before mounting replacement part.
                </span>
              </div>

              {/* Quantity Stepper & Add To Cart Button */}
              <AddToCartDetailButton
                productId={product.id}
                stock={product.stock}
              />

              {/* Direct Field Engineer Consultation Phone */}
              <div className="pt-2">
                <a
                  href="tel:+18002297278"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <PhoneCall className="h-4 w-4 text-[#FFB800]" />
                  <span>
                    Direct Emergency Dispatch Helpline (+1-800-A2Z-PART)
                  </span>
                </a>
              </div>
            </div>

            {/* 4 Trust Items (§3.3) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border pt-5 text-center text-xs text-slate-600">
              <div className="space-y-1">
                <ShieldCheck className="h-5 w-5 text-emerald-600 mx-auto" />
                <span className="font-bold block text-foreground">
                  100k+ Fleets
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Top Choice
                </span>
              </div>
              <div className="space-y-1">
                <Clock className="h-5 w-5 text-blue-600 mx-auto" />
                <span className="font-bold block text-foreground">
                  1-Year Warranty
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Full Peace of Mind
                </span>
              </div>
              <div className="space-y-1">
                <RotateCcw className="h-5 w-5 text-amber-600 mx-auto" />
                <span className="font-bold block text-foreground">
                  90-Day Returns
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Hassle-Free Policy
                </span>
              </div>
              <div className="space-y-1">
                <Headphones className="h-5 w-5 text-purple-600 mx-auto" />
                <span className="font-bold block text-foreground">
                  24/7 Service
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Heavy Engineers
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Highlights & Fitment Tables (§3.3) */}
        <div className="mt-10 rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-e1 space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Technical Specifications & Compatibility Fitment
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            {/* Compatible Models List */}
            {compatibleModels.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-foreground flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Wrench className="h-4 w-4 text-primary" />
                  Compatible Equipment Models ({compatibleModels.length}):
                </h3>
                <div className="flex flex-wrap gap-2">
                  {compatibleModels.map((model, idx) => (
                    <span
                      key={idx}
                      className={`rounded-md border px-2.5 py-1 text-xs font-semibold sku-mono shadow-xs ${
                        activeMachine &&
                        activeMachine.model
                          .toLowerCase()
                          .includes(model.toLowerCase())
                          ? "bg-[#DCFCE7] border-[#15803D] text-[#15803D] font-bold"
                          : "border-border bg-muted/40 text-foreground"
                      }`}
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {replacementPartNumbers.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-foreground flex items-center gap-2 text-xs uppercase tracking-wider">
                  <FileText className="h-4 w-4 text-primary" />
                  Replacement Part Numbers ({replacementPartNumbers.length}):
                </h3>
                <div className="flex flex-wrap gap-2">
                  {replacementPartNumbers
                    .slice(0, 36)
                    .map((partNumber, idx) => (
                      <span
                        key={`${partNumber}-${idx}`}
                        className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-semibold sku-mono text-foreground shadow-xs"
                      >
                        {partNumber}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Engineering Specs Table */}
            <div className="space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2 text-xs uppercase tracking-wider">
                <Scale className="h-4 w-4 text-primary" />
                Physical Specifications & Weight:
              </h3>
              <div className="rounded-xl border border-border overflow-hidden divide-y divide-border text-xs">
                <div className="flex justify-between p-3 bg-muted/30">
                  <span className="text-muted-foreground">Net Weight:</span>
                  <span className="font-bold text-foreground sku-mono">
                    {formatWeight(weightKg, lang)}
                  </span>
                </div>
                {originCountry && (
                  <div className="flex justify-between p-3 bg-white">
                    <span className="text-muted-foreground">
                      Country of Origin:
                    </span>
                    <span className="font-bold text-foreground">
                      {originCountry}
                    </span>
                  </div>
                )}
                {product.attributes?.ratedPressureBar && (
                  <div className="flex justify-between p-3 bg-muted/30">
                    <span className="text-muted-foreground">
                      Rated Operating Pressure:
                    </span>
                    <span className="font-bold text-foreground sku-mono">
                      {product.attributes.ratedPressureBar} Bar
                    </span>
                  </div>
                )}
                {product.attributes?.displacement && (
                  <div className="flex justify-between p-3 bg-white">
                    <span className="text-muted-foreground">Displacement:</span>
                    <span className="font-bold text-foreground sku-mono">
                      {product.attributes.displacement}
                    </span>
                  </div>
                )}
                {equipmentTypes.length > 0 && (
                  <div className="flex justify-between gap-4 p-3 bg-white">
                    <span className="text-muted-foreground">
                      Equipment Type:
                    </span>
                    <span className="font-bold text-foreground text-right">
                      {equipmentTypes.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {(engineModels.length > 0 ||
            fitmentNotes.length > 0 ||
            detailLines.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm border-t border-border pt-6">
              {engineModels.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-foreground flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Wrench className="h-4 w-4 text-primary" />
                    Engine Models ({engineModels.length}):
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {engineModels.slice(0, 48).map((model, idx) => (
                      <span
                        key={`${model}-${idx}`}
                        className="rounded-md border border-border bg-white px-2.5 py-1 text-xs font-semibold sku-mono text-foreground shadow-xs"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-bold text-foreground flex items-center gap-2 text-xs uppercase tracking-wider">
                  <FileText className="h-4 w-4 text-primary" />
                  Product Details:
                </h3>
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-xs leading-relaxed text-slate-700">
                  {(fitmentNotes.length > 0 ? fitmentNotes : detailLines)
                    .slice(0, 8)
                    .map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
