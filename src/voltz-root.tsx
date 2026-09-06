import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CirclePlay, GraduationCap, Shield } from 'lucide-react';
import FullVoltzApp from './full-voltz-app';
import VoltzAdmin from './voltz-admin';
import VoltzTeachers, { StudentClassPanel } from './voltz-teachers';
import VoltzVideoaulas from './voltz-videoaulas';
import ExperienceRatingPreview from './experience-rating-preview';
import AdminRatings from './admin-ratings';
import { CertificateProfilePanel, CertificateViewer, CompletionCertificateModal } from './certificate-system';
import { issueMyCertificate, loadMyCertificate, type VoltzCertificate } from './certificate-api';
import { categories } from './curriculum';
import { teacherRequest } from './teacher-api';
import './voltz-role.css';

export type VoltzRole='user'|'teacher'|'admin';
type User={id:string;name:string;email:string;avatar?:string};
type Data={xp:number;level:number;streak:number;completedLessons:string[]};
type Props={
 user:User;
 role:VoltzRole;
 loadRemote:()=>Promise<Data|null>;
 saveRemote:(data:Data)=>Promise<void>;
 emailConsent:boolean;
 emailPreferencesReady:boolean;
 onEmailConsent:(consent:boolean)=>Promise<void>;
 onSendEmailTests:()=>Promise<{sent:number;to:string}>;
 onSignOut:()=>void;
 adminRequest:(action:string,input?:Record<string,unknown>)=>Promise<any>;
};

type Targets={sidebar:Element|null;mobile:Element|null;profileHero:Element|null;profilePage:Element|null};
const emptyTargets:Targets={sidebar:null,mobile:null,profileHero:null,profilePage:null};
const navClassByLabel:Record<string,string>={'Percurso':'is-nav-percurso','Manual':'is-nav-manual','Aula':'is-nav-hidden','Aula visual':'is-nav-hidden','Videoaulas':'is-nav-video','Desafio':'is-nav-hidden','Voltz Live':'is-nav-live','Perfil':'is-nav-profile'};
const scrollToVoltzTop=()=>{
 window.scrollTo({top:0,left:0,behavior:'auto'});
 document.querySelector<HTMLElement>('.main')?.scrollTo({top:0,left:0,behavior:'auto'});
 document.querySelector<HTMLElement>('.role-area')?.scrollTo({top:0,left:0,behavior:'auto'});
};
const completedLevels=(data:Data|null)=>data?.completedLessons.filter(item=>item.startsWith('course-')).length||0;
const qualifiesForCertificate=(data:Data|null)=>Boolean(data?.completedLessons.includes('manual-iniciacao')&&completedLevels(data)===50);

export default function VoltzRoot(props:Props){
 const [adminOpen,setAdminOpen]=useState(false);
 const [teacherOpen,setTeacherOpen]=useState(false);
 const [videoOpen,setVideoOpen]=useState(false);
 const [targets,setTargets]=useState<Targets>(emptyTargets);
 const [progressSnapshot,setProgressSnapshot]=useState<Data|null>(null);
 const [certificate,setCertificate]=useState<VoltzCertificate|null>(null);
 const [certificateLoading,setCertificateLoading]=useState(true);
 const [certificateError,setCertificateError]=useState('');
 const [newCertificate,setNewCertificate]=useState<VoltzCertificate|null>(null);
 const [certificateEmailWarning,setCertificateEmailWarning]=useState('');
 const [certificateViewCode,setCertificateViewCode]=useState<string|null>(()=>new URLSearchParams(location.search).get('certificate'));
 const issueInFlight=useRef<Promise<void>|null>(null);
 const canAdmin=props.role==='admin';
 const canTeacher=props.role==='teacher'||props.role==='admin';

 const refreshCertificate=async()=>{
  setCertificateLoading(true);setCertificateError('');
  try{const next=await loadMyCertificate();setCertificate(next)}
  catch(error){setCertificateError(error instanceof Error?error.message:'Erro ao carregar certificado.')}
  finally{setCertificateLoading(false)}
 };
 const maybeIssueCertificate=(data:Data|null)=>{
  if(!qualifiesForCertificate(data))return Promise.resolve();
  if(issueInFlight.current)return issueInFlight.current;
  const task=issueMyCertificate().then(result=>{
   setCertificate(result.certificate);setCertificateLoading(false);setCertificateError('');
   if(result.email?.status==='failed')setCertificateEmailWarning(result.email.error||'O email do certificado não foi enviado.');
   if(result.created)setNewCertificate(result.certificate);
  }).catch(error=>{
   const message=error instanceof Error?error.message:'Erro ao gerar certificado.';
   setCertificateError(message);setCertificateLoading(false);
  }).finally(()=>{issueInFlight.current=null});
  issueInFlight.current=task;return task;
 };
 const loadRemote=async()=>{
  const data=await props.loadRemote();
  if(data){setProgressSnapshot(data);void maybeIssueCertificate(data)}
  return data;
 };
 const saveRemote=async(data:Data)=>{
  await props.saveRemote(data);
  setProgressSnapshot(data);
  await maybeIssueCertificate(data);
 };

 useEffect(()=>{void refreshCertificate()},[props.user.id]);
 useEffect(()=>{
  let queued=0;
  const scan=()=>{
   queued=0;
   const sidebar=document.querySelector('.sidebar nav');
   const mobile=document.querySelector('.mobile-nav');
   const profileHero=document.querySelector('.profile-hero');
   const profilePage=document.querySelector('.profile-page');
   const versionBadge=document.querySelector<HTMLElement>('.version-badge');
   if(versionBadge)versionBadge.textContent='v3.4 · Certificados';
   document.querySelectorAll<HTMLButtonElement>('.sidebar nav>.nav-item,.mobile-nav>.nav-item').forEach(item=>{
    const label=item.querySelector('span')?.textContent?.trim()||'';
    Object.values(navClassByLabel).forEach(className=>item.classList.remove(className));
    const className=navClassByLabel[label];if(className)item.classList.add(className);
   });
   if(mobile){mobile.classList.toggle('has-teacher-nav',canTeacher);mobile.classList.toggle('has-admin-nav',canAdmin)}
   setTargets(prev=>prev.sidebar===sidebar&&prev.mobile===mobile&&prev.profileHero===profileHero&&prev.profilePage===profilePage?prev:{sidebar,mobile,profileHero,profilePage});
  };
  const schedule=()=>{if(!queued)queued=requestAnimationFrame(scan)};
  scan();
  const observer=new MutationObserver(schedule);
  observer.observe(document.getElementById('root')||document.body,{childList:true,subtree:true});
  return()=>{observer.disconnect();if(queued)cancelAnimationFrame(queued)};
 },[canTeacher,canAdmin]);
 useEffect(()=>{
  let current='';
  const detect=()=>{
   const page=document.querySelector<HTMLElement>('.voltz-app-host .main>.page');
   const next=page?.className||'';
   if(current&&next&&next!==current)requestAnimationFrame(scrollToVoltzTop);
   current=next;
  };
  detect();
  const main=document.querySelector('.voltz-app-host .main');
  if(!main)return;
  const observer=new MutationObserver(detect);
  observer.observe(main,{childList:true,subtree:false});
  return()=>observer.disconnect();
 },[]);

 const closeRoleArea=()=>{setAdminOpen(false);setTeacherOpen(false);setVideoOpen(false);requestAnimationFrame(scrollToVoltzTop)};
 const openTeachers=()=>{setAdminOpen(false);setVideoOpen(false);setTeacherOpen(true);requestAnimationFrame(scrollToVoltzTop)};
 const openAdmin=()=>{setTeacherOpen(false);setVideoOpen(false);setAdminOpen(true);requestAnimationFrame(scrollToVoltzTop)};
 const openVideos=()=>{setTeacherOpen(false);setAdminOpen(false);setVideoOpen(true);requestAnimationFrame(scrollToVoltzTop)};
 const teacherButton=<button className={`nav-item teacher-launcher ${teacherOpen?'active':''}`} onClick={openTeachers} aria-label="Abrir Voltz Professores"><GraduationCap/><span>Professores</span></button>;
 const adminButton=<button className={`nav-item admin-launcher ${adminOpen?'active':''}`} onClick={openAdmin} aria-label="Abrir Voltz Admin"><Shield/><span>Admin</span></button>;
 const videoButton=<button className={`nav-item video-launcher ${videoOpen?'active':''}`} onClick={openVideos} aria-label="Abrir Videoaulas"><CirclePlay/><span>Videoaulas</span></button>;
 const navExtras=<>{videoButton}{canTeacher&&teacherButton}{canAdmin&&adminButton}</>;
 const roleBadge=<div className={`role-profile-entry ${canAdmin?'is-admin':'is-teacher'}`}>{canAdmin?<Shield/>:<GraduationCap/>}<div><strong>{canAdmin?'Administrador Voltz':'Professor Voltz'}</strong><span>{canAdmin?'Acesso à gestão operacional e ao Voltz Professores.':'A tua conta tem acesso ao Voltz Professores.'}</span></div>{canTeacher&&<button className="primary-button" onClick={openTeachers}>Abrir Voltz Professores</button>}{canAdmin&&<button className="primary-button admin-profile-button" onClick={openAdmin}>Admin</button>}</div>;
 const openBaseView=(label:string)=>{const button=Array.from(document.querySelectorAll<HTMLButtonElement>('.sidebar .nav-item')).find(item=>item.querySelector('span')?.textContent?.trim()===label);button?.click();requestAnimationFrame(scrollToVoltzTop)};
 const openCourseTarget=(levelId:string,challenge=false)=>{
  const categoryIndex=categories.findIndex(category=>category.levels.some(level=>level.id===levelId));
  const levelIndex=categoryIndex>=0?categories[categoryIndex].levels.findIndex(level=>level.id===levelId):-1;
  closeRoleArea();
  requestAnimationFrame(()=>{
   openBaseView('Percurso');
   requestAnimationFrame(()=>{
    const tabs=document.querySelectorAll<HTMLButtonElement>('.category-tabs button');
    tabs[categoryIndex]?.click();
    requestAnimationFrame(()=>{
     const cards=document.querySelectorAll<HTMLButtonElement>('.level-grid .level-card');
     const card=cards[levelIndex];
     if(!card||card.disabled){card?.focus();return}
     card.click();
     requestAnimationFrame(scrollToVoltzTop);
     if(challenge)requestAnimationFrame(()=>openBaseView('Desafio'));
    });
   });
  });
 };
 const reviewLevel=(levelId:string)=>openCourseTarget(levelId,false);
 const openLive=()=>{closeRoleArea();requestAnimationFrame(()=>openBaseView('Voltz Live'))};
 const handleBaseNavigation=(event:React.MouseEvent<HTMLDivElement>)=>{
  const button=(event.target as Element).closest<HTMLButtonElement>('.sidebar .nav-item,.mobile-nav .nav-item');
  if(button)requestAnimationFrame(scrollToVoltzTop);
  if(!adminOpen&&!teacherOpen&&!videoOpen)return;
  const label=button?.querySelector('span')?.textContent?.trim();
  if(label==='Percurso'||label==='Manual'||label==='Voltz Live'||label==='Perfil')closeRoleArea();
 };
 const showCertificate=(item:VoltzCertificate)=>{
  const url=new URL(location.href);url.searchParams.delete('certificado');url.searchParams.delete('print');url.searchParams.set('certificate',item.code);history.pushState({},'',url);setCertificateViewCode(item.code);window.scrollTo({top:0,left:0,behavior:'auto'});
 };
 const downloadCertificate=(item:VoltzCertificate)=>{
  const url=new URL(`${location.origin}${import.meta.env.BASE_URL}`);url.searchParams.set('certificate',item.code);url.searchParams.set('print','1');window.open(url.toString(),'_blank','noopener,noreferrer');
 };
 const closeCertificateViewer=()=>{const url=new URL(location.href);url.searchParams.delete('certificate');url.searchParams.delete('print');history.replaceState({},'',url);setCertificateViewCode(null);requestAnimationFrame(scrollToVoltzTop)};
 const retryCertificate=()=>{if(qualifiesForCertificate(progressSnapshot))void maybeIssueCertificate(progressSnapshot);else void refreshCertificate()};
 const continueAfterCertificate=()=>{setNewCertificate(null);setCertificateEmailWarning('');requestAnimationFrame(()=>openBaseView('Percurso'))};
 const roleOpen=adminOpen||teacherOpen||videoOpen;

 if(certificateViewCode)return <CertificateViewer code={certificateViewCode} onBack={closeCertificateViewer} autoPrint={new URLSearchParams(location.search).get('print')==='1'}/>;

 return <>
  <div className={`voltz-app-host ${roleOpen?'has-role-area':''}`} onClickCapture={handleBaseNavigation}>
   <FullVoltzApp user={props.user} loadRemote={loadRemote} saveRemote={saveRemote} emailConsent={props.emailConsent} emailPreferencesReady={props.emailPreferencesReady} onEmailConsent={props.onEmailConsent} onSendEmailTests={props.onSendEmailTests} onSignOut={props.onSignOut}/>
  </div>
  {targets.sidebar&&createPortal(navExtras,targets.sidebar)}
  {targets.mobile&&createPortal(navExtras,targets.mobile)}
  {!roleOpen&&canTeacher&&targets.profileHero&&createPortal(roleBadge,targets.profileHero)}
  {!roleOpen&&targets.profilePage&&createPortal(<CertificateProfilePanel completed={completedLevels(progressSnapshot)} certificate={certificate} loading={certificateLoading} error={certificateError} onRetry={retryCertificate} onView={showCertificate} onDownload={downloadCertificate}/>,targets.profilePage)}
  {!roleOpen&&targets.profilePage&&createPortal(<StudentClassPanel request={teacherRequest} onReview={reviewLevel}/>,targets.profilePage)}
  {videoOpen&&<div className="role-area video-role-area"><VoltzVideoaulas user={props.user} onExit={closeRoleArea} onOpenLevel={levelId=>openCourseTarget(levelId,false)} onChallenge={levelId=>openCourseTarget(levelId,true)}/></div>}
  {teacherOpen&&canTeacher&&<div className="role-area"><VoltzTeachers request={teacherRequest} onExit={closeRoleArea} onOpenLive={openLive}/></div>}
  {adminOpen&&canAdmin&&<div className="role-area"><VoltzAdmin request={props.adminRequest} onExit={closeRoleArea}/></div>}
  <AdminRatings request={props.adminRequest} visible={adminOpen&&canAdmin}/>
  <ExperienceRatingPreview userId={props.user.id} previewMode={false}/>
  {newCertificate&&<CompletionCertificateModal certificate={newCertificate} emailWarning={certificateEmailWarning} onView={()=>{setNewCertificate(null);showCertificate(newCertificate)}} onContinue={continueAfterCertificate}/>} 
 </>;
}
