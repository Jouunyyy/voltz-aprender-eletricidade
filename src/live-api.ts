import type { Check } from './curriculum';
const SUPABASE_URL='https://utgtvdmafmehjgebyhqk.supabase.co';
const KEY='sb_publishable_RJmuDpACfRDdDjS66HRCSQ_hTtxAfht';
export type LiveConfig={categoryId:string;levelId:string|null;count:number;duration:number;showExplanations:boolean;showLeaderboard:boolean;categoryName?:string};
export type LiveState={id:string;code:string;hostId:string;phase:'lobby'|'question'|'reveal'|'leaderboard'|'finished';position:number;total:number;config:LiveConfig;startedAt:string|null;serverNow:string;participants:{id:string;name:string;score:number;correctCount:number;online:boolean;departed:boolean}[];question:(Omit<Check,'answer'|'options'>&{options:string[];answer?:number;levelTitle:string})|null;mine:{answer:number;correct?:boolean;points?:number}|null;answered:number;summary:{question:string;level:string;percent:number}[]|null};
export type LiveRoom={id:string;code:string;phase:'lobby'|'question'|'reveal'|'leaderboard';categoryName:string;levelId:string|null;total:number;participants:number;createdAt:string};
export type LiveResponse=LiveState|{left:true};
let refreshing:Promise<string>|null=null;

async function token(){
 const raw=localStorage.getItem('voltz-auth-session');
 if(!raw)throw new Error('Inicia sessão para jogar.');
 let s:any;
 try{s=JSON.parse(raw)}catch{localStorage.removeItem('voltz-auth-session');throw new Error('A sessão guardada está inválida. Volta a entrar no Voltz.');}
 if(!s?.access_token)throw new Error('A sessão terminou. Volta a entrar no Voltz.');
 if(s.expires_at&&s.expires_at<Date.now()/1000+60){
  if(!s.refresh_token)throw new Error('A sessão terminou. Volta a entrar no Voltz.');
  if(!refreshing)refreshing=(async()=>{
   const response=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});
   const next=await response.json().catch(()=>null);
   if(!response.ok||!next?.access_token)throw new Error('A sessão expirou. Atualiza a página e volta a entrar.');
   next.expires_at=Math.floor(Date.now()/1000)+Number(next.expires_in||3600);
   localStorage.setItem('voltz-auth-session',JSON.stringify(next));
   return next.access_token as string;
  })().finally(()=>{refreshing=null});
  return refreshing;
 }
 return s.access_token as string;
}

export async function liveRequest<T=LiveResponse>(action:string,input:unknown={},signal?:AbortSignal):Promise<T>{
 const access=await token();
 const controller=!signal?new AbortController():null;
 const timeout=controller?window.setTimeout(()=>controller.abort(),15000):null;
 try{
  const response=await fetch(`${SUPABASE_URL}/functions/v1/voltz-live`,{method:'POST',headers:{apikey:KEY,Authorization:`Bearer ${access}`,'Content-Type':'application/json'},body:JSON.stringify({action,input}),signal:signal||controller!.signal});
  const data=await response.json().catch(()=>null);
  if(data===null||data===undefined)throw new Error('O servidor devolveu uma resposta inválida. Tenta novamente.');
  if(!response.ok||(typeof data==='object'&&!Array.isArray(data)&&data?.error))throw new Error((typeof data==='object'&&!Array.isArray(data)&&data?.error)||'Não foi possível ligar ao Live. Tenta novamente.');
  return data as T;
 }catch(error){
  if(error instanceof DOMException&&error.name==='AbortError')throw new Error('A ligação ao Voltz Live demorou demasiado. Tenta novamente.');
  throw error;
 }finally{if(timeout!==null)window.clearTimeout(timeout)}
}

export function liveUrl(code:string){const url=new globalThis.URL(location.href);url.hash='';url.search='';url.searchParams.set('live',code);return url.toString();}
export function setLiveUrl(code?:string){const url=new globalThis.URL(location.href);if(code)url.searchParams.set('live',code);else url.searchParams.delete('live');history.replaceState({},'',url);}
