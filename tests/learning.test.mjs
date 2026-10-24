import {test} from 'node:test';
import assert from 'node:assert/strict';
import {allLevels, categories} from '../src/curriculum.ts';
import {learningUnits} from '../src/learning/index.ts';
import {buildQuiz} from '../src/quiz.ts';

test('authored bank covers exactly the 50 persistent curriculum IDs',()=>{
 assert.equal(categories.length,5);
 assert.equal(allLevels.length,50);
 assert.deepEqual(Object.keys(learningUnits).sort(),allLevels.map(l=>l.id).sort());
 for(const category of categories){
  assert.deepEqual(category.levels.map(l=>l.id),Array.from({length:10},(_,i)=>`${category.id}-${i+1}`));
 }
 for(const [id,unit] of Object.entries(learningUnits)){
  for(const key of ['context','example','reasoning','misconception'])assert.ok(unit[key].trim().length>50,`${id}: ${key}`);
  assert.equal(unit.questions.length,10,id);
  assert.equal(new Set(unit.questions.map(q=>q.q)).size,10,id);
  for(const q of unit.questions){
   assert.ok(q.q.trim().length>15,`${id}: empty question`);
   assert.equal(q.options.length,3);
   assert.equal(new Set(q.options.map(s=>s.trim().toLocaleLowerCase('pt-PT'))).size,3,`${id}: duplicate options`);
   assert.ok(q.options.every(s=>s.trim().length>0));
   assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<3);
   assert.ok(q.explanation?.trim().length>15,`${id}: missing explanation`);
   assert.ok(!/Qual é o objetivo do nível|Que par pertence ao mesmo nível|Que evidência mostra que compreendeste/i.test(q.q),`${id}: old generic question`);
  }
 }
});

test('quiz shuffling preserves every authored answer and does not mutate the bank',()=>{
 const before=JSON.stringify(learningUnits);
 for(const level of allLevels){
  const authored=learningUnits[level.id].questions;
  for(let run=0;run<5;run++){
   const quiz=buildQuiz(level);
   assert.deepEqual(quiz.map(q=>q.q).sort(),authored.map(q=>q.q).sort());
   for(const q of quiz){
    const source=authored.find(item=>item.q===q.q);
    assert.equal(q.options[q.answer],source.options[source.answer]);
    assert.equal(q.explanation,source.explanation);
    assert.equal(q.visual,source.visual);
   }
  }
 }
 assert.equal(JSON.stringify(learningUnits),before);
 assert.throws(()=>buildQuiz({...allLevels[0],id:'unknown'}),/Missing learning unit/);
});

test('numerical questions agree with independent worked calculations',()=>{
 const cases=[
  ['aprendiz-1','No simulador, 15 V em 5 Ω',15/5,' A'],
  ['aprendiz-2','Converte 250 mA',250/1000,' A'],
  ['aprendiz-3','Uma carga de 2 kW funciona 15 minutos',2*15/60,' kWh'],
  ['tecnico-3','Num modelo, entram 5,000 A',Math.round((5-4.98)*1000),' mA'],
  ['tecnico-4','No mesmo modelo, RA = 200',200*0.3,' V'],
  ['tecnico-9','L1 = 4 kW',4+2+3,' kW'],
  ['especialista-3','Pontas = 0,2 Ω',0.7-0.2,' Ω'],
  ['especialista-8','Uma queda de 3 V em relação a 24 V',3/24*100,'%'],
  ['especialista-10','Dos 4 V de queda',3.6/4*100,'%'],
 ];
 for(const [id,prefix,value,unit] of cases){
  const q=learningUnits[id].questions.find(q=>q.q.startsWith(prefix));
  assert.ok(q,`${id}: ${prefix}`);
  assert.equal(q.options[q.answer],`${Number(value.toFixed(6)).toLocaleString('pt-PT')}${unit}`);
 }
});

test('Live create uses the authored bank for every category and level, without client-supplied questions',async()=>{
 const oldDeno=globalThis.Deno,oldFetch=globalThis.fetch;
 let handler,stored;
 globalThis.Deno={env:{get:()=> 'https://service.test'},serve:fn=>{handler=fn}};
 globalThis.fetch=async(url,init)=>{
  if(String(url).endsWith('/auth/v1/user'))return Response.json({id:'verified-user',is_anonymous:false});
  if(String(url).endsWith('/rpc/voltz_live_command')){stored=JSON.parse(init.body);return Response.json({ok:true})}
  throw new Error('Unexpected request');
 };
 try{
  await import('../supabase/functions/voltz-live/index.ts');
  const configs=[...categories.map(c=>({categoryId:c.id,count:20})),...allLevels.map(l=>({categoryId:l.category.id,levelId:l.id,count:10}))];
  for(const config of configs){
   const req=new Request('https://example.test',{method:'POST',headers:{Authorization:'Bearer test','Content-Type':'application/json'},body:JSON.stringify({action:'create',input:{config:{...config,duration:30,showExplanations:true,showLeaderboard:true},questions:[{q:'injected',answer:0}]}})});
   const response=await handler(req);
   assert.equal(response.status,200);
   assert.equal(stored.p_user,'verified-user');
   assert.equal(stored.p_input.questions.length,config.count);
   for(const q of stored.p_input.questions){
    assert.ok(q.levelId.startsWith(`${config.categoryId}-`));
    if(config.levelId)assert.equal(q.levelId,config.levelId);
    const authored=learningUnits[q.levelId].questions.find(item=>item.q===q.q);
    assert.ok(authored);
    assert.equal(q.options[q.answer],authored.options[authored.answer]);
   }
  }
 }finally{globalThis.Deno=oldDeno;globalThis.fetch=oldFetch}
});
