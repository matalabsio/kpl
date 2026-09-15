import { registrationSchema } from "../src/lib/validation/registration.ts";
import {
  saveRegistration,
  getLocalStoreSnapshot,
} from "../src/lib/sheets.ts";

function team(i: number, sport: "Cricket" | "Volleyball") {
  const pad = String(i).padStart(2, "0");
  return {
    sport,
    captain: {
      fullName: `Captain ${pad}`,
      phone: String(9000000000 + i).slice(0, 10),
      whatsapp: String(9000000100 + i).slice(0, 10),
      aadhaar: String(100000000000 + i).padStart(12, "0").slice(-12),
      village: "Kurupam",
      mandal: "Kurupam",
      district: "Parvathipuram Manyam",
      address: `House ${pad}, Main Road`,
      email: `c${pad}@test.com`,
      instagram: "",
      facebook: "",
    },
    team: {
      teamName: `${sport === "Cricket" ? "XI" : "Spike"} ${pad}`,
      teamLocation: "Kurupam",
      village: "Kurupam",
      mandal: "Kurupam",
      district: "Parvathipuram Manyam",
      numberOfPlayers: 2,
      jerseyColour: "Green",
      managerName: "",
      managerPhone: "",
    },
    players: [
      {
        fullName: `PA${pad}`,
        phone: String(9100000000 + i).slice(0, 10),
        aadhaar: String(200000000000 + i).padStart(12, "0").slice(-12),
      },
      {
        fullName: `PB${pad}`,
        phone: String(9200000000 + i).slice(0, 10),
        aadhaar: String(300000000000 + i).padStart(12, "0").slice(-12),
      },
    ],
  };
}

async function main() {
  const sports: Array<"Cricket" | "Volleyball"> = [
    "Cricket",
    "Cricket",
    "Cricket",
    "Volleyball",
    "Volleyball",
    "Cricket",
    "Volleyball",
    "Cricket",
  ];

  const ids: string[] = [];
  for (let i = 0; i < sports.length; i++) {
    const raw = team(i + 1, sports[i]);
    const parsed = registrationSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(parsed.error);
      process.exit(1);
    }
    const r = await saveRegistration(parsed.data);
    ids.push(`${r.registrationId} (${r.mode})`);
  }

  const dup = team(1, "Cricket");
  dup.team.teamName = "XI 01";
  const dupResult = await saveRegistration(registrationSchema.parse(dup));
  const snap = getLocalStoreSnapshot();

  console.log("IDs:", ids.join(", "));
  console.log(
    "Dup ID:",
    dupResult.registrationId,
    "flags:",
    dupResult.duplicateFlags || "(none)"
  );
  console.log(
    "Teams rows:",
    snap.teams.length,
    "Players rows:",
    snap.players.length
  );

  if (snap.teams.length < 8) {
    throw new Error("Expected at least 8 team rows");
  }
  if (!ids.some((id) => id.startsWith("KPL-C-"))) {
    throw new Error("Missing cricket IDs");
  }
  if (!ids.some((id) => id.startsWith("KPL-V-"))) {
    throw new Error("Missing volleyball IDs");
  }
  if (!dupResult.duplicateFlags.includes("duplicate_captain_phone")) {
    throw new Error("Expected duplicate captain phone flag");
  }
  if (!dupResult.duplicateFlags.includes("duplicate_team_name")) {
    throw new Error("Expected duplicate team name flag");
  }
  console.log("OK — dummy registrations verified");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
