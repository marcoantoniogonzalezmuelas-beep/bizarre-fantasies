// Chat: lista de mensajes acotada y ordenada, y todos sus textos respetan el idioma elegido.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f);
const load=f=>import(pathToFileURL(lib(f)).href);
const msg=(id,sec)=>({id,created_date:new Date(Date.UTC(2026,0,1,0,0,sec)).toISOString(),text:'m'+id});

test('mergeChatMessage: append in order, replace by id, reorder late arrivals, never mutate',async()=>{
  const {mergeChatMessage}=await load('chatMessages.js');
  const a=[msg('1',1),msg('2',2)],snapshot=JSON.stringify(a);
  const b=mergeChatMessage(a,msg('3',3));assert.deepEqual(b.map(m=>m.id),['1','2','3']);assert.equal(JSON.stringify(a),snapshot,'input untouched');
  const edited={...msg('2',2),text:'editado'};assert.equal(mergeChatMessage(b,edited)[1].text,'editado');assert.equal(mergeChatMessage(b,edited).length,3);
  assert.deepEqual(mergeChatMessage(b,msg('0',0)).map(m=>m.id),['0','1','2','3'],'an older message lands in chronological position');
  assert.equal(mergeChatMessage(a,null),a);assert.equal(mergeChatMessage(a,{text:'sin id'}),a);
  assert.deepEqual(mergeChatMessage([],msg('9',9)).map(m=>m.id),['9']);
});
test('mergeChatMessage: the list is capped instead of growing for the whole match',async()=>{
  const {mergeChatMessage,CHAT_MAX_MESSAGES}=await load('chatMessages.js');
  let list=[];for(let i=1;i<=CHAT_MAX_MESSAGES+75;i++)list=mergeChatMessage(list,msg(String(i),i));
  assert.equal(list.length,CHAT_MAX_MESSAGES);assert.equal(list[0].id,String(76),'keeps the most recent');assert.equal(list.at(-1).id,String(CHAT_MAX_MESSAGES+75));
});
test('every literal the chat shows goes through t() and has an English translation',async()=>{
  global.localStorage={getItem:()=> 'en'};const {t}=await load('i18n.js');
  const src=fs.readFileSync(path.join(__dirname,'..','..','components','chat','ChatOverlay.jsx'),'utf8');
  const keys=[...new Set([...src.matchAll(/\bt\('([^']+)'\)/g)].map(m=>m[1]))];
  assert(keys.length>=9,'expected the chat strings to be wrapped: '+keys.length);
  for(const k of keys)assert.notEqual(t(k),k,'missing English for: '+k);
  global.localStorage={getItem:()=> 'es'};for(const k of keys)assert.equal(t(k),k,'Spanish stays as written: '+k);
  // nada de texto español fijo en el JSX (fuera de t())
  assert.doesNotMatch(src,/>Chat de sala</);assert.doesNotMatch(src,/placeholder="Escribe/);assert.doesNotMatch(src,/aria-label="(Cerrar chat|Enviar|Abrir chat)/);
  assert.match(src,/getLang\(\) === 'en' \? 'en-US' : 'es-ES'/,'time format follows the language');
  delete global.localStorage;
});
test('chat no longer measures the game iframe when it is not shown, and a failed send gives feedback',()=>{
  const src=fs.readFileSync(path.join(__dirname,'..','..','components','chat','ChatOverlay.jsx'),'utf8');
  assert.match(src,/if \(!status\?\.connOpen\) return undefined;[\s\S]{0,200}if \(document\.hidden\) return;/);
  assert.doesNotMatch(src,/setInterval\(measure, 600\)/);
  assert.match(src,/catch \(e\) \{\s*\/\/[^\n]*\n\s*setModerationError\(t\('No se pudo enviar/,'send failure is surfaced');
  assert.match(src,/if \(open\) messagesEndRef\.current\?\.scrollIntoView/,'no smooth scroll while closed');
});
