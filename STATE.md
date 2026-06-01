# Dorm Living OS — Project State

Last updated for session reset. Use this file to resume development without prior context.

## Project Overview

Next.js application that builds a personalized dorm shopping checklist from student onboarding inputs, with per-item tiered pricing, live budget totals, Supabase-backed catalog and persistence, and print-based exports.

## Core Features (Implemented)

- Home: hero, how-it-works, onboarding form
- Onboarding: school, climate (4), dorm type (5), hobbies (multi-select), budget slider ($100–$2000, default $800), editable budget field, live budget tier label, “I don’t know” → `budget=unknown`
- Routes: `/` → `/checklist?…` (answers in query string)
- Catalog source priority: **Supabase** → external `CATALOG_API_URL` → built-in mock (`src/lib/mockData.ts`)
- Recommendation engine: hard filters (climate, dorm, hobby) + scoring/ranking (essentials, priority, dorm-specific boosts)
- Checklist: categories, 4 price tiers per item (`deriveTiers`), default tier from budget
- Per item: tier select, manual price override, “already own” (excluded from total), remove + restore all
- `CostSummary`: live total vs target budget; estimated-budget mode when budget unknown
- Persistence: Supabase `checklist_saves` via `/api/checklist` when `NEXT_PUBLIC_SUPABASE_URL` set; else `localStorage`
- Exports: detailed print/PDF-style; printable checkbox-only (no prices)
- API: `GET /api/catalog`, `GET|POST|DELETE /api/checklist`
- Seed: `npm run db:seed` → upserts mock catalog into Supabase `products`

## In-Progress Features

- None tracked in repo
- Production `npm run build` / Vercel deploy not verified in last session
- User auth not implemented

## UI / UX Decisions

- Two pages: `/` (onboarding), `/checklist` (interactive list)
- Indigo/slate palette; Geist via `next/font`
- Budget: card with slider + “I don’t know”
- Owned items: reduced opacity, strikethrough
- Tier chips show label + price; active chip when no custom override
- Summary: green/red vs target when budget known; tier from total when unknown
- Status chips: catalog source (Supabase / API / mock), save location (Supabase / local)
- Export: new window + `window.print()` (Save as PDF in browser)

## Data Model

**OnboardingAnswers** (`src/lib/types.ts`)

| Field | Type |
|-------|------|
| `school` | `string` |
| `climate` | `hot` \| `cold` \| `four-season` \| `variable` |
| `budget` | `number` (100–2000) \| `"unknown"` |
| `dormType` | `traditional-double` \| `traditional-single` \| `suite` \| `apartment` \| `off-campus` |
| `hobbies` | `Hobby[]` |

**CatalogProduct** (`src/lib/catalog/types.ts`)

| Field | Notes |
|-------|--------|
| `id`, `name`, `category`, `basePrice`, `link` | Required |
| `climates`, `dormTypes`, `hobby` | Optional filters |
| `essential`, `priority` | Scoring (default priority 50) |

**ChecklistItem** (generated)

`id`, `name`, `category`, `prices: PriceTiers`, `defaultTier`, `link`

**ItemSelection** (client + persisted)

`tier`, `customPrice`, `owned`

**Supabase tables** (`supabase/schema.sql`)

- `products` — catalog rows (`base_price`, `dorm_types`, etc.)
- `checklist_saves` — `fingerprint` PK, `answers`, `selections`, `removed` JSONB

## Business Logic Rules

**Budget tiers** (`src/lib/budget.ts`)

| Min ($) | Label |
|--------|--------|
| 2000 | Premium |
| 1300 | Comfortable |
| 800 | Typical Freshman |
| 400 | Budget-Conscious |
| 0 | Essentials |

**Item tiers** (`deriveTiers`): bare 0.6×, standard 1×, comfortable 1.5×, premium 2.5× base (round $5, min $5)

**Default item tier** (`defaultTierForBudget`): unknown→standard; ≥2000→premium; ≥1300→comfortable; ≥400→standard; else bare

**Recommendations** (`src/lib/recommendations.ts`)

- Hard exclude: climate / dorm / hobby mismatch
- Score: priority, essential (+40), tag matches, traditional→storage/bath boost, kitchen boost for suite/apartment/off-campus, off-campus cookware boost, variable/four-season tweaks
- Sort by score within category; category order fixed + hobbies alphabetical

**Effective price**: owned→0; else `customPrice` ?? `prices[tier]`

**Fingerprint** (`buildAnswersFingerprint`): `school|climate|budget|dormType|sorted hobbies`

## System Architecture

**Stack**

- Next.js 15 App Router, React 19, TypeScript 5, Tailwind CSS v4
- Supabase (`@supabase/supabase-js`) — Postgres + REST via service role on server

**Catalog load** (server, `getCatalog()`)

```
Supabase products table
  → else CATALOG_API_URL
  → else mockCatalog
```

**Checklist persistence**

```
Client ChecklistView
  → loadPersistedChecklist / savePersistedChecklist
  → if NEXT_PUBLIC_SUPABASE_URL: /api/checklist (service role server-side)
  → else localStorage key dorm-living-os:checklist:v1
```

**Key paths**

| Path | Role |
|------|------|
| `src/lib/catalog/getCatalog.ts` | Catalog resolver |
| `src/lib/catalog/fetchSupabase.ts` | Supabase products query |
| `src/lib/recommendations.ts` | `generateChecklist(answers, catalog)` |
| `src/lib/params.ts` | URL ↔ answers |
| `src/lib/storage/checklistPersistence.ts` | Client persistence facade |
| `src/lib/storage/supabaseChecklist.ts` | Server Supabase CRUD |
| `src/lib/supabase/admin.ts` | Service-role client |
| `src/app/checklist/page.tsx` | Server: parse URL, load catalog, render view |
| `src/components/ChecklistView.tsx` | Client state owner |
| `scripts/seed-supabase.ts` | `npm run db:seed` |
| `supabase/schema.sql` | DDL + RLS |
| `docs/SUPABASE.md` | Setup runbook |

**Repo**

- GitHub: `Dilpickl/dorm-OS-app`
- Local: `dorm-living-os/` (OneDrive path: `C:\Users\dangi\OneDrive\Documents\dorm-living-os`)

## Environment

Required for Supabase (`.env.local`, not committed):

```env
NEXT_PUBLIC_SUPABASE_URL=https://bxznisiadawtmxukjdbp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key>
SUPABASE_SERVICE_ROLE_KEY=<secret key>
```

Optional:

```env
CATALOG_API_URL=
CATALOG_API_KEY=
```

## Known Issues / Risks

- **No auth**: `checklist_saves` RLS allows broad access; fingerprint-only isolation — add Supabase Auth before production
- **Secrets in chat history**: rotate Supabase keys if exposed
- **Export**: requires pop-ups; print dialog UX varies by browser
- **OneDrive sync**: can cause file encoding/shell issues on Windows; prefer local dev path outside sync if builds fail with garbled UTF-8
- **Dev server**: orphaned Node process can hold port 3000 after crash; kill listener and restart
- **Node**: use 20 LTS for dev; 24.x reported unstable with `next dev` on this machine
- **Legacy URLs**: params `temperate`, `medium`, `traditional` invalid after schema change
- **No automated tests**
- **Product links**: placeholder search URLs unless catalog provides real links

## Next Steps

1. Run `supabase/schema.sql` in dashboard if tables missing
2. `npm run db:seed` after env configured
3. `npm run build` — fix production errors
4. Deploy to Vercel with same env vars; smoke-test onboarding → checklist → Supabase save → export
5. Add Supabase Auth + per-user `checklist_saves` policies
6. Replace placeholder product links with affiliate/API integration
7. Add tests: `parseAnswers`, `deriveTiers`, `generateChecklist`, `effectivePrice`
8. Harden export (dedicated PDF lib) if print flow insufficient

## Dev Commands

```powershell
cd dorm-living-os
npm install
copy .env.example .env.local   # first time only
npm run db:seed                # after schema + env
npm run dev                    # http://localhost:3000
npm run build
npm run lint
```

**Free port 3000 (Windows)**

```powershell
Get-NetTCPConnection -State Listen -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

## Reset Checklist (new session)

1. Read this file
2. Confirm `.env.local` exists with Supabase keys
3. `npm install`
4. `npm run db:seed` if `products` table empty
5. `npm run dev` → verify checklist shows **Catalog: Supabase**
6. Edit item → confirm **Saved to Supabase** → refresh → state restored
