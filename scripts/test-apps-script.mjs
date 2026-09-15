#!/usr/bin/env node
/**
 * Send one test registration to the Apps Script webhook.
 * Usage:
 *   GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/.../exec" node scripts/test-apps-script.mjs
 * Or set GOOGLE_APPS_SCRIPT_URL in .env.local and run:
 *   node --env-file=.env.local scripts/test-apps-script.mjs
 */

const url = process.env.GOOGLE_APPS_SCRIPT_URL?.trim();

if (!url) {
  console.error("Missing GOOGLE_APPS_SCRIPT_URL");
  console.error("1. Open your sheet → Extensions → Apps Script");
  console.error("2. Paste scripts/kpl-apps-script.js");
  console.error("3. Deploy → New deployment → Web app (Anyone)");
  console.error("4. Put the URL in .env.local");
  process.exit(1);
}

const payload = {
  sport: "Cricket",
  captain: {
    fullName: "Test Captain",
    phone: "9876543210",
    whatsapp: "9876543210",
    aadhaar: "123456789012",
    village: "Kurupam",
    mandal: "Kurupam",
    district: "Parvathipuram Manyam",
    address: "Test House, Main Road, Kurupam",
    email: "test@kpl.local",
    instagram: "",
    facebook: "",
  },
  team: {
    teamName: "KPL Test XI",
    teamLocation: "Kurupam Ground",
    village: "Kurupam",
    mandal: "Kurupam",
    district: "Parvathipuram Manyam",
    jerseyColour: "Green",
    managerName: "",
    managerPhone: "",
    teamLogo: "",
    teamPhoto: "",
  },
  players: [
    {
      fullName: "Test Player One",
      phone: "9123456780",
      aadhaar: "234567890123",
    },
    {
      fullName: "Test Player Two",
      phone: "9123456781",
      aadhaar: "345678901234",
    },
  ],
};

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
  redirect: "follow",
});

const text = await res.text();
console.log("HTTP", res.status);
console.log(text);

try {
  const json = JSON.parse(text);
  if (json.ok) {
    console.log("\nSUCCESS — check your Google Sheet");
    console.log("Registration ID:", json.registrationId);
    console.log("Sheet: https://docs.google.com/spreadsheets/d/1gOVbpA1RjZ-HeC6R-0Hh4irqlYM_ybXURxcPY1CccpI/edit");
  } else {
    console.error("FAILED:", json.error || json);
    process.exit(1);
  }
} catch {
  console.error("Non-JSON response — redeploy Apps Script web app");
  process.exit(1);
}
