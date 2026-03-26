# AB Test Tracker

## Project Overview
A full-stack Next.js app for tracking A/B tests with statistical significance analysis. Deployed on **Vercel**, backed by **Neon PostgreSQL**.

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19)
- **Database:** Neon PostgreSQL via Prisma ORM
- **File Storage:** Vercel Blob (public store)
- **PDF Generation:** @react-pdf/renderer (server-side)
- **Styling:** Tailwind CSS 4
- **Charts:** Recharts
- **Language:** TypeScript

## Key Architecture
- `prisma/schema.prisma` — Two models: `ABTest` and `Variant` (1-to-many)
- `src/lib/db.ts` — Prisma singleton (prevents hot-reload issues)
- `src/lib/statistics.ts` — Z-test statistical significance calculator
- `src/app/api/tests/` — REST API routes (GET/POST at `/`, GET/PUT/DELETE at `/[id]`)
- `src/app/api/tests/[id]/pdf/` — Server-side PDF generation via @react-pdf/renderer
- `src/app/api/upload/` — Screenshot upload via Vercel Blob (`@vercel/blob` SDK)
- `src/components/TestReportPDF.tsx` — PDF document component (header, data table, stats, notes, footer)
- `src/components/` — TestForm, TestCard, FilterBar, StatsRow, MonthGroup, VariantComparison, SignificanceCalculator

## Database
- **Provider:** PostgreSQL (Neon)
- **Connection:** Via pooler URL in `DATABASE_URL` env var
- **Note:** Removed `channel_binding=require` from connection string — it causes connection drops with Neon's pooler

## Key Features
- Dashboard with stats cards, search, and filters (status, service category, channel, significance, date range)
- Service Categories: Home Cleaning, Salon At Home, Specialty, Healthcare
- Test statuses: Planned, Running, Completed
- Multiple screenshots per variant (stored as JSON string array in `screenshots` field)
- Screenshots uploaded to Vercel Blob (persistent cloud storage, returns public URLs)
- Screenshot delete via hover "x" button on thumbnails
- Live statistical significance calculator in the test form
- Custom channel support (preset list + custom input)
- Winner tracking per test
- PDF download of test results (server-side rendered, proper formatting with tables and stats)

## Important Notes
- `next.config.ts` has `serverExternalPackages` for `@prisma/client`, `@react-pdf/renderer`, and `@react-pdf/pdfkit` — these must stay server-side due to Node.js dependencies
- Tailwind CSS 4 uses `lab()` color functions — incompatible with html2canvas/html2pdf.js client-side capture (that's why PDF is server-rendered)
- Neon free tier databases hibernate after inactivity — first request after sleep may timeout

## Deployment
- **Hosting:** Vercel (auto-deploys from GitHub on push to main)
- **Repo:** https://github.com/phansalkarameya-jpg/ab-test-tracker
- **Database:** Neon PostgreSQL (free tier)
- **File Storage:** Vercel Blob (public store, free tier)
- `postinstall` script in package.json runs `prisma generate` for Vercel builds
- Env var changes in Vercel require a redeploy to take effect

## Environment Variables
- `DATABASE_URL` — Neon PostgreSQL pooler connection string
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob store token (public store)
- Both are in `.env` locally (gitignored) and set in Vercel project settings

## Commands
- `npm run dev` — Start dev server
- `npm run db:push` — Push schema changes to Neon
- `npm run db:seed` — Seed database with sample data
- `npm run db:studio` — Open Prisma Studio
- `npm run setup` — Full setup (generate + push + seed)

## Git
- SSH auth configured for GitHub (key: `~/.ssh/id_ed25519`)
- `.env` is gitignored — contains DATABASE_URL and BLOB_READ_WRITE_TOKEN
- Feature branches recommended for testing changes before merging to main
- Last stable pre-PDF commit: `37236be` — revert with `git revert 595c83e && git push` if needed
- User: Ameya Phansalkar (phansalkar.ameya@gmail.com)
