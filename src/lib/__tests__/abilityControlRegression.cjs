const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '..', 'battleRulesPatch.js'), 'utf8');
const patch = vm.runInNewContext(source.replace('export const', 'const') + '\nBATTLE_RULES_PATCH').replace(/<\/?script>/g, '');
function fixture(mode, elite, normalUsed, eliteUsed) {
  const node = (classes, text, onclick = '') => {
    const tokens = new Set(classes.split(' '));
    return {textContent:text, getAttribute:()=>onclick, classList:{contains:k=>tokens.has(k),add:k=>tokens.add(k),remove:k=>tokens.delete(k)}};
  };
  const panel = node('active-hero-panel bf-abil-used', 'Fas Everest Panzer — Desactiva la habilidad del rival');
  const ability = node('jrpg-btn ability', 'Usada — Desactiva la habilidad del rival');
  const melee = node('jrpg-btn cc', 'Cuerpo a cuerpo', 'actMelee()');
  const defend = node('jrpg-btn defend', 'Defender', 'actDefend()');
  const item = node('jrpg-btn item', 'Objeto', 'actItemMenu()');
  const info = node('jrpg-info', 'i', "abilityInfo('p','Faseve')");
  const other = node('action-history', 'Habilidad de otro héroe');
  const nodes = [panel, ability, melee, defend, item, info, other];
  const battle = {classList:{contains:()=>true},querySelectorAll(selector){
    if(selector === '.bf-abil-used')return nodes.filter(n=>n.classList.contains('bf-abil-used'));
    if(selector === '.active-hero-panel .jrpg-menu .jrpg-btn.ability')return [ability];
    if(selector === '[onclick]')return [melee,defend,item,info];
    if(selector.includes('[class*="action"]'))return [panel,ability,other];
    return [];
  }};
  const hero = {id:'Faseve',name:'Fas Everest Panzer',alive:true,eliteMode:elite,abilityUsed:false,_bfNormalUsed:normalUsed,_bfEliteUsed:eliteUsed};
  const intervals = [], styles = [];
  const c = {G:{mode,team:{p:[hero],o:[]}},B:{current:{side:'p',id:hero.id}},NET:{role:mode==='host'||mode==='client'?mode:'local'},getHero:()=>hero,
    document:{getElementById:id=>id==='s-battle'?battle:null,createElement:()=>({}),head:{appendChild:s=>styles.push(s.textContent)}},
    setInterval:f=>{intervals.push(f);return intervals.length;},clearInterval(){},setTimeout(){}};
  c.window=c;vm.createContext(c);vm.runInContext(patch,c);
  return {c,hero,nodes,ability,panel,styles,scan:()=>intervals[0]()};
}
for(const mode of ['mission','ai','demo','local','host','client']) {
  for(const elite of [false,true])test(`${mode}: ${elite?'elite':'normal'} used ability does not disable Fas's other actions`,()=>{
    const f=fixture(mode,elite,!elite,elite);const before=JSON.stringify({G:f.c.G,B:f.c.B,NET:f.c.NET});
    f.scan();f.scan();assert(f.ability.classList.contains('bf-abil-used'));
    f.nodes.filter(n=>n!==f.ability).forEach(n=>assert(!n.classList.contains('bf-abil-used')));
    assert.equal(JSON.stringify({G:f.c.G,B:f.c.B,NET:f.c.NET}),before);
    assert(f.styles[0].includes('.jrpg-btn.ability.bf-abil-used{'));
    assert(!f.styles[0].includes("'.bf-abil-used{"));
  });
  test(`${mode}: the unused form remains available after normal or elite use`,()=>{
    for(const elite of [false,true]){const f=fixture(mode,elite,elite,!elite);f.scan();assert(!f.ability.classList.contains('bf-abil-used'));assert(!f.panel.classList.contains('bf-abil-used'));}
  });
  test(`${mode}: rapid normal to elite use is remembered independently`,()=>{
    const f=fixture(mode,false,false,false);f.hero.abilityUsed=true;f.scan();assert(f.hero._bfNormalUsed);
    f.hero.eliteMode=true;f.scan();assert(f.hero._bfEliteUsed);
    f.nodes.filter(n=>n!==f.ability).forEach(n=>assert(!n.classList.contains('bf-abil-used')));
  });
  test(`${mode}: a new battle does not inherit the previous hero's usage`,()=>{
    const f=fixture(mode,false,false,false);f.hero.abilityUsed=true;f.scan();
    f.hero._bfNormalUsed=false;f.scan();assert(f.hero._bfNormalUsed);
  });
}