create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  certificate_code text not null unique,
  display_name text not null,
  xp_total integer not null check (xp_total >= 0),
  completed_at timestamptz not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  email_sent_at timestamptz,
  email_status text not null default 'pending' check (email_status in ('pending','sending','sent','failed')),
  email_last_error text,
  constraint certificates_code_format check (certificate_code ~ '^VOLTZ-[0-9]{4}-[A-F0-9]{16}$')
);

alter table public.certificates enable row level security;
revoke all on table public.certificates from anon, authenticated;
grant select on table public.certificates to authenticated;

drop policy if exists "Users read own certificate" on public.certificates;
create policy "Users read own certificate"
on public.certificates for select
to authenticated
using (
  (select auth.uid()) = user_id
  or exists (
    select 1 from public.user_roles r
    where r.user_id = (select auth.uid()) and r.role = 'admin'
  )
);

create or replace function voltz_admin.sync_certificate_shadow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    delete from voltz_admin.certificates where id = old.id;
    return old;
  end if;
  insert into voltz_admin.certificates(id,user_id,certificate_code,issued_at)
  values(new.id,new.user_id,new.certificate_code,new.completed_at)
  on conflict(id) do update set
    user_id=excluded.user_id,
    certificate_code=excluded.certificate_code,
    issued_at=excluded.issued_at;
  return new;
end;
$$;

revoke all on function voltz_admin.sync_certificate_shadow() from public, anon, authenticated;

drop trigger if exists certificates_shadow_sync on public.certificates;
create trigger certificates_shadow_sync
after insert or update or delete on public.certificates
for each row execute function voltz_admin.sync_certificate_shadow();

create or replace function public.voltz_issue_certificate_server(p_user uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_completed text[];
  v_xp integer;
  v_count integer;
  v_name text;
  v_code text;
  v_row public.certificates%rowtype;
  v_created boolean := false;
  v_expected text[];
  v_attempt integer := 0;
begin
  if current_user not in ('service_role','postgres') then
    raise exception 'Server only';
  end if;
  if p_user is null then
    return jsonb_build_object('error','Utilizador inválido.');
  end if;

  select p.completed_lessons, p.xp
    into v_completed, v_xp
  from public.progress p
  where p.user_id = p_user;
  if not found then
    return jsonb_build_object('error','Progresso não encontrado.');
  end if;

  if not ('manual-iniciacao' = any(coalesce(v_completed,'{}'::text[]))) then
    return jsonb_build_object('error','O Manual de Iniciação ainda não está concluído.');
  end if;

  select array_agg('course-' || c || '-' || n order by c,n)
    into v_expected
  from unnest(array['aprendiz','ajudante','instalador','tecnico','especialista']) c
  cross join generate_series(1,10) n;

  select count(distinct x)
    into v_count
  from unnest(coalesce(v_completed,'{}'::text[])) x
  where x = any(v_expected);

  if v_count <> 50 then
    return jsonb_build_object('error','É necessário concluir os 50 níveis do percurso.','completed',v_count);
  end if;

  if v_xp is null or v_xp < 10000 or v_xp > 12500 or mod(v_xp,25) <> 0 then
    return jsonb_build_object('error','O XP final guardado não é consistente com 50 níveis concluídos.');
  end if;

  select coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'),''),nullif(trim(u.raw_user_meta_data->>'name'),''),nullif(split_part(coalesce(u.email,''),'@',1),''),'Aprendiz')
    into v_name
  from auth.users u
  where u.id = p_user;
  if v_name is null then
    return jsonb_build_object('error','Conta Voltz não encontrada.');
  end if;

  select * into v_row from public.certificates where user_id=p_user;
  if found then
    return jsonb_build_object('created',false,'certificate',jsonb_build_object(
      'id',v_row.id,'code',v_row.certificate_code,'displayName',v_row.display_name,'xpTotal',v_row.xp_total,
      'completedAt',v_row.completed_at,'createdAt',v_row.created_at,'revokedAt',v_row.revoked_at,
      'emailSentAt',v_row.email_sent_at,'emailStatus',v_row.email_status
    ));
  end if;

  loop
    v_attempt := v_attempt + 1;
    if v_attempt > 8 then raise exception 'Certificate code generation failed'; end if;
    v_code := 'VOLTZ-' || to_char(now(),'YYYY') || '-' || upper(encode(gen_random_bytes(8),'hex'));
    begin
      insert into public.certificates(user_id,certificate_code,display_name,xp_total,completed_at)
      values(p_user,v_code,left(v_name,160),v_xp,now())
      on conflict(user_id) do nothing
      returning * into v_row;
      if found then
        v_created := true;
        exit;
      end if;
      select * into v_row from public.certificates where user_id=p_user;
      if found then exit; end if;
    exception when unique_violation then
      null;
    end;
  end loop;

  return jsonb_build_object('created',v_created,'certificate',jsonb_build_object(
    'id',v_row.id,'code',v_row.certificate_code,'displayName',v_row.display_name,'xpTotal',v_row.xp_total,
    'completedAt',v_row.completed_at,'createdAt',v_row.created_at,'revokedAt',v_row.revoked_at,
    'emailSentAt',v_row.email_sent_at,'emailStatus',v_row.email_status
  ));
end;
$$;

revoke execute on function public.voltz_issue_certificate_server(uuid) from public, anon, authenticated;
grant execute on function public.voltz_issue_certificate_server(uuid) to service_role;

create or replace function public.voltz_admin_user_detail(p_user uuid, p_target uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare out_data jsonb;
begin
 if current_user not in ('service_role','postgres') then raise exception 'Server only'; end if;
 if not exists(select 1 from public.user_roles where user_id=p_user and role='admin') then return jsonb_build_object('error','Acesso reservado a administradores.'); end if;
 select jsonb_build_object(
  'id',u.id,
  'name',coalesce(u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name',split_part(u.email,'@',1),'Aprendiz'),
  'email',u.email,
  'role',coalesce(r.role,'user'),
  'createdAt',u.created_at,
  'lastActiveAt',a.last_active_at,
  'online',coalesce(a.last_seen_at>now()-interval '2 minutes',false),
  'xp',coalesce(p.xp,0),
  'completed',coalesce((select count(*) from unnest(coalesce(p.completed_lessons,'{}'::text[])) x where x like 'course-%'),0),
  'certificate',case when c.id is null then null else jsonb_build_object(
    'id',c.id,'code',c.certificate_code,'issuedAt',c.completed_at,'revokedAt',c.revoked_at,
    'status',case when c.revoked_at is null then 'valid' else 'revoked' end
  ) end
 ) into out_data
 from auth.users u
 left join public.user_roles r on r.user_id=u.id
 left join public.user_activity a on a.user_id=u.id
 left join public.progress p on p.user_id=u.id
 left join lateral(
   select id,certificate_code,completed_at,revoked_at
   from public.certificates where user_id=u.id limit 1
 ) c on true
 where u.id=p_target;
 return coalesce(out_data,jsonb_build_object('error','Utilizador não encontrado.'));
end;
$$;

revoke execute on function public.voltz_admin_user_detail(uuid,uuid) from public, anon, authenticated;
grant execute on function public.voltz_admin_user_detail(uuid,uuid) to service_role;
