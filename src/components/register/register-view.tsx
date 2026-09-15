"use client";

import Image from "next/image";
import Link from "next/link";
import { RegistrationWizard } from "@/components/register/wizard";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function RegisterView() {
  const { t, isTe } = useLocale();

  return (
    <main
      className={cn(
        "relative min-h-[100dvh] flex-1 overflow-x-hidden",
        isTe && "font-te"
      )}
    >
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <Image
          src="/brand/kpl-hero-banner.png"
          alt=""
          fill
          priority
          className="object-cover object-[center_30%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-white/55" />
      </div>

      <header className="sticky top-0 z-40 border-b-2 border-[#FFFF00] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-end gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
          <LanguageToggle />
          <Link
            href="/"
            className={cn(
              "btn-green inline-flex min-h-11 items-center justify-center px-4 text-[11px] font-bold uppercase",
              isTe ? "tracking-normal" : "tracking-[0.14em]"
            )}
          >
            {t.home}
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-3 py-5 sm:px-6 sm:py-8">
        <div className="mb-4 flex flex-col items-center gap-3 border-2 border-[#FFFF00] bg-[#FFFF00] px-3 py-4 text-center sm:mb-5 sm:flex-row sm:justify-between sm:px-4 sm:text-left">
          <div className="flex max-w-full items-center gap-3">
            <Image
              src="/brand/kpl-badge-logo.png"
              alt=""
              width={72}
              height={48}
              className="h-10 w-auto shrink-0 object-contain sm:h-12"
              priority
            />
            <div className="min-w-0">
              <h1
                className={cn(
                  "font-display text-xl font-bold text-[#2B2626] sm:text-2xl md:text-3xl",
                  isTe
                    ? "tracking-normal normal-case"
                    : "tracking-[0.06em] uppercase"
                )}
              >
                {t.registerPage.title}
              </h1>
              <p className="mt-0.5 text-[11px] text-[#2B2626]/75 sm:text-sm">
                {t.registerPage.subtitle}
              </p>
            </div>
          </div>
          <p
            className={cn(
              "text-[10px] font-bold text-[#2B2626] sm:text-right",
              isTe
                ? "tracking-normal normal-case"
                : "tracking-[0.14em] uppercase"
            )}
          >
            {t.registerPage.captainLed}
          </p>
        </div>

        <RegistrationWizard />
      </div>
    </main>
  );
}
