create table if not exists public.app_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  is_test boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists app_ratings_one_real_per_user
  on public.app_ratings(user_id)
  where is_test = false;
create index if not exists app_ratings_created_at_idx on public.app_ratings(created_at desc);
create index if not exists app_ratings_test_created_at_idx on public.app_ratings(is_test, created_at desc);

alter table public.app_ratings enable row level security;
revoke all on table public.app_ratings from anon;
revoke all on table public.app_ratings from authenticated;
grant select, insert on table public.app_ratings to authenticated;

create policy app_ratings_select_own on public.app_ratings for select to authenticated
using ((select auth.uid()) = user_id);
create policy app_ratings_insert_own on public.app_ratings for insert to authenticated
with check ((select auth.uid()) = user_id);

create table if not exists public.rating_prompt_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  answered boolean not null default false,
  defer_count integer not null default 0 check (defer_count between 0 and 3),
  last_deferred_completed_count integer not null default 0 check (last_deferred_completed_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.rating_prompt_state enable row level security;
revoke all on table public.rating_prompt_state from anon;
revoke all on table public.rating_prompt_state from authenticated;
grant select, insert, update on table public.rating_prompt_state to authenticated;

create policy rating_prompt_state_select_own on public.rating_prompt_state for select to authenticated
using ((select auth.uid()) = user_id);
create policy rating_prompt_state_insert_own on public.rating_prompt_state for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy rating_prompt_state_update_own on public.rating_prompt_state for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.voltz_admin_rating_summary(p_user uuid, p_mode text default 'real', p_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed boolean;
  safe_mode text := case when p_mode in ('real','test','all') then p_mode else 'real' end;
  safe_days integer := greatest(1, least(coalesce(p_days,30), 365));
  result jsonb;
begin
  select exists(select 1 from public.user_roles where user_id = p_user and role = 'admin') into allowed;
  if not allowed then return jsonb_build_object('error','forbidden'); end if;

  with filtered as (
    select rating, created_at::date as day
    from public.app_ratings
    where created_at >= now() - make_interval(days => safe_days)
      and (safe_mode = 'all' or (safe_mode = 'test' and is_test) or (safe_mode = 'real' and not is_test))
  ), summary as (
    select coalesce(round(avg(rating)::numeric,2),0) average_rating,
      count(*)::int total,
      count(*) filter (where rating=1)::int count_1,
      count(*) filter (where rating=2)::int count_2,
      count(*) filter (where rating=3)::int count_3,
      count(*) filter (where rating=4)::int count_4,
      count(*) filter (where rating=5)::int count_5
    from filtered
  ), daily as (
    select day, round(avg(rating)::numeric,2) average_rating, count(*)::int total
    from filtered group by day order by day
  )
  select jsonb_build_object(
    'mode',safe_mode,'days',safe_days,'averageRating',s.average_rating,'total',s.total,
    'count1',s.count_1,'count2',s.count_2,'count3',s.count_3,'count4',s.count_4,'count5',s.count_5,
    'daily',coalesce((select jsonb_agg(jsonb_build_object('date',day,'value',average_rating,'total',total) order by day) from daily),'[]'::jsonb)
  ) into result from summary s;
  return result;
end;
$$;

revoke execute on function public.voltz_admin_rating_summary(uuid,text,integer) from public;
revoke execute on function public.voltz_admin_rating_summary(uuid,text,integer) from anon;
revoke execute on function public.voltz_admin_rating_summary(uuid,text,integer) from authenticated;
grant execute on function public.voltz_admin_rating_summary(uuid,text,integer) to service_role;
