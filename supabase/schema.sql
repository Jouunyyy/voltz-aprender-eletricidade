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
