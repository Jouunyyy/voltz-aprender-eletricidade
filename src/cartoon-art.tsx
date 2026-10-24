import './cartoon-art.css';
const art=(name:string)=>`${import.meta.env.BASE_URL}cartoon-art/${name}.webp`;
export function CartoonArt({kind}:{kind:string}){
 const name=kind==='power'?'contador':kind==='conductors'?'cabos':'quadro';
 return <figure className="cartoon-art"><img src={art(name)} alt={kind==='power'?'Contador de energia cartoon':kind==='conductors'?'Condutores castanho, azul e verde/amarelo':'Quadro elétrico cartoon com disjuntores e diferencial'}/><figcaption>{kind==='power'?'Energia consumida: kWh · E = P × t':kind==='conductors'?'L · N · PE — confirma sempre a função dos condutores':'Disjuntor: sobreintensidades · Diferencial: corrente residual'}</figcaption></figure>;
}
