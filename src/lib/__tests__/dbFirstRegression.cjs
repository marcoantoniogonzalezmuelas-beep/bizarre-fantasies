// La base de datos es la única fuente: lo que se crea en el editor llega al juego sin tocar código.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f),root=path.join(__dirname,'..','..','..'),read=f=>fs.readFileSync(lib(f),'utf8'),script=s=>s.replace(/<\/?script>/g,'');
const load=f=>import(pathToFileURL(lib(f)).href);

async function syncMod(){
  const tmp=path.join(os.tmpdir(),'bf-sync-'+process.pid+'.mjs');
  fs.writeFileSync(tmp,read('abilitySync.js').replace("'@/lib/abilityImplementationCatalog'",JSON.stringify(pathToFileURL(lib('abilityImplementationCatalog.js')).href)));
  const m=await import(pathToFileURL(tmp).href);fs.unlinkSync(tmp);return m;
}
const mkDeps=(initial=[],llm)=>{const db=[...initial],calls={implement:0,create:[],update:[],remove:[]};let n=0;
  return {db,calls,list:async id=>db.filter(s=>s.card_id===id),create:async p=>{calls.create.push(p);db.push({id:'s'+(++n),...p});},update:async(id,p)=>{calls.update.push(id);Object.assign(db.find(s=>s.id===id),p);},remove:async id=>{calls.remove.push(id);db.splice(db.findIndex(s=>s.id===id),1);},
    implement:async prompt=>{calls.implement++;return llm?llm(prompt):{effect_type:'custom_steps',params:{steps:[{action:'damage',target:'enemy',amount:9}]},note:'ok'};}};};
const hero={category:'hero',card_id:'nuevo',ability_name:'Golpe Nuevo',ability_text:'Daña a un rival.',elite_ability_name:'Golpe Élite',elite_ability_text:'Daña mucho a un rival.'};

test('editor -> database: a NEW hero gets both abilities (normal + elite) stored as AbilityImpl records',async()=>{
  const {syncCardAbilities}=await syncMod(),d=mkDeps();const r=await syncCardAbilities(hero,d);
  assert.equal(r.implemented,2);assert.equal(d.db.length,2);assert.deepEqual(d.db.map(s=>[s.card_id,s.elite,s.status,s.effect_type]).sort(),[['nuevo',false,'implemented','custom_steps'],['nuevo',true,'implemented','custom_steps']].sort());
  assert.equal(d.db[0].ability_text,'Daña a un rival.');assert.equal(d.db[1].ability_name,'Golpe Élite');
  // guardar otra vez sin cambios: no se gasta IA ni se toca nada
  d.calls.implement=0;const r2=await syncCardAbilities(hero,d);assert.equal(r2.kept,2);assert.equal(d.calls.implement,0,'no AI call when the text did not change');assert.equal(d.calls.update.length,0);
});
test('changed text is re-implemented; empty text removes the record; hand-written dedicated records are never overwritten',async()=>{
  const {syncCardAbilities}=await syncMod(),d=mkDeps();await syncCardAbilities(hero,d);d.calls.implement=0;
  let r=await syncCardAbilities({...hero,ability_text:'Daña a TODOS los rivales.'},d);assert.equal(r.implemented,1);assert.equal(d.calls.implement,1,'only the changed ability goes to the AI');assert.equal(d.db.find(s=>!s.elite).ability_text,'Daña a TODOS los rivales.');assert.equal(d.db.length,2,'updated in place, not duplicated');
  r=await syncCardAbilities({...hero,elite_ability_text:'',elite_ability_name:''},d);assert.equal(r.removed,1);assert.equal(d.db.length,1);
  const dd=mkDeps([{id:'x1',card_id:'monkgeta',elite:false,status:'implemented',effect_type:'dedicated_disoriented',ability_text:'Texto antiguo'}]);
  r=await syncCardAbilities({category:'hero',card_id:'monkgeta',ability_name:'D',ability_text:'Texto NUEVO',elite_ability_text:''},dd);assert.equal(r.protectedSpecs,1);assert.equal(dd.calls.implement,0);assert.equal(dd.db[0].ability_text,'Texto antiguo','dedicated spec untouched');
  // una ficha escrita a mano con el MISMO texto de la carta se respeta
  const seeded=mkDeps([{id:'y1',card_id:'tk_lav',elite:true,status:'implemented',effect_type:'custom_steps',ability_text:'Lava el cerebro.',ability_name:'PD'}]);
  r=await syncCardAbilities({category:'bizarro',card_id:'tk_lav',ability_text:'',elite_ability_name:'PD',elite_ability_text:'Lava el cerebro.'},seeded);assert.equal(r.kept,1);assert.equal(seeded.calls.implement,0);
});
test('never throws: AI failure or a non-automatable ability is stored as "manual" with its reason; other categories are ignored',async()=>{
  const {syncCardAbilities}=await syncMod();
  let d=mkDeps([],async()=>{throw new Error('IA caída');});let r=await syncCardAbilities(hero,d);
  assert.equal(r.manual,2);assert.ok(d.db.every(s=>s.status==='manual'&&/No se pudo analizar/.test(s.note)));assert.equal(r.errors.length,2);
  d=mkDeps([],async()=>({effect_type:'unsupported',note:'Necesita dados'}));r=await syncCardAbilities(hero,d);assert.equal(r.manual,2);assert.match(d.db[0].note,/Necesita dados/);assert.ok(r.lines.some(l=>/golpe genérico/.test(l)),'the editor says what the game will do');
  d=mkDeps([],async()=>({effect_type:'custom_steps',params:{steps:[{action:'inventada',target:'enemy',amount:1}]}}));r=await syncCardAbilities(hero,d);assert.equal(r.manual,2,'invalid steps are rejected by the real validator');
  for(const cat of ['spell','object','melee_weapon','armor','bonus']){d=mkDeps();r=await syncCardAbilities({...hero,category:cat},d);assert.equal(d.db.length,0,cat+' has no hero ability');}
  d=mkDeps();d.list=async()=>{throw new Error('BD no disponible');};r=await syncCardAbilities(hero,d);assert.equal(r.errors.length,1);
  const {removeCardAbilities}=await syncMod();const del=[];const fake={entities:{AbilityImpl:{filter:async()=>[{id:'a'},{id:'b'}],delete:async id=>{del.push(id);}}}};assert.equal(await removeCardAbilities('x',fake),2);assert.deepEqual(del,['a','b']);
});
test('GAME: a hero with no record and no known mechanic can no longer hang the turn (error OR no progress -> generic hit, turn ends, diagnostics)',async()=>{
  const {ABILITY_IMPL_PATCH}=await load('abilityImplPatch.js');
  const mk=(akind,origFn)=>{
    const logs=[],posts=[],dmg=[];let done=0,now=0,id=0;const T=new Map();
    let fin=0;const cb=()=>{fin++;};
    const hero={id:'nuevo',name:'Nuevo',type:'HE',akind,alive:true,ability:'Rara',abilityUsed:false,he:20,eliteMode:false};const foe={id:'f',name:'Foe',alive:true,hp:50};
    const G={team:{p:[hero],o:[foe]}};
    const env={G,B:{pending:null,over:false},Date:{now:()=>now},Math,JSON,Object,Array,Number,String,parseInt,isNaN,
      setTimeout:(f,ms)=>{T.set(++id,{f,at:now+ms,rep:0});return id;},setInterval:(f,ms)=>{T.set(++id,{f,at:now+ms,rep:ms});return id;},clearInterval:i=>T.delete(i),clearTimeout:i=>T.delete(i),
      pushLog:(c,m)=>logs.push(m),dealDamage:(t,a,o)=>{dmg.push([t.id,a,o.type]);return a;},stat:(h,k)=>h[k]||0,renderBattle(){},netSync(){},finishAct(){done++;},tSide:h=>G.team.p.includes(h)?'p':'o',
      bfChooseAbilityTarget:(side,prompt,pool,cb)=>cb(G.team[pool][0]),parent:{postMessage:m=>posts.push(m)},addEventListener(){},document:{}};
    env.window=env;env.useAbility=origFn(env);
    vm.runInNewContext(script(ABILITY_IMPL_PATCH),env);
    const advance=ms=>{const end=now+ms;while(now<end){now=Math.min(end,now+10);for(const [i,t] of [...T])if(t.at<=now){if(t.rep)t.at+=t.rep;else T.delete(i);t.f();}}};
    advance(400);return {env,hero,foe,logs,posts,dmg,advance,cb,done:()=>fin};
  };
  // 1) el motor lanza un error (el caso de Faseve)
  let w=mk(undefined,()=>function(){throw new TypeError("Cannot read properties of null (reading 'clan')");});
  w.env.useAbility('p',w.hero,w.cb);w.advance(900);
  assert.equal(w.done(),1,'the action finished');assert.equal(w.hero.abilityUsed,true);assert.deepEqual(w.dmg,[['f',26,'spell']],'generic hit: 1.3 x main stat, spell for an HE hero');
  assert.ok(w.logs.some(l=>/aún no está implementada en la base de datos/.test(l)));
  assert.equal(w.posts.filter(p=>p.bfRelayError&&p.bfRelayError.error_type==='ability_unimplemented').length,1,'reported once to diagnostics with the card_id');assert.match(w.posts[0].bfRelayError.error_message,/nuevo\|n/);
  // 2) el motor no lanza error pero tampoco avanza (una capa intermedia se traga el fallo)
  w=mk(undefined,()=>function(){/* no hace nada */});w.env.useAbility('p',w.hero,w.cb);w.advance(1400);assert.equal(w.done(),0,'not yet (grace period)');w.advance(800);assert.equal(w.done(),1,'after 1.5 s without progress the generic hit closes the action (+0.4 s like any ability)');
  // 3) mecánica desconocida pero que SÍ termina: no se toca
  w=mk('algo-raro',()=>function(s,h,done){h.abilityUsed=true;done();});let fin=0;w.env.useAbility('p',w.hero,()=>{fin++;});w.advance(3000);assert.equal(fin,1);assert.equal(w.dmg.length,0,'no extra hit when the ability finished by itself');
  // 4) mecánica conocida: camino directo, sin vigilante
  w=mk('aoe-cc',()=>function(s,h,done){return 'directo';});assert.equal(w.env.useAbility('p',w.hero,()=>{}),'directo');w.advance(3000);assert.equal(w.dmg.length,0);
  // 5) pide objetivo (turno de espera legítima): no se interrumpe
  w=mk(undefined,e=>function(){e.B.pending={prompt:'Elige'};});w.env.useAbility('p',w.hero,()=>{});w.advance(3000);assert.equal(w.dmg.length,0,'waiting for the player to choose a target is not a stall');
});
test('caches: a new/edited card invalidates the local copy AND the 60 s server cache; unreadable stamp never blocks loading',async()=>{
  const tmp=path.join(os.tmpdir(),'bf-ldr-'+process.pid+'.mjs');
  fs.writeFileSync(tmp,read('gameHtmlLoader.js').replace("import { base44 } from '@/api/base44Client';","const base44 = { functions: { invoke: async () => { throw new Error('x'); } }, entities: { Card: { list: async () => [] } } };").replace("import { createGameHtmlStore, idbBackend } from '@/lib/gameHtmlCache';","import { createGameHtmlStore, idbBackend } from "+JSON.stringify(pathToFileURL(lib('gameHtmlCache.js')).href)+";"));
  const {createGameHtmlLoader}=await import(pathToFileURL(tmp).href);fs.unlinkSync(tmp);const {createGameHtmlStore}=await load('gameHtmlCache.js');
  const html=n=>'<html>'+'x'.repeat(2000+n)+'</html>';
  const mem=()=>{const m=new Map();return {async get(k){return m.get(k);},async put(k,v){m.set(k,JSON.parse(JSON.stringify(v)));},async del(k){m.delete(k);}};};
  let stamp='A',body=html(1),calls=0,order=[];const store=createGameHtmlStore(mem());
  const L=()=>createGameHtmlLoader({invoke:async()=>{calls++;order.push('fetch');return {data:body,headers:{}};},store,version:'v',getStamp:async()=>{order.push('stamp:'+stamp);return stamp;},stampTimeoutMs:30});
  await L().load(1);await new Promise(r=>setImmediate(r));assert.equal((await store.get('v')).stamp,'A','copy saved WITH the database stamp');
  assert.deepEqual(order.slice(0,2),['stamp:A','fetch'],'stamp read BEFORE downloading: a newer HTML never gets an older stamp, and a stale copy never gets a newer one');
  calls=0;let r=await L().load(1);assert.equal(r.source,'cache','nothing changed in the database: instant local copy');await r.refresh;
  stamp='B';body=html(2);calls=0;r=await L().load(1);assert.equal(r.source,'network','a card was created/edited: the local copy is NOT used');assert.equal(r.html,body);await new Promise(x=>setImmediate(x));assert.equal((await store.get('v')).stamp,'B');
  // marca ilegible (red lenta/falla): se usa la copia, nunca se bloquea
  const slow=createGameHtmlLoader({invoke:async()=>({data:body,headers:{}}),store,version:'v',getStamp:()=>new Promise(()=>{}),stampTimeoutMs:20});r=await slow.load(1);assert.equal(r.source,'cache');
  const bad=createGameHtmlLoader({invoke:async()=>({data:body,headers:{}}),store,version:'v',getStamp:async()=>{throw new Error('RLS');},stampTimeoutMs:20});r=await bad.load(1);assert.equal(r.source,'cache');
  const srv=fs.readFileSync(path.join(root,'base44/functions/gameHtml/entry.ts'),'utf8');
  assert.match(srv,/async function cardsStamp\(base44\)/);assert.match(srv,/stamp && cachedStamp === stamp/,'server cache only valid while no card changed');assert.match(srv,/cachedStamp = stamp;/);
  assert.match(read('gameHtmlCache.js'),/GAME_HTML_MAX_AGE_MS = 60 \* 60 \* 1000/);assert.match(read('gameHtmlLoader.js'),/getStamp: async \(\) => \{\s*const l = await base44\.entities\.Card\.list\('-updated_date', 1\)/);assert.match(read('gameHtmlLoader.js'),/entities\.AbilityImpl\.list\('-updated_date', 1\)/,'the stamp also covers the equipment parameters (AbilityImpl)');
  const cv=/GAME_HTML_VERSION = '([^']+)'/.exec(read('gameHtmlLoader.js'))[1],sv=/GAME_PATCH_VERSION = '([^']+)'/.exec(srv)[1];assert.equal(cv,sv);
});
test('editor wiring: saving a card syncs its abilities, deleting it removes them',()=>{
  const a=read('../pages/AdminCards.jsx');
  assert.match(a,/syncCardAbilities\(saved, realAbilityDeps\(base44\)\)/);assert.match(a,/removeCardAbilities\(originalCardId \|\| form\.card_id, base44\)/);assert.match(a,/setAbilityMsg\(\(prev\) => .*res\.lines\.join/);assert.match(a,/\{abilityMsg \? <div/);
  assert.ok(a.indexOf('syncCardAbilities(saved')>a.indexOf('Card.create(payload)'),'sync runs after the card is saved');
});
