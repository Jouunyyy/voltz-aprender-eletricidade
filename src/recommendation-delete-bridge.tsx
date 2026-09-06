import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, X } from 'lucide-react';
import './recommendation-delete.css';

type Request=(action:string,input?:Record<string,unknown>)=>Promise<any>;
type Recommendation={id:string;levelId:string;teacher:string;className:string;message?:string|null};
type Pair={node:HTMLElement;recommendation:Recommendation};

function normalise(value:string){return value.replace(/[“”"']/g,'').replace(/\s+/g,' ').trim().toLowerCase()}
function matchRecommendation(node:HTMLElement,recommendations:Recommendation[],used:Set<string>){
 const text=normalise(node.innerText||node.textContent||'');
 const exact=recommendations.find(rec=>!used.has(rec.id)&&text.includes(normalise(rec.teacher))&&text.includes(normalise(rec.className))&&(!rec.message||text.includes(normalise(rec.message))));
 if(exact)return exact;
 return recommendations.find(rec=>!used.has(rec.id)&&text.includes(normalise(rec.teacher))&&text.includes(normalise(rec.className)))||null;
}

export default function RecommendationDeleteBridge({request}:{request:Request}){
 const [recommendations,setRecommendations]=useState<Recommendation[]>([]);
 const [nodes,setNodes]=useState<HTMLElement[]>([]);
 const [pending,setPending]=useState<Pair|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [hidden,setHidden]=useState<Set<string>>(()=>new Set());

 const load=async()=>{try{const data=await request('student_context');setRecommendations(Array.isArray(data?.recommendations)?data.recommendations:[])}catch{}};
 useEffect(()=>{void load();let frame=0;const scan=()=>{frame=0;const next=[...document.querySelectorAll<HTMLElement>('.student-recommendations article')];setNodes(prev=>prev.length===next.length&&prev.every((node,i)=>node===next[i])?prev:next)};const schedule=()=>{if(!frame)frame=requestAnimationFrame(scan)};scan();const observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true});return()=>{observer.disconnect();if(frame)cancelAnimationFrame(frame)}},[]);

 const pairs=useMemo(()=>{
  const used=new Set<string>();
  return nodes.map(node=>{
   const rec=matchRecommendation(node,recommendations,used);
   if(!rec)return null;
   used.add(rec.id);
   node.dataset.recommendationId=rec.id;
   return {node,recommendation:rec};
  }).filter(Boolean) as Pair[];
 },[nodes,recommendations]);

 useEffect(()=>{pairs.forEach(({node,recommendation})=>node.classList.toggle('recommendation-is-dismissed',hidden.has(recommendation.id)))},[pairs,hidden]);

 const remove=async()=>{
  if(!pending)return;
  setBusy(true);setError('');
  try{
   const id=pending.recommendation.id;
   await request('dismiss_recommendation',{id});
   setHidden(prev=>{const next=new Set(prev);next.add(id);return next});
   setRecommendations(prev=>prev.filter(rec=>rec.id!==id));
   pending.node.classList.add('recommendation-is-dismissed');
   pending.node.setAttribute('aria-hidden','true');
   setPending(null);
   await load();
  }catch(e){setError(e instanceof Error?e.message:'Não foi possível eliminar a recomendação.')}
  finally{setBusy(false)}
 };

 return <>{pairs.filter(pair=>!hidden.has(pair.recommendation.id)).map(pair=>createPortal(<button type="button" className="recommendation-delete-button" onClick={()=>{setError('');setPending(pair)}} aria-label="Eliminar recomendação"><Trash2/><span>Eliminar</span></button>,pair.node))}{pending&&createPortal(<div className="recommendation-delete-backdrop" role="presentation"><section className="recommendation-delete-modal" role="dialog" aria-modal="true" aria-labelledby="recommendation-delete-title"><button className="recommendation-delete-close" onClick={()=>setPending(null)} aria-label="Fechar"><X/></button><span className="recommendation-delete-eyebrow">RECOMENDAÇÃO</span><h2 id="recommendation-delete-title">Eliminar esta recomendação?</h2><p>Vai deixar de aparecer no teu Perfil. O professor mantém o registo no histórico da turma.</p>{error&&<p className="recommendation-delete-error" role="alert">{error}</p>}<div><button className="recommendation-delete-cancel" onClick={()=>setPending(null)} disabled={busy}>Cancelar</button><button className="recommendation-delete-confirm" onClick={()=>void remove()} disabled={busy}><Trash2/>{busy?'A eliminar…':'Eliminar'}</button></div></section></div>,document.body)}</>;
}
