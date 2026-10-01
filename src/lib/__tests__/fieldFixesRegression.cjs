// Fallos vistos jugando en un iPhone y un Samsung: animación que se lanza sola (Batu + Pluma Fénix), manos
// que se despliegan solas, tomates, transición de turno, final lento en el invitado, pantalla que se apaga
// (desconexiones) y márgenes tras pellizcar.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f),read=f=>fs.readFileSync(lib(f),'utf8'),script=s=>s.replace(/<\/?script>/g,'');
const load=f=>import(pathToFileURL(lib(f)).href);
function clock(extra={}){
  let now=1_000_000,id=0;const timers=new Map();
  const env={Date:{now:()=>now},Math,JSON,console,Object,Array,String,Number,Promise,parseInt,
    setTimeout:(f,ms)=>{timers.set(++id,{f,at:now+ms,rep:0});return id;},setInterval:(f,ms)=>{timers.set(++id,{f,at:now+ms,rep:ms});return id;},
    clearTimeout:i=>timers.delete(i),clearInterval:i=>timers.delete(i),...extra};
  env.window=env;
  const advance=ms=>{const end=now+ms;while(now<end){now=Math.min(end,now+20);for(const [i,t] of [...timers])if(t.at<=now){if(t.rep)t.at+=t.rep;else timers.delete(i);t.f();}}};
  return {env,advance,now:()=>now,set:v=>{now=v;}};
}
const cls=()=>{const s=new Set();return {add:c=>s.add(c),remove:c=>s.delete(c),contains:c=>s.has(c),toggle:(c,f)=>{(f===undefined?!s.has(c):f)?s.add(c):s.delete(c);},_s:s};};

test('BATU: the "Usada" flag restored after a Phoenix Feather revival is NOT an ability activation (real memory patch + real gate)',async()=>{
  const {ANIM_GUARD_PATCH}=await load('animGuardPatch.js'),{ABILITY_USED_MEMORY_PATCH}=await load('abilityUsedMemoryPatch.js');
  const c=clock();vm.runInNewContext(script(ANIM_GUARD_PATCH),c.env);
  const memo=c.env.bfNewAbilityMemo(),key='p_batu',gate=(h,aw)=>c.env.bfAbilityGate(memo,key,h,c.now(),aw);
  const batu={id:'batu',alive:true,abilityUsed:false,eliteMode:false};
  assert.equal(gate(batu),'baseline');
  batu.abilityUsed=true;assert.equal(gate(batu),'play','a REAL activation still plays its animation');
  c.advance(60000);
  // muere y renace ÉLITE: el motor pone el flag a false a propósito
  batu.alive=false;gate(batu);batu.alive=true;batu.eliteMode=true;batu.abilityUsed=false;gate(batu);
  // muere otra vez y la Pluma Fénix lo revive en forma NORMAL; abilityUsedMemoryPatch restaura "Usada" (REAL)
  batu.alive=false;gate(batu);
  const env2=clock({G:{team:{p:[batu],o:[]}}}).env;let revived=null;env2.reviveHero=function(t){t.alive=true;t.eliteMode=false;t.abilityUsed=false;revived=t;return 'ok';};
  batu._bfAbUsedNorm=true;vm.runInNewContext(script(ABILITY_USED_MEMORY_PATCH),env2);env2.reviveHero(batu,.5);
  assert.equal(batu.abilityUsed,true,'the panel shows "Usada" again');assert.match(String(batu._bfAbRestoredAt),/^\d+:[a-z0-9]+$/,'the restoration is marked (it travels in the snapshot)');
  const verdict=gate(batu);assert.notEqual(verdict,'play','THE BUG: Batu launched his normal ability animation on rebirth');assert.equal(verdict,'restored');
  assert.equal(gate(batu),'idle','and it does not fire later either');
  // la guest recibe el snapshot con el mismo flag: tampoco anima
  const memoG=c.env.bfNewAbilityMemo();c.env.bfAbilityGate(memoG,key,{id:'batu',alive:true,abilityUsed:false},c.now(),false);
  assert.notEqual(c.env.bfAbilityGate(memoG,key,{...batu},c.now(),false),'play','the client does not animate it either');
  // antes: used && !prev  => se animaba
  assert.equal(true&&!false,true,'(old rule: any false->true was an activation)');
});
test('ability gate: first sight is a baseline, a resurrection window is quiet, awaiting targets wait, a new match forgets everything',async()=>{
  const {ANIM_GUARD_PATCH}=await load('animGuardPatch.js'),c=clock();vm.runInNewContext(script(ANIM_GUARD_PATCH),c.env);
  const m=c.env.bfNewAbilityMemo(),g=(k,h,aw)=>c.env.bfAbilityGate(m,k,h,c.now(),aw);
  assert.equal(g('a',{abilityUsed:true}),'baseline','a resumed game / first snapshot arrives with abilities already used: no mass replay');assert.equal(g('a',{abilityUsed:true}),'idle');
  g('b',{abilityUsed:false,alive:true});g('b',{abilityUsed:false,alive:false});g('b',{abilityUsed:false,alive:true});   // renace
  assert.equal(g('b',{abilityUsed:true,alive:true}),'quiet','state rewritten right after a resurrection');
  g('c',{abilityUsed:false,alive:true});assert.equal(g('c',{abilityUsed:true,alive:true},true),'awaiting');
  g('d',{abilityUsed:false,alive:true});g('d',{abilityUsed:false,alive:false});g('d',{abilityUsed:false,alive:true});c.set(c.now()+4000);assert.equal(g('d',{abilityUsed:true,alive:true}),'play','after the quiet window a real activation plays');
  c.env.bfResetAbilityMemo(m);assert.equal(g('a',{abilityUsed:true}),'baseline','new match: forgotten');
  assert.match(read('abilityAnimPatch.js'),/window\.bfAbilityGate\?window\.bfAbilityGate\(memo,key,h,Date\.now\(\),awaiting\)/);assert.match(read('abilityAnimPatch.js'),/bfOnMatchReset\)window\.bfOnMatchReset\(function\(\)\{if\(window\.bfResetAbilityMemo\)/);
});
test('mobile hand: collapsed by default with NO dependence on repaints; opens only on request; survives re-renders; closes on a new match',async()=>{
  const {MOBILE_HAND_COLLAPSE_PATCH}=await load('mobileHandCollapsePatch.js');
  const store={},sess={getItem:k=>(k in store?store[k]:null),setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}};
  const battle={classList:cls(),id:'s-battle'};let styles=[];
  const mkHand=(id)=>{const title={appendChild(b){this.btn=b;},btn:null};const h={id,classList:cls(),children:[],querySelector(sel){if(sel==='.hand-under-title')return title;if(sel==='.bf-hand-toggle')return title.btn;return null;},querySelectorAll:()=>[]};return h;};
  let hand=mkHand('hand_p');
  const c=clock({sessionStorage:sess,document:{head:{appendChild:s=>styles.push(s)},createElement:t=>({tag:t,textContent:'',innerHTML:'',style:{}}),getElementById:i=>(i==='s-battle'?battle:null),querySelectorAll:()=>[hand]}});
  vm.runInNewContext(script(MOBILE_HAND_COLLAPSE_PATCH),c.env);c.advance(600);
  const css=styles.map(s=>s.textContent).join('');
  for(const id of ['hand_p','hand_o'])assert.ok(css.includes('#s-battle:not(.bf-open-'+id+') #'+id+' > *:not(.hand-under-title){display:none!important}'),id+' is hidden by CSS the moment it exists');
  assert.equal(battle.classList.contains('bf-open-hand_p'),false,'closed by default');
  const tgl=()=>hand.querySelector('.bf-hand-toggle');tgl().onclick({preventDefault(){},stopPropagation(){}});assert.equal(battle.classList.contains('bf-open-hand_p'),true,'the player opened it');assert.equal(store.bfHandOpen_hand_p,'1');
  hand=mkHand('hand_p');c.advance(600);assert.equal(battle.classList.contains('bf-open-hand_p'),true,'a re-render (new hand element) does not close or re-open anything: the state lives on #s-battle');
  tgl().onclick({preventDefault(){},stopPropagation(){}});assert.equal(battle.classList.contains('bf-open-hand_p'),false,'the player closed it');
  tgl().onclick({preventDefault(){},stopPropagation(){}});assert.equal(battle.classList.contains('bf-open-hand_p'),true);
  assert.equal(battle.classList.contains('bf-open-hand_o'),false,'the rival hand is independent');
  c.env.bfOnMatchReset&&0;   // sin MATCH_EPOCH_PATCH en este entorno
});
test('mobile hand: a new match closes the hands again (via the epoch hook)',async()=>{
  const {MOBILE_HAND_COLLAPSE_PATCH}=await load('mobileHandCollapsePatch.js'),{MATCH_EPOCH_PATCH}=await load('matchEpochPatch.js');
  const store={bfHandOpen_hand_p:'1'},sess={getItem:k=>(k in store?store[k]:null),setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}};
  const battle={classList:cls(),id:'s-battle'};battle.classList.add('bf-open-hand_p');
  const c=clock({sessionStorage:sess,document:{head:{appendChild(){}},createElement:()=>({style:{}}),getElementById:i=>(i==='s-battle'?battle:null),querySelectorAll:()=>[]}});
  vm.runInNewContext(script(MATCH_EPOCH_PATCH),c.env);vm.runInNewContext(script(MOBILE_HAND_COLLAPSE_PATCH),c.env);c.advance(300);
  c.env.bfNewMatchEpoch('rematch');assert.equal(battle.classList.contains('bf-open-hand_p'),false);assert.equal(store.bfHandOpen_hand_p,undefined);
});
test('tomatoes: bigger, white box removed (canvas) with a circular crop as fallback, and a real splash',async()=>{
  const {IMAGE_KEY_PATCH}=await load('imageKeyPatch.js'),c=clock();vm.runInNewContext(script(IMAGE_KEY_PATCH),c.env);
  const px=new Uint8ClampedArray([255,255,255,255, 200,40,30,255, 245,245,245,255, 235,235,235,255, 250,210,205,255, 128,128,128,255, 255,254,252,255]);
  c.env.bfKeyOutWhite(px);const a=[];for(let i=3;i<px.length;i+=4)a.push(px[i]);
  assert.equal(a[0],0,'pure white -> transparent');assert.equal(a[1],255,'the red of the tomato is untouched');assert.equal(a[2],0,'light grey -> transparent');assert(a[3]>0&&a[3]<255,'soft edge: '+a[3]);
  assert.equal(a[4],255,'pink highlight kept');assert.equal(a[5],255,'mid grey kept');assert.equal(a[6],0,'off-white -> transparent');
  // bfCutOutImage: éxito y servidor de imágenes sin CORS
  let out='x';const mkImg=(ok)=>function(){const im=this;Object.defineProperty(im,'src',{set(){setTimeout(()=>{im.naturalWidth=2;im.naturalHeight=1;ok?im.onload():im.onerror();},0);}});};
  const ctx={drawImage(){},getImageData:()=>({data:new Uint8ClampedArray([255,255,255,255,200,40,30,255])}),putImageData(){}};
  const okEnv=clock({Image:mkImg(true),document:{createElement:()=>({width:0,height:0,getContext:()=>ctx,toDataURL:()=>'data:image/png;base64,KEYED'})}});vm.runInNewContext(script(IMAGE_KEY_PATCH),okEnv.env);
  okEnv.env.bfCutOutImage('https://x/t.png',u=>{out=u;});await new Promise(r=>setTimeout(r,20));assert.equal(out,'data:image/png;base64,KEYED');
  const badEnv=clock({Image:mkImg(false),document:{createElement:()=>({})}});vm.runInNewContext(script(IMAGE_KEY_PATCH),badEnv.env);let bad='x';badEnv.env.bfCutOutImage('u',u=>{bad=u;});await new Promise(r=>setTimeout(r,20));assert.equal(bad,null,'no CORS -> caller keeps the CSS crop');
  const fx=read('attackFxPatch.js'),m=/\.bf-tomato\{width:(\d+)px;height:(\d+)px[^}]*clip-path:circle/.exec(fx);
  assert.ok(m&&Number(m[1])>=60&&Number(m[2])>=60,'tomato is at least 60px (was 30) and cropped to a circle');assert.doesNotMatch(fx,/\.bf-tomato\{[^}]*mix-blend-mode/,'no reliance on multiply to hide the white');
  assert.match(fx,/\.bf-splat\{width:130px;height:130px/);assert.match(fx,/function splash\(b\)/);assert.match(fx,/splash\(b\); dropsOnCard\(ev,6\)/);assert.match(fx,/img\.src=TOMATO_SRC/);assert.match(fx,/window\.bfCutOutImage\(TOMATO,function\(u\)\{ if\(u\)TOMATO_SRC=u; \}\)/);
  assert.match(fs.readFileSync(lib('gameInject.js'),'utf8'),/NICK_CANON_PATCH \+ IMAGE_KEY_PATCH \+ ANIM_GUARD_PATCH \+ TURN_GLIDE_PATCH \+/,'helpers injected before the patches that use them');
});
test('turn glide: online only, state-driven (works for the guest), one soft cue per hand-off, never re-fires on re-renders',async()=>{
  const {TURN_GLIDE_PATCH}=await load('turnGlidePatch.js'),{MATCH_EPOCH_PATCH}=await load('matchEpochPatch.js');
  const cards={};const mk=(k)=>(cards[k]={classList:cls()});['p_a','o_b','p_c'].forEach(mk);
  let onl=true,renders=0;const c=clock({B:{current:{side:'p',id:'a'}},online:()=>onl,renderBattle(){renders++;},document:{head:{appendChild(){}},createElement:()=>({style:{}}),getElementById:i=>(i.startsWith('b_')?cards[i.slice(2)]||null:null),querySelectorAll:()=>[]}});
  vm.runInNewContext(script(MATCH_EPOCH_PATCH),c.env);vm.runInNewContext(script(TURN_GLIDE_PATCH),c.env);c.advance(400);
  assert.equal(cards.p_a.classList.contains('bf-turn-in'),true,'the active hero gets the hand-off cue');
  c.advance(700);cards.p_a.classList.remove('bf-turn-in');c.advance(500);assert.equal(cards.p_a.classList.contains('bf-turn-in'),false,'once the cue is over it does not repeat on every re-render');
  c.env.B={current:{side:'o',id:'b'}};c.advance(200);
  assert.equal(cards.o_b.classList.contains('bf-turn-in'),true,'next hero glows in');assert.equal(cards.p_a.classList.contains('bf-turn-out'),true,'previous hero fades out');
  // repintado dentro de la ventana: el elemento nuevo recupera el efecto (si no, parpadearía)
  cards.o_b=undefined;mk('o_b');c.env.renderBattle();assert.equal(cards.o_b.classList.contains('bf-turn-in'),true,'re-created card keeps the cue during its window');
  c.advance(900);cards.o_b.classList.remove('bf-turn-in');c.env.renderBattle();assert.equal(cards.o_b.classList.contains('bf-turn-in'),false);
  onl=false;c.env.B={current:{side:'p',id:'c'}};c.advance(300);assert.equal(cards.p_c.classList.contains('bf-turn-in'),false,'vs the AI nothing changes (it already felt right)');
  onl=true;c.env.bfNewMatchEpoch('rematch');c.advance(300);assert.equal(cards.p_c.classList.contains('bf-turn-in'),true,'a new match starts clean');
  const css=read('turnGlidePatch.js');assert.doesNotMatch(css.replace(/\/\/[^\n]*/g,''),/transform\s*:/,'only box-shadow/filter: never transform (other patches own it)');
});
test('final animation: the GUEST never waits as long as the host (7 s / 5 s caps) and slow endings are reported',async()=>{
  const {END_GAME_WAIT_CALM_PATCH}=await load('endGameWaitCalmPatch.js');
  for(const role of ['host','client']){
    const present=new Set(['bf-kill-ov']);const posts=[];let showed=0,endCalls=0;
    const c=clock({B:{over:true},NET:{role},document:{getElementById:i=>present.has(i)?{}:null,body:{classList:{contains:()=>false}}},parent:{postMessage:m=>posts.push(m)}});
    c.env.bfEndCinematic=()=>{endCalls++;};c.env.showResult=()=>{showed++;};c.env.show=()=>{};
    vm.runInNewContext(script(END_GAME_WAIT_CALM_PATCH),c.env);c.advance(400);
    c.env.showResult(true);c.advance(6800);const heldAt6_8=showed===0;c.advance(400);const releasedAt7_2=showed===1;
    if(role==='client'){assert.ok(heldAt6_8&&releasedAt7_2,'client: result released after ~7 s even though something still looks busy');}
    else assert.ok(heldAt6_8&&showed===0,'host: still holding at 7.2 s (30 s cap)');
    // cinemática final: se retiene mientras haya algo en pantalla, con tope
    c.env.bfEndCinematic();assert.equal(endCalls,0);c.advance(role==='client'?5100:8600);c.env.bfEndCinematic();assert.equal(endCalls,role==='client'?1:0,role+' end cinematic cap');
    if(role==='host'){c.advance(1000);c.env.bfEndCinematic();assert.equal(endCalls,1,'host cap is 9 s');}
    // diagnóstico: final que tarda >12 s desde que acabó la partida
    present.clear();c.env.__bfEndT0=c.now()-13500;c.env.__bfSlowEndReported=false;c.env.bfEndCinematic();
    const rep=posts.find(p=>p.bfRelayError&&p.bfRelayError.error_type==='slow_end');assert.ok(rep,'slow ending reported');assert.match(rep.bfRelayError.error_message,new RegExp('role='+role));
  }
});
test('screen wake lock: acquired during an online room, re-acquired on return, released at the end, harmless when unsupported',async()=>{
  const {createWakeLock}=await load('wakeLock.js');
  const mk=(support=true,visible='visible')=>{const log=[];const mkS=()=>{const s={released:false,L:{},addEventListener(t,f){s.L[t]=f;},async release(){s.released=true;log.push('release');s.L.release&&s.L.release();}};return s;};
    const nav=support?{wakeLock:{request:async(t)=>{log.push('request:'+t);const s=mkS();nav.last=s;return s;}}}:{};const L={};const doc={visibilityState:visible,addEventListener:(t,f)=>{L[t]=f;}};return {nav,doc,L,log};};
  let w=mk();let wl=createWakeLock(w.nav,w.doc);assert.equal(wl.supported(),true);
  assert.equal(await wl.keep(),true);assert.equal(wl.isHeld(),true);assert.deepEqual(w.log,['request:screen']);
  await wl.keep();assert.equal(w.log.length,1,'no duplicate requests');
  // el sistema lo libera al ocultar la página; al volver se renueva solo
  await w.nav.last.release();assert.equal(wl.isHeld(),false);w.doc.visibilityState='visible';w.L.visibilitychange();await new Promise(r=>setImmediate(r));assert.equal(wl.isHeld(),true,'renewed when the page is visible again');
  wl.release();assert.equal(wl.isHeld(),false);w.doc.visibilityState='visible';w.L.visibilitychange();await new Promise(r=>setImmediate(r));assert.equal(wl.isHeld(),false,'after the room ends it is NOT re-acquired');
  // oculto: no pide; sin soporte (iOS < 16.4): no hace nada y no lanza
  w=mk(true,'hidden');wl=createWakeLock(w.nav,w.doc);assert.equal(await wl.keep(),false);assert.equal(w.log.length,0);
  w=mk(false);wl=createWakeLock(w.nav,w.doc);assert.equal(wl.supported(),false);assert.equal(await wl.keep(),false);wl.release();
  const bad={wakeLock:{request:async()=>{throw new Error('NotAllowedError');}}};wl=createWakeLock(bad,{visibilityState:'visible',addEventListener(){}});assert.equal(await wl.keep(),false,'a refusal never breaks the game');
  // release mientras estaba pidiendo: no se queda retenido
  let resolveReq;const slow={wakeLock:{request:()=>new Promise(r=>{resolveReq=r;})}};wl=createWakeLock(slow,{visibilityState:'visible',addEventListener(){}});const p=wl.keep();wl.release();let rel=false;resolveReq({addEventListener(){},async release(){rel=true;}});await p;assert.equal(rel,true);assert.equal(wl.isHeld(),false);
  const br=read('relayBridge.js');assert.match(br,/screenWakeLock\.release\(\);[^\n]*\n\s*room\?\.close\(\)/,'released with the channel');assert.match(br,/screenWakeLock\.keep\(\);\s*\n\s*room = relayRealtimeChannel\(/,'kept while a room is active');
});
test('pinch (REAL patch driven with fingers): never below x1, max x2.5, snaps to exactly x1, blocks iOS native gesture zoom',async()=>{
  const {MOBILE_PINCH_PATCH}=await load('mobilePinchZoomPatch.js'),L={};const posts=[];const timers=[];let now=0;const noop=()=>{};
  const nodeStub=()=>({style:{},appendChild:noop,textContent:'',classList:{add:noop,remove:noop,contains:()=>false}});const style={};
  const env={Math,JSON,Object,Array,Number,String,Date:{now:()=>now},innerWidth:1280,innerHeight:900,scrollTo:noop,getComputedStyle:()=>({}),
    setTimeout:(f,ms)=>{timers.push({f,at:now+ms});return timers.length;},setInterval:(f,ms)=>{timers.push({f,at:now+ms,rep:ms});return timers.length;},clearTimeout:i=>{if(timers[i-1])timers[i-1].f=null;},clearInterval:i=>{if(timers[i-1])timers[i-1].f=null;},
    requestAnimationFrame:f=>{timers.push({f,at:now+16});return timers.length;},cancelAnimationFrame:i=>{if(timers[i-1])timers[i-1].f=null;},MutationObserver:class{observe(){}},
    document:{readyState:'complete',body:{style,classList:{add:noop,remove:noop,contains:()=>false}},head:{appendChild:noop},documentElement:nodeStub(),createElement:nodeStub,getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:(t,f)=>{L[t]=f;}}};
  env.window=env;env.parent={document:{documentElement:{clientWidth:390}},postMessage:m=>posts.push(JSON.parse(JSON.stringify(m))),scrollTo:noop};
  vm.runInNewContext(script(MOBILE_PINCH_PATCH),env);
  const advance=ms=>{const end=now+ms;while(now<end){now=Math.min(end,now+20);for(const t of timers)if(t.f&&t.at<=now){const f=t.f;if(t.rep)t.at+=t.rep;else t.f=null;f();}}};
  const tc=(x1,x2)=>[{identifier:1,clientX:x1,clientY:300},{identifier:2,clientX:x2,clientY:300}];const ev=(touches)=>({touches,preventDefault:noop,stopPropagation:noop,target:{closest:()=>null}});
  const scale=()=>{const m=/scale\(([\d.]+)\)/.exec(style.transform||'');return m?Number(m[1]):1;};
  // gestos nativos de iOS: bloqueados
  ['gesturestart','gesturechange','gestureend'].forEach(t=>{let pd=0;assert.equal(typeof L[t],'function',t+' is intercepted');L[t]({preventDefault(){pd++;}});assert.equal(pd,1,t+' default prevented');});
  // acercar: se limita a x2,5
  L.touchstart(ev(tc(600,680)));L.touchmove(ev(tc(100,1180)));advance(100);assert.equal(scale(),2.5,'zoom is capped at x2.5');
  // alejar todo lo posible: nunca por debajo de x1
  L.touchmove(ev(tc(640,641)));advance(100);assert(scale()>=1,'pinching out never goes below x1: '+scale());
  L.touchend(ev([]));advance(800);assert.equal(scale(),1,'released near x1: snaps to EXACTLY x1');assert.match(style.transform||'',/translate3d\(0px,\s*0px,\s*0(px)?\)|^$|none/,'and with no leftover offset (no black margin): '+style.transform);
  // un zoom intermedio se respeta
  L.touchstart(ev(tc(600,680)));L.touchmove(ev(tc(480,800)));advance(100);L.touchend(ev([]));advance(800);assert(scale()>1.5&&scale()<=2.5,'a deliberate zoom stays: '+scale());
});
test('wiring: the parent also blocks iOS native zoom on the game screen; the chat icon / result button fixes are present',()=>{
  const home=read('../pages/Home.jsx');assert.match(home,/\['gesturestart', 'gesturechange', 'gestureend'\][\s\S]{0,260}\{ passive: false \}/);assert.match(home,/removeEventListener\(n, stop\)/,'cleaned up when leaving the game screen');
  assert.match(read('chromePerfPatch.js'),/var isIOS = false;\s*\n\s*if\(!isChromium \|\| window\.__bfChromePerf\) return;/);
  assert.match(read('missionResultControls.js'),/bf-mission-result-wrap/);
});
