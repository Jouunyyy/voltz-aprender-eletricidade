import { getValidAccessToken, SUPABASE_KEY, SUPABASE_URL } from './supabase-client';

export async function teacherRequest(action:string,input:Record<string,unknown>={}){
 const token=await getValidAccessToken();
 const controller=new AbortController();
 const timeout=window.setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetch(`${SUPABASE_URL}/functions/v1/voltz-teachers`,{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({action,input}),signal:controller.signal});
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data.error){const code=data.code?` Código: ${data.code}`:'';throw new Error(`${data.error||'Não foi possível processar o pedido.'}${code}`)}
  return data;
 }catch(error){if(error instanceof DOMException&&error.name==='AbortError')throw new Error('A ligação ao Voltz Professores demorou demasiado. Tenta novamente.');throw error}finally{window.clearTimeout(timeout)}
}

export function recordStudentAnswer(input:Record<string,unknown>){void teacherRequest('record_answer',input).catch(()=>{})}
export function recordStudentLevel(input:Record<string,unknown>){void teacherRequest('record_level',input).catch(()=>{})}
