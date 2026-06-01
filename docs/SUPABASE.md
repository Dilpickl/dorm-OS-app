# Supabase setup

The app uses Supabase for:

1. **Product catalog** (`products` table)
2. **Checklist progress** (`checklist_saves` table, synced via `/api/checklist`)

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. **New project** → pick a name and database password (save the password).
3. Wait until the project is ready.

## 2. Run the database schema

1. In the dashboard: **SQL Editor** → **New query**.
2. Copy the full contents of [`supabase/schema.sql`](../supabase/schema.sql).
3. Click **Run**. You should see success (tables `products` and `checklist_saves`).

## 3. Copy API keys

**Project Settings** → **API**:

| Variable | Where to copy |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (keep secret) |

## 4. Configure the app

In the project folder:

```powershell
copy .env.example .env.local
```

Edit `.env.local` and paste your three Supabase values.

## 5. Seed products

```powershell
npm run db:seed
```

You should see: `Upserting 57 products... Done.`

Verify in Supabase: **Table Editor** → `products` → rows appear.

## 6. Run the app

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), complete onboarding, open the checklist.

You should see:

- **Catalog: Supabase**
- **Saved to Supabase** (after you change an item; wait ~0.5s for auto-save)

Refresh the page — your tier/owned/removed choices should return.

## 7. Deploy (Vercel)

Add the same three env vars in Vercel → Project → Settings → Environment Variables.

Run `npm run db:seed` once locally (or from CI) against production Supabase — seed is idempotent (`upsert`).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Catalog shows **built-in mock** | Check `.env.local` has URL + `SUPABASE_SERVICE_ROLE_KEY`; restart `npm run dev` |
| Empty products error | Run `npm run db:seed` |
| **Saved locally** instead of Supabase | `NEXT_PUBLIC_SUPABASE_URL` missing in `.env.local` |
| Checklist save 503 | `SUPABASE_SERVICE_ROLE_KEY` missing or wrong |
| RLS errors | Re-run `supabase/schema.sql` |

## Security note (learning project)

`checklist_saves` allows broad read/write via RLS for demo purposes. Before production, add user auth (Supabase Auth) and restrict rows to `auth.uid()`.
