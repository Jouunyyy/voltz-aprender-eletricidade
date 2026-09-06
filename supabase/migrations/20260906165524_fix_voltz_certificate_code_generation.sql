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
  if current_user not in ('service_role','postgres') then raise exception 'Server only'; end if;
  if p_user is null then return jsonb_build_object('error','Utilizador inválido.'); end if;
  select p.completed_lessons,p.xp into v_completed,v_xp from public.progress p where p.user_id=p_user;
  if not found then return jsonb_build_object('error','Progresso não encontrado.'); end if;
  if not ('manual-iniciacao'=any(coalesce(v_completed,'{}'::text[]))) then return jsonb_build_object('error','O Manual de Iniciação ainda não está concluído.'); end if;
  select array_agg('course-'||c||'-'||n order by c,n) into v_expected from unnest(array['aprendiz','ajudante','instalador','tecnico','especialista']) c cross join generate_series(1,10)n;
  select count(distinct x) into v_count from unnest(coalesce(v_completed,'{}'::text[])) x where x=any(v_expected);
  if v_count<>50 then return jsonb_build_object('error','É necessário concluir os 50 níveis do percurso.','completed',v_count); end if;
  if v_xp is null or v_xp<10000 or v_xp>12500 or mod(v_xp,25)<>0 then return jsonb_build_object('error','O XP final guardado não é consistente com 50 níveis concluídos.'); end if;
  select coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'),''),nullif(trim(u.raw_user_meta_data->>'name'),''),nullif(split_part(coalesce(u.email,''),'@',1),''),'Aprendiz') into v_name from auth.users u where u.id=p_user;
  if v_name is null then return jsonb_build_object('error','Conta Voltz não encontrada.'); end if;
  select * into v_row from public.certificates where user_id=p_user;
  if found then return jsonb_build_object('created',false,'certificate',jsonb_build_object('id',v_row.id,'code',v_row.certificate_code,'displayName',v_row.display_name,'xpTotal',v_row.xp_total,'completedAt',v_row.completed_at,'createdAt',v_row.created_at,'revokedAt',v_row.revoked_at,'emailSentAt',v_row.email_sent_at,'emailStatus',v_row.email_status)); end if;
  loop
    v_attempt:=v_attempt+1;
    if v_attempt>8 then raise exception 'Certificate code generation failed'; end if;
    v_code:='VOLTZ-'||to_char(now(),'YYYY')||'-'||upper(encode(extensions.gen_random_bytes(8),'hex'));
    begin
      insert into public.certificates(user_id,certificate_code,display_name,xp_total,completed_at) values(p_user,v_code,left(v_name,160),v_xp,now()) on conflict(user_id) do nothing returning * into v_row;
      if found then v_created:=true; exit; end if;
      select * into v_row from public.certificates where user_id=p_user;
      if found then exit; end if;
    exception when unique_violation then null;
    end;
  end loop;
  return jsonb_build_object('created',v_created,'certificate',jsonb_build_object('id',v_row.id,'code',v_row.certificate_code,'displayName',v_row.display_name,'xpTotal',v_row.xp_total,'completedAt',v_row.completed_at,'createdAt',v_row.created_at,'revokedAt',v_row.revoked_at,'emailSentAt',v_row.email_sent_at,'emailStatus',v_row.email_status));
end;
$$;
revoke execute on function public.voltz_issue_certificate_server(uuid) from public,anon,authenticated;
grant execute on function public.voltz_issue_certificate_server(uuid) to service_role;
