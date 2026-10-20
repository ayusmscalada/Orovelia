-- Orovelia: admin role, jobs, applications, saved jobs and candidate ↔ team messages.
-- Run after 0001_profiles.sql in the Supabase dashboard → SQL Editor. Safe to re-run.

-- ---------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------
alter table public.profiles add column if not exists role text not null default 'candidate';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('candidate', 'admin'));

-- Emails that become admins when their account is created. Not readable through the API
-- (RLS on, no policies) — only the security-definer functions below look at it.
create table if not exists public.admin_allowlist (
  email     text primary key check (email = lower(email)),
  full_name text not null default '',
  phone     text not null default ''
);
alter table public.admin_allowlist enable row level security;

insert into public.admin_allowlist (email, full_name, phone)
values ('support@orovelia.com', 'Austin Parker', '+1 (224) 389-2479')
on conflict (email) do update set full_name = excluded.full_name, phone = excluded.phone;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- Decides the role on insert (allowlist → admin, everyone else → candidate, whatever the client sent)
-- and stops non-admins from changing roles. Server-side contexts (SQL editor, no auth.uid()) may.
create or replace function public.profiles_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  allow public.admin_allowlist%rowtype;
begin
  if tg_op = 'INSERT' then
    select * into allow from public.admin_allowlist where email = lower(new.email);
    if found then
      new.role := 'admin';
      if coalesce(new.full_name, '') = '' then new.full_name := allow.full_name; end if;
      if coalesce(new.phone, '') = '' then new.phone := allow.phone; end if;
    else
      new.role := 'candidate';
    end if;
  elsif new.role is distinct from old.role
        and (select auth.uid()) is not null
        and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard
  before insert or update on public.profiles
  for each row execute function public.profiles_guard();

-- Promote allowlisted accounts that already exist.
update public.profiles p
set role = 'admin',
    full_name = case when p.full_name = '' then a.full_name else p.full_name end,
    phone = case when p.phone = '' then a.phone else p.phone end
from public.admin_allowlist a
where lower(p.email) = a.email;

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------
-- Jobs
-- ---------------------------------------------------------------
create table if not exists public.jobs (
  id               text primary key default substr(md5(random()::text || clock_timestamp()::text), 1, 12),
  title            text not null check (char_length(title) between 2 and 120),
  industry         text not null,
  employer         text not null check (char_length(employer) between 1 and 120),
  city             text not null default '',
  state            text not null default '',
  remote           boolean not null default false,
  type             text not null default 'Full-time' check (type in ('Full-time', 'Part-time', 'Shift work', 'Contract')),
  schedule         text not null default '',
  pay_min          numeric(10, 2) not null check (pay_min >= 0),
  pay_max          numeric(10, 2) not null,
  pay_unit         text not null default 'hour' check (pay_unit in ('hour', 'year')),
  summary          text not null default '',
  responsibilities text[] not null default '{}',
  requirements     text[] not null default '{}',
  benefits         text[] not null default '{}',
  urgent           boolean not null default false,
  recruiter_id     text not null default 'lucia-romero',   -- team member shown on the listing (src/data/team.js)
  status           text not null default 'open' check (status in ('open', 'closed')),
  created_by       uuid default auth.uid() references auth.users (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint jobs_pay_range check (pay_max >= pay_min)
);

create index if not exists jobs_status_created_idx on public.jobs (status, created_at desc);

alter table public.jobs enable row level security;

drop policy if exists "Open jobs are public" on public.jobs;
create policy "Open jobs are public"
  on public.jobs for select
  to anon, authenticated
  using (status = 'open' or (select public.is_admin()));

drop policy if exists "Admins manage jobs" on public.jobs;
create policy "Admins manage jobs"
  on public.jobs for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- Applications ("I'm interested")
-- ---------------------------------------------------------------
create table if not exists public.applications (
  id           uuid primary key default gen_random_uuid(),
  job_id       text not null references public.jobs (id) on delete cascade,
  candidate_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  stage        text not null default 'interested'
                 check (stage in ('interested', 'shortlisted', 'interview', 'offer', 'hired', 'rejected')),
  history      jsonb not null default '[]'::jsonb,   -- [{ stage, at }]
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (job_id, candidate_id)
);

create index if not exists applications_candidate_idx on public.applications (candidate_id);
create index if not exists applications_job_idx on public.applications (job_id);

alter table public.applications enable row level security;

drop policy if exists "Candidates see their applications; admins see all" on public.applications;
create policy "Candidates see their applications; admins see all"
  on public.applications for select
  to authenticated
  using (candidate_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "Candidates apply to open jobs" on public.applications;
create policy "Candidates apply to open jobs"
  on public.applications for insert
  to authenticated
  with check (
    candidate_id = (select auth.uid())
    and exists (select 1 from public.jobs j where j.id = job_id and j.status = 'open')
  );

drop policy if exists "Candidates withdraw; admins remove" on public.applications;
create policy "Candidates withdraw; admins remove"
  on public.applications for delete
  to authenticated
  using (candidate_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "Admins move applications between stages" on public.applications;
create policy "Admins move applications between stages"
  on public.applications for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- New applications always start at "interested"; every stage change is recorded in history.
create or replace function public.applications_track_stage()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.stage := 'interested';
    new.history := jsonb_build_array(jsonb_build_object('stage', new.stage, 'at', now()));
  elsif new.stage is distinct from old.stage then
    new.history := old.history || jsonb_build_array(jsonb_build_object('stage', new.stage, 'at', now()));
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists applications_track_stage on public.applications;
create trigger applications_track_stage
  before insert or update on public.applications
  for each row execute function public.applications_track_stage();

-- ---------------------------------------------------------------
-- Saved jobs
-- ---------------------------------------------------------------
create table if not exists public.saved_jobs (
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  job_id     text not null references public.jobs (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

alter table public.saved_jobs enable row level security;

drop policy if exists "Users manage their saved jobs" on public.saved_jobs;
create policy "Users manage their saved jobs"
  on public.saved_jobs for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------
-- Messages: one conversation per candidate with the Orovelia team
-- ---------------------------------------------------------------
create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  sender_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  job_id       text references public.jobs (id) on delete set null,
  body         text not null check (char_length(btrim(body)) between 1 and 4000),
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists messages_thread_idx on public.messages (candidate_id, created_at);

alter table public.messages enable row level security;

drop policy if exists "Thread members read messages" on public.messages;
create policy "Thread members read messages"
  on public.messages for select
  to authenticated
  using (candidate_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "Thread members send messages" on public.messages;
create policy "Thread members send messages"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and (candidate_id = (select auth.uid()) or (select public.is_admin()))
  );

-- Mark the other side's messages in a thread as read (no general UPDATE access to messages).
create or replace function public.mark_thread_read(p_candidate uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null
     or ((select auth.uid()) <> p_candidate and not public.is_admin()) then
    raise exception 'Not allowed';
  end if;
  update public.messages
  set read_at = now()
  where candidate_id = p_candidate
    and sender_id <> (select auth.uid())
    and read_at is null;
end;
$$;

revoke all on function public.mark_thread_read(uuid) from public, anon;
grant execute on function public.mark_thread_read(uuid) to authenticated;

-- ---------------------------------------------------------------
-- Live updates (Supabase Realtime respects the RLS policies above)
-- ---------------------------------------------------------------
do $$
declare
  t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['messages', 'applications', 'jobs'] loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
      ) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end;
$$;
