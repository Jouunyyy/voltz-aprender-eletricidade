create table if not exists public.video_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id text not null check (char_length(video_id) between 1 and 100),
  watched_seconds double precision not null default 0 check (watched_seconds >= 0),
  duration_seconds double precision not null default 0 check (duration_seconds >= 0),
  progress_percent numeric(5,2) not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  completed boolean not null default false,
  last_watched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

alter table public.video_progress enable row level security;

revoke all on table public.video_progress from anon;
revoke all on table public.video_progress from authenticated;
grant select, insert, update on table public.video_progress to authenticated;

create policy "video_progress_select_own"
on public.video_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "video_progress_insert_own"
on public.video_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "video_progress_update_own"
on public.video_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
