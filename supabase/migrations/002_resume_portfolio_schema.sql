-- =============================================================================
-- Resume Portfolio SaaS — Schema, Storage, RLS
-- Run after 001_initial_schema.sql (or on a fresh project).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- users — extend for email-based auth (keeps compatibility with 001)
-- -----------------------------------------------------------------------------
alter table public.users
  add column if not exists email text,
  add column if not exists full_name text;

alter table public.users
  alter column github_username drop not null;

-- -----------------------------------------------------------------------------
-- portfolios — resume-driven permanent URLs at /p/[username]
-- -----------------------------------------------------------------------------
drop table if exists public.portfolios cascade;

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  username text not null,
  hero_title text,
  bio text,
  skills text[] not null default '{}',
  experience jsonb not null default '[]'::jsonb,
  projects jsonb not null default '[]'::jsonb,
  contact_email text,
  processing_status text not null default 'idle',
  processing_error text,
  resume_storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portfolios_user_id_key unique (user_id),
  constraint portfolios_username_key unique (username),
  constraint portfolios_username_format check (username ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint portfolios_processing_status_check check (
    processing_status in ('idle', 'processing', 'completed', 'failed')
  )
);

create index portfolios_username_idx on public.portfolios (username);
create index portfolios_processing_status_idx on public.portfolios (processing_status);

create trigger portfolios_set_updated_at
  before update on public.portfolios
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Storage bucket: resumes (private PDF / text uploads)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  10485760,
  array['application/pdf', 'text/plain']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- -----------------------------------------------------------------------------
-- Row Level Security — portfolios
-- -----------------------------------------------------------------------------
alter table public.portfolios enable row level security;

create policy "Anyone can read portfolios for public pages"
  on public.portfolios for select
  to anon, authenticated
  using (processing_status = 'completed');

create policy "Owners can read own portfolio drafts"
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

-- -----------------------------------------------------------------------------
-- Row Level Security — storage.objects (resumes bucket)
-- -----------------------------------------------------------------------------
create policy "Authenticated users can upload resumes to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resumes'
    and (storage.foldername (name))[1] = auth.uid()::text
  );

create policy "Authenticated users can read own resumes"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername (name))[1] = auth.uid()::text
  );

create policy "Authenticated users can update own resumes"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername (name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'resumes'
    and (storage.foldername (name))[1] = auth.uid()::text
  );

create policy "Authenticated users can delete own resumes"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername (name))[1] = auth.uid()::text
  );

-- -----------------------------------------------------------------------------
-- Auto-create portfolio row for new users
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display text;
  base_username text;
  unique_username text;
begin
  display := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1)
  );

  base_username := lower(regexp_replace(
    coalesce(split_part(new.email, '@', 1), 'user'),
  '[^a-z0-9]+', '-', 'g'));

  base_username := trim(both '-' from base_username);
  if base_username = '' then
    base_username := 'user';
  end if;

  unique_username := base_username;

  insert into public.users (id, email, full_name, github_username, display_name)
  values (
    new.id,
    new.email,
    display,
    base_username,
    display
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    updated_at = now();

  while exists (select 1 from public.portfolios where username = unique_username) loop
    unique_username := base_username || '-' || substr(md5(random()::text), 1, 4);
  end loop;

  insert into public.portfolios (user_id, username, processing_status)
  values (new.id, unique_username, 'idle')
  on conflict (user_id) do nothing;

  return new;
end;
$$;
