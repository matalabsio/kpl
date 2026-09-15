"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";
import { LanguageToggle } from "@/components/i18n/language-toggle";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { t, isTe } = useLocale();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-200",
        scrolled
          ? "border-b-2 border-[#FFFF00] bg-white/95 backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-end px-3 pt-[env(safe-area-inset-top)] sm:h-16 sm:px-6 md:h-[4.75rem]">
        <div
          className={cn(
            "flex items-center gap-2.5 sm:gap-3",
            !scrolled &&
              "border-2 border-[#FFFF00] bg-white/92 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm"
          )}
        >
          <LanguageToggle compact={!scrolled} />
          <Link
            href="/register"
            className={cn(
              "btn-red inline-flex h-11 min-w-[5.5rem] items-center justify-center px-3.5 text-[11px] font-bold uppercase sm:min-w-[6.5rem] sm:px-5",
              isTe ? "tracking-normal" : "tracking-[0.12em] sm:tracking-[0.14em]"
            )}
          >
            {t.register}
          </Link>
        </div>
      </div>
    </header>
  );
}
