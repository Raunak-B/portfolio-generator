-- =============================================================================
-- Phase 1: Dynamic Portfolio Generator — Database Schema & RLS
-- Run this in the Supabase SQL Editor (or via supabase db push).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- users — profile row keyed to auth.users (one row per authenticated user)
-- -----------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  github_username text not null,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_github_username_key unique (github_username)
);

create index users_github_username_idx on public.users (github_username);

-- -----------------------------------------------------------------------------
-- portfolios — published portfolio content (URL slug = username)
-- -----------------------------------------------------------------------------
create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  username text not null,
  custom_bio text,
  theme text not null default 'slate',
  github_bio text,
  top_repositories jsonb not null default '[]'::jsonb,
  languages jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portfolios_user_id_key unique (user_id),
  constraint portfolios_username_key unique (username),
  constraint portfolios_theme_check check (
    theme in ('slate', 'ocean', 'violet', 'emerald', 'rose', 'amber')
  )
);

create index portfolios_username_idx on public.portfolios (username);
create index portfolios_is_published_idx on public.portfolios (is_published)
  where is_published = true;

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger portfolios_set_updated_at
  before update on public.portfolios
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Auto-create public.users row when a GitHub user signs up
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  gh_username text;
  gh_name text;
  gh_avatar text;
begin
  gh_username := coalesce(
    new.raw_user_meta_data ->> 'user_name',
    new.raw_user_meta_data ->> 'preferred_username',
    split_part(new.email, '@', 1)
  );
  gh_name := coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name');
  gh_avatar := new.raw_user_meta_data ->> 'avatar_url';

  insert into public.users (id, github_username, display_name, avatar_url)
  values (new.id, gh_username, gh_name, gh_avatar)
  on conflict (id) do update set
    github_username = excluded.github_username,
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  insert into public.portfolios (user_id, username)
  values (new.id, lower(gh_username))
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.portfolios enable row level security;

-- users: owners manage their row; anyone can read users with a published portfolio
create policy "Users can view own profile"
  on public.users for select
  to authenticated
  using (auth.uid() = id);

create policy "Public can view users with published portfolios"
  on public.users for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.portfolios p
      where p.user_id = users.id
        and p.is_published = true
    )
  );

create policy "Users can update own profile"
  on public.users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- portfolios: public read for published; owners full CRUD on their row
create policy "Anyone can view published portfolios"
  on public.portfolios for select
  to anon, authenticated
  using (is_published = true);

create policy "Owners can view own portfolio drafts"
  on public.portfolios for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Owners can insert own portfolio"
  on public.portfolios for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Owners can update own portfolio"
  on public.portfolios for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owners can delete own portfolio"
  on public.portfolios for delete
  to authenticated
  using (auth.uid() = user_id);
