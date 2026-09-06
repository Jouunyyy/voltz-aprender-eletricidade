import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Star } from 'lucide-react';
import './experience-rating-preview.css';

const asset = (path:string) => `${import.meta.env.BASE_URL}${path}`;

export default function ExperienceRatingPreview(){
  const [open,setOpen]=useState(false);
  const [hovered,setHovered]=useState(0);
  const [selected,setSelected]=useState(0);
  const [thanks,setThanks]=useState(false);
  const dialogRef=useRef<HTMLDivElement>(null);
  const previousFocus=useRef<HTMLElement|null>(null);

  useEffect(()=>{
    const timer=window.setTimeout(()=>setOpen(true),350);
    return()=>window.clearTimeout(timer);
  },[]);

  useEffect(()=>{
    if(!open)return;
    previousFocus.current=document.activeElement as HTMLElement|null;
    const dialog=dialogRef.current;
    requestAnimationFrame(()=>dialog?.querySelector<HTMLButtonElement>('.experience-star')?.focus());
    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();setOpen(false);return}
      if(event.key!=='Tab'||!dialog)return;
      const focusables=Array.from(dialog.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(el=>!el.hasAttribute('disabled'));
      if(!focusables.length)return;
      const first=focusables[0];const last=focusables[focusables.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    };
    document.addEventListener('keydown',onKeyDown);
    const previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    return()=>{document.removeEventListener('keydown',onKeyDown);document.body.style.overflow=previousOverflow;previousFocus.current?.focus()};
  },[open]);

  const choose=(rating:number)=>{
    setSelected(rating);setHovered(rating);setThanks(true);
    window.setTimeout(()=>setOpen(false),850);
  };
  const move=(rating:number,event:React.KeyboardEvent<HTMLButtonElement>)=>{
    let next=rating;
    if(event.key==='ArrowRight'||event.key==='ArrowUp')next=Math.min(5,rating+1);
    else if(event.key==='ArrowLeft'||event.key==='ArrowDown')next=Math.max(1,rating-1);
    else if(event.key==='Home')next=1;
    else if(event.key==='End')next=5;
    else return;
    event.preventDefault();setHovered(next);
    dialogRef.current?.querySelectorAll<HTMLButtonElement>('.experience-star')[next-1]?.focus();
  };

  if(!open)return null;
  const active=hovered||selected;
  return createPortal(<div className="experience-modal-backdrop" role="presentation">
    <div ref={dialogRef} className="experience-modal" role="dialog" aria-modal="true" aria-labelledby="experience-modal-title">
      <div className="experience-faisca-wrap"><span className="experience-spark" aria-hidden="true">⚡</span><img src={asset('faisca-mobile.webp')} alt="Faísca, mascote do Voltz"/></div>
      {!thanks?<>
        <h2 id="experience-modal-title">Como está a ser a tua experiência no Voltz?</h2>
        <div className="experience-stars" role="group" aria-label="Avaliação de 1 a 5 estrelas" onMouseLeave={()=>setHovered(selected)}>
          {[1,2,3,4,5].map(rating=><button key={rating} type="button" className={`experience-star ${rating<=active?'active':''}`} aria-label={`${rating} ${rating===1?'estrela':'estrelas'}`} aria-pressed={selected===rating} onMouseEnter={()=>setHovered(rating)} onFocus={()=>setHovered(rating)} onClick={()=>choose(rating)} onKeyDown={event=>move(rating,event)}><Star aria-hidden="true" fill={rating<=active?'currentColor':'none'}/></button>)}
        </div>
        <button type="button" className="experience-later" onClick={()=>setOpen(false)}>Agora não</button>
      </>:<div className="experience-thanks" role="status"><h2>Obrigado pela tua opinião ⚡</h2></div>}
    </div>
  </div>,document.body);
}
