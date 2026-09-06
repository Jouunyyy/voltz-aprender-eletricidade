import { useEffect, useRef, useState } from 'react';
import { Award, CheckCircle2, Copy, Download, ExternalLink, LockKeyhole, ShieldCheck, XCircle, Zap } from 'lucide-react';
import { loadMyCertificate, validateCertificate, type PublicCertificateValidation as Validation, type VoltzCertificate } from './certificate-api';
import './certificate-system.css';

const asset=(name:string)=>`${import.meta.env.BASE_URL}${name}`;
const formatDate=(value:string)=>new Date(value).toLocaleDateString('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric'});
const appRoot=()=>`${location.origin}${import.meta.env.BASE_URL}`;

type FrameWindow=Window&{renderVoltzCertificate?:(data:Record<string,unknown>)=>void};

export function CertificateFrame({certificate,frameRef}:{certificate:VoltzCertificate;frameRef:React.RefObject<HTMLIFrameElement|null>}){
 const render=()=>{
  const win=frameRef.current?.contentWindow as FrameWindow|null;
  win?.renderVoltzCertificate?.({name:certificate.displayName,xpTotal:certificate.xpTotal,completionDate:formatDate(certificate.completedAt),certificateCode:certificate.code,validationUrl:certificate.validationUrl,qrDataUrl:certificate.qrDataUrl});
 };
 useEffect(()=>{render()},[certificate]);
 return <iframe ref={frameRef} onLoad={render} className="certificate-frame" src={asset('certificate-template.html')} title={`Certificado ${certificate.code}`}/>;
}

export function CertificateProfilePanel({completed,certificate,loading,error,onRetry,onView,onDownload}:{completed:number;certificate:VoltzCertificate|null;loading:boolean;error:string;onRetry:()=>void;onView:(certificate:VoltzCertificate)=>void;onDownload:(certificate:VoltzCertificate)=>void}){
 const [copied,setCopied]=useState(false);
 const copy=async()=>{if(!certificate)return;try{await navigator.clipboard.writeText(certificate.validationUrl);setCopied(true);window.setTimeout(()=>setCopied(false),1600)}catch{setCopied(false)}};
 if(loading)return <section className="certificate-profile-card"><div className="certificate-profile-icon"><Award/></div><div><span className="eyebrow">Certificado Voltz</span><h2>A carregar certificado…</h2><p>A confirmar o estado da tua conclusão.</p></div></section>;
 if(!certificate)return <section className="certificate-profile-card is-locked"><div className="certificate-profile-icon"><LockKeyhole/></div><div className="certificate-profile-main"><span className="eyebrow">🎓 Certificado Voltz</span><h2>Certificado bloqueado</h2><p>Conclui os 50 níveis para desbloquear o teu certificado.</p><div className="certificate-progress"><span style={{width:`${Math.min(100,completed/50*100)}%`}}/><b>{completed}/50 níveis concluídos</b></div>{error&&<div className="certificate-inline-error" role="alert">{error} <button onClick={onRetry}>Tentar novamente</button></div>}</div></section>;
 const revoked=Boolean(certificate.revokedAt);
 return <section className={`certificate-profile-card is-unlocked ${revoked?'is-revoked':''}`}><div className="certificate-profile-icon">{revoked?<XCircle/>:<Award/>}</div><div className="certificate-profile-main"><span className="eyebrow">🎓 Certificado Voltz</span><div className="certificate-title-line"><div><h2>Certificado desbloqueado</h2><p>Percurso Voltz concluído</p></div><span className={`certificate-status ${revoked?'revoked':'valid'}`}>{revoked?'Revogado':'Válido'}</span></div><dl className="certificate-meta"><div><dt>Data</dt><dd>{formatDate(certificate.completedAt)}</dd></div><div><dt>Código</dt><dd>{certificate.code}</dd></div></dl>{error&&<div className="certificate-inline-error" role="alert">{error}</div>}<div className="certificate-actions"><button className="primary-button" onClick={()=>onView(certificate)}><ExternalLink/> Ver certificado</button><button className="ghost-button" onClick={()=>onDownload(certificate)}><Download/> Descarregar PDF</button><button className="ghost-button" onClick={()=>void copy()}><Copy/> {copied?'Link copiado':'Copiar validação'}</button></div></div></section>;
}

export function CompletionCertificateModal({certificate,onView,onContinue,emailWarning}:{certificate:VoltzCertificate;onView:()=>void;onContinue:()=>void;emailWarning?:string}){
 const dialogRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null;
  requestAnimationFrame(()=>dialogRef.current?.querySelector<HTMLButtonElement>('.primary-button')?.focus());
  const key=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();onContinue();return}
   if(event.key!=='Tab'||!dialogRef.current)return;
   const focusables=Array.from(dialogRef.current.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
   if(!focusables.length)return;const first=focusables[0],last=focusables[focusables.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  };
  document.addEventListener('keydown',key);const old=document.body.style.overflow;document.body.style.overflow='hidden';
  return()=>{document.removeEventListener('keydown',key);document.body.style.overflow=old;previous?.focus()};
 },[onContinue]);
 return <div className="certificate-modal-backdrop"><div className="certificate-completion-modal" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="certificate-completion-title"><div className="certificate-celebration"><span aria-hidden="true">⚡</span><img src={asset('faisca-mobile.webp')} alt="Faísca a celebrar a conclusão do Voltz"/></div><span className="eyebrow"><Award/> Percurso concluído</span><h2 id="certificate-completion-title">Parabéns! Concluíste o Voltz ⚡</h2><p>Concluíste os 50 níveis do percurso Voltz — Aprender Eletricidade.</p><p><strong>O teu certificado de conclusão já foi criado.</strong></p><p>Vais recebê-lo também no teu email e ficará sempre disponível no teu Perfil.</p>{emailWarning&&<div className="certificate-email-warning" role="status">{emailWarning} O certificado continua disponível no Perfil.</div>}<div className="certificate-modal-actions"><button className="primary-button" onClick={onView}><Award/> Ver certificado</button><button className="ghost-button" onClick={onContinue}>Continuar</button></div><small>{certificate.code}</small></div></div>;
}

export function CertificateViewer({code,onBack}:{code:string;onBack:()=>void}){
 const [certificate,setCertificate]=useState<VoltzCertificate|null>(null);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 const frameRef=useRef<HTMLIFrameElement>(null);
 useEffect(()=>{let active=true;setLoading(true);loadMyCertificate().then(value=>{if(!active)return;if(!value||value.code!==code){setError('Certificado não encontrado para esta conta.');setCertificate(null)}else setCertificate(value)}).catch(err=>{if(active)setError(err instanceof Error?err.message:'Erro ao carregar certificado.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[code]);
 const print=()=>{const win=frameRef.current?.contentWindow;if(!win){setError('PDF indisponível neste momento.');return}try{win.focus();win.print()}catch{setError('Não foi possível abrir a impressão/PDF neste dispositivo.')}};
 return <main className="certificate-viewer-page"><header className="certificate-viewer-head"><button className="ghost-button" onClick={onBack}>← Voltar ao Voltz</button><div><span className="eyebrow"><Award/> Certificado Voltz</span><strong>{code}</strong></div>{certificate&&<button className="primary-button" onClick={print}><Download/> Descarregar PDF</button>}</header>{error&&<div className="certificate-page-error" role="alert">{error}</div>}{loading&&<div className="certificate-page-loading"><Zap/><strong>A carregar o certificado…</strong></div>}{certificate&&<CertificateFrame certificate={certificate} frameRef={frameRef}/>}</main>;
}

export function PublicCertificateValidation({code}:{code:string}){
 const [data,setData]=useState<Validation|null>(null);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;validateCertificate(code).then(value=>{if(active)setData(value)}).catch(()=>{if(active)setError('Certificado não encontrado.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[code]);
 return <main className="certificate-validation-page"><section className="certificate-validation-card"><div className="validation-brand"><span><Zap fill="currentColor"/></span><strong>Voltz</strong></div>{loading?<div className="certificate-page-loading"><Zap/><strong>A validar certificado…</strong></div>:error?<><div className="validation-state invalid"><XCircle/><h1>Certificado não encontrado</h1></div><p>Confirma o código ou lê novamente o QR Code do certificado.</p></>:data&&<><div className={`validation-state ${data.valid?'valid':'invalid'}`}>{data.valid?<CheckCircle2/>:<XCircle/>}<h1>{data.valid?'Certificado válido':'Certificado revogado'}</h1></div><dl className="validation-details"><div><dt>Nome</dt><dd>{data.name}</dd></div><div><dt>Percurso</dt><dd>{data.course}</dd></div><div><dt>Níveis concluídos</dt><dd>{data.completedLevels}/{data.totalLevels}</dd></div><div><dt>Data de conclusão</dt><dd>{formatDate(data.completedAt)}</dd></div><div><dt>Código</dt><dd>{data.code}</dd></div><div><dt>Estado</dt><dd>{data.valid?'Válido':'Revogado'}</dd></div></dl><p className="validation-privacy"><ShieldCheck/> Esta página mostra apenas os dados públicos necessários à validação.</p></>}<button className="ghost-button validation-back" onClick={()=>{location.href=appRoot()}}>Abrir Voltz</button></section></main>;
}
