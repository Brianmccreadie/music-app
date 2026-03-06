-- Routines table
-- Run this in Supabase SQL Editor to enable routine syncing across devices

create table if not exists routines (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  exercises jsonb not null default '[]'::jsonb,
  range_low text not null default 'C3',
  range_high text not null default 'A4',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table routines enable row level security;

create policy "Users can view own routines"
  on routines for select using (auth.uid() = user_id);
create policy "Users can insert own routines"
  on routines for insert with check (auth.uid() = user_id);
create policy "Users can update own routines"
  on routines for update using (auth.uid() = user_id);
create policy "Users can delete own routines"
  on routines for delete using (auth.uid() = user_id);

-- Index for fast queries by user
create index if not exists idx_routines_user
  on routines(user_id, updated_at desc);
