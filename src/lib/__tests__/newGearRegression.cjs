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
test('SHOP never left without parameters: the server asks only for equipment sheets (with a plan B and a recorded error), and the game completes missing ones from the sheets the page sends',async()=>{
  const e=fs.readFileSync(path.join(root,'base44/functions/gameHtml/entry.ts'),'utf8');
  assert.match(e,/AbilityImpl\.filter\(\{ effect_type: 'equipment' \}, '-updated_date', 1000\)/);
  assert.doesNotMatch(e,/AbilityImpl\.list\('-updated_date', 2000\)/,'no more 2000-row request that failed silently');
  assert.match(e,/window\.__bfEquipParamsInfo = \$\{bfSafeJson\(/);
  assert.match(e,/DB_EQUIP\.forEach\(function\(d\)\{ if \(d && !d\.effect && eq\[d\.card_id\]\) \{ d\.effect = eq\[d\.card_id\]; added\+\+; \} \}\);/);
  assert.match(e,/rebuildEquipmentFromDb\(\);\s*window\.__bfEquipFromPage/,'rebuilt with the page sheets');
  const {checkServerGame}=await load('equipShopCheck.js');
  const r=checkServerGame('x'.repeat(1200)+'window.__bfEquipParamsInfo = {"count":0,"error":"boom"};','', 'v', []);
  assert.deepEqual(r.params,{count:0,error:'boom'});
  assert.match(read('gameDataSync.js'),/AbilityImpl\.list\('-created_date', 1000\)/);
});
test('the server code injected in the game can never be broken by card texts, and an equipment rebuild error never leaves the old tables for good',()=>{
  const e=fs.readFileSync(path.join(root,'base44/functions/gameHtml/entry.ts'),'utf8');
  assert.equal((e.match(/\$\{JSON\.stringify\(/g)||[]).length,0,'every injected value goes through bfSafeJson');
  assert.ok((e.match(/\$\{bfSafeJson\(/g)||[]).length>=20);
  // bfSafeJson: un "</script>" o un U+2028 dentro de un texto ya no rompen el bloque, y los datos vuelven iguales
  const i=e.indexOf('function bfSafeJson(v) {'),j=e.indexOf('}\n',i)+2;
  const bfSafeJson=new Function(e.slice(i,j)+'; return bfSafeJson;')();
  const data={a:'texto con </script> dentro',b:'salto\u2028raro'};
  const code='var X = '+bfSafeJson(data)+';';
  assert.ok(!code.includes('</script>'));assert.ok(!code.includes('\u2028'));
  assert.deepEqual(new Function(code+' return X;')(),data);
  // reconstrucción: cada carta por separado, reintentos y error anotado
  assert.match(e,/try \{ return buildEquipItem\(c\); \}/);
  assert.match(e,/try \{ rebuildEquipmentFromDb\(\); window\.__bfEquipSynced = true; \}/);
  assert.match(e,/if \(window\.__bfEquipTries >= 3\) window\.__bfEquipSynced = true;/);
  assert.match(e,/\.split\('\\\\n'\)\.slice\(0, 3\)/,'the line break inside the template is escaped (a raw one broke the whole block)');
});
test('diagnostic mode (?diag=1): panel with the equipment state inside the game and any code error at load',()=>{
  const d=read('diagPatch.js');
  assert.match(d,/window\.addEventListener\('error',function\(ev\)\{/);assert.match(d,/error_type:'script_error'/);
  assert.match(d,/Tienda construida desde la base de datos/);assert.match(read('gameInject.js'),/INVITE_PATCH \+ DIAG_PATCH/);
  assert.match(read('../pages/Home.jsx'),/get\('diag'\)\) setTimeout\(\(\) => iframeRef\.current\?\.contentWindow\?\.postMessage\(\{ bfDiag: true \}, '\*'\), 2500\)/);
});
test('the equipment builder is injected under a FIXED name (the platform renames it when publishing: "buildEquipItem is not defined")',()=>{
  const e=fs.readFileSync(path.join(root,'base44/functions/gameHtml/entry.ts'),'utf8');
  assert.match(e,/var buildEquipItem = \(\$\{buildEquipItem\.toString\(\)\}\);/);
  assert.doesNotMatch(e,/\n  \$\{buildEquipItem\.toString\(\)\}\n/,'no longer pasted relying on its internal name');
  // simulación: la función copiada con OTRO nombre sigue disponible como buildEquipItem
  const src='function buildEquipItem2(c){ return {id:c.card_id}; }';
  const run=new Function('var buildEquipItem = ('+src+'); return buildEquipItem({card_id:"x"}).id;');
  assert.equal(run(),'x');
  assert.match(read('diagPatch.js'),/\/\[\?&\]diag=\/\.test\(window\.parent\.location\.search\)/);
});
test('STAFF: the staff stretches from the hero to each rival it hits (with the card "sprite" image if set); any weapon can carry its own cut-out image',()=>{
  const a=read('attackFxPatch.js');
  assert.match(a,/function spriteFor\(wid\)\{ if\(WPN_SPRITE\[wid\]\)return WPN_SPRITE\[wid\]; var it=itemFor\(wid\); return \(it&&it\.sprite\)\?String\(it\.sprite\):null; \}/);
  assert.match(a,/if\(a&&isStaff\(wid\)\)\{ staffFx\(a,b,wid,0\); return; \}/);assert.match(a,/requestAnimationFrame\(function\(\)\{ img\.style\.width=dist\+'px'; \}\);/,'it stretches to the target');
  assert.doesNotMatch(a,/var url=WPN_SPRITE\[wid\]/,'every weapon image goes through spriteFor');
  const g=read('newGearPatch.js');assert.match(g,/pushFx\(\{k:'bfstaff',fromSide:side,fromId:a\.id,toSide:ts,toId:other\.id\}\)/);assert.match(g,/window\.__bfStaffFx\(ev\.fromSide,ev\.fromId,ev\.toSide,ev\.toId,420\)/);
  assert.match(read('../components/admin/EffectEditor.jsx'),/set\('sprite', ev\.target\.value\.trim\(\) \|\| undefined\)/);
});
test('the log says WHICH ability is used; every stall leaves a full snapshot in the network diagnostics',()=>{
  assert.match(read('abilityImplPatch.js'),/pushLog\('lg', '\\\\u2728 ' \+ hero\.name \+ ' usa ' \+ \(spec\.ability_name \|\| hero\.ability \|\| 'su habilidad'\) \+ '\.'\);/);
  const s=read('stallGuardPatch.js');assert.match(s,/error_type: 'turn_stall'/);assert.match(s,/esperando: ' \+ \(waits\.join\(','\) \|\| 'nada'\)/);
});
test('diagnostic panel shows, live, whose turn it is and what the game is waiting for before passing the turn',()=>{
  const d=read('diagPatch.js');
  assert.match(d,/'TURNO: '\+turn/);assert.match(d,/waits\.push\('CINEM/);assert.match(d,/waits\.push\('CARTELES'\)/);assert.match(d,/waits\.push\('GOLPE MORTAL'\)/);
  assert.match(d,/efectos en pantalla: '\+fxN/);
});
test('ANIMATIONS can never block a turn: old leftovers ignored, failed mount released, 12 s absolute cap (with a diagnostic)',()=>{
  const a=read('abilityAnimPatch.js');
  assert.match(a,/if\(now-n\.__bfSeen<2500\)\{ recentFx=true; break; \}/,'only RECENT effects block the queue (an old leftover blocked it forever)');
  assert.match(a,/catch\(e\)\{ playingUrl=null;/,'a cinematic that fails to mount is released');
  assert.match(a,/if\(Date\.now\(\)-busySince>12000\)\{/);assert.match(a,/error_type:'cine_stuck'/);
});
test('STEADY RENDER: the hand is kept when nothing it shows changed, rebuilt otherwise; only the outermost render layer acts',()=>{
  const s=read('steadyRenderPatch.js');
  assert.match(s,/if\(depth>0\)return orig\.apply\(this,arguments\);/,'nested wrappers no longer bring back an old hand');
  assert.match(s,/paintedSig\[side\]!==null&&paintedSig\[side\]===now\)cur\.parentNode\.replaceChild\(old\.node,cur\);/);
  assert.match(s,/if\(first\)\['p','o'\]\.forEach/,'the hand is decided only in the first pass');
  for(const k of ['G.spellbook','G.items','cur.side','h.mana','B.pending','itemDescarte','spellDescarte'])assert.ok(s.includes(k),'hand fingerprint includes '+k);
  assert.match(read('gameInject.js'),/DIAG_PATCH \+ STEADY_RENDER_PATCH/);
});
test('shared result image and invite link use the PUBLIC address',()=>{
  const p=read('invitePatch.js');assert.match(p,/var PUBLIC_URL='https:\/\/bizarrefantasies\.cronicasvetustas\.com';/);assert.match(p,/function origin\(\)\{ return PUBLIC_URL; \}/);
});
test('EQUIP HAND: bought cards no longer flash (kept cards reused, the new one gets its art at once), hand stretches to the last shop row, lighter humorous mat',()=>{
  const p=read('equipHandPatch.js');
  assert.match(p,/if\(nx&&ox\)ox\.setAttribute\('onclick',nx\.getAttribute\('onclick'\)\|\|''\);/,'the kept card gets its new hand index for the return button');
  assert.match(p,/if\(typeof window\.__bfInjectHandArt==='function'\)window\.__bfInjectHandArt\(\);/);
  assert.match(p,/@media \(min-width:761px\)\{#s-equip \.eq-grid\{align-items:stretch!important\}/);assert.match(p,/#s-equip \.eq-grid \.eq-hand-box\{flex:1 1 auto\}/);
  assert.match(p,/Hechizos en la manga/);assert.match(p,/Cachivaches del bolsillo/);assert.match(p,/if\(depth>0\)return orig\.apply\(this,arguments\);/);
  assert.match(fs.readFileSync(path.join(root,'base44/functions/gameHtml/entry.ts'),'utf8'),/window\.__bfInjectHandArt = function\(\)\{ try \{ injectHandArt\(\); \} catch \(e\) \{\} \};/);
  assert.match(read('gameInject.js'),/STEADY_RENDER_PATCH \+ EQUIP_HAND_PATCH/);
});
test('POISON caption, readable like the fumble or skipped-turn ones: "¡ENVENENADO!" when poisoned and "VENENO -X" on each tick; the turn waits for it; the online rival sees it',()=>{
  const g=read('newGearPatch.js');
  assert.match(g,/window\.__bfQueueIndicator\(function\(\)\{ return poisonPaint\(ev\.side,ev\.id,title,sub\); \},ev\.tick\?3600:4800\)/,'goes through the readable captions queue');
  assert.match(g,/ENVENENADO!/);assert.match(g,/VENENO -/);
  assert.match(g,/if\(ev&&ev\.k==='bfpoison'&&\(client\|\|!ev\.bfShownLocal\)\)poisonPop\(ev\);/,'synced to the guest, not repeated on the host');
  assert.match(g,/window\.__bfPoisonPop\(\{side:slot\.side,id:h\.id,tick:1,dmg:got\|\|0,turns:p\.turns\}\)/);
  assert.match(read('abilityImplPatch.js'),/window\.__bfPoisonPop\(\{ side: tSide\(t\), id: t\.id, dmg: t\._bfPoison\.dmg, turns: t\._bfPoison\.turns \}\)/);
});
test('RESULT SCREEN: heals itself when shown empty, one centred row "Volver a jugar" + "Compartir resultado", no second "Salir"; END ANIMATION heroes never collapse to zero width',()=>{
  const r=read('resultScreenPatch.js');
  assert.match(r,/if\(s\.querySelector\('\.gtitle'\)\|\|typeof G==='undefined'\|\|!G\|\|!G\._result\)return;/,'only an EMPTY result screen is rebuilt');
  assert.match(r,/onclick="'\+\(on\?'bfMatchRematch\(\)':'bfRematch\(\)'\)\+'"/,'online asks for the rematch, vs AI starts a new match (auction)');
  assert.match(r,/var ex=document\.getElementById\('bf-exit-btn'\);if\(ex&&ex\.parentNode\)ex\.parentNode\.removeChild\(ex\);/);
  assert.match(r,/if\(share&&share\.parentNode!==row\)row\.appendChild\(share\);/);assert.match(r,/isMissions/);
  assert.doesNotMatch(read('rematchPatch.js'),/\n    ensureExit\(root\);\n/,'the rematch patch no longer adds a second "Salir"');
  assert.match(read('gameInject.js'),/EQUIP_HAND_PATCH \+ RESULT_SCREEN_PATCH/);
  const e=fs.readFileSync(path.join(root,'base44/functions/gameHtml/entry.ts'),'utf8');
  assert.match(e,/\.bf-cine-side\{display:flex;flex-direction:column;align-items:stretch;/);assert.match(e,/\.bf-cine-side>\.bf-cine-team\{width:100%\}/);
});
