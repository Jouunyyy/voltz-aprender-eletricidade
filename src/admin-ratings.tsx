import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Star } from 'lucide-react';
import './admin-ratings.css';

type RequestFn=(action:string,input?:Record<string,unknown>)=>Promise<any>;

export default function AdminRatings({request,visible}:{request:RequestFn;visible:boolean}){
  const [active,setActive]=useState(false);
  const [target,setTarget]=useState<Element|null>(null);
  const [days,setDays]=useState(30);
  const [data,setData]=useState<any>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    if(!visible){setActive(false);setTarget(null);return}
    const scan=()=>{
      const main=document.querySelector('.admin-main');
      const label=document.querySelector('.admin-side nav button.active span')?.textContent?.trim()
        ||document.querySelector('.admin-mobile-nav button.active span')?.textContent?.trim();
      setTarget(main);
      setActive(label==='Estatísticas');
    };
    scan();
    const root=document.querySelector('.role-area');
    if(!root)return;
    const observer=new MutationObserver(scan);
    observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    return()=>observer.disconnect();
  },[visible]);

  useEffect(()=>{
    if(!active)return;
    let cancelled=false;
    setBusy(true);setError('');
    request('ratings',{mode:'real',days}).then(next=>{if(!cancelled)setData(next)}).catch(err=>{if(!cancelled)setError(err instanceof Error?err.message:'Não foi possível carregar as avaliações.')}).finally(()=>{if(!cancelled)setBusy(false)});
    return()=>{cancelled=true};
  },[active,days,request]);

  const distribution=useMemo(()=>{
    const total=Number(data?.total||0);
    return [5,4,3,2,1].map(stars=>{
      const count=Number(data?.[`count${stars}`]||0);
      return {stars,count,percent:total?Math.round(count/total*100):0};
    });
  },[data]);

  if(!visible||!active||!target)return null;
  return createPortal(<section className="admin-card admin-ratings-card">
    <div className="admin-ratings-head"><div><h2>Avaliação do Voltz</h2><p>Resumo agregado, sem nomes nem emails.</p></div></div>
    <div className="admin-range" aria-label="Período das avaliações"><span>Período:</span>{[7,30,90].map(value=><button key={value} className={days===value?'active':''} onClick={()=>setDays(value)}>{value} dias</button>)}</div>
    {error&&<div className="admin-error" role="alert">{error}</div>}
    {busy&&!data?<p>A carregar avaliações…</p>:<>
      <div className="admin-ratings-summary"><div><span>Média geral</span><strong>{Number(data?.averageRating||0).toLocaleString('pt-PT',{minimumFractionDigits:1,maximumFractionDigits:2})} / 5</strong></div><div><span>Total de avaliações</span><strong>{Number(data?.total||0).toLocaleString('pt-PT')}</strong></div></div>
      <div className="admin-ratings-distribution">{distribution.map(item=><div key={item.stars}><span><Star fill="currentColor"/>{item.stars} estrelas</span><i><b style={{width:`${item.percent}%`}}/></i><strong>{item.count} · {item.percent}%</strong></div>)}</div>
      <div className="admin-ratings-trend"><h3>Evolução por data</h3>{data?.daily?.length?<div>{data.daily.map((item:any)=><span key={item.date} title={`${item.date}: média ${item.value} (${item.total})`}><i style={{height:`${Math.max(8,Number(item.value||0)/5*100)}%`}}/><small>{new Date(`${item.date}T00:00:00`).toLocaleDateString('pt-PT',{day:'2-digit',month:'2-digit'})}</small></span>)}</div>:<p>Dados insuficientes neste período.</p>}</div>
    </>}
  </section>,target);
}
