뿯붿# Dorm Living OS

A modern Next.js learning project that helps college students plan what to buy
for their dorm. Answer a few onboarding questions and get a personalized,
checkable, exportable shopping checklist.

This project is built to be **beginner-readable** - every file is small,
focused, and commented to explain *why* the code does what it does.

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)

## Getting started

From inside this folder:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## How it works

1. **Home page (`/`)** - a hero section plus an onboarding form asking for the
   student's school, climate, budget, dorm type, and hobbies.
2. On submit, the answers are encoded into the URL and the app navigates to
   **`/checklist`**.
3. The checklist page reads those answers, runs them through the recommendation
   engine, and renders categories of recommended items with estimated costs and
   links.
4. Students can **check items off** and **export** the whole list as a Markdown
   file.

```text
Home (Hero + OnboardingForm)
        |
        |  answers in URL query string
        v
/checklist  ->  generateChecklist(answers)  ->  ChecklistView (check off + export)
```

> All product data, prices, and links are **mock data** for now.

## Project structure

```text
src/
  app/
    layout.tsx            Root layout + page metadata
    globals.css           Tailwind import + base styles
    page.tsx              Home page (hero + how-it-works + form)
    checklist/
      page.tsx            Results page (reads URL, generates list)
  components/
    Hero.tsx              Hero section
    OnboardingForm.tsx    The onboarding questions (client component)
    ChecklistView.tsx     Owns checked state; ties the results page together
    ChecklistCategorySection.tsx   One category card
    ChecklistItemRow.tsx           One item row (checkbox, cost, link)
    CostSummary.tsx       Packed-count + cost progress bar
    ExportButton.tsx      Downloads the list as a .md file
  lib/
    types.ts              Shared TypeScript types
    mockData.ts           The mock product catalog (with filtering tags)
    recommendations.ts    Turns answers into checklist categories
    params.ts             Encode/decode answers <-> URL query string
```

## Where to go next

- Swap the mock catalog in `src/lib/mockData.ts` for a real API.
- Expand the rules in `src/lib/recommendations.ts`.
- Add persistence (e.g. save lists to `localStorage` or a database).
