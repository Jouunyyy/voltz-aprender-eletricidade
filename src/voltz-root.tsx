import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { GraduationCap, Shield } from 'lucide-react';
import FullVoltzApp from './full-voltz-app';
import VoltzAdmin from './voltz-admin';
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

type Targets={sidebar:Element|null;mobile:Element|null;profile:Element|null};
const emptyTargets:Targets={sidebar:null,mobile:null,profile:null};

export default function VoltzRoot(props:Props){
 const [adminOpen,setAdminOpen]=useState(false);
 const [targets,setTargets]=useState<Targets>(emptyTargets);
 const canAdmin=props.role==='admin';
 const isTeacher=props.role==='teacher';
 useEffect(()=>{
  if(adminOpen)return;
  let queued=0;
  const scan=()=>{
   queued=0;
   const sidebar=document.querySelector('.sidebar nav');
   const mobile=document.querySelector('.mobile-nav');
   const profile=document.querySelector('.profile-hero');
   if(mobile&&canAdmin)mobile.classList.add('admin-seven-items');
   setTargets(prev=>prev.sidebar===sidebar&&prev.mobile===mobile&&prev.profile===profile?prev:{sidebar,mobile,profile});
  };
  const schedule=()=>{if(!queued)queued=requestAnimationFrame(scan)};
  scan();
  const observer=new MutationObserver(schedule);
  observer.observe(document.body,{childList:true,subtree:true});
  return()=>{observer.disconnect();if(queued)cancelAnimationFrame(queued)};
 },[adminOpen,canAdmin]);

 const adminButton=<button className="nav-item admin-launcher" onClick={()=>setAdminOpen(true)} aria-label="Abrir Voltz Admin"><Shield/><span>Admin</span></button>;
 const roleBadge=<div className={`role-profile-entry ${canAdmin?'is-admin':'is-teacher'}`}>{canAdmin?<Shield/>:<GraduationCap/>}<div><strong>{canAdmin?'Administrador Voltz':'Professor Voltz'}</strong><span>{canAdmin?'Acesso à gestão operacional da plataforma.':'Acesso de professor ativo nesta conta.'}</span></div>{canAdmin&&<button className="primary-button" onClick={()=>setAdminOpen(true)}>Abrir Voltz Admin</button>}</div>;

 return <>
  <div className={adminOpen?'voltz-app-host is-admin-hidden':'voltz-app-host'} aria-hidden={adminOpen||undefined}>
   <FullVoltzApp user={props.user} loadRemote={props.loadRemote} saveRemote={props.saveRemote} emailConsent={props.emailConsent} emailPreferencesReady={props.emailPreferencesReady} onEmailConsent={props.onEmailConsent} onSendEmailTests={props.onSendEmailTests} onSignOut={props.onSignOut}/>
  </div>
  {adminOpen&&canAdmin&&<VoltzAdmin request={props.adminRequest} onExit={()=>setAdminOpen(false)}/>} 
  {!adminOpen&&canAdmin&&targets.sidebar&&createPortal(adminButton,targets.sidebar)}
  {!adminOpen&&canAdmin&&targets.mobile&&createPortal(adminButton,targets.mobile)}
  {!adminOpen&&(canAdmin||isTeacher)&&targets.profile&&createPortal(roleBadge,targets.profile)}
 </>;
}
