import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Zap, Plug, Lightbulb, Battery, Gauge, Trophy, Users, ArrowRight, Copy, LogOut, Radio } from 'lucide-react';
import { categories, type Check } from './curriculum';
import { liveRequest, liveUrl, setLiveUrl, type LiveConfig, type LiveResponse, type LiveRoom, type LiveState } from './live-api';
import QRCode from '../vendor/qr-code.js';
import './voltz-live.css';

const icons=[Zap,Plug,Lightbulb,Battery,Gauge];
const defaults:LiveConfig={categoryId:'aprendiz',levelId:null,count:10,duration:30,showExplanations:true,showLeaderboard:true};
const isLiveState=(value:unknown):value is LiveState=>Boolean(value&&typeof value==='object'&&!Array.isArray(value)&&'id' in value);
const phaseLabel=(phase:LiveRoom['phase'])=>phase==='lobby'?'Sala de espera':phase==='question'?'Pergunta em curso':phase==='reveal'?'Resposta revelada':'Classificação';
const roomDate=(value:string)=>{const date=new Date(value);return Number.isNaN(date.getTime())?'Data indisponível':`${date.toLocaleDateString('pt-PT')} · ${date.toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'})}`};

function QR({url}:{url:string}){
 try{
  const qr=new QRCode(-1,1);
  qr.addData(url);
  qr.make();
  const size=qr.getModuleCount();
  let path='';
  for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(qr.isDark(y,x))path+=`M${x+4},${y+4}h1v1h-1z`;
  return <svg className="live-qr" role="img" aria-label="QR Code para entrar na sessão" viewBox={`0 0 ${size+8} ${size+8}`} shapeRendering="crispEdges"><title>{url}</title><rect width={size+8} height={size+8} fill="white"/><path d={path} fill="#10213d"/></svg>;
 }catch(error){
  console.error('Voltz Live QR error',error);
  return <div className="live-qr live-qr-fallback" role="status"><Zap/><strong>QR indisponível</strong><span>Usa o código ou o link abaixo.</span></div>;
 }
}

export default function VoltzLive({user,onExit,renderVisual}:{user:{id:string;name:string};onExit:(target?:string)=>void;renderVisual:(kind:NonNullable<Check['visual']>)=>ReactNode}){
 const [screen,setScreen]=useState<'home'|'create'|'join'|'rooms'>('home');
 const [config,setConfig]=useState<LiveConfig>(defaults);
 const [code,setCode]=useState('');
 const [state,setState]=useState<LiveState|null>(null);
 const [rooms,setRooms]=useState<LiveRoom[]>([]);
 const [roomToEnd,setRoomToEnd]=useState<LiveRoom|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [confirm,setConfirm]=useState<string|null>(null);
 const [now,setNow]=useState(Date.now());
 const locked=useRef(false),alive=useRef(true),offset=useRef(0),latest=useRef(0),current=useRef<LiveState|null>(null);
 const controls=useRef<HTMLButtonElement>(null);
 const host=state?.hostId===user.id;
 const storageKey=`voltz-live-${user.id}`;

 function receive(next:unknown){
  if(!alive.current||!isLiveState(next)||!next.id||!next.code||!next.config)return;
  const stamp=Date.parse(next.serverNow);
  if(Number.isFinite(stamp)){
   if(stamp<latest.current)return;
   latest.current=stamp;
   offset.current=stamp-Date.now();
  }
  current.current=next;
  setState(next);
  setConfig(next.config);
  setLiveUrl(next.code);
  try{sessionStorage.setItem(storageKey,JSON.stringify({id:next.id,code:next.code}))}catch{}
 }

 async function act(action:string,input:Record<string,unknown>={}){
  if(locked.current)return;
  locked.current=true;
  setBusy(true);
  setError('');
  try{
   const next=await liveRequest(action,{id:current.current?.id,position:current.current?.position,phase:current.current?.phase,...input});
   receive(next);
   return next;
  }catch(e){
   if(alive.current)setError(e instanceof Error?e.message:'Não foi possível ligar ao Live.');
  }finally{
   locked.current=false;
   if(alive.current)setBusy(false);
  }
 }

 function clear(){
  current.current=null;
  setState(null);
  latest.current=0;
  offset.current=0;
  try{sessionStorage.removeItem(storageKey)}catch{}
  setLiveUrl();
 }

 async function loadRooms(){
  if(locked.current)return;
  locked.current=true;
  setBusy(true);
  setError('');
  setScreen('rooms');
  try{
   const list=await liveRequest<LiveRoom[]>('list');
   if(!Array.isArray(list))throw new Error('Não foi possível carregar as tuas salas.');
   if(alive.current)setRooms(list);
  }catch(e){if(alive.current)setError(e instanceof Error?e.message:'Não foi possível carregar as tuas salas.');}
  finally{locked.current=false;if(alive.current)setBusy(false)}
 }

 async function openRoom(room:LiveRoom){
  if(locked.current)return;
  let refreshRooms=false;
  locked.current=true;setBusy(true);setError('');
  try{const next=await liveRequest<LiveState>('state',{id:room.id});receive(next)}
  catch(e){if(alive.current){setError(e instanceof Error?e.message:'Não foi possível reabrir a sala.');refreshRooms=true}}
  finally{locked.current=false;if(alive.current)setBusy(false)}
  if(refreshRooms&&alive.current)await loadRooms();
 }

 async function endRoom(room:LiveRoom){
  if(locked.current)return;
  locked.current=true;setBusy(true);setError('');
  try{
   await liveRequest<LiveState>('end',{id:room.id});
   setRoomToEnd(null);
   const list=await liveRequest<LiveRoom[]>('list');
   if(alive.current)setRooms(Array.isArray(list)?list:[]);
  }catch(e){if(alive.current)setError(e instanceof Error?e.message:'Não foi possível terminar a sala.');}
  finally{locked.current=false;if(alive.current)setBusy(false)}
 }

 async function leave(target='percurso'){
  const s=current.current;
  if(s){
   const result=await act(s.hostId===user.id&&s.phase!=='finished'?'end':'leave');
   if(!result)return;
  }
  clear();
  setConfirm(null);
  onExit(target);
 }

 useEffect(()=>{
  alive.current=true;
  const urlCode=new URLSearchParams(location.search).get('live');
  let saved:{id:string;code:string}|null=null;
  try{saved=JSON.parse(sessionStorage.getItem(storageKey)||'null')}catch{}

  async function restore(){
   if(!urlCode)return;
   if(!/^\d{6}$/.test(urlCode)){
    setLiveUrl();
    setScreen('join');
    setError('O link do Voltz Live não contém um código válido de 6 dígitos.');
    return;
   }
   setCode(urlCode);
   setBusy(true);
   setError('');
   try{
    let next:LiveResponse;
    if(saved?.id&&saved.code===urlCode){
     try{next=await liveRequest('state',{id:saved.id})}
     catch{
      try{sessionStorage.removeItem(storageKey)}catch{}
      next=await liveRequest('join',{code:urlCode});
     }
    }else next=await liveRequest('join',{code:urlCode});
    receive(next);
   }catch(e){
    if(alive.current){setScreen('join');setError(e instanceof Error?e.message:'Não foi possível entrar nesta sessão.');}
   }finally{if(alive.current)setBusy(false)}
  }
  void restore();

  const exit=(event:Event)=>{
   const target=(event as CustomEvent<string>).detail||'percurso';
   const s=current.current;
   if(s&&s.phase!=='finished'&&s.hostId===user.id)setConfirm(target);else void leave(target);
  };
  window.addEventListener('voltz-live-exit',exit);
  const timer=window.setInterval(()=>setNow(Date.now()+offset.current),250);
  return()=>{alive.current=false;window.clearInterval(timer);window.removeEventListener('voltz-live-exit',exit)};
 },[]);

 useEffect(()=>{
  if(!state?.id||state.phase==='finished')return;
  let stopped=false;
  let timer:number;
  async function poll(){
   if(!stopped&&!locked.current){
    try{
     const next=await liveRequest('state',{id:state!.id});
     if(!stopped&&current.current?.id===state!.id&&isLiveState(next)){receive(next);setError('')}
    }catch(e){if(!stopped)setError(e instanceof Error?e.message:'Ligação interrompida. A tentar novamente…')}
   }
   if(!stopped)timer=window.setTimeout(poll,1200);
  }
  timer=window.setTimeout(poll,1200);
  return()=>{stopped=true;window.clearTimeout(timer)};
 },[state?.id,state?.phase]);

 useEffect(()=>{if(confirm||roomToEnd)controls.current?.focus()},[confirm,roomToEnd]);

 const category=categories.find(c=>c.id===config.categoryId)||categories[0];
 const limit=config.levelId?10:20;
 const remaining=state?.phase==='question'&&state.config.duration>0&&state.startedAt?Math.max(0,Math.ceil(state.config.duration-(now-Date.parse(state.startedAt))/1000)):null;
 const me=state?.participants.find(p=>p.id===user.id);
 const place=state?state.participants.findIndex(p=>p.id===user.id)+1:0;
 const correctText=state?.question&&typeof state.question.answer==='number'?state.question.options[state.question.answer]:'';

 async function copy(){
  if(!state)return;
  const url=liveUrl(state.code);
  try{
   if(!navigator.clipboard?.writeText)throw new Error('clipboard unavailable');
   await navigator.clipboard.writeText(url);
   setNotice('Link copiado.');
  }catch{setNotice('Seleciona e copia o link apresentado abaixo.')}
 }

 const ranking=(final=false)=><section className="live-panel"><h2><Trophy/> {final?'Resultados finais':'Classificação'}</h2><ol className="live-ranking">{state!.participants.slice(0,final?100:5).map((p,i)=><li key={p.id} className={p.id===user.id?'is-me':''}><span>{i<3?['🥇','🥈','🥉'][i]:`${i+1}.`}</span><strong>{p.name}{p.id===user.id?' (tu)':''}</strong><b>{Number(p.score||0).toLocaleString('pt-PT')} <small>pts</small></b></li>)}</ol><p>Estás em <strong>{Math.max(place,1)}.º</strong> · {me?.score||0} pontos</p></section>;

 return <div className="page live-page"><header className="live-heading"><div><span className="eyebrow"><Radio/> Aprende em conjunto</span><h1><Zap fill="currentColor"/> Voltz Live</h1></div><button className="ghost-button" onClick={()=>{if(host&&state?.phase!=='finished')setConfirm('percurso');else void leave()}}><LogOut/> {state?'Sair do Live':'Voltar ao Voltz'}</button></header>
 {error&&<div role="alert" className="live-error">{error} {!state&&<><button onClick={()=>void loadRooms()}>As minhas salas</button><button onClick={()=>{setError('');setScreen('join');setLiveUrl()}}>Introduzir código</button></>}</div>}
 {notice&&<p role="status">{notice}</p>}
 {!state&&screen==='home'&&<><section className="live-hero"><span className="live-pill">O conhecimento liga-nos</span><h2>Uma sala.<br/>Muitas faíscas.</h2><p>Joga ao vivo com amigos, colegas ou com a tua turma.</p><p>Perguntas do Voltz, respostas no teu dispositivo e explicações para aprender em conjunto.</p></section><div className="live-actions"><button disabled={busy} className="live-choice" onClick={()=>setScreen('create')}><Zap/><strong>Criar um Live</strong><span>Escolhe o conteúdo e convida o teu grupo.</span><ArrowRight/></button><button disabled={busy} className="live-choice" onClick={()=>setScreen('join')}><Users/><strong>Entrar num Live</strong><span>Tens um código? A tua sala está à espera.</span><ArrowRight/></button><button disabled={busy} className="live-choice live-choice-wide" onClick={()=>void loadRooms()}><Radio/><strong>As minhas salas</strong><span>Reabre ou termina Lives que ainda tens ativos.</span><ArrowRight/></button></div></>}
 {!state&&screen==='rooms'&&<section className="live-panel"><h2><Radio/> As minhas salas</h2>{busy&&rooms.length===0?<p>A carregar salas…</p>:rooms.length===0?<><p>Não tens nenhum Voltz Live ativo.</p><button className="primary-button" onClick={()=>setScreen('create')}>Criar um Live</button></>:<div className="live-room-list">{rooms.map(room=><article className="live-room-card" key={room.id}><div><span className="live-room-phase">{phaseLabel(room.phase)}</span><strong className="live-room-code">{room.code.slice(0,3)} {room.code.slice(3)}</strong><p>{room.categoryName} · {room.total} perguntas · {room.participants} participante{room.participants===1?'':'s'}</p><small>{roomDate(room.createdAt)}</small></div><div className="live-room-actions"><button className="primary-button" disabled={busy} onClick={()=>void openRoom(room)}>Reabrir</button><button className="danger-button" disabled={busy} onClick={()=>setRoomToEnd(room)}>Terminar</button></div></article>)}</div>}<button className="ghost-button" onClick={()=>setScreen('home')}>Voltar</button></section>}
 {!state&&screen==='join'&&<form className="live-panel live-form" onSubmit={e=>{e.preventDefault();void act('join',{code})}}><h2>Entrar num Live</h2><label>Código da sessão<input className="live-code-input" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="482193" required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))}/></label><p>Vais entrar como <strong>{user.name}</strong>.</p><button className="primary-button" disabled={busy||code.length!==6}>{busy?'A entrar…':'Entrar na sala'}</button><button type="button" className="ghost-button" onClick={()=>setScreen('home')}>Voltar</button></form>}
 {!state&&screen==='create'&&<form className="live-panel live-form" onSubmit={e=>{e.preventDefault();void act('create',{config})}}><h2>Escolhe o conteúdo</h2><div className="live-fields"><label>Categoria<select value={config.categoryId} onChange={e=>setConfig({...config,categoryId:e.target.value,levelId:null})}>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Nível<select value={config.levelId||''} onChange={e=>setConfig({...config,levelId:e.target.value||null,count:e.target.value?Math.min(config.count,10):config.count})}><option value="">Todos os níveis da categoria</option>{category.levels.map(l=><option key={l.id} value={l.id}>{l.title}</option>)}</select></label><label>Número de perguntas<select value={config.count} onChange={e=>setConfig({...config,count:Number(e.target.value)})}>{[5,10,15,20].map(n=><option key={n} disabled={n>limit} value={n}>{n}{n>limit?' — escolhe todos os níveis':''}</option>)}</select></label><label>Tempo por pergunta<select value={config.duration} onChange={e=>setConfig({...config,duration:Number(e.target.value)})}>{[0,20,30,45,60].map(n=><option key={n} value={n}>{n?`${n} segundos`:'Sem limite'}</option>)}</select></label></div><label className="live-check"><input type="checkbox" checked={config.showLeaderboard} onChange={e=>setConfig({...config,showLeaderboard:e.target.checked})}/>Mostrar classificação entre perguntas</label><label className="live-check"><input type="checkbox" checked={config.showExplanations} onChange={e=>setConfig({...config,showExplanations:e.target.checked})}/>Mostrar explicação depois de cada pergunta</label><p>Também jogas como anfitrião. Acertar vale 1000 pontos; rapidez acrescenta até 250.</p><button className="primary-button" disabled={busy}>{busy?'A criar…':'Criar Voltz Live'}</button><button className="ghost-button" type="button" onClick={()=>setScreen('home')}>Voltar</button></form>}
 {state?.phase==='lobby'&&<div className="live-lobby"><section className="live-invite"><span>Código da sessão</span><strong className="live-code">{state.code.slice(0,3)} {state.code.slice(3)}</strong><QR url={liveUrl(state.code)}/><h2>Lê o QR Code para entrar</h2><p>Ou abre o Voltz Live e introduz o código.</p><button className="ghost-button" onClick={()=>void copy()}><Copy/> Copiar link</button><a className="live-url" href={liveUrl(state.code)}>{liveUrl(state.code)}</a></section><section className="live-panel"><h2><Users/> {state.participants.filter(p=>p.online).length} participantes ligados</h2><ul className="live-people" aria-live="polite">{state.participants.map(p=><li key={p.id}><span className={p.online?'live-online':'live-offline'}/><strong>{p.name}</strong><small>{p.id===state.hostId?'Anfitrião':p.online?'Na sala':'Ausente'}</small></li>)}</ul><p>{state.config.categoryName||category.name} · {state.total} perguntas · {state.config.duration?`${state.config.duration} s`:'Sem limite'}</p>{host?<button className="primary-button" disabled={busy||!state.participants.some(p=>!p.departed)} onClick={()=>void act('start')}>Começar desafio <ArrowRight/></button>:<p role="status">Aguarda que o anfitrião comece o desafio.</p>}</section></div>}
 {state&&['question','reveal'].includes(state.phase)&&state.question&&<><div className="live-question-meta"><span>{state.config.categoryName||category.name} · {state.question.levelTitle}</span><b>Pergunta {state.position+1} de {state.total}</b>{state.phase==='question'&&<strong className="live-timer" role="timer" aria-label="Tempo restante">{state.config.duration===0?'Sem limite':remaining===null?'A iniciar…':`${remaining} s`}</strong>}</div><section className="live-panel live-question"><h2>{state.question.q}</h2>{state.question.visual&&(state.question.visual==='closed-circuit'?<div className="question-visual circuit-question" role="img" aria-label="Circuito fechado com proteção, interruptor fechado, lâmpada e retorno N"><svg viewBox="0 0 440 160" aria-hidden="true"><path d="M30 35 H85 M115 35 H190 M220 35 H360 V62 M360 108 V135 H30"/><rect x="85" y="24" width="30" height="22"/><circle cx="190" cy="35" r="4"/><circle cx="220" cy="35" r="4"/><path d="M190 35 H220"/><circle cx="360" cy="85" r="23"/><path d="M344 69 L376 101 M376 69 L344 101"/><text x="12" y="40">L</text><text x="12" y="140">N</text><text x="68" y="75">Proteção</text><text x="155" y="75">Comando fechado</text></svg></div>:renderVisual(state.question.visual))}<div className="live-slots">{icons.map((Icon,i)=>state.question!.options[i]!==undefined?<button key={i} className={`live-slot slot-${i} ${state.mine?.answer===i?'chosen':''} ${state.phase==='reveal'&&state.question!.answer===i?'correct':''}`} disabled={busy||state.phase!=='question'||!!state.mine||remaining===0} onClick={()=>void act('answer',{answer:i})} aria-pressed={state.mine?.answer===i}><Icon/><span>{state.question!.options[i]}</span>{state.phase==='reveal'&&state.question!.answer===i&&<b>✓ Correta</b>}</button>:<div key={i} className={`live-slot empty slot-${i}`} aria-hidden="true"/>)}</div>{state.phase==='question'&&<><p role="status">{state.mine?'Resposta registada ⚡ Aguarda pelos restantes participantes…':remaining===0?'Tempo terminado. A sincronizar…':'Escolhe uma resposta. A primeira resposta é definitiva.'}</p><p>{state.answered} / {state.participants.filter(p=>!p.departed).length} responderam</p>{host&&state.config.duration===0&&<button className="ghost-button" disabled={busy} onClick={()=>void act('close')}>Fechar respostas</button>}</>}{state.phase==='reveal'&&<section className="live-reveal" aria-live="polite"><h3>{state.mine?.correct?'✓ Acertaste!':state.mine?'Não foi desta':'Não respondeste a esta pergunta'}</h3><strong>+ {state.mine?.points||0} pontos</strong><p>Resposta correta: <b>{correctText||'A sincronizar…'}</b></p>{state.question.explanation&&<><h3>Porquê?</h3><p>{state.question.explanation}</p></>}{host?<button className="primary-button" disabled={busy} onClick={()=>void act('next')}>{state.config.showLeaderboard?'Ver classificação':state.position+1===state.total?'Ver resultados':'Próxima pergunta'} <ArrowRight/></button>:<p>Aguarda pelo anfitrião.</p>}</section>}</section></>}
 {state?.phase==='leaderboard'&&<>{ranking()}{host?<button className="primary-button" disabled={busy} onClick={()=>void act('next')}>{state.position+1===state.total?'Ver resultados finais':'Próxima pergunta'} <ArrowRight/></button>:<p>Aguarda pela próxima pergunta.</p>}</>}
 {state?.phase==='finished'&&<>{ranking(true)}<section className="live-final-stats"><div><strong>{state.total}</strong>Perguntas previstas</div><div><strong>{me?.correctCount||0}/{state.total}</strong>Acertos</div><div><strong>{state.total?Math.round(100*(me?.correctCount||0)/state.total):0}%</strong>Respostas certas</div></section>{host&&state.summary&&<section className="live-panel"><h2>Perguntas mais difíceis</h2><ul className="live-summary">{state.summary.map((q,i)=><li key={i}><div><strong>{q.level}</strong><p>{q.question}</p></div><b>{q.percent}%<small> acertaram</small></b></li>)}</ul></section>}<div className="live-footer-actions">{host&&<><button className="primary-button" disabled={busy} onClick={()=>{const replayConfig=state.config;clear();setConfig(replayConfig);void act('create',{config:replayConfig})}}>Jogar novamente</button><button className="ghost-button" onClick={()=>{clear();setScreen('create')}}>Criar novo Live</button></>}<button className="ghost-button" onClick={()=>void leave()}>Voltar ao Voltz</button></div></>}
 {confirm&&<div className="modal-backdrop"><section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="live-end-title" onKeyDown={e=>{if(e.key==='Escape')setConfirm(null);if(e.key==='Tab'){const buttons=Array.from(e.currentTarget.querySelectorAll('button'));const first=buttons[0];const last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}}}><h2 id="live-end-title">Terminar o Voltz Live?</h2><p>A sessão termina para todos os participantes. As respostas já registadas ficam guardadas.</p><div className="modal-actions"><button ref={controls} className="ghost-button" onClick={()=>setConfirm(null)}>Cancelar</button><button className="danger-button" disabled={busy} onClick={()=>void leave(confirm)}>Terminar sessão</button></div></section></div>}
 {roomToEnd&&<div className="modal-backdrop"><section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="room-end-title"><h2 id="room-end-title">Terminar a sala {roomToEnd.code.slice(0,3)} {roomToEnd.code.slice(3)}?</h2><p>Esta sala deixa de aceitar participantes e deixa de contar como Live ativo.</p><div className="modal-actions"><button ref={controls} className="ghost-button" onClick={()=>setRoomToEnd(null)}>Cancelar</button><button className="danger-button" disabled={busy} onClick={()=>void endRoom(roomToEnd)}>Terminar sala</button></div></section></div>}
 </div>;
}
