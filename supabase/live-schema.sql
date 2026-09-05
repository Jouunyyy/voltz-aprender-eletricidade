-- Voltz Live: private data, service-only transactional API. JWT identity is verified by the Edge Function.
create schema if not exists voltz_live;
revoke all on schema voltz_live from public, anon, authenticated;
grant usage on schema voltz_live to service_role;
create table voltz_live.sessions (
 id uuid primary key default gen_random_uuid(), code text not null check(code ~ '^[0-9]{6}$'),
 host_user_id uuid not null references auth.users(id) on delete cascade,
 phase text not null default 'lobby' check(phase in ('lobby','question','reveal','leaderboard','finished')),
 config jsonb not null, position integer not null default 0, started_at timestamptz,
 created_at timestamptz not null default now(), ended_at timestamptz,
 expires_at timestamptz not null default now()+interval '24 hours'
);
create unique index live_active_code on voltz_live.sessions(code) where phase <> 'finished';
create index live_host on voltz_live.sessions(host_user_id);
create table voltz_live.participants (
 session_id uuid references voltz_live.sessions(id) on delete cascade,
 user_id uuid references auth.users(id) on delete cascade, display_name text not null,
 score integer not null default 0, correct_count integer not null default 0,
 joined_at timestamptz not null default now(), last_seen_at timestamptz not null default now(),
 departed boolean not null default false, primary key(session_id,user_id)
);
create table voltz_live.questions (
 session_id uuid references voltz_live.sessions(id) on delete cascade, position integer not null,
 content jsonb not null, primary key(session_id,position)
);
create table voltz_live.answers (
 session_id uuid, position integer, user_id uuid,
 answer_index integer not null, correct boolean not null, points integer not null, response_ms integer not null,
 submitted_at timestamptz not null default now(), primary key(session_id,position,user_id),
 foreign key(session_id,position) references voltz_live.questions(session_id,position) on delete cascade,
 foreign key(session_id,user_id) references voltz_live.participants(session_id,user_id) on delete cascade
);
create table voltz_live.limits(user_id uuid references auth.users(id) on delete cascade, bucket text, window_at timestamptz not null, attempts integer not null, primary key(user_id,bucket));
alter table voltz_live.sessions enable row level security;
alter table voltz_live.participants enable row level security;
alter table voltz_live.questions enable row level security;
alter table voltz_live.answers enable row level security;
alter table voltz_live.limits enable row level security;
-- Deliberately no client policies: all reads and writes pass through verified service API.
revoke all on all tables in schema voltz_live from public,anon,authenticated;
grant all on all tables in schema voltz_live to service_role;

create or replace function public.voltz_live_command(p_user uuid, p_action text, p_input jsonb default '{}', p_name text default 'Aprendiz')
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
 s voltz_live.sessions; q jsonb; me voltz_live.participants;
 sid uuid; c text; tries integer; n integer; idx integer; elapsed integer; pts integer; duration integer;
 total integer; answered integer; correct_choice integer; data jsonb; people jsonb; mine jsonb; summary jsonb;
 clock timestamptz := clock_timestamp();
begin
 if current_user <> 'service_role' and current_user <> 'postgres' then raise exception 'Acesso reservado ao servidor'; end if;
 if p_user is null then return jsonb_build_object('error','É necessário iniciar sessão.'); end if;
 if p_action not in ('create','join','state','start','answer','close','next','end','leave') then return jsonb_build_object('error','Ação inválida.'); end if;
 if p_action in ('create','join') then
  insert into voltz_live.limits values(p_user,p_action,clock,1) on conflict(user_id,bucket) do update
  set attempts=case when voltz_live.limits.window_at < clock-interval '1 minute' then 1 else voltz_live.limits.attempts+1 end,
  window_at=case when voltz_live.limits.window_at < clock-interval '1 minute' then clock else voltz_live.limits.window_at end returning attempts into tries;
  if tries > (case when p_action='create' then 5 else 15 end) then return jsonb_build_object('error','Demasiadas tentativas. Aguarda um minuto.'); end if;
 end if;
 if p_action='create' then
  update voltz_live.sessions set phase='finished',ended_at=clock where expires_at<clock and phase<>'finished';
  if (select count(*) from voltz_live.sessions where host_user_id=p_user and phase<>'finished')>=3 then return jsonb_build_object('error','Termina uma das tuas salas antes de criar outra.'); end if;
  n=jsonb_array_length(p_input->'questions');
  if n not between 1 and 20 or (p_input->'config'->>'duration')::integer not in (0,20,30,45,60) then return jsonb_build_object('error','Configuração inválida.'); end if;
  for tries in 1..30 loop
   -- Cryptographically random bytes; collision is protected by the unique active-code index.
   c=lpad(((('x'||substr(encode(extensions.gen_random_bytes(4),'hex'),1,7))::bit(28)::integer)%1000000)::text,6,'0');
   begin
    insert into voltz_live.sessions(code,host_user_id,config) values(c,p_user,p_input->'config') returning * into s;
    exit;
   exception when unique_violation then null;
   end;
  end loop;
  if s.id is null then return jsonb_build_object('error','Não foi possível reservar um código. Tenta novamente.'); end if;
  insert into voltz_live.questions select s.id,ordinality::integer-1,value from jsonb_array_elements(p_input->'questions') with ordinality;
 else
  if p_action='join' then
   c=p_input->>'code';
   if c is null or c !~ '^[0-9]{6}$' then return jsonb_build_object('error','Introduz os seis dígitos do código.'); end if;
   select * into s from voltz_live.sessions where code=c and phase<>'finished' for update;
  else
   select * into s from voltz_live.sessions where id=(p_input->>'id')::uuid for update;
  end if;
  if s.id is null then return jsonb_build_object('error','Sessão não encontrada ou terminada.'); end if;
  if s.expires_at<clock and s.phase<>'finished' then
   update voltz_live.sessions set phase='finished',ended_at=clock where id=s.id returning * into s;
  end if;
 end if;
 clock=clock_timestamp(); -- Authoritative time after obtaining the session lock.
 if p_action in ('create','join') then
  if s.phase='finished' then return jsonb_build_object('error','Esta sessão terminou.'); end if;
  if s.phase<>'lobby' and not exists(select 1 from voltz_live.participants where session_id=s.id and user_id=p_user) then return jsonb_build_object('error','O desafio já começou. Entra na próxima sessão.'); end if;
  if (select count(*) from voltz_live.participants where session_id=s.id)>=100 and not exists(select 1 from voltz_live.participants where session_id=s.id and user_id=p_user) then return jsonb_build_object('error','A sala está cheia (100 participantes).'); end if;
  insert into voltz_live.participants(session_id,user_id,display_name) values(s.id,p_user,left(coalesce(nullif(p_name,''),'Aprendiz'),100))
  on conflict(session_id,user_id) do update set departed=false,last_seen_at=clock;
 end if;
 select * into me from voltz_live.participants where session_id=s.id and user_id=p_user;
 if me.user_id is null then return jsonb_build_object('error','Não pertences a esta sessão.'); end if;
 update voltz_live.participants set last_seen_at=clock where session_id=s.id and user_id=p_user;
 if p_action in ('start','close','next','end') and s.host_user_id<>p_user then return jsonb_build_object('error','Só o anfitrião pode controlar a sessão.'); end if;
 select count(*) into total from voltz_live.questions where session_id=s.id;
 duration=(s.config->>'duration')::integer;
 if p_action='start' and s.phase='lobby' then
  update voltz_live.sessions set phase='question',started_at=clock where id=s.id returning * into s;
 elsif p_action='next' then
  if (p_input->>'position')::integer is distinct from s.position or p_input->>'phase' is distinct from s.phase then return jsonb_build_object('error','A sessão já avançou.'); end if;
  if s.phase='reveal' and (s.config->>'showLeaderboard')::boolean then
   update voltz_live.sessions set phase='leaderboard' where id=s.id returning * into s;
  elsif s.phase in ('reveal','leaderboard') then
   if s.position+1>=total then
    update voltz_live.sessions set phase='finished',ended_at=clock where id=s.id returning * into s;
   else
    update voltz_live.sessions set phase='question',position=position+1,started_at=clock where id=s.id returning * into s;
   end if;
  else return jsonb_build_object('error','Aguarda pelo fim da pergunta.'); end if;
 elsif p_action='end' then
  update voltz_live.sessions set phase='finished',ended_at=clock where id=s.id returning * into s;
 elsif p_action='leave' then
  if s.host_user_id=p_user and s.phase<>'finished' then return jsonb_build_object('error','Termina a sessão antes de sair.'); end if;
  update voltz_live.participants set departed=true where session_id=s.id and user_id=p_user;
  return jsonb_build_object('left',true);
 end if;
 select content into q from voltz_live.questions where session_id=s.id and position=s.position;
 if p_action='answer' then
  if s.phase<>'question' or (p_input->>'position')::integer is distinct from s.position or me.departed then return jsonb_build_object('error','Esta pergunta já não aceita respostas.'); end if;
  elapsed=greatest(0,floor(extract(epoch from(clock-s.started_at))*1000)::integer);
  if duration>0 and elapsed>=duration*1000 then
   -- Do not raise: snapshot below must commit the transition after the deadline.
   p_action='state';
  else
   idx=(p_input->>'answer')::integer;
   if idx is null or idx<0 or idx>=jsonb_array_length(q->'options') then return jsonb_build_object('error','Resposta inválida.'); end if;
   correct_choice=(q->>'answer')::integer;
   -- Accuracy 1000; linear speed bonus 0..250 using only server time. Untimed = 1000.
   pts=case when idx<>correct_choice then 0 else 1000+case when duration=0 then 0 else floor(250.0*greatest(0,duration*1000-elapsed)/(duration*1000))::integer end end;
   insert into voltz_live.answers values(s.id,s.position,p_user,idx,idx=correct_choice,pts,elapsed,clock) on conflict do nothing;
  end if;
 end if;
 select count(*) into answered from voltz_live.answers where session_id=s.id and position=s.position;
 if s.phase='question' and (p_action='close' or (duration>0 and clock>=s.started_at+make_interval(secs=>duration)) or not exists(
  select 1 from voltz_live.participants p where p.session_id=s.id and not p.departed and not exists(select 1 from voltz_live.answers a where a.session_id=s.id and a.position=s.position and a.user_id=p.user_id)
 )) then
  update voltz_live.sessions set phase='reveal' where id=s.id returning * into s;
  -- Score is released only at reveal, never an oracle while answers are open.
  update voltz_live.participants p set score=p.score+a.points,correct_count=p.correct_count+case when a.correct then 1 else 0 end
  from voltz_live.answers a where p.session_id=s.id and a.session_id=s.id and a.position=s.position and p.user_id=a.user_id;
 end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',user_id,'name',display_name,'score',score,'correctCount',correct_count,'online',not departed and last_seen_at>clock-interval '15 seconds','departed',departed) order by score desc,correct_count desc,joined_at,user_id),'[]') into people from voltz_live.participants where session_id=s.id;
 select jsonb_build_object('answer',answer_index)||case when s.phase in ('reveal','leaderboard','finished') then jsonb_build_object('correct',correct,'points',points) else '{}'::jsonb end into mine from voltz_live.answers where session_id=s.id and position=s.position and user_id=p_user;
 data=case when s.phase='lobby' then null else q-'answer'-'explanation' end;
 if s.phase in ('reveal','leaderboard','finished') then data=data||jsonb_build_object('answer',q->'answer','explanation',case when (s.config->>'showExplanations')::boolean then q->'explanation' else null end); end if;
 if s.phase='finished' and s.host_user_id=p_user then
  select coalesce(jsonb_agg(x order by (x->>'percent')::numeric),'[]') into summary from (
   select jsonb_build_object('question',qq.content->>'q','level',qq.content->>'levelTitle','percent',round(100.0*count(a.user_id) filter(where a.correct)/greatest(1,(select count(*) from voltz_live.participants where session_id=s.id)),1)) x
   from voltz_live.questions qq left join voltz_live.answers a on a.session_id=qq.session_id and a.position=qq.position
   where qq.session_id=s.id and qq.position<=s.position group by qq.position,qq.content
  ) t;
 end if;
 return jsonb_build_object('id',s.id,'code',s.code,'hostId',s.host_user_id,'phase',s.phase,'position',s.position,'total',total,'config',s.config,'startedAt',s.started_at,'serverNow',clock,'participants',people,'question',data,'mine',mine,'answered',answered,'summary',summary);
end;
$$;
revoke all on function public.voltz_live_command(uuid,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.voltz_live_command(uuid,text,jsonb,text) to service_role;
