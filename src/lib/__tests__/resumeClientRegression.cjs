// Cliente de la reanudación (resumePromptPatch + enganches en serverRelayPatch): DOM simulado.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f),read=f=>fs.readFileSync(lib(f),'utf8');
const script=s=>s.replace(/<\/?script>/g,'');
const flush=()=>new Promise(r=>setImmediate(r));
const plain=x=>JSON.parse(JSON.stringify(x));   // objetos creados en el vm tienen otro prototipo

class N{constructor(tag){this.tag=tag;this.children=[];this.parentNode=null;this.className='';this.id='';this._t='';this.value='';this.L={};this.nodeType=tag==='#text'?3:1;}
  get textContent(){return this._t+this.children.map(c=>c.textContent).join('');} set textContent(v){this._t=String(v);this.children=[];}
  appendChild(c){c.parentNode=this;this.children.push(c);return c;}
  removeChild(c){this.children=this.children.filter(x=>x!==c);c.parentNode=null;}
  addEventListener(e,f){this.L[e]=f;} focus(){}
  walk(fn){fn(this);this.children.forEach(c=>c.walk(fn));}
  find(pred){let r=null;this.walk(n=>{if(!r&&pred(n))r=n;});return r;}
  querySelector(sel){const cls=sel.slice(1);return this.find(n=>n!==this&&(n.className||'').split(' ').includes(cls));}}
function world({stored=null,gOnline=false,request}={}){
  const timers=new Map();let id=0,now=1_000_000;const store={};if(stored)store.bfActiveMatch=JSON.stringify(stored);
  const body=new N('body'),head=new N('head'),posts=[],calls=[],notifs=[];
  const env={Date:{now:()=>now},Math,JSON,console,Promise,Array,String,Number,
    setTimeout:(f,ms)=>{timers.set(++id,{f,at:now+ms,rep:0});return id;},setInterval:(f,ms)=>{timers.set(++id,{f,at:now+ms,rep:ms});return id;},
    clearInterval:i=>timers.delete(i),clearTimeout:i=>timers.delete(i),
    localStorage:{getItem:k=>(k in store?store[k]:null),setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}},
    document:{body,head,createElement:t=>new N(t),createTextNode:t=>{const n=new N('#text');n._t=t;return n;},
      getElementById:i=>body.find(n=>n.id===i)||head.find(n=>n.id===i)},
    G:{online:gOnline},notif:t=>notifs.push(t),location:{reload:()=>calls.push(['reload'])},
    bfRelayRequest:(a,d)=>{calls.push([a,d]);return request(a,d);},bfRelayResumeGame:(...a)=>calls.push(['resumeGame',...a]),
    bfRelayInfo:()=>({code:'ABC123',side:'p'}),bfMyAvatar:{url:'https://m.test/a.png'}};
  env.window=env;env.parent={postMessage:(m)=>posts.push(m)};
  const advance=ms=>{const end=now+ms;while(now<end){now=Math.min(end,now+250);for(const [i,t] of [...timers])if(t.at<=now){if(t.rep)t.at+=t.rep;else timers.delete(i);t.f();}}};
  return {env,body,posts,calls,notifs,store,advance,
    button:label=>body.find(n=>n.tag==='button'&&n.textContent===label),texts:()=>body.textContent};
}
const load=async(w)=>{const {RESUME_PROMPT_PATCH}=await import(pathToFileURL(lib('resumePromptPatch.js')).href);vm.runInNewContext(script(RESUME_PROMPT_PATCH),w.env);};
const ok=(extra={})=>Promise.resolve({ok:true,can_resume:true,nicks:['Ana','Bob'],opponent_absent:false,...extra});
const M={code:'ABC123',side:'p',nick:'Ana',at:1_000_000};

test('active match store: saves, expires after 30 minutes, rejects garbage',async()=>{
  const w=world({request:()=>ok()});await load(w);const s=w.env.bfActiveMatch;
  assert.equal(s.get(),null);s.save({code:'ABC123',side:'g',nick:'Bob'});assert.deepEqual(plain({...s.get(),at:0}),{code:'ABC123',side:'g',nick:'Bob',at:0});
  w.store.bfActiveMatch=JSON.stringify({code:'X',side:'hack',nick:'a',at:w.env.Date.now()});assert.equal(s.get(),null,'invalid side');
  w.store.bfActiveMatch=JSON.stringify({code:'ABC123',side:'p',nick:'a',at:w.env.Date.now()-31*60000});assert.equal(s.get(),null,'too old');assert.equal(w.store.bfActiveMatch,undefined,'expired entry is removed');
});
test('opening the game offers to resume with ONE click (no password retyped)',async()=>{
  const w=world({stored:M,request:()=>ok({opponent_absent:true})});await load(w);w.advance(1000);await flush();
  assert.deepEqual(plain(w.calls[0]),['resume_status',{code:'ABC123',side:'p'}]);
  assert.match(w.texts(),/Tienes una partida en curso/);assert.match(w.texts(),/Bob/,'shows the rival');assert.match(w.texts(),/aún no ha vuelto/,'tells me the rival is not back yet');
  w.button('Reanudar partida').onclick();
  assert.deepEqual(plain(w.calls.find(c=>c[0]==='resumeGame')),['resumeGame','ABC123','','Ana',['Ana','Bob'],'p'],'resumes with the stored side and NO password');
  assert.equal(w.button('Reanudar partida'),null,'dialog closed');assert.ok(w.store.bfActiveMatch,'kept until the resume succeeds');
});
test('"Abandonar" leaves the room and forgets the match',async()=>{
  const w=world({stored:M,request:()=>ok()});await load(w);w.advance(1000);await flush();
  w.button('Abandonar').onclick();assert.deepEqual(plain(w.calls.find(c=>c[0]==='leave')),['leave',{code:'ABC123',side:'p'}]);assert.equal(w.store.bfActiveMatch,undefined);assert.equal(w.button('Abandonar'),null);
});
test('finished / expired / unknown matches are forgotten silently; no network just retries later',async()=>{
  for(const reply of [()=>Promise.resolve({ok:true,can_resume:false,reason:'over'}),()=>Promise.reject(new Error('Room not found')),()=>Promise.reject(new Error('Unauthorized')),()=>Promise.reject(new Error('Room expired'))]){
    const w=world({stored:M,request:reply});await load(w);w.advance(1000);await flush();
    assert.equal(w.store.bfActiveMatch,undefined);assert.equal(w.button('Reanudar partida'),null,'no dialog for a dead match');
  }
  let n=0;const w=world({stored:M,request:()=>(++n===1?Promise.reject(new Error('Failed to fetch')):ok())});await load(w);
  w.advance(1000);await flush();assert.ok(w.store.bfActiveMatch,'offline: the match is kept');assert.equal(w.button('Reanudar partida'),null);
  w.advance(2000);await flush();assert.ok(w.button('Reanudar partida'),'the next attempt (network is back) offers it');assert.equal(n,2);
});
test('nothing is asked when there is no stored match, or a game is already running',async()=>{
  const a=world({request:()=>ok()});await load(a);a.advance(3000);await flush();assert.equal(a.calls.filter(c=>c[0]==='resume_status').length,0);
  const b=world({stored:M,gOnline:true,request:()=>ok()});await load(b);b.advance(3000);await flush();assert.equal(b.calls.filter(c=>c[0]==='resume_status').length,0);
});
test('the server is told when a match finishes, so a finished game is not offered as resumable',async()=>{
  const w=world({request:()=>ok()});let shown=0;w.env.showResult=function(){shown++;};await load(w);w.advance(400);
  w.env.showResult('win');assert.equal(shown,1,'the original showResult still runs');
  assert.deepEqual(plain(w.calls.find(c=>c[0]==='match_phase')),['match_phase',{code:'ABC123',side:'p',phase:'over'}]);
  const x=world({request:()=>ok()});x.env.bfRelayInfo=()=>({code:'',side:'p'});x.env.showResult=function(){};await load(x);x.advance(400);x.env.showResult();
  assert.equal(x.calls.filter(c=>c[0]==='match_phase').length,0,'solo / AI games do not talk to the server');
});
test('rival away: banner only after the server-defined delay; wait / claim victory',async()=>{
  const w=world({request:(a)=>a==='claim_forfeit'?Promise.resolve({ok:true,winner_nick:'Ana',loser_nick:'Bob'}):ok()});await load(w);
  w.env.bfOnRivalAway(200000,false,300000);assert.equal(w.button('Reclamar victoria'),null,'too early');
  w.env.bfOnRivalAway(301000,false,300000);assert.ok(w.button('Reclamar victoria'));assert.match(w.texts(),/5/,'shows the minutes');
  w.button('Seguir esperando').onclick();assert.equal(w.button('Reclamar victoria'),null);
  w.env.bfOnRivalAway(330000,false,300000);assert.equal(w.button('Reclamar victoria'),null,'stays hidden for 2 minutes');
  w.advance(121000);w.env.bfOnRivalAway(450000,false,300000);assert.ok(w.button('Reclamar victoria'),'comes back after 2 minutes');
  w.env.bfOnRivalAway(450000,true,300000);assert.equal(w.button('Reclamar victoria'),null,'match over: no banner');
  w.env.bfOnRivalAway(0,false,300000);
  w.env.bfOnRivalAway(450000,false,300000);w.button('Reclamar victoria').onclick();await flush();
  assert.deepEqual(plain(w.calls.find(c=>c[0]==='claim_forfeit')),['claim_forfeit',{code:'ABC123',side:'p'}]);
  const res=w.posts[0].bfMatchResult;assert.equal(res.winner_nick,'Ana');assert.equal(res.loser_nick,'Bob');assert.equal(res.mode,'online');assert.equal(res.winner_avatar,'https://m.test/a.png');
  assert.match(w.notifs.join('|'),/Victoria por abandono registrada/);assert.equal(w.store.bfActiveMatch,undefined);
  w.advance(2000);assert.ok(w.calls.some(c=>c[0]==='reload'),'returns to the lobby');
});
test('claiming too early is refused by the server and the player is told',async()=>{
  const w=world({request:(a)=>a==='claim_forfeit'?Promise.reject(new Error('too_early')):ok()});await load(w);
  w.env.bfOnRivalAway(301000,false,300000);w.button('Reclamar victoria').onclick();await flush();
  assert.equal(w.posts.length,0,'no result is reported');assert.match(w.notifs.join('|'),/Aún no se puede reclamar/);assert.ok(w.button('Reclamar victoria'),'can try again');
});
test('identity prompt (other device): returns what was typed, cancel does nothing',async()=>{
  const w=world({request:()=>ok()});await load(w);let got=null;w.env.bfAskResumeProof(v=>{got=v;});
  assert.match(w.texts(),/Confirma que eres tú/);const input=w.body.find(n=>n.tag==='input');assert.equal(input.type,'password');
  w.button('Continuar').onclick();assert.equal(got,null,'empty input is ignored');input.value='  miClave ';w.button('Continuar').onclick();assert.equal(got,'miClave');assert.equal(w.button('Continuar'),null);
  got=null;w.env.bfAskResumeProof(v=>{got=v;});w.button('Cancelar').onclick();assert.equal(got,null);assert.equal(w.button('Continuar'),null);
});
test('wiring in serverRelayPatch: remembers the match, reports rival absence, proves identity, restores the host',()=>{
  const r=read('serverRelayPatch.js'),h=read('gameInject.js');
  assert.match(r,/activeSave\(name\);/,'host saves on room creation');assert.match(r,/activeSave\(joinName\);/,'guest saves on join');assert.equal((r.match(/activeSave\(nick\);/g)||[]).length,2,'both resume paths save');
  assert.match(r,/window\.bfClearActive|bfActiveMatch\.clear\(\)/);assert.match(r,/bfOnRivalAway\(res\.other_away_ms \|\| 0, !!res\.match_over, res\.forfeit_after_ms \|\| 300000\)/);
  assert.match(r,/window\.bfRelayResumeGame = function\(code, password, nick, nicks, sideOverride, proof\)/);assert.match(r,/nick_password: String\(proof \|\| ''\)/);
  assert.match(r,/Unauthorized\|Wrong password[\s\S]{0,200}bfAskResumeProof/,'asks for a proof instead of dying');assert.match(r,/ensureHostRestored\(res\.snap\)/);
  assert.match(r,/host_restore_fallback/,'diagnostics record when the fallback was needed');
  assert.match(h,/DOM_BUS_PATCH \+ MATCH_EPOCH_PATCH \+ RESUME_PROMPT_PATCH \+/);
});
test('every visible text of the resume patch has an English translation',async()=>{
  const {DICT_EXACT}=await import(pathToFileURL(lib('translationsEn.js')).href);
  const src=read('resumePromptPatch.js'),lits=new Set();
  for(const m of src.matchAll(/(?:el\('[a-z]+',(?:'[^']*'|null),|btn\(|say\(|createTextNode\(|placeholder=)'([^']+)'/g))if(/[A-Za-zÁÉÍÓÚáéíóúñ]{3}/.test(m[1]))lits.add(m[1].trim());
  const sr=read('serverRelayPatch.js');for(const m of sr.matchAll(/say\('([^']+)'\)/g))lits.add(m[1].trim());
  assert(lits.size>=15,'expected to find the patch texts: '+lits.size);
  const miss=[...lits].filter(k=>!DICT_EXACT[k]);assert.deepEqual(miss,[],'texts without English: '+miss.join(' | '));
});
