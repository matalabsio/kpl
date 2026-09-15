"use client";

import { LOCALES } from "@/lib/i18n/messages";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function LanguageToggle({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label="Language / భాష"
      className={cn(
        "inline-flex h-11 items-stretch overflow-hidden",
        compact
          ? "border border-[#FFFF00]/80 bg-white"
          : "border-2 border-[#FFFF00] bg-white",
        className
      )}
    >
      {LOCALES.map((item) => {
        const active = locale === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setLocale(item.id)}
            aria-pressed={active}
            title={item.label}
            className={cn(
              "inline-flex min-w-[2.5rem] cursor-pointer items-center justify-center px-2.5 text-[11px] font-bold transition-colors duration-200 sm:min-w-[2.75rem]",
              active
                ? "bg-[#DA3925] text-white"
                : "bg-transparent text-[#2B2626] hover:bg-[#FFFF00]"
            )}
          >
            {item.short}
          </button>
        );
      })}
    </div>
  );
}
