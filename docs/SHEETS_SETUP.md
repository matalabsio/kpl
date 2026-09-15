# KPL — Connect Google Sheets (Complete Guide)

Registrations from `/register` are saved into a Google Spreadsheet with two data tabs:

| Tab | What it stores |
|-----|----------------|
| **Teams** | One row per team registration |
| **Players** | One row per player |
| **Dashboard** | Auto counts (created on first save) |

Follow every step below once. After that, every form submit writes straight into your sheet.

---

## What you need

- A Google account
- This KPL project on your computer
- ~10 minutes

---

## Step 1 — Create a Google Cloud project

1. Open **[Google Cloud Console](https://console.cloud.google.com/)** and sign in.
2. Top bar → **Select a project** → **New Project**.
3. Name it e.g. `KPL Registrations` → **Create**.
4. Make sure that project is selected in the top bar.

---

## Step 2 — Enable Google Sheets API

1. Go to **[APIs & Services → Library](https://console.cloud.google.com/apis/library)**.
2. Search for **Google Sheets API**.
3. Open it → click **Enable**.

---

## Step 3 — Create a service account

1. Go to **[IAM & Admin → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)**.
2. Click **+ Create Service Account**.
3. **Service account name:** `kpl-sheets`
4. Click **Create and Continue**.
5. Role (optional for Sheets): skip or choose **Editor** → **Continue** → **Done**.

---

## Step 4 — Download the JSON key

1. Open the service account you just created.
2. Tab **Keys** → **Add Key** → **Create new key**.
3. Choose **JSON** → **Create**.
4. A `.json` file downloads. Keep it private — never commit it to GitHub.

Open the JSON. You will need:

| JSON field | Env var |
|------------|---------|
| `client_email` | `GOOGLE_SERVICE_ACCOUNT_EMAIL` |
| `private_key` | `GOOGLE_PRIVATE_KEY` |

Example `client_email`:

```text
kpl-sheets@kpl-registrations-xxxxx.iam.gserviceaccount.com
```

---

## Step 5 — Create the spreadsheet

1. Open **[Google Sheets](https://sheets.google.com)** → **Blank** spreadsheet.
2. Rename it to **KPL Registrations**.
3. Look at the URL:

```text
https://docs.google.com/spreadsheets/d/1AbCDeFGhiJKlmnoPQRstuVWxyz1234567890/edit
                                      └──────────── SHEET ID ────────────┘
```

Copy that long ID — that is `GOOGLE_SHEET_ID`.

---

## Step 6 — Share the sheet with the service account

**This step is required.** Without it, the app cannot write.

1. In the spreadsheet, click **Share**.
2. Paste the service account **email** (`client_email` from the JSON).
3. Role: **Editor**.
4. Uncheck “Notify people” if you want.
5. Click **Share** / **Send**.

---

## Step 7 — Add secrets to the app

In the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000

GOOGLE_SHEET_ID=1AbCDeFGhiJKlmnoPQRstuVWxyz1234567890
GOOGLE_SERVICE_ACCOUNT_EMAIL=kpl-sheets@kpl-registrations-xxxxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...long key...\n-----END PRIVATE KEY-----\n"
```

### How to paste the private key correctly

1. From the JSON, copy the full `private_key` value (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`).
2. Keep it inside **double quotes**.
3. Leave the `\n` characters as `\n` (do not turn them into real line breaks inside `.env.local`), **or** paste a multi-line key like this:

```bash
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEowIBAAKCAQEA...
...
-----END PRIVATE KEY-----
"
```

The app converts `\n` → real newlines automatically.

**Never** put `.env.local` or the JSON key file into git.

---

## Step 8 — Restart and test

```bash
# Stop the old server if it is running, then:
npm run dev
```

1. Open [http://localhost:3000/register](http://localhost:3000/register)
2. Submit a full test team (captain + at least 1 player).
3. Open your Google Sheet.

You should see:

- Tab **Teams** — header row + your team
- Tab **Players** — one row per player
- Tab **Dashboard** — counts (created automatically on first write)

Registration IDs look like:

- Cricket → `KPL-C-001`
- Volleyball → `KPL-V-001`

---

## Step 9 — Production (Vercel / host)

Add the **same three Google env vars** in your host dashboard:

- `GOOGLE_SHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

Also set:

- `NEXT_PUBLIC_APP_URL=https://your-real-domain.com`

Redeploy after saving env vars.

---

## What each sheet contains

### Teams (one row = one registration)

Registration ID, Team ID, Registration Date, Sport, Team Name, Captain Name, Captain Phone, Captain WhatsApp, Captain Aadhaar, Email, Village, Mandal, District, Full Address, Team Manager, Manager Phone, Jersey Colour, Number of Players, Team Logo, Team Photo, Instagram, Facebook, Status, DuplicateFlags, Team Location

### Players (one row = one player)

Player ID, Registration ID, Team ID, Team Name, Sport, Player Name, Player Phone, Player Aadhaar, Registration Date

### Status values (edit manually in the sheet)

`Submitted` · `Verified` · `Needs Correction` · `Rejected`

Duplicates are **flagged** in `DuplicateFlags` — they are not blocked automatically.

---

## Privacy (Aadhaar)

- Aadhaar is stored only in the private spreadsheet.
- It is **not** shown on the public success page or in URLs.
- Share the sheet only with authorised organisers.
- Do not export Aadhaar into public WhatsApp / Instagram content.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Data still not in Sheets | Env vars missing → app uses **local memory** only. Check `.env.local` and restart `npm run dev`. |
| `PERMISSION_DENIED` / 403 | Sheet not shared with the service account as **Editor**. |
| `invalid_grant` / auth error | `GOOGLE_PRIVATE_KEY` formatting wrong — re-copy from JSON with `\n` or multi-line quotes. |
| Wrong sheet | Confirm `GOOGLE_SHEET_ID` matches the URL ID. |
| Sheets API error | Confirm **Google Sheets API** is enabled on the same Cloud project as the service account. |

### Quick check: is Sheets configured?

If env vars are empty, submissions still succeed in the browser but only live in server memory until restart — they will **not** appear in Google Sheets.

---

## Checklist

- [ ] Cloud project created  
- [ ] Google Sheets API enabled  
- [ ] Service account + JSON key downloaded  
- [ ] Spreadsheet created  
- [ ] Spreadsheet shared with service account (**Editor**)  
- [ ] `.env.local` filled with Sheet ID, email, private key  
- [ ] Dev server restarted  
- [ ] Test registration appears in **Teams** + **Players**
