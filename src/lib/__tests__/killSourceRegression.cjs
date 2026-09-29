const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const read=n=>fs.readFileSync(path.join(__dirname,'..',n+'.js'),'utf8');
const value=(n,expr,extra={})=>vm.runInNewContext(read(n).replace(/^import .*;$/gm,'').replace(/export (const|function)/g,'$1')+'\n'+expr,extra);
const picker=value('deathQuips','createDeathQuipPicker');
function fixture(){
 let now=10000,seq=0;const timers=new Map();
 const schedule=(fn,ms,repeat=0)=>{const id=++seq;timers.set(id,{fn,at:now+ms,repeat});return id;};
 function tick(ms){const end=now+ms;let budget=15000;while(budget--){let next;for(const t of timers)if(t[1].at<=end&&(!next||t[1].at<next[1].at))next=t;if(!next)break;const [id,t]=next;now=t.at;if(t.repeat)t.at+=t.repeat;else timers.delete(id);t.fn();}now=end;assert(budget>0);}
 function node(tag='div'){const n={id:'',tagName:tag.toUpperCase(),className:'',children:[],dataset:{},style:{backgroundImage:'',setProperty(){}},textContent:'',querySelector(q){if(q.includes('bf-bscene-portrait'))return n.portrait||null;return null;},querySelectorAll(){return [];},getBoundingClientRect(){return {width:200,height:200};},appendChild(el){el.parentNode=n;n.children.push(el);},removeChild(el){n.children.splice(n.children.indexOf(el),1);el.parentNode=null;},remove(){n.parentNode?.removeChild(n);}};n.classList={add(s){n.className+=' '+s;},remove(s){n.className=n.className.split(' ').filter(x=>x!==s).join(' ');},contains(s){return n.className.split(' ').includes(s)}};return n;}
 const body=node(),head=node(),all=(root=body)=>root.children.flatMap(n=>[n,...all(n)]);
 const select=q=>all().find(n=>q.split(',').some(x=>x.startsWith('#')?n.id===x.slice(1):x.startsWith('.')?n.classList.contains(x.slice(1)):false))||null;
 const doc={body,head,createElement:node,getElementById:id=>all().find(n=>n.id===id)||null,querySelector:select,querySelectorAll:()=>[]};
 const attacker={id:'p1',name:'Atacante',alive:true},victim={id:'o1',name:'Caído',alive:true,clan:'Sombras'};
 const context={console,Math,Date:{now:()=>now},document:doc,setTimeout:(f,ms)=>schedule(f,ms),setInterval:(f,ms)=>schedule(f,ms,ms),clearInterval:id=>timers.delete(id),clearTimeout:id=>timers.delete(id),G:{team:{p:[attacker],o:[victim]}},B:{current:{side:'p',id:'p1'},over:false},events:[],getHero:(s,id)=>context.G.team[s].find(h=>h.id===id),bfKillCinematic(){},flushFx(){},dealDamage(t){t.alive=false;context.events.push({k:'death',side:context.G.team.p.includes(t)?'p':'o',id:t.id});return 9;},showResult(){context.results++;},show(){},bfEndCinematic(){},results:0,__bfCinematicBusy:()=>false,__bfIndicatorsBusy:()=>false};
 context.window=context;vm.createContext(context);
 function load(n,key){vm.runInContext(value(n,key,{createDeathQuipPicker:picker}).replace(/<\/?script>/g,''),context);}
 const card=node();card.id='b_o_o1';card.portrait=node();card.portrait.style.backgroundImage='url("victim.jpg")';body.appendChild(card);
 const ac=node();ac.id='b_p_p1';ac.portrait=node();ac.portrait.style.backgroundImage='url("attacker.jpg")';body.appendChild(ac);
 load('finalCinematicPatch','FINAL_CINEMATIC_PATCH');load('killActorPatch','KILL_ACTOR_PATCH');load('killCineQueuePatch','KILL_CINE_QUEUE_PATCH');load('endGameWaitCalmPatch','END_GAME_WAIT_CALM_PATCH');
 return {context,tick,select,attacker,victim,now:()=>now};
}
test('AI enemy kill uses actual attacker despite stale spell context, with both portraits',()=>{
 const f=fixture(),c=f.context;c.G.team.o.push({id:'o2',name:'Otro',alive:true});c.__bfActionCtx={kind:'useAbility',actor:{side:'o',id:'o1'},ts:f.now()-1700};
 c.dealDamage(f.victim,9);c.flushFx(c.events);f.tick(500);
 const overlay=f.select('#bf-kill-ov');assert(overlay);assert.equal(overlay.classList.contains('bf-kill-self'),false);
 assert.match(f.select('.bf-kill-att').style.backgroundImage,/attacker.jpg/);
 assert.match(f.select('.bf-kill-vic').style.backgroundImage,/victim.jpg/);
 assert(f.select('.bf-kill-vname').textContent.includes('Caído'));
});
test('final AI kill uses the definitive action without a duplicate death overlay',()=>{
  const f=fixture(),c=f.context;c.dealDamage(f.victim,9);c.B.over=true;c.flushFx(c.events);assert(c.__bfKillCinePending());c.showResult(true);
  f.tick(400);assert.equal(f.select('#bf-kill-ov'),null);assert.equal(c.results,1);
  assert.equal(c.__bfKillCinePending(),false);assert(f.select('#b_o_o1').classList.contains('bf-truedead'));
  assert.equal(c.__bfDeathVisHold.o_o1,undefined);assert.equal(c.__bfFinalBlow.victimName,'Caído');
  f.tick(5500);assert.equal(c.results,1);assert.equal(f.select('#bf-kill-ov'),null);
});
test('an intermediate AI kill still shows its own death cinematic',()=>{
  const f=fixture(),c=f.context;c.G.team.o.push({id:'o2',name:'Otro',alive:true});
  c.dealDamage(f.victim,9);c.flushFx(c.events);f.tick(400);
  assert(f.select('#bf-kill-ov'));assert.equal(c.__bfFinalBlow.victimName,'Caído');
});
test('stale self-kill flag cannot relabel an enemy kill as slapstick',()=>{
 const f=fixture(),c=f.context;c.G.team.o.push({id:'o2',name:'Otro',alive:true});c.__bfSelfKill={side:'o',victim:'o1',id:'o1',ts:f.now()};c.dealDamage(f.victim,9);c.flushFx(c.events);f.tick(500);
 assert(f.select('.bf-kill-att'));assert.equal(f.select('#bf-kill-ov').classList.contains('bf-kill-self'),false);
});
test('fallen portrait survives an empty card art layer using the catalog image',()=>{
 const f=fixture(),c=f.context;c.G.team.o.push({id:'o2',name:'Otro',alive:true});c.__bfAvatarMap={o1:'catalog-victim.jpg'};
 f.select('#b_o_o1').portrait.style.backgroundImage='';
 c.dealDamage(f.victim,9);c.flushFx(c.events);f.tick(500);
 assert.match(f.select('.bf-kill-vic').style.backgroundImage,/catalog-victim.jpg/);
});