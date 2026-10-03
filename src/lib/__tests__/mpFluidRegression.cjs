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
