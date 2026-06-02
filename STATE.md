# Dorm Living OS — Project State

Last updated: 2026-06-02 (session reset prep). Read this file first to resume without prior chat context.

## Project Overview

Next.js app that builds a personalized dorm shopping checklist from onboarding inputs. Features per-item tiered pricing, live budget totals, optional Supabase catalog/persistence, print/PDF exports, user-added items, and an onboarding coachmark for product links.

## Canonical Workspace

| What | Path |
|------|------|
| **Cursor / active repo** | `C:\Users\dangi\OneDrive\Documents\GitHub\dorm OS app` |
| **GitHub** | `https://github.com/Dilpickl/dorm-OS-app` (branch `main`) |
| **npm package name** | `dorm-living-os` |

Note: An older clone may exist at `C:\Users\dangi\OneDrive\Documents\dorm-living-os` — use the **GitHub\dorm OS app** folder above.

## Core Features (Implemented)

### Home (`/`)
- Playful Geometric UI: hero (two-column on lg), how-it-works sticker cards, onboarding form
- School placeholder: **University of Illinois**
- No footer “learning project” line

### Onboarding → Checklist
- Answers encoded in query string → `/checklist?…`
- Climate (4), dorm type (5), hobbies (multi-select), budget slider $100–$2000 (default $800), “I don’t know” → `budget=unknown`

### Catalog
- Priority: **Supabase** `products` → `CATALOG_API_URL` → `src/lib/mockData.ts`
- `GET /api/catalog`, `npm run db:seed`

### Recommendations (`src/lib/recommendations.ts`)
- Hard filters + scoring; `generateChecklist(answers, catalog)` → `ChecklistCategory[]`

### Checklist (`ChecklistView`)
- Category sections with rotating header tints (accent / secondary / tertiary / quaternary)
- Per catalog item: checkbox (owned), name, **View options** link (`data-view-options-link`), compact price input, remove
- Tier chips: Bare minimum / Standard / Comfortable / Premium (catalog items only)
- **User-added items** (`id` prefix `custom-`): no tier row; single price; no View options link (`link: "#"`)
- **Add item** panel: name, category `<select>` (existing categories + **Custom** → text field for new category name), price
- Custom items merge into matching category by name (case-insensitive) or create new section at bottom
- **Removed items**: collapsible panel; per-item **Restore**; **Restore all** when >1; undo toast (8s) on remove
- **Save status**: `All changes saved locally · {relative time}` (no catalog-source badge)
- **CostSummary** + **Export PDF** / **Printable checklist**
- **View options coachmark** (`ViewOptionsCoachmark.tsx`) — see UX section

### Persistence
- Fingerprint-keyed saves: `selections`, `removed[]`, **`customItems[]`**, `updatedAt`
- Cloud: `/api/checklist` + Supabase `checklist_saves` (custom items stored in `selections.__customItems` JSON key server-side)
- Fallback: `localStorage` key `dorm-living-os:checklist:v1`
- Relative time helper: `formatRelativeSavedTime()` in `checklistPersistence.ts`

## In-Progress / Not Done

- Supabase Auth (RLS is permissive; fingerprint-only isolation)
- Production deploy smoke test on Vercel (local `npm run build` has passed)
- Automated tests
- Real product/affiliate links (many are search placeholders)

## UI / Design System — Playful Geometric

**Tokens** (`src/app/globals.css`): cream background `#FFFDF5`, violet accent `#8B5CF6`, pink/amber/mint accents, 2px borders, hard shadows (`shadow-pop`, `shadow-sticker`), dot-grid utility.

**Fonts** (`src/app/layout.tsx`): **Outfit** (headings), **Plus Jakarta Sans** (body) via `next/font/google`.

**UI primitives** (`src/components/ui/`):
- `Button` — primary (candy pill + hard shadow), secondary, ghost
- `StickerCard`, `Panel`, `Badge`, `SceneDecor` / `HeroIllustration`
- Shared form styles: `src/lib/design/forms.ts` (`fieldClass`, `selectClass`, `priceInputClass` — compact ~4.25rem width for checklist prices)

**Icons**: `lucide-react` (stroke 2.5).

**Motion**: `animate-pop-in`, `ease-bounce`; respects `prefers-reduced-motion`.

## Checklist UX Details

| Feature | Behavior |
|---------|----------|
| Price input | Compact `priceInputClass`; not full-width (avoid `fieldClass` `w-full` on rows) |
| Custom item tiers | Hidden — edit price only |
| Category picker | Dropdown of existing categories + **Custom**; custom name → new section |
| Removed panel | Collapsed by default; chevron toggle |
| Coachmark trigger | 30s on page + checklist scrolled into view (~12% visible) |
| Coachmark target | Nearest **visible** View options link to viewport center (updates on scroll) |
| Coachmark dismiss | Backdrop (after **2s** lock), Escape (after 2s), Got it, View options click |
| Coachmark once | `sessionStorage` `dorm-living-os:view-options-coachmark:v1` |

## Data Model

**OnboardingAnswers** (`src/lib/types.ts`): `school`, `climate`, `budget` (number \| `"unknown"`), `dormType`, `hobbies[]`

**ChecklistItem**: `id`, `name`, `category`, `prices`, `defaultTier`, `link`

**ItemSelection**: `tier`, `customPrice`, `owned`

**PersistedChecklist** (`checklistPersistence.ts`): `version: 1`, `fingerprint`, `selections`, `removed`, **`customItems`**, `updatedAt`

**Supabase** (`supabase/schema.sql`): `products`, `checklist_saves` (answers/selections/removed JSONB)

## Business Logic (unchanged core)

- **Budget tiers** / **deriveTiers** / **defaultTierForBudget**: `src/lib/budget.ts`
- **Effective price**: owned → 0; else `customPrice ?? prices[tier]`
- **Fingerprint**: `school|climate|budget|dormType|sorted hobbies`

## System Architecture

```
src/app/
  page.tsx              Home
  checklist/page.tsx    Server: parseAnswers → getCatalog → ChecklistView
  api/catalog/route.ts
  api/checklist/route.ts   GET|POST|DELETE (+ customItems in POST body)
src/components/
  ChecklistView.tsx        Main client state
  ChecklistItemRow.tsx
  ChecklistCategorySection.tsx
  ViewOptionsCoachmark.tsx
  ExportButtons.tsx
  OnboardingForm.tsx, Hero.tsx, …
src/lib/
  recommendations.ts, params.ts, budget.ts, mockData.ts
  catalog/getCatalog.ts, storage/checklistPersistence.ts, storage/supabaseChecklist.ts
```

## Environment

`.env.local` (not committed):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
# optional: CATALOG_API_URL=, CATALOG_API_KEY=
```

## Known Issues / Risks

- **OneDrive**: path with spaces; sync can cause odd shell/encoding issues
- **Port 3000**: kill orphaned Node if dev won’t start
- **Node**: prefer **20 LTS** for `next dev` (24.x reported flaky on this machine)
- **No auth** on `checklist_saves`
- **Export**: pop-ups + browser print dialog
- **Legacy URL params**: `temperate`, `medium`, `traditional` invalid

## Dev Commands

```powershell
cd "C:\Users\dangi\OneDrive\Documents\GitHub\dorm OS app"
npm install
copy .env.example .env.local   # first time
npm run db:seed                # after Supabase schema + env
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
2. `cd` to canonical workspace path above
3. Confirm `.env.local` if using Supabase
4. `npm install` if needed
5. `npm run dev`
6. Home → onboarding → checklist
7. Verify: save badge **“All changes saved locally · …”**; add custom item; remove/restore; coachmark (clear `dorm-living-os:view-options-coachmark:v1` in session storage to retest)
8. Optional: `npm run build` before deploy work

## Suggested Next Steps

1. Commit/push any uncommitted checklist UX changes if not on `main`
2. Vercel deploy + env vars
3. Supabase Auth + per-user saves
4. Tests for `parseAnswers`, `mergeCustomIntoCategories`, persistence, coachmark gates
5. Affiliate/real product URLs in catalog
