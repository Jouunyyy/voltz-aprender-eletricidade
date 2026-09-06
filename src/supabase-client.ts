export const SUPABASE_URL='https://utgtvdmafmehjgebyhqk.supabase.co';
export const SUPABASE_KEY='sb_publishable_RJmuDpACfRDdDjS66HRCSQ_hTtxAfht';
export const SESSION_KEY='voltz-auth-session';

type StoredSession={access_token?:string;refresh_token?:string;expires_at?:number;expires_in?:number;user?:unknown;[key:string]:unknown};
let refreshing:Promise<string>|null=null;

export function readStoredSession():StoredSession|null{
 const raw=localStorage.getItem(SESSION_KEY);
 if(!raw)return null;
 try{return JSON.parse(raw) as StoredSession}catch{localStorage.removeItem(SESSION_KEY);return null}
}

export function writeStoredSession(session:StoredSession|null){
 if(session)localStorage.setItem(SESSION_KEY,JSON.stringify(session));
 else localStorage.removeItem(SESSION_KEY);
}

export async function getValidAccessToken():Promise<string>{
 const session=readStoredSession();
 if(!session?.access_token)throw new Error('Inicia sessão para continuar.');
 const expiresAt=Number(session.expires_at||0);
 if(!expiresAt||expiresAt>=Date.now()/1000+60)return session.access_token;
 if(!session.refresh_token)throw new Error('A sessão expirou. Volta a entrar no Voltz.');
 if(!refreshing)refreshing=(async()=>{
  const response=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{
   method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token}),
  });
  const next=await response.json().catch(()=>null);
  if(!response.ok||!next?.access_token){writeStoredSession(null);throw new Error('A sessão expirou. Volta a entrar no Voltz.');}
  const merged:StoredSession={...session,...next,user:next.user??session.user,expires_at:Math.floor(Date.now()/1000)+Number(next.expires_in||3600)};
  writeStoredSession(merged);
  return String(next.access_token);
 })().finally(()=>{refreshing=null});
 return refreshing;
}
