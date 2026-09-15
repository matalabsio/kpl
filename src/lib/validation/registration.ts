import { z } from "zod";

export const SPORTS = ["Cricket", "Volleyball"] as const;
export type Sport = (typeof SPORTS)[number];

export const MAX_PLAYERS: Record<Sport, number> = {
  Cricket: 15,
  Volleyball: 12,
};

export const indianPhoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const aadhaarSchema = z
  .string()
  .trim()
  .regex(/^\d{12}$/, "Aadhaar must be exactly 12 digits");

export const sportSchema = z.enum(SPORTS);

export const captainSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  phone: indianPhoneSchema,
  whatsapp: indianPhoneSchema,
  aadhaar: aadhaarSchema,
  village: z.string().trim().min(2, "Village / Town is required"),
  mandal: z.string().trim().min(2, "Mandal is required"),
  district: z.string().trim().min(2, "District is required"),
  address: z.string().trim().min(5, "Full address is required"),
  email: z
    .string()
    .trim()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),
  instagram: z.string().trim().optional().or(z.literal("")),
  facebook: z.string().trim().optional().or(z.literal("")),
});

export const teamSchema = z.object({
  teamName: z.string().trim().min(2, "Team name is required"),
  teamLocation: z.string().trim().optional().or(z.literal("")),
  village: z.string().trim().optional().or(z.literal("")),
  mandal: z.string().trim().optional().or(z.literal("")),
  district: z.string().trim().optional().or(z.literal("")),
  numberOfPlayers: z.coerce.number().int().min(1).optional(),
  jerseyColour: z.string().trim().optional().or(z.literal("")),
  managerName: z.string().trim().optional().or(z.literal("")),
  managerPhone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^[6-9]\d{9}$/.test(v),
      "Enter a valid 10-digit Indian mobile number"
    ),
  teamLogo: z.string().trim().optional().or(z.literal("")),
  teamPhoto: z.string().trim().optional().or(z.literal("")),
});

export const playerSchema = z.object({
  fullName: z.string().trim().min(2, "Player name is required"),
  phone: indianPhoneSchema,
  aadhaar: aadhaarSchema,
});

export const registrationSchema = z
  .object({
    sport: sportSchema,
    captain: captainSchema,
    team: teamSchema,
    players: z.array(playerSchema).min(1, "Add at least one player"),
  })
  .superRefine((data, ctx) => {
    const max = MAX_PLAYERS[data.sport];
    if (data.players.length > max) {
      ctx.addIssue({
        code: "custom",
        message: `Maximum squad size is ${max} for ${data.sport}`,
        path: ["players"],
      });
    }
  });

export type CaptainForm = z.infer<typeof captainSchema>;
export type TeamForm = z.infer<typeof teamSchema>;
export type PlayerForm = z.infer<typeof playerSchema>;
export type RegistrationForm = z.infer<typeof registrationSchema>;

/** Mask Aadhaar for UI display only — never expose full value publicly. */
export function maskAadhaar(aadhaar: string): string {
  const digits = aadhaar.replace(/\D/g, "");
  if (digits.length < 4) return "XXXX-XXXX-XXXX";
  return `XXXX-XXXX-${digits.slice(-4)}`;
}

export const emptyCaptain: CaptainForm = {
  fullName: "",
  phone: "",
  whatsapp: "",
  aadhaar: "",
  village: "",
  mandal: "",
  district: "",
  address: "",
  email: "",
  instagram: "",
  facebook: "",
};

export const emptyTeam: TeamForm = {
  teamName: "",
  teamLocation: "",
  village: "",
  mandal: "",
  district: "",
  numberOfPlayers: 1,
  jerseyColour: "",
  managerName: "",
  managerPhone: "",
  teamLogo: "",
  teamPhoto: "",
};

export const emptyPlayer: PlayerForm = {
  fullName: "",
  phone: "",
  aadhaar: "",
};
