# Dorm Living OS — Project State

Last updated: 2026-06-02 (session reset prep). Read this file first to resume without prior chat context.

## Project Overview

Next.js app that builds a personalized dorm shopping checklist from onboarding inputs. Features per-item tiered pricing, live budget totals, optional Supabase catalog/persistence, Amazon affiliate **View options** links, print/PDF exports (PDF includes shop links), user-added items, and a one-time **6-step checklist tour** on first visit.

## Canonical Workspace

| What | Path |
|------|------|
| **Cursor / active repo** | `C:\Users\dangi\OneDrive\Documents\GitHub\dorm OS app` |
| **GitHub** | `https://github.com/Dilpickl/dorm-OS-app` (branch `main`, latest `427d121`) |
| **npm package name** | `dorm-living-os` |

Note: An older clone may exist at `C:\Users\dangi\OneDrive\Documents\dorm-living-os` — use the **GitHub\dorm OS app** folder above.

## Core Features (Implemented)

### Home (`/`)
- Playful Geometric UI: hero (two-column on lg), how-it-works sticker cards, onboarding form
- School placeholder: **University of Illinois**
- No footer “learning project” line

### Onboarding → Checklist
- Answers encoded in query string → `/checklist?…`
- **Climate (3):** hot, cold, four-season — **Variable climate removed**
- Dorm type (5), hobbies (multi-select), budget slider $100–$2000 (default $800), “I don’t know” → `budget=unknown`

### Catalog (`src/lib/mockData.ts` — **59 products**)
- Priority: **Supabase** `products` → `CATALOG_API_URL` → built-in mock
- All catalog items have **`amzn.to` affiliate links** in `AFFILIATE_LINKS` map
- Custom tier prices for some items via `src/lib/catalog/priceOverrides.ts` (e.g. portable vacuum $10–$60, TV $60–$500, board games $10–$60)
- Recent additions: portable vacuum, ear plugs, TV, board games (Games category)
- `GET /api/catalog`, `npm run db:seed` to sync Supabase

### Recommendations (`src/lib/recommendations.ts`)
- Hard filters + scoring; uses `CATALOG_TIER_OVERRIDES` when defined

### Checklist (`ChecklistView`)
- Category sections with rotating header tints
- Per catalog item: owned checkbox, name, **View options** (`data-view-options-link`), compact price input (draft while editing — can clear field), remove
- **View options hover:** “My personal recommendation. (paid link)”
- Tier chips on catalog items only; custom items (`custom-` id) have single price, `link: "#"`
- **Add item** panel: name, category select (+ Custom), price
- **Removed items:** collapsible; per-item restore; restore all; 8s undo toast
- **Save badge:** `All changes saved locally · {relative time}`
- **CostSummary** + **Export PDF** (priced breakdown + **Shop link** column) / **Printable checklist** (checkboxes only)
- **Footer:** “As an Amazon Associate I earn from qualifying purchases.”

### Checklist tour (`ChecklistTutorial.tsx`) — replaces old `ViewOptionsCoachmark`
Runs **once per session** when checklist has items (~400ms after load). **Only Skip / Next / Got it are clickable** (no backdrop dismiss, no Escape).

| Step | Target | Bubble placement |
|------|--------|------------------|
| 1 | Estimated total (CostSummary only) | Below |
| 2 | Owned checkbox (first row) | Above (extra gap) |
| 3 | Remove (trash) | Beside |
| 4 | Add item button | Below |
| 5 | Export PDF + Printable buttons (`inline-flex` wrapper) | Below |
| 6 | View options link (scrolls into view) | Beside |

- Layout helpers: `src/lib/coachmarkLayout.ts` (bubble placement, arrow directions, view-options link finder)
- Session key: `dorm-living-os:checklist-tutorial:v3` (also sets legacy `view-options-coachmark:v1`)

### Persistence
- Fingerprint-keyed: `selections`, `removed[]`, `customItems[]`, `updatedAt`
- Cloud: `/api/checklist` + Supabase `checklist_saves` (`__customItems` in selections JSON)
- Fallback: `localStorage` `dorm-living-os:checklist:v1`

## In-Progress / Not Done

- Supabase Auth + per-user saves (fingerprint-only today)
- Production deploy smoke test on Vercel
- Automated tests
- ~~Security hardening~~ (done 2026-06-03): save tokens, URL allowlist, RLS, rate limits, headers
- `npm run db:seed` after catalog changes if using Supabase in production

## UI / Design System — Playful Geometric

**Tokens** (`globals.css`): cream `#FFFDF5`, violet `#8B5CF6`, hard shadows, dot-grid.

**Fonts:** Outfit (headings), Plus Jakarta Sans (body).

**UI:** `src/components/ui/` — Button, StickerCard, Panel, Badge, SceneDecor.

**Forms:** `src/lib/design/forms.ts` — `fieldClass`, `selectClass`, `priceInputClass`.

## Data Model

**Climate:** `"hot" | "cold" | "four-season"` (no `variable`)

**OnboardingAnswers:** `school`, `climate`, `budget`, `dormType`, `hobbies[]`

**ChecklistItem:** `id`, `name`, `category`, `prices`, `defaultTier`, `link`

**Fingerprint:** `school|climate|budget|dormType|sorted hobbies` (lowercase school)

## System Architecture

```
src/app/
  page.tsx, checklist/page.tsx
  api/catalog/route.ts, api/checklist/route.ts
src/components/
  ChecklistView.tsx, ChecklistItemRow.tsx, ChecklistCategorySection.tsx
  ChecklistTutorial.tsx          # 6-step tour (ViewOptionsCoachmark deleted)
  ExportButtons.tsx              # PDF + printable; PDF has affiliate links
  OnboardingForm.tsx, Hero.tsx, CostSummary.tsx, …
src/lib/
  mockData.ts                    # AFFILIATE_LINKS + mockCatalog (60 items)
  catalog/priceOverrides.ts, coachmarkLayout.ts
  recommendations.ts, params.ts, budget.ts
  storage/checklistPersistence.ts, storage/supabaseChecklist.ts
```

## Environment

`.env.local` (not committed):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
# optional: UPSTASH_REDIS_REST_URL=, UPSTASH_REDIS_REST_TOKEN= (API rate limits on Vercel)
# optional: CATALOG_API_URL=, CATALOG_API_KEY=
```

## Known Issues / Risks

### Product / UX
- **OneDrive** path with spaces; sync quirks
- **Port 3000:** kill orphaned Node if dev won’t start
- **Node:** prefer **20 LTS** for `next dev`
- **Export:** requires pop-ups + print dialog
- **Legacy URL params:** `temperate`, `medium`, `traditional`, `climate=variable` invalid

### Security (hardened 2026-06-03)
- **Save tokens:** opaque `save_token` per row; required for GET/POST/DELETE when set; stored client-side per fingerprint; legacy rows migrate on first GET
- **API validation:** `validateChecklistPayload`; `https:` links only; 256KB body cap; enum/length limits
- **RLS:** no anon policies on `checklist_saves` (service role only); run `supabase/migrations/20260603_checklist_security.sql`
- **Rate limits:** API routes + Upstash when `UPSTASH_REDIS_*` set (60 req/min per IP per route)
- **Headers:** `next.config.mjs` (HSTS, frame deny, nosniff, referrer, permissions)
- **School / custom fields:** `maxLength` UI + `SCHOOL_MAX_LENGTH` server-side

**Residual:** fingerprint still groups saves by onboarding answers (first writer holds token); Supabase Auth not implemented.

**Mitigations:** service role + `server-only` admin client; React/export escaping; onboarding enum validation.

## Dev Commands

```powershell
cd "C:\Users\dangi\OneDrive\Documents\GitHub\dorm OS app"
npm install
copy .env.example .env.local
npm run db:seed                # after Supabase schema + env / catalog updates
npm run dev                    # http://localhost:3000
npm run build
npm run lint
```

**Free port 3000 (Windows):**

```powershell
Get-NetTCPConnection -State Listen -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

## Reset Checklist (new session)

1. Read this file
2. `cd` to canonical workspace
3. `.env.local` if using Supabase
4. `npm install` if needed; `npm run db:seed` if catalog changed and Supabase is live
5. `npm run dev`
6. Home → onboarding → checklist
7. Verify: affiliate View options; export PDF shop links; add/remove/restore item; price field clears while editing
8. Retest tour: clear `dorm-living-os:checklist-tutorial:v3` in session storage

## Suggested Next Steps

1. Commit any uncommitted `ChecklistTutorial.tsx` copy tweak if still local-only
2. Vercel deploy + env vars + `db:seed`
3. Run Supabase migration `20260603_checklist_security.sql`; set Upstash env on Vercel
4. Supabase Auth + per-user checklist saves
5. Tests: `parseAnswers`, `mergeCustomIntoCategories`, tour step resolution, persistence
