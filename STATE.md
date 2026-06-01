# Dorm Living OS — Project State

## Project Overview

Next.js web app that generates a personalized dorm shopping checklist for college students from onboarding answers, with per-item tiered pricing, live budget totals, and export.

## Core Features (Implemented)

- Home page: hero, “how it works”, onboarding form
- Onboarding: school (text), climate (4 options), dorm type (5 options), hobbies (multi-select chips)
- Budget input: slider $100–$2000 (default $800), editable dollar field, live budget tier label
- “I don’t know” budget path: `budget=unknown` in URL; checklist estimates budget from item total
- Two-route flow: `/` → `/checklist?…` via query string (no persistence)
- Recommendation engine: filter mock catalog by climate, dorm type, hobbies (budget does not filter items)
- Checklist: categorized items with 4 price tiers per item (derived from `basePrice`)
- Per-item controls: tier select, manual price override, “already own” (excluded from total), remove + restore all
- Live `CostSummary`: estimated total, target budget comparison or estimated-budget mode when unknown
- Exports via print dialog: PDF-style detailed list; printable checkbox-only list (no prices)
- Mock product links (`example-shop.com` search URLs)
- TypeScript strict mode; Tailwind CSS v4; App Router with `src/`

## In-Progress Features

- None actively in development
- Production `next build` / deployment not validated in this session

## UI / UX Decisions

- Two pages: onboarding on `/`, interactive checklist on `/checklist`
- Indigo/slate visual system; Geist font via `next/font`
- Budget block: bordered card with slider + “I don’t know” inline helper text
- Checklist rows: owned items at 50% opacity with strikethrough name
- Tier chips per row show tier label + dollar amount; active tier highlighted when no custom price
- Summary bar: green/red progress vs target when budget known; tier label from total when budget unknown
- Export opens new window → `window.print()` (user saves as PDF)
- No localStorage, database, or auth

## Data Model

**OnboardingAnswers**

- `school: string`
- `climate: Climate` — `hot` | `cold` | `four-season` | `variable`
- `budget: Budget` — `number` (100–2000) | `"unknown"`
- `dormType: DormType` — `traditional-double` | `traditional-single` | `suite` | `apartment` | `off-campus`
- `hobbies: Hobby[]`

**MockProduct** (catalog only)

- `id`, `name`, `category`, `basePrice`, `link`
- Optional: `climates[]`, `dormTypes[]`, `hobby`

**ChecklistItem** (generated)

- `id`, `name`, `category`, `prices: PriceTiers`, `defaultTier: PriceTier`, `link`

**PriceTiers**

- `bare`, `standard`, `comfortable`, `premium` (USD integers)

**ItemSelection** (client state on checklist)

- `tier: PriceTier`
- `customPrice: number | null`
- `owned: boolean`

**ChecklistCategory**

- `name`, `items: ChecklistItem[]`

## Business Logic Rules

**Budget slider**

- Range: 100–2000, step 50, default 800; display `$2000+` at max
- `clampBudget()` on slider and manual input commit (blur/Enter)

**Budget tier labels** (onboarding + summary)

| Min ($) | Label |
|--------|--------|
| 2000 | Premium |
| 1300 | Comfortable |
| 800 | Typical Freshman |
| 400 | Budget-Conscious |
| 0 | Essentials |

**Item price tiers** (`deriveTiers(basePrice)`)

- `bare` = round(base × 0.6)
- `standard` = base
- `comfortable` = round(base × 1.5)
- `premium` = round(base × 2.5)
- Rounded to nearest $5, minimum $5

**Default item tier** (`defaultTierForBudget`)

- `unknown` → `standard`
- ≥2000 → `premium`; ≥1300 → `comfortable`; ≥400 → `standard`; else → `bare`

**Recommendation filters** (`shouldRecommend`)

- Climate: if `climates` set, must include answer climate
- Dorm: if `dormTypes` set, must include answer dorm type
- Hobby: if `hobby` set, must be in answer hobbies
- Budget does not exclude products

**Effective line price** (`effectivePrice`)

- If `owned` → 0
- Else if `customPrice` set → `customPrice`
- Else → `item.prices[selection.tier]`

**Checklist total**

- Sum `effectivePrice` over visible items (not in `removed` set)
- Tier change clears `customPrice`
- Removed items hidden; “Restore N removed items” clears `removed`

**URL encoding** (`params.ts`)

- `budget` = number string or `unknown`
- `hobbies` = comma-separated list
- Invalid climate/dorm → `parseAnswers` returns `null` → empty-state on `/checklist`

## System Architecture

**Frontend**

- Next.js 15.5.x App Router, React 19, TypeScript 5
- Tailwind CSS v4 (`@import "tailwindcss"` in `globals.css`)
- Server: `app/page.tsx`, `app/checklist/page.tsx` (async `searchParams`)
- Client: form, slider, `ChecklistView`, item rows, exports

**Backend**

- None; no API routes, no database

**Key modules**

| Path | Role |
|------|------|
| `src/lib/types.ts` | Shared types |
| `src/lib/options.ts` | Dropdown/chip labels |
| `src/lib/budget.ts` | Slider bounds, tier math, `effectivePrice` |
| `src/lib/mockData.ts` | ~50 tagged products |
| `src/lib/recommendations.ts` | `generateChecklist()` |
| `src/lib/params.ts` | URL encode/decode |
| `src/components/OnboardingForm.tsx` | Survey + navigation |
| `src/components/BudgetSlider.tsx` | Budget UI |
| `src/components/ChecklistView.tsx` | Selection state owner |
| `src/components/ChecklistItemRow.tsx` | Row controls |
| `src/components/ExportButtons.tsx` | Print-based exports |

**Project root**

- `dorm-living-os/` under `C:\Users\dangi\OneDrive\Documents\` (OneDrive-synced)

## Known Issues / Risks

- **No persistence**: refresh or new tab loses checklist edits; URL only stores onboarding answers
- **Mock data only**: prices and links are fabricated; no real product API
- **Export depends on pop-ups**: blocked pop-ups break PDF/print export
- **OneDrive + encoding history**: files created via some tools saved as UTF-16; manual PowerShell UTF-8 conversion was required; re-verify if garbled builds return
- **Dev server stability**: `next dev` parent can exit while child holds port 3000 (hung server); fix: kill process on 3000, restart `npm run dev`
- **Node version**: tested on Node v22/v24; Next 15 officially targets 18/20/22 LTS; prefer Node 20 LTS for dev
- **npm `devdir` warning**: unknown env config in npm (non-blocking)
- **Legacy URLs broken**: old params (`temperate`, `medium`, `traditional`) invalid after climate/dorm/budget schema change
- **No automated tests**
- **Production build** not confirmed in latest session

## Next Steps

1. Run `npm run build` and fix any production-only issues
2. Add `STATE.md` to repo workflow (keep updated on major changes)
3. Consider moving project off OneDrive to `C:\dev\` to reduce sync/encoding issues
4. Optional: `localStorage` for checklist selections (tier, price, owned, removed)
5. Optional: real PDF library (e.g. `@react-pdf/renderer`) if print dialog UX is insufficient
6. Optional: unit tests for `deriveTiers`, `defaultTierForBudget`, `shouldRecommend`, `parseAnswers`
7. Optional: reintroduce budget-based item filtering if product scope requires it
8. Deploy (Vercel or static export if applicable) and smoke-test full onboarding → checklist → export flow

## Dev Commands

```bash
cd dorm-living-os
npm install
npm run dev    # http://localhost:3000
npm run build
npm run lint
```

**Stop dev server (Windows)**

```powershell
Get-NetTCPConnection -State Listen -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```
