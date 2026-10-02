// Equipo (armas, armaduras, hechizos, objetos) en la base de datos: nada de código por carta.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f),root=path.join(__dirname,'..','..','..'),read=f=>fs.readFileSync(lib(f),'utf8'),load=f=>import(pathToFileURL(f.startsWith('/')?f:lib(f)).href);
const srv=()=>fs.readFileSync(path.join(root,'base44/functions/gameHtml/entry.ts'),'utf8');

test('seed: 52 equipment cards, one record each, every one valid for the catalog the editor uses',async()=>{
  const {EQUIPMENT_SEED}=await load('equipmentSeed.js'),{validateEffect,SPELL_KINDS,OBJECT_KINDS}=await load('equipmentEffects.js');
  assert.equal(EQUIPMENT_SEED.length,52);const ids=new Set(EQUIPMENT_SEED.map(x=>x.card_id));assert.equal(ids.size,52,'no duplicates');
  const per={};for(const x of EQUIPMENT_SEED){per[x.category]=(per[x.category]||0)+1;const v=validateEffect(x.category,x.effect);assert.ok(v.ok,x.card_id+': '+v.errors.join(' '));assert.equal(x.effect.v,1);}
  assert.deepEqual(per,{melee_weapon:6,ranged_weapon:8,armor:10,spell:16,object:12});
  for(const id of ['sp_transform','sp_recover','sp_steal','ob_rearm','ob_drain','ob_ring'])assert.ok(ids.has(id),'dedicated card '+id+' is data too');
  const byId=Object.fromEntries(EQUIPMENT_SEED.map(x=>[x.card_id,x.effect]));
  assert.deepEqual(byId.ar_exo,{v:1,redM:3,redA:3,redH:3,regen:2,element:null});assert.deepEqual(byId.sp_ice1,{v:1,kind:'dmg1slow',base:11,element:'hielo'});assert.deepEqual(byId.ob_revive,{v:1,kind:'revive',val:50});assert.equal(byId.rw_smg.hits,2);assert.equal(byId.ob_drain.drain,15);
  const eng=path.join(root,'2b855b7c8_bizarre_fantasies_v5-4.html');
  if(fs.existsSync(eng)){const h=fs.readFileSync(eng,'utf8');for(const x of EQUIPMENT_SEED.filter(x=>!['sp_transform','sp_recover','sp_steal','ob_rearm','ob_drain','ob_ring'].includes(x.card_id)))assert.ok(h.includes('"id": "'+x.card_id+'"'),x.card_id+' exists in the engine tables it replaces');}
});
test('validator: rejects what the game could not run; the editor catalog lists the engine mechanics',async()=>{
  const {validateEffect,defaultEffect,SPELL_KINDS,OBJECT_KINDS}=await load('equipmentEffects.js');
  assert.equal(validateEffect('spell',{kind:'inventado',base:5}).ok,false);assert.equal(validateEffect('spell',{kind:'dmg1',base:-1}).ok,false);assert.equal(validateEffect('spell',null).ok,false);
  assert.equal(validateEffect('armor',{redM:2,redA:2,redH:0,regen:0,element:'veneno'}).ok,false);assert.equal(validateEffect('armor',{redM:2,redA:2,redH:0}).ok,false,'regen is required');
  assert.equal(validateEffect('object',{kind:'heal'}).ok,false,'val is required');assert.equal(validateEffect('ranged_weapon',{hits:9}).ok,false);assert.equal(validateEffect('melee_weapon',null).ok,true,'melee weapons need nothing beyond the card fields');assert.equal(validateEffect('bonus',null).ok,true);
  for(const cat of ['ranged_weapon','armor','spell','object'])assert.ok(validateEffect(cat,defaultEffect(cat)).ok,'default for '+cat+' is valid');
  assert.equal(Object.keys(SPELL_KINDS).length,15);assert.equal(Object.keys(OBJECT_KINDS).length,12);
});
test('buildEquipItem: the engine object comes ONLY from the card; export apostrophes are removed; invalid cards are skipped; it survives being injected as text',async()=>{
  const m=await load(path.join(root,'base44/shared/equipItems.ts')),b=m.buildEquipItem;
  assert.deepEqual(b({card_id:'mw_dagger',cat:'melee_weapon',name:'Daga Veloz',cost:7,cc:5,tag:"'+veloc",txt:"'+5 CC y +3 velocidad.",num:62}),{id:'mw_dagger',name:'Daga Veloz',cost:7,tag:'+veloc',txt:'+5 CC y +3 velocidad.',num:62,cc:5},'"\'+veloc" would have broken the dagger speed bonus');
  assert.equal(b({card_id:'rw_smg',cat:'ranged_weapon',name:'Metralleta',cost:9,power:7,tag:'2disparos',effect:{v:1}}).hits,2,'hits derived from the tag when the effect has none');
  assert.deepEqual(b({card_id:'ar_exo',cat:'armor',name:'Exo',cost:13,hp:14,effect:{v:1,redM:3,redA:3,redH:3,regen:2,element:null}}),{id:'ar_exo',name:'Exo',cost:13,tag:'',txt:'',num:0,hp:14,redM:3,redA:3,redH:3,regen:2,element:null});
  const sp=b({card_id:'sp_x',cat:'spell',name:'Nuevo',cost:9,mana:8,tag:'fuego',txt:'Quema.',foil:true,num:130,effect:{v:1,kind:'dmg1',base:13,element:'fuego'}});assert.deepEqual([sp.kind,sp.base,sp.mana,sp.element,sp.foil,sp.desc,sp.num],['dmg1',13,8,'fuego',true,'Quema.',130]);
  assert.equal(b({card_id:'sp_y',cat:'spell',name:'Sin kind',effect:{v:1,base:3}}),null,'a spell with no kind cannot be executed: skipped, not half-built');assert.equal(b({card_id:'ob_y',cat:'object',name:'Sin kind'}),null);assert.equal(b({cat:'spell',name:'sin id'}),null);assert.equal(b({card_id:'z',cat:'hero',name:'x'}),null);
  const ob=b({card_id:'ob_drain',cat:'object',name:'Drenaje',cost:15,effect:{v:1,kind:'bf_drain',val:0,drain:15}});assert.equal(ob.drain,15,'extra parameters pass through to the engine object');
  const injected=vm.runInNewContext('('+m.buildEquipItem.toString()+')');assert.equal(JSON.stringify(injected({card_id:'a',cat:'melee_weapon',name:'A',cost:1,cc:2,tag:"'-x"})),JSON.stringify(b({card_id:'a',cat:'melee_weapon',name:'A',cost:1,cc:2,tag:"'-x"})),'the function injected as text in the HTML behaves like the module');
});
test('SERVER: the game tables are rebuilt from the database (same array objects, sorted by number); no effects yet = old tables kept; a category the DB lacks is kept',async()=>{
  const t=srv();const a=t.indexOf('function rebuildEquipmentFromDb()'),b=t.indexOf('window.__bfEquipFromDb = true;\n  }',a);assert(a>0&&b>a);
  const m=await load(path.join(root,'base44/shared/equipItems.ts'));
  const code=m.buildEquipItem.toString()+'\n'+t.slice(a,b+'window.__bfEquipFromDb = true;\n  }'.length)+';this.__run=function(){rebuildEquipmentFromDb();};';
  const mk=()=>({MELEE:[{id:'old_m',name:'viejo'}],RANGED:[{id:'old_r'}],ARMORS:[{id:'old_a'}],SPELLS:[{id:'old_s'},{id:'x'}],OBJECTS:[{id:'old_o'}],window:{}});
  const E=mk();
  E.DB_EQUIP=[
    {num:47,cat:'spell',card_id:'sp_b',name:'B',cost:5,mana:3,tag:'fuego',txt:'t',effect:{v:1,kind:'dmg1',base:2,element:'fuego'}},
    {num:46,cat:'spell',card_id:'sp_a',name:'A',cost:5,mana:3,tag:'fuego',txt:'t',effect:{v:1,kind:'dmgAll',base:2,element:'fuego'}},
    {num:99,cat:'spell',card_id:'sp_bad',name:'Sin kind',effect:{v:1}},
    {num:83,cat:'object',card_id:'ob_a',name:'Poción',cost:6,tag:'curación',txt:'c',effect:{v:1,kind:'heal',val:18}},
    {num:59,cat:'melee_weapon',card_id:'mw_a',name:'Espada',cost:7,cc:6,tag:'',txt:'+6 CC.',effect:{v:1}},
    {num:73,cat:'armor',card_id:'ar_a',name:'Cuero',cost:7,hp:8,tag:'',txt:'',effect:{v:1,redM:2,redA:2,redH:0,regen:0,element:null}}];
  const posts=[];E.window.parent={postMessage:m=>posts.push(m)};
  vm.runInNewContext(code,E);E.__run();
  assert.deepEqual(E.SPELLS.map(x=>x.id),['old_s','x'],'one spell cannot be built (no kind): the engine table is KEPT, nothing disappears silently');
  assert.equal(posts.filter(p=>p.bfRelayError&&p.bfRelayError.error_type==='equip_incomplete'&&/sp_bad/.test(p.bfRelayError.error_message)).length,1,'and diagnostics say which card is incomplete');
  // con todas las cartas completas, la categoría se reconstruye (mismo array, ordenado por número)
  const E2=mk();const keep2=E2.SPELLS;E2.window.parent={postMessage(){}};E2.DB_EQUIP=E.DB_EQUIP.filter(d=>d.card_id!=='sp_bad');vm.runInNewContext(code,E2);E2.__run();
  assert.deepEqual(E2.SPELLS.map(x=>x.id),['sp_a','sp_b'],'old engine spells gone; sorted by card number');assert.equal(E2.SPELLS,keep2,'same array object (references elsewhere stay valid)');
  assert.deepEqual(E.OBJECTS.map(x=>x.id),['ob_a']);assert.deepEqual(E.MELEE.map(x=>x.id),['mw_a']);assert.deepEqual(E.ARMORS.map(x=>x.id),['ar_a']);
  assert.deepEqual(E.RANGED.map(x=>x.id),['old_r'],'the DB has no ranged weapons: the engine keeps its own, the game is never left without equipment');assert.equal(E.window.__bfEquipFromDb,true);
  // y la decisión de usar la BD solo si alguna carta trae parámetros
  assert.match(t,/if \(DB_EQUIP\.some\(function\(d\)\{ return d && d\.effect; \}\)\) \{ rebuildEquipmentFromDb\(\); return; \}/);assert.match(t,/effect: c\.effect \|\| null \}\)\);/);assert.match(t,/tag: c\.tag \|\| '', foil: c\.foil === true/);
  assert.match(t,/import \{ buildEquipItem \} from '\.\.\/\.\.\/shared\/equipItems\.ts';/);assert.match(t,/\$\{buildEquipItem\.toString\(\)\}/);assert.doesNotMatch(t.slice(a-1500,a),/`/,'no backtick inside the server template');
});
test('EDITOR: equipment cards edit and validate their engine parameters; importer updates only Card.effect by card_id',()=>{
  const a=read('../pages/AdminCards.jsx'),i=read('../components/admin/EquipmentSeedImportButton.jsx'),e=read('../components/admin/EffectEditor.jsx');
  assert.match(a,/EQUIPMENT_EFFECT_CATEGORIES\.includes\(form\.category\) \? <EffectEditor category=\{form\.category\} value=\{form\.effect\} onChange=\{\(v\) => onChange\('effect', v\)\}/);
  assert.match(a,/\['armor', 'spell', 'object'\]\.includes\(form\.category\)[\s\S]{0,120}validateEffect\(form\.category, form\.effect\)/);assert.match(a,/No se guardó: completa los parámetros del motor/);assert.match(a,/if \(payload\.effect == null\) delete payload\.effect;/);assert.match(a,/<EquipmentSeedImportButton \/>/);
  assert.match(i,/Card\.filter\(\{ card_id: item\.card_id \}/);assert.match(i,/Card\.update\(found\[0\]\.id, \{ effect: item\.effect \}\)/);assert.doesNotMatch(i,/\.delete\(|\.create\(/,'only updates effect, never creates or deletes cards');
  for(const k of ['redM','redA','redH','regen','hits','kind','val','base'])assert.ok(e.includes(k),'editor exposes '+k);
  const schema=fs.readFileSync(path.join(root,'base44/entities/Card.jsonc'),'utf8');assert.match(schema,/"effect": \{\s*"type": "object"/);
});
