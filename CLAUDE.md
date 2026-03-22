# AB Test Tracker

## Project Overview
A full-stack Next.js app for tracking A/B tests with statistical significance analysis. Deployed on **Vercel**, backed by **Neon PostgreSQL**.

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19)
- **Database:** Neon PostgreSQL via Prisma ORM
- **Styling:** Tailwind CSS 4
- **Charts:** Recharts
- **Language:** TypeScript

## Key Architecture
- `prisma/schema.prisma` — Two models: `ABTest` and `Variant` (1-to-many)
- `src/lib/db.ts` — Prisma singleton (prevents hot-reload issues)
- `src/lib/statistics.ts` — Z-test statistical significance calculator
- `src/app/api/tests/` — REST API routes (GET/POST at `/`, GET/PUT/DELETE at `/[id]`)
- `src/app/api/upload/` — Screenshot file upload (saves to `public/uploads/`)
- `src/components/` — TestForm, TestCard, FilterBar, StatsRow, MonthGroup, VariantComparison, SignificanceCalculator

## Database
- **Provider:** PostgreSQL (Neon)
- **Connection:** Via pooler URL in `DATABASE_URL` env var
- **Note:** Removed `channel_binding=require` from connection string — it causes connection drops with Neon's pooler

## Key Features
- Dashboard with stats cards, search, and filters (status, channel, significance, date range)
- Test statuses: Planned, Running, Completed
- Multiple screenshots per variant (stored as JSON string array in `screenshots` field)
- Screenshot delete via hover "x" button on thumbnails
- Live statistical significance calculator in the test form
- Custom channel support (preset list + custom input)
- Winner tracking per test

## Deployment
- **Hosting:** Vercel (auto-deploys from GitHub)
- **Repo:** https://github.com/phansalkarameya-jpg/ab-test-tracker
- **Database:** Neon PostgreSQL (free tier)
- `postinstall` script in package.json runs `prisma generate` for Vercel builds
- Screenshots upload to `public/uploads/` — works locally but NOT on Vercel (ephemeral filesystem). Needs cloud storage (Vercel Blob, Cloudinary) for production screenshots.

## Commands
- `npm run dev` — Start dev server
- `npm run db:push` — Push schema changes to Neon
- `npm run db:seed` — Seed database with sample data
- `npm run db:studio` — Open Prisma Studio
- `npm run setup` — Full setup (generate + push + seed)

## Git
- SSH auth configured for GitHub
- `.env` is gitignored — contains `DATABASE_URL` with Neon credentials
