const SUPABASE_URL=Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ORIGIN='https://jouunyyy.github.io';
const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin'};
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});

const serviceHeaders=()=>{const out:Record<string,string>={apikey:SERVICE_KEY,'Content-Type':'application/json'};if(SERVICE_KEY.startsWith('eyJ'))out.Authorization=`Bearer ${SERVICE_KEY}`;return out};
async function rpc(userId:string,action:string,input:Record<string,unknown>={}){
 const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/voltz_teacher_command`,{method:'POST',headers:serviceHeaders(),body:JSON.stringify({p_user:userId,p_action:action,p_input:input})});
 const data=await response.json().catch(()=>null);
 if(!response.ok){const code=typeof data?.code==='string'?data.code:'RPC_ERROR';console.error('Voltz Professores RPC failed',action,response.status,code);throw new Error(`rpc:${action}:${response.status}:${code}`)}
 return data;
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
  const raw=await request.text();if(raw.length>12000)return reply({error:'Pedido demasiado grande.'},413);
  const body=raw?JSON.parse(raw):{};const action=typeof body.action==='string'?body.action:'';const input=body.input&&typeof body.input==='object'?body.input:{};
  const allowed=new Set(['student_context','join_class','leave_class','mark_recommendation','record_answer','record_level','teacher_home','create_class','archive_class','class_detail','student_detail','recommend']);
  if(!allowed.has(action))return reply({error:'Ação inválida.'},400);
  const data=await rpc(user.id,action,input);
  if(data?.error){const status=data.error.includes('reservado')||data.error.includes('permissão')?403:400;return reply(data,status)}
  return reply(data);
 }catch(error){const diagnostic=error instanceof Error?error.message:'unknown';console.error('Voltz Professores request failed',diagnostic);const code=diagnostic.startsWith('rpc:')?diagnostic.split(':').slice(0,4).join(':'):'TEACHERS_BACKEND_ERROR';return reply({error:'Não foi possível processar o pedido.',code},500)}
});
