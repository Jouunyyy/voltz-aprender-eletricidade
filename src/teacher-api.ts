const SUPABASE_URL='https://utgtvdmafmehjgebyhqk.supabase.co';
const KEY='sb_publishable_RJmuDpACfRDdDjS66HRCSQ_hTtxAfht';
const SESSION_KEY='voltz-auth-session';
let refreshing:Promise<string>|null=null;

async function accessToken(){
 const raw=localStorage.getItem(SESSION_KEY);if(!raw)throw new Error('Inicia sessão para continuar.');
 const session=JSON.parse(raw);
 if(session.expires_at&&session.expires_at<Date.now()/1000+60){
  if(!session.refresh_token)throw new Error('A sessão expirou. Volta a entrar no Voltz.');
  if(!refreshing)refreshing=(async()=>{const response=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token})});const next=await response.json();if(!response.ok)throw new Error('A sessão expirou. Volta a entrar no Voltz.');next.expires_at=Math.floor(Date.now()/1000)+Number(next.expires_in||3600);localStorage.setItem(SESSION_KEY,JSON.stringify(next));return next.access_token})().finally(()=>{refreshing=null});
  return refreshing;
 }
 return session.access_token as string;
}

export async function teacherRequest(action:string,input:Record<string,unknown>={}){
 const token=await accessToken();const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetch(`${SUPABASE_URL}/functions/v1/voltz-teachers`,{method:'POST',headers:{apikey:KEY,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({action,input}),signal:controller.signal});
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data.error){const code=data.code?` Código: ${data.code}`:'';throw new Error(`${data.error||'Não foi possível processar o pedido.'}${code}`)}
  return data;
 }catch(error){if(error instanceof DOMException&&error.name==='AbortError')throw new Error('A ligação ao Voltz Professores demorou demasiado. Tenta novamente.');throw error}finally{window.clearTimeout(timeout)}
}

export function recordStudentAnswer(input:Record<string,unknown>){void teacherRequest('record_answer',input).catch(()=>{})}
export function recordStudentLevel(input:Record<string,unknown>){void teacherRequest('record_level',input).catch(()=>{})}
