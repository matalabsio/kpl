# KPL — Google Apps Script setup (easiest)

Your sheet is ready:  
[KPL Registrations](https://docs.google.com/spreadsheets/d/1gOVbpA1RjZ-HeC6R-0Hh4irqlYM_ybXURxcPY1CccpI/edit)

No Google Cloud service account needed for this path.

---

## 1. Open Apps Script from the sheet

1. Open the spreadsheet
2. **Extensions → Apps Script**
3. Delete any default `Code.gs` content
4. Paste everything from [`scripts/kpl-apps-script.js`](../scripts/kpl-apps-script.js)
5. **Save** (disk icon) — project name: `KPL Registration`

---

## 2. Apply premium formatting (required after paste)

1. In Apps Script, select function **`formatAllSheets_`** from the dropdown
2. Click **Run** → authorize when prompted
3. Refresh the spreadsheet — you should see:
   - **Dashboard** — black/yellow title, red band, KPIs, charts, latest teams, roster lookup (B39)
   - **Teams** / **Players** with yellow headers (black text), filters, sport tinting
   - **Sheet1** hidden

### Roster lookup
On **Dashboard**, cell **B39** is a yellow dropdown. Pick a Registration ID to list that team’s full roster below.

---

## 3. Clear test data before launch

1. Select **`clearAllRegistrationData_`** → **Run**
2. Confirm Teams/Players only have header rows
3. Next real registration will be `KPL-C-001` / `KPL-V-001`

Or after redeploy, from the project:

```bash
node --env-file=.env.local scripts/clear-sheet.mjs
```

---

## 4. Deploy as Web App

1. **Deploy → New deployment** (first time)  
   Or **Deploy → Manage deployments → Edit (pencil) → New version** (after code changes)
2. Gear icon → **Web app** (first time only)
3. Settings:
   - **Description:** KPL register webhook
   - **Execute as:** Me
   - **Who has access:** Anyone
4. **Deploy**
5. Copy the **Web app URL**  
   (looks like `https://script.google.com/macros/s/XXXX/exec`)

**Important:** After every script paste/edit, create a **New version** or the live webhook still runs the old code.

---

## 5. Connect the Next.js app

In `.env.local`:

```bash
GOOGLE_SHEET_ID=1gOVbpA1RjZ-HeC6R-0Hh4irqlYM_ybXURxcPY1CccpI
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
```

Restart:

```bash
npm run dev
```

---

## 6. Test from the terminal

```bash
npm run test:sheet
```

Or submit a team at http://localhost:3000/register

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Authorization required | Re-run `formatAllSheets_` or `runTest_` |
| Non-JSON / HTML response | Access must be **Anyone**; create a **New version** after code changes |
| No rows appear | Confirm you pasted the script into the **same** spreadsheet as above |
| Still `mode: local` | `GOOGLE_APPS_SCRIPT_URL` empty or server not restarted |
| Dashboard empty / no charts | Run `formatAllSheets_` once from the editor |
