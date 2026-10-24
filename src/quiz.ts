import { learningUnits } from "./learning/index.ts";
import { type allLevels, type Check } from "./curriculum.ts";
// Rejection sampling avoids modulo bias; supported by browsers and Deno.
export function randomIndex(bound:number):number {
 if(!Number.isInteger(bound)||bound<1||bound>0x100000000)throw new RangeError('Invalid random bound');
 const limit=Math.floor(0x100000000/bound)*bound;
 const bytes=new Uint32Array(1);
 do{globalThis.crypto.getRandomValues(bytes)}while(bytes[0]>=limit);
 return bytes[0]%bound;
}
export const shuffle=<T,>(items:T[])=>{const out=[...items];for(let i=out.length-1;i>0;i--){const j=randomIndex(i+1);[out[i],out[j]]=[out[j],out[i]]}return out};
export const shuffleCheck=(item:Check)=>{const correct=item.options[item.answer];const options=shuffle([...item.options]) as [string,string,string];return {...item,options,answer:options.indexOf(correct)}};
export function buildQuiz(level:typeof allLevels[number]):Check[]{
 const lesson=learningUnits[level.id];
 if(!lesson)throw new Error(`Missing learning unit: ${level.id}`);
 return shuffle(lesson.questions).map(shuffleCheck);
}
