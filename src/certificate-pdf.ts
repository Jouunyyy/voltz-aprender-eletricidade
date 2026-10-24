/** Rasterise the exact certificate DOM at a fixed resolution, independent of viewport or print settings. */
export async function downloadCertificatePdf(frame: HTMLIFrameElement, code: string) {
 const doc=frame.contentDocument;
 const certificate=doc?.getElementById('cert');
 if(!doc||!certificate)throw new Error('Certificado indisponível');
 await doc.fonts.ready;
 await Promise.all(Array.from(certificate.querySelectorAll('img')).map(async image=>{
  if(image.getAttribute('src'))await image.decode();
 }));
 const [{default:html2canvas},{jsPDF}]=await Promise.all([import('html2canvas'),import('jspdf')]);
 const canvas=await html2canvas(certificate,{
  scale:2,width:1400,height:875,windowWidth:1400,windowHeight:875,scrollX:0,scrollY:0,backgroundColor:'#ffffff',logging:false,
  onclone(clone){
   const card=clone.getElementById('cert')!;
   Object.assign(card.style,{transform:'none',position:'absolute',left:'0',top:'0',boxShadow:'none'});
   Object.assign(clone.body.style,{margin:'0',padding:'0',width:'1400px',height:'875px'});
   Object.assign(clone.getElementById('stage')!.style,{width:'1400px',height:'875px',margin:'0',position:'relative'});
  }
 });
 const pdf=new jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});
 const width=297,height=width*875/1400,y=(210-height)/2;
 pdf.addImage(canvas,'PNG',0,y,width,height,undefined,'FAST');
 const url=certificate.querySelector('#url')?.textContent?.trim();
 if(url)pdf.link(12,y+152,135,23,{url:`https://${url}`});
 pdf.setProperties({title:`Certificado Voltz — ${code}`,author:'Voltz'});
 pdf.save(`${code.replace(/[^a-zA-Z0-9_-]/g,'-')}.pdf`);
 canvas.width=0;canvas.height=0;
}
