import { getValidAccessToken, SUPABASE_KEY, SUPABASE_URL } from './supabase-client';

export type VoltzCertificate={
 id:string;
 code:string;
 displayName:string;
 xpTotal:number;
 completedAt:string;
 createdAt:string;
 revokedAt:string|null;
 emailSentAt:string|null;
 emailStatus:string;
 validationUrl:string;
 certificateUrl:string;
 qrDataUrl:string;
};

export type CertificateIssueResult={created:boolean;certificate:VoltzCertificate;email?:{status:string;alreadySent?:boolean;error?:string}};
export type PublicCertificateValidation={valid:boolean;status:'valid'|'revoked';name:string;course:string;completedLevels:number;totalLevels:number;completedAt:string;code:string};

async function requestCertificate(body:Record<string,unknown>,authenticated:boolean){
 const token=authenticated?await getValidAccessToken():null;
 const response=await fetch(`${SUPABASE_URL}/functions/v1/voltz-certificates`,{
  method:'POST',
  headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},
  body:JSON.stringify(body),
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok){
  const error=new Error(data.error||'Não foi possível carregar o certificado.') as Error&{status?:number;code?:string};
  error.status=response.status;error.code=data.code;throw error;
 }
 return data;
}

export async function loadMyCertificate():Promise<VoltzCertificate|null>{
 const data=await requestCertificate({action:'mine'},true);
 return data.certificate||null;
}

export async function issueMyCertificate():Promise<CertificateIssueResult>{
 return requestCertificate({action:'issue'},true) as Promise<CertificateIssueResult>;
}

export async function validateCertificate(code:string):Promise<PublicCertificateValidation>{
 return requestCertificate({action:'validate',code},false) as Promise<PublicCertificateValidation>;
}
