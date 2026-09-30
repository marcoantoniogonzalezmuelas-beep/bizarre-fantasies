// Compatibilidad iPhone/iPad/Android: polyfill de randomUUID, parche de rendimiento
// en WebKit y reanudación del AudioContext. Usa rutas relativas (no /app).
const path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f);
const load=f=>import(pathToFileURL(lib(f)).href);
const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const fakeCrypto=()=>({getRandomValues(a){for(let i=0;i<a.length;i++)a[i]=Math.floor(Math.random()*256);return a;}});

test('randomUUID polyfill (parent page): adds a valid v4 UUID when missing, leaves native alone',async()=>{
  const {installUuidPolyfill}=await load('uuidPolyfill.js');
  const w={crypto:fakeCrypto()};installUuidPolyfill(w);
  const a=w.crypto.randomUUID(),b=w.crypto.randomUUID();
  assert.match(a,UUID_RE);assert.notEqual(a,b);
  const native=()=> 'native';const w2={crypto:{...fakeCrypto(),randomUUID:native}};installUuidPolyfill(w2);
  assert.equal(w2.crypto.randomUUID,native);
  installUuidPolyfill({}); // sin crypto: no lanza
});
test('randomUUID polyfill (iframe script) works and produces valid UUIDs',async()=>{
  const {UUID_POLYFILL}=await load('uuidPolyfill.js');
  const code=UUID_POLYFILL.replace(/<\/?script>/g,'');
  const ctx={};ctx.window=ctx;ctx.crypto=fakeCrypto();ctx.Uint8Array=Uint8Array;ctx.Array=Array;
  vm.runInNewContext(code,ctx);
  assert.match(ctx.crypto.randomUUID(),UUID_RE);
});
function perfRun(ua,{platform='Linux',touch=0}={}){
  return load('chromePerfPatch.js').then(({CHROME_PERF_PATCH})=>{
    const styles=[],c={navigator:{userAgent:ua,platform,maxTouchPoints:touch},setInterval(){},
      document:{createElement:()=>({}),head:{appendChild:n=>styles.push(n)},body:{},querySelectorAll:()=>[]}};
    c.window=c;vm.runInNewContext(CHROME_PERF_PATCH.replace(/<\/?script>/g,''),c);
    return styles.map(s=>s.textContent).join('');
  });
}
const UA={
  chrome:'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
  iphone:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  chromeIOS:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0 Mobile/15E148 Safari/604.1',
  ipadOS:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  firefox:'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
  macSafari:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
};
test('perf patch: Android Chrome keeps the full set (incl. content-visibility)',async()=>{
  const css=await perfRun(UA.chrome);assert.match(css,/backdrop-filter:none/);assert.match(css,/content-visibility:hidden/);
});
test('perf patch: iPhone, Chrome-on-iOS and iPadOS now get it, without content-visibility',async()=>{
  for(const [name,opts] of [['iphone',{platform:'iPhone',touch:5}],['chromeIOS',{platform:'iPhone',touch:5}],['ipadOS',{platform:'MacIntel',touch:5}]]){
    const css=await perfRun(UA[name],opts);
    assert.match(css,/backdrop-filter:none/,name);assert.doesNotMatch(css,/content-visibility/,name);assert.match(css,/contain:layout style/,name);
  }
});
test('perf patch: desktop Firefox and desktop Safari (no touch) stay untouched',async()=>{
  assert.equal(await perfRun(UA.firefox),'');
  assert.equal(await perfRun(UA.macSafari,{platform:'MacIntel',touch:0}),'');
});
test('music: suspended/interrupted AudioContext is resumed on gesture and when returning to foreground',async()=>{
  const listeners={doc:{}};let ctxInst=null,resumes=0;
  const deep=()=>new Proxy(function(){},{get:(t,p)=>p==='then'?undefined:deep(),apply:()=>deep(),set:()=>true});
  class FakeCtx{constructor(){ctxInst=this;this.state='suspended';this.currentTime=0;this.sampleRate=8;this.destination=deep();
    return new Proxy(this,{get:(t,p)=>p in t?t[p]:(p==='createBuffer'?()=>({getChannelData:()=>new Float32Array(8)}):()=>deep())});}
    resume(){resumes++;this.state='running';return Promise.resolve();} close(){return Promise.resolve();}}
  const realSI=global.setInterval;global.setInterval=()=>0;
  global.window={AudioContext:FakeCtx};global.document={hidden:false,addEventListener:(e,f)=>{(listeners.doc[e]=listeners.doc[e]||[]).push(f);}};
  try{
    const {startMusic}=await load('cinematicMusic.js');
    startMusic();assert(resumes>=1,'tries to resume right away');
    const before=resumes;ctxInst.state='interrupted'; // iOS al bloquear la pantalla
    listeners.doc.pointerdown.forEach(f=>f());assert.equal(resumes,before+1,'resumes on tap');
    ctxInst.state='suspended';global.document.hidden=false;listeners.doc.visibilitychange.forEach(f=>f());assert.equal(resumes,before+2,'resumes when app returns to foreground');
    ctxInst.state='running';listeners.doc.pointerdown.forEach(f=>f());assert.equal(resumes,before+2,'no needless resume while running');
  }finally{global.setInterval=realSI;delete global.window;delete global.document;}
});
test('viewport: after a rotation the layout is measured again once the browser has the new size',async()=>{
  const {onViewportChange}=await load('viewportEvents.js');
  const l={},timers=[];let now=0;
  global.window={addEventListener:(e,f)=>{l[e]=f;},removeEventListener:(e)=>{delete l[e];}};
  const rs=global.setTimeout,rc=global.clearTimeout;global.setTimeout=(f,ms)=>{timers.push({f,at:now+ms});return timers.length;};global.clearTimeout=(i)=>{if(timers[i-1])timers[i-1].f=null;};
  try{
    let calls=0,seen=[];const w={width:390};const off=onViewportChange(()=>{calls++;seen.push(w.width);});
    l.resize();assert.equal(calls,1,'a plain resize measures once');
    // iOS: orientationchange llega con el ancho VIEJO; el navegador lo actualiza poco después
    calls=0;seen=[];l.orientationchange();assert.equal(calls,1);assert.equal(seen[0],390,'first measure still sees the stale size');
    const advanceTo=(t)=>{now=t;for(const x of timers){if(x.f&&x.at<=now){const f=x.f;x.f=null;f();}}};
    w.width=844;advanceTo(160);advanceTo(460);
    assert.equal(calls,3,'re-measured at +150ms and +450ms');assert.equal(seen.at(-1),844,'the last measure sees the real new size');
    off();assert.equal(l.resize,undefined);assert.equal(l.orientationchange,undefined,'listeners removed');
  }finally{global.setTimeout=rs;global.clearTimeout=rc;delete global.window;}
});
