# Kurupam Premier League

Mobile-first team registration portal for Cricket & Volleyball.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- `/` — landing
- `/register` — multi-step registration
- `/register/success` — confirmation + ID
- `/poster` — print-ready poster with QR

## Google Sheets

- **Recommended:** [docs/APPS_SCRIPT_SETUP.md](docs/APPS_SCRIPT_SETUP.md) (webhook → spreadsheet)
- **Launch / organisers:** [docs/LAUNCH.md](docs/LAUNCH.md)
- Alternative service-account path: [docs/SHEETS_SETUP.md](docs/SHEETS_SETUP.md)

Without Google credentials, submissions use an in-memory store (dev only).

```bash
npm run test:sheet    # one test team → sheet
npm run clear:sheet   # wipe data rows (after premium script redeploy)
```

## QR code

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com npm run generate-qr
```

## Dummy test

```bash
npm run dev
# another terminal:
npm run test:register
```
