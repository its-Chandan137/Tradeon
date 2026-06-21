-- Tradeon Supabase schema
-- Run this in the Supabase SQL editor before using the app.

create extension if not exists "uuid-ossp";

-- Public profiles are tied 1:1 to auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles
  for select
  using (id = auth.uid());

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (id = auth.uid());

-- Trading accounts.
create table if not exists public.accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_name text not null,
  starting_balance numeric(18, 2) not null default 0,
  current_balance numeric(18, 2) not null default 0,
  phase text not null check (phase in ('Phase 1', 'Phase 2', 'Funded')),
  profit_target numeric(18, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_accounts_user_id on public.accounts(user_id);
alter table public.accounts enable row level security;

create policy "Users can read their own accounts"
  on public.accounts
  for select
  using (user_id = auth.uid());

create policy "Users can insert their own accounts"
  on public.accounts
  for insert
  with check (user_id = auth.uid());

create policy "Users can update their own accounts"
  on public.accounts
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own accounts"
  on public.accounts
  for delete
  using (user_id = auth.uid());

-- Trades.
create table if not exists public.trades (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  trade_date date not null,
  instrument text not null,
  trade_type text not null check (trade_type in ('BUY', 'SELL')),
  entry_price numeric(18, 2) not null,
  exit_price numeric(18, 2) not null,
  lot_size numeric(18, 6) not null,
  stop_loss numeric(18, 2) not null,
  take_profit numeric(18, 2) not null,
  profit_loss numeric(18, 2) not null,
  screenshot_url text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_trades_user_id on public.trades(user_id);
create index if not exists idx_trades_account_id on public.trades(account_id);
create index if not exists idx_trades_user_trade_date on public.trades(user_id, trade_date desc, created_at desc);
alter table public.trades enable row level security;

create policy "Users can read their own trades"
  on public.trades
  for select
  using (user_id = auth.uid());

create policy "Users can insert their own trades"
  on public.trades
  for insert
  with check (user_id = auth.uid());

create policy "Users can update their own trades"
  on public.trades
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own trades"
  on public.trades
  for delete
  using (user_id = auth.uid());

-- Psychology journal entries.
create table if not exists public.psychology_journal (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  journal_date date not null,
  confidence_level integer not null check (confidence_level between 1 and 10),
  emotion_before text not null,
  emotion_after text not null,
  followed_setup boolean not null default false,
  mistake_made text,
  lesson_learned text,
  created_at timestamptz not null default now()
);

create index if not exists idx_psychology_journal_user_id on public.psychology_journal(user_id);
create index if not exists idx_psychology_journal_user_date on public.psychology_journal(user_id, journal_date desc, created_at desc);
alter table public.psychology_journal enable row level security;

create policy "Users can read their own psychology entries"
  on public.psychology_journal
  for select
  using (user_id = auth.uid());

create policy "Users can insert their own psychology entries"
  on public.psychology_journal
  for insert
  with check (user_id = auth.uid());

create policy "Users can update their own psychology entries"
  on public.psychology_journal
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own psychology entries"
  on public.psychology_journal
  for delete
  using (user_id = auth.uid());

-- Create/update profile on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update
  set email = excluded.email,
      display_name = excluded.display_name;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Optional helper function to get the current authenticated user's id safely.
create or replace function public.get_current_user_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select auth.uid();
$$;

-- Storage bucket for trade screenshots.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'trade-screenshots',
  'trade-screenshots',
  false,
  5 * 1024 * 1024,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can upload their own trade screenshots"
  on storage.objects
  for insert
  with check (
    bucket_id = 'trade-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read their own trade screenshots"
  on storage.objects
  for select
  using (
    bucket_id = 'trade-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own trade screenshots"
  on storage.objects
  for delete
  using (
    bucket_id = 'trade-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
