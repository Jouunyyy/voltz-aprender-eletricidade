import './globals.css';
import { Lesson } from './full-voltz-app';
import { allLevels } from './curriculum';
import { CertificateFrame } from './certificate-system';
import { downloadCertificatePdf } from './certificate-pdf';
import { useRef, useState } from 'react';
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
function CertificateReview(){
 const frame=useRef<HTMLIFrameElement>(null);
 const [error,setError]=useState('');
 const certificate={id:'preview',code:'EXEMPLO-SEM-VALIDADE',displayName:'EXEMPLO — SEM VALIDADE',xpTotal:10000,completedAt:'2026-10-24T12:00:00Z',createdAt:'2026-10-24T12:00:00Z',revokedAt:null,emailSentAt:null,emailStatus:'preview',certificateUrl:'',validationUrl:'https://jouunyyy.github.io/voltz-aprender-eletricidade/',qrDataUrl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZoAAAGaAQAAAAAefbjOAAADG0lEQVR4nO2cTW7jOBBGXw0FZEkBOUCOIt1gjtToI+UG0lF8gAaopQEK3yxI0XJ6MejxtOy2SwsjofngIlypn49kTPzyM//16ww45JBDDjnkkEPPCVl9OpjNrIyNrGUUlm3CeBfzHDoeGiRJ6TK+GhCkiSAbCZIkXUPHmefQ8dBSA4B9UwaWN8HSAaymCSgR5F7mOXRPKMjGmNH3j7MxJLDxN32SQw8IdT+NLD3MBgynDhs+QSz/wyc59GdAm0dEQfniY+7E8p4BYfOHNre4h3kO3QuazcysB1jeZCNg49KVQAGXruM+5jl0dIz4ImULMhAzmvuAvk548DU5dAtE6SqHBLR2s/4Ut4708q4kaXrwNTl0C7TzCF2eidC8BKQEdcw94tmhq15j6VF5YbWSK+YxZOa/hQ2pNx1tnkOHQy0yZC5pQlNUiQcQtZMrPWs8P7R5RAJa9bAvHFIQxFpoetZ4Hah83Wer7WbMSGk1G1lNOr1JOrmK/QpQixFBDO2lPlvDMV1P9hjxzFD5u7dhymj+yACrMUxrJ5Z3DLoMhGwQ8uHmOXQ41DLB2gGG5o8aIgwCDJ/vQPxhEBM2TMea59Dh0FVlWaqHTXvYTUmuR7wMxL61TMCQgjSV5kKbC8Rc3/A64umhfYzYCRCpxYO4eQQeI14C2u+GzxayoJYQRb0cTl02IkBMx5vn0OHQVda4CJfa2opBuZQQ+7jx4Gty6Bboeu8TLqJEUS9bEinlpdcRLwM1nZp4NogZ+3bq0LRseWXu24nLP2RNDv0XaB8jWjdBlSszu/xRelOPEc8O7U9FVN8INVdMUOqI0oQUp3GPeHaoqtj1t5CLlD18GkWknPsfUA/itsN1D74mh26BtqzRtruqcLnXLKtQ4afqXgpa2qXOpcPGdhZCKajeBY1nP4v9ilDdDV9N383Mxni2eorm1GHjvc1z6HdDP9/pYjVYemxI79lYehhOdnVE/8HX5NAt0Nc7XZp7qBe7OFvdHI/Cz0e8CLRTsal7WW1L/LLnlTaN2yvLp4dM/z7n6+P/mcwhhxxyyCGHHAL4B6LXZipEYyuLAAAAAElFTkSuQmCC'};
 return <><h1>Revisão do modelo — sem validade</h1><button onClick={()=>{if(frame.current)void downloadCertificatePdf(frame.current,certificate.code).catch(e=>setError(String(e)))}}>Descarregar PDF de exemplo</button><p role="status">{error}</p><CertificateFrame certificate={certificate} frameRef={frame}/></>;
}
function Preview() {
  const [mode, setMode] = useState<'V' | 'A' | 'Ω'>('V');
  const [mobile, setMobile] = useState(false);
  const certificateReview=new URLSearchParams(window.location.search).has("certificate");
  const lessons = new URLSearchParams(window.location.search).has('lessons');
  const embedded = new URLSearchParams(window.location.search).has('embedded');
  if(certificateReview)return <CertificateReview/>;
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
