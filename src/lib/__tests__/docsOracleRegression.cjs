// Documentación (PDF del oráculo y página de Reglas) al día, y textos de las cartas del oráculo legibles.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f),read=f=>fs.readFileSync(lib(f),'utf8'),load=f=>import(pathToFileURL(lib(f)).href);

test('rules document (PDF): game types, 3 mission campaigns with 150 equipment coins, multiplayer missions, AI levels; no stale data; ES and EN in step',async()=>{
  const {GAME_RULES_DOC:ES}=await load('gameRulesDoc.js'),{GAME_RULES_DOC_EN:EN}=await load('gameRulesDocEn.js');
  assert.equal(ES.length,EN.length,'same number of sections in both languages');
  const es=Object.fromEntries(ES),en=Object.fromEntries(EN),all=JSON.stringify(ES),allEn=JSON.stringify(EN);
  for(const t of ['Tipos de partida','Misiones','Niveles de misión','Misiones multijugador','Niveles de la IA'])assert.ok(es[t],'ES has '+t);
  for(const t of ['Game types','Missions','Mission levels','Multiplayer missions','AI levels'])assert.ok(en[t],'EN has '+t);
  assert.match(es['Misiones'],/Club, Leyendas \(L5R\) y Todos los Héroes/);assert.match(es['Misiones'],/150 monedas de equipamiento/);
  assert.match(es['Misiones multijugador'],/Sobre:[\s\S]*100 monedas:/);assert.match(es['Niveles de misión'],/El sello épico/);
  assert.match(es['Niveles de la IA'],/Gánale 10 veces/);assert.match(es['Tipos de partida'],/30 minutos/);
  assert.match(es['Tirada de d30 · Pifia y Fallo Épico'],/20 \(≈3,3%\) → PIFIA/);
  for(const stale of ['19 o 20','≈7%','en 5 minutos','sin reanudación','Club y L5R'])assert.ok(!all.includes(stale),'ES no longer says: '+stale);
  assert.doesNotMatch(es['Misiones']+es['Niveles de misión'],/100 monedas de equipamiento/,'missions: 150, not 100 (a normal game still starts with 100 + 100)');assert.doesNotMatch(en['Missions']+en['Mission levels'],/100 equipment coins/);
  for(const stale of ['19 or 20','≈7%','within 5 minutes','no resume','Missions · Club and L5R'])assert.ok(!allEn.includes(stale),'EN no longer says: '+stale);
  // el PDF usa estos documentos
  assert.match(read('../components/cards/DownloadDocsButton.jsx'),/import \{ GAME_RULES_DOC \} from '@\/lib\/gameRulesDoc';/);
});
test('rules page: same facts as the PDF',()=>{
  const r=read('../pages/Reglas.jsx')+read('../components/rules/CurrentFeaturesRulesSection.jsx')+read('../components/rules/FumbleRulesSection.jsx');
  assert.match(r,/Misiones multijugador/);assert.match(r,/Contra la IA · 5 niveles/);assert.match(r,/150 monedas de equipamiento/);assert.match(r,/durante 30 minutos/);assert.match(r,/'20 · PIFIA \(≈3,3%\)'/);
  for(const stale of ['19 o 20','≈7%','reanudar en 5 minutos','sin reanudación'])assert.ok(!r.includes(stale),'no longer says: '+stale);
});
test('ORACLE: long ability texts shrink to fit (short ones stay big), export apostrophes are removed',async()=>{
  const {cleanCardText,abilityTextClass,equipTextClass}=await load('cardText.js');
  assert.equal(cleanCardText("'+9 CC, +6 velocidad"),'+9 CC, +6 velocidad');assert.equal(cleanCardText("'-3 a todo"),'-3 a todo');assert.equal(cleanCardText("Dice 'hola'"),"Dice 'hola'",'only a leading export apostrophe');assert.equal(cleanCardText(null),'');
  const len=n=>abilityTextClass('x'.repeat(n));
  assert.match(len(40),/sm:text-\[11px\]/,'short: big');assert.match(len(90),/sm:text-\[10px\]/);assert.match(len(130),/sm:text-\[9\.5px\]/);assert.match(len(177),/text-\[8px\] sm:text-\[9px\]/,'Monkgeta (177): compact');
  assert.match(equipTextClass('x'.repeat(125),false),/text-\[9\.5px\]/,'El Anillo (125)');assert.match(equipTextClass('x'.repeat(20),true),/text-\[14px\]/);
  const h=read('../components/cards/HeroCardFace.jsx'),e=read('../components/cards/EquipCard.jsx');
  assert.match(h,/abilityTextClass\(abilityTxt\)/);assert.match(h,/\{cleanCardText\(abilityTxt\)\}/);assert.match(e,/equipTextClass\(item\.txt \|\| item\.description, fill\)/);
});
