do $$
declare d text; original text;
begin
 select pg_get_functiondef('public.voltz_live_command(uuid,text,jsonb,text)'::regprocedure) into d;
 original:=d;
 d:=replace(d,
  'if p_action not in (''create'',''join'',''state'',''start'',''answer'',''close'',''next'',''end'',''leave'') then',
  'if p_action not in (''create'',''join'',''state'',''start'',''answer'',''close'',''next'',''end'',''leave'',''list'') then');
 d:=replace(d,
  'if p_action in (''create'',''join'') then',
  'if p_action=''list'' then
   return coalesce((select jsonb_agg(jsonb_build_object(''id'',s0.id,''code'',s0.code,''phase'',s0.phase,''categoryName'',coalesce(s0.config->>''categoryName'',s0.config->>''categoryId'',''Voltz Live''),''levelId'',s0.config->''levelId'',''total'',(select count(*) from voltz_live.questions q0 where q0.session_id=s0.id),''participants'',(select count(*) from voltz_live.participants p0 where p0.session_id=s0.id and not p0.departed),''createdAt'',s0.created_at) order by s0.created_at desc) from voltz_live.sessions s0 where s0.host_user_id=p_user and s0.phase<>''finished''),''[]''::jsonb);
 end if;
 if p_action in (''create'',''join'') then');
 if d=original then raise exception 'voltz_live_command source did not match expected text'; end if;
 execute d;
end $$;
revoke all on function public.voltz_live_command(uuid,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.voltz_live_command(uuid,text,jsonb,text) to service_role;
