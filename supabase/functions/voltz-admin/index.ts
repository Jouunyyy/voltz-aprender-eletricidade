const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ORIGIN = 'https://jouunyyy.github.io';
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': ORIGIN,
  'Access-Control-Allow-Headers': 'authorization,apikey,content-type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Vary': 'Origin',
};
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});

async function rpc(name:string,body:unknown){
  const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{
    method:'POST',
    headers:{apikey:SERVICE_KEY,Authorization:`Bearer ${SERVICE_KEY}`,'Content-Type':'application/json'},
    body:JSON.stringify(body),
  });
  const data=await response.json().catch(()=>null);
  if(!response.ok)throw new Error(`rpc:${name}:${response.status}`);
  return data;
}

async function githubStatus(){
  const base='https://api.github.com/repos/Jouunyyy/voltz-aprender-eletricidade';
  const common={headers:{Accept:'application/vnd.github+json','User-Agent':'Voltz-Admin'}};
  try{
    const [commitRes,runsRes]=await Promise.all([
      fetch(`${base}/commits/main`,common),
      fetch(`${base}/actions/runs?branch=main&event=push&per_page=1`,common),
    ]);
    const commit=commitRes.ok?await commitRes.json():null;
    const runs=runsRes.ok?await runsRes.json():null;
    const run=runs?.workflow_runs?.[0]||null;
    return {
      available:Boolean(commit||run),
      commit:commit?{sha:String(commit.sha||'').slice(0,12),message:commit.commit?.message?.split('\n')[0]||'',at:commit.commit?.committer?.date||null}:null,
      pages:run?{status:run.status||null,conclusion:run.conclusion||null,at:run.updated_at||run.created_at||null}:null,
    };
  }catch{return {available:false,commit:null,pages:null}}
}

Deno.serve(async request=>{
  if(request.method==='OPTIONS')return new Response('ok',{headers});
  if(request.method!=='POST')return reply({error:'Método não permitido.'},405);
  try{
    const bearer=request.headers.get('Authorization');
    if(!bearer?.startsWith('Bearer '))return reply({error:'Inicia sessão para continuar.'},401);
    const auth=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:SERVICE_KEY,Authorization:bearer}});
    if(!auth.ok)return reply({error:'A sessão expirou. Volta a entrar no Voltz.'},401);
    const user=await auth.json();
    if(!user.id||user.is_anonymous)return reply({error:'É necessária uma conta Voltz.'},401);

    const roleRes=await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${encodeURIComponent(user.id)}&select=role`,{headers:{apikey:SERVICE_KEY,Authorization:`Bearer ${SERVICE_KEY}`}});
    const roles=roleRes.ok?await roleRes.json():[];
    if(roles?.[0]?.role!=='admin')return reply({error:'Acesso reservado a administradores.'},403);

    const raw=await request.text();
    if(raw.length>12000)return reply({error:'Pedido demasiado grande.'},413);
    const body=raw?JSON.parse(raw):{};
    const action=typeof body.action==='string'?body.action:'';
    const input=body.input&&typeof body.input==='object'?body.input:{};

    if(action==='system'){
      const system=await rpc('voltz_admin_system',{p_user:user.id});
      if(system?.error)return reply(system,403);
      let email={status:'unknown'} as Record<string,unknown>;
      try{
        const res=await fetch(`${SUPABASE_URL}/functions/v1/voltz-emails`,{headers:{apikey:SERVICE_KEY}});
        const data=await res.json().catch(()=>null);
        email={status:res.ok?'operational':'degraded',health:data};
      }catch{email={status:'unavailable'}}
      return reply({...system,frontend:'operational',auth:'operational',edgeFunction:'operational',emails:email,github:await githubStatus(),checkedAt:new Date().toISOString()});
    }

    const allowed=new Set(['summary','users','user_detail','set_teacher','teachers','schools','save_school','assign_teacher_school','statistics','feedback','reports','errors','set_item_status','emails','audit']);
    if(!allowed.has(action))return reply({error:'Ação administrativa inválida.'},400);
    const data=await rpc('voltz_admin_command',{p_user:user.id,p_action:action,p_input:input});
    return reply(data,data?.error?400:200);
  }catch(error){
    console.error('Voltz Admin request failed',error instanceof Error?error.message:'error');
    return reply({error:'Não foi possível processar o pedido administrativo.'},500);
  }
});
