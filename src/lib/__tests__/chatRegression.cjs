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

// ---- Chat del invitado + icono (posición y escala) ----
const vm=require('node:vm');
function statusWorld(over={}){
  const timers=[];let now=0;const posts=[];
  const env={setTimeout:(f,ms)=>{timers.push({f,at:now+ms,rep:0});},setInterval:(f,ms)=>{timers.push({f,at:now+ms,rep:ms});},
    document:{getElementById:()=>null},localStorage:{getItem:()=>null},...over};
  env.window=env;env.parent={postMessage:(m)=>posts.push(JSON.parse(JSON.stringify(m)))};
  const advance=ms=>{const end=now+ms;while(now<end){now=Math.min(end,now+50);for(const t of timers)if(t.at<=now){t.f();t.at=t.rep?t.at+t.rep:Infinity;}}};
  return {env,posts,advance};
}
async function runStatus(over){
  const {CHAT_STATUS_PATCH}=await load('chatStatusPatch.js');const w=statusWorld(over);
  vm.runInNewContext(CHAT_STATUS_PATCH.replace(/<\/?script>/g,''),w.env);w.advance(500);return w;
}
test('chat status: the GUEST gets the room and an open connection from the relay (it used to be empty for them)',async()=>{
  // El invitado entra por el relay: el motor NO rellena NET.code ni NET.conn para él.
  const g=await runStatus({NET:{role:'client',code:'',conn:null,names_self:'Bob',names_opp:'Ana'},G:{},bfRelayInfo:()=>({code:'ABC123',side:'g',joined:true})});
  const s=g.posts.at(-1).bfChatStatus;assert.equal(s.roomCode,'ABC123');assert.equal(s.connOpen,true,'the chat is shown');assert.equal(s.isHost,false);assert.equal(s.playerNick,'Bob');
  // Anfitrión sin rival todavía: sin chat; cuando entra el invitado, aparece (y el cambio se publica)
  let joined=false;const h=await runStatus({NET:{role:'host',code:'ABC123',conn:null,names_self:'Ana'},G:{},bfRelayInfo:()=>({code:'ABC123',side:'p',joined})});
  assert.equal(h.posts.at(-1).bfChatStatus.connOpen,false,'waiting room: no chat yet');joined=true;h.advance(1000);
  assert.equal(h.posts.at(-1).bfChatStatus.connOpen,true);assert.equal(h.posts.at(-1).bfChatStatus.isHost,true);
});
test('chat status: without the relay (solo / legacy) it falls back to NET exactly as before',async()=>{
  const a=await runStatus({NET:{role:'host',code:'ZZZ999',conn:{open:true},names_self:'Ana'},G:{}});
  assert.deepEqual([a.posts.at(-1).bfChatStatus.roomCode,a.posts.at(-1).bfChatStatus.connOpen,a.posts.at(-1).bfChatStatus.isHost],['ZZZ999',true,true]);
  const solo=await runStatus({NET:{role:'local',code:'',conn:null},G:{},bfRelayInfo:()=>({code:'',side:'',joined:false})});
  assert.equal(solo.posts.at(-1).bfChatStatus.connOpen,false,'vs the AI: no chat');
});
test('chat icon: to the RIGHT of the animations button, SAME size as it, scaled with the game, never overlapping',async()=>{
  const {chatIconAnchor,CHAT_ICON_MIN_SCALE,CHAT_ICON_MAX_SCALE}=await load('chatIconAnchor.js');
  assert.deepEqual(chatIconAnchor(null),{left:10,top:10,height:28,scale:1},'no iframe measured yet');
  for(const width of [860,780,640,500,390,320,1280,1600]){                      // anchos de pantalla (diseño 860)
    const fr={left:0,top:40,width},btn={left:10,right:150,top:8,width:140,height:30};
    const a=chatIconAnchor({frameRect:fr,innerWidth:860,btnRect:btn});const k=width/860;
    assert(a.left>fr.left+btn.right*k,'icon starts AFTER the toggle (width '+width+'): '+a.left+' <= '+(btn.right*k));
    assert(a.scale>=CHAT_ICON_MIN_SCALE&&a.scale<=CHAT_ICON_MAX_SCALE);
    const iconH=28*a.scale,btnH=btn.height*k;assert(Math.abs(iconH-btnH)<=1||a.scale===CHAT_ICON_MIN_SCALE||a.scale===CHAT_ICON_MAX_SCALE,'same height as the animations button: '+iconH.toFixed(1)+' vs '+btnH.toFixed(1));
    assert(Math.abs((a.top+iconH/2)-(fr.top+btn.top*k+btnH/2))<=1.5,'vertically centred on the animations button');
  }
  const phone=chatIconAnchor({frameRect:{left:0,top:0,width:390},innerWidth:860,btnRect:{right:150,top:8,width:140,height:30}});
  const desktop=chatIconAnchor({frameRect:{left:0,top:0,width:860},innerWidth:860,btnRect:{right:150,top:8,width:140,height:30}});
  assert(phone.scale<0.6&&desktop.scale>1,'phone: '+phone.scale+' (small, like the rest of the screen) | desktop: '+desktop.scale);
  // el botón de animaciones no está a la vista (display:none => rectángulo vacío): esquina superior izquierda, ESCALADA con el juego
  const hidden=chatIconAnchor({frameRect:{left:0,top:0,width:390},innerWidth:860,btnRect:{left:0,right:0,top:0,width:0,height:0}});
  assert.equal(hidden.left,Math.round(10*390/860));assert(hidden.scale<0.6,'never full size on the phone: '+hidden.scale);
  assert.deepEqual(chatIconAnchor({frameRect:{left:0,top:0,width:390},innerWidth:860,btnRect:null}),hidden,'no button at all = same corner');
});
test('REGRESSION: #bf-cine-toggle is position:fixed, so offsetParent is ALWAYS null — visibility must not depend on it',()=>{
  const src=fs.readFileSync(path.join(__dirname,'..','..','components','chat','ChatOverlay.jsx'),'utf8');
  assert.doesNotMatch(src.replace(/\/\/[^\n]*/g,''),/offsetParent/,'the chat icon must not use offsetParent (it made the icon fall on top of the button, full size)');
  assert.match(fs.readFileSync(path.join(__dirname,'..','cineTogglePatch.js'),'utf8'),/#bf-cine-toggle\{position:fixed/,'the premise: the toggle really is fixed');
});
test('chat icon wiring: ChatOverlay uses the anchor scale and re-measures on rotation',()=>{
  const src=fs.readFileSync(path.join(__dirname,'..','..','components','chat','ChatOverlay.jsx'),'utf8');
  assert.match(src,/transform: `scale\(\$\{anchor\.scale\}\)`/);assert.match(src,/transformOrigin: 'left top'/);assert.match(src,/chatIconAnchor\(\{/);assert.match(src,/onViewportChange\(measure\)/);
  assert.doesNotMatch(src,/fr\.left \+ r\.right \* k \+ 8\b/,'the old fixed 8px gap is gone');
});
