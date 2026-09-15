# KPL — Launch & organiser handoff

Live site: **https://kpl-one.vercel.app**  
Register: **https://kpl-one.vercel.app/register**  
Poster: **https://kpl-one.vercel.app/poster**

## Sheet (organisers)

Open: [KPL Registrations](https://docs.google.com/spreadsheets/d/1gOVbpA1RjZ-HeC6R-0Hh4irqlYM_ybXURxcPY1CccpI/edit)

| Tab | Use |
|-----|-----|
| **Dashboard** | KPIs left, charts top-right, latest teams, duplicates, roster lookup (**B39**) |
| **Teams** | One row per registration |
| **Players** | Full roster; filter by Registration ID |
| **_ChartData** | Hidden — feeds Dashboard charts (do not edit) |

### Sharing
1. Sheet → **Share**
2. Core organisers: **Editor**
3. Others: **Viewer**
4. Start on **Dashboard**

### After any Apps Script change
1. Extensions → Apps Script
2. Replace all code with [`scripts/kpl-apps-script.js`](../scripts/kpl-apps-script.js)
3. Save → run **`formatAllSheets_`**
4. **Deploy → Manage deployments → Edit → New version**

Current webhook:

```text
https://script.google.com/macros/s/AKfycbyWrNlwxiV1VFxWfZomue5xVnWj_vY2rMReOOMQGakMEhHJqM4CAEJUKN9VK4_L-gOB/exec
```

If the URL changes after redeploy, update `.env.local` and Vercel env `GOOGLE_APPS_SCRIPT_URL`.

---

## Env status

| Var | Status |
|-----|--------|
| `NEXT_PUBLIC_APP_URL` | `https://kpl-one.vercel.app` |
| `GOOGLE_SHEET_ID` / `GOOGLE_APPS_SCRIPT_URL` | Set on Vercel Production |
| Social URLs | Still placeholders — replace in Vercel → Environment Variables, then redeploy |

---

## Verify / clear

```bash
npm run test:sheet
npm run clear:sheet
```

Or Apps Script → `clearAllRegistrationData_` → Run

Print poster: https://kpl-one.vercel.app/poster
