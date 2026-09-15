"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { StepProgress } from "@/components/register/step-progress";
import { Field, TextArea, TextInput } from "@/components/register/field";
import { submitRegistration } from "@/app/actions/register";
import {
  MAX_PLAYERS,
  SPORTS,
  captainSchema,
  emptyCaptain,
  emptyPlayer,
  emptyTeam,
  maskAadhaar,
  playerSchema,
  sportSchema,
  teamSchema,
  type CaptainForm,
  type PlayerForm,
  type Sport,
  type TeamForm,
} from "@/lib/validation/registration";
import { cn } from "@/lib/utils";
import { fill } from "@/lib/i18n/messages";
import { useLocale } from "@/components/i18n/locale-provider";
import {
  Plus,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Home,
} from "lucide-react";
import { KplLogo } from "@/components/brand/kpl-logo";

const STORAGE_KEY = "kpl-registration-draft-v2";

type SuccessInfo = {
  registrationId: string;
  teamName: string;
  sport: Sport;
  memberCount: number;
};

type Draft = {
  step: number;
  sport: Sport | null;
  captain: CaptainForm;
  team: TeamForm;
  players: PlayerForm[];
  consentAuth: boolean;
  consentTerms: boolean;
};

const defaultDraft: Draft = {
  step: 0,
  sport: null,
  captain: emptyCaptain,
  team: emptyTeam,
  players: [{ ...emptyPlayer }],
  consentAuth: false,
  consentTerms: false,
};

function loadDraft(): Draft {
  if (typeof window === "undefined") return defaultDraft;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDraft;
    return { ...defaultDraft, ...JSON.parse(raw) };
  } catch {
    return defaultDraft;
  }
}

function padPlayer(n: number) {
  return String(n).padStart(2, "0");
}

function sportLabel(
  sport: Sport,
  t: { cricket: string; volleyball: string }
) {
  return sport === "Cricket" ? t.cricket : t.volleyball;
}

export function RegistrationWizard() {
  const { t, isTe } = useLocale();
  const f = t.form;
  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState<Draft>(defaultDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessInfo | null>(null);
  const [pending, startTransition] = useTransition();
  const [aadhaarFocus, setAadhaarFocus] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    setDraft(loadDraft());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || success) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, hydrated, success]);

  const maxPlayers = draft.sport ? MAX_PLAYERS[draft.sport] : 15;
  const atMax = draft.players.length >= maxPlayers;

  const setStep = (step: number) =>
    setDraft((d) => ({ ...d, step: Math.max(0, Math.min(4, step)) }));

  const validateStep = useCallback((): boolean => {
    const next: Record<string, string> = {};
    if (draft.step === 0) {
      const r = sportSchema.safeParse(draft.sport);
      if (!r.success) next.sport = f.errSelectSport;
    }
    if (draft.step === 1) {
      const r = captainSchema.safeParse(draft.captain);
      if (!r.success) {
        for (const issue of r.error.issues) {
          next[`captain.${String(issue.path[0])}`] = issue.message;
        }
      }
    }
    if (draft.step === 2) {
      const r = teamSchema.safeParse(draft.team);
      if (!r.success) {
        for (const issue of r.error.issues) {
          next[`team.${String(issue.path[0])}`] = issue.message;
        }
      }
    }
    if (draft.step === 3) {
      if (draft.players.length < 1) {
        next.players = f.errAddPlayer;
      }
      draft.players.forEach((p, i) => {
        const r = playerSchema.safeParse(p);
        if (!r.success) {
          for (const issue of r.error.issues) {
            next[`players.${i}.${String(issue.path[0])}`] = issue.message;
          }
        }
      });
      if (draft.sport && draft.players.length > MAX_PLAYERS[draft.sport]) {
        next.players = f.maxReached;
      }
    }
    if (draft.step === 4) {
      if (!draft.consentAuth) {
        next.consentAuth = f.errRequired;
      }
      if (!draft.consentTerms) {
        next.consentTerms = f.errRequired;
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [draft, f]);

  const goNext = () => {
    if (!validateStep()) return;
    setStep(draft.step + 1);
  };

  const goBack = () => {
    setErrors({});
    setSubmitError(null);
    setStep(draft.step - 1);
  };

  const addMember = () => {
    if (atMax) return;
    setDraft((d) => ({
      ...d,
      players: [...d.players, { ...emptyPlayer }],
      team: { ...d.team, numberOfPlayers: d.players.length + 1 },
    }));
  };

  const onSubmit = () => {
    if (!draft.sport || pending) return;
    if (!validateStep()) return;
    setSubmitError(null);
    startTransition(async () => {
      const result = await submitRegistration({
        sport: draft.sport!,
        captain: draft.captain,
        team: {
          ...draft.team,
          numberOfPlayers: draft.players.length,
        },
        players: draft.players,
      });
      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }
      sessionStorage.removeItem(STORAGE_KEY);
      setSuccess({
        registrationId: result.registrationId,
        teamName: result.teamName,
        sport: result.sport,
        memberCount: result.memberCount,
      });
    });
  };

  const followKpl =
    process.env.NEXT_PUBLIC_FOLLOW_KPL_URL ||
    "https://www.instagram.com/viresh_tdp/";
  const whatsapp =
    process.env.NEXT_PUBLIC_WHATSAPP_UPDATES_URL || "https://wa.me/";

  const track = isTe ? "tracking-normal" : "tracking-[0.22em]";
  const trackBtn = isTe ? "tracking-normal" : "tracking-[0.14em]";
  const trackHead = isTe ? "tracking-normal" : "tracking-[0.06em]";

  if (!hydrated) {
    return (
      <div className="border-2 border-[#FFFF00] bg-[#FFFFFF]/90 p-6">
        <p className="text-sm text-[#5A6B7D]">{t.registerPage.loading}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="border-2 border-[#FFFF00] bg-[#FFFFFF] p-6 shadow-[0_20px_60px_rgba(11,28,44,0.12)] sm:p-10">
        <div className="flex justify-center">
          <KplLogo href={undefined} size={96} />
        </div>
        <CheckCircle2
          className="mx-auto mt-4 size-12 text-[#2F5C2F]"
          aria-hidden
        />
        <p
          className={cn(
            "mt-4 text-center text-[11px] font-bold text-[#2F5C2F] uppercase",
            isTe ? "tracking-normal" : "tracking-[0.28em]"
          )}
        >
          ✓ {f.successTitle}
        </p>
        <h2
          className={cn(
            "font-display mt-3 text-center text-3xl font-bold text-[#2B2626] uppercase sm:text-4xl",
            trackHead
          )}
        >
          {f.successBody}
        </h2>

        <div className="mt-8 grid gap-3 border-2 border-[#FFFF00] bg-[#FFFDE6] p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p
              className={cn(
                "text-[10px] font-bold text-[#5A6B7D] uppercase",
                isTe ? "tracking-normal" : "tracking-[0.2em]"
              )}
            >
              {f.registrationId}
            </p>
            <p className="font-display mt-1 text-3xl font-bold tracking-[0.12em] text-[#2F5C2F]">
              {success.registrationId}
            </p>
          </div>
          <div>
            <p
              className={cn(
                "text-[10px] font-bold text-[#5A6B7D] uppercase",
                isTe ? "tracking-normal" : "tracking-[0.2em]"
              )}
            >
              {f.team}
            </p>
            <p className="mt-1 font-semibold text-[#2B2626]">
              {success.teamName}
            </p>
          </div>
          <div>
            <p
              className={cn(
                "text-[10px] font-bold text-[#5A6B7D] uppercase",
                isTe ? "tracking-normal" : "tracking-[0.2em]"
              )}
            >
              {f.sport}
            </p>
            <p className="mt-1 font-semibold tracking-wide text-[#2B2626] uppercase">
              {sportLabel(success.sport, f)}
            </p>
          </div>
          <div>
            <p
              className={cn(
                "text-[10px] font-bold text-[#5A6B7D] uppercase",
                isTe ? "tracking-normal" : "tracking-[0.2em]"
              )}
            >
              {f.members}
            </p>
            <p className="mt-1 font-semibold text-[#2B2626]">
              {success.memberCount}
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-[#5A6B7D]">{f.keepId}</p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/"
            className={cn(
              "btn-green inline-flex h-12 items-center justify-center gap-2 px-6 text-sm font-bold uppercase",
              trackBtn
            )}
          >
            <Home className="size-4" /> {f.backHome}
          </Link>
          <a
            href={followKpl}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "btn-red inline-flex h-12 items-center justify-center px-6 text-sm font-bold uppercase",
              trackBtn
            )}
          >
            {f.followKpl}
          </a>
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "btn-green inline-flex h-12 items-center justify-center px-6 text-sm font-bold uppercase",
              trackBtn
            )}
          >
            {f.whatsappUpdates}
          </a>
        </div>
      </div>
    );
  }

  const captainFields = [
    ["fullName", f.fullName, "text", f.phCaptainName, true],
    ["phone", f.phoneNumber, "tel", f.phMobile, true],
    ["whatsapp", f.whatsapp, "tel", f.phWhatsapp, true],
    ["aadhaar", f.aadhaar, "text", f.phAadhaar, true],
    ["village", f.village, "text", f.phVillage, true],
    ["mandal", f.mandal, "text", f.phMandal, true],
    ["district", f.district, "text", f.phDistrict, true],
    ["email", f.email, "email", f.phEmail, false],
    ["instagram", f.instagram, "text", "@handle", false],
    ["facebook", f.facebook, "text", "Profile name", false],
  ] as const;

  const teamFields = [
    ["teamName", f.teamName, true, f.phTeamName],
    ["teamLocation", f.teamLocation, false, f.phGround],
    ["village", f.village, false, f.phVillage],
    ["mandal", f.mandal, false, f.phMandal],
    ["district", f.district, false, f.phDistrict],
    ["jerseyColour", f.jerseyColour, false, f.phJersey],
    ["managerName", f.managerName, false, f.phManager],
    ["managerPhone", f.managerPhone, false, f.phMobile],
  ] as const;

  return (
    <div className="border-2 border-[#FFFF00] bg-[#FFFFFF]/95 p-5 shadow-[0_20px_60px_rgba(11,28,44,0.1)] backdrop-blur-sm sm:p-8">
      <StepProgress current={draft.step} />

      {draft.step === 0 && (
        <section className="space-y-5">
          <div>
            <p
              className={cn(
                "inline-block border border-[#FFFF00] bg-[#FFFF00] px-2 py-0.5 text-[11px] font-bold text-[#2B2626] uppercase",
                track
              )}
            >
              {f.section} 1
            </p>
            <h2
              className={cn(
                "font-display mt-1 text-2xl font-bold text-[#2B2626] uppercase sm:text-3xl",
                trackHead
              )}
            >
              {f.chooseSport}
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {SPORTS.map((sport) => (
              <button
                key={sport}
                type="button"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    sport,
                    players: d.players.slice(0, MAX_PLAYERS[sport]),
                  }))
                }
                className={cn(
                  "min-h-[3.25rem] cursor-pointer border-2 px-4 py-6 text-left transition-colors duration-200 sm:px-5 sm:py-8",
                  draft.sport === sport
                    ? "border-2 border-[#FFFF00] bg-[#FFFF00] text-[#2B2626] shadow-[0_12px_32px_rgba(255,255,0,0.45)]"
                    : "border-2 border-[#FFFF00]/60 bg-white text-[#2B2626] hover:border-[#FFFF00] hover:bg-[#FFFF00]/20"
                )}
              >
                <span
                  className={cn(
                    "font-display block text-2xl font-bold uppercase",
                    isTe ? "tracking-normal" : "tracking-[0.12em]"
                  )}
                >
                  {sportLabel(sport, f)}
                </span>
                <span
                  className={cn(
                    "mt-2 block text-sm",
                    draft.sport === sport
                      ? "text-[#2B2626]/70"
                      : "text-[#5A5648]"
                  )}
                >
                  {fill(f.squadUpTo, { n: MAX_PLAYERS[sport] })}
                </span>
              </button>
            ))}
          </div>
          {errors.sport ? (
            <p className="text-xs font-medium text-[#B42318]" role="alert">
              {errors.sport}
            </p>
          ) : null}
        </section>
      )}

      {draft.step === 1 && (
        <section className="space-y-5">
          <div>
            <p
              className={cn(
                "inline-block border border-[#FFFF00] bg-[#FFFF00] px-2 py-0.5 text-[11px] font-bold text-[#2B2626] uppercase",
                track
              )}
            >
              {f.section} 2
            </p>
            <h2
              className={cn(
                "font-display mt-1 text-2xl font-bold text-[#2B2626] uppercase sm:text-3xl",
                trackHead
              )}
            >
              {f.captainDetails}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {captainFields.map(([key, label, type, placeholder, required]) => (
              <Field
                key={key}
                label={label}
                required={required}
                error={errors[`captain.${key}`]}
                className={key === "fullName" ? "sm:col-span-2" : undefined}
                hint={key === "aadhaar" ? f.aadhaarHint : undefined}
              >
                <TextInput
                  type={type}
                  placeholder={placeholder}
                  inputMode={
                    key === "phone" || key === "whatsapp" || key === "aadhaar"
                      ? "numeric"
                      : undefined
                  }
                  maxLength={
                    key === "phone" || key === "whatsapp"
                      ? 10
                      : key === "aadhaar"
                        ? 12
                        : undefined
                  }
                  value={
                    key === "aadhaar" &&
                    draft.captain.aadhaar.length === 12 &&
                    !aadhaarFocus.captain
                      ? maskAadhaar(draft.captain.aadhaar)
                      : (draft.captain[key] ?? "")
                  }
                  onFocus={() => {
                    if (key === "aadhaar") {
                      setAadhaarFocus((prev) => ({ ...prev, captain: true }));
                    }
                  }}
                  onBlur={() => {
                    if (key === "aadhaar") {
                      setAadhaarFocus((prev) => ({ ...prev, captain: false }));
                    }
                  }}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (key === "aadhaar") {
                      val = val.replace(/\D/g, "").slice(0, 12);
                    }
                    if (key === "phone" || key === "whatsapp") {
                      val = val.replace(/\D/g, "").slice(0, 10);
                    }
                    setDraft((d) => ({
                      ...d,
                      captain: { ...d.captain, [key]: val },
                    }));
                  }}
                />
              </Field>
            ))}
            <Field
              label={f.fullAddress}
              required
              error={errors["captain.address"]}
              className="sm:col-span-2"
            >
              <TextArea
                placeholder={f.phAddress}
                value={draft.captain.address}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    captain: { ...d.captain, address: e.target.value },
                  }))
                }
              />
            </Field>
          </div>
        </section>
      )}

      {draft.step === 2 && (
        <section className="space-y-5">
          <div>
            <p
              className={cn(
                "inline-block border border-[#FFFF00] bg-[#FFFF00] px-2 py-0.5 text-[11px] font-bold text-[#2B2626] uppercase",
                track
              )}
            >
              {f.section} 3
              {draft.sport ? ` · ${sportLabel(draft.sport, f)}` : ""}
            </p>
            <h2
              className={cn(
                "font-display mt-1 text-2xl font-bold text-[#2B2626] uppercase sm:text-3xl",
                trackHead
              )}
            >
              {f.teamDetails}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {teamFields.map(([key, label, required, placeholder]) => (
              <Field
                key={key}
                label={label}
                required={required}
                error={errors[`team.${key}`]}
                className={key === "teamName" ? "sm:col-span-2" : undefined}
              >
                <TextInput
                  type={key === "managerPhone" ? "tel" : "text"}
                  placeholder={placeholder}
                  inputMode={key === "managerPhone" ? "numeric" : undefined}
                  maxLength={key === "managerPhone" ? 10 : undefined}
                  value={String(draft.team[key] ?? "")}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (key === "managerPhone") {
                      val = val.replace(/\D/g, "").slice(0, 10);
                    }
                    setDraft((d) => ({
                      ...d,
                      team: { ...d.team, [key]: val },
                    }));
                  }}
                />
              </Field>
            ))}
            <Field label={f.teamLogo} hint={f.fileHint}>
              <TextInput
                type="file"
                accept="image/*"
                className="h-auto py-2.5 file:mr-3 file:border-0 file:bg-[#2F5C2F] file:px-3 file:py-1.5 file:text-xs file:font-bold file:tracking-wide file:text-white file:uppercase"
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    team: {
                      ...d.team,
                      teamLogo: e.target.files?.[0]?.name ?? "",
                    },
                  }))
                }
              />
              {draft.team.teamLogo ? (
                <span className="text-xs text-[#2B2626]">
                  {draft.team.teamLogo}
                </span>
              ) : null}
            </Field>
            <Field label={f.teamPhoto} hint={f.fileHint}>
              <TextInput
                type="file"
                accept="image/*"
                className="h-auto py-2.5 file:mr-3 file:border-0 file:bg-[#2F5C2F] file:px-3 file:py-1.5 file:text-xs file:font-bold file:tracking-wide file:text-white file:uppercase"
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    team: {
                      ...d.team,
                      teamPhoto: e.target.files?.[0]?.name ?? "",
                    },
                  }))
                }
              />
              {draft.team.teamPhoto ? (
                <span className="text-xs text-[#2B2626]">
                  {draft.team.teamPhoto}
                </span>
              ) : null}
            </Field>
          </div>
        </section>
      )}

      {draft.step === 3 && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p
                className={cn(
                  "inline-block border border-[#FFFF00] bg-[#FFFF00] px-2 py-0.5 text-[11px] font-bold text-[#2B2626] uppercase",
                  track
                )}
              >
                {f.section} 4
              </p>
              <h2
                className={cn(
                  "font-display mt-1 text-2xl font-bold text-[#2B2626] uppercase sm:text-3xl",
                  trackHead
                )}
              >
                {f.addMembers}
              </h2>
              <p className="mt-2 text-sm text-[#5A6B7D]">{f.addMembersHint}</p>
            </div>
            <p
              className={cn(
                "font-display text-sm font-bold text-[#2B2626] uppercase",
                isTe ? "tracking-normal" : "tracking-[0.12em]"
              )}
            >
              {fill(f.membersAdded, { n: draft.players.length })}
            </p>
          </div>

          {errors.players ? (
            <p className="text-xs font-medium text-[#B42318]" role="alert">
              {errors.players}
            </p>
          ) : null}

          <div className="space-y-4">
            {draft.players.map((player, index) => (
              <div
                key={index}
                className="border-2 border-[#FFFF00] bg-[#FFFDE6]/80 p-4 sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3
                    className={cn(
                      "font-display text-lg font-bold text-[#2B2626] uppercase",
                      isTe ? "tracking-normal" : "tracking-[0.14em]"
                    )}
                  >
                    {f.player} {padPlayer(index + 1)}
                  </h3>
                  {draft.players.length > 1 ? (
                    <button
                      type="button"
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-[#B42318] uppercase hover:underline",
                        isTe ? "tracking-normal" : "tracking-[0.12em]"
                      )}
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          players: d.players.filter((_, i) => i !== index),
                          team: {
                            ...d.team,
                            numberOfPlayers: d.players.length - 1,
                          },
                        }))
                      }
                    >
                      <Trash2 className="size-3.5" /> {f.remove}
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-4">
                  {(
                    [
                      ["fullName", f.fullName, f.phPlayerName],
                      ["phone", f.phoneNumber, f.phMobile],
                      ["aadhaar", f.aadhaar, f.phAadhaar],
                    ] as const
                  ).map(([key, label, placeholder]) => (
                    <Field
                      key={key}
                      label={label}
                      required
                      error={errors[`players.${index}.${key}`]}
                      hint={
                        key === "aadhaar" ? f.aadhaarHintPlayer : undefined
                      }
                    >
                      <TextInput
                        type="text"
                        placeholder={placeholder}
                        inputMode={
                          key === "phone" || key === "aadhaar"
                            ? "numeric"
                            : undefined
                        }
                        maxLength={
                          key === "phone"
                            ? 10
                            : key === "aadhaar"
                              ? 12
                              : undefined
                        }
                        value={
                          key === "aadhaar" &&
                          player.aadhaar.length === 12 &&
                          !aadhaarFocus[`p${index}`]
                            ? maskAadhaar(player.aadhaar)
                            : player[key]
                        }
                        onFocus={() => {
                          if (key === "aadhaar") {
                            setAadhaarFocus((prev) => ({
                              ...prev,
                              [`p${index}`]: true,
                            }));
                          }
                        }}
                        onBlur={() => {
                          if (key === "aadhaar") {
                            setAadhaarFocus((prev) => ({
                              ...prev,
                              [`p${index}`]: false,
                            }));
                          }
                        }}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (key === "aadhaar" || key === "phone") {
                            val = val
                              .replace(/\D/g, "")
                              .slice(0, key === "aadhaar" ? 12 : 10);
                          }
                          setDraft((d) => {
                            const players = [...d.players];
                            players[index] = {
                              ...players[index],
                              [key]: val,
                            };
                            return { ...d, players };
                          });
                        }}
                      />
                    </Field>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addMember}
            disabled={atMax}
            className={cn(
              "flex h-14 w-full cursor-pointer items-center justify-center gap-2 border-2 border-dashed text-sm font-bold uppercase transition-colors",
              isTe ? "tracking-normal" : "tracking-[0.16em]",
              atMax
                ? "cursor-not-allowed border-[#FFFF00]/40 text-[#5A6B7D]"
                : "btn-green border-solid"
            )}
          >
            <Plus className="size-5" /> {f.addMember}
          </button>
          {atMax ? (
            <p className="text-center text-xs font-medium text-[#B42318]">
              {f.maxReached}
            </p>
          ) : (
            <p className="text-center text-xs text-[#5A6B7D]">
              {fill(f.maxFor, {
                n: maxPlayers,
                sport: draft.sport ? sportLabel(draft.sport, f) : "",
              })}
            </p>
          )}
        </section>
      )}

      {draft.step === 4 && draft.sport && (
        <section className="space-y-6">
          <div>
            <p
              className={cn(
                "inline-block border border-[#FFFF00] bg-[#FFFF00] px-2 py-0.5 text-[11px] font-bold text-[#2B2626] uppercase",
                track
              )}
            >
              {f.section} 5
            </p>
            <h2
              className={cn(
                "font-display mt-1 text-2xl font-bold text-[#2B2626] uppercase sm:text-3xl",
                trackHead
              )}
            >
              {f.reviewConsent}
            </h2>
          </div>

          <div className="grid gap-3 border-2 border-[#FFFF00] bg-[#FFFDE6] p-5 sm:grid-cols-2">
            <div>
              <p
                className={cn(
                  "text-[10px] font-bold text-[#5A6B7D] uppercase",
                  isTe ? "tracking-normal" : "tracking-[0.2em]"
                )}
              >
                {f.sport}
              </p>
              <p className="mt-1 font-semibold tracking-wide uppercase">
                {sportLabel(draft.sport, f)}
              </p>
            </div>
            <div>
              <p
                className={cn(
                  "text-[10px] font-bold text-[#5A6B7D] uppercase",
                  isTe ? "tracking-normal" : "tracking-[0.2em]"
                )}
              >
                {f.team}
              </p>
              <p className="mt-1 font-semibold">{draft.team.teamName}</p>
            </div>
            <div>
              <p
                className={cn(
                  "text-[10px] font-bold text-[#5A6B7D] uppercase",
                  isTe ? "tracking-normal" : "tracking-[0.2em]"
                )}
              >
                {f.captain}
              </p>
              <p className="mt-1 font-semibold">{draft.captain.fullName}</p>
            </div>
            <div>
              <p
                className={cn(
                  "text-[10px] font-bold text-[#5A6B7D] uppercase",
                  isTe ? "tracking-normal" : "tracking-[0.2em]"
                )}
              >
                {f.members}
              </p>
              <p className="mt-1 font-semibold">
                {fill(f.playersCount, { n: draft.players.length })}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border-2 border-[#FFFF00]">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead className="bg-[#FFFF00] text-[#2B2626]">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">#</th>
                  <th className="px-3 py-2.5 font-semibold">{f.player}</th>
                  <th className="px-3 py-2.5 font-semibold">{f.phone}</th>
                </tr>
              </thead>
              <tbody>
                {draft.players.map((p, i) => (
                  <tr key={i} className="border-t-2 border-[#FFFF00]">
                    <td className="px-3 py-2.5">{padPlayer(i + 1)}</td>
                    <td className="px-3 py-2.5">{p.fullName}</td>
                    <td className="px-3 py-2.5">{p.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#5A6B7D]">{f.aadhaarPrivate}</p>

          <div className="space-y-3 border-2 border-[#FFFF00] bg-[#FFFFFF] p-4">
            <p
              className={cn(
                "text-[11px] font-bold text-[#2B2626] uppercase",
                isTe ? "tracking-normal" : "tracking-[0.18em]"
              )}
            >
              {f.section} 6 — {f.consent}
            </p>
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-[#2B2626]">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-[#FFFF00]"
                checked={draft.consentAuth}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, consentAuth: e.target.checked }))
                }
              />
              <span>
                {f.consentAuth}
                {errors.consentAuth ? (
                  <span className="mt-1 block text-xs text-[#B42318]">
                    {errors.consentAuth}
                  </span>
                ) : null}
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-[#2B2626]">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-[#FFFF00]"
                checked={draft.consentTerms}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, consentTerms: e.target.checked }))
                }
              />
              <span>
                {f.consentTerms}
                {errors.consentTerms ? (
                  <span className="mt-1 block text-xs text-[#B42318]">
                    {errors.consentTerms}
                  </span>
                ) : null}
              </span>
            </label>
          </div>

          {submitError ? (
            <p className="text-sm font-medium text-[#B42318]" role="alert">
              {submitError}
            </p>
          ) : null}
        </section>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 border-t-2 border-[#FFFF00] pt-6 sm:flex-row sm:justify-between">
        {draft.step > 0 ? (
          <button
            type="button"
            onClick={goBack}
            disabled={pending}
            className={cn(
              "min-h-12 w-full cursor-pointer border-2 border-[#FFFF00] bg-white px-6 text-sm font-bold text-[#2B2626] uppercase transition-colors hover:bg-[#FFFF00] sm:w-auto",
              isTe ? "tracking-normal" : "tracking-[0.12em]"
            )}
          >
            {draft.step === 4 ? f.editDetails : f.back}
          </button>
        ) : (
          <span className="hidden sm:block" />
        )}
        {draft.step < 4 ? (
          <button
            type="button"
            onClick={goNext}
            className={cn(
              "btn-red inline-flex min-h-12 w-full items-center justify-center gap-2 px-8 text-sm font-bold uppercase sm:w-auto",
              trackBtn
            )}
          >
            {f.continue} <ArrowRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={pending}
            className={cn(
              "btn-red inline-flex min-h-12 w-full items-center justify-center gap-2 px-8 text-sm font-bold uppercase disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto",
              trackBtn
            )}
          >
            {pending ? (
              f.submitting
            ) : (
              <>
                {f.submit} <ArrowRight className="size-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
