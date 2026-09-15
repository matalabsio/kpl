"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Users,
  Trophy,
  Volleyball,
} from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import {
  FacebookIcon,
  InstagramIcon,
} from "@/components/landing/social-icons";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const HERO = {
  src: "/brand/kpl-hero-banner.png",
  width: 1672,
  height: 941,
} as const;

const BADGE = {
  src: "/brand/kpl-badge-logo.png",
  width: 1536,
  height: 1024,
} as const;

const HOST = {
  src: "/brand/kpl-host-portrait.png",
  width: 1086,
  height: 1448,
} as const;

const PILLAR_ICONS = [CalendarDays, MapPin, Users] as const;
const FACT_ICONS = [Volleyball, Trophy, CalendarDays, Users] as const;

function HeroCopy({ phone = false }: { phone?: boolean }) {
  const { t, isTe } = useLocale();
  const { hero } = t;

  return (
    <div
      className={cn(
        "mx-auto w-full border-2 border-[#FFFF00] bg-[#FFFF00] text-center shadow-[0_14px_40px_rgba(0,0,0,0.18)]",
        phone
          ? "max-w-[22rem] px-3.5 py-5 sm:max-w-md sm:px-5 sm:py-6"
          : "max-w-3xl px-5 py-6 sm:px-8 sm:py-7"
      )}
    >
      {/* Poster-style pillars */}
      <div className="grid grid-cols-3 gap-2 border-b-2 border-[#2B2626]/10 pb-4 sm:gap-4">
        {hero.pillars.map((pillar, i) => {
          const Icon = PILLAR_ICONS[i] ?? CalendarDays;
          return (
            <div
              key={pillar.label}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <span className="flex size-8 items-center justify-center bg-[#DA3925] text-white sm:size-9">
                <Icon className="size-4" aria-hidden />
              </span>
              <p
                className={cn(
                  "font-bold leading-snug text-[#2B2626]",
                  isTe
                    ? "text-[10px] tracking-normal sm:text-xs"
                    : "text-[9px] tracking-[0.04em] uppercase sm:text-[11px]"
                )}
              >
                {pillar.value}
              </p>
            </div>
          );
        })}
      </div>

      <p
        className={cn(
          "mx-auto mt-4 max-w-xl text-[#2B2626]/85",
          isTe
            ? "text-[13px] leading-relaxed sm:text-sm"
            : "text-xs leading-relaxed sm:text-sm",
          phone && "line-clamp-3"
        )}
      >
        {hero.narrative}
      </p>

      <Link
        href="/register"
        className={cn(
          "btn-red group mx-auto mt-4 inline-flex h-12 w-full max-w-xs items-center justify-center gap-2 px-6 font-bold uppercase sm:mt-5 sm:h-12 sm:max-w-sm",
          isTe
            ? "text-[12px] tracking-normal sm:text-sm"
            : "text-xs tracking-[0.12em] sm:text-sm sm:tracking-[0.14em]"
        )}
      >
        <span className="truncate">{hero.cta}</span>
        <ArrowRight
          className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </div>
  );
}

function HeroFacts({ phone = false }: { phone?: boolean }) {
  const { t, isTe } = useLocale();
  const { hero } = t;

  return (
    <div
      className={cn(
        "mx-auto grid w-full grid-cols-2 border-2 border-[#FFFF00] bg-white lg:grid-cols-4",
        phone ? "max-w-[22rem] sm:max-w-md" : "max-w-3xl"
      )}
    >
      {hero.facts.map((fact, i) => {
        const Icon = FACT_ICONS[i] ?? Trophy;
        return (
          <div
            key={`${fact.label}-${i}`}
            className={cn(
              "flex min-h-[4.75rem] flex-col items-center justify-center gap-1 px-2 py-3.5 text-center sm:min-h-[5.25rem] sm:px-3 sm:py-4",
              i % 2 === 1 && "border-l-2 border-[#FFFF00]",
              i >= 2 && "border-t-2 border-[#FFFF00]",
              i > 0
                ? "lg:border-l-2 lg:border-t-0 lg:border-[#FFFF00]"
                : "lg:border-t-0"
            )}
          >
            <Icon className="size-4 text-[#DA3925]" aria-hidden />
            <p
              className={cn(
                "font-bold text-[#2B2626]",
                isTe
                  ? "text-[10px] tracking-normal"
                  : "text-[9px] tracking-[0.12em] uppercase"
              )}
            >
              {fact.label}
            </p>
            <p
              className={cn(
                "font-display max-w-full font-bold break-words text-[#2B2626]",
                isTe
                  ? "text-[12px] leading-snug tracking-normal sm:text-sm"
                  : "text-[11px] leading-snug tracking-[0.02em] uppercase sm:text-sm"
              )}
            >
              {fact.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function HostPortrait({ className }: { className?: string }) {
  const { t, isTe } = useLocale();
  const { hero } = t;

  return (
    <figure className={cn("pointer-events-none relative", className)}>
      <div className="relative h-full w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent_0%,#000_16%,#000_100%),linear-gradient(0deg,transparent_0%,#000_10%,#000_100%)] [mask-composite:intersect] [-webkit-mask-composite:source-in]">
        <Image
          src={HOST.src}
          alt={hero.hostAlt}
          width={HOST.width}
          height={HOST.height}
          priority
          className="h-full w-full object-cover object-[center_10%] drop-shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
          sizes="(max-width: 1024px) 40vw, 280px"
        />
      </div>
      <figcaption className="absolute bottom-[4%] left-[12%] right-0 text-left">
        <p
          className={cn(
            "font-bold text-[#FFFF00] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
            isTe
              ? "text-[10px] tracking-normal"
              : "text-[9px] tracking-[0.16em] uppercase"
          )}
        >
          {hero.hostRole}
        </p>
        <p
          className={cn(
            "font-display font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)]",
            isTe
              ? "text-base leading-tight tracking-normal"
              : "text-lg leading-none tracking-[0.04em] uppercase"
          )}
        >
          {hero.hostName}
        </p>
      </figcaption>
    </figure>
  );
}

function HeroSocialRail() {
  const { t, isTe } = useLocale();
  const { hero } = t;

  const links = [
    {
      href:
        process.env.NEXT_PUBLIC_FOLLOW_VIRESH_URL ||
        "https://www.instagram.com/viresh_tdp/",
      label: hero.socialInstagram,
      Icon: InstagramIcon,
    },
    {
      href:
        process.env.NEXT_PUBLIC_FACEBOOK_URL ||
        "https://www.facebook.com/vireshtdp/",
      label: hero.socialFacebook,
      Icon: FacebookIcon,
    },
  ] as const;

  return (
    <nav
      aria-label={hero.socialLabel}
      className="absolute top-[42%] left-2 z-40 flex -translate-y-1/2 flex-col items-center gap-2 sm:left-3 sm:top-[40%] lg:left-5 lg:top-[38%]"
    >
      <p
        className={cn(
          "mb-0.5 hidden text-center font-bold text-white/90 drop-shadow sm:block",
          isTe
            ? "max-w-[3.5rem] text-[9px] leading-tight tracking-normal"
            : "text-[8px] tracking-[0.18em] uppercase [writing-mode:vertical-rl] rotate-180"
        )}
      >
        {hero.socialLabel}
      </p>
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          className="flex size-10 cursor-pointer items-center justify-center border-2 border-[#FFFF00] bg-[#2B2626]/75 text-[#FFFF00] backdrop-blur-sm transition-colors duration-200 hover:bg-[#DA3925] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFF00] sm:size-11"
        >
          <Icon className="size-4 sm:size-[1.15rem]" />
        </a>
      ))}
    </nav>
  );
}

export function LandingHero() {
  const reduce = useReducedMotion();
  const { t, isTe } = useLocale();
  const { hero } = t;

  const fadeUp = (delay = 0) =>
    reduce
      ? undefined
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease },
        };

  return (
    <section
      id="home"
      className="relative isolate w-full overflow-x-hidden bg-[#FFFDE6]"
    >
      <div className="relative h-[100dvh] min-h-[100svh] w-full lg:h-auto lg:min-h-0">
        <div className="absolute inset-0 z-0 lg:hidden">
          <Image
            src={HERO.src}
            alt={hero.alt}
            fill
            priority
            className="select-none object-cover object-[center_28%]"
            sizes="100vw"
          />
        </div>

        <Image
          src={HERO.src}
          alt={hero.alt}
          width={HERO.width}
          height={HERO.height}
          priority
          className="relative z-0 hidden h-auto w-full select-none lg:block"
          sizes="100vw"
        />

        {/* Bold low-opacity KPL — above bg, under crest/host/copy */}
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center overflow-hidden"
          aria-hidden
        >
          <p
            className="font-display mt-[39%] text-center text-[clamp(7rem,38vw,22rem)] leading-none font-black tracking-[0.18em] text-white/[0.15] select-none sm:mt-[37%] sm:tracking-[0.22em] sm:text-white/[0.17] lg:mt-[35%] lg:tracking-[0.26em] lg:text-white/20"
            style={{ textShadow: "0 0 1px rgba(0,0,0,0.12)" }}
          >
            KPL
          </p>
          <p className="font-display absolute top-[22%] right-[3%] hidden text-[clamp(4rem,14vw,11rem)] leading-none font-black tracking-[0.2em] text-white/[0.12] select-none [writing-mode:vertical-rl] rotate-180 lg:block">
            KPL
          </p>
        </div>

        {/* Crest — centered brand */}
        <div className="pointer-events-none absolute inset-x-0 top-[max(3.25rem,5%)] z-20 flex justify-center sm:top-[max(3.75rem,5%)] lg:top-[max(3.5rem,4%)]">
          <motion.div
            className="flex h-[clamp(8.5rem,40vw,13rem)] w-[min(72vw,300px)] items-center justify-center sm:h-[clamp(7rem,22vw,12rem)] sm:w-[min(44vw,300px)] lg:h-[clamp(8rem,15vw,15rem)] lg:w-[min(30vw,460px)]"
            initial={reduce ? false : { opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.1, ease }}
          >
            <Image
              src={BADGE.src}
              alt={hero.crestAlt}
              width={BADGE.width}
              height={BADGE.height}
              priority
              className="mx-auto h-full w-auto max-w-full object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
              sizes="(max-width: 640px) 72vw, (max-width: 1024px) 44vw, 460px"
            />
          </motion.div>
        </div>

        {/* Host — taller, slightly narrower, poster-right */}
        <motion.div
          className="absolute right-0 bottom-[22%] z-20 h-[52vh] w-[min(40vw,180px)] sm:bottom-[20%] sm:h-[54vh] sm:w-[min(34vw,210px)] lg:right-[4%] lg:bottom-[12%] lg:h-[70%] lg:w-[min(18vw,260px)]"
          initial={reduce ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease }}
        >
          <HostPortrait className="h-full w-full" />
        </motion.div>

        {/* Social rail — left mid, above yellow card */}
        <motion.div
          initial={reduce ? false : { opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.25, ease }}
        >
          <HeroSocialRail />
        </motion.div>

        {isTe ? (
          <motion.p
            className="pointer-events-none absolute top-[20%] left-[2%] z-20 hidden max-w-[18%] rotate-[-8deg] text-left text-[clamp(0.65rem,1.5vw,1rem)] font-bold leading-tight text-[#2B2626] xl:block"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <span className="inline-block bg-[#FFFF00]/92 px-1.5 py-1">
              {hero.leftTagline}
            </span>
          </motion.p>
        ) : (
          <motion.p
            className="font-script pointer-events-none absolute top-[18%] left-[3%] z-20 hidden max-w-[22%] text-left text-[clamp(1.1rem,2.4vw,2rem)] leading-none text-[#FFFF00] drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] xl:block"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            {hero.leftTagline}
          </motion.p>
        )}

        <motion.p
          className={cn(
            "pointer-events-none absolute top-[20%] right-[22%] z-20 hidden max-w-[14%] text-right font-bold leading-snug text-white drop-shadow xl:block",
            isTe
              ? "text-[clamp(0.55rem,1.2vw,0.85rem)] tracking-normal"
              : "text-[clamp(0.55rem,1.2vw,0.85rem)] tracking-[0.12em] uppercase"
          )}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          {hero.rightTagline}
        </motion.p>

        {/* Phone: centered yellow panel + CTA */}
        <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-center px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-20 sm:px-4 lg:hidden">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
          <motion.div
            className="relative z-10 flex w-full flex-col items-center"
            {...fadeUp(0.12)}
          >
            <HeroCopy phone />
          </motion.div>
        </div>

        {/* Desktop: centered yellow + facts under crest */}
        <div className="pointer-events-none absolute inset-0 z-30 hidden flex-col lg:flex">
          <div className="pointer-events-auto mt-auto mb-[clamp(0.75rem,2vw,1.25rem)] flex w-full flex-col items-center gap-2.5 px-6">
            <motion.div className="w-full" {...fadeUp(0.15)}>
              <HeroCopy />
            </motion.div>
            <motion.div className="w-full" {...fadeUp(0.28)}>
              <HeroFacts />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Phone facts — centered under fold */}
      <div className="relative z-10 flex justify-center px-3 py-4 sm:px-4 lg:hidden">
        <HeroFacts phone />
      </div>
    </section>
  );
}
