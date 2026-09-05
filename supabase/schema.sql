create table if not exists public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level between 1 and 100),
  streak integer not null default 0 check (streak >= 0),
  completed_lessons text[] not null default '{}',
  reminder_consent boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

drop policy if exists "Users read own progress" on public.progress;
create policy "Users read own progress" on public.progress
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users insert own progress" on public.progress;
create policy "Users insert own progress" on public.progress
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users update own progress" on public.progress;
create policy "Users update own progress" on public.progress
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on table public.progress from anon;
grant select, insert, update on table public.progress to authenticated;

create table if not exists public.email_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null check (char_length(email) between 3 and 320),
  display_name text not null default 'Aprendiz' check (char_length(display_name) between 1 and 100),
  consent boolean not null default false,
  last_active_at timestamptz not null default now(),
  feedback_sent_at timestamptz,
  reminder_1_sent_at timestamptz,
  reminder_2_sent_at timestamptz,
  unsubscribe_token uuid not null default gen_random_uuid() unique,
  test_sent_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.email_preferences enable row level security;

drop policy if exists "Users read own email preferences" on public.email_preferences;
create policy "Users read own email preferences" on public.email_preferences
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users insert own email preferences" on public.email_preferences;
create policy "Users insert own email preferences" on public.email_preferences
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users update own email preferences" on public.email_preferences;
create policy "Users update own email preferences" on public.email_preferences
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on table public.email_preferences from anon, authenticated;
grant select on table public.email_preferences to authenticated;
grant insert (user_id, email, display_name, consent, last_active_at, updated_at) on table public.email_preferences to authenticated;
grant update (user_id, email, display_name, consent, last_active_at, updated_at) on table public.email_preferences to authenticated;

create index if not exists email_preferences_eligible_idx
on public.email_preferences (last_active_at)
where consent = true and reminder_2_sent_at is null;
