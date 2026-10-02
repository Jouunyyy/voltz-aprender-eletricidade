// Keep the deployment origin and Vite base together; never fall back to origin alone.
export function appRedirect(origin:string, base:string):string {
 const url=new URL(base,origin);
 if(url.origin!==origin)throw new Error('Destino de autenticação inválido.');
 url.search='';url.hash='';
 if(!url.pathname.endsWith('/'))url.pathname+='/';
 return url.href;
}
export function emailAuthPath(action:'signup'|'recover',redirect:string):string {
 return `${action}?${new URLSearchParams({redirect_to:redirect})}`;
}
export function takeAuthCallback(location:Pick<Location,'href'>,history:Pick<History,'replaceState'>){
 const url=new URL(location.href);
 const hash=new URLSearchParams(url.hash.slice(1));
 const keys=['access_token','refresh_token','provider_token','provider_refresh_token','token_type','expires_in','expires_at','type','error','error_code','error_description'];
 const callback=keys.some(key=>hash.has(key))||url.searchParams.has('error');
 if(!callback)return null;
 const result={access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token'),expires_in:Number(hash.get('expires_in')||3600),recovery:hash.get('type')==='recovery',error:hash.has('error')||url.searchParams.has('error')};
 // Clear credentials before any network operation, including failed recovery callbacks.
 for(const key of keys){hash.delete(key);url.searchParams.delete(key)}
 url.hash=hash.toString();
 history.replaceState({},'',url.pathname+url.search+url.hash);
 return result;
}
