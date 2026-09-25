const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),test=require('node:test'),assert=require('node:assert/strict');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name+'.js'),'utf8');
function fixture(){
  let now=10000,serial=0,hold=false,battle=true;const timers=new Map(),mounted=[],history=[];
  const schedule=(fn,ms,repeat=0)=>{const id=++serial;timers.set(id,{fn,at:now+ms,repeat});return id;};
  const tick=ms=>{const end=now+ms;let budget=50000;while(budget--){let next;for(const t of timers)if(t[1].at<=end&&(!next||t[1].at<next[1].at))next=t;if(!next)break;const[id,t]=next;now=t.at;if(t.repeat)t.at+=t.repeat;else timers.delete(id);t.fn();}now=end;assert(budget>0,'timer loop');};
  const node=()=>({nodeType:1,style:{setProperty(){}},dataset:{},classList:{contains:()=>false},getBoundingClientRect:()=>({left:10,top:10,width:300,height:200}),remove(){this.parentNode?.removeChild(this);}});
  const root={appendChild(n){n.parentNode=root;mounted.push(n);history.push(n);},removeChild(n){mounted.splice(mounted.indexOf(n),1);n.parentNode=null;}};
  const hero={id:'motoma',name:'Motomami',alive:true,hp:40,mana:10,cc:5,ad:10,he:2,shield:0,para:0};
  const c={Date:{now:()=>now},console,Math,MutationObserver:class{observe(){}},
    document:{body:{...root,classList:{contains:()=>false}},head:{appendChild(){}},createElement:node,
      getElementById:id=>id==='s-battle'?{classList:{contains:()=>battle}}:id.startsWith('b_')?node():null,querySelector:()=>null},
    __bfAppend:n=>root.appendChild(n),__bfFxRoot:()=>root,__bfCinematicBusy:()=>hold,
    setTimeout:(fn,ms)=>schedule(fn,ms),setInterval:(fn,ms)=>schedule(fn,ms,ms),clearTimeout:id=>timers.delete(id),clearInterval:id=>timers.delete(id),
    G:{team:{p:[hero],o:[]}},B:{current:{side:'p',id:hero.id},queue:[{side:'p',id:hero.id}],qi:0,round:1},
    flushFx(){},pushFx(){},dealDamage(h,n){h.hp-=n;return n;},tSide:()=> 'p',stat:(h,k)=>h[k],getHero:()=>hero,stepTurn(){}};
  c.window=c;vm.createContext(c);
  function load(name,symbol){const source=read(name).replace('export const','const').replace('export function','function');const patch=vm.runInNewContext(source+'\n'+symbol);vm.runInContext(patch.replace(/<\/?script>/g,''),c);}
  load('combatIndicatorSequencePatch','COMBAT_INDICATOR_SEQUENCE_PATCH');
  return {c,tick,load,hero,mounted,history,hold:v=>hold=v,leave:()=>battle=false};
}
const producers=[
  ['damageNumberPatch','DAMAGE_NUMBER_PATCH','bf-dmg-pop',f=>f.c.flushFx([{k:'hit',side:'p',id:'motoma',dmg:7}])],
  ['healNumberPatch','HEAL_NUMBER_PATCH','bf-heal-pop',f=>f.c.flushFx([{k:'heal',side:'p',id:'motoma',amt:8}])],
  ['statusPopPatch','STATUS_POP_PATCH','bf-status-pop',f=>f.c.bfStatusPop('p','motoma','SIN HABILIDAD')],
  ['statNumberPatch','STAT_NUMBER_PATCH','bf-stat-pop',f=>{f.hero.ad+=3;f.tick(650);}],
  ['fumbleRollPatch',"buildFumbleRollPatch('es')",'bf-fumble-pop',f=>f.c.__bfFumblePop('p','motoma',false,1)],
  ['skipTurnPopPatch','SKIP_TURN_POP_PATCH','bf-skip-pop',f=>{f.hero.para=1;f.c.stepTurn();}],
  ['duckAbsorbFxPatch','DUCK_ABSORB_FX_PATCH','bf-absorb-pop',f=>{f.hero._bfTank=true;f.c.dealDamage(f.hero,4);}]
];
for(const [file,symbol,css,trigger] of producers)test(file+': waits for queued cinematic, then shows once for full duration',()=>{
  const f=fixture();f.load(file,symbol);f.tick(700);f.hold(true);trigger(f);f.tick(25000);
  assert.equal(f.mounted.length,0);assert(f.c.__bfIndicatorsBusy());
  f.hold(false);f.tick(350);assert.equal(f.history.filter(n=>n.className?.split(' ').includes(css)).length,1);
  f.tick(800);assert(f.mounted.some(n=>n.className?.split(' ').includes(css)));
  f.tick(6000);assert.equal(f.mounted.length,0);assert.equal(f.c.__bfIndicatorsBusy(),false);
});
test('effects emitted before cinematic activation cannot paint first',()=>{
  const f=fixture();f.load('statusPopPatch','STATUS_POP_PATCH');f.c.bfStatusPop('p','motoma','-3 AD');f.tick(150);f.hold(true);f.tick(5000);assert.equal(f.history.length,0);f.hold(false);f.tick(350);assert.equal(f.history.length,1);
});
test('late cinematic pauses markers and preserves remaining reading time',()=>{
  const f=fixture();f.load('statusPopPatch','STATUS_POP_PATCH');f.c.bfStatusPop('p','motoma','SIN ÉLITE');f.tick(800);const n=f.mounted[0];assert(n);f.hold(true);f.tick(12000);assert.equal(n.style.visibility,'hidden');assert.equal(n.style.animationPlayState,'paused');assert.equal(f.mounted.length,1);f.hold(false);f.tick(100);assert.equal(n.style.visibility,'');f.tick(1000);assert.equal(f.mounted.length,1);f.tick(3000);assert.equal(f.mounted.length,0);
});
test('no cinematic: short grace only, multiple targets retained',()=>{
  const f=fixture();f.load('damageNumberPatch','DAMAGE_NUMBER_PATCH');f.tick(200);f.c.flushFx(['a','b','c'].map(id=>({k:'hit',side:'o',id,dmg:12})));f.tick(350);assert.equal(f.mounted.length,3);f.tick(4000);assert.equal(f.mounted.length,0);
});
test('leaving battle discards pending and active markers',()=>{
  const f=fixture();f.load('statusPopPatch','STATUS_POP_PATCH');f.c.bfStatusPop('p','motoma','A');f.tick(500);f.hold(true);f.c.bfStatusPop('p','motoma','B');f.leave();f.tick(100);assert.equal(f.mounted.length,0);assert.equal(f.c.__bfIndicatorsBusy(),false);
});
for(const [file,symbol,start] of [
  ['mpTurnSequencePatch','MP_TURN_SEQUENCE_PATCH',(f,cb)=>f.c.bfStepWhenCalm(cb)],
  ['aiWaitCinePatch','AI_WAIT_CINE_PATCH',(f,cb)=>{f.c.aiTurn=cb;f.load('aiWaitCinePatch','AI_WAIT_CINE_PATCH');f.c.aiTurn(f.hero,'p');}]
])test(file+': does not bypass pending indicators at stale FX timeout',()=>{
  const f=fixture();if(file!=='aiWaitCinePatch')f.load(file,symbol);let busy=true,advanced=0;f.c.__bfIndicatorsBusy=()=>busy;start(f,()=>advanced++);f.tick(16000);assert.equal(advanced,0);busy=false;f.tick(1500);assert.equal(advanced,1);
});