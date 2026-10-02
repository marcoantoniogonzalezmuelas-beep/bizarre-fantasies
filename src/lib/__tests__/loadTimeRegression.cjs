// TIEMPO DE CARGA: caché del HTML con revalidación, descarga adelantada, bloque de parches aparte y
// páginas perezosas. Incluye la prueba de que la extracción de parches no dejó caer NINGUNO.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f),root=path.join(__dirname,'..','..','..'),read=f=>fs.readFileSync(lib(f),'utf8');
const html=(n)=>'<html>'+'x'.repeat(Math.max(1100,n||0))+'</html>';
function memBackend(){const m=new Map();return {m,async get(k){return m.get(k);},async put(k,v){m.set(k,JSON.parse(JSON.stringify(v)));},async del(k){m.delete(k);}};}
async function mods(){
  const {createGameHtmlStore,GAME_HTML_MAX_AGE_MS}=await import(pathToFileURL(lib('gameHtmlCache.js')).href);
  const tmp=path.join(os.tmpdir(),'bf-loader-'+process.pid+'.mjs');
  fs.writeFileSync(tmp,read('gameHtmlLoader.js').replace("import { base44 } from '@/api/base44Client';","const base44 = { functions: { invoke: async () => { throw new Error('no network in tests'); } } };").replace("import { createGameHtmlStore, idbBackend } from '@/lib/gameHtmlCache';","import { createGameHtmlStore, idbBackend } from "+JSON.stringify(pathToFileURL(lib('gameHtmlCache.js')).href)+";"));
  const {createGameHtmlLoader}=await import(pathToFileURL(tmp).href);fs.unlinkSync(tmp);return {createGameHtmlStore,GAME_HTML_MAX_AGE_MS,createGameHtmlLoader};
}
const rig=async(over={})=>{
  const {createGameHtmlStore,createGameHtmlLoader,GAME_HTML_MAX_AGE_MS}=await mods();let clock=1_000_000,calls=[],body=html(2000),fail=null,hdr='srv-1';
  const backend=over.backend||memBackend(),store=createGameHtmlStore(backend,()=>clock);
  const invoke=async(name,payload)=>{calls.push([name,payload]);if(fail)throw fail;return {data:body,headers:{'x-bf-patch-version':hdr}};};
  const make=(version='v1')=>createGameHtmlLoader({invoke,store,version,now:()=>clock});
  return {backend,store,calls,make,tick:ms=>{clock+=ms;},setBody:b=>{body=b;},setFail:e=>{fail=e;},setHdr:h=>{hdr=h;},GAME_HTML_MAX_AGE_MS};
};

test('first visit: network once and the copy is stored; the request cannot be cached by the browser (random params kept)',async()=>{
  const r=await rig(),L=r.make();const a=await L.load(1);
  assert.equal(a.source,'network');assert.equal(r.calls.length,1);assert.equal(r.calls[0][0],'gameHtml');assert.equal(r.calls[0][1].attempt,1);assert.ok(r.calls[0][1].r&&r.calls[0][1].t);
  await new Promise(x=>setImmediate(x));assert.equal((await r.store.get('v1')).serverVersion,'srv-1');
});
test('next visit: instant from the local copy, refreshed in the BACKGROUND for the visit after',async()=>{
  const r=await rig();await r.make().load(1);await new Promise(x=>setImmediate(x));r.calls.length=0;
  const newer=html(3000);r.setBody(newer);r.setHdr('srv-2');
  const t0=Date.now();const b=await r.make().load(1);
  assert.equal(b.source,'cache');assert.equal(b.html,html(2000),'serves the stored copy immediately, not the fresh one');assert(Date.now()-t0<50);
  await b.refresh;assert.equal(r.calls.length,1,'one background revalidation');assert.equal((await r.store.get('v1')).html,newer,'copy updated for the next visit');assert.equal((await r.store.get('v1')).serverVersion,'srv-2');
});
test('a NEW client version never starts with the old HTML (patches assume their own HTML); expired copies are not used',async()=>{
  const r=await rig();await r.make('v1').load(1);await new Promise(x=>setImmediate(x));r.calls.length=0;
  assert.equal((await r.make('v2').load(1)).source,'network','different client version: copy ignored');assert.equal(r.calls.length,1);
  await new Promise(x=>setImmediate(x));r.calls.length=0;r.tick(r.GAME_HTML_MAX_AGE_MS+1000);
  assert.equal((await r.make('v2').load(1)).source,'network','older than 6 h: fetched again (card edits always arrive)');
});
test('download starts early (warm) in parallel with auth; Home reuses it: ONE request, no duplicates',async()=>{
  const r=await rig(),L=r.make();await L.warm();await new Promise(y=>setImmediate(y));assert.equal(r.calls.length,1,'no copy yet: download started right away');
  const x=await L.load(1);assert.equal(x.source,'preload');assert.equal(r.calls.length,1,'Home reused the in-flight download');
  await new Promise(y=>setImmediate(y));const L2=r.make();r.calls.length=0;await L2.warm();await new Promise(y=>setImmediate(y));assert.equal(r.calls.length,0,'with a stored copy nothing is downloaded up front');
});
test('a stale early download is not trusted; a failed one falls back to a normal request',async()=>{
  const r=await rig(),L=r.make();await L.warm();await new Promise(y=>setImmediate(y));r.tick(120000);const x=await L.load(1);assert.equal(x.source,'network');assert.equal(r.calls.length,2);
  const r2=await rig(),L2=r2.make();r2.setFail(new Error('503'));await L2.warm();await new Promise(y=>setImmediate(y));r2.setFail(null);const y=await L2.load(1);assert.equal(y.source,'network','early download failed -> normal fetch');
});
test('retries (attempt > 1) discard the local copy in case it was the problem; bad responses are never stored',async()=>{
  const r=await rig();await r.make().load(1);await new Promise(x=>setImmediate(x));assert.ok(await r.store.get('v1'));
  r.calls.length=0;const z=await r.make().load(2);assert.equal(z.source,'network');assert.equal(r.calls[0][1].attempt,2);
  const r2=await rig();r2.setBody('tiny');await assert.rejects(()=>r2.make().load(1),/empty/);await new Promise(x=>setImmediate(x));assert.equal(await r2.store.get('v1'),null,'nothing stored');
  const r3=await rig();r3.setFail(new Error('network down'));await assert.rejects(()=>r3.make().load(1),/network down/);
});
test('a broken cache backend (private mode, quota) never breaks loading',async()=>{
  const broken={async get(){throw new Error('idb blocked');},async put(){throw new Error('quota');},async del(){throw new Error('x');}};
  const r=await rig({backend:broken});const a=await r.make().load(1);assert.equal(a.source,'network');const b=await r.make().load(1);assert.equal(b.source,'network');
  const {createGameHtmlStore}=await mods();const none=createGameHtmlStore(null);assert.equal(await none.get('v'),null);await none.set('v',html());await none.clear();
});
test('the patch bundle extraction dropped NOTHING: buildInject contains every patch the old Home.jsx injected',async()=>{
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'bf-inj-'));
  for(const f of fs.readdirSync(lib('.')).filter(x=>x.endsWith('.js')))fs.writeFileSync(path.join(tmp,f),read(f).replace(/'@\/lib\/([A-Za-z0-9_]+)'/g,"'./$1.js'"));
  fs.writeFileSync(path.join(tmp,'package.json'),'{"type":"module"}');
  const g=await import(pathToFileURL(path.join(tmp,'gameInject.js')).href);
  const old=fs.readFileSync(path.join(__dirname,'fixtures','Home.before-lazy.jsx.txt'),'utf8');
  const i=old.indexOf('const INJECT = UUID_POLYFILL'),expr=old.slice(i,old.indexOf(';\n',i));
  const importsOf={};for(const m of old.matchAll(/^import\s+(?:(\w+)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s+'@\/lib\/([^']+)';/gm)){for(const n of (m[2]||'').split(',').map(x=>x.trim()).filter(Boolean))importsOf[n]=m[3];if(m[1])importsOf[m[1]]=m[3];}
  const names=[...new Set(expr.match(/[A-Za-z_][A-Za-z0-9_]*/g))].filter(n=>/^[A-Z0-9_]+$/.test(n)&&importsOf[n]);
  assert(names.length>=170,'old expression referenced '+names.length+' patch constants');
  const ctx=(m)=>({IS_MOBILE:m,IS_PHONE:m,homeTexts:{punkitoEs:'',punkitoEn:'',contactLabel:'',contactLabelEn:'',contactBody:'',contactBodyEn:''},CONTACT_REPOSITION_PATCH:'<!--C-->',DRAGGABLE_GUIDE_PATCH:'<!--D-->',RELOAD_COVER_PATCH:'<!--R-->'});
  const desktop=g.buildInject(ctx(false)),mobile=g.buildInject(ctx(true));
  assert(desktop.length>1_000_000&&mobile.length>desktop.length,'sizes: '+desktop.length+' / '+mobile.length);
  for(const m of ['<!--C-->','<!--D-->','<!--R-->'])assert(desktop.includes(m),'local constant passed through: '+m);
  const missing=[];
  for(const n of names){const mod=await import(pathToFileURL(path.join(tmp,importsOf[n]+'.js')).href);const v=mod[n];
    if(typeof v==='string'&&v.length>20&&!mobile.includes(v)&&!desktop.includes(v))missing.push(n);}
  assert.deepEqual(missing,[],'patches no longer injected: '+missing.join(', '));
  // Todo lo inyectado en el iframe debe ser JavaScript válido (un error de sintaxis tumbaría un parche entero sin avisar).
  let blocks=0;for(const html of [desktop,mobile])for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)){blocks++;try{new Function(m[1]);}catch(e){assert.fail('syntax error in an injected script: '+e.message+' :: '+m[1].slice(0,80).replace(/\n/g,' '));}}
  assert(blocks>=300,'injected script blocks checked: '+blocks);
  assert.equal(typeof g.patchGameHtml,'function');assert.equal(typeof g.CRITICAL_HEAD_CSS,'string');assert(g.CRITICAL_HEAD_CSS.length>50);
  fs.rmSync(tmp,{recursive:true,force:true});
});
test('wiring: patches load in parallel and lazily, pages are lazy, versions match, nothing downloads before it must',()=>{
  const home=read('../pages/Home.jsx'),main=read('../main.jsx'),app=read('../App.jsx'),loader=read('gameHtmlLoader.js'),server=fs.readFileSync(path.join(root,'base44/functions/gameHtml/entry.ts'),'utf8');
  assert.match(home,/const injectModule = import\('@\/lib\/gameInject'\);/);assert.doesNotMatch(home,/from '@\/lib\/gameInject'/,'never imported statically (it would end up in the main bundle again)');
  assert.match(home,/const textListPromise = base44\.entities\.HomeText\.list/,'home texts requested in parallel with the HTML');assert.match(home,/gameHtmlLoader\.load\(attempt\)/);
  assert.doesNotMatch(home,/functions\.invoke\('gameHtml'/,'Home no longer downloads the HTML itself');
  assert.match(main,/gameHtmlLoader\.warm\(\)/);assert.match(main,/import\('@\/lib\/gameInject'\)/);
  assert.match(app,/import Home from '\.\/pages\/Home';/,'the landing page stays in the main bundle');assert.match(app,/<Suspense fallback=\{<PageFallback \/>\}>/);
  assert((app.match(/= lazy\(\(\) => import\('\.\/pages\//g)||[]).length>=15,'secondary pages are lazy');
  assert.doesNotMatch(app,/^import (Cards|Ranking|AdminCards|Login) from/m);
  const cv=/GAME_HTML_VERSION = '([^']+)'/.exec(loader)[1],sv=/GAME_PATCH_VERSION = '([^']+)'/.exec(server)[1];assert.equal(cv,sv,'client and server game versions must match (bump both together)');
});
test('a damaged local copy cannot trap the player: no sign of life in 20 s -> copy discarded and downloaded again',()=>{
  const home=read('../pages/Home.jsx');
  assert.match(home,/if \(loaded\.source === 'cache'\) \{\s*gameReadyRef\.current = false;\s*cacheWatchdog = setTimeout\(\(\) => \{ if \(!cancelled && !gameReadyRef\.current\) loadGame\(2\); \}, 20000\);/);
  assert.match(home,/gameReadyRef\.current = true;\s*setScreen\(e\.data\.bfScreen\);/,'the first screen notice from the game cancels the watchdog');
  assert.match(home,/if \(cacheWatchdog\) clearTimeout\(cacheWatchdog\);/);
});
