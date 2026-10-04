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
  assert.match(a,/const EFFECT_EDITOR_CATEGORIES = \[\.\.\.EQUIPMENT_EFFECT_CATEGORIES, 'melee_weapon'\];/);assert.match(read('../components/admin/MaintenancePanel.jsx'),/<GameDataSyncButton \/>/);assert.match(read('gameDataSync.js'),/card = await base44\.entities\.Card\.create\(item\.card\)/,'new cards are created by the single sync button');
  assert.match(b,/if \(!card\) \{ card = await base44\.entities\.Card\.create\(item\.card\); created\+\+; \}/);assert.match(b,/saveEquipEffect\(\{ \.\.\.item\.card, \.\.\.card \}, item\.effect, base44\)/);assert.doesNotMatch(b,/\.delete\(/,'never deletes');assert.equal((b.match(/Card\.update\(/g)||[]).length,1,'the only update is the listed-fields adjustment');assert.doesNotMatch(b,/Card\.update\(card\.id|Card\.update\([^)]*item\.card\)/,'existing cards are never rewritten whole');
});
test('one copy of Drenaje (like El Anillo), as card data; El Ladrón Enmascarado costs 20 mana',async()=>{
  const e=fs.readFileSync(path.join(root,'base44/functions/gameHtml/entry.ts'),'utf8');
  assert.match(e,/var bfMaxCopies = Number\(item\.max_copies\) > 0 \? Number\(item\.max_copies\) : \(\(id === 'ob_ring' \|\| id === 'ob_drain'\) \? 1 : 3\);/);
  const {EQUIPMENT_SEED}=await load('equipmentSeed.js');const by=Object.fromEntries(EQUIPMENT_SEED.map(r=>[r.card_id,r.effect]));
  assert.equal(by.ob_drain.max_copies,1);assert.equal(by.ob_ring.max_copies,1);
  const {CARD_UPDATES}=await load('newCardsSeed.js');assert.deepEqual(CARD_UPDATES.map(u=>[u.card_id,u.set]),[['sp_steal',{mana:20}]]);
  assert.match(read('../components/admin/NewCardsImportButton.jsx'),/await base44\.entities\.Card\.update\(found\[0\]\.id, u\.set\)/,'only the listed fields');
  assert.match(read('stealSpellPatch.js'),/kind:'bf_steal', base:1, mana:20,/);assert.match(read('../components/admin/EffectEditor.jsx'),/name="max_copies"/);
});
test('recovered weapons: spending the hero action, they go to the ALLY you choose (old gear to the discard pile)',()=>{
  const r=read('recoveredEquipPatch.js');
  assert.match(r,/var cands = alive\(side\);/,'any living ally, not only those with the slot free');
  assert.match(r,/pendTarget\('\\\\u00bfA qui\\\\u00e9n le pones '/);assert.match(r,/if\(equipOn\(side, t, item, slot\) && typeof finishAct==='function'\) finishAct\(\);/);
  assert.match(r,/G\.itemDescarte\[side\]\.push\(\{ id:old\.id, kind:slot, name:old\.name/);
  assert.match(read('battleRulesPatch.js'),/if\(item&&item\._bfRecoveredEq&&!window\.__bfRecoveredEquip\)\{/,'the old shortcut no longer forces the active hero');
});
test('reviving by any way keeps the mana the hero had when it fell (elite rebirth too)',()=>{
  const r=read('rebirthAbilityPatch.js');
  assert.match(r,/if\(t\.alive\)t\.mana=Math\.min\(Number\(t\.maxMana\)\|\|m,m\); else t\._bfManaAtDeath=m;/);
  assert.match(r,/var w2=function\(t\)\{[\s\S]{0,120}t\.mana=Math\.min\(Number\(t\.maxMana\)\|\|0,t\._bfManaAtDeath\)/);
  assert.match(r,/if\(h&&h\.alive&&h\._bfManaAtDeath!=null\)\{ h\.mana=Math\.min/,'any other revive path is fixed on the next render');
});
test('SHOP: a card with incomplete parameters no longer drops its whole category (new cards always reach the shop)',()=>{
  const e=fs.readFileSync(path.join(root,'base44/functions/gameHtml/entry.ts'),'utf8');
  assert.match(e,/cards\.forEach\(function\(c, i\)\{ if \(!items\[i\] && legacy\[c\.card_id\]\) items\[i\] = legacy\[c\.card_id\]; \}\);/,'the broken card falls back to its engine version');
  assert.match(e,/items = items\.filter\(Boolean\);\s*if \(!items\.length\) return;/);
  assert.doesNotMatch(e,/se conserva la tabla del motor de\s*\n?\s*\/\/ esa categoría en vez de hacer desaparecer cartas/,'old whole-category fallback removed');
  assert.match(e,/var it0 = buildEquipItem\(db\); if \(it0\) arr0\.push\(it0\);/,'without DB parameters, new DB cards are still added');
  assert.match(read('gameHtmlLoader.js'),/stampTimeoutMs = 3000,/);
});
test('backoffice check: tells which equipment cards will reach the shop and why the others will not',async()=>{
  const {checkEquipShop}=await load('equipShopCheck.js'),{NEW_CARDS_SEED}=await load('newCardsSeed.js');
  const cards=NEW_CARDS_SEED.map(x=>x.card),impls=NEW_CARDS_SEED.map(x=>({card_id:x.card.card_id,effect_type:'equipment',params:x.effect}));
  let r=checkEquipShop(cards,impls);assert.equal(r.ok.length,5);assert.equal(r.missing.length,0);
  r=checkEquipShop(cards,[]);
  assert.deepEqual(r.missing.map(m=>m.card_id).sort(),['ob_poison','sp_toxic'],'spells and objects need their engine parameters');
  assert.match(r.missing[0].why,/no tiene parámetros del motor/);
  assert.match(read('../components/admin/MaintenancePanel.jsx'),/<EquipShopCheckButton \/>/);
});
test('card numbers everywhere (shop, battle tags, purchase dialog) are the REAL card number, so a new card shows its own',()=>{
  const p=read('newGearPatch.js');
  assert.match(p,/if\(x&&x\.id===id&&Number\(x\.num\)>0\)return String\(Number\(x\.num\)\)\.padStart\(3,'0'\);/,'before: numbered by position (a new card showed "Nº 071")');
  assert.match(p,/w\.__bfRealNo=1;window\.cardNo=w;/);
});
