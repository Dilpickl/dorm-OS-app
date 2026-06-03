-- Security hardening for checklist_saves (run in Supabase SQL Editor)

alter table public.checklist_saves
  add column if not exists save_token text;

drop policy if exists "Anyone can read checklist saves" on public.checklist_saves;
drop policy if exists "Anyone can insert checklist saves" on public.checklist_saves;
drop policy if exists "Anyone can update checklist saves" on public.checklist_saves;
