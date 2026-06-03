-- Dorm Living OS — Supabase schema
-- Run in Supabase Dashboard → SQL Editor → New query → Run

-- Product catalog (replaces mock JSON / external API when Supabase is configured)
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  base_price integer not null check (base_price >= 0),
  link text,
  climates text[] default null,
  dorm_types text[] default null,
  hobby text default null,
  essential boolean not null default false,
  priority integer not null default 50,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can read products"
  on public.products for select
  to anon, authenticated
  using (true);

-- Checklist progress (keyed by onboarding fingerprint + opaque save_token)
create table if not exists public.checklist_saves (
  fingerprint text primary key,
  answers jsonb not null,
  selections jsonb not null,
  removed jsonb not null default '[]'::jsonb,
  save_token text,
  updated_at timestamptz not null default now()
);

alter table public.checklist_saves enable row level security;

-- No anon/authenticated policies: only the service role (API routes) may access.
-- Run supabase/migrations/20260603_checklist_security.sql on existing projects.

create index if not exists checklist_saves_updated_at_idx
  on public.checklist_saves (updated_at desc);
