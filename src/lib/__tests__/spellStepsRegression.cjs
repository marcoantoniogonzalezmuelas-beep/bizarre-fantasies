// Hechizos y objetos con efecto definido en la base de datos (kind "bf_steps"): sin código por carta.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f),root=path.join(__dirname,'..','..','..'),read=f=>fs.readFileSync(lib(f),'utf8'),load=f=>import(pathToFileURL(f.startsWith('/')?f:lib(f)).href),script=s=>s.replace(/<\/?script>/g,'');
const J=x=>JSON.parse(JSON.stringify(x));

test('catalog: bf_steps is a spell and object kind validated with the same validator as abilities; the equipment builder passes the steps through',async()=>{
  const {validateEffect,SPELL_KINDS,OBJECT_KINDS,stepsTemplate,defaultEffect}=await load('equipmentEffects.js'),b=(await load(path.join(root,'base44/shared/equipItems.ts'))).buildEquipItem;
  assert.ok(SPELL_KINDS.bf_steps&&OBJECT_KINDS.bf_steps);
  const sp={v:1,kind:'bf_steps',element:'rayo',steps:[{action:'damage',target:'all_enemies',magic_base:8,dtype:'spell',element:'rayo'},{action:'paralyze',target:'other_enemy',turns:1}]};
  assert.equal(validateEffect('spell',sp).ok,true,'no "base" needed: the amount scales inside the steps');
  assert.equal(validateEffect('object',{v:1,kind:'bf_steps',steps:[{action:'heal',target:'ally',amount:20}]}).ok,true);
  assert.equal(validateEffect('spell',{v:1,kind:'bf_steps'}).ok,false,'steps are required');assert.equal(validateEffect('spell',{v:1,kind:'bf_steps',steps:[]}).ok,false);
  assert.equal(validateEffect('spell',{v:1,kind:'bf_steps',steps:[{action:'inventada',target:'enemy',amount:1}]}).ok,false,'invalid steps are rejected by the real validator');
  assert.equal(validateEffect('object',{v:1,kind:'bf_steps',steps:[{action:'heal',target:'nadie',amount:1}]}).ok,false);
  assert.equal(validateEffect('spell',{v:1,kind:'dmg1'}).ok,false,'ordinary kinds still require their base');
  for(const c of ['spell','object'])assert.equal(validateEffect(c,{v:1,kind:'bf_steps',steps:stepsTemplate(c)}).ok,true,'the template is valid for '+c);
  const it=b({card_id:'sp_n',cat:'spell',name:'Nuevo',cost:12,mana:9,tag:'rayo',txt:'t',num:150,effect:sp});
  assert.deepEqual([it.kind,it.mana,it.element,it.desc],['bf_steps',9,'rayo','t']);assert.deepEqual(J(it.steps),sp.steps,'the steps reach the engine object');
  const ob=b({card_id:'ob_n',cat:'object',name:'Elixir',cost:9,effect:{v:1,kind:'bf_steps',val:0,steps:[{action:'heal',target:'ally',amount:20}]}});assert.equal(ob.steps.length,1);
});

function world(){
  const T=new Map();let id=0,now=0;const logs=[],dmg=[],heals=[],calls={orig:{cast:0,item:0,ai:0},fin:0,end:0};
  const mkH=o=>Object.assign({alive:true,hp:50,maxHp:50,shield:0,_mods:[],cc:20,ad:18,he:36,type:'HE',mana:20,maxMana:20,silence:0,para:0,name:o.id},o);
  const G={team:{p:[mkH({id:'hero'}),mkH({id:'a1',hp:20})],o:[mkH({id:'f1'}),mkH({id:'f2'})]},items:{p:[],o:[]},spellbook:{p:[],o:[]}};
  const SPELLS=[{id:'sp_x',name:'Tormenta',kind:'bf_steps',mana:8,steps:[{action:'damage',target:'all_enemies',magic_base:10,dtype:'spell',element:'rayo'}]},{id:'sp_old',name:'Vieja',kind:'dmg1',mana:5}];
  const env={G,SPELLS,B:{pending:null,over:false,current:{side:'p',id:'hero'}},NET:{role:'local'},Math,JSON,Object,Array,Number,String,isNaN,parseInt,HE_REF:18,
    setTimeout:(f,ms)=>{T.set(++id,{f,at:now+ms,rep:0});return id;},setInterval:(f,ms)=>{T.set(++id,{f,at:now+ms,rep:ms});return id;},clearInterval:i=>T.delete(i),clearTimeout:i=>T.delete(i),
    byId:(a,i)=>a.find(x=>x.id===i),getHero:(s,i)=>G.team[s].find(h=>h.id===i),notif:m=>logs.push('NOTIF '+m),pushLog:(c,m)=>logs.push(m),pushFx(){},renderBattle(){},netSync(){},tSide:h=>G.team.p.includes(h)?'p':'o',
    stat:(h,k)=>h[k]||0,heal:(t,n)=>{const g=Math.max(0,Math.min(n,t.maxHp-t.hp));t.hp+=g;heals.push([t.id,g]);return g;},dealDamage:(t,a,o)=>{dmg.push([t.id,a,o.type]);t.hp=Math.max(0,t.hp-a);return a;},
    finishAct(){calls.fin++;},endTurn(){calls.end++;},humanCtl:()=>false,bfChooseAbilityTarget:(s,p,pool,cb)=>{const c=G.team[pool].filter(h=>h.alive);cb(c[0]);},
    castSpell(){calls.orig.cast++;},useItem(){calls.orig.item++;},aiTurn(){calls.orig.ai++;},addEventListener(){},document:{},parent:{postMessage(){}},useAbility(){}};
  env.window=env;return {env,G,logs,dmg,heals,calls,SPELLS,advance:ms=>{const end=now+ms;while(now<end){now=Math.min(end,now+10);for(const [i,t] of [...T])if(t.at<=now){if(t.rep)t.at+=t.rep;else T.delete(i);t.f();}}}};
}
async function mk(){
  const w=world();vm.runInNewContext(script((await load('abilityImplPatch.js')).ABILITY_IMPL_PATCH),w.env);vm.runInNewContext(script((await load('spellStepsPatch.js')).SPELL_STEPS_PATCH),w.env);w.advance(600);return w;
}
test('SPELL: spends the mana, scales with the caster Magic (magic_base x HE / 18), ends the action; no mana = nothing happens; engine spells go through the engine',async()=>{
  let w=await mk();assert.equal(typeof w.env.__bfExecuteSteps,'function');
  w.env.castSpell('sp_x');w.advance(200);assert.equal(w.G.team.p[0].mana,12,'8 mana spent');assert.deepEqual(J(w.dmg),[['f1',20,'spell'],['f2',20,'spell']],'10 x 36/18 = 20 to every enemy');assert.equal(w.calls.fin,1);assert.equal(w.calls.orig.cast,0,'the database effect ran, not the engine');
  w=await mk();w.G.team.p[0].mana=3;w.env.castSpell('sp_x');w.advance(200);assert.deepEqual([w.dmg.length,w.calls.fin,w.G.team.p[0].mana],[0,0,3]);assert.ok(w.logs.some(l=>/Man.* insuficiente/.test(l)));
  w=await mk();w.env.castSpell('sp_old');assert.equal(w.calls.orig.cast,1,'ordinary spells are untouched');
  w=await mk();w.env.NET.role='client';w.env.castSpell('sp_x');assert.equal(w.calls.orig.cast,1,'the guest sends its intent to the host through the engine');assert.equal(w.dmg.length,0);
  w=await mk();w.SPELLS[0].steps=[{action:'revive',target:'dead_ally',hp_pct:1}];w.env.castSpell('sp_x');w.advance(200);assert.equal(w.G.team.p[0].mana,20,'a spell that could do nothing refunds its mana');assert.equal(w.calls.fin,0,'and the turn is not spent');
});
test('OBJECT: runs its steps and is consumed only when it had an effect',async()=>{
  let w=await mk();const el={id:'ob_e',name:'Elixir',kind:'bf_steps',steps:[{action:'heal',target:'ally',amount:20},{action:'shield',target:'ally',amount:10}]};w.G.items.p=[el];
  w.env.useItem(0);w.advance(200);assert.equal(w.G.items.p.length,0,'consumed');assert.equal(w.calls.fin,1);assert.equal(w.calls.orig.item,0);
  assert.equal(w.G.team.p[0].shield,10,'the shield step ran on the same chosen ally');
  w=await mk();w.G.items.p=[{id:'ob_n',name:'Nada',kind:'bf_steps',steps:[{action:'revive',target:'dead_ally',hp_pct:1}]}];w.env.useItem(0);w.advance(200);assert.equal(w.G.items.p.length,1,'no effect: not consumed');assert.equal(w.calls.fin,0);
  w=await mk();w.G.items.p=[{id:'ob_h',name:'Poción',kind:'heal',val:18}];w.env.useItem(0);assert.equal(w.calls.orig.item,1,'engine objects are untouched');
});
test('AI: sometimes uses a steps spell or object; otherwise plays as always',async()=>{
  const w=await mk();w.G.spellbook.o=['sp_x'];const f=w.G.team.o[0];w.env.Math=Object.assign(Object.create(Math),{random:()=>0.1});
  w.env.aiTurn(f,'o');w.advance(300);assert.equal(w.calls.end,1,'the AI turn ends after casting');assert.equal(w.calls.orig.ai,0);assert.ok(w.dmg.length>0,'it cast the database spell on the player team');
  const w2=await mk();w2.env.Math=Object.assign(Object.create(Math),{random:()=>0.9});w2.env.aiTurn(w2.G.team.o[0],'o');assert.equal(w2.calls.orig.ai,1,'usually the normal AI plays');
});
test('WIRING: injected into the game, editor offers the steps box and fills a valid template',()=>{
  assert.match(read('gameInject.js'),/import \{ SPELL_STEPS_PATCH \} from '@\/lib\/spellStepsPatch';/);assert.match(read('gameInject.js'),/ABILITY_IMPL_PATCH \+ SPELL_STEPS_PATCH/,'after the executor it relies on');
  const e=read('../components/admin/EffectEditor.jsx');assert.match(e,/function StepsBox/);assert.match(e,/kind: k, \.\.\.\(k === 'bf_steps' && !\(e && e\.steps\) \? \{ steps: stepsTemplate\(category\) \} : \{\}\)/);assert.match(e,/magic_base/);
  assert.match(read('abilityImplPatch.js'),/window\.__bfExecuteSteps = executeSteps;/);assert.match(read('abilityImplementationCatalog.js'),/magic_base N/);
});
