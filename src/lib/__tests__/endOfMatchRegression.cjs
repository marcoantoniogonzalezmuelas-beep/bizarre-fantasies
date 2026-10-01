// FINAL DE PARTIDA y PARTIDA ANTERIOR. Orden esperado al ganar (cualquier modalidad):
//   golpe mortal -> repaso de la acción definitiva -> victoria/derrota con retratos -> botones
//   (misiones: la celebración va DESPUÉS de todo eso). Y nada de la partida anterior debe
//   ejecutarse en la siguiente (epoch).
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f),read=f=>fs.readFileSync(lib(f),'utf8'),root=path.join(__dirname,'..','..','..');
const load=f=>import(pathToFileURL(lib(f)).href);
const script=s=>s.replace(/<\/?script>/g,'');
function clock(extra={}){
  let now=1_000_000,id=0;const timers=new Map();
  const env={Date:{now:()=>now},Math,JSON,console,Object,Array,String,Number,Promise,
    setTimeout:(f,ms)=>{timers.set(++id,{f,at:now+ms,rep:0});return id;},setInterval:(f,ms)=>{timers.set(++id,{f,at:now+ms,rep:ms});return id;},
    clearTimeout:i=>timers.delete(i),clearInterval:i=>timers.delete(i),...extra};
  env.window=env;
  const advance=ms=>{const end=now+ms;while(now<end){now=Math.min(end,now+50);for(const [i,t] of [...timers])if(t.at<=now){if(t.rep)t.at+=t.rep;else timers.delete(i);t.f();}}};
  return {env,advance,now:()=>now};
}
// DOM mínimo: registro de nodos por id
function dom(){
  const reg=new Map(),mk=tag=>{const n={tag,id:'',className:'',style:{},children:[],classList:{_s:new Set(),add(c){this._s.add(c);},remove(c){this._s.delete(c);},contains(c){return this._s.has(c);}},
    appendChild(c){this.children.push(c);c.parentNode={removeChild(){if(c.id)reg.delete(c.id);}};if(c.id)reg.set(c.id,c);return c;},addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[]};return n;};
  const body=mk('body'),head=mk('head');
  const d={body,head,createElement:mk,getElementById:i=>reg.get(i)||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}};
  const put=(id,cls=[])=>{const n=mk('div');n.id=id;n.parentNode={removeChild(){reg.delete(id);}};cls.forEach(c=>n.classList.add(c));reg.set(id,n);return n;};
  return {d,reg,put,remove:id=>reg.delete(id)};
}

test('end cinematic (victory/defeat + portraits) waits for the final-action recap, then plays',async()=>{
  const {END_GAME_WAIT_CALM_PATCH}=await load('endGameWaitCalmPatch.js');
  const D=dom(),c=clock({document:D.d,B:{over:true}});let endCalls=0,recapPending=false;
  c.env.document.body.classList=D.d.body.classList;
  c.env.bfEndCinematic=()=>{endCalls++;};c.env.showResult=()=>{};c.env.show=()=>{};c.env.__bfRecapPending=()=>recapPending;
  vm.runInNewContext(script(END_GAME_WAIT_CALM_PATCH),c.env);c.advance(400);
  D.put('bf-recap');c.env.bfEndCinematic();assert.equal(endCalls,0,'recap on screen: the end cinematic must NOT start under it');
  D.remove('bf-recap');recapPending=true;c.env.bfEndCinematic();assert.equal(endCalls,0,'recap about to appear: still waits');
  recapPending=false;c.env.bfEndCinematic();assert.equal(endCalls,1,'recap done: now the victory/defeat animation with the portraits plays');
  D.put('bf-kill-ov');c.env.bfEndCinematic();assert.equal(endCalls,1,'a kill cinematic still on screen also holds it');
});
test('the result screen is held until calm, and a result held from the PREVIOUS match is dropped',async()=>{
  const {END_GAME_WAIT_CALM_PATCH}=await load('endGameWaitCalmPatch.js');
  const D=dom(),c=clock({document:D.d,B:{over:true}});const shown=[];
  c.env.document.body.classList=D.d.body.classList;c.env.bfEndCinematic=()=>{};c.env.showResult=function(...a){shown.push(['showResult',...a]);};c.env.show=function(id){shown.push(['show',id]);};
  vm.runInNewContext(script(END_GAME_WAIT_CALM_PATCH),c.env);c.advance(400);
  c.env.show('s-battle');assert.deepEqual(shown.splice(0),[['show','s-battle']],'other screens are never delayed');
  D.put('bf-abil-anim');c.env.showResult(true);c.env.show('s-result');c.advance(1000);assert.equal(shown.length,0,'held while the last action animates');
  D.remove('bf-abil-anim');c.advance(400);assert.deepEqual(shown.splice(0),[['showResult',true],['show','s-result']],'released once calm, in order');
  // partida nueva mientras se retenía: NO debe aparecer el resultado de la anterior
  D.put('bf-spec-cine');c.env.showResult(false);c.env.show('s-result');c.advance(600);
  c.env.__bfMatchEpoch=1;D.remove('bf-spec-cine');c.advance(2000);
  assert.equal(shown.length,0,'the old match result must never show up in the new match');
});
test('final-action recap announces itself as pending until it has played',async()=>{
  const {FINAL_ACTION_RECAP_PATCH}=await load('finalActionRecapPatch.js');
  const D=dom(),c=clock({document:D.d});vm.runInNewContext(script(FINAL_ACTION_RECAP_PATCH),c.env);
  const res=D.put('s-result');
  assert.equal(c.env.__bfRecapPending(),false,'result screen not active');
  res.classList.add('active');assert.equal(c.env.__bfRecapPending(),false,'no final blow recorded');
  c.env.__bfFinalBlow={ts:5,kind:'attack',actorName:'Ana',victimName:'Bob',amount:7,actorKey:'a',victimKey:'b'};
  assert.equal(c.env.__bfRecapPending(),true,'a recap is due: the end cinematic must wait');
  c.advance(350);assert.ok(D.reg.get('bf-recap'),'the recap is on screen');assert.equal(c.env.__bfRecapPending(),true);
  D.remove('bf-recap');assert.equal(c.env.__bfRecapPending(),false,'played: end cinematic may start');
  c.env.__bfFinalBlow={ts:6,kind:'attack',actorName:'C',victimName:'D',amount:1};assert.equal(c.env.__bfRecapPending(),true,'next match: pending again');
  c.env.__bfKillFinalShown=6;assert.equal(c.env.__bfRecapPending(),false,'already covered by the kill scene: no recap, no wait');
});
test('match epoch: a new match removes leftover overlays, clears flags and tells every patch to reset',async()=>{
  const {MATCH_EPOCH_PATCH}=await load('matchEpochPatch.js');
  const D=dom(),c=clock({document:D.d});let inits=0,seenArgs=null;
  c.env.initGame=function(...a){inits++;seenArgs=a;return 'g';};
  vm.runInNewContext(script(MATCH_EPOCH_PATCH),c.env);c.advance(400);
  assert.equal(c.env.__bfMatchEpoch,0);const calls=[];c.env.bfOnMatchReset(w=>calls.push(['a',w]));c.env.bfOnMatchReset(()=>{throw new Error('a patch failing must not block the rest');});c.env.bfOnMatchReset(w=>calls.push(['c',w]));
  ['bf-recap','bf-kill-ov','bf-end-cine','bf-end-heroes','bf-abil-anim'].forEach(i=>D.put(i));
  c.env.__bfFinalBlow={ts:1};c.env.__bfDeathDelayUntil=99;c.env.__bfEndCineDoneAt=5;c.env.__bfResultSent=true;
  assert.equal(c.env.bfNewMatchEpoch('rematch'),1);
  for(const i of ['bf-recap','bf-kill-ov','bf-end-cine','bf-end-heroes','bf-abil-anim'])assert.equal(D.d.getElementById(i),null,i+' removed');
  assert.equal(c.env.__bfFinalBlow,null);assert.equal(c.env.__bfDeathDelayUntil,0);assert.equal(c.env.__bfEndCineDoneAt,0);assert.equal(c.env.__bfResultSent,false);
  assert.deepEqual(calls,[['a','rematch'],['c','rematch']],'all hooks ran, in order, despite one throwing');
  // cualquier partida nueva (IA, local, revancha, online) pasa por initGame y sube el epoch
  const r=c.env.initGame('A','B',true);assert.equal(r,'g');assert.equal(inits,1);assert.deepEqual([...seenArgs],['A','B',true]);assert.equal(c.env.__bfMatchEpoch,2);
});
test('deferred end-of-turn / kill scene from the previous match never fire in the next one',async()=>{
  const {FINAL_CINEMATIC_PATCH}=await load('finalCinematicPatch.js');
  const D=dom(),c=clock({document:D.d});let turns=0;c.env.endTurn=()=>{turns++;};c.env.flushFx=()=>{};
  vm.runInNewContext(script(FINAL_CINEMATIC_PATCH),c.env);c.advance(400);
  // control: una muerte aplaza el siguiente endTurn y SÍ se ejecuta en la misma partida
  c.env.flushFx([{k:'death',side:'o',id:'x'}]);c.env.endTurn();c.advance(5000);assert.equal(turns,1,'same match: the delayed end of turn still runs');
  // partida nueva mientras estaba aplazado: NO se ejecuta
  c.env.flushFx([{k:'death',side:'o',id:'y'}]);c.env.endTurn();c.env.__bfMatchEpoch=1;c.advance(5000);assert.equal(turns,1,'new match: the old end of turn is dropped');
});
test('multiplayer turn step: a pending end of turn from the previous match is dropped (guest weirdness)',async()=>{
  const {MP_TURN_SEQUENCE_PATCH}=await load('mpTurnSequencePatch.js');
  const D=dom(),c=clock({document:D.d});let n=0,busy=true;
  c.env.__bfIndicatorsBusy=()=>busy;vm.runInNewContext(script(MP_TURN_SEQUENCE_PATCH),c.env);
  c.env.bfStepWhenCalm(()=>n++);c.advance(300);c.env.__bfMatchEpoch=1;busy=false;c.advance(2000);assert.equal(n,0,'epoch changed while waiting: never fires');
  c.env.bfStepWhenCalm(()=>n++);c.advance(2000);assert.equal(n,1,'a step requested in the CURRENT match still runs');
});
test('mission celebration comes LAST: after the final-action recap and the victory animation (30 s fallback)',async()=>{
  const tmp=path.join(os.tmpdir(),'bf-mission-'+process.pid+'.mjs');
  fs.writeFileSync(tmp,read('missionEnginePatch.js').replace("'@/lib/missionResultControls'",JSON.stringify(pathToFileURL(lib('missionResultControls.js')).href)));
  const {MISSION_ENGINE_PATCH}=await import(pathToFileURL(tmp).href);fs.unlinkSync(tmp);
  const messages=[],intervals=[],handlers={};let visible=false,recap=false,recapPending=false;
  const clk=clock();const root={querySelectorAll:()=>[],contains:()=>false,appendChild(){},ownerDocument:null};
  Object.assign(clk.env,{G:{names:{p:'QA'},_result:null},B:null,NET:{},HEROES:[{id:'a'},{id:'b'},{id:'c'}],parent:{postMessage:m=>messages.push(m)},
    makeInstance:h=>({...h}),aiEquip(){},show(){},renderEquip(){},clearWatchdog(){},goSetup(){},
    setInterval:f=>intervals.push(f),addEventListener:(k,f)=>{handlers[k]=f;},__bfRecapPending:()=>recapPending,__bfEndCineDoneAt:0,
    document:{head:{appendChild(){}},createElement:()=>({removeAttribute(){},getAttribute:()=>'',remove(){}}),getElementById:i=>(i==='bf-recap'&&recap?{}:null),addEventListener(){},querySelector:s=>s==='#s-result.active'?(visible?root:null):null}});
  root.ownerDocument=clk.env.document;
  vm.createContext(clk.env);vm.runInContext(script(MISSION_ENGINE_PATCH),clk.env);
  const c=clk.env,send=data=>handlers.message({source:c.parent,data}),tick=()=>intervals.forEach(f=>f()),ready=()=>messages.filter(m=>m.bfMissionCelebrationReady).length;
  const advance=ms=>{clk.advance(ms);};
  const win=(id)=>{send({bfMissionStart:{nick:'qa',run_id:id,mission:'todos',level:2,ai:'novice',player:['a','b','c'],rival:['a','b','c']}});tick();
    c.B={over:true};c.G._result={pWin:true};c.G._gameOver=true;visible=true;c.__bfEndCineDoneAt=0;tick();};
  // 1) con el repaso en pantalla / pendiente: nada
  win('run-1');advance(1300);recap=true;recapPending=true;tick();assert.equal(ready(),0,'not while the recap shows');
  // 2) repaso terminado pero la animación de victoria todavía no se ha reproducido: nada
  recap=false;recapPending=false;advance(2000);tick();assert.equal(ready(),0,'the victory/defeat animation has not run yet');
  advance(5000);tick();assert.equal(ready(),0,'still waiting at ~8 s: the end animation can take that long');
  // 3) la animación terminó (la cinemática real pone esta marca al cerrarse): ahora sí, una sola vez
  c.__bfEndCineDoneAt=clk.now();tick();tick();assert.equal(ready(),1,'celebration after everything else, exactly once');
  // 4) respaldo: si la animación final no llegó a reproducirse, a los 30 s sale igualmente
  messages.length=0;win('run-2');advance(1300);tick();assert.equal(ready(),0);advance(31000);tick();assert.equal(ready(),1,'fallback after 30 s');
});
test('relay channel tags everything it pushes with its ROOM code (the parent used to forward stale rooms blindly)',async()=>{
  const tmp=path.join(os.tmpdir(),'bf-rt-'+process.pid+'.mjs');
  fs.writeFileSync(tmp,read('relayRealtimeChannel.js').replace("import { base44 } from '@/api/base44Client';","const base44 = globalThis.__fakeBase44;"));
  let cb;const sent=[];globalThis.__fakeBase44={actors:{GameRelayRoom:()=>({connect:()=>({subscribe:f=>{cb=f;return {unsubscribe(){}};},send:m=>sent.push(m),close(){}})})}};
  globalThis.sessionStorage={getItem:()=>null,setItem(){}};
  const mod=await import(pathToFileURL(tmp).href);fs.unlinkSync(tmp);
  const posted=[],ch=mod.default('ABC123','g',m=>posted.push(JSON.parse(JSON.stringify(m))),'tok');
  cb({type:'ready',peers:['p']});cb({type:'presence',side:'p',connected:true});cb({type:'deliveries',side:'p',deliveries:[{id:'x',data:{t:'ping'}}]});
  assert(posted.length>=4,'messages were posted: '+posted.length);
  for(const m of posted)assert.equal(m.bfRelayCode,'ABC123',JSON.stringify(m));
  assert(posted.some(m=>m.bfRelayPush&&m.bfRelayPush.deliveries.length===1),'the push itself is still delivered');
  assert(posted.some(m=>m.bfRelayRealtimeStatus==='ready'));ch.close();delete globalThis.__fakeBase44;delete globalThis.sessionStorage;
});
test('wiring: iframe ignores other rooms, the bridge closes the old channel, buttons and the final cinematic are in place',()=>{
  const sr=read('serverRelayPatch.js'),br=read('relayBridge.js'),mm=read('matchModePatch.js'),rm=read('rematchPatch.js'),inj=read('gameInject.js'),entry=fs.readFileSync(path.join(root,'base44/functions/gameHtml/entry.ts'),'utf8');
  assert.match(sr,/var fromCode=event\.data&&event\.data\.bfRelayCode;\s*if\(fromCode\)\{var mine=relayCode\|\|pendingRelayCode;if\(!mine\|\|fromCode!==mine\)return;\}/);
  assert.match(sr,/pendingRelayCode = joinCode; relayCode = '';/);assert.match(sr,/pendingRelayCode = cleanCode; relayCode = '';/);assert.match(sr,/bfRelayIdle: true/);
  assert.match(sr,/if \(res\.match_id\) \{ window\.__bfMatchId = res\.match_id;/);assert.equal((sr.match(/bfNewMatchEpoch\('(join|host|resume)'\)/g)||[]).length,3,'every new session starts a new epoch');
  assert.match(br,/if \(event\.data\?\.bfRelayIdle\) \{ closeRealtime\(\); return; \}/);
  assert.match(inj,/DOM_BUS_PATCH \+ MATCH_EPOCH_PATCH \+/,'epoch patch is injected BEFORE the patches that register reset hooks');
  assert.match(rm,/bfNewMatchEpoch\('rematch'\)/);
  // botones
  assert.match(mm,/Volver a jugar<\/button>'\+/,'guest gets a rematch button');assert.match(mm,/id="bf-rematch-btn" onclick="bfMatchRematch\(\)"/);
  assert.match(mm,/var E = window\.bfEscH/,'nicks are escaped on the result screen');assert.doesNotMatch(mm,/'<div class="bf-score-name">'\+nameP/,'sanity: names are already escaped when assigned');
  assert.match(rm,/function ensureExit\(root\)/);assert.match(rm,/G\.demo \|\| G\.bfMission/,'missions and demo are excluded from the extra Exit button');
  // cinemática final
  const i=entry.indexOf('function bfEndCinematic(forceWin)'),j=entry.indexOf('window.bfKillCinematic=',i),fn=entry.slice(i,j);
  for(const k of ['MIN_SHOW=6500','window.__bfEndCineDoneAt=Date.now()','vd.onended=soon;vd.onerror=soon;','setTimeout(done,12000)','bf-cine-initial','ART_BY_NAME[h.name]'])assert(fn.includes(k),'bfEndCinematic must contain '+k);
  assert(!fn.includes('vd.onended=done;vd.onerror=done;'),'a failing/short video must not close the portraits early');
  // todo parche que aplaza algo comprueba el epoch
  for(const f of ['killCineQueuePatch.js','mpTurnSequencePatch.js','endGameWaitCalmPatch.js','finalCinematicPatch.js','heroDicePatch.js'])assert.match(read(f),/__bfMatchEpoch\|0/,f+' checks the epoch');
  assert.match(read('killCineQueuePatch.js'),/window\.bfOnMatchReset\)window\.bfOnMatchReset\(function\(\)\{/);
});
