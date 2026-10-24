import './globals.css';
import { Lesson } from './full-voltz-app';
import { allLevels } from './curriculum';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CartoonCircuit, CartoonCircuitComparison } from './cartoon-circuits';
import { CartoonArt } from './cartoon-art';
import { CartoonLampCircuit, CartoonLighting, CartoonMeter, CartoonOhm } from './cartoon-learning';

function LessonReview() {
 const [levelId,setLevelId]=useState('aprendiz-1');
 const [slide,setSlide]=useState(3);
 const level=allLevels.find(item=>item.id===levelId)!;
 return <><label>Nível <select aria-label="Nível de revisão" value={levelId} onChange={e=>setLevelId(e.target.value)}>{allLevels.map(item=><option key={item.id} value={item.id}>{item.id} · {item.title}</option>)}</select></label><label>Etapa <select aria-label="Etapa de revisão" value={slide} onChange={e=>setSlide(Number(e.target.value))}>{Array.from({length:8},(_,i)=><option key={i} value={i}>{i+1}/8</option>)}</select></label><Lesson key={levelId} level={level} slide={slide} setSlide={setSlide} startChallenge={()=>setSlide(0)}/></>;
}
function Preview() {
  const [mode, setMode] = useState<'V' | 'A' | 'Ω'>('V');
  const [mobile, setMobile] = useState(false);
  const lessons = new URLSearchParams(window.location.search).has('lessons');
  const embedded = new URLSearchParams(window.location.search).has('embedded');
  return <main style={{maxWidth:1000,margin:'auto',fontFamily:'Segoe UI, sans-serif',color:'#142d4d'}}>
    {!embedded && <><h1>Voltz · gráficos cartoon</h1><p>Os mesmos componentes usados no Manual, nas aulas e nas perguntas.</p><a href="?lessons=1">Rever aulas completas</a><button style={{padding:12,marginBottom:20}} onClick={()=>setMobile(!mobile)}>{mobile?'Ver largura completa':'Ver a 390 px'}</button></>}
    {mobile ? <iframe title="Prévia com viewport de 390 px" src={lessons?"?embedded=1&lessons=1":"?embedded=1"} style={{width:390,maxWidth:'100%',height:844,border:'2px solid #142d4d',borderRadius:20}}/> : lessons ? <LessonReview/> : <>
      <h2>Circuito com interruptor</h2><CartoonLampCircuit/>
      <h2>Lei de Ohm</h2><CartoonOhm/>
      <h2>Multímetro</h2><CartoonMeter mode={mode} setMode={setMode}/>
      <h2>Condutores</h2><CartoonArt kind="conductors"/>
      <h2>Energia</h2><CartoonArt kind="power"/>
      <h2>Proteções</h2><CartoonArt kind="protection"/>
      <h2>Iluminação</h2><CartoonLighting/>
      <CartoonCircuitComparison/>
      <h2>Diagrama de pergunta — sem controlos ou indicação da resposta</h2>
      <div className="cartoon-circuits"><CartoonCircuit kind="parallel" initiallyOpen readOnly/></div>
    </>}
  </main>;
}
createRoot(document.getElementById('circuit-root')!).render(<Preview/>);
