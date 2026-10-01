// Zoom automático de la fase de EQUIPAMIENTO en móvil/tablet: cálculo puro + integración con el parche real.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f),load=f=>import(pathToFileURL(lib(f)).href),script=s=>s.replace(/<\/?script>/g,'');
async function focusApi(){const {ZOOM_FOCUS_PATCH}=await load('zoomFocusPatch.js');const env={Math};env.window=env;vm.runInNewContext(script(ZOOM_FOCUS_PATCH),env);return env;}
const plain=x=>x&&JSON.parse(JSON.stringify(x));

test('the WHOLE equipment zone is framed (nothing cropped): fit to width AND height, whatever the screen',async()=>{
  const A=await focusApi();
  // tablet / apaisado
  const t=plain(A.bfComputeEquipFocus({x:140,y:60,w:1000,h:700},{x:140,y:90,w:600,h:520},1280,900,1024));
  assert.equal(t.z,1.25);assert.equal(t.tx,-157,'centred horizontally');assert.equal(t.ty,-61);assert.equal(t.cropped,false);
  // móvil en vertical: antes ampliaba x2 y enfocaba SOLO a los héroes (el jugador pidió ver toda la vista)
  const m=plain(A.bfComputeEquipFocus({x:90,y:60,w:1100,h:900},{x:90,y:90,w:560,h:520},1280,2400,390));
  assert.equal(m.z,1.14,'just enough to fill the width (was 2.03, which cut the shop off)');assert.equal(m.cropped,false);
  for(const [name,f] of [['tablet',t],['phone',m]]){const z=f.z,zone=name==='tablet'?{x:140,y:60,w:1000,h:700}:{x:90,y:60,w:1100,h:900};
    assert(zone.x*z+f.tx>=0&&(zone.x+zone.w)*z+f.tx<=1280+1,name+': left/right edges of the zone stay on screen');}
  // la zona es más alta que la pantalla: no se amplía (se vería menos, no más)
  assert.equal(A.bfComputeEquipFocus({x:0,y:0,w:600,h:2000},{x:0,y:0,w:600,h:300},1280,900,390),null);
});
test('limits: tiny zone -> max zoom; nearly full width -> no change; bad input -> null; pan stays inside the canvas',async()=>{
  const A=await focusApi();
  assert.equal(plain(A.bfComputeEquipFocus({x:500,y:0,w:300,h:300},{x:500,y:0,w:300,h:300},1280,900,390)).z,2.6,'max zoom');
  assert.equal(A.bfComputeEquipFocus({x:25,y:0,w:1230,h:600},{x:25,y:0,w:600,h:600},1280,900,1280),null,'less than 4% gain: leave it alone');
  for(const bad of [[null,null],[{x:0,y:0,w:0,h:5},null],[{x:0,y:0,w:5,h:0},null]])assert.equal(A.bfComputeEquipFocus(bad[0],bad[1],1280,900,390),null);
  assert.equal(A.bfComputeEquipFocus({x:0,y:0,w:100,h:100},null,0,900,390),null);
  const c=plain(A.bfComputeEquipFocus({x:0,y:5000,w:300,h:300},{x:0,y:5000,w:300,h:300},1280,3000,390));assert(c.ty>=-(3000*2.6-3000));
});
test('zones are measured live and the current zoom is discounted (hidden elements ignored, heroes required)',async()=>{
  const A=await focusApi();
  const el=(l,t,w,h)=>({getBoundingClientRect:()=>({left:l,top:t,width:w,height:h})});
  const sets={'#s-equip .eq-hero':[el(300,150,400,200),el(300,400,400,200),el(0,0,0,0)],'#s-equip .coins-row':[el(300,100,500,40)],'#s-equip .shop-card':[el(900,150,130,180)],'#s-equip .eq-hand-box':[]};
  const doc={querySelectorAll:s=>sets[s]||[]};
  const z=plain(A.bfEquipZones(doc,{z:2,tx:-100,ty:-50}));
  assert.deepEqual(z.heroes,{x:200,y:100,w:200,h:225},'unscaled coordinates, hidden hero ignored');assert.deepEqual(z.zone,{x:200,y:75,w:365,h:250});
  assert.equal(A.bfEquipZones({querySelectorAll:()=>[]},{z:1,tx:0,ty:0}),null,'screen not painted yet: try again later');
});
test('integration with the REAL pinch patch: entering equipment frames the zone, leaving undoes it, a retry waits for the heroes',async()=>{
  const {MOBILE_PINCH_PATCH}=await load('mobilePinchZoomPatch.js'),{ZOOM_FOCUS_PATCH}=await load('zoomFocusPatch.js');
  let active='s-title',heroesPainted=false;const posts=[],timers=[];let now=0;
  const rect=(l,t,w,h)=>({getBoundingClientRect:()=>({left:l,top:t,width:w,height:h})});
  const zones=()=>({'#s-equip .eq-hero':heroesPainted?[rect(90,150,560,200),rect(90,380,560,200)]:[],'#s-equip .coins-row':heroesPainted?[rect(90,100,1100,40)]:[],'#s-equip .shop-card':heroesPainted?[rect(700,150,130,180)]:[],'#s-equip .eq-hand-box':[]});
  const style={},bodyEl={style,classList:{add(){},remove(){},contains:()=>false}};
  const noop=()=>{};const nodeStub=()=>({style:{},appendChild:noop,textContent:'',classList:{add:noop,remove:noop,contains:()=>false},setAttribute:noop});
  const env={Math,JSON,Object,Array,Number,String,Date:{now:()=>now},innerWidth:1280,innerHeight:2400,scrollTo:noop,getComputedStyle:()=>({}),
    setTimeout:(f,ms)=>{timers.push({f,at:now+ms,rep:0});return timers.length;},setInterval:(f,ms)=>{timers.push({f,at:now+ms,rep:ms});return timers.length;},
    clearTimeout:i=>{if(timers[i-1])timers[i-1].f=null;},clearInterval:i=>{if(timers[i-1])timers[i-1].f=null;},
    requestAnimationFrame:f=>{timers.push({f,at:now+16,rep:0});return timers.length;},cancelAnimationFrame:i=>{if(timers[i-1])timers[i-1].f=null;},
    MutationObserver:class{observe(){}},
    document:{readyState:'complete',body:bodyEl,head:{appendChild:noop},documentElement:nodeStub(),createElement:nodeStub,getElementById:()=>null,addEventListener:noop,
      querySelector:s=>(s==='.screen.active'?{id:active}:null),querySelectorAll:s=>zones()[s]||[]}};
  env.window=env;env.parent={document:{documentElement:{clientWidth:390}},postMessage:m=>posts.push(JSON.parse(JSON.stringify(m))),scrollTo:noop};
  vm.runInNewContext(script(ZOOM_FOCUS_PATCH),env);vm.runInNewContext(script(MOBILE_PINCH_PATCH),env);
  const advance=ms=>{const end=now+ms;while(now<end){now=Math.min(end,now+50);for(const t of timers)if(t.f&&t.at<=now){const f=t.f;if(t.rep)t.at+=t.rep;else t.f=null;f();}}};
  const scale=()=>{const m=/scale\(([\d.]+)\)/.exec(style.transform||'');return m?Number(m[1]):1;};
  advance(1000);active='s-equip';advance(1500);
  assert.equal(scale(),1,'heroes not painted yet: nothing applied (and it keeps trying)');
  heroesPainted=true;advance(2000);
  assert.equal(scale(),1.14,'the WHOLE equipment zone is framed');assert.match(style.transform,/translate3d\(-88px,-100px,0\)/,'zone centred, top just below the screen top');
  assert(posts.some(p=>p.bfPinch&&p.bfPinch.z===1.14),'the app is told (its overlays follow the zoom)');
  advance(5000);assert.equal(scale(),1.14,'applied once, not re-applied every cycle');
  active='s-battle';advance(1500);assert.equal(scale(),1,'leaving equipment undoes the automatic zoom');
});
test('wiring: the focus math is injected before the pinch patch, and a zoom the player made is respected',()=>{
  const inj=fs.readFileSync(lib('gameInject.js'),'utf8'),home=inj.slice(inj.indexOf('export function buildInject')),pz=fs.readFileSync(lib('mobilePinchZoomPatch.js'),'utf8');
  assert(home.indexOf('ZOOM_FOCUS_PATCH + DOM_BUS_PATCH')>0&&home.indexOf('ZOOM_FOCUS_PATCH')<home.indexOf('+ MOBILE_PINCH_PATCH'),'math available before the pinch patch');
  assert.match(pz,/if \(z !== 1 \|\| tx \|\| ty\) \{ equipDone = true; return; \}/,'a zoom the player already made is never overridden');
  assert.match(pz,/maybeFocusEquip\(sid\);/);assert.match(pz,/if \(z === equipAuto\.z && tx === equipAuto\.tx && ty === equipAuto\.ty\) resetZoom\(\)/,'only undoes its own zoom');
});
