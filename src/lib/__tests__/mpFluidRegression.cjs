// Multijugador en iPhone (pantalla negra al volver a la partida) y fluidez de los turnos.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f),read=f=>fs.readFileSync(lib(f),'utf8'),load=f=>import(pathToFileURL(lib(f)).href),script=s=>s.replace(/<\/?script>/g,'');

test('iPhone: sending Safari to the background (share the room code, lock the screen) no longer leaves a black loading screen over the match',()=>{
  const h=read('../pages/Home.jsx');
  const m=/const RELOAD_COVER_PATCH = `<script>(.*?)<\/script>`;/.exec(h);assert.ok(m);
  // ejecutar el aviso del juego: solo una recarga REAL avisa a la página
  const run=(persisted,vis)=>{const posts=[];let handler=null;const env={window:{addEventListener:(t,f)=>{if(t==='pagehide')handler=f;}},document:{visibilityState:vis},parent:{postMessage:m=>posts.push(m)}};env.window.document=env.document;vm.runInNewContext(m[1].replace(/window\./g,'window.'),env);handler({persisted});return posts.length;};
  assert.equal(run(true,'visible'),0,'page kept in memory (persisted): no reload notice');assert.equal(run(false,'hidden'),0,'tab hidden (background): no reload notice');assert.equal(run(false,'visible'),1,'a real reload still covers the screen');
  assert.match(h,/reloadCoverRef\.current = true;[\s\S]{0,260}setTimeout\(\(\) => \{ reloadCoverRef\.current = false; setLoading\(false\); \}, 4000\)/,'the cover removes itself if the game never reloads');
  assert.match(h,/document\.addEventListener\('visibilitychange', back\);/);assert.match(h,/window\.addEventListener\('pageshow', back\);/);
});
test('FLUIDITY: reading time of the combat captions is 65 % (min 1.2 s) and they still pause during cinematics',async()=>{
  const {COMBAT_INDICATOR_SEQUENCE_PATCH:P}=await load('combatIndicatorSequencePatch.js');
  const env={Date,Math,Number,Array,JSON,setInterval(){},MutationObserver:function(){this.observe=function(){};},document:{body:{classList:{contains:()=>false}},querySelector:()=>null,getElementById:()=>null},window:{}};env.window=env;
  vm.runInNewContext(script(P),env);
  const q=[];const orig=env.__bfQueueIndicator;assert.equal(typeof orig,'function');
  // leer la duración que se encola
  const src=script(P);assert.match(src,/READ_SCALE=0\.65,READ_MIN=1200/);
  const d=x=>Math.max(1200,Math.round(x*0.65));assert.deepEqual([2250,3300,4800,1000].map(d),[1463,2145,3120,1200]);
  assert.match(src,/n\.style\.animationPlayState=hold\?'paused':'running'/,'captions pause while a cinematic is on screen');
  assert.match(read('aiWaitCinePatch.js'),/var QUIET_MS=450;/);
});
test('AI strategy hook: passes the end-of-turn callback and never lets the AI act twice in one turn',()=>{
  const s=read('aiStrategyPatch.js');
  assert.match(s,/window\.useAbility\(side, hero, function\(\)\{ if \(typeof window\.endTurn === 'function'\) window\.endTurn\(\); \}\);/,'without it the engine called an undefined function and the turn hung');
  assert.match(s,/B\.__bfStratQi = B\.qi;/);assert.match(s,/if \(typeof B !== 'undefined' && B && B\.__bfStratQi === B\.qi\) return;/);
});
test('REBIRTH during its own ability (Patito hits Juniana, the reflection kills it, it comes back ELITE): the elite ability stays available',async()=>{
  const {REBIRTH_ABILITY_PATCH:P}=await load('rebirthAbilityPatch.js');
  const mk=(dieAndRebirth,withDone)=>{
    let fin=0,closed=0;const h={id:'d',alive:true,eliteMode:false,abilityUsed:false,eliteUsed:false};
    const env={setInterval(){},window:{},renderBattle(){},finishAct(){fin++;}};env.window=env;
    env.useAbility=function(side,hero,done){ if(dieAndRebirth){hero.eliteMode=true;hero.eliteUsed=true;hero.abilityUsed=false;} hero.abilityUsed=true; done(); };
    vm.runInNewContext(script(P),env);
    env.useAbility('p',h,withDone?function(){closed++;}:undefined);
    return {h,fin,closed};
  };
  let r=mk(true,true);assert.equal(r.h.eliteMode,true);assert.equal(r.h.abilityUsed,false,'reborn elite during its own ability: elite ability NOT spent');assert.equal(r.h.eliteUsed,true,'the rebirth itself stays spent');assert.equal(r.closed,1);
  r=mk(false,true);assert.equal(r.h.abilityUsed,true,'a normal use is still marked as used');
  r=mk(false,false);assert.equal(r.fin,1,'no close callback given: the action is closed instead of hanging the turn');
  assert.match(read('gameInject.js'),/SPELL_STEPS_PATCH \+ REBIRTH_ABILITY_PATCH/);
});
test('END ANIMATION always carries the 6 heroes: retried if it failed half-way, heroes put back from the battle lineup if missing',()=>{
  const s=read('endGuardPatch.js');
  assert.match(s,/if\(window\.__bfEndCine===1&&!cineEl&&!window\.__bfEndCineDoneAt&&Date\.now\(\)-resultSince>2000&&cineRetries<3\)\{/);assert.match(s,/cineRetries\+\+;window\.__bfEndCine=0;/);
  assert.match(s,/if\(!cineEl\.querySelector\('\.bf-cine-hero'\)\)injectLineup\(cineEl\);/);assert.match(s,/function injectLineup\(cineEl\)/);
  assert.match(s,/class="bf-cine-team bf-cine-local">'\+team\(mySide\)\+'<\/div><\/div><div class="bf-cine-vs">VS<\/div><div class="bf-cine-side">'\+pb\(rival,window\.bfOppAvatar\)\+'<div class="bf-cine-team bf-cine-rival">'\+team\(rival\)/,'3 + 3 heroes (each team under its player avatar) inside the same animation, with VS');
});
test('END ANIMATION: each player avatar sits ABOVE its 3 heroes inside the animation; the result screen no longer adds the avatar box',()=>{
  const e=fs.readFileSync(path.join(__dirname,'..','..','..','base44/functions/gameHtml/entry.ts'),'utf8');
  assert.match(e,/lineup='<div class="bf-cine-side">'\+playerBox\(mySide,window\.bfMyAvatar\)\+'<div class="bf-cine-team bf-cine-local">'/);
  assert.match(e,/<div class="bf-cine-vs">VS<\/div><div class="bf-cine-side">'\+playerBox\(rivalSide,window\.bfOppAvatar\)\+'<div class="bf-cine-team bf-cine-rival">'/);
  assert.match(e,/\.bf-cine-player img,\.bf-cine-pinit\{/);assert.match(e,/querySelectorAll\('\.bf-cine-hero,\.bf-cine-player'\)/,'forced visible with the heroes');
  assert.match(read('endGuardPatch.js'),/'<div class="bf-cine-side">'\+pb\(mySide,window\.bfMyAvatar\)/,'the safety net builds the same layout');
  const a=read('avatarPatch.js');const i=a.indexOf('function injectResultAvatars()');const body=a.slice(i,a.indexOf('setInterval(function(){ injectScoreAvatars()',i));
  assert.match(body,/old\.parentNode\.remove\(\)/);assert.doesNotMatch(body,/insertBefore/,'no avatar box added to the result screen');
});
test('DISORIENTED: the damage number shows on the hero that REALLY took the hit, not on the original target',()=>{
  assert.match(read('monkgetaAbilityPatch.js'),/if\(target!==calledTarget\)\{window\.__bfDmgRedirect=\{from:calledTarget,to:target\};/);
  assert.match(read('damageNumberPatch.js'),/if\(rd && rd\.from === target && rd\.to\)\{ before = undefined; target = rd\.to; \}/);
});
test('DOJI threat: fires on the FIRST hit even if that hit kills him (he is reborn elite right away), uses the common dice, and a 1 kills for good',()=>{
  const s=read('dojiConpuriAbilityPatch.js');
  assert.match(s,/var hit = Number\(dealt\) > 0 \|\| hpBefore > \(target\.hp\|\|0\) \|\| \(wasAlive && !target\.alive\) \|\| \(!wasElite && !!target\.eliteMode\);/,'the lethal hit counts (before: reborn elite with more HP, the threat stayed armed and fired later)');
  assert.match(s,/if\(armedThreat && target\._bfDojiThreat && hit\)\{\s*target\._bfDojiThreat = false;/);
  assert.match(s,/typeof window\.__bfDie === 'function'\) \? Number\(window\.__bfDie\(2\)\)/,'same dice generator as the rest of the game');
  assert.match(s,/victim\.eliteUsed = true; victim\._bfNoElite = 1;/,'a 1 kills definitively: no elite rebirth');
});
test('DRAW: when the last heroes of BOTH sides fall at once, the side that made the move wins (before: always side "p")',async()=>{
  const {DRAW_RULE_PATCH:P}=await load('drawRulePatch.js');
  const run=(actor,role)=>{let shown=null,sent=null,origCalls=0;const env={B:{over:false,current:{side:actor}},G:{names:{p:'Ana',o:'IA'}},NET:{role:role||'local',mySide:'o'},living:()=>[],pushLog(){},clearWatchdog(){},netSync(){},netSend:m=>{sent=m;},showResult:w=>{shown=w;},setInterval(){},setTimeout:(f)=>f(),window:{}};env.window=env;env.checkWin=function(){origCalls++;return 'orig';};
    vm.runInNewContext(script(P),env);const r=env.checkWin();return {r,shown,sent,res:env.G._result,origCalls};};
  let x=run('p');assert.equal(x.res.pWin,true);assert.equal(x.shown,true);assert.equal(x.res.tie,true);assert.equal(x.origCalls,0);
  x=run('o');assert.equal(x.res.pWin,false,'the AI made the move: the AI wins');assert.equal(x.shown,false);
  x=run('o','host');assert.deepEqual(JSON.parse(JSON.stringify(x.sent)),{t:'end',pWin:false},'online: the guest made the move, the guest wins (before: the host always won)');
  // sin empate: el motor decide como siempre
  const env2={B:{over:false,current:{side:'p'}},G:{},NET:{role:'local'},living:s=>s==='o'?[{}]:[],setInterval(){},window:{}};env2.window=env2;let c=0;env2.checkWin=function(){c++;return 'orig';};vm.runInNewContext(script(P),env2);assert.equal(env2.checkWin(),'orig');assert.equal(c,1);
  assert.match(read('gameInject.js'),/REBIRTH_ABILITY_PATCH \+ DRAW_RULE_PATCH/);
});
test('ONLY bizarro abilities may do nothing; any Crane (summoned or drafted) heals every turn',async()=>{
  const {ABILITY_SEED}=await load('abilitySeed.js');
  const noop=ABILITY_SEED.filter(r=>JSON.stringify(r.params||{}).includes('"noop"')).map(r=>r.card_id+(r.elite?'|e':'|n')).sort();
  assert.deepEqual(noop,['tk_buf|n','tk_caj|n','tk_lav|n'],'Butifarra, Caja de Zapatos and Lavadora (normal) are the only do-nothing abilities');
  const c=read('craneSummonPatch.js');
  assert.match(c,/function isCrane\(h\)\{ return !!\(h && \(h\._bfCrane \|\| h\.id === 'tk_grulla'/);
  assert.match(c,/if\(h && h\.alive && isCrane\(h\) && h\._bfHealRound !== B\.round\)\{/,'drafted Crane heals too (before: only the one summoned by Daidoji)');
  assert.match(c,/if\(!h \|\| !isCrane\(h\)\) return;/);
});
