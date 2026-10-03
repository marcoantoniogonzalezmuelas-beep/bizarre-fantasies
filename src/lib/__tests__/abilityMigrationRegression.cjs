// Habilidades en la base de datos: el ejecutor ampliado, las fichas y el cambio de card_id.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f),read=f=>fs.readFileSync(lib(f),'utf8'),load=f=>import(pathToFileURL(lib(f)).href),script=s=>s.replace(/<\/?script>/g,'');

test('seed: every record is valid for the real validator; no duplicates; dedicated ones are the code-backed ones',async()=>{
  const {ABILITY_SEED}=await load('abilitySeed.js'),{validateAbilitySpec}=await load('abilityImplementationCatalog.js');
  const seen=new Set();let steps=0,ded=0;
  for(const r of ABILITY_SEED){
    const k=r.card_id+'|'+(r.elite?'e':'n');assert.ok(!seen.has(k),'duplicate '+k);seen.add(k);
    for(const f of ['card_id','ability_name','ability_text','status','effect_type','note'])assert.ok(r[f]!==undefined&&r[f]!=='',k+' misses '+f);
    assert.equal(r.status,'implemented');assert.equal(typeof r.elite,'boolean');
    if(r.effect_type==='custom_steps'){steps++;const v=validateAbilitySpec({effect_type:r.effect_type,params:r.params});assert.equal(v.ok,true,k+' rejected: '+JSON.stringify(v));}
    else{ded++;assert.match(r.effect_type,/^dedicated_/,k);if(r.effect_type!=='dedicated_duck_block')assert.deepEqual(r.params,{},k+' dedicated records carry no steps');}
  }
  assert.equal(ABILITY_SEED.length,113);assert.equal(steps,90);assert.equal(ded,23);   // incluye el Patito normal (bloqueo del pato) con el texto actual de la carta
  const has=(id,e)=>seen.has(id+'|'+(e?'e':'n'));
  for(const id of ['kru','bos','nar','achucm','tor','Undertaker','boski','painkil','mor','vap','hannai','kre','hev','pij','pat','tsuru','elder','zar','alf','dix','ska','syx','gor','fut','gam','mal','ser','bat','nix','vex','chi','sol','man','pac','rev','doc','zer','aje','pol'])assert.ok(has(id,false)&&has(id,true),id+' has both abilities in the database');
  for(const [id,e] of [['juni',false],['dojpur',true],['rol',true],['caoffe',true],['tk_grulla',false],['Faseve',true]])assert.ok(has(id,e),id+' registered (dedicated)');
});
test('every per-hero code patch yields to an executable database record; dedicated records keep their code',async()=>{
  for(const f of ['faithfulAbilitiesPatch.js','narbonElitePatch.js','nixaraAbilityPatch.js','fastAbilityPatch.js','llorilomoAbilityPatch.js'])assert.match(read(f),/__bfSpecOwns\(/,f+' must yield to the database record');
  assert.match(read('abilityImplPatch.js'),/indexOf\('dedicated_'\) !== 0/);
});

function mkWorld(){
  const logs=[],dmg=[],heals=[],revived=[],T=new Map();let id=0,now=0,origCalls=0,handler=null;
  const mkH=(o)=>Object.assign({alive:true,hp:50,maxHp:50,shield:0,_mods:[],cc:20,ad:18,he:20,type:'CC',name:o.id,ability:'X',eliteMode:false},o);
  const G={team:{p:[mkH({id:'hero',type:'AD'}),mkH({id:'a1',hp:20}),mkH({id:'a2',alive:false,hp:0})],o:[mkH({id:'f1',hp:6}),mkH({id:'f2',hp:20}),mkH({id:'f3',hp:50})]}};
  const env={G,B:{pending:null,over:false,current:{side:'p',id:'hero'}},Math,JSON,Object,Array,Number,String,isNaN,parseInt,
    setTimeout:(f,ms)=>{T.set(++id,{f,at:now+ms,rep:0});return id;},setInterval:(f,ms)=>{T.set(++id,{f,at:now+ms,rep:ms});return id;},clearInterval:i=>T.delete(i),clearTimeout:i=>T.delete(i),
    pushLog:(c,m)=>logs.push(m),pushFx(){},renderBattle(){},netSync(){},tSide:h=>G.team.p.includes(h)?'p':'o',finishAct(){},
    stat:(h,k)=>h[k]||0,heal:(t,n)=>{const g=Math.max(0,Math.min(n,t.maxHp-t.hp));t.hp+=g;heals.push([t.id,g]);return g;},
    dealDamage:(t,a,o)=>{dmg.push([t.id,a,o]);const d=a;t.hp=Math.max(0,t.hp-d);if(t.hp<=0)t.alive=false;return d;},
    reviveHero:(t,p)=>{t.alive=true;t.hp=Math.round(t.maxHp*p);revived.push([t.id,p]);},
    bfChooseAbilityTarget:(side,pr,pool,cb)=>{const c=G.team[pool].filter(h=>h.alive);cb(c[c.length-1]);},humanCtl:()=>false,
    addEventListener:(t,fn)=>{if(t==='message')handler=fn;},document:{},parent:{postMessage(){}},nextRound(){},endTurn(){}};
  env.window=env;env.useAbility=function(){origCalls++;};
  vm.runInNewContext(script(require('node:module').createRequire(__filename)&&global.__PATCH),env);
  const advance=ms=>{const end=now+ms;while(now<end){now=Math.min(end,now+10);for(const [i,t] of [...T])if(t.at<=now){if(t.rep)t.at+=t.rep;else T.delete(i);t.f();}}};
  advance(400);
  return {env,G,logs,dmg,heals,revived,advance,specs:s=>handler({data:{bfAbilitySpecs:s}}),orig:()=>origCalls};
}
const J=x=>JSON.parse(JSON.stringify(x));
const spec=(card_id,elite,steps,effect_type='custom_steps')=>({card_id,elite,status:'implemented',effect_type,params:{steps},ability_name:'T'});
async function run(steps,{elite=false,heroMod={}}={}){
  global.__PATCH=(await load('abilityImplPatch.js')).ABILITY_IMPL_PATCH;
  const w=mkWorld();Object.assign(w.G.team.p[0],heroMod);w.specs([spec('hero',elite,steps)]);if(elite)w.G.team.p[0].eliteMode=true;
  let done=0;w.env.useAbility('p',w.G.team.p[0],()=>{done++;});w.advance(1500);return Object.assign(w,{done});
}
test('EXECUTOR: damage options (scale stat + bonus, pierce, ignore flags, double below, hits penalties, lifesteal)',async()=>{
  let w=await run([{action:'damage',target:'enemy',scale_stat:'ad',stat_mult:0.9,dtype:'ranged',hits:[0,-3],pierce:0.5,ignore_shield:true}]);
  assert.deepEqual(J(w.dmg.map(d=>d[1])),[16,13],'two shots, the second at -3');assert.deepEqual(J(w.dmg[0][2]),{type:'ranged',pierce:0.5,ignoreShield:true});assert.equal(w.done,1);assert.equal(w.orig(),0,'the record ran, not the old code');
  w=await run([{action:'damage',target:'enemy',scale_stat:'cc',stat_mult:1,dtype:'melee',double_below:0.4}]);assert.equal(w.dmg[0][1],20,'a full-life target takes no double');
  w=await run([{action:'damage',target:'weakest_enemy',scale_stat:'cc',stat_mult:1,dtype:'melee',double_below:0.4}]);assert.equal(w.dmg[0][1],40,'weakest enemy (f1 at 12%) takes double');
  w=await run([{action:'damage',target:'enemy',dtype:'ranged',hp_pct:0.5,pierce:1,ignore_armor:true}]);assert.equal(w.dmg[0][1],25,'50% of the target current life');assert.equal(w.dmg[0][2].ignoreArmor,true);
  w=await run([{action:'damage',target:'enemy',scale_stat:'he',stat_mult:1.1,dtype:'spell',element:'arcano',lifesteal:1,heal_to:'weakest_ally'}],{heroMod:{type:'HE'}});
  assert.equal(w.dmg[0][1],22);assert.deepEqual(J(w.heals[0]),['a1',22],'ally a1 (20/50) is the weakest and gets the damage back');
  w=await run([{action:'damage',target:'all_enemies',scale_stat:'cc',stat_mult:0.8,bonus:5,dtype:'melee'}],{elite:true});assert.deepEqual(J(w.dmg.map(d=>d[1])),[21,21,21],'0.8 x 20 + 5 to every enemy');
});
test('EXECUTOR: execute, other_enemy, destroy equipment, max life, swap stats, revive, equalize, multi-stat mods, regen flag, hand block',async()=>{
  let w=await run([{action:'execute',target:'all_enemies',threshold:14}]);assert.deepEqual(J(w.dmg.map(d=>[d[0],d[1],d[2].type])),[['f1',9999,'true']],'only the enemy at or under 14 life is executed');
  w=await run([{action:'execute',target:'enemy',threshold:8,else_mult:0.6,scale_stat:'cc'}]);assert.equal(w.dmg[0][1],12,'full-life target: not executed, 0.6 x CC instead');
  w=await run([{action:'damage',target:'enemy',scale_stat:'cc',stat_mult:1,dtype:'melee'},{action:'damage',target:'other_enemy',scale_stat:'cc',stat_mult:0.7,dtype:'melee'}]);assert.deepEqual(J(w.dmg.map(d=>[d[0],d[1]])),[['f3',20],['f1',14]],'the second hit goes to a DIFFERENT enemy');
  w=await run([{action:'destroy_equipment',target:'weakest_enemy'}]);
  const mk=await run([{action:'noop',target:'self'}]);assert.ok(mk.logs.some(l=>/no pasa nada/.test(l)),'noop logs instead of a "PIFIA" (nothing-happened) marker');
  global.__PATCH=(await load('abilityImplPatch.js')).ABILITY_IMPL_PATCH;let W=mkWorld();const f=W.G.team.o[2];f.armor={hp:8};f.mwep={id:'x'};f.rwep={id:'y'};f.shield=9;
  W.specs([spec('hero',false,[{action:'destroy_equipment',target:'enemy'},{action:'reduce_max_hp',target:'enemy',amount:5},{action:'swap_stats',target:'enemy'}])]);f.he=30;f.cc=14;W.env.useAbility('p',W.G.team.p[0],()=>{});W.advance(1500);
  assert.deepEqual(J([f.armor,f.mwep,f.rwep,f.shield,f.maxHp]),[null,null,null,0,37],'weapons, armor and shield destroyed; max life -8 (armor) -5');assert.deepEqual(J(f._mods.at(-1)),{cc:16,he:-16,turns:99},'CC and HE swapped');
  W=mkWorld();W.specs([spec('hero',false,[{action:'revive',target:'dead_ally',hp_pct:0.5}])]);W.env.useAbility('p',W.G.team.p[0],()=>{});W.advance(1500);assert.deepEqual(J(W.revived),[['a2',0.5]]);assert.equal(W.G.team.p[2].alive,true);
  W=mkWorld();W.specs([spec('hero',false,[{action:'revive',target:'dead_ally',hp_pct:1}])]);W.G.team.p[2].alive=true;W.env.useAbility('p',W.G.team.p[0],()=>{});W.advance(1500);assert.equal(W.orig(),1,'no fallen ally: the engine default handles it (heals the most hurt)');
  W=mkWorld();W.specs([spec('hero',false,[{action:'heal_equalize',target:'all_allies'}])]);W.env.useAbility('p',W.G.team.p[0],()=>{});W.advance(1500);assert.deepEqual(J(W.G.team.p.filter(h=>h.alive).map(h=>h.hp)),[50,50],'everyone alive is raised to the healthiest');
  W=mkWorld();W.specs([spec('hero',false,[{action:'buff',target:'self',mods:{cc:6,vel:4},turns:99},{action:'debuff',target:'all_enemies',mods:{cc:3,ad:3},turns:1}])]);W.env.useAbility('p',W.G.team.p[0],()=>{});W.advance(1500);
  assert.deepEqual(J(W.G.team.p[0]._mods),[{turns:99,cc:6,vel:4}],'one single modifier with several stats');assert.deepEqual(J(W.G.team.o.map(h=>h._mods[0])),Array(3).fill({turns:1,cc:-3,ad:-3}));
  W=mkWorld();W.specs([spec('hero',false,[{action:'shield',target:'ally',amount:22},{action:'shield_regen',target:'ally',amount:22},{action:'block_hand',target:'enemy',turns:2}])]);W.env.useAbility('p',W.G.team.p[0],()=>{});W.advance(1500);
  const al=W.G.team.p[1];assert.deepEqual(J([al.shield,al._bfShieldRegen,W.G.team.o[2]._bfHandBlock]),[22,22,2],'sets the engine own flags (_bfShieldRegen at end of turn, _bfHandBlock)');
});
test('PRECEDENCE: __bfSpecOwns is true only for executable records; a record always wins over per-hero code; dedicated and missing records fall through',async()=>{
  global.__PATCH=(await load('abilityImplPatch.js')).ABILITY_IMPL_PATCH;const w=mkWorld(),h=w.G.team.p[0];
  assert.equal(w.env.__bfSpecOwns(h),false,'no record yet');
  w.specs([spec('hero',false,[{action:'noop',target:'self'}])]);assert.equal(w.env.__bfSpecOwns(h),true);
  w.specs([spec('hero',false,[],'dedicated_reflect_damage')]);assert.equal(w.env.__bfSpecOwns(h),false,'dedicated: its code keeps running');
  w.specs([{...spec('hero',false,[]),status:'manual',effect_type:'unsupported'}]);assert.equal(w.env.__bfSpecOwns(h),false);
  w.specs([spec('hero',true,[{action:'noop',target:'self'}])]);assert.equal(w.env.__bfSpecOwns(h),false,'the elite record does not own the normal ability');h.eliteMode=true;assert.equal(w.env.__bfSpecOwns(h),true);
});
test('CARD_ID: renaming moves the ability records to the new id (no orphans); the id must be unique; stale records under the new id are dropped',async()=>{
  const tmp=path.join(os.tmpdir(),'bf-sync2-'+process.pid+'.mjs');
  fs.writeFileSync(tmp,read('abilitySync.js').replace("'@/lib/abilityImplementationCatalog'",JSON.stringify(pathToFileURL(lib('abilityImplementationCatalog.js')).href)).replace("'@/lib/engineRequestPrompt'",JSON.stringify(pathToFileURL(lib('engineRequestPrompt.js')).href)));
  const m=await import(pathToFileURL(tmp).href);fs.unlinkSync(tmp);
  const db=[{id:'1',card_id:'viejo',elite:false},{id:'2',card_id:'viejo',elite:true},{id:'3',card_id:'nuevo',elite:false},{id:'4',card_id:'otro',elite:false}];
  const deps={list:async id=>db.filter(s=>s.card_id===id),update:async(id,p)=>Object.assign(db.find(s=>s.id===id),p),remove:async id=>db.splice(db.findIndex(s=>s.id===id),1)};
  assert.deepEqual(await m.renameCardAbilities('viejo','nuevo',deps),{moved:2,dropped:1});assert.deepEqual(db.map(s=>[s.id,s.card_id]),[['1','nuevo'],['2','nuevo'],['4','otro']]);
  assert.deepEqual(await m.renameCardAbilities('x','x',deps),{moved:0,dropped:0});assert.deepEqual(await m.renameCardAbilities('','y',deps),{moved:0,dropped:0});
  const cards=[{id:'c1',card_id:'a'},{id:'c2',card_id:'b'}];const base44={entities:{Card:{filter:async q=>cards.filter(c=>c.card_id===q.card_id)}}};
  assert.equal(await m.cardIdTaken('b','c1',base44),true,'another card already uses it');assert.equal(await m.cardIdTaken('b','c2',base44),false,'it is its own');assert.equal(await m.cardIdTaken('z','c1',base44),false);assert.equal(await m.cardIdTaken('','c1',base44),false);
  const a=read('../pages/AdminCards.jsx');
  assert.match(a,/cardIdTaken\(payload\.card_id, editingId, base44\)/);assert.match(a,/renameCardAbilities\(originalCardId, payload\.card_id, realAbilityDeps\(base44\)\)/);assert.match(a,/setOriginalCardId\(card\.card_id \|\| ''\)/);assert.match(a,/removeCardAbilities\(originalCardId \|\| form\.card_id, base44\)/);
  assert.ok(a.indexOf('cardIdTaken(')<a.indexOf('Card.update(editingId, payload)'),'uniqueness is checked BEFORE saving');assert.ok(a.indexOf('Card.update(editingId, payload)')<a.indexOf('renameCardAbilities(originalCardId'),'records move AFTER the card is saved');
});
test('ROLL (dice) step: the outcome that comes up runs on the chosen target — Faseve: 1 = no ability, 2 = never elite',async()=>{
  global.__PATCH=(await load('abilityImplPatch.js')).ABILITY_IMPL_PATCH;
  const steps=[{action:'roll',target:'enemy',sides:2,label:'Compresor Roto',outcomes:{'1':[{action:'disable_ability',target:'enemy'}],'2':[{action:'disable_elite',target:'enemy'}]}}];
  for(const face of [1,2]){
    const w=mkWorld();let asked=null;w.env.__bfHeroRoll=cfg=>{asked=cfg;return face;};w.specs([spec('hero',false,steps)]);let done=0;w.env.useAbility('p',w.G.team.p[0],()=>{done++;});w.advance(1500);
    const t=w.G.team.o[2];
    assert.equal(asked.faces,2,'a 2-sided die is thrown (with its animation)');assert.equal(done,1);assert.equal(w.orig(),0);
    if(face===1){assert.equal(t.abilityUsed,true,'1: ability cancelled');assert.equal(t._bfAbilityCineSuppressed,'normal');assert.equal(!!t._bfNoElite,false);}
    else{assert.equal(t.eliteUsed,true,'2: will never go elite');assert.equal(t._bfNoElite,1);assert.equal(!!t.abilityUsed,false);}
  }
  const {validateAbilitySpec}=await load('abilityImplementationCatalog.js');
  assert.equal(validateAbilitySpec({effect_type:'custom_steps',params:{steps}}).ok,true);
  assert.equal(validateAbilitySpec({effect_type:'custom_steps',params:{steps:[{action:'roll',target:'enemy',sides:1,outcomes:{'1':[]}}]}}).ok,false,'a die needs at least 2 faces');
  assert.equal(validateAbilitySpec({effect_type:'custom_steps',params:{steps:[{action:'roll',target:'enemy',sides:2,outcomes:{'1':[{action:'inventada',target:'enemy'}]}}]}}).ok,false,'outcome steps are validated too');
  const {ABILITY_SEED}=await load('abilitySeed.js');const fa=ABILITY_SEED.find(r=>r.card_id==='Faseve'&&!r.elite);assert.equal(fa.params.steps[0].action,'roll');assert.deepEqual(Object.keys(fa.params.steps[0].outcomes),['1','2']);
});
test('NO FALSE FUMBLES: a passive that arms itself or an applied status counts as an effect; "no effect" is never shown as a PIFIA',()=>{
  const f=read('fumbleRollPatch.js');
  assert.doesNotMatch(f,/nothing: en \? '[^']*' : 'PIFIA/,'the no-effect note is not called a fumble');
  const i=f.indexOf("if(window.__bfLogSeq === seq && stateSig() === sig0){"),seg=f.slice(i,i+300);assert.ok(i>0);assert.doesNotMatch(seg,/pop\(/,'and it does not show the PIFIA banner');
  assert.match(f,/function flagSig\(x\)/);assert.match(f,/x\.sleep \|\| 0, x\.para \|\| 0, x\.skip \|\| 0, x\.silence \|\| 0/);assert.match(f,/VOLATILE = \/\^_bf\(AbilityCineSuppressed\|AbUsed/);
  const e=fs.readFileSync(path.join(__dirname,'..','..','..','base44/functions/gameHtml/entry.ts'),'utf8');
  assert.match(e,/artArr\[i\] = equipArt\(it\) \|\| \(typeof NUM_ART !== 'undefined' && NUM_ART && NUM_ART\[String\(it\.num\)\]\) \|\| oldArt\[it\.id\] \|\| ''/,'art is re-aligned with the rebuilt table (hand card of El Ladrón showed Reanimación Arcana)');
  assert.match(e,/window\.__bfEquipVer = \(window\.__bfEquipVer \|\| 0\) \+ 1;/);assert.match(e,/\+ '\/' \+ \(window\.__bfEquipVer \|\| 0\);/,'the hand art cache is invalidated after the rebuild');
});
