import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "contained" | "outlined" | "icon";
type ButtonColor = "success" | "danger";

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
  },
  outlined: {
    success: "border border-emerald-600 bg-transparent text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-100",
    danger: "border border-red-300 bg-transparent text-red-400 hover:bg-red-50 focus:ring-red-100",
  },
  icon: {
    success: "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-100",
    danger: "border border-red-200 bg-white text-red-400 hover:bg-red-50 focus:ring-red-100",
  },
};

const sizeClassName: Record<ButtonVariant, string> = {
  contained: "h-12 w-full px-4",
  outlined: "h-12 w-full px-4",
  icon: "h-10 w-10 p-0",
};

export default function Button({
  children,
  variant = "contained",
  color = "success",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`flex shrink-0 items-center justify-center rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClassName[variant]} ${variantClassName[variant][color]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
