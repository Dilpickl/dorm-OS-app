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

-- Checklist progress (keyed by onboarding fingerprint; no auth in v1)
create table if not exists public.checklist_saves (
  fingerprint text primary key,
  answers jsonb not null,
  selections jsonb not null,
  removed jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.checklist_saves enable row level security;

-- Server uses service_role key and bypasses RLS.
-- These policies allow future client-side access with anon key if needed.
create policy "Anyone can read checklist saves"
  on public.checklist_saves for select
  to anon, authenticated
  using (true);

create policy "Anyone can insert checklist saves"
  on public.checklist_saves for insert
  to anon, authenticated
  with check (true);

create policy "Anyone can update checklist saves"
  on public.checklist_saves for update
  to anon, authenticated
  using (true);

create index if not exists checklist_saves_updated_at_idx
  on public.checklist_saves (updated_at desc);
