const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ALLOWED_ORIGINS=new Set(['https://jouunyyy.github.io','https://voltz.midiahost.pt']);
const baseHeaders={'Content-Type':'application/json','Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin'};

const serviceHeaders=()=>{
 const out:Record<string,string>={apikey:SERVICE_KEY,'Content-Type':'application/json'};
 if(SERVICE_KEY.startsWith('eyJ'))out.Authorization=`Bearer ${SERVICE_KEY}`;
 return out;
};

async function serviceFetch(path:string,init:RequestInit={}){
 return fetch(`${SUPABASE_URL}${path}`,{
  ...init,
  headers:{...serviceHeaders(),...(init.headers||{})},
 });
}

async function rpc(name:string,body:unknown){
 let response=await serviceFetch(`/rest/v1/rpc/${name}`,{method:'POST',body:JSON.stringify(body)});
 if(response.status===404){await new Promise(resolve=>setTimeout(resolve,350));response=await serviceFetch(`/rest/v1/rpc/${name}`,{method:'POST',body:JSON.stringify(body)})}
 const data=await response.json().catch(()=>null);
 if(!response.ok){
  const code=typeof data?.code==='string'?data.code:'RPC_ERROR';
  console.error('Voltz Admin RPC failed',name,response.status,code);
  throw new Error(`rpc:${name}:${response.status}:${code}`);
 }
 return data;
}

async function githubStatus(){
 const base='https://api.github.com/repos/Jouunyyy/voltz-aprender-eletricidade';
 const common={headers:{Accept:'application/vnd.github+json','User-Agent':'Voltz-Admin'}};
 try{
  const [commitRes,runsRes]=await Promise.all([fetch(`${base}/commits/main`,common),fetch(`${base}/actions/runs?branch=main&event=push&per_page=1`,common)]);
  const commit=commitRes.ok?await commitRes.json():null;
  const runs=runsRes.ok?await runsRes.json():null;
  const run=runs?.workflow_runs?.[0]||null;
  return {available:Boolean(commit||run),commit:commit?{sha:String(commit.sha||'').slice(0,12),message:commit.commit?.message?.split('\n')[0]||'',at:commit.commit?.committer?.date||null}:null,pages:run?{status:run.status||null,conclusion:run.conclusion||null,at:run.updated_at||run.created_at||null}:null};
 }catch{return {available:false,commit:null,pages:null}}
}

Deno.serve(async request=>{
 const origin=request.headers.get('Origin')||'';
 const headers={...baseHeaders,'Access-Control-Allow-Origin':ALLOWED_ORIGINS.has(origin)?origin:'https://voltz.midiahost.pt'};
 const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
 if(request.method==='OPTIONS')return new Response('ok',{headers});
 if(request.method!=='POST')return reply({error:'Método não permitido.'},405);
 try{
  const bearer=request.headers.get('Authorization');
  if(!bearer?.startsWith('Bearer '))return reply({error:'Inicia sessão para continuar.'},401);
  const auth=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:SERVICE_KEY,Authorization:bearer}});
  if(!auth.ok)return reply({error:'A sessão expirou. Volta a entrar no Voltz.'},401);
  const user=await auth.json();
  if(!user.id||user.is_anonymous)return reply({error:'É necessária uma conta Voltz.'},401);

  const raw=await request.text();
  if(raw.length>12000)return reply({error:'Pedido demasiado grande.'},413);
  const body=raw?JSON.parse(raw):{};
  const action=typeof body.action==='string'?body.action:'';
  const input=body.input&&typeof body.input==='object'?body.input:{};

  if(action==='heartbeat'){await rpc('voltz_activity_touch_server',{p_user:user.id});return reply({ok:true})}
  if(action==='report_error'){await rpc('voltz_error_log_server',{p_user:user.id,p_source:String(input.source||'other'),p_message:String(input.message||'Erro desconhecido'),p_route:input.route?String(input.route):null,p_stack:input.stack?String(input.stack):null});return reply({ok:true})}
  if(action==='submit_feedback'){const id=await rpc('voltz_feedback_submit_server',{p_user:user.id,p_type:input.type,p_title:input.title,p_message:input.message,p_page:input.page||null});return reply({ok:true,id})}
  if(action==='submit_report'){const id=await rpc('voltz_report_submit_server',{p_user:user.id,p_target_type:input.targetType,p_target_id:input.targetId||null,p_reason:input.reason,p_description:input.description});return reply({ok:true,id})}

  const roleRes=await serviceFetch(`/rest/v1/user_roles?user_id=eq.${encodeURIComponent(user.id)}&select=role`);
  if(!roleRes.ok)throw new Error(`roles:${roleRes.status}`);
  const roles=await roleRes.json().catch(()=>[]);
  if(roles?.[0]?.role!=='admin')return reply({error:'Acesso reservado a administradores.'},403);

  if(action==='system'){
   const system=await rpc('voltz_admin_system',{p_user:user.id});
   if(system?.error)return reply(system,403);
   let email={status:'unknown'} as Record<string,unknown>;
   try{const res=await fetch(`${SUPABASE_URL}/functions/v1/voltz-emails/health`,{headers:{apikey:SERVICE_KEY}});const data=await res.json().catch(()=>null);email={status:res.ok?'operational':'degraded',health:data}}catch{email={status:'unavailable'}}
   return reply({...system,version:'3.2',frontend:'operational',auth:'operational',edgeFunction:'operational',emails:email,github:await githubStatus(),checkedAt:new Date().toISOString()});
  }

  let data:unknown;
  if(action==='users')data=await rpc('voltz_admin_users',{p_user:user.id,p_input:input});
  else if(action==='user_detail')data=await rpc('voltz_admin_user_detail',{p_user:user.id,p_target:input.id});
  else if(action==='teachers')data=await rpc('voltz_admin_teachers',{p_user:user.id});
  else if(action==='schools')data=await rpc('voltz_admin_schools',{p_user:user.id});
  else if(action==='statistics')data=await rpc('voltz_admin_statistics',{p_user:user.id,p_days:Number(input.days||7)});
  else{
   const allowed=new Set(['summary','set_teacher','save_school','assign_teacher_school','feedback','reports','errors','set_item_status','emails','audit']);
   if(!allowed.has(action))return reply({error:'Ação administrativa inválida.'},400);
   data=await rpc('voltz_admin_command',{p_user:user.id,p_action:action,p_input:input});
  }

  if(Array.isArray(data)){
   if(action==='feedback')data=data.filter((x:any)=>x?.status==='new'||x?.status==='review');
   else if(action==='reports')data=data.filter((x:any)=>x?.status==='new'||x?.status==='review');
   else if(action==='errors')data=data.filter((x:any)=>x?.status==='open'||x?.status==='review');
  }
  return reply(data,(data as any)?.error?400:200);
 }catch(error){
  const diagnostic=error instanceof Error?error.message:'unknown';
  console.error('Voltz Admin request failed',diagnostic);
  const safeCode=diagnostic.startsWith('rpc:')?diagnostic.split(':').slice(0,4).join(':'):diagnostic.startsWith('roles:')?diagnostic:'ADMIN_BACKEND_ERROR';
  return reply({error:`Não foi possível processar o pedido. Código: ${safeCode}`},500);
 }
});