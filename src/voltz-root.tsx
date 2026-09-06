import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { GraduationCap, Shield } from 'lucide-react';
import FullVoltzApp from './full-voltz-app';
import VoltzAdmin from './voltz-admin';
import VoltzTeachers, { StudentClassPanel } from './voltz-teachers';
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
const navClassByLabel:Record<string,string>={'Percurso':'is-nav-percurso','Manual':'is-nav-manual','Aula':'is-nav-hidden','Aula visual':'is-nav-hidden','Desafio':'is-nav-hidden','Voltz Live':'is-nav-live','Perfil':'is-nav-profile'};

export default function VoltzRoot(props:Props){
 const [adminOpen,setAdminOpen]=useState(false);
 const [teacherOpen,setTeacherOpen]=useState(false);
 const [targets,setTargets]=useState<Targets>(emptyTargets);
 const canAdmin=props.role==='admin';
 const canTeacher=props.role==='teacher'||props.role==='admin';
 useEffect(()=>{
  let queued=0;
  const scan=()=>{
   queued=0;
   const sidebar=document.querySelector('.sidebar nav');
   const mobile=document.querySelector('.mobile-nav');
   const profileHero=document.querySelector('.profile-hero');
   const profilePage=document.querySelector('.profile-page');
   const versionBadge=document.querySelector<HTMLElement>('.version-badge');
   if(versionBadge)versionBadge.textContent='v3.2 · Voltz atualizado';
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

 const openTeachers=()=>{setAdminOpen(false);setTeacherOpen(true)};
 const openAdmin=()=>{setTeacherOpen(false);setAdminOpen(true)};
 const closeRoleArea=()=>{setAdminOpen(false);setTeacherOpen(false)};
 const teacherButton=<button className={`nav-item teacher-launcher ${teacherOpen?'active':''}`} onClick={openTeachers} aria-label="Abrir Voltz Professores"><GraduationCap/><span>Professores</span></button>;
 const adminButton=<button className={`nav-item admin-launcher ${adminOpen?'active':''}`} onClick={openAdmin} aria-label="Abrir Voltz Admin"><Shield/><span>Admin</span></button>;
 const navExtras=<>{canTeacher&&teacherButton}{canAdmin&&adminButton}</>;
 const roleBadge=<div className={`role-profile-entry ${canAdmin?'is-admin':'is-teacher'}`}>{canAdmin?<Shield/>:<GraduationCap/>}<div><strong>{canAdmin?'Administrador Voltz':'Professor Voltz'}</strong><span>{canAdmin?'Acesso à gestão operacional e ao Voltz Professores.':'A tua conta tem acesso ao Voltz Professores.'}</span></div>{canTeacher&&<button className="primary-button" onClick={openTeachers}>Abrir Voltz Professores</button>}{canAdmin&&<button className="primary-button admin-profile-button" onClick={openAdmin}>Admin</button>}</div>;
 const reviewLevel=(levelId:string)=>{closeRoleArea();requestAnimationFrame(()=>window.dispatchEvent(new CustomEvent('voltz-open-level',{detail:levelId})))};
 const openLive=()=>{closeRoleArea();requestAnimationFrame(()=>window.dispatchEvent(new CustomEvent('voltz-open-view',{detail:'live'})))};
 const handleBaseNavigation=(event:React.MouseEvent<HTMLDivElement>)=>{
  if(!adminOpen&&!teacherOpen)return;
  const button=(event.target as Element).closest<HTMLButtonElement>('.sidebar .nav-item,.mobile-nav .nav-item');
  const label=button?.querySelector('span')?.textContent?.trim();
  if(label==='Percurso'||label==='Manual'||label==='Voltz Live'||label==='Perfil')closeRoleArea();
 };
 const roleOpen=adminOpen||teacherOpen;

 return <>
  <div className={`voltz-app-host ${roleOpen?'has-role-area':''}`} onClickCapture={handleBaseNavigation}>
   <FullVoltzApp user={props.user} loadRemote={props.loadRemote} saveRemote={props.saveRemote} emailConsent={props.emailConsent} emailPreferencesReady={props.emailPreferencesReady} onEmailConsent={props.onEmailConsent} onSendEmailTests={props.onSendEmailTests} onSignOut={props.onSignOut}/>
  </div>
  {targets.sidebar&&createPortal(navExtras,targets.sidebar)}
  {targets.mobile&&createPortal(navExtras,targets.mobile)}
  {!roleOpen&&canTeacher&&targets.profileHero&&createPortal(roleBadge,targets.profileHero)}
  {!roleOpen&&targets.profilePage&&createPortal(<StudentClassPanel request={teacherRequest} onReview={levelId=>{reviewLevel(levelId)}}/>,targets.profilePage)}
  {teacherOpen&&canTeacher&&<div className="role-area"><VoltzTeachers request={teacherRequest} onExit={closeRoleArea} onOpenLive={openLive}/></div>}
  {adminOpen&&canAdmin&&<div className="role-area"><VoltzAdmin request={props.adminRequest} onExit={closeRoleArea}/></div>}
 </>;
}
