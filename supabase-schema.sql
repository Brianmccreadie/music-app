-- Practice Sessions table
-- Run this in Supabase SQL Editor to add practice session tracking

create table if not exists practice_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  exercise_id text not null,
  duration_seconds integer not null default 0,
  bpm integer,
  range_low text,
  range_high text,
  completed_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

alter table practice_sessions enable row level security;

create policy "Users can view own sessions"
  on practice_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions"
  on practice_sessions for insert with check (auth.uid() = user_id);

-- Index for fast queries by user
create index if not exists idx_practice_sessions_user
  on practice_sessions(user_id, completed_at desc);

-- Also add display_name to profiles if not already done:
-- alter table profiles add column if not exists display_name text;
