#!/usr/bin/env node
/**
 * Clear all Teams/Players data rows via Apps Script webhook.
 * Requires the premium script deployed (supports action: clearAll).
 *
 *   node --env-file=.env.local scripts/clear-sheet.mjs
 */

const url = process.env.GOOGLE_APPS_SCRIPT_URL?.trim();

if (!url) {
  console.error("Missing GOOGLE_APPS_SCRIPT_URL");
  process.exit(1);
}

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: "clearAll" }),
  redirect: "follow",
});

const text = await res.text();
console.log("HTTP", res.status);
console.log(text);

try {
  const json = JSON.parse(text);
  if (json.ok) {
    console.log("\nCleared. Next IDs will be KPL-C-001 / KPL-V-001");
  } else {
    console.error("FAILED:", json.error || json);
    process.exit(1);
  }
} catch {
  console.error(
    "Non-JSON response — paste scripts/kpl-apps-script.js, Save, Deploy → New version, then retry."
  );
  process.exit(1);
}
