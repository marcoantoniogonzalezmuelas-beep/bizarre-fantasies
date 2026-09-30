// Rendimiento del iframe: bus único de mutaciones, traducción incremental y coach sin
// recálculo de estilos forzado. Simulan "tormentas" de mutaciones con relojes falsos.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f);
const script=s=>s.replace(/<\/?script>/g,'');
// Reloj + rAF + temporizadores falsos (rAF = un fotograma cada 16 ms, como el navegador)
function clock(){
  let now=1000,id=0;const timers=new Map(),rafs=new Map(),observers=[];
  class MO{constructor(cb){this.cb=cb;observers.push(this);}observe(){this.observed=(this.observed||0)+1;}}
  const env={Date:{now:()=>now},Math,console,MutationObserver:MO,Set,Array,Object,
    setTimeout:(f,ms)=>{timers.set(++id,{f,at:now+ms});return id;},clearTimeout:i=>timers.delete(i),
    setInterval:()=>0,clearInterval(){},
    requestAnimationFrame:f=>{rafs.set(++id,f);return id;},cancelAnimationFrame:i=>rafs.delete(i)};
  env.window=env;
  const advance=ms=>{const end=now+ms;while(now<end){now=Math.min(end,now+16);
    for(const [i,t] of [...timers])if(t.at<=now){timers.delete(i);t.f();}
    for(const [i,f] of [...rafs]){rafs.delete(i);f();}}};
  return {env,advance,observers,now:()=>now,pendingRaf:()=>rafs.size};
}
const fxTarget={id:'',closest:s=>s==='#bf-fx-layer'?{}:null}, uiTarget={id:'x',closest:()=>null};

test('bus: many subscribers share ONE observer and run once per frame',async()=>{
  const {DOM_BUS_PATCH}=await import(pathToFileURL(lib('domBusPatch.js')).href);
  const c=clock();c.env.document={documentElement:{}};vm.runInNewContext(script(DOM_BUS_PATCH),c.env);
  let a=0,b=0;for(let i=0;i<20;i++)c.env.bfDom.on(()=>{a++;});c.env.bfDom.on(()=>{b++;},{fx:true});
  assert.equal(c.observers.length,1,'one MutationObserver for all subscribers');assert.equal(c.env.bfDom._count(),21);
  const recs=Array.from({length:60},()=>({target:uiTarget}));
  c.observers[0].cb(recs);c.observers[0].cb(recs);c.advance(16);
  assert.equal(a,20,'each of the 20 subscribers ran exactly once, not once per mutation batch');assert.equal(b,1);
});
test('bus: changes that happen only inside the FX layer do not wake ordinary subscribers',async()=>{
  const {DOM_BUS_PATCH}=await import(pathToFileURL(lib('domBusPatch.js')).href);
  const c=clock();c.env.document={documentElement:{}};vm.runInNewContext(script(DOM_BUS_PATCH),c.env);
  let ui=0,fx=0;c.env.bfDom.on(()=>{ui++;});c.env.bfDom.on(()=>{fx++;},{fx:true});
  for(let i=0;i<50;i++){c.observers[0].cb([{target:fxTarget},{target:fxTarget}]);c.advance(16);}
  assert.equal(ui,0,'damage numbers/sparks must not trigger UI injectors');assert.equal(fx,50,'fx:true subscribers still see them');
  c.observers[0].cb([{target:fxTarget},{target:uiTarget}]);c.advance(16);assert.equal(ui,1,'a mixed batch wakes everyone');
});
test('bus: a throwing subscriber does not stop the others; hidden tab (no rAF) still flushes once',async()=>{
  const {DOM_BUS_PATCH}=await import(pathToFileURL(lib('domBusPatch.js')).href);
  const c=clock();c.env.document={documentElement:{}};vm.runInNewContext(script(DOM_BUS_PATCH),c.env);
  let ok=0;c.env.bfDom.on(()=>{throw new Error('boom');});c.env.bfDom.on(()=>{ok++;});
  c.observers[0].cb([{target:uiTarget}]);c.advance(16);assert.equal(ok,1);
  // rAF parado (pestaña oculta): el temporizador de reserva ejecuta el flush UNA vez
  const origRaf=c.env.requestAnimationFrame;c.env.requestAnimationFrame=()=>0;
  c.observers[0].cb([{target:uiTarget}]);c.advance(200);assert.equal(ok,2);c.env.requestAnimationFrame=origRaf;c.advance(200);assert.equal(ok,2,'no double flush');
});
test('English translation is incremental: a mutation storm no longer rescans the whole document every 180ms',async()=>{
  const tmp=path.join(os.tmpdir(),'bf-langen-'+process.pid+'.mjs');
  fs.writeFileSync(tmp,fs.readFileSync(lib('langEnPatch.js'),'utf8').replace("'@/lib/translationsEn'",JSON.stringify(pathToFileURL(lib('translationsEn.js')).href)));
  const {buildLangEnPatch}=await import(pathToFileURL(tmp).href);fs.unlinkSync(tmp);
  const c=clock(),txt=t=>({nodeType:3,textContent:t,parentElement:{closest:()=>null},isConnected:true});
  const t1=txt('Comenzar'),t2=txt('Aprende'),body={nodeType:1,isConnected:true,_nodes:[t1,t2],getAttribute:()=>null,querySelectorAll:()=>[]};
  let bodyWalks=0;
  c.env.document={readyState:'complete',body,documentElement:{},querySelectorAll:()=>[],
    createTreeWalker:root=>{if(root===body)bodyWalks++;const l=[...(root._nodes||[])];let i=0;return {nextNode:()=>l[i++]||null};}};
  c.env.NodeFilter={SHOW_TEXT:4};c.env.addEventListener=()=>{};
  vm.runInNewContext(script(buildLangEnPatch('en')),c.env);
  assert.equal(t1.textContent,'Begin');assert.equal(t2.textContent,'Learn');assert.equal(bodyWalks,1,'initial full scan');
  const cb=c.observers[0].cb;
  const added=txt('Comenzar'),el={nodeType:1,isConnected:true,_nodes:[added],getAttribute:()=>null,querySelectorAll:()=>[]};
  cb([{type:'childList',addedNodes:[el]}]);c.advance(130);
  assert.equal(added.textContent,'Begin','the new node is translated');assert.equal(bodyWalks,1,'without walking the whole body');
  t1.textContent='Aprende';cb([{type:'characterData',target:t1}]);c.advance(130);assert.equal(t1.textContent,'Learn','edited text node translated');
  for(let i=0;i<19;i++){cb([{type:'childList',addedNodes:[el]}]);c.advance(100);}   // ~2 s de mutaciones continuas
  assert(bodyWalks<=3,'full rescans are rare during a storm (was ~11 before): '+bodyWalks);
});
test('coach patch: style recalculation (getComputedStyle) is capped, with a guaranteed final pass',async()=>{
  const {COACH_PUNKITO_PATCH}=await import(pathToFileURL(lib('coachPunkitoPatch.js')).href);
  const c=clock();let gcs=0;
  const deep=()=>new Proxy(function(){},{get:(t,p)=>p==='then'?undefined:(p==='style'?{}:deep()),apply:()=>deep(),set:()=>true});
  const coach=deep();
  c.env.document=new Proxy({readyState:'complete',documentElement:{},getElementById:id=>id==='coach'?coach:null},{get:(t,p)=>p in t?t[p]:deep()});
  c.env.getComputedStyle=()=>{gcs++;return {display:'block'};};
  vm.runInNewContext(script(COACH_PUNKITO_PATCH),c.env);
  const mo=c.observers[c.observers.length-1].cb;const base=gcs;
  for(let i=0;i<500;i++){mo([{}]);c.advance(8);}        // ~4 s de cambios de style/class sin parar
  const perSecond=(gcs-base)/4;assert(perSecond<=5,'getComputedStyle calls per second: '+perSecond+' (was once per mutation batch)');
  const before=gcs;mo([{}]);c.advance(400);assert(gcs>before,'the last change always gets its final pass');
});
test('static: only a handful of real observers remain; migrated patches use the bus',()=>{
  const dir=lib('.');let real=0,migrated=0;
  for(const f of [...fs.readdirSync(dir).filter(x=>x.endsWith('.js')).map(x=>path.join(dir,x)),path.join(__dirname,'..','..','pages','Home.jsx')]){
    for(const line of fs.readFileSync(f,'utf8').split('\n')){
      if(!line.includes('new MutationObserver'))continue;
      if(/bfDom/.test(line))migrated++;else if(!/domBusPatch|^\s*\/\//.test(line)&&!f.endsWith('domBusPatch.js'))real++;
    }
  }
  assert(migrated>=23,'migrated call sites: '+migrated);assert(real<=13,'real observers left: '+real);
});
