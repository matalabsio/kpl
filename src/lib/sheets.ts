import { google } from "googleapis";
import type { RegistrationForm, Sport } from "@/lib/validation/registration";

const TEAM_HEADERS = [
  "Registration ID",
  "Team ID",
  "Registration Date",
  "Sport",
  "Team Name",
  "Captain Name",
  "Captain Phone",
  "Captain WhatsApp",
  "Captain Aadhaar",
  "Email",
  "Village",
  "Mandal",
  "District",
  "Full Address",
  "Team Manager",
  "Manager Phone",
  "Jersey Colour",
  "Number of Players",
  "Team Logo",
  "Team Photo",
  "Instagram",
  "Facebook",
  "Status",
  "DuplicateFlags",
  "Team Location",
] as const;

const PLAYER_HEADERS = [
  "Player ID",
  "Registration ID",
  "Team ID",
  "Team Name",
  "Sport",
  "Player Name",
  "Player Phone",
  "Player Aadhaar",
  "Registration Date",
] as const;

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !key || !sheetId) {
    return null;
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return { auth, sheetId };
}

function getSheets() {
  const creds = getAuth();
  if (!creds) return null;
  const sheets = google.sheets({ version: "v4", auth: creds.auth });
  return { sheets, sheetId: creds.sheetId };
}

export function isSheetsConfigured(): boolean {
  return Boolean(getAuth() || process.env.GOOGLE_APPS_SCRIPT_URL);
}

export type SaveResult = {
  registrationId: string;
  teamId: string;
  duplicateFlags: string;
  mode: "sheets" | "appscript" | "local";
};

async function saveViaAppsScript(
  data: RegistrationForm
): Promise<SaveResult | null> {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL?.trim();
  if (!url) return null;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    redirect: "follow",
  });

  const text = await res.text();
  let json: {
    ok?: boolean;
    registrationId?: string;
    teamId?: string;
    duplicateFlags?: string;
    error?: string;
  };
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      `Apps Script returned non-JSON (${res.status}). Redeploy the web app and check the URL.`
    );
  }

  if (!json.ok || !json.registrationId) {
    throw new Error(json.error || "Apps Script save failed");
  }

  return {
    registrationId: json.registrationId,
    teamId: json.teamId || json.registrationId,
    duplicateFlags: json.duplicateFlags || "",
    mode: "appscript",
  };
}


async function ensureHeaders(
  sheets: ReturnType<typeof google.sheets>,
  sheetId: string
) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const titles = new Set(
    (meta.data.sheets ?? []).map((s) => s.properties?.title).filter(Boolean)
  );

  const requests: Array<{
    addSheet: { properties: { title: string } };
  }> = [];

  if (!titles.has("Teams")) {
    requests.push({ addSheet: { properties: { title: "Teams" } } });
  }
  if (!titles.has("Players")) {
    requests.push({ addSheet: { properties: { title: "Players" } } });
  }
  if (!titles.has("Dashboard")) {
    requests.push({
      addSheet: { properties: { title: "Dashboard" } },
    });
  }

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: { requests },
    });
  }

  const teamHeader = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Teams!A1:Y1",
  });
  if (!teamHeader.data.values?.[0]?.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: "Teams!A1",
      valueInputOption: "RAW",
      requestBody: { values: [[...TEAM_HEADERS]] },
    });
  }

  const playerHeader = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Players!A1:I1",
  });
  if (!playerHeader.data.values?.[0]?.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: "Players!A1",
      valueInputOption: "RAW",
      requestBody: { values: [[...PLAYER_HEADERS]] },
    });
  }

  const dash = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Dashboard!A1:B10",
  });
  if (!dash.data.values?.[0]?.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: "Dashboard!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          ["Metric", "Count"],
          ["Total Teams", '=COUNTA(Teams!A2:A)-COUNTBLANK(Teams!A2:A)'],
          [
            "Cricket Teams",
            '=COUNTIF(Teams!D:D,"Cricket")',
          ],
          [
            "Volleyball Teams",
            '=COUNTIF(Teams!D:D,"Volleyball")',
          ],
          ["Total Players", '=COUNTA(Players!A2:A)-COUNTBLANK(Players!A2:A)'],
          [
            "Today's Registrations",
            '=COUNTIF(Teams!C:C,TEXT(TODAY(),"yyyy-mm-dd")&"*")',
          ],
        ],
      },
    });
  }
}

function sportPrefix(sport: Sport): "C" | "V" {
  return sport === "Cricket" ? "C" : "V";
}

async function nextRegistrationId(
  sheets: ReturnType<typeof google.sheets>,
  sheetId: string,
  sport: Sport
): Promise<string> {
  const prefix = sportPrefix(sport);
  const pattern = `KPL-${prefix}-`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Teams!A2:A",
  });

  let max = 0;
  for (const row of res.data.values ?? []) {
    const id = String(row[0] ?? "");
    if (!id.startsWith(pattern)) continue;
    const num = parseInt(id.slice(pattern.length), 10);
    if (!Number.isNaN(num) && num > max) max = num;
  }

  return `${pattern}${String(max + 1).padStart(3, "0")}`;
}

export type DuplicateFlags = {
  captainPhone: boolean;
  teamName: boolean;
  playerPhones: string[];
  aadhaars: string[];
};

export async function findDuplicates(
  data: RegistrationForm
): Promise<DuplicateFlags> {
  const client = getSheets();

  let teamRows: string[][] = [];
  let playerRows: string[][] = [];

  if (!client) {
    teamRows = localStore.teams;
    playerRows = localStore.players;
  } else {
    const { sheets, sheetId } = client;
    await ensureHeaders(sheets, sheetId);

    const teams = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Teams!A2:Y",
    });
    const players = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Players!A2:I",
    });

    teamRows = teams.data.values ?? [];
    playerRows = players.data.values ?? [];
  }

  const captainPhones = new Set(teamRows.map((r) => String(r[6] ?? "").trim()));
  const teamNames = new Set(
    teamRows.map((r) => String(r[4] ?? "").trim().toLowerCase())
  );
  const existingPlayerPhones = new Set(
    playerRows.map((r) => String(r[6] ?? "").trim())
  );
  const existingAadhaars = new Set([
    ...teamRows.map((r) => String(r[8] ?? "").trim()),
    ...playerRows.map((r) => String(r[7] ?? "").trim()),
  ]);

  const playerPhoneDupes = data.players
    .filter((p) => existingPlayerPhones.has(p.phone))
    .map((p) => p.phone);

  const aadhaarDupes = [
    ...(existingAadhaars.has(data.captain.aadhaar)
      ? [data.captain.aadhaar]
      : []),
    ...data.players
      .filter((p) => existingAadhaars.has(p.aadhaar))
      .map((p) => p.aadhaar),
  ];

  return {
    captainPhone: captainPhones.has(data.captain.phone),
    teamName: teamNames.has(data.team.teamName.trim().toLowerCase()),
    playerPhones: [...new Set(playerPhoneDupes)],
    aadhaars: [...new Set(aadhaarDupes)],
  };
}

function formatDuplicateFlags(flags: DuplicateFlags): string {
  const parts: string[] = [];
  if (flags.captainPhone) parts.push("duplicate_captain_phone");
  if (flags.teamName) parts.push("duplicate_team_name");
  if (flags.playerPhones.length)
    parts.push(`duplicate_player_phone:${flags.playerPhones.join("|")}`);
  if (flags.aadhaars.length)
    parts.push(`duplicate_aadhaar:${flags.aadhaars.join("|")}`);
  return parts.join("; ");
}

/** In-memory fallback when Google Sheets is not configured (local/dev). */
const localStore: {
  teams: string[][];
  players: string[][];
  counters: { C: number; V: number };
} = {
  teams: [],
  players: [],
  counters: { C: 0, V: 0 },
};

export function getLocalStoreSnapshot() {
  return localStore;
}

export async function saveRegistration(
  data: RegistrationForm
): Promise<SaveResult> {
  // Prefer Apps Script webhook (easiest setup with a shared Google Sheet)
  const viaScript = await saveViaAppsScript(data);
  if (viaScript) return viaScript;

  const flags = await findDuplicates(data);
  const flagStr = formatDuplicateFlags(flags);
  const date = new Date().toISOString();

  const client = getSheets();

  if (!client) {
    const prefix = sportPrefix(data.sport);
    localStore.counters[prefix] += 1;
    const registrationId = `KPL-${prefix}-${String(localStore.counters[prefix]).padStart(3, "0")}`;
    const teamId = registrationId;

    localStore.teams.push([
      registrationId,
      teamId,
      date,
      data.sport,
      data.team.teamName,
      data.captain.fullName,
      data.captain.phone,
      data.captain.whatsapp,
      data.captain.aadhaar,
      data.captain.email ?? "",
      data.team.village || data.captain.village,
      data.team.mandal || data.captain.mandal,
      data.team.district || data.captain.district,
      data.captain.address,
      data.team.managerName ?? "",
      data.team.managerPhone ?? "",
      data.team.jerseyColour ?? "",
      String(data.players.length),
      data.team.teamLogo ?? "",
      data.team.teamPhoto ?? "",
      data.captain.instagram ?? "",
      data.captain.facebook ?? "",
      "Submitted",
      flagStr,
      data.team.teamLocation ?? "",
    ]);

    data.players.forEach((p, i) => {
      localStore.players.push([
        `P${String(i + 1).padStart(3, "0")}`,
        registrationId,
        teamId,
        data.team.teamName,
        data.sport,
        p.fullName,
        p.phone,
        p.aadhaar,
        date,
      ]);
    });

    return {
      registrationId,
      teamId,
      duplicateFlags: flagStr,
      mode: "local",
    };
  }

  const { sheets, sheetId } = client;
  await ensureHeaders(sheets, sheetId);
  const registrationId = await nextRegistrationId(sheets, sheetId, data.sport);
  const teamId = registrationId;

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Teams!A:Y",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          registrationId,
          teamId,
          date,
          data.sport,
          data.team.teamName,
          data.captain.fullName,
          data.captain.phone,
          data.captain.whatsapp,
          data.captain.aadhaar,
          data.captain.email ?? "",
          data.team.village || data.captain.village,
          data.team.mandal || data.captain.mandal,
          data.team.district || data.captain.district,
          data.captain.address,
          data.team.managerName ?? "",
          data.team.managerPhone ?? "",
          data.team.jerseyColour ?? "",
          String(data.players.length),
          data.team.teamLogo ?? "",
          data.team.teamPhoto ?? "",
          data.captain.instagram ?? "",
          data.captain.facebook ?? "",
          "Submitted",
          flagStr,
          data.team.teamLocation ?? "",
        ],
      ],
    },
  });

  const playerRows = data.players.map((p, i) => [
    `P${String(i + 1).padStart(3, "0")}`,
    registrationId,
    teamId,
    data.team.teamName,
    data.sport,
    p.fullName,
    p.phone,
    p.aadhaar,
    date,
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Players!A:I",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: playerRows },
  });

  return {
    registrationId,
    teamId,
    duplicateFlags: flagStr,
    mode: "sheets",
  };
}
