"use server";

import {
  registrationSchema,
  type RegistrationForm,
  type Sport,
} from "@/lib/validation/registration";
import { saveRegistration } from "@/lib/sheets";

/** Public-safe success payload — never includes Aadhaar. */
export type SubmitResult =
  | {
      ok: true;
      registrationId: string;
      teamName: string;
      sport: Sport;
      memberCount: number;
      mode: "sheets" | "appscript" | "local";
    }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function submitRegistration(
  raw: RegistrationForm
): Promise<SubmitResult> {
  const parsed = registrationSchema.safeParse({
    ...raw,
    team: {
      ...raw.team,
      numberOfPlayers: raw.players?.length ?? raw.team?.numberOfPlayers,
    },
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      fieldErrors[key] = fieldErrors[key] ?? [];
      fieldErrors[key].push(issue.message);
    }
    return {
      ok: false,
      error: "Please fix the highlighted fields and try again.",
      fieldErrors,
    };
  }

  try {
    const result = await saveRegistration({
      ...parsed.data,
      team: {
        ...parsed.data.team,
        numberOfPlayers: parsed.data.players.length,
      },
    });
    return {
      ok: true,
      registrationId: result.registrationId,
      teamName: parsed.data.team.teamName,
      sport: parsed.data.sport,
      memberCount: parsed.data.players.length,
      mode: result.mode,
    };
  } catch (err) {
    console.error("Registration save failed:", err);
    return {
      ok: false,
      error: "Could not save registration. Please try again in a moment.",
    };
  }
}
