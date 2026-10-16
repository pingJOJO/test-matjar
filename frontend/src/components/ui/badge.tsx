import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "cat"
    | "komatsu"
    | "success"
    | "warning"
    | "royal"
    | "discount"
    | "clearance"
    | "must-buy"
    | "member"
    | "fit"
    | "stock"
    | "low-stock";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    royal: "bg-[#0D5CB6] text-white font-bold",
    default: "bg-[#0D5CB6] text-white font-semibold",
    secondary: "bg-slate-100 text-slate-800 border border-slate-200",
    destructive: "bg-[#DC2626] text-white font-bold",
    outline: "text-slate-800 border border-control bg-white",
    cat: "bg-[#0D5CB6] text-white font-bold",
    komatsu: "bg-[#0D5CB6] text-white font-semibold",
    success: "bg-emerald-600 text-white font-medium",
    warning: "bg-amber-100 text-amber-900 border border-amber-300 font-medium",
    discount: "bg-[#DC2626] text-white font-bold px-2 py-0.5 text-xs rounded-full shadow-xs tracking-tight",
    clearance: "bg-[#DC2626] text-white font-extrabold px-2 py-0.5 text-[11px] rounded uppercase tracking-wider",
    "must-buy": "bg-[#0D5CB6] text-white font-extrabold px-2 py-0.5 text-[11px] rounded uppercase tracking-wider",
    member: "bg-[#0F766E] text-white font-semibold px-2 py-0.5 text-xs rounded",
    fit: "bg-[#DCFCE7] text-[#15803D] border border-[#15803D]/30 font-semibold px-2 py-0.5 text-xs rounded-full",
    stock: "bg-[#DCFCE7] text-[#15803D] border border-[#15803D]/30 font-semibold px-2 py-0.5 text-xs rounded-full",
    "low-stock": "bg-[#FEF3C7] text-[#B45309] border border-[#B45309]/30 font-semibold px-2 py-0.5 text-xs rounded-full",
  }[variant];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        variantStyles,
        className
      )}
      {...props}
    />
  );
}
