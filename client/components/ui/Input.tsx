import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  rightElement?: ReactNode;
  error?: string;
  helperText?: string;
};

export default function Input({
  id,
  label,
  rightElement,
  error,
  helperText,
  className = "",
  ...props
}: InputProps) {
  const message = error || helperText;
  const messageId = message && id ? `${id}-message` : undefined;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        {rightElement}
      </div>

      <input
        id={id}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={messageId}
        className={`mt-2 h-12 w-full rounded-lg border px-4 text-sm outline-none transition focus:ring-4 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-100"
        } ${className}`}
        {...props}
      />

      {message ? (
        <p
          id={messageId}
          className={`mt-2 text-sm ${error ? "text-red-600" : "text-slate-500"}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
