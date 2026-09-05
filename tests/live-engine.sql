-- Run only as database owner. Test identities and all game data are rolled back.
begin;
select set_config('voltz.test_a',gen_random_uuid()::text,true),set_config('voltz.test_b',gen_random_uuid()::text,true);
insert into auth.users(id,email) values(current_setting('voltz.test_a')::uuid,'voltz-live-a@example.invalid'),(current_setting('voltz.test_b')::uuid,'voltz-live-b@example.invalid');
set local role service_role;
do $$
declare a uuid:=current_setting('voltz.test_a')::uuid; b uuid:=current_setting('voltz.test_b')::uuid;
 s jsonb; t jsonb; v jsonb; id text; code text; i integer; cnt integer;
begin
 s:=public.voltz_live_command(a,'create',jsonb_build_object('config',jsonb_build_object('duration',0,'showLeaderboard',true,'showExplanations',true),'questions',(select jsonb_agg(jsonb_build_object('q','Pergunta '||x,'options',jsonb_build_array('Correta','Errada','Outra'),'answer',0,'explanation','Explicação','levelTitle','Aprendiz')) from generate_series(1,5) x)),'Anfitrião');
 if s ? 'error' then raise exception 'create %',s; end if;
 id:=s->>'id';code:=s->>'code';
 if code !~ '^[0-9]{6}$' or jsonb_array_length(s->'participants')<>1 or s->'question'<>'null'::jsonb then raise exception 'lobby'; end if;
 t:=public.voltz_live_command(b,'join',jsonb_build_object('code',code),'Jogador');
 t:=public.voltz_live_command(b,'join',jsonb_build_object('code',code),'Jogador');
 if jsonb_array_length(t->'participants')<>2 then raise exception 'duplicate participant'; end if;
 t:=public.voltz_live_command(b,'start',jsonb_build_object('id',id));
 if not(t ? 'error') then raise exception 'player start accepted'; end if;
 s:=public.voltz_live_command(a,'start',jsonb_build_object('id',id));
 for i in 0..4 loop
  if s->>'phase'<>'question' or (s->'question') ? 'answer' or (s->'question') ? 'explanation' then raise exception 'premature reveal %',s; end if;
  t:=public.voltz_live_command(b,'state',jsonb_build_object('id',id));
  if s->'question'<>t->'question' then raise exception 'different question/order'; end if;
  t:=public.voltz_live_command(b,'answer',jsonb_build_object('id',id,'position',i,'answer',1,'score',999999));
  t:=public.voltz_live_command(b,'answer',jsonb_build_object('id',id,'position',i,'answer',0));
  if t->'mine'->>'answer'<>'1' or t->'mine' ? 'correct' or t->'mine' ? 'points' then raise exception 'answer changed or oracle'; end if;
  t:=public.voltz_live_command(b,'next',jsonb_build_object('id',id,'position',i,'phase','question'));
  if not(t ? 'error') then raise exception 'player advance accepted'; end if;
  s:=public.voltz_live_command(a,'answer',jsonb_build_object('id',id,'position',i,'answer',0));
  if s->>'phase'<>'reveal' or s->'mine'->>'points'<>'1000' or s->'question'->>'explanation'<>'Explicação' then raise exception 'reveal %',s; end if;
  t:=public.voltz_live_command(a,'state',jsonb_build_object('id',id));
  if t->'participants'<>s->'participants' then raise exception 'refresh changed scores'; end if;
  s:=public.voltz_live_command(a,'next',jsonb_build_object('id',id,'position',i,'phase','reveal'));
  if s->>'phase'<>'leaderboard' then raise exception 'ranking'; end if;
  t:=public.voltz_live_command(a,'next',jsonb_build_object('id',id,'position',i,'phase','reveal'));
  if not(t ? 'error') then raise exception 'duplicate transition accepted'; end if;
  s:=public.voltz_live_command(a,'next',jsonb_build_object('id',id,'position',i,'phase','leaderboard'));
 end loop;
 if s->>'phase'<>'finished' or jsonb_array_length(s->'summary')<>5 or s->'participants'->0->>'score'<>'5000' or s->'participants'->1->>'score'<>'0' then raise exception 'final %',s; end if;
 t:=public.voltz_live_command(b,'join',jsonb_build_object('code',code));
 if not(t ? 'error') then raise exception 'joined finished'; end if;
 select count(*) into cnt from voltz_live.answers where session_id=id::uuid;
 if cnt<>10 then raise exception 'duplicate answers'; end if;
 -- Timed question, server deadline and close without answers; no leaderboard/explanation.
 s:=public.voltz_live_command(a,'create','{"config":{"duration":20,"showLeaderboard":false,"showExplanations":false},"questions":[{"q":"Tempo","options":["A","B"],"answer":0,"explanation":"Oculta"}]}');
 id:=s->>'id';s:=public.voltz_live_command(a,'start',jsonb_build_object('id',id));
 update voltz_live.sessions set started_at=now()-interval '21 seconds' where sessions.id=(s->>'id')::uuid;
 s:=public.voltz_live_command(a,'answer',jsonb_build_object('id',id,'position',0,'answer',0));
 if s->>'phase'<>'reveal' or s->'mine'<>'null'::jsonb or s->'question'->'explanation'<>'null'::jsonb then raise exception 'deadline'; end if;
 s:=public.voltz_live_command(a,'next',jsonb_build_object('id',id,'position',0,'phase','reveal'));
 if s->>'phase'<>'finished' then raise exception 'no leaderboard'; end if;
 -- Service is the only callable role, and private tables have no client grants.
 if has_function_privilege('authenticated','public.voltz_live_command(uuid,text,jsonb,text)','EXECUTE') or has_function_privilege('anon','public.voltz_live_command(uuid,text,jsonb,text)','EXECUTE') then raise exception 'public function access'; end if;
 if has_schema_privilege('authenticated','voltz_live','USAGE') then raise exception 'public schema access'; end if;
end $$;
select 'PASS: two identities, five rounds, exact ordering, final ranking, pedagogy, duplicate protection, host authorization, answer secrecy, score isolation, deadline, refresh, private grants' as result;
rollback;
