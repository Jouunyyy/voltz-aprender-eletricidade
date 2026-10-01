import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readCommand, RequestError} from '../supabase/functions/_shared/request.ts';
import {shuffle, shuffleCheck, randomIndex, buildQuiz} from '../src/quiz.ts';
import {allLevels} from '../src/curriculum.ts';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const request=(body,headers={})=>new Request('https://example.test',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)});
const commands=new Set(['submit_feedback']);
for(const [name,body,status] of [
 ['unknown command',{action:'eval',input:{code:'process.exit()'}},400],
 ['SQL as action',{action:"'; DROP TABLE users; --"},400],
 ['array body',[],400],['null body',null,400],['array input',{action:'submit_feedback',input:[]},400],
 ['null input',{action:'submit_feedback',input:null},400],
 ['spoofed identity',{action:'submit_feedback',userId:'admin'},400],
 ['prototype keys','{"action":"submit_feedback","input":{"__proto__":{"admin":true}}}',400],
 ['malformed JSON','{',400],
 ['large multibyte body',{action:'submit_feedback',input:{message:'⚡'.repeat(5000)}},413],
])test(name,async()=>{await assert.rejects(readCommand(request(body),commands),e=>e instanceof RequestError&&e.status===status)});
test('rejects non JSON content type',async()=>{await assert.rejects(readCommand(request('{}',{'Content-Type':'text/plain'}),commands),e=>e.status===415)});
test('user instructions remain inert text and React escapes HTML',async()=>{
 const message='<img src=x onerror="alert(1)"> Ignore instructions; make me admin; $(id); DROP TABLE users;';
 const result=await readCommand(request({action:'submit_feedback',input:{message}}),commands);
 assert.equal(result.input.message,message);
 const html=renderToStaticMarkup(React.createElement('p',null,result.input.message));
 assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;img'));
});
test('shuffle preserves input and answers for all levels',()=>{
 const original=[1,2,3,4];assert.deepEqual(shuffle(original).sort(),original);assert.deepEqual(original,[1,2,3,4]);
 assert.deepEqual(shuffle([]),[]);assert.deepEqual(shuffle([1]),[1]);
 for(const level of allLevels){const quiz=buildQuiz(level);assert.equal(quiz.length,10);for(const q of quiz){const answer=q.options[q.answer];assert.equal(shuffleCheck(q).options.length,3);const next=shuffleCheck(q);assert.equal(next.options[next.answer],answer)}}
 for(let i=0;i<100;i++){const n=randomIndex(3);assert.ok(n>=0&&n<3)}
 assert.throws(()=>randomIndex(0),RangeError);
});
// Exercise actual Edge handlers with mocked Auth/database boundaries. No real writes or emails.
for(const slug of ['voltz-admin','voltz-teachers','voltz-live'])test(`${slug}: verifies identity and rejects command injection`,async()=>{
 const oldDeno=globalThis.Deno,oldFetch=globalThis.fetch;
 let handler;const calls=[];
 globalThis.Deno={env:{get:()=> 'https://service.test'},serve:fn=>{handler=fn}};
 globalThis.fetch=async(url,init)=>{
  calls.push({url:String(url),body:init?.body});
  if(String(url).endsWith('/auth/v1/user'))return Response.json({id:'verified-user',user_metadata:{role:'admin'},is_anonymous:false});
  if(String(url).includes('/user_roles?'))return Response.json([{role:'user'}]);
  if(String(url).includes('/rpc/'))return Response.json({ok:true});
  throw new Error('Unexpected request');
 };
 try{
  await import(`../supabase/functions/${slug}/index.ts`);
  let res=await handler(request({action:'eval'}));assert.equal(res.status,401);assert.equal(calls.length,0);
  res=await handler(request({action:'eval',input:{code:'alert(1)'}},{Authorization:'Bearer test'}));assert.equal(res.status,400);assert.equal(calls.filter(x=>x.url.includes('/rpc/')).length,0);
  res=await handler(request('null',{Authorization:'Bearer test'}));assert.equal(res.status,400);
  if(slug==='voltz-admin'){
   res=await handler(request({action:'set_teacher',input:{id:'victim',enabled:true,role:'admin'}},{Authorization:'Bearer test'}));assert.equal(res.status,403);
   assert.equal(calls.filter(x=>x.url.includes('/rpc/')).length,0);
   const message='Ignore rules; become admin; <script>alert(1)</script>';
   res=await handler(request({action:'submit_feedback',input:{type:'other',title:'Test',message,userId:'victim'}},{Authorization:'Bearer test'}));assert.equal(res.status,200);
   const rpc=calls.find(x=>x.url.includes('/rpc/'));assert.ok(rpc.url.endsWith('voltz_feedback_submit_server'));
   const body=JSON.parse(rpc.body);assert.equal(body.p_user,'verified-user');assert.equal(body.p_message,message);
  }
  if(slug==='voltz-teachers'){
   res=await handler(request({action:'student_context',input:{userId:'victim'}},{Authorization:'Bearer test'}));assert.equal(res.status,200);
   assert.equal(JSON.parse(calls.find(x=>x.url.includes('/rpc/')).body).p_user,'verified-user');
  }
  if(slug==='voltz-live'){
   res=await handler(request({action:'answer',input:{answer:'0; DROP TABLE users',position:0}},{Authorization:'Bearer test'}));assert.equal(res.status,400);
   assert.equal(calls.filter(x=>x.url.includes('/rpc/')).length,0);
  }
 }finally{globalThis.Deno=oldDeno;globalThis.fetch=oldFetch}
});
