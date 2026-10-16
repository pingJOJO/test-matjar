import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "cat"
    | "komatsu"
    | "success"
    | "royal"
    | "royalOutline";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "royal",
      size = "default",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      royal:
        "bg-[#0D5CB6] text-white font-bold hover:bg-[#0B4F9C] active:scale-[0.98] shadow-sm transition-all",
      royalOutline:
        "border-2 border-[#0D5CB6] text-[#0D5CB6] bg-white font-bold hover:bg-blue-50 active:scale-[0.98] transition-all",
      default:
        "bg-[#0D5CB6] text-white hover:bg-[#0B4F9C] active:scale-[0.98] shadow-sm font-semibold",
      destructive:
        "bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98] shadow-sm",
      outline:
        "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-900 font-medium",
      secondary:
        "bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-[0.98]",
      ghost: "hover:bg-slate-100 hover:text-slate-900",
      link: "text-[#0D5CB6] underline-offset-4 hover:underline",
      cat: "bg-[#FFB800] text-slate-950 font-bold hover:bg-[#F0AA00] active:scale-[0.98] shadow-sm transition-all",
      komatsu:
        "bg-[#0D5CB6] text-white font-semibold hover:bg-[#0B4F9C] active:scale-[0.98] shadow-sm",
      success:
        "bg-emerald-600 text-white font-semibold hover:bg-emerald-700 active:scale-[0.98] shadow-sm",
    }[variant];

    const sizeStyles = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-12 rounded-lg px-8 text-base",
      icon: "h-10 w-10 p-0",
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB800] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
          variantStyles,
          sizeStyles,
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
