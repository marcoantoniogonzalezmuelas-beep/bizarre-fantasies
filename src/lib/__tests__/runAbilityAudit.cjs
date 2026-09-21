const audit = require('./abilityTargetingAudit.cjs');
const multiplayerRegression = require('./multiplayerRenderRegression.cjs');
const relayOutboxRegression = require('./relayOutboxRegression.cjs');

const APP = 'https://bizarre-fantasies.base44.app/functions/gameHtml';
const SUMMONS = new Set(['tk_patito_goma','tk_grulla','tk_unicornio','tk_pegaso']);
const parse = (html, name) => {
  const marker = 'var ' + name + ' = ';
  const start = html.indexOf(marker);
  if (start < 0) throw Error('Missing ' + name);
  const from = start + marker.length;
  let depth = 0, quote = '', escaped = false, end = -1;
  for (let i = from; i < html.length; i++) {
    const ch = html[i];
    if (quote) { if (escaped) escaped = false; else if (ch === '\\') escaped = true; else if (ch === quote) quote = ''; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '[' || ch === '{') depth++;
    else if (ch === ']' || ch === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end < 0) throw Error('Unclosed ' + name);
  return JSON.parse(html.slice(from, end));
};
const normalize = (c, category) => ({
  card_id:c.id, number:Number(c.num), name:c.name, category,
  ability_name:c.ability, ability_text:c.abilityTxt,
  elite_ability_name:c.eAbility, elite_ability_text:c.eTxt, akind:c.akind,
});

(async () => {
  const response = await fetch(APP + '?audit=' + Date.now());
  if (!response.ok) throw Error('gameHtml ' + response.status);
  const html = await response.text();
  const heroes = parse(html, 'DB_HERO_OBJS').map(c => normalize(c, 'hero'));
  const specials = parse(html, 'DB_TOKENS').map(c => normalize(c, SUMMONS.has(c.id) ? 'summon' : 'bizarro'));
  const cards = heroes.concat(specials.map(c => ({...c, category:'bizarro'})));
  const bags = cards.find(c => c.card_id === 'bagslord');
  if (!bags) throw Error('BagsLord is not loaded by gameHtml');
  const specs = [
    {card_id:'bagslord',elite:false,status:'implemented',effect_type:'custom_steps',params:{steps:[{action:'damage',target:'enemy',amount:8,element:'magic'},{action:'confuse',target:'enemy',amount:1,turns:2}]}},
    {card_id:'bagslord',elite:true,status:'implemented',effect_type:'custom_steps',params:{steps:[{action:'damage',target:'all_enemies',amount:12,element:'magic'},{action:'silence',target:'all_enemies',amount:0,turns:1}]}}
  ];
  const inventory = {
    heroes:heroes.length,
    bizarros:specials.filter(c=>!SUMMONS.has(c.card_id)).length,
    summons:specials.filter(c=>SUMMONS.has(c.card_id)).length,
    incomplete:cards.filter(c=>!c.ability_name||!c.ability_text||!c.elite_ability_name||!c.elite_ability_text).map(c=>c.card_id),
  };
  const result = audit(html, cards, specs);
  const multiplayer = multiplayerRegression().concat(await relayOutboxRegression());
  console.log(JSON.stringify({inventory,result,multiplayer}, null, 2));
  if (inventory.incomplete.length || result.failures.length || result.regressions.some(x=>!x.pass) || result.fullCoverage.failures.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });