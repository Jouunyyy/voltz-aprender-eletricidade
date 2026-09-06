import { allLevels, categories } from './curriculum';
import { recordStudentAnswer, recordStudentLevel, teacherRequest } from './teacher-api';

const CONTEXT='voltz-learning-level-context';
const LIVE_CLASS='voltz-teacher-live-class-code';
const firstSeen=new Set<string>();
const levelRecorded=new Set<string>();
let linkedLive='';

type LevelCtx={id:string;title:string;categoryId:string;categoryName:string};
function saveContext(level:typeof allLevels[number]){const ctx:LevelCtx={id:level.id,title:level.title,categoryId:level.category.id,categoryName:level.category.name};sessionStorage.setItem(CONTEXT,JSON.stringify(ctx));return ctx}
function context():LevelCtx|null{try{return JSON.parse(sessionStorage.getItem(CONTEXT)||'null')}catch{return null}}
function byTitle(title:string){return allLevels.find(level=>level.title.trim()===title.trim())}
function text(el:Element|null){return el?.textContent?.trim()||''}
function navButton(label:string){return [...document.querySelectorAll<HTMLButtonElement>('.sidebar .nav-item,.mobile-nav .nav-item')].find(b=>text(b.querySelector('span'))===label)}

function openView(view:string){if(view==='live'){navButton('Voltz Live')?.click();return}navButton(view)?.click()}
function openLevel(levelId:string){const level=allLevels.find(l=>l.id===levelId);if(!level)return;saveContext(level);navButton('Percurso')?.click();window.setTimeout(()=>{const catIndex=categories.findIndex(c=>c.id===level.category.id);const catButtons=[...document.querySelectorAll<HTMLButtonElement>('.category-tabs button')];catButtons[catIndex]?.click();window.setTimeout(()=>{const card=[...document.querySelectorAll<HTMLButtonElement>('.level-card')].find(b=>text(b.querySelector('strong'))===level.title);if(card&&!card.disabled)card.click();else window.dispatchEvent(new CustomEvent('voltz-recommendation-locked',{detail:level.title}))},60)},40)}

function onClick(event:MouseEvent){const target=event.target as Element|null;if(!target)return;
 const levelCard=target.closest('.level-card');if(levelCard){const level=byTitle(text(levelCard.querySelector('strong')));if(level)saveContext(level);return}
 const start=target.closest('button');if(start){const label=text(start);if(label==='Criar Voltz Live'&&start.closest('.teacher-live-panel')){const code=text(document.querySelector('.teacher-code strong'));if(code)sessionStorage.setItem(LIVE_CLASS,code)}if(label.includes('Começar desafio')||label.includes('Novo desafio')){firstSeen.clear();const lessonTitle=text(document.querySelector('.lesson-page h1'));const level=byTitle(lessonTitle);if(level)saveContext(level)}}
 const option=target.closest<HTMLButtonElement>('.challenge-page .option');if(!option)return;
 const ctx=context();if(!ctx)return;const questionNo=Number((text(document.querySelector('.challenge-head .eyebrow')).match(/(\d+)/)||[])[1]||0);const q=text(document.querySelector('.challenge-head h1'));const key=`${ctx.id}:${questionNo}`;const firstAttempt=!firstSeen.has(key);firstSeen.add(key);const optionIndex=[...option.parentElement!.querySelectorAll('.option')].indexOf(option);
 window.setTimeout(()=>{const correct=option.classList.contains('correct')&&!option.classList.contains('wrong');recordStudentAnswer({levelId:ctx.id,categoryId:ctx.categoryId,questionKey:`${ctx.id}:${questionNo}:${q}`.slice(0,500),topic:ctx.title,correct,firstAttempt,answerIndex:optionIndex,sessionType:'individual'});window.setTimeout(()=>{const result=document.querySelector('.result-page h1');if(result&&text(result)==='Nível dominado!'&&!levelRecorded.has(ctx.id)){levelRecorded.add(ctx.id);recordStudentLevel({levelId:ctx.id,categoryId:ctx.categoryId})}},120)},0)
}

function onView(event:Event){const detail=(event as CustomEvent).detail;if(typeof detail==='string')openView(detail)}
function onLevel(event:Event){const detail=(event as CustomEvent).detail;if(typeof detail==='string')openLevel(detail)}
async function linkPendingLive(){const classCode=sessionStorage.getItem(LIVE_CLASS);const liveCode=new URLSearchParams(location.search).get('live');if(!classCode||!liveCode||linkedLive===`${classCode}:${liveCode}`)return;try{await teacherRequest('link_live',{classCode,code:liveCode});linkedLive=`${classCode}:${liveCode}`;sessionStorage.removeItem(LIVE_CLASS)}catch{}}

export function installLearningTelemetry(){document.addEventListener('click',onClick,true);window.addEventListener('voltz-open-view',onView);window.addEventListener('voltz-open-level',onLevel);const timer=window.setInterval(()=>void linkPendingLive(),1200);return()=>{document.removeEventListener('click',onClick,true);window.removeEventListener('voltz-open-view',onView);window.removeEventListener('voltz-open-level',onLevel);window.clearInterval(timer)}}
