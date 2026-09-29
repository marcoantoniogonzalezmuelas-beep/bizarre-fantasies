const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const read=n=>fs.readFileSync(path.join(__dirname,'..',n+'.js'),'utf8');
const value=(n,s,extra={})=>vm.runInNewContext(read(n).replace(/^import .*;$/gm,'').replace('export const','const').replace('export function','function')+'\n'+s,extra);
const createDeathQuipPicker=value('deathQuips','createDeathQuipPicker');
const createDeathScene=value('deathScene','createDeathScene');
const DEATH_SCENE_CSS=value('deathScene','DEATH_SCENE_CSS');
const css=value('heroDicePresentation','HERO_DICE_PRESENTATION_CSS');
function fixture(){
 let now=10000,id=0;const timers=new Map();
 const schedule=(fn,ms,repeat=0)=>{const key=++id;timers.set(key,{fn,at:now+ms,repeat});return key;};
 const tick=ms=>{const end=now+ms;let budget=10000;while(budget--){let next;for(const t of timers)if(t[1].at<=end&&(!next||t[1].at<next[1].at))next=t;if(!next)break;const[key,t]=next;now=t.at;if(t.repeat)t.at+=t.repeat;else timers.delete(key);t.fn();}now=end;assert(budget>0);};
 const node=()=>{const n={children:[],style:{setProperty(){}},dataset:{},className:'',textContent:'',setAttribute(){},appendChild(c){c.parentNode=n;n.children.push(c);},removeChild(c){n.children.splice(n.children.indexOf(c),1);c.parentNode=null;},remove(){n.parentNode?.removeChild(n);}};n.classList={contains:s=>n.className.split(' ').includes(s),add:s=>n.className+=' '+s};return n;};
 const body=node(),head=node();
 const all=(root=body)=>root.children.flatMap(c=>[c,...all(c)]);
 const select=s=>all().find(n=>s.split(',').some(x=>x[0]==='.'?n.classList.contains(x.slice(1)):x[0]==='#'?n.id===x.slice(1):false))||null;
 const c={console,Math,Date:{now:()=>now},document:{body,head,createElement:node,querySelector:select,querySelectorAll:()=>[],getElementById:id=>all().find(n=>n.id===id)||null},setTimeout:(f,ms)=>schedule(f,ms),setInterval:(f,ms)=>schedule(f,ms,ms),clearInterval:k=>timers.delete(k),clearTimeout:k=>timers.delete(k),__bfCinematicBusy:()=>false,bfKillCinematic(){},B:{over:false},getHero:()=>({id:'test',name:'Héroe caído',clan:'No-muertos'}),flushFx(){}};
 c.window=c;vm.createContext(c);
 const load=(n,s)=>vm.runInContext(value(n,s,{HERO_DICE_PRESENTATION_CSS:css,createDeathQuipPicker,createDeathScene,DEATH_SCENE_CSS}).replace(/<\/?script>/g,''),c);
 return {c,tick,load,select,all,node};
}
test('ability die uses a cup and holds the exact result for 4.5 seconds',()=>{
 const f=fixture();f.load('heroDicePatch','HERO_DICE_PATCH');let settled=0;
 f.c.__bfHeroDiceLaunch({faces:20,roll:20,crit:true,mult:'2.00',hero:'El Rolero',label:'Dado Cargado'},()=>settled++);
 assert(f.select('.bf-hdice-cup'));f.tick(1650);assert.equal(f.select('.bf-hdice-cube').textContent,'20');assert.match(f.select('.bf-hdice-lbl').textContent,/RESULTADO: 20 \/ 20.*2.00/);
 f.tick(4400);assert(!f.select('.bf-hdice').classList.contains('bf-hd-out'));assert.equal(settled,0);
 f.tick(100);assert(f.select('.bf-hdice').classList.contains('bf-hd-out'));f.tick(600);assert.equal(f.select('.bf-hdice'),null);assert.equal(settled,1);
});
test('presentation does not change rolled value or multiplayer payload',()=>{
 const f=fixture();f.load('heroDicePatch','HERO_DICE_PATCH');let event;f.c.pushFx=e=>event=e;
 assert.equal(f.c.__bfHeroRoll({faces:3,forced:2,hero:'Test',label:'Desorientado',delay:0}),2);assert.equal(event.cfg.roll,2);assert.equal(event.cfg.faces,3);f.tick(1650);assert.match(f.select('.bf-hdice-note').textContent,/Ataca a un aliado/);
});
test('a second die waits for the first result to finish',()=>{
 const f=fixture();f.load('heroDicePatch','HERO_DICE_PATCH');f.c.__bfHeroDiceLaunch({faces:3,roll:1});f.c.__bfHeroDiceLaunch({faces:3,roll:3});f.tick(6000);assert.equal(f.all().filter(n=>n.classList.contains('bf-hdice')).length,1);assert.match(f.select('.bf-hdice-lbl').textContent,/1 \/ 3/);f.tick(2500);assert.match(f.select('.bf-hdice-lbl').textContent,/3 \/ 3/);
});
for(const clan of ['Guerreros','Druidas','No-muertos','Vaqueros','Cotidianos','Elfos','Magos','Épicas','Bizarros'])test(clan+': four different lines, no repeat across bags, both languages',()=>{
 const pick=createDeathQuipPicker(),first=Array.from({length:4},()=>pick(clan,false));assert.equal(new Set(first).size,4);assert.notEqual(pick(clan,false),first[3]);assert(!first.includes(pick(clan,true)));
});
test('death overlay attributes thematic last words to the victim',()=>{
 const f=fixture();f.load('killCineQueuePatch','KILL_CINE_QUEUE_PATCH');const card=f.node();card.id='b_o_test';card.querySelector=()=>null;
 f.c.bfKillCinematic(card);f.tick(800);assert(f.select('#bf-kill-ov'));assert.match(f.select('.bf-kill-speaker').textContent,/Héroe caído/);assert(!f.select('.bf-kill-ko').textContent.includes('ELIMINADO'));
 const texts=f.all().map(n=>n.textContent).join(' ');assert.match(texts,/CATAPLUM|POW/);f.tick(4000);assert(f.select('#bf-kill-ov'));f.tick(900);assert.equal(f.select('#bf-kill-ov'),null);
 });
 test('one death is shown once across pending, waiting, playing and completed stages',()=>{
 const f=fixture();f.load('killCineQueuePatch','KILL_CINE_QUEUE_PATCH');const card=f.node();card.id='b_o_test';card.querySelector=()=>null;
 let shown=0;f.c.__bfAppend=n=>{shown++;f.c.document.body.appendChild(n);};
 f.c.bfKillCinematic(card);f.c.bfKillCinematic(card);f.tick(650);
 f.c.bfKillCinematic(card);f.tick(200);assert.equal(shown,1);
 f.c.bfKillCinematic(card);f.tick(6500);f.c.bfKillCinematic(card);f.tick(7000);
 assert.equal(shown,1);assert.equal(f.select('#bf-kill-ov'),null);
 });
 test('resurrection permits another death without replaying the previous death',()=>{
 const f=fixture(),hero={id:'test',name:'Test',alive:false};f.c.getHero=()=>hero;
 f.load('killCineQueuePatch','KILL_CINE_QUEUE_PATCH');const card=f.node();card.id='b_o_test';card.querySelector=()=>null;
 let shown=0;f.c.__bfAppend=n=>{shown++;f.c.document.body.appendChild(n);};
 f.c.bfKillCinematic(card);f.tick(6000);hero.alive=true;f.tick(100);f.c.bfKillCinematic(card);f.tick(800);assert.equal(shown,1);
 hero.alive=false;f.c.bfKillCinematic(card);f.tick(800);assert.equal(shown,2);
 });
 test('same hero ids on opposite sides remain separate victims',()=>{
 const f=fixture();f.load('killCineQueuePatch','KILL_CINE_QUEUE_PATCH');
 for(const side of ['p','o']){const card=f.node();card.id='b_'+side+'_test';card.querySelector=()=>null;f.c.bfKillCinematic(card);}
 f.tick(800);assert.equal(f.all().filter(n=>n.className==='bf-kill-speaker').length,2);
 });
 test('death hooks install once even when later patches wrap their functions',()=>{
 const f=fixture();f.c.endTurn=()=>{};let calls=0;f.c.bfKillCinematic=()=>calls++;
 const card=f.node();card.id='b_o_test';f.c.document.body.appendChild(card);
 f.load('finalCinematicPatch','FINAL_CINEMATIC_PATCH');
 const flush=f.c.flushFx,turn=f.c.endTurn;f.c.flushFx=(...a)=>flush(...a);f.c.endTurn=(...a)=>turn(...a);
 const wrappedFlush=f.c.flushFx,wrappedTurn=f.c.endTurn;f.tick(1000);
 assert.equal(f.c.flushFx,wrappedFlush);assert.equal(f.c.endTurn,wrappedTurn);
 f.c.flushFx([{k:'death',side:'o',id:'test'}]);f.tick(800);assert.equal(calls,1);
 });