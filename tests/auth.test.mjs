import {test} from 'node:test';
import assert from 'node:assert/strict';
import {appRedirect,emailAuthPath,takeAuthCallback} from '../src/auth-redirect.ts';
import {getValidAccessToken,writeStoredSession,readStoredSession} from '../src/supabase-client.ts';
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)}};
globalThis.localStorage=storage();
for(const [origin,base,expected] of [['https://jouunyyy.github.io','/voltz-aprender-eletricidade/','https://jouunyyy.github.io/voltz-aprender-eletricidade/'],['https://voltz.midiahost.pt','/','https://voltz.midiahost.pt/']])test(`auth redirects ${origin}`,()=>{
 const redirect=appRedirect(origin,base);assert.equal(redirect,expected);
 for(const action of ['signup','recover'])assert.equal(new URL(emailAuthPath(action,redirect),'https://auth.test/').searchParams.get('redirect_to'),expected);
});
test('callback strips all credentials before network and keeps Live destination',()=>{
 let clean;const result=takeAuthCallback({href:'https://jouunyyy.github.io/voltz-aprender-eletricidade/?live=123456#access_token=fake-test&refresh_token=fake-refresh&provider_token=fake-provider&type=recovery&expires_in=3600'},{replaceState:(_a,_b,url)=>clean=url});
 assert.equal(clean,'/voltz-aprender-eletricidade/?live=123456');assert.equal(result.recovery,true);assert.equal(result.access_token,'fake-test');
});
test('error callback and incomplete callback are cleaned too',()=>{
 for(const fragment of ['error=access_denied&error_description=no','refresh_token=fake']){let clean;assert.ok(takeAuthCallback({href:'https://app.test/#'+fragment},{replaceState:(_a,_b,url)=>clean=url}));assert.equal(clean,'/');}
});
test('ordinary navigation remains intact',()=>{assert.equal(takeAuthCallback({href:'https://app.test/#manual'},{replaceState:()=>assert.fail()}),null)});
test('valid session survives read/reload without refresh',async()=>{writeStoredSession({access_token:'fake',expires_at:Date.now()/1000+3600});assert.equal(await getValidAccessToken(),'fake');assert.equal(readStoredSession().access_token,'fake')});
test('refresh rotates and deduplicates requests',async()=>{const old=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({access_token:'new-fake',refresh_token:'new-refresh',expires_in:3600})};try{writeStoredSession({access_token:'old-fake',refresh_token:'old-refresh',expires_at:1});assert.deepEqual(await Promise.all([getValidAccessToken(),getValidAccessToken()]),['new-fake','new-fake']);assert.equal(calls,1);assert.equal(readStoredSession().refresh_token,'new-refresh')}finally{globalThis.fetch=old}});
test('temporary server failure preserves refresh session',async()=>{const old=globalThis.fetch;globalThis.fetch=async()=>Response.json({}, {status:503});try{writeStoredSession({access_token:'fake',refresh_token:'refresh',expires_at:1});await assert.rejects(getValidAccessToken());assert.equal(readStoredSession().refresh_token,'refresh')}finally{globalThis.fetch=old}});
test('rejected refresh removes invalid session',async()=>{const old=globalThis.fetch;globalThis.fetch=async()=>Response.json({}, {status:400});try{writeStoredSession({access_token:'fake',refresh_token:'refresh',expires_at:1});await assert.rejects(getValidAccessToken());assert.equal(readStoredSession(),null)}finally{globalThis.fetch=old}});
test('logout wins against pending refresh',async()=>{const old=globalThis.fetch;let complete;globalThis.fetch=()=>new Promise(resolve=>complete=resolve);try{writeStoredSession({access_token:'fake',refresh_token:'refresh',expires_at:1});const pending=getValidAccessToken();writeStoredSession(null);complete(Response.json({access_token:'new-fake',refresh_token:'new-refresh'}));await assert.rejects(pending);assert.equal(readStoredSession(),null)}finally{globalThis.fetch=old}});
test('real initialization consumes recovery once and logout clears local state',async()=>{
 const oldFetch=globalThis.fetch;
 globalThis.sessionStorage=storage();
 globalThis.location={href:'https://app.test/?live=123456#access_token=fake-callback&refresh_token=fake-refresh&type=recovery',reload(){}};
 let cleaned='';globalThis.history={replaceState:(_a,_b,url)=>{cleaned=url;globalThis.location.href='https://app.test'+url}};
 globalThis.fetch=async url=>{assert.ok(cleaned);return String(url).endsWith('/logout')?new Response(null,{status:204}):Response.json({id:'fake-user',email:'fake@example.test'})};
 try{const {initializeAuth,signOut}=await import('../src/auth-session.ts');const first=initializeAuth();assert.equal(initializeAuth(),first);const state=await first;assert.equal(state.recovery,true);assert.equal(state.session.user.id,'fake-user');assert.equal(cleaned,'/?live=123456');assert.equal(sessionStorage.getItem('voltz-auth-recovery'),'fake-user');await signOut();assert.equal(readStoredSession(),null);assert.equal(sessionStorage.getItem('voltz-auth-recovery'),null)}finally{globalThis.fetch=oldFetch}
});
