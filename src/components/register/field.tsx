import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldProps = {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
};

export function Field({
  label,
  error,
  required,
  hint,
  className,
  children,
}: FieldProps) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[11px] font-bold tracking-[0.14em] text-[#2B2626]/75 uppercase">
        {label}
        {required ? <span className="text-[#B42318]"> *</span> : null}
      </span>
      {children}
      {hint && !error ? (
        <span className="text-xs text-[#5A6B7D]">{hint}</span>
      ) : null}
      {error ? (
        <span className="text-xs font-medium text-[#B42318]" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

const inputClass =
  "h-12 w-full border-2 border-[#FFFF00] bg-[#FFFFFF] px-3.5 text-base text-[#2B2626] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-colors placeholder:text-[#2B2626]/35 focus-visible:border-[#FFFF00] focus-visible:ring-2 focus-visible:ring-[#FFFF00]/50 focus-visible:outline-none disabled:opacity-50";

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(inputClass, "min-h-24 py-3 resize-y", className)}
      {...props}
    />
  );
}
