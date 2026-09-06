import type { Check } from './curriculum';
import { reportTelemetry } from './telemetry';
import { getValidAccessToken, SUPABASE_KEY, SUPABASE_URL } from './supabase-client';

export type LiveConfig={categoryId:string;levelId:string|null;count:number;duration:number;showExplanations:boolean;showLeaderboard:boolean;categoryName?:string};
export type LiveState={id:string;code:string;hostId:string;phase:'lobby'|'question'|'reveal'|'leaderboard'|'finished';position:number;total:number;config:LiveConfig;startedAt:string|null;serverNow:string;participants:{id:string;name:string;score:number;correctCount:number;online:boolean;departed:boolean}[];question:(Omit<Check,'answer'|'options'>&{options:string[];answer?:number;levelTitle:string})|null;mine:{answer:number;correct?:boolean;points?:number}|null;answered:number;summary:{question:string;level:string;percent:number}[]|null};
export type LiveRoom={id:string;code:string;phase:'lobby'|'question'|'reveal'|'leaderboard';categoryName:string;levelId:string|null;total:number;participants:number;createdAt:string};
export type LiveResponse=LiveState|{left:true};

function reportLiveFailure(message:string,action:string){reportTelemetry('live',message,`live:${String(action).slice(0,80)}`)}

export async function liveRequest<T=LiveResponse>(action:string,input:unknown={},signal?:AbortSignal):Promise<T>{
 const access=await getValidAccessToken();
 const controller=!signal?new AbortController():null;
 const timeout=controller?window.setTimeout(()=>controller.abort(),15000):null;
 try{
  const response=await fetch(`${SUPABASE_URL}/functions/v1/voltz-live`,{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${access}`,'Content-Type':'application/json'},body:JSON.stringify({action,input}),signal:signal||controller!.signal});
  const data=await response.json().catch(()=>null);
  if(data===null||data===undefined){reportLiveFailure(`${response.status} resposta inválida`,action);throw new Error('O servidor devolveu uma resposta inválida. Tenta novamente.');}
  if(!response.ok||(typeof data==='object'&&!Array.isArray(data)&&data?.error)){
   const message=(typeof data==='object'&&!Array.isArray(data)&&data?.error)||'Não foi possível ligar ao Live. Tenta novamente.';
   if(response.status>=500)reportLiveFailure(`${response.status} ${message}`,action);
   throw new Error(message);
  }
  return data as T;
 }catch(error){
  if(error instanceof DOMException&&error.name==='AbortError'){reportLiveFailure('Timeout ao comunicar com Voltz Live',action);throw new Error('A ligação ao Voltz Live demorou demasiado. Tenta novamente.');}
  if(error instanceof TypeError)reportLiveFailure(error.message,action);
  throw error;
 }finally{if(timeout!==null)window.clearTimeout(timeout)}
}

export function liveUrl(code:string){const url=new globalThis.URL(location.href);url.hash='';url.search='';url.searchParams.set('live',code);return url.toString();}
export function setLiveUrl(code?:string){const url=new globalThis.URL(location.href);if(code)url.searchParams.set('live',code);else url.searchParams.delete('live');history.replaceState({},'',url);}
