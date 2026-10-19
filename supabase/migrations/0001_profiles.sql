-- Orovelia: candidate profiles for Supabase Auth users.
-- Run once in the Supabase dashboard → SQL Editor (or `supabase db push`).
-- Safe to re-run.

-- ---------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  full_name     text not null default '',
  phone         text not null default '',
  city          text not null default '',
  state         text not null default '',
  headline      text not null default '',
  industries    text[] not null default '{}',
  experience    jsonb not null default '[]'::jsonb,   -- [{ title, company, years }]
  skills        text[] not null default '{}',
  certificates  text[] not null default '{}',
  availability  jsonb not null default '{"days": [], "shifts": []}'::jsonb,
  resume_name   text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is 'One row per job seeker; created automatically when a user signs up.';

-- ---------------------------------------------------------------
-- Row level security: a user can only see and change their own row
-- ---------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by their owner" on public.profiles;
create policy "Profiles are viewable by their owner"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Profiles are updatable by their owner" on public.profiles;
create policy "Profiles are updatable by their owner"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Rows are normally created by the trigger below; this lets the app repair a missing row for the signed-in user.
drop policy if exists "Profiles are insertable by their owner" on public.profiles;
create policy "Profiles are insertable by their owner"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- ---------------------------------------------------------------
-- Keep updated_at current
-- ---------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- Create the profile from sign-up metadata.
-- The app passes the whole sign-up form as `options.data`, so the profile
-- exists even while the user still has to confirm their email.
-- ---------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (
    id, email, full_name, phone, city, state, headline,
    industries, experience, skills, certificates, availability, resume_name
  )
  values (
    new.id,
    new.email,
    coalesce(meta ->> 'full_name', ''),
    coalesce(meta ->> 'phone', ''),
    coalesce(meta ->> 'city', ''),
    upper(coalesce(meta ->> 'state', '')),
    coalesce(meta ->> 'headline', ''),
    coalesce(array(select jsonb_array_elements_text(meta -> 'industries')), '{}'),
    coalesce(meta -> 'experience', '[]'::jsonb),
    coalesce(array(select jsonb_array_elements_text(meta -> 'skills')), '{}'),
    coalesce(array(select jsonb_array_elements_text(meta -> 'certificates')), '{}'),
    coalesce(meta -> 'availability', '{"days": [], "shifts": []}'::jsonb),
    coalesce(meta ->> 'resume_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep the profile email in sync if the user changes it.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- ---------------------------------------------------------------
-- Let a signed-in user delete their own account (Dashboard → Settings).
-- Deleting from auth.users cascades to public.profiles.
-- ---------------------------------------------------------------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
