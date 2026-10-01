const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const read=n=>fs.readFileSync('/app/src/lib/'+n+'.js','utf8');
function value(n,s,extra={}){return vm.runInNewContext(read(n).replace(/^import .*;$/gm,'').replace(/export (const|function|default function)/g,(_,s)=>s==='const'?'const':'function')+'\n'+s,extra);}
function fixture(){
 let now=10000,serial=0;const timers=new Map();
 const schedule=(fn,ms,repeat=0)=>{const id=++serial;timers.set(id,{fn,at:now+ms,repeat});return id;};
 const tick=ms=>{const end=now+ms;let budget=20000;while(budget--){let next;for(const t of timers)if(t[1].at<=end&&(!next||t[1].at<next[1].at))next=t;if(!next)break;const[id,t]=next;now=t.at;if(t.repeat)t.at+=t.repeat;else timers.delete(id);t.fn();}now=end;assert(budget>0);};
 const node=()=>{const n={children:[],style:{setProperty(){}},dataset:{},className:'',textContent:'',attrs:{},getAttribute(k){return n.attrs[k]||null;},removeAttribute(k){delete n.attrs[k];},appendChild(c){if(c.parentNode&&c.parentNode.children)c.parentNode.children=c.parentNode.children.filter(x=>x!==c);c.parentNode=n;n.children.push(c);},removeChild(c){n.children.splice(n.children.indexOf(c),1);c.parentNode=null;},remove(){n.parentNode?.removeChild(n);},querySelector:()=>null,querySelectorAll(){return n.children.filter(c=>c.tagName==='BUTTON');},contains(c){return n.children.includes(c);}};n.classList={contains:s=>n.className.split(' ').includes(s),add:s=>n.className+=' '+s};return n;};
 const body=node(),head=node(),all=(root=body)=>root.children.flatMap(c=>[c,...all(c)]);
 const select=s=>all().find(n=>s.split(',').some(x=>x[0]==='#'?n.id===x.slice(1):x[0]==='.'?n.classList.contains(x.slice(1)):false))||null;
 const doc={body,head,createElement:tag=>{const n=node();n.tagName=tag.toUpperCase();n.ownerDocument=doc;return n;},querySelector:select,querySelectorAll:()=>[],getElementById:id=>all().find(n=>n.id===id)||null};
 const c={console,Math,Date:{now:()=>now},document:doc,setTimeout:(f,ms)=>schedule(f,ms),setInterval:(f,ms)=>schedule(f,ms,ms),clearInterval:id=>timers.delete(id),clearTimeout:id=>timers.delete(id),__bfCinematicBusy:()=>false,bfKillCinematic(){},B:{over:false},getHero:()=>({id:'test',name:'Test',alive:false}),flushFx(){},endTurn(){}};c.window=c;vm.createContext(c);
 function load(n,s){vm.runInContext(value(n,s,{createDeathQuipPicker:value('deathQuips','createDeathQuipPicker'),createDeathScene:value('deathScene','createDeathScene'),DEATH_SCENE_CSS:value('deathScene','DEATH_SCENE_CSS')}).replace(/<\/?script>/g,''),c);}
 return {c,tick,node,doc,select,load,now:()=>now};
}
test('host and guest retain one mission button, including repeated result refreshes',()=>{
 const reconcile=value('missionResultControls','reconcileMissionResultControls');
 for(const count of [0,1,2]){const f=fixture(),result=f.doc.createElement('div');f.doc.body.appendChild(result);let opened=0;
 for(let i=0;i<count;i++){const b=f.doc.createElement('button');b.attrs.onclick=i?'location.reload()':'bfMatchRematch()';result.appendChild(b);}
 const old=f.doc.createElement('button');old.id='bf-mission-result-back';f.doc.body.appendChild(old);
 reconcile(result,()=>opened++);reconcile(result,()=>opened++);assert.equal(result.children.length,1);assert.equal(old.parentNode,null);
  // el botón queda dentro de un contenedor que lo CENTRA (en multijugador salía arriba a la izquierda)
  const holder=result.children[0],btn=holder.id==='bf-mission-result-wrap'?holder.children[0]:holder;assert.equal(holder.id,'bf-mission-result-wrap');assert.equal(holder.children.length,1,'exactly one mission button');
  assert.equal(btn.id,'bf-mission-result-back');assert.equal(btn.style.margin,'0 auto');assert.equal(btn.style.display,'block');assert.match(holder.style.cssText,/justify-content:center/);
  btn.onclick();assert.equal(opened,1);
 }
});
test('death waits only once for captions; next turn cannot pass the queued death',()=>{
 const f=fixture(),card=f.doc.createElement('div');card.id='b_o_test';f.doc.body.appendChild(card);
 f.load('killCineQueuePatch','KILL_CINE_QUEUE_PATCH');f.load('finalCinematicPatch','FINAL_CINEMATIC_PATCH');f.load('mpTurnSequencePatch','MP_TURN_SEQUENCE_PATCH');
 let indicators=true,advanced=0;f.c.__bfIndicatorsBusy=()=>indicators;
 f.c.flushFx([{k:'death',side:'o',id:'test'}]);assert(f.c.__bfKillCinePending());assert(!f.c.__bfDeathDelayUntil);
 f.c.bfStepWhenCalm(()=>advanced++);f.tick(5000);assert(f.c.__bfKillCinePending());assert.equal(advanced,0);assert(!f.select('#bf-kill-ov'));
 indicators=false;const ready=f.now();f.tick(100);assert(f.select('#bf-kill-ov'));assert(f.now()-ready<=100);assert.equal(advanced,0);assert(card.classList.contains('bf-truedead'));assert.equal(f.c.__bfDeathVisHold.o_test,undefined);
 f.tick(5500);assert.equal(advanced,1);assert.equal(f.c.__bfKillCinePending(),false);
});
test('ordinary calm transition stays below 250ms and runs once',()=>{const f=fixture();f.load('mpTurnSequencePatch','MP_TURN_SEQUENCE_PATCH');let count=0;f.c.bfStepWhenCalm(()=>count++);f.tick(250);assert.equal(count,1);f.tick(1000);assert.equal(count,1);});
test('realtime unavailable falls back immediately; ready sends keep acknowledgement and retry',async()=>{
 const f=fixture(),sent=[],posts=[];let receive;const room={send:m=>sent.push(m),subscribe:cb=>{receive=cb;return {unsubscribe(){}};},close(){}};
 const factory=value('relayRealtimeChannel','relayRealtimeChannel',{base44:{actors:{GameRelayRoom:()=>({connect:()=>room})}},sessionStorage:{getItem:()=> 'test'},crypto:{randomUUID:()=> 'test'},Date:f.c.Date,setTimeout:f.c.setTimeout,clearTimeout:f.c.clearTimeout,setInterval:f.c.setInterval,clearInterval:f.c.clearInterval});
 const channel=factory('TEST','p',m=>posts.push(m),'token');const payload={batch_id:'b1',messages:[{t:'snap'}]};
 assert.equal(await channel.send(payload),null);assert.equal(sent.filter(m=>m.type==='send_batch').length,0);
 receive({type:'ready',peers:['p','g']});const sending=channel.send(payload);receive({type:'batch_ack',batch_id:'b1'});assert.equal((await sending).ok,true);
 const lost=channel.send({...payload,batch_id:'b2'});f.tick(900);assert.equal(await lost,null);assert.equal(await channel.send({...payload,batch_id:'b3'}),null);
 receive({type:'ready',peers:['p','g']});const recovered=channel.send({...payload,batch_id:'b4'});receive({type:'batch_ack',batch_id:'b4'});assert.equal((await recovered).ok,true);channel.close();
});test('online match adds NO extra delay between turns (same fast pace as solo)',()=>{
 const f=fixture();f.load('mpTurnSequencePatch','MP_TURN_SEQUENCE_PATCH');f.c.__bfMatchId='match-1';let count=0;
 f.c.bfStepWhenCalm(()=>count++);f.tick(250);assert.equal(count,1,'online turn passes in under 250ms when calm');
 f.tick(1000);assert.equal(count,1);
});
test('a stuck logical flag can no longer block the turn forever (hard ceiling)',()=>{
 const f=fixture();f.load('mpTurnSequencePatch','MP_TURN_SEQUENCE_PATCH');let count=0;
 f.c.__bfIndicatorsBusy=()=>true;f.c.__bfKillCinePending=()=>true; // banderas colgadas para siempre
 f.c.bfStepWhenCalm(()=>count++);
 f.tick(19000);assert.equal(count,0,'legit long waits (captions + kill cinematic) are still respected');
 f.tick(2000);assert.equal(count,1,'after the ceiling the turn advances instead of hanging');
 f.tick(5000);assert.equal(count,1,'and only once');
});
