import type { Check } from './curriculum';
const URL='https://utgtvdmafmehjgebyhqk.supabase.co';
const KEY='sb_publishable_RJmuDpACfRDdDjS66HRCSQ_hTtxAfht';
export type LiveConfig={categoryId:string;levelId:string|null;count:number;duration:number;showExplanations:boolean;showLeaderboard:boolean;categoryName?:string};
export type LiveState={id:string;code:string;hostId:string;phase:'lobby'|'question'|'reveal'|'leaderboard'|'finished';position:number;total:number;config:LiveConfig;startedAt:string;serverNow:string;participants:{id:string;name:string;score:number;correctCount:number;online:boolean;departed:boolean}[];question:(Omit<Check,'answer'|'options'>&{options:string[];answer?:number;levelTitle:string})|null;mine:{answer:number;correct?:boolean;points?:number}|null;answered:number;summary:{question:string;level:string;percent:number}[]|null};
let refreshing:Promise<string>|null=null;
async function token(){
 const raw=localStorage.getItem('voltz-auth-session');
 if(!raw)throw new Error('Inicia sessão para jogar.');
 const s=JSON.parse(raw);
 if(s.expires_at&&s.expires_at<Date.now()/1000+60){
  if(!refreshing)refreshing=(async()=>{const response=await fetch(`${URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});const next=await response.json();if(!response.ok)throw new Error('A sessão expirou. Atualiza a página e volta a entrar.');next.expires_at=Math.floor(Date.now()/1000)+next.expires_in;localStorage.setItem('voltz-auth-session',JSON.stringify(next));return next.access_token;})().finally(()=>{refreshing=null});
  return refreshing;
 }
 return s.access_token;
}
export async function liveRequest(action:string,input:unknown={},signal?:AbortSignal):Promise<LiveState>{
 const access=await token();
 const response=await fetch(`${URL}/functions/v1/voltz-live`,{method:'POST',headers:{apikey:KEY,Authorization:`Bearer ${access}`,'Content-Type':'application/json'},body:JSON.stringify({action,input}),signal:signal||AbortSignal.timeout(15000)});
 const data=await response.json();
 if(!response.ok||data.error)throw new Error(data.error||'Não foi possível ligar ao Live. Tenta novamente.');
 return data;
}
export function liveUrl(code:string){const url=new URL(location.href);url.hash='';url.search='';url.searchParams.set('live',code);return url.toString();}
export function setLiveUrl(code?:string){const url=new URL(location.href);if(code)url.searchParams.set('live',code);else url.searchParams.delete('live');history.replaceState({},'',url);}
