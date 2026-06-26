import type { SelectHTMLAttributes } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  containerClassName?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
};

export default function Select({
  id,
  label,
  containerClassName = "",
  options,
  error,
  helperText,
  className = "",
  ...props
}: SelectProps) {
  const message = error || helperText;
  const messageId = message && id ? `${id}-message` : undefined;

  return (
    <div className={containerClassName}>
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}

      <div className={`relative ${label ? "mt-2" : ""}`}>
        <select
          id={id}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={messageId}
          className={`h-12 w-full appearance-none rounded-lg border bg-white px-4 pr-10 text-sm outline-none transition focus:ring-4 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="rounded-md">
              {option.label}
            </option>
          ))}
        </select>
        <MdKeyboardArrowDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xl text-slate-500" />
      </div>

      {message ? (
        <p id={messageId} className={`mt-2 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
