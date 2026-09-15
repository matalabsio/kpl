"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

export function StepProgress({ current }: { current: number }) {
  const { t, isTe } = useLocale();
  const steps = [
    t.steps.sport,
    t.steps.captain,
    t.steps.team,
    t.steps.players,
    t.steps.review,
  ] as const;

  return (
    <div className="mb-8">
      <p
        className={cn(
          "mb-3 text-[11px] font-bold text-[#2B2626] uppercase",
          isTe ? "tracking-normal" : "tracking-[0.18em]"
        )}
      >
        <span className="border-b-2 border-[#FFFF00] pb-0.5">
          {t.steps.step} {current + 1} {t.steps.of} {steps.length}
          {" — "}
          {steps[current]}
        </span>
      </p>
      <ol className="flex gap-1.5" aria-label="Registration progress">
        {steps.map((label, i) => (
          <li key={`${label}-${i}`} className="flex-1">
            <div
              className={cn(
                "h-2 transition-colors duration-200",
                i < current && "bg-[#DA3925]",
                i === current && "bg-[#FFFF00] ring-1 ring-[#2B2626]/20",
                i > current && "bg-[#FFFDE6] ring-1 ring-[#FFFF00]/60"
              )}
              title={label}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
