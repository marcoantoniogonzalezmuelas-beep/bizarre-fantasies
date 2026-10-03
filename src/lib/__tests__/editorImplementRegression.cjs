// El implementador de habilidades del editor: una sola lista de primitivas para editor y servidor; y si una habilidad
// no se puede implementar, se avisa y se genera el prompt para que la IA de desarrollo adapte el motor.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f),root=path.join(__dirname,'..','..','..'),read=f=>fs.readFileSync(lib(f),'utf8'),load=f=>import(pathToFileURL(f.startsWith('/')?f:lib(f)).href);

test('ONE vocabulary: the server function and the editor use the same actions, targets and validator (the server list had gone stale)',async()=>{
  const shared=await load(path.join(root,'base44/shared/abilityCatalog.ts')),cat=await load('abilityImplementationCatalog.js');
  assert.deepEqual(cat.VALID_ACTIONS,shared.VALID_ACTIONS);assert.deepEqual(cat.VALID_TARGETS,shared.VALID_TARGETS);
  for(const a of ['execute','destroy_equipment','swap_stats','revive','heal_equalize','shield_regen','block_hand','noop','roll','disable_ability','disable_elite'])assert.ok(shared.VALID_ACTIONS.includes(a),a);
  for(const t of ['other_enemy','dead_ally'])assert.ok(shared.VALID_TARGETS.includes(t),t);
  const srv=fs.readFileSync(path.join(root,'base44/functions/implementAbility/entry.ts'),'utf8');
  assert.match(srv,/import \{ VALID_ACTIONS, VALID_TARGETS, EFFECT_TYPES, checkSteps \} from '\.\.\/\.\.\/shared\/abilityCatalog\.ts';/);
  assert.doesNotMatch(srv,/const allowedActions = \[/,'no private (stale) list any more');
  for(const f of ['mods','outcomes','hits','magic_base','scale_stat','dtype','ignore_shield','double_below','threshold','sides'])assert.match(srv,new RegExp(f+': \\{ type'),'the AI may return '+f);
  // el validador compartido: recursivo en los dados, cantidades opcionales donde toca
  assert.equal(shared.checkSteps([{action:'roll',target:'enemy',sides:2,outcomes:{'1':[{action:'disable_ability',target:'enemy'}],'2':[{action:'execute',target:'enemy',threshold:8}]}}]),'');
  assert.match(shared.checkSteps([{action:'roll',target:'enemy',sides:2,outcomes:{'1':[{action:'inventada',target:'enemy'}]}}]),/resultado 1 del dado/);
  assert.equal(shared.checkSteps([{action:'damage',target:'all_enemies',magic_base:8}]),'');assert.match(shared.checkSteps([{action:'damage',target:'enemy'}]),/cantidad/);
  // las 113 fichas escritas a mano siguen siendo válidas con la lista única
  const {ABILITY_SEED}=await load('abilitySeed.js');for(const r of ABILITY_SEED.filter(r=>r.effect_type==='custom_steps'))assert.equal(shared.checkSteps(r.params.steps),'',r.card_id);
});
test('NOT IMPLEMENTABLE: the editor warns and writes the prompt for the AI to adapt the engine; it is saved and shown again later',async()=>{
  const {buildEngineRequestPrompt}=await load('engineRequestPrompt.js');
  const p=buildEngineRequestPrompt({card:{card_id:'nuevo',name:'Héroe Nuevo',category:'hero'},elite:true,abilityName:'Viaje en el Tiempo',abilityText:'Repite el turno anterior del rival.',reason:'No automatizable: un paso usa una acción no soportada.'});
  for(const s of ['Héroe Nuevo','card_id: nuevo','ÉLITE','Viaje en el Tiempo','Repite el turno anterior del rival.','un paso usa una acción no soportada','src/lib/abilityImplPatch.js','base44/shared/abilityCatalog.ts','GENÉRICA','src/lib/__tests__/','"card_id":"nuevo","elite":true','No cambies el comportamiento de ninguna otra habilidad'])assert.ok(p.includes(s),'prompt mentions '+s);
  const tmp=path.join(os.tmpdir(),'bf-sync3-'+process.pid+'.mjs');
  fs.writeFileSync(tmp,read('abilitySync.js').replace("'@/lib/abilityImplementationCatalog'",JSON.stringify(pathToFileURL(lib('abilityImplementationCatalog.js')).href)).replace("'@/lib/engineRequestPrompt'",JSON.stringify(pathToFileURL(lib('engineRequestPrompt.js')).href)));
  const {syncCardAbilities}=await import(pathToFileURL(tmp).href);fs.unlinkSync(tmp);
  const db=[];const deps={list:async id=>db.filter(s=>s.card_id===id),create:async x=>{db.push({id:'s'+db.length,...x});},update:async(id,x)=>Object.assign(db.find(s=>s.id===id),x),remove:async()=>{},implement:async()=>({effect_type:'unsupported',note:'Necesita repetir turnos.'})};
  const card={category:'hero',card_id:'nuevo',name:'Héroe Nuevo',ability_name:'Viaje',ability_text:'Repite el turno anterior del rival.',elite_ability_text:''};
  let r=await syncCardAbilities(card,deps);
  assert.equal(r.manual,1);assert.equal(r.requests.length,1);assert.match(r.requests[0].prompt,/Repite el turno anterior del rival/);assert.match(r.lines[0],/prompt para que la IA adapte el motor/);
  assert.equal(db[0].status,'manual');assert.match(db[0].params.engine_request,/ADAPTAR EL MOTOR/,'the prompt is saved with the record');
  r=await syncCardAbilities(card,deps);assert.equal(r.kept,1);assert.equal(r.requests.length,1,'saving again (same text) shows the pending prompt again');
  const a=read('../pages/AdminCards.jsx'),b=read('../components/admin/AbilityImplementButton.jsx'),box=read('../components/admin/EngineRequestBox.jsx');
  assert.match(a,/setEngineRequests\(res\.requests \|\| \[\]\)/);assert.match(a,/engineRequests\.map\(\(r\) => <EngineRequestBox/);
  assert.match(b,/payload\.params = \{ engine_request: buildEngineRequestPrompt\(/);assert.match(b,/<EngineRequestBox label=/);assert.match(box,/navigator\.clipboard\.writeText\(prompt\)/);
});
