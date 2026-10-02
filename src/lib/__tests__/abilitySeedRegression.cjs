// Fichas de habilidad en la base de datos (AbilityImpl): formato válido para el ejecutor y para el editor.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f),load=f=>import(pathToFileURL(lib(f)).href),read=f=>fs.readFileSync(lib(f),'utf8');

test('every seed record is valid for the real validator and complete for the DB schema',async()=>{
  const {ABILITY_SEED}=await load('abilitySeed.js'),{validateAbilitySpec,VALID_ACTIONS,VALID_TARGETS}=await load('abilityImplementationCatalog.js');
  assert(ABILITY_SEED.length>=3);const seen=new Set();
  for(const r of ABILITY_SEED){
    const k=r.card_id+'|'+(r.elite?'e':'n');assert(!seen.has(k),'duplicate '+k);seen.add(k);
    for(const f of ['card_id','ability_name','ability_text','status','effect_type','params','note'])assert.ok(r[f]!==undefined&&r[f]!=='',k+' misses '+f);
    assert.equal(typeof r.elite,'boolean');assert.equal(r.status,'implemented');
    if(String(r.effect_type).startsWith('dedicated_'))continue;   // sin pasos: su comportamiento está en el motor (lo cubre abilityMigrationRegression)
    const v=validateAbilitySpec({effect_type:r.effect_type,params:r.params});assert.equal(v.ok,true,k+' is rejected by the validator: '+JSON.stringify(v));
    for(const st of r.params.steps){assert.ok(VALID_ACTIONS.includes(st.action),k+' action '+st.action);assert.ok(VALID_TARGETS.includes(st.target||'enemy'),k+' target');}
  }
  for(const k of ['tk_lav|e','tk_caj|e','Faseve|n'])assert.ok(seen.has(k),'seed covers '+k+' (it showed "PIFIA, no produce ningún efecto" or never ended the turn)');
});
test('the admin importer creates or updates by card_id + elite and never touches other records',()=>{
  const b=read('../components/admin/AbilitySeedImportButton.jsx'),a=read('../pages/AdminCards.jsx');
  assert.match(b,/AbilityImpl\.filter\(\{ card_id: spec\.card_id, elite: !!spec\.elite \}/);assert.match(b,/AbilityImpl\.update\(existing\[0\]\.id, spec\)/);assert.match(b,/AbilityImpl\.create\(spec\)/);assert.doesNotMatch(b,/\.delete\(/);
  assert.match(a,/import AbilitySeedImportButton from/);assert.match(a,/<AbilitySeedImportButton \/>/);
});
