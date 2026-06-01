# Setup checklist (things you do outside the repo)

## 1. Run the app locally

```powershell
cd dorm-living-os
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 2. Connect a real catalog API (optional)

There is no public “dorm products” API. You choose one:

| Option | Effort | Good for |
|--------|--------|----------|
| **A. Built-in mock** | None | Learning / demo (default) |
| **B. Self-hosted JSON** | Low | Full control, no backend code |
| **C. Supabase / Firebase** | Medium | Real DB, editable products |
| **D. Custom REST API** | High | Production + partners |

### Option B — hosted JSON (recommended next step)

1. Create `catalog.json` with shape in [CATALOG_API.md](./CATALOG_API.md).
2. Upload to GitHub (repo file → Raw URL) or Supabase Storage.
3. In `.env.local`:

```env
CATALOG_API_URL=https://raw.githubusercontent.com/YOU/REPO/main/catalog.json
```

4. Restart `npm run dev`. Checklist header should show **Catalog: live API**.

### Option C — Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Table `products` with columns matching catalog fields (or one `jsonb` column).
3. Enable Row Level Security + public read (or use service role server-side only).
4. Use the REST URL as `CATALOG_API_URL` with `CATALOG_API_KEY` if required.

## 3. Persistence (already implemented)

Checklist progress (tiers, custom prices, owned, removed) auto-saves to **localStorage** in this browser.

- Same onboarding answers → progress restores on reload.
- Different answers → fresh checklist.
- **Reset saved progress** on the checklist page clears storage.

### Database persistence (future — your work)

To sync across devices you would add:

- Auth (Clerk, Supabase Auth, etc.)
- API routes `POST/GET /api/checklists`
- Replace `localStorage` calls in `src/lib/storage/checklistPersistence.ts`

## 4. GitHub / deploy

```powershell
git push origin main
```

Deploy on [Vercel](https://vercel.com): import repo, set env vars (`CATALOG_API_URL`, `CATALOG_API_KEY`), deploy.

## 5. Node version

Use **Node 20 LTS** for dev (`node -v` should show v20.x). Node 24 may work but is less tested with Next 15.
