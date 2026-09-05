import { allLevels, categories } from '../../../src/curriculum.ts';
import { buildQuiz, shuffle } from '../../../src/quiz.ts';
const url = Deno.env.get('SUPABASE_URL')!;
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const headers = { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'https://jouunyyy.github.io', 'Access-Control-Allow-Headers':'authorization,apikey,content-type', 'Access-Control-Allow-Methods':'POST,OPTIONS', 'Vary':'Origin' };
const reply = (data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
Deno.serve(async request=>{
 if(request.method==='OPTIONS') return new Response('ok',{headers});
 if(request.method!=='POST') return reply({error:'Método não permitido.'},405);
 try {
  const bearer=request.headers.get('Authorization');
  if(!bearer?.startsWith('Bearer ')) return reply({error:'Inicia sessão para jogar.'},401);
  // Verify with Auth on every request. Never accept a browser-supplied user ID or score.
  const auth=await fetch(`${url}/auth/v1/user`,{headers:{apikey:key,Authorization:bearer}});
  if(!auth.ok) return reply({error:'A sessão expirou. Volta a entrar no Voltz.'},401);
  const user=await auth.json();
  if(!user.id||user.is_anonymous) return reply({error:'É necessária uma conta Voltz.'},401);
  const raw=await request.text();
  if(raw.length>8192) return reply({error:'Pedido demasiado grande.'},413);
  const body=JSON.parse(raw);
  const action=body.action;
  let input=body.input||{};
  if(action==='create'){
   const config=input.config;
   const category=categories.find(c=>c.id===config?.categoryId);
   if(!category||![5,10,15,20].includes(config.count)||![0,20,30,45,60].includes(config.duration)||typeof config.showExplanations!=='boolean'||typeof config.showLeaderboard!=='boolean') return reply({error:'Escolhe uma configuração válida.'},400);
   const levels=allLevels.filter(l=>l.category.id===category.id&&(!config.levelId||l.id===config.levelId));
   if(!levels.length) return reply({error:'O nível não pertence à categoria.'},400);
   const seen=new Set<string>();
   const pool=shuffle(levels.flatMap(level=>buildQuiz(level).map(q=>({...q,levelId:level.id,levelTitle:level.title})))).filter(q=>{
    const identity=JSON.stringify([q.q,[...q.options].sort()]);
    if(seen.has(identity)||q.options.some(x=>!x)||!q.explanation) return false;
    seen.add(identity);return true;
   });
   const questions=pool.slice(0,config.count);
   if(!questions.length) return reply({error:'Não existem perguntas válidas para esta seleção.'},400);
   input={config:{categoryId:category.id,categoryName:category.name,levelId:config.levelId||null,count:questions.length,duration:config.duration,showExplanations:config.showExplanations,showLeaderboard:config.showLeaderboard},questions};
  } else {
   input={id:input.id,code:input.code,position:input.position,phase:input.phase,answer:input.answer};
   if(action==='answer'&&(!Number.isInteger(input.answer)||!Number.isInteger(input.position)))return reply({error:'Resposta inválida.'},400);
  }
  const result=await fetch(`${url}/rest/v1/rpc/voltz_live_command`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({p_user:user.id,p_action:action,p_input:input,p_name:user.user_metadata?.full_name||user.user_metadata?.name||user.email?.split('@')[0]||'Aprendiz'})});
  const data=await result.json();
  if(!result.ok){console.error('Live database error',data.code);return reply({error:'Não foi possível atualizar a sessão. Tenta novamente.'},500)}
  return reply(data,data.error?400:200);
 }catch(error){console.error('Live request failed',error instanceof Error?error.name:'error');return reply({error:'Não foi possível processar o pedido. Tenta novamente.'},400)}
});
