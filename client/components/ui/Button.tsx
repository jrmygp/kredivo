import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "contained" | "outlined" | "icon";
type ButtonColor = "success" | "danger" | "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  color?: ButtonColor;
};

const variantClassName: Record<ButtonVariant, Record<ButtonColor, string>> = {
  contained: {
    success:
      "border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700 focus:ring-emerald-200",
    danger: "border border-red-400 bg-red-400 text-white hover:bg-red-700 hover:border-red-700 focus:ring-red-200",
    primary:
      "border border-blue-400 bg-blue-400 text-white hover:bg-blue-700 hover:border-blue-700 focus:ring-blue-200",
    secondary:
      "border border-slate-400 bg-slate-400 text-white hover:bg-slate-700 hover:border-slate-700 focus:ring-slate-200",
  },
  outlined: {
    success: "border border-emerald-600 bg-transparent text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-100",
    danger: "border border-red-300 bg-transparent text-red-400 hover:bg-red-50 focus:ring-red-100",
    primary: "border border-blue-400 bg-transparent text-blue-400 hover:bg-blue-50 focus:ring-blue-100",
    secondary: "border border-slate-400 bg-transparent text-slate-400 hover:bg-slate-50 focus:ring-slate-100",
  },
  icon: {
    success: "bg-emerald-500 text-white hover:bg-emerald-50 focus:ring-emerald-100",
    danger: "bg-red-500 text-white hover:bg-red-50 focus:ring-red-100",
    primary: "bg-blue-500 text-white hover:bg-blue-50 focus:ring-blue-100",
    secondary: "bg-slate-500 text-white hover:bg-slate-50 focus:ring-slate-100",
  },
};

const sizeClassName: Record<ButtonVariant, string> = {
  contained: "h-12 w-full px-4",
  outlined: "h-12 w-full px-4",
  icon: "h-10 w-10 p-0",
};

const radiusClassName: Record<ButtonVariant, string> = {
  contained: "rounded-lg",
  outlined: "rounded-lg",
  icon: "rounded-full",
};

export default function Button({
  children,
  variant = "contained",
  color = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`flex shrink-0 items-center justify-center text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${radiusClassName[variant]} ${sizeClassName[variant]} ${variantClassName[variant][color]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
