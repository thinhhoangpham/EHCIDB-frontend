"use client";

import { cn } from "@/lib/utils";

// interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
//   label: string;
//   error?: string;
// }

type SelectOption = {
  label: string;
  value: string;
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  options?: SelectOption[];
}


export function Input({
  label,
  error,
  id,
  className,
  options,
  type,
  ...props
}: InputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      {type === "select" ? (
        <select
          id={id}
          value={props.value as string}
          onChange={props.onChange as any}
          className={cn(
            "w-full rounded-lg border bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-500",
            error ? "border-red-400" : "border-gray-300",
            className
          )}
        >
          <option value="">{props.placeholder}</option>

          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          className={cn(
            "w-full rounded-lg border bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500",
            error ? "border-red-400" : "border-gray-300",
            className
          )}
          {...props}
        />
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}