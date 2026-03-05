-- Subscriptions table
-- Run this in Supabase SQL Editor to add subscription tracking

create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  tier text not null default 'free' check (tier in ('free', 'trial', 'premium')),
  trial_ends_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  apple_original_transaction_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table subscriptions enable row level security;

-- Users can read their own subscription
create policy "Users can view own subscription"
  on subscriptions for select using (auth.uid() = user_id);

-- Users can insert their own subscription (for free trial)
create policy "Users can insert own subscription"
  on subscriptions for insert with check (auth.uid() = user_id);

-- Users can update their own subscription
create policy "Users can update own subscription"
  on subscriptions for update using (auth.uid() = user_id);

-- Index for fast lookups
create index if not exists idx_subscriptions_user
  on subscriptions(user_id);

create index if not exists idx_subscriptions_stripe
  on subscriptions(stripe_customer_id);
