import {getValidAccessToken,readStoredSession,writeStoredSession,SUPABASE_URL,SUPABASE_KEY,SESSION_KEY} from './supabase-client.ts';
import {takeAuthCallback} from './auth-redirect.ts';
const RECOVERY_KEY='voltz-auth-recovery';
let initialization:ReturnType<typeof restore>|null=null;
export function finishRecovery(){sessionStorage.removeItem(RECOVERY_KEY)}
async function restore(){
 let recovery=false;
 try{
  const callback=takeAuthCallback(location,history);
  if(callback?.error)throw new Error('A autenticação não foi concluída. Tenta novamente.');
  if(callback){
   if(!callback.access_token||!callback.refresh_token)throw new Error('O link de autenticação está incompleto. Pede um novo link.');
   const response=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${callback.access_token}`}});
   if(!response.ok)throw new Error('O link expirou ou é inválido. Pede um novo link.');
   const user=await response.json();
   writeStoredSession({access_token:callback.access_token,refresh_token:callback.refresh_token,expires_at:Math.floor(Date.now()/1000)+(Number.isFinite(callback.expires_in)?callback.expires_in:3600),user});
   if(callback.recovery)sessionStorage.setItem(RECOVERY_KEY,user.id);
   else finishRecovery();
  }
  const stored=readStoredSession();
  if(!stored)return {session:null,recovery:false};
  const access=await getValidAccessToken();
  const response=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${access}`}});
  if(!response.ok){if(response.status===401||response.status===403)writeStoredSession(null);throw new Error('Não foi possível validar a sessão. Tenta entrar novamente.');}
  const user=await response.json();
  const session={...readStoredSession(),access_token:access,user};
  writeStoredSession(session);
  recovery=sessionStorage.getItem(RECOVERY_KEY)===user.id;
  return {session,recovery};
 }catch(error){return {session:null,recovery:false,error:error instanceof Error?error.message:'Não foi possível abrir a sessão.'}}
}
// One callback consumer, also under React StrictMode. Tokens never pass through telemetry.
export function initializeAuth(){return initialization??=restore()}
export async function signOut(){
 const session=readStoredSession();
 // Clear first: an in-flight refresh must never resurrect a logged-out session.
 writeStoredSession(null);finishRecovery();
 localStorage.removeItem('voltz-progress-v1');sessionStorage.removeItem('voltz-live-pending-code');
 if(session?.access_token)try{await fetch(`${SUPABASE_URL}/auth/v1/logout`,{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${session.access_token}`}})}catch{}
}
export function startSessionRefresh(onSignedOut:()=>void){
 const refresh=()=>{if(readStoredSession())void getValidAccessToken().catch(()=>{if(!readStoredSession())onSignedOut()})};
 const visible=()=>{if(document.visibilityState==='visible')refresh()};
 const storage=(event:StorageEvent)=>{if(event.key===SESSION_KEY){if(!readStoredSession())onSignedOut();else location.reload()}};
 const timer=window.setInterval(refresh,30000);
 document.addEventListener('visibilitychange',visible);window.addEventListener('pageshow',refresh);window.addEventListener('online',refresh);window.addEventListener('storage',storage);
 return()=>{window.clearInterval(timer);document.removeEventListener('visibilitychange',visible);window.removeEventListener('pageshow',refresh);window.removeEventListener('online',refresh);window.removeEventListener('storage',storage)};
}
