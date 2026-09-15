"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/landing/site-header";
import { LandingHero } from "@/components/landing/hero";
import { KplLogo } from "@/components/brand/kpl-logo";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { t, isTe } = useLocale();
  const { about, cta, footer } = t;

  return (
    <main className="flex min-h-full flex-1 flex-col overflow-x-hidden bg-white text-[#2B2626]">
      <SiteHeader />

      <LandingHero />

      <section className="bg-white px-4 py-10 sm:px-6 sm:py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p
            className={cn(
              "inline-block border border-[#FFFF00] bg-[#FFFF00] px-3 py-1.5 font-bold text-[#2B2626]",
              isTe
                ? "text-[12px] tracking-normal"
                : "text-[11px] tracking-[0.22em] uppercase sm:tracking-[0.28em]"
            )}
          >
            {about.badge}
          </p>
          <h2
            className={cn(
              "font-display mt-4 font-bold text-[#2B2626]",
              isTe
                ? "text-[1.35rem] leading-snug tracking-normal sm:text-3xl"
                : "text-[1.35rem] leading-tight tracking-[0.04em] uppercase sm:text-3xl md:text-4xl"
            )}
          >
            {about.headlineLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p
            className={cn(
              "mt-4 leading-relaxed text-[#2B2626]/70 sm:mt-6",
              isTe ? "text-[14px] sm:text-base" : "text-sm sm:text-lg"
            )}
          >
            {about.body}
          </p>
          <ul className="mx-auto mt-6 max-w-md space-y-3 text-left text-sm text-[#2B2626]/75 sm:mt-8">
            {about.bullets.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  className="mt-1.5 size-1.5 shrink-0 bg-[#FFFF00] ring-1 ring-[#2B2626]/25"
                  aria-hidden
                />
                <span className={cn(isTe && "leading-relaxed")}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y-4 border-[#FFFF00] bg-[#FFFF00] px-4 py-10 text-center text-[#2B2626] sm:px-6 sm:py-14 md:py-16">
        <p
          className={cn(
            "font-display font-bold",
            isTe
              ? "text-[1.35rem] leading-snug tracking-normal sm:text-3xl"
              : "text-[1.35rem] leading-tight tracking-[0.06em] uppercase sm:text-3xl md:text-4xl"
          )}
        >
          {cta.headline}
        </p>
        <p
          className={cn(
            "mx-auto mt-3 max-w-md leading-relaxed text-[#2B2626]/80",
            isTe ? "text-sm sm:text-[15px]" : "text-sm sm:text-base"
          )}
        >
          {cta.subtext}
        </p>
        <div className="mx-auto mt-6 flex w-full max-w-sm flex-col items-stretch gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
          <Link
            href="/register"
            className={cn(
              "btn-red inline-flex h-12 items-center justify-center gap-2 px-6 font-bold uppercase sm:h-14 sm:px-10",
              isTe
                ? "text-[13px] tracking-normal"
                : "text-sm tracking-[0.14em]"
            )}
          >
            {cta.primary}
            <ArrowRight className="size-4 shrink-0" aria-hidden />
          </Link>
          <Link
            href="/register"
            className={cn(
              "btn-green inline-flex h-12 items-center justify-center gap-2 px-6 font-bold uppercase sm:h-14 sm:px-10",
              isTe
                ? "text-[13px] tracking-normal"
                : "text-sm tracking-[0.14em]"
            )}
          >
            {cta.secondary}
          </Link>
        </div>
      </section>

      <footer className="border-t-2 border-[#FFFF00] bg-[#FFFDE6]">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-7 sm:flex-row sm:justify-between sm:px-6 sm:py-8 md:px-8">
          <div className="flex items-center gap-3">
            <KplLogo href="/" size={44} />
            <div className="min-w-0 text-left">
              <p
                className={cn(
                  "font-semibold text-[#2B2626]/70",
                  isTe
                    ? "text-xs tracking-normal"
                    : "text-xs tracking-[0.12em] uppercase"
                )}
              >
                Kurupam Premier League
              </p>
              <p className="text-[11px] text-[#2B2626]/45">
                © {new Date().getFullYear()} · {footer.hosted}
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className={cn(
              "btn-red inline-flex min-h-11 items-center justify-center px-4 py-2 font-bold uppercase",
              isTe ? "text-xs tracking-normal" : "text-xs tracking-[0.16em]"
            )}
          >
            {t.registerArrow}
          </Link>
        </div>
      </footer>
    </main>
  );
}
