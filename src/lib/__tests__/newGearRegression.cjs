// Cartas nuevas de equipo (Bastón Extensible, Varita de Juguete Bizarra, Armadura de Pinchos, Frasco de Veneno, Nube
// Tóxica) y sus mecánicas parametrizables.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f),root=path.join(__dirname,'..','..','..'),read=f=>fs.readFileSync(lib(f),'utf8'),load=f=>import(pathToFileURL(f.startsWith('/')?f:lib(f)).href);

test('the 5 new cards: valid engine parameters, steps valid for the shared validator, numbers 130-134',async()=>{
  const {NEW_CARDS_SEED}=await load('newCardsSeed.js'),{validateEffect}=await load('equipmentEffects.js'),shared=await load(path.join(root,'base44/shared/abilityCatalog.ts')),{buildEquipItem}=await load(path.join(root,'base44/shared/equipItems.ts'));
  assert.deepEqual(NEW_CARDS_SEED.map(x=>x.card.card_id),['mw_staff','rw_wand','ar_spikes','ob_poison','sp_toxic']);
  assert.deepEqual(NEW_CARDS_SEED.map(x=>x.card.number),[130,131,132,133,134]);
  for(const {card,effect} of NEW_CARDS_SEED){
    assert.ok(card.name&&card.category&&card.description,card.card_id);
    assert.equal(validateEffect(card.category,effect).ok,true,card.card_id+' '+JSON.stringify(validateEffect(card.category,effect)));
    if(effect.steps)assert.equal(shared.checkSteps(effect.steps),'',card.card_id);
    const it=buildEquipItem({card_id:card.card_id,cat:card.category,name:card.name,cost:card.cost,cc:card.cc,power:card.power,hp:card.hp,mana:card.mana,tag:card.tag,txt:card.description,num:card.number,effect});
    assert.ok(it,card.card_id+' builds an engine item');
  }
  const by=Object.fromEntries(NEW_CARDS_SEED.map(x=>[x.card.card_id,x.effect]));
  assert.deepEqual([by.mw_staff.he_mult,by.mw_staff.spell_boost_pct,by.mw_staff.reach_pct],[1.2,10,50]);
  assert.deepEqual([by.rw_wand.shot_he,by.rw_wand.spell_boost_pct,by.rw_wand.weakness_bonus_pct,by.rw_wand.toy_crit],[1,15,30,6]);
  assert.deepEqual([by.ar_spikes.thorns,by.ar_spikes.vel],[4,-2]);
  assert.ok(shared.VALID_ACTIONS.includes('poison'));
});
test('engine: spell boost, elemental weakness (inverse of ELEM_COUNTER), toy crit, HE-scaled shot and melee, reach, thorns, armor speed, poison tick',()=>{
  const p=read('newGearPatch.js');
  assert.match(p,/var WEAK=\{agua:'rayo',rayo:'hielo',hielo:'fuego',fuego:'agua'\};/);
  for(const k of ['spell_boost_pct','weakness_bonus_pct','toy_crit','shot_he','he_mult','reach_pct','thorns'])assert.ok(p.includes(k),k);
  assert.match(p,/orig\.call\(this,a,th,\{type:'true',bfGear:true\}\)/,'thorns hurt the melee attacker');
  assert.match(p,/window\.dealDamage\(other,d2,\{type:'melee',bfReach:true\}\)/,'reach: second rival, no chain');
  assert.match(p,/v=Math\.max\(1,v\+Number\(h\.armor\.vel\)\)/);
  assert.match(p,/window\.dealDamage\(h,p\.dmg,\{type:'true',bfGear:true,bfPoison:true\}\)/,'poison ignores armor and shields');
  assert.match(read('abilityImplPatch.js'),/case 'poison': \{/);assert.match(read('gameInject.js'),/BLUFF_FX_PATCH \+ NEW_GEAR_PATCH/);
});
test('editor and admin: new parameters editable; "Crear cartas nuevas" creates missing cards and saves their parameters',()=>{
  const e=read('../components/admin/EffectEditor.jsx'),a=read('../pages/AdminCards.jsx'),b=read('../components/admin/NewCardsImportButton.jsx');
  for(const k of ['spell_boost_pct','weakness_bonus_pct','toy_crit','he_mult','reach_pct','shot_he','thorns'])assert.match(e,new RegExp('name="'+k+'"'));
  assert.match(a,/const EFFECT_EDITOR_CATEGORIES = \[\.\.\.EQUIPMENT_EFFECT_CATEGORIES, 'melee_weapon'\];/);assert.match(a,/<NewCardsImportButton \/>/);
  assert.match(b,/if \(!card\) \{ card = await base44\.entities\.Card\.create\(item\.card\); created\+\+; \}/);assert.match(b,/saveEquipEffect\(\{ \.\.\.item\.card, \.\.\.card \}, item\.effect, base44\)/);assert.doesNotMatch(b,/Card\.update|\.delete\(/,'existing cards are never rewritten');
});
