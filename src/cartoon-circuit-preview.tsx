import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CartoonCircuit, CartoonCircuitComparison } from './cartoon-circuits';
import { CartoonArt } from './cartoon-art';
import { CartoonLampCircuit, CartoonLighting, CartoonMeter, CartoonOhm } from './cartoon-learning';

function Preview() {
  const [mode, setMode] = useState<'V' | 'A' | 'Ω'>('V');
  const [mobile, setMobile] = useState(false);
  const embedded = new URLSearchParams(window.location.search).has('embedded');
  return <main style={{maxWidth:1000,margin:'auto',fontFamily:'Segoe UI, sans-serif',color:'#142d4d'}}>
    {!embedded && <><h1>Voltz · gráficos cartoon</h1><p>Os mesmos componentes usados no Manual, nas aulas e nas perguntas.</p><button style={{padding:12,marginBottom:20}} onClick={()=>setMobile(!mobile)}>{mobile?'Ver largura completa':'Ver a 390 px'}</button></>}
    {mobile ? <iframe title="Prévia com viewport de 390 px" src="?embedded=1" style={{width:390,maxWidth:'100%',height:844,border:'2px solid #142d4d',borderRadius:20}}/> : <>
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
