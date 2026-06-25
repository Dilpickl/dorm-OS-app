# Dorm Living OS

A Next.js app that helps college students plan what to buy for move-in. Answer a short onboarding form and get a **personalized dorm shopping checklist** with tiered pricing, live budget totals, optional cloud save, and export tools.

Live demo: deploy on [Vercel](https://vercel.com) from this repo (see [Getting started](#getting-started)).

## What it does

- **Personalized recommendations** — school, climate, dorm type, hobbies, and budget shape which catalog items appear and at which price tier.
- **Interactive checklist** — mark items as owned, adjust prices, add custom items, remove and restore rows, and see an estimated total update in real time.
- **Amazon affiliate links** — every catalog item has a **View options** link (`amzn.to`) to a suggested product. Links appear in the checklist UI and in **PDF export** (Shop link column). The checklist footer includes the standard disclosure: *“As an Amazon Associate I earn from qualifying purchases.”*
- **Export** — download a priced **PDF** (with shop links) or a **printable checklist** (checkboxes only).
- **Guided tour** — a one-time, 6-step walkthrough on first checklist visit (totals, owned checkbox, remove, add item, export, View options).
- **Persistence** — selections save to `localStorage`, or to **Supabase** via `/api/checklist` when configured (with per-save tokens for write protection).
- **Analytics** — [Vercel Web Analytics](https://vercel.com/docs/analytics) on production deployments.

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (optional catalog + checklist storage)
- [Upstash Redis](https://upstash.com/) (optional API rate limiting on Vercel)

## Getting started

```bash
git clone https://github.com/Dilpickl/dorm-OS-app.git
cd dorm-OS-app
npm install
cp .env.example .env.local   # optional — only needed for Supabase / rate limits
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env.local` and fill in what you need:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only — catalog + checklist API |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Optional rate limits on `/api/*` |
| `CATALOG_API_URL` / `CATALOG_API_KEY` | Optional external catalog fallback |

Without Supabase, the app uses the built-in mock catalog in `src/lib/mockData.ts` (**59 products**, each with an affiliate link map).

After changing the catalog or schema, run:

```bash
npm run db:seed
```

Apply `supabase/migrations/20260603_checklist_security.sql` on existing Supabase projects (save tokens + tightened RLS).

## How it works

```text
Home (/) — onboarding form
        │
        │  answers encoded in URL query string
        ▼
/checklist — recommendations engine → ChecklistView
        │
        ├── View options (Amazon affiliate links)
        ├── PDF / printable export
        └── save to localStorage or Supabase
```

1. **Home (`/`)** — school, climate, budget ($100–$2000 or “I don’t know”), dorm type, and hobbies.
2. **Checklist (`/checklist`)** — `generateChecklist()` filters and scores catalog items; students tune prices, mark owned items, and export.
3. **Catalog source** — Supabase `products` table → optional `CATALOG_API_URL` → built-in mock data.

## Affiliate links

Affiliate URLs live in `AFFILIATE_LINKS` inside `src/lib/mockData.ts` (short `amzn.to` links). They are **not** user-editable; custom items use `link: "#"`. The checklist tour’s last step highlights **View options** so new users understand these are paid recommendations.

## Project structure

```text
src/
  app/
    page.tsx                 Home (hero + onboarding)
    checklist/page.tsx       Results page
    api/catalog/route.ts     GET catalog JSON
    api/checklist/route.ts   GET/POST/DELETE saved progress
    layout.tsx               Root layout + Vercel Analytics
  components/
    ChecklistView.tsx        Main checklist UI
    ChecklistTutorial.tsx    6-step first-visit tour
    ExportButtons.tsx        PDF + printable export
    OnboardingForm.tsx       Onboarding form
    ui/                      Design system (Button, Panel, …)
  lib/
    mockData.ts              Catalog + AFFILIATE_LINKS
    recommendations.ts       Filtering + scoring
    storage/                 localStorage + Supabase persistence
    security/                API validation, save tokens, rate limits
supabase/
  schema.sql                 Products + checklist_saves tables
  migrations/                Incremental SQL (e.g. security hardening)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run db:seed` | Sync catalog to Supabase |

## Deploying on Vercel

1. Import the GitHub repo in Vercel.
2. Add env vars from `.env.example` (at minimum Supabase keys if using cloud save).
3. Enable **Web Analytics** in the Vercel project dashboard.
4. Run the Supabase migration SQL after first deploy if using an existing database.

## License

Private learning / portfolio project. See repository owner for terms.
