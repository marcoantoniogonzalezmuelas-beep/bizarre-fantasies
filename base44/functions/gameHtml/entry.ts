import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
const COVER_BG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/db79541e2_generated_image.png';
const AUCTION_BG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/f9a34e5e7_generated_image.png';
const SHOP_BG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/8a8abf227_generated_image.png';
const BATTLE_BG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/67703a458_generated_image.png';
const GAME_PATCH_VERSION = 'bf-2026-07-30-mp-equip-fix-v200';
const LOGO_URL = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/80e2c6fb5_generated_image.png';
const toHArt = id => 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/' + id + '_generated_image.png';
const HERO_ART = ['0a701a388','0ae86f5cf','3144fa0cc','b3befffca','b27af2a2e','49da10371','4b39462db','70e5ca186','2321b345c','7b6b1032e','3bbcf59c0','dc308d368','a53c0e073','362ea0a4b','861dbe1ad','562066537','3ec5dbfd9','e5d35394d','49c4de216','a96095ce8','dd9ae011d','d9d830676','54365cb73','b34bdb48f','a237d8ffc','99d2f7a81','dcee2560b','ed76b96e2','a1aed5117','998c3949c','3c97a29dd','5a9d97619','1bd2bdf6d','40de7f507','a6a9e3561','a291e62f4','3e72cf42e','95e8228cd','c8b5e2201','c71c525b8','0ad0be833','3aedc4e62','0b3987343','2cfe0922c','9c56aea64'].map(toHArt);
const HERO_ELITE_ART = ['b2219417f','a2abfb434','4952ab881','01e96302a','e908b3273','650b7ff27','4d934fdf4','f7954d1fc','8bc966bfa','452bb4fb7','653c2036d','141eb7445','ddf40d7ab','12f840fe3','4cf89ac43','b264548c2','8979eecb4','87c291158','e7ace3347','8d6e97ce2','33eb953a8','ffd892ff4','5a79e3638','b08f41b13','fb9937c69','04b64ecc7','d9ef92043','40e91e893','437bbb48b','35add4eeb','0827725df','2c7c03c8f','d0512bd56','ae296c827','8cde88cb7','ea100edfb','7764cb9ea','84c9693dc','6996705b7','b96972130','8959bebcc','e7ce90f66','4328395b6','06c814afa','12a5ddb5c'].map(toHArt);
const IMG_BASE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/';
const toArt = function(id){ return IMG_BASE + id + '_generated_image.png'; };
const MELEE_ART = ['2ef6e8fd8','90d5f4f20','ca0217dac','79830b431','b5b6160a3','a8ea859a5'].map(toArt);
const RANGED_ART = ['2146a215b','ab826c633','88e45b0a1','93554b1ee','c8cf4c6d1','06ce99379','08cb8f198','809f7051c'].map(toArt);
const ARMOR_ART = ['b989796b2','37519e06c','4a38b42e1','6889c5c36','fefd71323','2de5cea6a','244338b2e','adc154eaf','46890f673','ed198ba53'].map(toArt);
const SPELL_ART = ['16656e37c','3ecdf6d2c','f07673381','c9386b2a6','77fcb19fb','75254b62e','fbc82143b','0cc792c57','05dd1e130','938f0dfba','299116e86','3e1c0a659','e73cbd75b','e0c8c5f87'].map(toArt);
// Token heroes (Nº 109-113): la buffarra, lavadora, bañador con rositas, caja de zapatos, pez espada de tres ojos. Stats flojos (<5), vida <=25, habilidades absurdas.
const TOKEN_ART = ['677d6bde3','5fde36306','707fa83e5','7b2be0479','1bc6fc19d'].map(toArt);
const TRANSFORMER_ART = toArt('e0c8c5f87');
const TOKENS = [{id:'tk_buf',name:'La Butifarra',title:'Parrillera',clan:'Bizarros',clanColor:'#caa14a',type:'CC',cost:0,num:109,cc:3,ad:1,he:2,hp:18,eCc:4,eAd:1,eHe:3,eHp:25,ability:'Petardeo',abilityTxt:'Hace "brum brum" muy fuerte. No pasa nada en absoluto.',eAbility:'Gases Tóxicos',eTxt:'Todos los rivales se marean y sufren -4 a sus stats por el olor.',akind:'tk_dizzy'},{id:'tk_lav',name:'La Lavadora',title:'Centrifugado Final',clan:'Bizarros',clanColor:'#7ad6ff',type:'HE',cost:0,num:110,cc:1,ad:2,he:4,hp:22,eCc:1,eAd:2,eHe:4,eHp:22,ability:'Centrifugado',abilityTxt:'Pone un programa de 90 minutos. Tarda un rato y no hace nada.',eAbility:'Centrifugado',eTxt:'Pone un programa de 90 minutos. Tarda un rato y no hace nada.',akind:'tk_none'},{id:'tk_ban',name:'El Bañador',title:'Rositas Serigrafiadas',clan:'Bizarros',clanColor:'#ff9ed1',type:'AD',cost:0,num:111,cc:2,ad:3,he:1,hp:15,eCc:2,eAd:3,eHe:1,eHp:15,ability:'Masaje',abilityTxt:'Sirve una paella imposible a un rival y lo deja Confuso durante 2 turnos.',eAbility:'Paella del Caos',eTxt:'Deja Confuso a un rival durante 3 turnos.',akind:'tk_confuse'},{id:'tk_caj',name:'La Caja de Zapatos',title:'Cartón Legendario',clan:'Bizarros',clanColor:'#d6a14a',type:'CC',cost:0,num:112,cc:4,ad:2,he:1,hp:25,eCc:4,eAd:2,eHe:1,eHp:25,ability:'Guardar un Zapato',abilityTxt:'Guarda un zapato dentro. Nadie sabe para qué.',eAbility:'Guardar un Zapato',eTxt:'Guarda un zapato dentro. Nadie sabe para qué.',akind:'tk_none'},{id:'tk_pez',name:'El Pez Espada',title:'De Tres Ojos',clan:'Bizarros',clanColor:'#3fd0c8',type:'AD',cost:0,num:113,cc:2,ad:4,he:3,hp:20,eCc:2,eAd:4,eHe:3,eHp:20,ability:'Licor de Tres Ojos',abilityTxt:'Emborracha a un rival durante 2 turnos: -3 a sus atributos y 3 de daño.',eAbility:'Licor Abisal',eTxt:'Emborracha a un rival durante 3 turnos: -3 a sus atributos y 3 de daño.',akind:'tk_drunk'}];
const OBJECT_ART = ['58d239c00','1688e1433','9b9d6986f','dd35e9e6b','026d2d45d','d138d9427','6eec753dd','4581afaa7','b990b1173'].map(toArt);
// Spell mana by name — the upstream SPELLS list has no `mana`, so we inject this and use it as fallback.
const SPELL_MANA = {'Bola de Fuego':8,'Tormenta Ígnea':16,'Lanza de Hielo':9,'Rayo en Cadena':12,'Maremoto':15,'Curación':8,'Curación Divina':15,'Escudo de Maná':8,'Barrera Arcana':12,'Sueño':10,'Paralización':11,'Maldición':8,'Bendición':8,'Transformer':20};
const BONUS_ART = ['88ffc8b21','a644bca96','a5d3ecf52','a58e01097','664754ee3','6c0160e33','fbe03869b','5369480ce','e5c4370fc','26219e884','1acefc0e0','77bc42e4f','0934ebffe','70f137c2b'].map(toArt);
const BONUS_IDS = ["ban","cor","mer","nau","pre","for","arm","pir","cor2","hac","ban2","gli","mina","roba"];
const BONUS_NAMES = ["Gran Banquero","Corredor de Bolsa","Mercader Zeta","Nauta Financiero","La Prestamista","Patrón de Forja","Armero Real","El Pirata","La Corsaria","Hacker Nexus","Bandolero Seco","Glitch","Mina de Oro","Ladrón de Guante"];
// Hero id order, matching the HERO_ART / HERO_ELITE_ART arrays index-for-index.
const HERO_IDS = ["kru","bos","nar","hil","tor","vor","bra","gna","vra","mor","buc","com","kre","hev","pij","pat","syl","ael","zar","ere","alf","dix","ska","syx","gor","fut","gam","ret","mal","ser","bat","nix","vex","chi","sol","man","pac","hex","rev","doc","zer","xer","aje","rol","pol"];
// Hero id -> display name (so we can match cards already rendered in the DOM by name).
const HERO_NAMES = ["Krunder","Boss","Narbon","Hildra","Torax","Vorn","Bramblok","Gnarr","Vragnar","Morthex","Buck Ironclad","La Comadreja","Krunder Mec.","El Heavy","El Pijo","Patrón","Sylvara","Aelion","Zarmanda","Eredon","Alfredinho","Dixie Plasma","Skarla","Sylvex","Gorvak","El Futbolista","El Gamer","Retropoeta","Malachar","Serafis","Batu","Nixara","Vexal","Chivo","Solenne","Mantenimiento","Pacopiton","Hexara","Reverendo Sapis","Doc Radiante","Zarmandis","Xerath","El Ajedrecista","El Rolero","El Político"];
const EQUIP = { melee: { nums:[59,60,61,62,63,64] }, ranged: { nums:[65,66,67,68,69,70,71,72] }, armor: { nums:[73,74,75,76,77,78,79,80,81,82] }, spell: { nums:[46,47,48,49,50,51,52,53,54,55,56,57,58] }, object: { nums:[83,84,85,86,87,88,89,90,91] } };
function buildArtScript(dbCards) {
  const freshArt=(card,url)=>{if(!url)return '';const stamp=encodeURIComponent(card.updated_date||card.created_date||Date.now());return url+(url.includes('?')?'&':'?')+'bfart='+stamp;};
  const artSets={melee:MELEE_ART.map(function(){return '';}),ranged:RANGED_ART.map(function(){return '';}),armor:ARMOR_ART.map(function(){return '';}),spell:SPELL_ART.map(function(){return '';}),object:OBJECT_ART.map(function(){return '';})},CAT2SET={melee_weapon:'melee',ranged_weapon:'ranged',armor:'armor',spell:'spell',object:'object'},bonusArtArr=BONUS_ART.map(function(){return '';});let transformerArt='';const dbBonusArt={};(dbCards||[]).forEach(c=>{if(!c||!c.art_url)return;const art=freshArt(c,c.art_url);if(c.category==='spell'&&(c.name==='Transformer'||Number(c.number)===108)){transformerArt=art;artSets.spell[13]=art;return;}const k=CAT2SET[c.category];if(k){const i=EQUIP[k].nums.indexOf(Number(c.number));if(i>=0)artSets[k][i]=art;return;}if(c.category==='bonus'){dbBonusArt[c.name]=art;const bi=BONUS_NAMES.indexOf(c.name);if(bi>=0)bonusArtArr[bi]=art;}}); // BD (Oráculo) = fuente de verdad del arte: sobreescribe los arrays locales por número (equipo/hechizos/objetos), por nombre (bonificadores) y el Transformer — los cambios en la BD llegan solos al juego.
  const NUM_ART={};[[EQUIP.melee,artSets.melee],[EQUIP.ranged,artSets.ranged],[EQUIP.armor,artSets.armor],[EQUIP.spell,artSets.spell],[EQUIP.object,artSets.object]].forEach(([c,a])=>c.nums.forEach((n,i)=>{if(a[i])NUM_ART[n]=a[i];}));
  const dbHeroes = dbCards.filter(c => c.category === 'hero' && c.in_auction !== false);
  // BD = única fuente de arte: las bases se inicializan vacías (mismo length
  // sólo como andamiaje de índices). Si una carta no está en la BD, no se
  // muestra imagen (nunca un arte hardcoded equivocado).
  const localHeroArt = HERO_ART.map(function(){ return ''; });
  const localHeroEliteArt = HERO_ELITE_ART.map(function(){ return ''; });
  const localHeroIds = [...HERO_IDS];
  const localHeroNames = [...HERO_NAMES];
  
  // BD (Oráculo) = fuente de verdad del ARTE de los héroes: actualiza el arte
  // del héroe existente en su posición por NÚMERO (el número de carta no cambia
  // al editar en el backoffice, aunque cambie el id). Los héroes nuevos (número
  // fuera del base set) se añaden al final como antes.
  const BASE_HERO_COUNT = HERO_ART.length;
  dbHeroes.forEach(c => {
    const num = Number(c.number);
    if (num >= 1 && num <= BASE_HERO_COUNT) {
      localHeroArt[num-1] = freshArt(c, c.art_url);
      localHeroEliteArt[num-1] = freshArt(c, c.elite_art_url || c.art_url);
      localHeroIds[num-1] = c.card_id;
      localHeroNames[num-1] = c.name;
    } else {
      localHeroArt.push(freshArt(c, c.art_url));
      localHeroEliteArt.push(freshArt(c, c.elite_art_url || c.art_url));
      localHeroIds.push(c.card_id);
      localHeroNames.push(c.name);
    }
  });
  
  const DB_HERO_OBJS = dbHeroes.map(c => ({ id: c.card_id, num: c.number, name: c.name, title: c.title, clan: c.clan, type: c.type, cost: c.cost, cc: c.cc, ad: c.ad, he: c.he, hp: c.hp, eCc: c.elite_cc, eAd: c.elite_ad, eHe: c.elite_he, eHp: c.elite_hp, ability: c.ability_name, abilityTxt: c.ability_text, eAbility: c.elite_ability_name, eTxt: c.elite_ability_text, clanColor: c.clan_color, foil: c.foil === true, gold_border: c.gold_border === true, rainbow_border: c.rainbow_border === true, akind: c.card_id === 'killerducks' ? 'duck-summon' : c.card_id === 'jessi' ? 'reflect-damage' : undefined }));
  // Token (Bizarro) heroes from the DB — same art/name/stats/elite as the Oráculo.
  const DB_TOKENS = (dbCards || []).filter(c => c.category === 'bizarro' || String(c.card_id || '').startsWith('tk_')).map(c => ({ id: c.card_id, num: c.number, name: c.name, title: c.title, clan: c.clan || 'Bizarros', clanColor: c.clan_color || '#caa14a', type: c.type, cost: c.cost || 0, cc: c.cc, ad: c.ad, he: c.he, hp: c.hp, eCc: c.elite_cc != null ? c.elite_cc : c.cc, eAd: c.elite_ad != null ? c.elite_ad : c.ad, eHe: c.elite_he != null ? c.elite_he : c.he, eHp: c.elite_hp != null ? c.elite_hp : c.hp, ability: c.ability_name, abilityTxt: c.ability_text, eAbility: c.elite_ability_name || c.ability_name, eTxt: c.elite_ability_text || c.ability_text, art: freshArt(c, c.art_url), eliteArt: freshArt(c, c.elite_art_url || c.art_url), foil: c.foil === true, gold_border: c.gold_border === true, rainbow_border: c.rainbow_border === true, akind: c.card_id === 'tk_patito_goma' ? 'big-ad' : c.card_id === 'tk_ban' ? 'tk_confuse' : c.card_id === 'tk_pez' ? 'tk_drunk' : c.card_id === 'tk_buf' ? 'tk_dizzy' : 'tk_none' }));
  // BD (Oráculo) = fuente de verdad también para el EQUIPAMIENTO: stats, texto,
  // coste y maná de hechizos/armas/armaduras/objetos se sincronizan desde la BD
  // al juego (igual que ya ocurría con héroes y arte). Sin esto, editar una
  // carta de equipo en el admin se veía en el Oráculo pero no en la partida.
  const DB_EQUIP = (dbCards || []).filter(c => c && ['melee_weapon','ranged_weapon','armor','spell','object'].includes(c.category)).map(c => ({ num: Number(c.number), cat: c.category, name: c.name, cost: c.cost, txt: c.ability_text || c.description || '', cc: c.cc, ad: c.ad, he: c.he, hp: c.hp, power: c.power, mana: c.mana, element: c.type || '' }));
  return `
<script>
(function() {
  // ---- ART DATA ----
  var HERO_ART = ${JSON.stringify(localHeroArt)};
  var HERO_ELITE_ART = ${JSON.stringify(localHeroEliteArt)};
  var HERO_IDS = ${JSON.stringify(localHeroIds)};
  var HERO_NAMES = ${JSON.stringify(localHeroNames)};
  var NUM_ART = ${JSON.stringify(NUM_ART)};
  var MELEE_ART = ${JSON.stringify(artSets.melee)};
  var RANGED_ART = ${JSON.stringify(artSets.ranged)};
  var ARMOR_ART = ${JSON.stringify(artSets.armor)};
  var SPELL_ART = ${JSON.stringify(artSets.spell)};
  var OBJECT_ART = ${JSON.stringify(artSets.object)};
  var DB_TOKENS = ${JSON.stringify(DB_TOKENS)};
  var DB_EQUIP = ${JSON.stringify(DB_EQUIP)};
  var DB_EQUIP_NUMS = ${JSON.stringify({ melee_weapon: EQUIP.melee.nums, ranged_weapon: EQUIP.ranged.nums, armor: EQUIP.armor.nums, spell: EQUIP.spell.nums, object: EQUIP.object.nums })};
  var LOCAL_TOKENS = ${JSON.stringify(TOKENS)}, LOCAL_TOKEN_ART = ${JSON.stringify(TOKEN_ART)}, LT_ART = {}; LOCAL_TOKENS.forEach(function(t,i){ LT_ART[t.id] = LOCAL_TOKEN_ART[i] || ''; });
  var TOKENS = LOCAL_TOKENS.map(function(local){ return (DB_TOKENS || []).find(function(db){ return db.id === local.id; }) || local; }).concat((DB_TOKENS || []).filter(function(db){ return !LOCAL_TOKENS.some(function(local){ return local.id === db.id; }); }));
  if (typeof CLAN_COLORS !== 'undefined') CLAN_COLORS.Bizarros = '#caa14a';
  if (typeof CLAN_SYMBOL !== 'undefined') CLAN_SYMBOL.Bizarros = '◉';
  if (typeof CLAN_PROFILE !== 'undefined') CLAN_PROFILE.Bizarros = { eliteHpPct:0, mMelee:0, mRanged:0, mSpell:0, mVel:0, manaBonus:0, regenBonus:0, resPhys:0, resMagic:0, trait:'Héroes sorpresa · No salen en subasta', desc:'Criaturas imposibles que aparecen de forma inesperada durante la batalla.' };
  var TOKEN_ART = TOKENS.map(function(t){ return t.art || ''; }), TOKEN_ELITE_ART = TOKENS.map(function(t){ return t.eliteArt || t.art || ''; });
  var TRANSFORMER_ART = "${transformerArt}";
  var SPELL_MANA = ${JSON.stringify(SPELL_MANA)}; function bfManaFor(it){ if(!it) return null; if(it.mana!=null) return it.mana; var m=SPELL_MANA[it.name]; return m!=null?m:null; } window.bfManaFor=bfManaFor;
  var BONUS_ART = ${JSON.stringify(bonusArtArr)};
  var BONUS_IDS = ${JSON.stringify(BONUS_IDS)};
  var BONUS_NAMES = ${JSON.stringify(BONUS_NAMES)};
  var DB_BONUS_ART = ${JSON.stringify(dbBonusArt)};
  var COVER_BG = "${COVER_BG}";
  var AUCTION_BG = "${AUCTION_BG}";
  var SHOP_BG = "${SHOP_BG}";
  var BATTLE_BG = "${BATTLE_BG}";
  var LOGO_URL = "${LOGO_URL}";
  var ACTION_BG = "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/9e0b3119e_generated_image.png";
  window.__BF_PATCH_VERSION = "${GAME_PATCH_VERSION}";
  function bfKey(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }
  // name -> bonus art lookup
  var BONUS_ART_BY_NAME = {};
  var BONUS_ART_BY_KEY = {};
  BONUS_IDS.forEach(function(id, i) {
    BONUS_ART_BY_NAME[BONUS_NAMES[i]] = BONUS_ART[i];
    BONUS_ART_BY_KEY[bfKey(BONUS_NAMES[i])] = BONUS_ART[i];
  });
  BONUS_ART_BY_KEY['patron de foria'] = BONUS_ART_BY_KEY['patron de forja'];
  // BD (Oráculo) = fuente de verdad del arte de TODOS los bonificadores,
  // incluidos "Convocatoria Épica" y "Destino Épico Rival", que antes tomaban
  // prestado el arte de un héroe (HERO_ELITE_ART[12]/[23]) y mostraban una
  // imagen equivocada si ese héroe cambiaba de ilustración en la BD.
  Object.keys(DB_BONUS_ART||{}).forEach(function(nm){
    var u=DB_BONUS_ART[nm]; if(!u) return;
    BONUS_ART_BY_NAME[nm]=u;
    BONUS_ART_BY_KEY[bfKey(nm)]=u;
  });
  var RACE_SIGIL_SVG = {'Guerreros':'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><line x1="8" y1="8" x2="32" y2="32" stroke="%C%" stroke-width="3.5" stroke-linecap="round"/><line x1="32" y1="8" x2="8" y2="32" stroke="%C%" stroke-width="3.5" stroke-linecap="round"/><line x1="5" y1="14" x2="14" y2="5" stroke="%C%" stroke-width="2" stroke-linecap="round"/><line x1="35" y1="14" x2="26" y2="5" stroke="%C%" stroke-width="2" stroke-linecap="round"/><circle cx="7" cy="33" r="2.5" fill="%C%"/><circle cx="33" cy="33" r="2.5" fill="%C%"/></svg>','Druidas':'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20 5 C20 5 28 10 28 20 C28 28 22 32 20 35 C18 32 12 28 12 20 C12 10 20 5 20 5Z" stroke="%C%" stroke-width="2" fill="none"/><path d="M20 35 C20 35 8 30 6 20 C4 11 10 6 14 6 C11 12 12 18 20 22 C20 22 28 18 26 12 C28 6 34 11 34 20 C32 30 20 35 20 35Z" stroke="%C%" stroke-width="1.5" fill="%C%" fill-opacity="0.18"/><circle cx="20" cy="20" r="3" fill="%C%"/></svg>','No-muertos':'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20 6 C12 6 8 12 8 18 C8 23 11 26 13 28 L13 33 L27 33 L27 28 C29 26 32 23 32 18 C32 12 28 6 20 6Z" stroke="%C%" stroke-width="2.2" fill="none"/><line x1="14" y1="33" x2="14" y2="36" stroke="%C%" stroke-width="2" stroke-linecap="round"/><line x1="18" y1="33" x2="18" y2="36" stroke="%C%" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="33" x2="22" y2="36" stroke="%C%" stroke-width="2" stroke-linecap="round"/><line x1="26" y1="33" x2="26" y2="36" stroke="%C%" stroke-width="2" stroke-linecap="round"/><ellipse cx="15.5" cy="20" rx="3" ry="3.5" fill="%C%"/><ellipse cx="24.5" cy="20" rx="3" ry="3.5" fill="%C%"/><path d="M19 25 L21 25 L20 27 Z" fill="%C%" opacity="0.7"/></svg>','Vaqueros':'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="20,4 23.5,14 34,14 25.5,20.5 28.5,31 20,25 11.5,31 14.5,20.5 6,14 16.5,14" stroke="%C%" stroke-width="1.8" fill="none" stroke-linejoin="round"/><circle cx="20" cy="20" r="4" fill="%C%" opacity="0.85"/></svg>','Elfos':'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M12 5 C6 14 6 26 12 35" stroke="%C%" stroke-width="2.5" stroke-linecap="round" fill="none"/><line x1="12" y1="5" x2="12" y2="35" stroke="%C%" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="2 2"/><line x1="13" y1="20" x2="35" y2="20" stroke="%C%" stroke-width="2" stroke-linecap="round"/><polygon points="35,20 30,17 30,23" fill="%C%"/><path d="M14 20 L10 16 M14 20 L10 24" stroke="%C%" stroke-width="1.5" stroke-linecap="round"/></svg>','Magos':'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="20,5 22,17 34,20 22,23 20,35 18,23 6,20 18,17" stroke="%C%" stroke-width="2" fill="%C%" fill-opacity="0.15" stroke-linejoin="round"/><polygon points="20,10 21,17.5 28.5,20 21,22.5 20,30 19,22.5 11.5,20 19,17.5" fill="%C%" fill-opacity="0.35"/><circle cx="20" cy="20" r="3.5" fill="%C%"/></svg>','Épicas':'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="20,4 34,16 20,36 6,16" stroke="%C%" stroke-width="2.2" fill="%C%" fill-opacity="0.15" stroke-linejoin="round"/><line x1="6" y1="16" x2="34" y2="16" stroke="%C%" stroke-width="1.4"/><line x1="20" y1="4" x2="6" y2="16" stroke="%C%" stroke-width="1.4"/><line x1="20" y1="4" x2="34" y2="16" stroke="%C%" stroke-width="1.4"/><line x1="6" y1="16" x2="20" y2="36" stroke="%C%" stroke-width="1.4"/><line x1="34" y1="16" x2="20" y2="36" stroke="%C%" stroke-width="1.4"/><line x1="20" y1="4" x2="20" y2="36" stroke="%C%" stroke-width="1" opacity="0.4"/></svg>','Cotidianos':'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="15" cy="19" r="10" stroke="%C%" stroke-width="2" fill="%C%" fill-opacity="0.1"/><circle cx="25" cy="21" r="10" stroke="%C%" stroke-width="2" fill="%C%" fill-opacity="0.1"/><path d="M11 22 Q15 26 19 22" stroke="%C%" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M21 26 Q25 22 29 26" stroke="%C%" stroke-width="1.8" stroke-linecap="round" fill="none"/><circle cx="13" cy="17" r="1.5" fill="%C%"/><circle cx="17" cy="17" r="1.5" fill="%C%"/><circle cx="23" cy="19" r="1.5" fill="%C%"/><circle cx="27" cy="19" r="1.5" fill="%C%"/></svg>','Bizarros':'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M4 20 C10 9 29 7 36 20 C29 33 10 31 4 20Z" stroke="%C%" stroke-width="2.2" fill="%C%" fill-opacity="0.12"/><path d="M20 12 C28 12 29 22 23 26 C17 30 11 24 14 18 C16 14 22 14 24 18 C26 22 21 25 18 23 C15 21 17 18 20 18" stroke="%C%" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M8 9 L12 13 M30 7 L28 12 M35 29 L30 26 M11 33 L14 28" stroke="%C%" stroke-width="2.4" stroke-linecap="round"/><circle cx="20" cy="20" r="2.2" fill="%C%"/></svg>'}; function raceSigilSvg(clan,color){var col=color||(typeof CLAN_COLORS!=='undefined'&&CLAN_COLORS[clan])||'#caa14a';var svg=RACE_SIGIL_SVG[clan]||'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="20,4 36,36 4,36" stroke="%C%" stroke-width="2" fill="%C%" fill-opacity="0.2"/></svg>';return svg.split('%C%').join(col);} window.bfRaceSigilSvg=raceSigilSvg;
  // id -> art, name -> art lookups for heroes
  var HERO_POS_OVERRIDE = { pac: 'center 20%', syx: 'center 18%', vra: 'center 22%', vex: 'center 16%', doc: 'center 18%', rol: 'center 16%' }; function bfHeroBgPos(id) { return HERO_POS_OVERRIDE[id] || 'center 10%'; } window.__bfHeroBgPos = bfHeroBgPos; var ART_BY_ID = {}, ELITE_BY_ID = {}, ART_BY_NAME = {}, ELITE_BY_NAME = {};
  HERO_IDS.forEach(function(id, i) {
    ART_BY_ID[id] = HERO_ART[i];
    ELITE_BY_ID[id] = HERO_ELITE_ART[i] || HERO_ART[i];
    var nm = HERO_NAMES[i];
    ART_BY_NAME[nm] = HERO_ART[i];
    ELITE_BY_NAME[nm] = HERO_ELITE_ART[i] || HERO_ART[i];
  });
  // Register token art (used when a hero is transformed into a token mid-battle).
  // Elite art uses the token's own elite illustration (same as the Oráculo).
  TOKENS.forEach(function(t, i) { var u = TOKEN_ART[i], eu = TOKEN_ELITE_ART[i] || u; if (!u) return; ART_BY_ID[t.id] = u; ELITE_BY_ID[t.id] = eu; ART_BY_NAME[t.name] = u; ELITE_BY_NAME[t.name] = eu; });
  function injectCoverStyle() {
    var style = document.createElement('style');
    style.textContent = \`
      .gtitle { text-shadow: 0 0 50px rgba(255,210,74,0.7), 0 4px 30px rgba(255,210,74,0.3) !important; }
      .phase-badge{display:inline-flex!important;align-items:center;gap:7px;font-family:'Cinzel',serif!important;font-weight:1000!important;letter-spacing:.3px;box-shadow:0 4px 14px rgba(0,0,0,.4),inset 0 1px 1px rgba(255,255,255,.25)!important}.bf-role-ico{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;font-size:15px;line-height:1;background:rgba(0,0,0,.32);box-shadow:inset 0 1px 2px rgba(255,255,255,.4),inset 0 -2px 4px rgba(0,0,0,.35),0 2px 5px rgba(0,0,0,.35);text-shadow:0 1px 2px rgba(0,0,0,.6);border:1.5px solid rgba(255,255,255,.35)}.bf-role-cc{background:radial-gradient(circle at 36% 26%,#ffd2cf,#ff4b45 42%,#7a0d09 78%)!important;border-color:#ff8a85!important}.bf-role-ad{background:radial-gradient(circle at 36% 26%,#d6ffe0,#54e876 42%,#0c6b2b 78%)!important;border-color:#8af2a6!important}.bf-role-he{background:radial-gradient(circle at 36% 26%,#ecd6ff,#b06cff 42%,#3c0b78 78%)!important;border-color:#d2a6ff!important}
      #s-setup .setup-box{max-width:640px!important;margin:0 auto!important;padding:24px 20px 28px!important;border-radius:22px!important;background:linear-gradient(180deg,rgba(28,20,52,.78),rgba(14,9,28,.86))!important;border:2px solid rgba(255,210,74,.42)!important;box-shadow:0 22px 60px rgba(0,0,0,.6),0 0 32px rgba(255,210,74,.14),inset 0 0 0 1px rgba(255,210,74,.1)!important;backdrop-filter:blur(4px)!important}#s-setup .setup-box h2{font-family:'Cinzel',serif!important;font-weight:1000!important;font-size:clamp(22px,5vw,30px)!important;text-align:center!important;color:#fff5dc!important;text-shadow:0 2px 8px #000,0 0 22px rgba(255,210,74,.45)!important;margin-bottom:6px!important}#s-setup .mode-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:14px!important;margin:18px 0 16px!important}#s-setup .mode-card{position:relative!important;cursor:pointer!important;text-align:center!important;padding:22px 14px 18px!important;border-radius:16px!important;background:linear-gradient(180deg,rgba(20,14,38,.7),rgba(10,7,20,.8))!important;border:2px solid rgba(255,210,74,.22)!important;box-shadow:0 8px 22px rgba(0,0,0,.4)!important;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease!important;overflow:hidden!important}#s-setup .mode-card:hover{transform:translateY(-4px)!important;border-color:rgba(255,210,74,.55)!important;box-shadow:0 14px 30px rgba(0,0,0,.5),0 0 22px rgba(255,210,74,.28)!important}#s-setup .mode-card.active{border-color:#ffd24a!important;box-shadow:0 14px 32px rgba(0,0,0,.5),0 0 28px rgba(255,210,74,.5),inset 0 0 0 1px rgba(255,210,74,.3)!important;background:linear-gradient(180deg,rgba(48,34,84,.78),rgba(20,13,38,.86))!important}#s-setup .mode-card.active::after{content:'✓'!important;position:absolute!important;top:8px!important;right:10px!important;width:24px!important;height:24px!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;font-weight:1000!important;font-size:13px!important;color:#3a2600!important;background:linear-gradient(180deg,#ffe27a,#FFD24A 55%,#c8901f)!important;box-shadow:0 3px 8px rgba(255,210,74,.5)!important}
      #s-setup .mode-icon{width:70px!important;height:70px!important;margin:0 auto 12px!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:34px!important;line-height:1!important;box-shadow:inset 0 2px 4px rgba(255,255,255,.4),inset 0 -4px 8px rgba(0,0,0,.45),0 4px 12px rgba(0,0,0,.5)!important;border:2px solid rgba(255,255,255,.4)!important;text-shadow:0 2px 4px rgba(0,0,0,.6)!important}#s-setup .mode-card:nth-child(1) .mode-icon{background:radial-gradient(circle at 36% 26%,#cfe0ff,#5a86ff 44%,#1a2c7a 80%)!important}#s-setup .mode-card:nth-child(2) .mode-icon{background:radial-gradient(circle at 36% 26%,#ffe0c2,#ff9b3a 44%,#8a3d0c 80%)!important}#s-setup .mode-label{font-family:'Cinzel',serif!important;font-weight:1000!important;font-size:18px!important;color:#fff5dc!important;text-shadow:0 2px 4px #000!important}#s-setup .mode-sub{margin-top:4px!important;font-size:12px!important;color:#cfc6dd!important;line-height:1.3!important}#s-setup .note-box{margin:4px 0 14px!important;padding:11px 13px!important;border-radius:12px!important;background:rgba(8,5,14,.55)!important;border:1px solid rgba(255,210,74,.26)!important;color:#efe9dc!important;font-size:13px!important;line-height:1.4!important}#s-setup .note-box b{color:#ffe49a!important}#s-setup .ig{margin:4px 0 14px!important}#s-setup .ig label{display:block!important;margin-bottom:6px!important;font-family:'Cinzel',serif!important;font-weight:900!important;font-size:13px!important;color:#ffd24a!important;letter-spacing:.3px!important}#s-setup .ig input{width:100%!important;padding:12px 14px!important;border-radius:11px!important;background:rgba(8,5,14,.6)!important;border:2px solid rgba(255,210,74,.3)!important;color:#fff5dc!important;font-size:15px!important;font-weight:600!important;outline:none!important;transition:border-color .14s ease,box-shadow .14s ease!important}#s-setup .ig input:focus{border-color:#ffd24a!important;box-shadow:0 0 0 3px rgba(255,210,74,.18)!important}#s-setup .row-btns{display:flex!important;gap:10px!important;margin-top:6px!important}#s-setup .row-btns .btn{flex:1!important;padding:13px 12px!important;border-radius:12px!important;font-family:'Cinzel',serif!important;font-weight:900!important;font-size:15px!important;cursor:pointer!important;border:1px solid rgba(255,255,255,.18)!important;background:rgba(255,255,255,.06)!important;color:#efe9dc!important;transition:transform .12s ease,filter .12s ease!important}#s-setup .row-btns .btn:hover{transform:translateY(-2px)!important;filter:brightness(1.08)!important}#s-setup .row-btns .btn.primary{color:#3a2600!important;background:linear-gradient(180deg,#ffe27a,#FFD24A 55%,#c8901f)!important;border:none!important;box-shadow:0 6px 16px rgba(255,210,74,.4)!important}
      .title-emoji{display:none!important}.screen.active button,.screen.active .btn{position:relative!important;z-index:90001!important}.title-links{position:relative!important;z-index:90001!important;margin-top:26px!important;gap:16px!important;justify-content:center!important}#modalRoot{position:relative!important;z-index:95000!important}.title-links .btn.sm{width:142px!important;min-height:128px!important;display:inline-flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:10px!important;padding:18px 12px 15px!important;border-radius:20px!important;font-family:'Cinzel',serif!important;font-weight:1000!important;font-size:14px!important;letter-spacing:.3px!important;line-height:1.15!important;text-align:center!important;color:#fff7e9!important;background:linear-gradient(165deg,rgba(255,255,255,.10),rgba(8,5,16,.55))!important;border:1.8px solid var(--tc-bd,#ffd24a)!important;box-shadow:0 12px 30px rgba(0,0,0,.55),inset 0 0 26px var(--tc-gl,rgba(255,210,74,.18))!important;text-shadow:0 2px 5px rgba(0,0,0,.75)!important;transition:transform .16s ease,box-shadow .22s ease,filter .22s ease!important}.title-links .btn.sm:hover{transform:translateY(-6px) scale(1.05)!important;filter:brightness(1.08)!important}.title-links .btn.sm .tc-img{width:72px!important;height:72px!important;border-radius:50%!important;overflow:hidden!important;border:2px solid var(--tc-bd,#ffd24a)!important;box-shadow:0 0 18px var(--tc-gl,rgba(255,210,74,.35))!important;flex-shrink:0!important;display:flex!important;align-items:center!important;justify-content:center!important;background:#09070d!important}.title-links .btn.sm .tc-img img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}.title-links .btn.sm span:last-child{display:block!important;text-align:center!important}.title-links .btn.sm:nth-child(1){--tc-bd:#7ad6ff;--tc-gl:rgba(122,214,255,.28)}.title-links .btn.sm:nth-child(2){--tc-bd:#ffd24a;--tc-gl:rgba(255,210,74,.28)}.title-links .btn.sm:nth-child(3){--tc-bd:#c79bff;--tc-gl:rgba(199,155,255,.28)}
      .bf-title-logo{display:flex!important;justify-content:center!important;margin-bottom:14px!important}.bf-title-logo img{width:172px;height:172px;object-fit:contain;border-radius:50%;border:4px solid rgba(255,210,74,.75);box-shadow:0 0 48px rgba(255,210,74,.7),0 0 90px rgba(192,91,255,.45);filter:drop-shadow(0 0 22px rgba(255,210,74,.9));animation:bfIconFloat 3.2s ease-in-out infinite}
      @keyframes bfIconFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-7px) scale(1.06)}}
      @media(max-width:640px){.title-links{gap:11px!important}.title-links .btn.sm{width:104px!important;min-height:108px!important;font-size:12px!important;padding:14px 8px 12px!important}.title-links .btn.sm .tc-img{width:56px!important;height:56px!important}}
      .flip3d{perspective:1300px!important}.flip3d-inner{transform-style:preserve-3d!important;transition:transform .62s cubic-bezier(.2,.72,.2,1)!important;will-change:transform!important}.flip3d.flipped .flip3d-inner{transform:rotateY(180deg)!important}.flip3d .face{backface-visibility:hidden!important;-webkit-backface-visibility:hidden!important;transform-style:preserve-3d!important}.flip3d .face.front{transform:rotateY(0deg) translateZ(1px)!important}.flip3d .face.back{transform:rotateY(180deg) translateZ(1px)!important}.face.back .bf-hero-card.cf-elite .bf-hero-bg,.face.back .cf-elite .cf-art.has-art::before{transform:none!important}.bf-hero-card{position:relative!important;height:100%!important;overflow:hidden!important;border-radius:18px!important;border:2.5px solid var(--clan,#caa14a)!important;background:#09070d!important;box-shadow:0 10px 28px rgba(0,0,0,.65),inset 0 0 0 1px rgba(255,210,74,.24)!important}.bf-hero-bg{position:absolute;inset:0;z-index:0;pointer-events:none;background:none;background-position:center center;overflow:hidden}.bf-hero-bg::before{content:'';position:absolute;inset:-12%;background-image:var(--bf-art);background-size:cover;background-position:center;background-repeat:no-repeat;filter:blur(18px) saturate(1.25) brightness(.72)}.bf-hero-bg::after{content:'';position:absolute;inset:var(--bf-fit,0%);background-image:var(--bf-art);background-size:var(--bf-fitmode,contain);background-position:inherit;background-repeat:no-repeat;filter:saturate(1.12) contrast(1.08)}.bf-hero-card::before{content:'';position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.54) 0%,rgba(0,0,0,.12) 20%,rgba(0,0,0,0) 42%,rgba(0,0,0,.12) 64%,rgba(0,0,0,.68) 100%),radial-gradient(circle at 50% 4%,rgba(255,210,74,.20),rgba(0,0,0,0) 28%)}.bf-hero-card.cf-elite::before{background:linear-gradient(180deg,rgba(16,0,34,.58) 0%,rgba(20,0,42,.10) 24%,rgba(0,0,0,0) 43%,rgba(18,0,35,.16) 66%,rgba(0,0,0,.70) 100%),radial-gradient(circle at 50% 4%,rgba(192,91,255,.28),rgba(0,0,0,0) 30%)}
      .bf-hero-card.cf-epic{border:6px solid #FFD24A!important;animation:bfGoldGlow 2.4s ease-in-out infinite!important}.bf-hero-card.cf-rainbow{border:6px solid transparent!important;background:linear-gradient(#09070d,#09070d) padding-box,linear-gradient(120deg,#ff1744,#ff5722,#ff9800,#ffeb3b,#b6ff00,#00e676,#00ffc8,#00e5ff,#2979ff,#651fff,#b000ff,#f500d4,#ff4081,#ff1744) border-box!important;background-size:100% 100%,600% 600%!important;animation:bfRainbowShift 6s linear infinite,bfRainbowGlow 3s ease-in-out infinite!important}@keyframes bfRainbowShift{0%{background-position:0 0,0% 50%}100%{background-position:0 0,600% 50%}}@keyframes bfRainbowGlow{0%,100%{box-shadow:0 10px 28px rgba(0,0,0,.65),0 0 16px rgba(255,120,220,.55)}50%{box-shadow:0 10px 28px rgba(0,0,0,.65),0 0 32px rgba(120,200,255,.85)}}.bhero.bf-rainbow{border:4px solid transparent!important;background:linear-gradient(#140d24,#140d24) padding-box,linear-gradient(120deg,#ff1744,#ff5722,#ff9800,#ffeb3b,#b6ff00,#00e676,#00ffc8,#00e5ff,#2979ff,#651fff,#b000ff,#f500d4,#ff4081,#ff1744) border-box!important;background-size:100% 100%,600% 600%!important;animation:bfHeroIdle 3.8s ease-in-out infinite,bfRainbowShift 6s linear infinite,bfRainbowGlow 3s ease-in-out infinite!important}.eq-hero.bf-eq-hero-with-art.bf-rainbow{border:3px solid transparent!important;background:linear-gradient(#15101f,#15101f) padding-box,linear-gradient(120deg,#ff1744,#ff5722,#ff9800,#ffeb3b,#b6ff00,#00e676,#00ffc8,#00e5ff,#2979ff,#651fff,#b000ff,#f500d4,#ff4081,#ff1744) border-box!important;background-size:100% 100%,600% 600%!important;animation:bfHeroIdle 3.8s ease-in-out infinite,bfRainbowShift 6s linear infinite!important}@keyframes bfGoldGlow{0%,100%{box-shadow:0 10px 28px rgba(0,0,0,.65),0 0 14px rgba(255,210,74,.45),inset 0 0 0 1px rgba(255,240,180,.6)}50%{box-shadow:0 10px 28px rgba(0,0,0,.65),0 0 30px rgba(255,210,74,.95),0 0 50px rgba(255,190,40,.55),inset 0 0 0 1px rgba(255,245,200,.85)}} .flip3d-inner:has(.bf-hero-card.cf-epic){border-radius:16px;animation:bfGoldGlow 2.4s ease-in-out infinite}.bf-hero-card .bf-foil{position:absolute;inset:0;z-index:6;border-radius:18px;pointer-events:none;background:linear-gradient(125deg,#ffd24a,#ff7adf 18%,#7ad6ff 38%,#9dff8a 56%,#ffe27a 72%,#ff7adf 88%,#ffd24a);background-size:300% 300%;animation:bfFoilShift 9s linear infinite;mix-blend-mode:soft-light;opacity:.4}.bf-hero-card.cf-foiled::after{content:'';position:absolute;inset:0;z-index:7;pointer-events:none;border-radius:18px;background:linear-gradient(110deg,transparent 42%,rgba(255,255,255,.35) 49%,rgba(255,255,255,.5) 50%,rgba(255,255,255,.35) 51%,transparent 58%);background-size:250% 250%;opacity:.6;animation:bfFoilShine 5.5s ease-in-out infinite;mix-blend-mode:screen}@keyframes bfFoilShift{0%{background-position:0% 0%}100%{background-position:300% 300%}}.bf-hero-frame{position:absolute;inset:7px;z-index:2;border:1px solid rgba(255,210,74,.36);border-radius:14px;pointer-events:none;box-shadow:inset 0 0 18px rgba(0,0,0,.72)}.bf-hero-top,.bf-hero-band{display:none!important}.bf-race-sigil{position:absolute;bottom:20px;left:19px;z-index:9;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 34% 28%,color-mix(in srgb,var(--clan,#caa14a) 55%,transparent),color-mix(in srgb,var(--clan,#caa14a) 80%,transparent) 45%,#1a1420);border:1.5px solid color-mix(in srgb,var(--clan,#caa14a) 60%,transparent);box-shadow:0 3px 8px rgba(0,0,0,.5),0 0 8px color-mix(in srgb,var(--clan,#caa14a) 35%,transparent)}.bf-race-sigil svg{width:12px;height:12px;display:block}.bf-nameplate{position:absolute;left:15px;right:15px;bottom:108px;z-index:4;text-align:center;padding:4px 9px 5px;border-radius:10px;background:linear-gradient(90deg,rgba(0,0,0,.14),rgba(0,0,0,.62),rgba(0,0,0,.14));border:1px solid rgba(255,210,74,.18);backdrop-filter:blur(1.5px)}.bf-hero-name{display:block;margin:0 auto;font-family:'Cinzel',serif;font-weight:900;font-size:clamp(15px,5.4vw,21px);line-height:1;color:#fff5dc;text-transform:uppercase;letter-spacing:.15px;text-shadow:0 2px 4px #000,0 0 12px rgba(0,0,0,.95);overflow-wrap:anywhere;text-align:center}.bf-hero-card.cf-elite .bf-hero-name{color:#ffd66a;text-shadow:0 0 10px rgba(255,187,52,.78),0 2px 4px #000}.bf-hero-title{display:block;margin:3px auto 0;max-width:92%;padding:2px 7px;border-radius:999px;color:#fff0bd;background:rgba(8,5,12,.62);border:1px solid rgba(255,210,74,.22);font-family:'Cinzel',serif;font-size:10.8px;line-height:1.08;font-weight:800;font-style:italic;text-shadow:0 1px 2px #000,0 0 8px rgba(255,210,74,.22);text-align:center;letter-spacing:.12px}
      .bf-coin{position:absolute;top:9px;left:9px;z-index:5;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 34% 28%,#fff0ae,#FFD24A 45%,#b77614);border:2px solid #6f4809;color:#4a2e03;font-size:18px;font-weight:1000;box-shadow:0 4px 10px rgba(0,0,0,.65),inset 0 1px 2px rgba(255,255,255,.62)}.bf-type-medal{position:absolute;top:10px;right:9px;z-index:5;width:42px;height:50px;border-radius:50%;background:rgba(0,0,0,.66);border:1.5px solid rgba(255,210,74,.5);color:#ead49a;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 10px rgba(0,0,0,.55)}.bf-type-medal span{font-size:7.5px;line-height:1;font-weight:800;letter-spacing:.2px;margin-top:1px}.bf-role-emblem{width:40px;height:40px;border-radius:50%;object-fit:cover;vertical-align:middle;filter:drop-shadow(0 2px 5px rgba(0,0,0,.7));display:inline-block}.phase-badge .bf-role-emblem{width:44px;height:44px}.bf-hero-card .bf-role-emblem{width:40px;height:40px}.bf-heart{position:absolute;right:9px;bottom:164px;z-index:4;width:58px;height:52px;display:flex;align-items:center;justify-content:center}.bf-heart .cf-heart-ico{position:absolute;inset:0;font-size:54px;color:#e23d3a;line-height:52px;text-align:center;filter:drop-shadow(0 3px 5px rgba(0,0,0,.85))}.bf-heart .cf-hp{position:relative;z-index:2;font-weight:1000;color:#fff;font-size:18px;text-shadow:0 2px 3px #000}.bf-stats{position:absolute;left:16px;right:16px;bottom:158px;z-index:3;display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:7px 50px 7px 8px;border-radius:10px;background:linear-gradient(180deg,rgba(9,7,13,.36),rgba(9,7,13,.58));border:1px solid rgba(255,210,74,.18);box-shadow:0 3px 12px rgba(0,0,0,.36);backdrop-filter:blur(2px)}.bf-stat{text-align:center;font-weight:900;line-height:1;text-shadow:0 1px 2px #000,0 0 8px #000}.bf-stat span{display:block;font-size:9px;letter-spacing:1px;margin-bottom:2px}.bf-stat b{display:block;font-size:20px}.bf-stat-cc span,.bf-stat-cc b{color:#ff4b45}.bf-stat-ad span,.bf-stat-ad b{color:#54e876}.bf-stat-he span,.bf-stat-he b{color:#b06cff}.bf-ability-panel{position:absolute;left:11px;right:11px;bottom:11px;z-index:3;min-height:99px;display:grid;grid-template-columns:44px 1fr;gap:9px;align-items:center;padding:9px 10px 20px 9px;border-radius:11px;background:linear-gradient(180deg,rgba(19,12,7,.30),rgba(4,3,5,.62));border:1px solid rgba(255,210,74,.34);box-shadow:0 -2px 18px rgba(0,0,0,.42),inset 0 0 0 1px rgba(255,255,255,.05);backdrop-filter:blur(2px)}.bf-ability-orb{position:relative;width:40px;height:40px;border-radius:50%;background:radial-gradient(circle at 38% 28%,#fff2a7,#ff7a22 32%,#8c1108 62%,#170101);border:2px solid rgba(255,224,121,.82);box-shadow:0 0 16px rgba(255,95,25,.72),inset 0 0 10px rgba(255,255,255,.18)}.bf-ability-orb::before{content:'✦';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff7d7;font-size:23px;font-weight:900;text-shadow:0 0 8px #fff,0 2px 4px #000}.bf-ability-orb.bf-ability-orb-img{overflow:hidden}.bf-ability-orb.bf-ability-orb-img::before{content:none}.bf-ability-orb.bf-ability-orb-img img{width:100%;height:100%;object-fit:cover;display:block;position:relative;z-index:1}.bf-ability-orb::after{content:'';position:absolute;inset:-5px;border-radius:50%;border:1px solid rgba(255,210,74,.34);box-shadow:0 0 14px rgba(255,210,74,.32)}.bf-hero-card.cf-elite .bf-ability-orb{background:radial-gradient(circle at 38% 28%,#f4dbff,#c16aff 36%,#4c0b86 66%,#090012);box-shadow:0 0 17px rgba(190,91,255,.82),inset 0 0 10px rgba(255,255,255,.16)}.bf-ability-name{color:#ffe07b;font-family:'Cinzel',serif;font-size:12.6px;font-weight:1000;letter-spacing:.25px;text-transform:uppercase;text-shadow:0 2px 4px #000,0 0 10px rgba(255,210,74,.32)}.bf-hero-card.cf-elite .bf-ability-name{color:#d9a2ff}.bf-ability-text{margin-top:3px;color:#fff7ea;font-size:12px;font-weight:700;line-height:1.25;text-shadow:0 2px 3px #000,0 0 8px #000}.bf-logo{position:absolute!important;right:19px!important;bottom:20px!important;z-index:9!important;width:18px!important;height:18px!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;border-radius:50%!important;border:1.5px solid rgba(255,210,74,.6)!important;background:#09070d!important;box-shadow:0 0 8px rgba(255,210,74,.45)!important}.bf-logo img{width:100%!important;height:100%!important;object-fit:contain!important;display:block!important}.bf-card-num{position:absolute;left:62px;bottom:13px;z-index:8;color:#ffe7a8;font-size:8.5px;font-weight:900;letter-spacing:.25px;padding:2px 7px;border-radius:999px;background:rgba(0,0,0,.62);border:1px solid rgba(255,210,74,.32);text-shadow:0 1px 2px #000}
      /* Fallback for any old-format hero cards already on screen */
      .cf-art.has-art::before { content:''; position:absolute; inset:var(--bf-fit,0%); z-index:0; pointer-events:none; background-image:var(--bf-art); background-size:var(--bf-art-size,contain); background-position:var(--bf-art-pos,center center); background-repeat:no-repeat; }
      .face.back .cf-elite .cf-art.has-art::before { transform: none !important; }
      .cf-art.has-art .cf-art-emoji { display:none !important; }
      .cf-art.has-art::after { content:''; position:absolute; inset:0; pointer-events:none; z-index:1; background:linear-gradient(180deg,rgba(0,0,0,.76) 0%,rgba(0,0,0,.18) 28%,rgba(0,0,0,0) 50%,rgba(0,0,0,.90) 100%); }
      .cf-art.has-art > * { position:relative; z-index:2; }
      .cf-art.has-art .cf-name { font-size:18px !important; padding:0 44px !important; line-height:1.05 !important; text-shadow:0 2px 8px #000,0 0 16px #000 !important; }
      .cf-art.has-art .cf-title { font-size:11px !important; padding:0 44px !important; color:#ffe6a8 !important; text-shadow:0 2px 6px #000,0 0 10px #000 !important; }
      .cf-he b,.cf-he span{color:#b06cff !important;}
      .cf-art.has-art .cf-stats { z-index:4 !important; background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.90) 58%) !important; }
      .cf-art.has-art .cf-heart { z-index:5 !important; }
      /* Bonus / restador = the oracle card itself. Card proportion + cover with
         a tiny overscan to eat the white border the source images carry. */
      .bf-bonus-card { position: relative; display: block; border-radius: 13px; overflow: hidden; aspect-ratio: 3 / 4.1; margin: 5px auto 8px; max-width: 250px; width: 100%; border: 2px solid rgba(255,210,74,0.68); background: #07050b; box-shadow: 0 7px 20px rgba(0,0,0,0.52), inset 0 0 0 1px rgba(255,210,74,.10); }
      .bf-bonus-card .bf-bonus-fill { display: block; position:absolute; inset:0; z-index:0; background-size:cover; background-position:center; filter:blur(16px) saturate(1.3) brightness(.85); transform:scale(1.35); }
      .bf-bonus-card .bf-bonus-art { position: absolute; inset: -18%; background-size: cover; background-position: center center; background-repeat: no-repeat; z-index: 1; }
      .bf-bonus-card .bf-bonus-shade { display: none; }
      .bf-bonus-card .bf-bonus-name { position:absolute; left:0; right:0; bottom:0; z-index:3; padding:5px 6px 8px; font-size:12px; font-weight:900; font-family:'Cinzel',serif; color:#fff5dc; text-align:center; text-transform:uppercase; text-shadow:0 2px 4px #000,0 0 8px #000; background:linear-gradient(0deg,rgba(8,5,14,.95),rgba(8,5,14,.6) 60%,transparent); }
      /* Mobile card fit: keep art and text inside the phone frame */
      @media (max-width: 640px) { .cardface, .bf-hero-card { max-width: 100% !important; } .bf-race-sigil { bottom: 17px !important; left: 11px !important; width: 15px !important; height: 15px !important; } .bf-race-sigil svg { width: 10px !important; height: 10px !important; } .bf-nameplate { left: 9px !important; right: 9px !important; bottom: 107px !important; padding: 4px 7px !important; } .bf-hero-name { font-size: clamp(13px, 4.9vw, 18px) !important; line-height: 1 !important; } .bf-hero-title { font-size: 9.5px !important; padding: 2px 6px !important; } .bf-coin { width: 38px !important; height: 38px !important; font-size: 16px !important; } .bf-type-medal { width: 37px !important; height: 44px !important; font-size: 18px !important; } .bf-stats { left: 10px !important; right: 10px !important; bottom: 150px !important; padding: 6px 45px 6px 7px !important; } .bf-stat b { font-size: 17px !important; } .bf-heart { right: 8px !important; bottom: 154px !important; width: 50px !important; height: 46px !important; } .bf-heart .cf-heart-ico { font-size: 48px !important; line-height: 46px !important; } .bf-heart .cf-hp { font-size: 16px !important; } .bf-ability-panel { left: 8px !important; right: 8px !important; bottom: 8px !important; min-height: 90px !important; max-height: 138px !important; overflow: hidden !important; grid-template-columns: 34px 1fr !important; gap: 7px !important; padding: 8px 8px 18px 8px !important; align-items: start !important; } .bf-ability-orb { width: 32px !important; height: 32px !important; margin-top: 1px !important; } .bf-ability-orb::before { font-size: 18px !important; } .bf-ability-name { font-size: 10.2px !important; line-height: 1.1 !important; } .bf-ability-text { font-size: 9.8px !important; line-height: 1.16 !important; } .bf-zoom-btn { width: 30px !important; height: 30px !important; font-size: 14px !important; right: 6px !important; } .bf-card-num { left: 52px !important; bottom: 9px !important; font-size: 7.6px !important; } .bf-logo { right: 7px !important; bottom: 8px !important; font-size: 13px !important; } .bf-bonus-card { aspect-ratio: 3 / 4.1 !important; height: auto !important; max-width: 200px !important; margin: 4px auto 7px !important; background:#07050b !important; } .bf-bonus-card .bf-bonus-art { inset: -18% !important; background-size: cover !important; background-position: center center !important; background-repeat: no-repeat !important; } }
      /* Battle/recruit hero thumbnails */
      .bhero { overflow:hidden !important; min-height:176px; padding-left:134px !important; animation:bfHeroIdle 3.8s ease-in-out infinite; } .bhero.bf-epic-gold { border:4px solid #FFD24A !important; animation:bfHeroIdle 3.8s ease-in-out infinite, bfGoldGlowB 2.4s ease-in-out infinite !important; } @keyframes bfGoldGlowB { 0%,100%{box-shadow:0 0 12px rgba(255,210,74,.45), inset 0 0 0 1px rgba(255,240,180,.5)} 50%{box-shadow:0 0 28px rgba(255,210,74,.95), 0 0 44px rgba(255,190,40,.5), inset 0 0 0 1px rgba(255,245,200,.8)} }
      .bhero .bhero-top, .bhero .bhero-hpnum, .bhero .hp-bar, .bhero .mp-bar, .bhero .mp-num, .bhero .bhero-status { position:relative; z-index:2; }
      .bf-battle-art { position:absolute; left:6px; top:6px; bottom:6px; width:116px; z-index:1; border-radius:12px; overflow:hidden; background-size:cover !important; background-repeat:no-repeat; background-color:#0a0710; filter:saturate(1.12) contrast(1.08); border:1.5px solid rgba(255,210,74,.45) !important; outline:0 !important; box-shadow:0 5px 12px rgba(0,0,0,.45) !important; transition:filter .4s ease; cursor:pointer; } .bf-battle-art::before { content:''; position:absolute; inset:-26%; background-image:inherit; background-size:cover; background-position:inherit; background-repeat:no-repeat; }
      .bf-battle-zoom { position:absolute; left:6px; top:6px; z-index:10; width:28px; height:28px; border-radius:50%; background:rgba(0,0,0,.6); border:1.5px solid rgba(255,210,74,.5); color:#ffe49a; display:flex; align-items:center; justify-content:center; font-size:13px; cursor:pointer; transition:all .15s ease; box-shadow:0 3px 8px rgba(0,0,0,.5); }
      .bf-battle-zoom:hover { background:rgba(255,210,74,.3); transform:scale(1.15); }
      .picking-target .bhero { cursor: crosshair !important; box-shadow: 0 0 0 3px rgba(255,210,74,0.6), 0 0 20px rgba(255,210,74,0.4) !important; transition: all 0.2s; }
      .picking-target .bhero:hover { transform: scale(1.05); box-shadow: 0 0 0 4px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.6) !important; }
      /* ---- ACTIVE HERO: dramatic gradient glow built from their own portrait ---- */
      .bhero.active-turn { animation:bfHeroActive 2.1s ease-in-out infinite !important; z-index:5 !important; }
      .bhero.active-turn .bf-battle-art { filter:saturate(1.3) contrast(1.14) brightness(1.06) !important; border-color:rgba(255,210,74,.85) !important; box-shadow:0 5px 12px rgba(0,0,0,.45), 0 0 16px rgba(255,210,74,.55) !important; }
      .bf-active-aura { position:absolute; inset:-14px; z-index:0; pointer-events:none; border-radius:22px; background:radial-gradient(120% 120% at 0% 50%, rgba(255,210,74,.42), rgba(255,160,40,.18) 38%, rgba(255,210,74,0) 70%); opacity:0; transition:opacity .45s ease; animation:bfAuraBreath 2.4s ease-in-out infinite; }
      /* "Equipar con IA" — fixed floating action button, always visible & tappable */
      .bf-autoequip-btn { position:fixed; left:50%; bottom:14px; transform:translateX(-50%); z-index:99990; display:flex; align-items:center; gap:12px; width:auto; max-width:92vw; margin:0; padding:12px 24px; border-radius:999px; cursor:pointer; border:2px solid #e2c2ff; background:linear-gradient(120deg,#7a3df0,#c06bff 45%,#ff7adf 100%); background-size:200% 200%; color:#fff; font-family:'Cinzel',serif; font-weight:1000; text-transform:uppercase; text-shadow:0 2px 4px rgba(0,0,0,.5); box-shadow:0 10px 30px rgba(0,0,0,.6),0 0 26px rgba(160,80,255,.75); animation:bfAeShift 4s ease-in-out infinite, bfAePulse 2.2s ease-in-out infinite; touch-action:manipulation; user-select:none; -webkit-user-select:none; }
      .bf-autoequip-btn:hover { transform:translateX(-50%) translateY(-3px); filter:brightness(1.1); } .bf-autoequip-btn:active { transform:translateX(-50%) scale(.95); }
      .bf-autoequip-btn .bf-ae-spark { font-size:26px; line-height:1; filter:drop-shadow(0 0 8px #fff); animation:bfAeSpin 3s linear infinite; pointer-events:none; }
      .bf-autoequip-btn .bf-ae-col { display:flex; flex-direction:column; align-items:flex-start; line-height:1.15; pointer-events:none; }
      .bf-autoequip-btn .bf-ae-txt { font-size:16px; letter-spacing:.5px; } .bf-autoequip-btn .bf-ae-sub { font-family:'Rubik',sans-serif; font-weight:700; font-size:10px; opacity:.92; text-transform:none; letter-spacing:0; }
      @keyframes bfAePulse { 0%,100%{box-shadow:0 10px 30px rgba(0,0,0,.6),0 0 18px rgba(160,80,255,.6)} 50%{box-shadow:0 10px 30px rgba(0,0,0,.6),0 0 40px rgba(200,120,255,.95)} }
      /* Colocado junto al botón "Listo — a la batalla" (fixed solo como último recurso) */
      .bf-autoequip-btn.bf-ae-inline { position:static; left:auto; bottom:auto; transform:none; display:inline-flex; margin:0 10px 8px 0; padding:10px 18px; vertical-align:middle; }
      .bf-autoequip-btn.bf-ae-inline:hover { transform:translateY(-2px); } .bf-autoequip-btn.bf-ae-inline:active { transform:scale(.96); }
      @keyframes bfAeShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
      @keyframes bfAeSpin { 0%{transform:rotate(0) scale(1)} 50%{transform:rotate(180deg) scale(1.2)} 100%{transform:rotate(360deg) scale(1)} }
      .bhero.active-turn .bf-active-aura { opacity:1; }
      .bf-active-ring { position:absolute; inset:-3px; z-index:0; pointer-events:none; border-radius:18px; border:2px solid rgba(255,210,74,.0); }
      .bhero.active-turn .bf-active-ring { border-color:rgba(255,210,74,.8); box-shadow:0 0 0 1px rgba(255,210,74,.4), 0 0 30px rgba(255,210,74,.5), inset 0 0 24px rgba(255,210,74,.22); animation:bfRingPulse 2.1s ease-in-out infinite; }
      .bf-active-tag { position:absolute; top:-11px; left:50%; transform:translateX(-50%); z-index:6; pointer-events:none; font-family:'Cinzel',serif; font-weight:1000; font-size:10px; letter-spacing:.6px; color:#3a2600; background:linear-gradient(180deg,#ffe27a,#FFD24A 55%,#c8901f); padding:2px 12px; border-radius:999px; box-shadow:0 4px 12px rgba(255,210,74,.5); opacity:0; }
      .bhero.active-turn .bf-active-tag { opacity:1; animation:bfTagBob 2.1s ease-in-out infinite; }
      @keyframes bfAuraBreath { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} } @keyframes bfRingPulse { 0%,100%{box-shadow:0 0 0 1px rgba(255,210,74,.4),0 0 22px rgba(255,210,74,.4),inset 0 0 20px rgba(255,210,74,.18)} 50%{box-shadow:0 0 0 2px rgba(255,210,74,.6),0 0 40px rgba(255,210,74,.65),inset 0 0 28px rgba(255,210,74,.3)} } @keyframes bfTagBob { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-3px)} }
      .bhero.fx-shake { animation:bfDamageShake .5s ease-in-out 1 !important; }
      /* ---- STATUS EFFECTS: strong, unmistakable visuals ---- */
      .bhero.s-paralyzed .bf-battle-art { filter:saturate(1.45) contrast(1.2) drop-shadow(0 0 12px #ffe14a); animation:bfZap .5s steps(2,end) infinite; }
      .bhero.s-paralyzed { box-shadow:0 0 0 2px rgba(255,225,74,.7), 0 0 24px rgba(255,225,74,.45) !important; }
      .bhero.s-sleeping .bf-battle-art { filter:saturate(.55) contrast(.9) brightness(.7) blur(.4px); animation:bfSleepBreath 3.6s ease-in-out infinite; }
      .bhero.s-sleeping { box-shadow:0 0 0 2px rgba(120,160,255,.6), 0 0 22px rgba(120,160,255,.4) !important; }
      .bhero.s-cursed .bf-battle-art { filter:saturate(.78) contrast(1.22) hue-rotate(255deg) drop-shadow(0 0 11px #b06cff); }
      .bhero.s-cursed { box-shadow:0 0 0 2px rgba(176,108,255,.65), 0 0 22px rgba(176,108,255,.45) !important; }
      .bhero.s-blessed .bf-battle-art { filter:saturate(1.2) contrast(1.05) brightness(1.12) drop-shadow(0 0 12px #ffe9a0) !important; } .bhero.s-blessed { box-shadow:0 0 0 2px rgba(255,230,150,.8), 0 0 26px rgba(255,210,90,.55) !important; }
      .bhero.elite-mode .bf-battle-art { filter:saturate(1.25) contrast(1.12) drop-shadow(0 0 10px #ffd24a); }
      /* Floating status emblem, always visible while the status is active */
      .bf-status-badge { position:absolute; top:6px; right:6px; z-index:7; display:flex; align-items:center; gap:4px; padding:3px 9px 3px 6px; border-radius:999px; font-family:'Cinzel',serif; font-weight:1000; font-size:10px; letter-spacing:.3px; color:#fff; background:rgba(8,5,14,.82); border:1.5px solid currentColor; box-shadow:0 0 12px currentColor; animation:bfBadgeFloat 1.8s ease-in-out infinite; }
      .bf-status-badge .bf-status-ico { font-size:14px; line-height:1; } .bf-status-paralyzed { color:#ffe14a; } .bf-status-sleeping { color:#8aaaff; } .bf-status-cursed { color:#c79bff; } .bf-status-blessed { color:#ffe49a; }
      @keyframes bfBadgeFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} } @keyframes bfSleepBreath { 0%,100%{transform:scale(1)} 50%{transform:scale(1.018)} } @keyframes bfSleepZRise { 0%{opacity:0;transform:translate(0,6px) rotate(-8deg) scale(.6)} 18%{opacity:1} 80%{opacity:.9} 100%{opacity:0;transform:translate(22px,-46px) rotate(12deg) scale(1.15)} } @keyframes bfSheepHop { 0%{left:-30%;transform:translateY(0)} 8%,24%,40%,56%{transform:translateY(-10px)} 16%,32%,48%,64%{transform:translateY(0)} 100%{left:118%;transform:translateY(0)} } @keyframes bfSheepCount { 0%,40%{opacity:0;transform:translate(-50%,6px) scale(.7)} 50%{opacity:1;transform:translate(-50%,0) scale(1.1)} 70%{opacity:1} 85%,100%{opacity:0;transform:translate(-50%,-12px) scale(.9)} } @keyframes bfArc { 0%,100%{opacity:0} 4%{opacity:1} 9%{opacity:.2} 13%{opacity:.9} 18%{opacity:0} } @keyframes bfBoltFlick { 0%,100%{opacity:.15;transform:scale(.9)} 50%{opacity:1;transform:scale(1.25)} } @keyframes bfCursePulse { 0%,100%{opacity:.4} 50%{opacity:.85} } @keyframes bfRuneRise { 0%{opacity:0;transform:translateY(0) rotate(0) scale(.6)} 20%{opacity:1} 80%{opacity:.85} 100%{opacity:0;transform:translateY(-120px) rotate(140deg) scale(1.1)} } @keyframes bfBlessRays { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} } @keyframes bfHaloBob { 0%,100%{transform:translateX(-50%) translateY(0);opacity:.9} 50%{transform:translateX(-50%) translateY(-4px);opacity:1} } @keyframes bfBlessTwinkle { 0%,100%{opacity:.2;transform:scale(.7) rotate(0)} 50%{opacity:1;transform:scale(1.2) rotate(45deg)} }
      .bf-fx-overlay { position:absolute; inset:0; z-index:7; pointer-events:none; border-radius:inherit; overflow:hidden; }
      .bf-sleep-z { position:absolute; left:54%; bottom:34%; font-family:'Cinzel',serif; font-weight:1000; color:#bcd0ff; text-shadow:0 0 10px #5a7fff,0 2px 4px #000; animation:bfSleepZRise 3s ease-in-out infinite; } .bf-sleep-z.z1{font-size:15px} .bf-sleep-z.z2{font-size:20px;left:60%;animation-delay:.9s} .bf-sleep-z.z3{font-size:26px;left:66%;animation-delay:1.8s}
      .bf-sleep-sheep { position:absolute; bottom:14%; left:-30%; font-size:26px; filter:drop-shadow(0 3px 5px rgba(0,0,0,.6)); animation:bfSheepHop 4.4s linear infinite; } .bf-sleep-count { position:absolute; bottom:30%; left:50%; z-index:8; font-family:'Cinzel',serif; font-weight:1000; font-size:13px; color:#fff5dc; text-shadow:0 0 8px #5a7fff,0 2px 4px #000; opacity:0; animation:bfSheepCount 4.4s linear infinite; }
      .bf-shock-fx::before, .bf-shock-fx::after { content:''; position:absolute; inset:0; background:linear-gradient(118deg,transparent 44%,rgba(255,239,140,.9) 47%,#fffbe0 49%,rgba(255,239,140,.9) 51%,transparent 54%),linear-gradient(-72deg,transparent 60%,rgba(255,230,90,.8) 63%,#fff 65%,transparent 68%); mix-blend-mode:screen; opacity:0; animation:bfArc 1.5s steps(1,end) infinite; } .bf-shock-fx::after { animation-delay:.55s; transform:scaleX(-1) scaleY(.9); } .bf-shock-bolt { position:absolute; font-size:18px; color:#fff7c0; filter:drop-shadow(0 0 8px #ffe14a); animation:bfBoltFlick 1.1s steps(2,end) infinite; } .bf-shock-bolt.b1{top:14%;left:18%} .bf-shock-bolt.b2{top:62%;right:16%;font-size:14px;animation-delay:.4s} .bf-shock-bolt.b3{top:38%;left:60%;font-size:22px;animation-delay:.75s}
      .bf-curse-fx::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 50% 78%,rgba(120,40,180,.45),transparent 60%); mix-blend-mode:screen; animation:bfCursePulse 2.4s ease-in-out infinite; } .bf-curse-rune { position:absolute; bottom:-10%; font-size:18px; color:#d6a8ff; text-shadow:0 0 10px #9a3df0,0 0 4px #fff; animation:bfRuneRise 3.6s ease-in infinite; } .bf-curse-rune.r1{left:24%} .bf-curse-rune.r2{left:50%;font-size:24px;animation-delay:1.2s} .bf-curse-rune.r3{left:72%;font-size:15px;animation-delay:2.2s}
      .bf-bless-fx::before { content:''; position:absolute; inset:-40%; background:conic-gradient(from 0deg,rgba(255,235,150,0) 0deg,rgba(255,235,150,.32) 18deg,rgba(255,235,150,0) 36deg,rgba(255,235,150,.32) 54deg,rgba(255,235,150,0) 72deg,rgba(255,235,150,.32) 90deg,rgba(255,235,150,0) 108deg); mix-blend-mode:screen; animation:bfBlessRays 9s linear infinite; } .bf-bless-halo { position:absolute; top:8%; left:50%; transform:translateX(-50%); width:54px; height:18px; border-radius:50%; border:3px solid rgba(255,224,121,.95); box-shadow:0 0 16px rgba(255,210,90,.85),inset 0 0 8px rgba(255,235,150,.6); animation:bfHaloBob 2.4s ease-in-out infinite; } .bf-bless-spark { position:absolute; font-size:14px; color:#fff6cf; text-shadow:0 0 10px #ffd24a; animation:bfBlessTwinkle 1.8s ease-in-out infinite; } .bf-bless-spark.s1{top:30%;left:20%} .bf-bless-spark.s2{top:55%;right:18%;font-size:11px;animation-delay:.6s} .bf-bless-spark.s3{top:70%;left:46%;font-size:17px;animation-delay:1.1s}
      .bf-fx-bless-burst { position:absolute; inset:-6px; z-index:5; border-radius:inherit; background:radial-gradient(circle at 50% 45%,rgba(255,255,235,.95),rgba(255,224,121,.55) 24%,rgba(255,200,80,.2) 48%,transparent 72%); animation:bfBigBlast 1s ease-out forwards; }
      /* ---- FROZEN: animated ice sheet over the whole hero card ---- */
      .bhero.s-frozen .bf-battle-art { filter:saturate(1.05) brightness(.92) contrast(1.05) hue-rotate(-12deg) drop-shadow(0 0 10px #8fe6ff) !important; } .bhero.s-frozen { box-shadow:0 0 0 2px rgba(140,225,255,.7), 0 0 24px rgba(120,200,255,.5) !important; } .bf-frost { position:absolute; inset:0; z-index:6; pointer-events:none; border-radius:inherit; overflow:hidden; animation:bfFrostIn .5s ease-out; } .bf-status-frozen { color:#8fe6ff; }
      .bf-frost-sheet { position:absolute; inset:0; background:linear-gradient(135deg,rgba(180,235,255,.42),rgba(120,195,255,.16) 40%,rgba(180,235,255,.34) 100%),radial-gradient(circle at 22% 18%,rgba(255,255,255,.6),transparent 26%),radial-gradient(circle at 78% 72%,rgba(255,255,255,.5),transparent 24%); mix-blend-mode:screen; box-shadow:inset 0 0 26px rgba(180,235,255,.7); } .bf-frost-sheet::before { content:''; position:absolute; inset:0; background:repeating-linear-gradient(58deg,transparent 0 7px,rgba(255,255,255,.16) 7px 8px),repeating-linear-gradient(-58deg,transparent 0 9px,rgba(190,240,255,.14) 9px 10px); }
      .bf-frost-crack { position:absolute; inset:0; background:radial-gradient(circle at 50% 46%,transparent 38%,rgba(255,255,255,.5) 39%,transparent 41%),linear-gradient(72deg,transparent 47%,rgba(255,255,255,.55) 48%,transparent 49%),linear-gradient(-40deg,transparent 55%,rgba(220,248,255,.45) 56%,transparent 57%); opacity:.7; } .bf-frost-flake { position:absolute; color:#eaffff; font-size:15px; text-shadow:0 0 8px #8fe6ff; animation:bfFlakeFall 3.4s linear infinite; } .bf-flake-a { left:18%; top:-12%; animation-delay:0s; } .bf-flake-b { left:54%; top:-18%; font-size:12px; animation-delay:1.1s; } .bf-flake-c { left:80%; top:-10%; font-size:17px; animation-delay:2s; }
      .bf-fx-frost-burst { position:absolute; inset:-6px; z-index:5; border-radius:inherit; background:radial-gradient(circle at 50% 45%,rgba(255,255,255,.9),rgba(150,225,255,.55) 22%,rgba(120,195,255,.2) 46%,transparent 72%); animation:bfBigBlast 1s ease-out forwards; }
      /* ---- TANK MODE: a beastly armored juggernaut soaking every hit ---- */
      .bhero.s-tank { box-shadow:0 0 0 2px rgba(255,170,60,.85), 0 0 26px rgba(255,140,30,.6), inset 0 0 22px rgba(255,160,40,.25) !important; } .bhero.s-tank .bf-battle-art { filter:saturate(1.2) contrast(1.14) brightness(1.04) drop-shadow(0 0 14px rgba(255,160,40,.7)) !important; } .bf-status-tank { color:#ffb43a; } .bf-tank-shield { position:absolute; inset:0; z-index:6; pointer-events:none; border-radius:inherit; overflow:hidden; animation:bfFrostIn .4s ease-out; }
      .bf-tank-shield::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 50% 60%,rgba(255,190,80,.22),transparent 62%),linear-gradient(180deg,transparent 40%,rgba(255,150,40,.16) 100%); } .bf-tank-shield::after { content:''; position:absolute; inset:0; background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.08) 0 2px,transparent 2px 14px),repeating-linear-gradient(-45deg,rgba(0,0,0,.2) 0 2px,transparent 2px 14px); mix-blend-mode:overlay; opacity:.6; } .bf-tank-ring { position:absolute; left:50%; bottom:8px; transform:translateX(-50%); z-index:7; pointer-events:none; width:46px; height:46px; display:flex; align-items:center; justify-content:center; font-size:24px; border-radius:50%; background:radial-gradient(circle at 35% 25%,#f0f0f0,#8a8f99 42%,#2b2f36 82%); border:2.5px solid #ffb43a; box-shadow:0 0 16px rgba(255,180,60,.85), inset 0 2px 3px rgba(255,255,255,.5), inset 0 -3px 4px rgba(0,0,0,.4); filter:drop-shadow(0 0 8px #ffae3c); animation:bfTankPulse 1.9s ease-in-out infinite; } .bf-fx-tank-burst { position:absolute; inset:-6px; z-index:5; border-radius:inherit; background:radial-gradient(circle at 50% 50%,rgba(255,235,180,.92),rgba(255,170,60,.5) 26%,rgba(255,130,30,.2) 50%,transparent 74%); animation:bfBigBlast 1s ease-out forwards; } .bf-fx-iron-wall { position:absolute; inset:-12px; z-index:5; pointer-events:none; border-radius:inherit; background:repeating-linear-gradient(90deg,rgba(190,195,206,.55) 0 8px,rgba(60,64,74,.55) 8px 16px); mix-blend-mode:overlay; animation:bfIronSlam .65s cubic-bezier(.2,.9,.3,1) forwards; }
      @keyframes bfTankPulse { 0%,100%{transform:translateX(-50%) scale(1);opacity:.85} 50%{transform:translateX(-50%) scale(1.18);opacity:1} } @keyframes bfFrostIn { 0%{opacity:0;transform:scale(1.08)} 100%{opacity:1;transform:none} } @keyframes bfFlakeFall { 0%{opacity:0;transform:translateY(0) rotate(0)} 12%{opacity:1} 100%{opacity:.2;transform:translateY(150px) rotate(220deg)} } @keyframes bfIronSlam { 0%{opacity:0;transform:scale(1.35) translateY(-14px)} 35%{opacity:.95;transform:scale(1.02) translateY(0)} 100%{opacity:0;transform:scale(1)} }
      .bf-jrpg-tank { border:2px solid rgba(255,170,60,.78) !important; background:linear-gradient(135deg,rgba(60,32,8,.96),rgba(20,10,4,.98)) !important; box-shadow:0 8px 22px rgba(0,0,0,.6),inset 0 0 0 1px rgba(255,170,60,.18),0 0 18px rgba(255,140,30,.28) !important; } .bf-jrpg-tank:hover { transform:translateY(-3px) scale(1.02); box-shadow:0 10px 26px rgba(255,140,30,.5),inset 0 0 0 1px rgba(255,170,60,.3),0 0 22px rgba(255,140,30,.45) !important; } .bf-jrpg-tank.bf-tank-on { animation:bfBadgePulse 1.6s ease-in-out infinite; }
      @keyframes bfHeroIdle { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} } @keyframes bfHeroActive { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} } @keyframes bfDamageShake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-9px)} 30%{transform:translateX(8px)} 45%{transform:translateX(-6px)} 60%{transform:translateX(5px)} 80%{transform:translateX(-3px)} } @keyframes bfZap { 0%,100%{opacity:1} 50%{opacity:.62} }
      .ctb-slot { position:relative !important; min-width:112px !important; padding-left:54px !important; overflow:hidden; }
      .bf-ctb-thumb { position:absolute; left:6px; top:50%; transform:translateY(-50%); width:38px; height:38px; border-radius:50% !important; overflow:hidden; background-size:cover !important; background-repeat:no-repeat; background-color:#0a0710; border:1.5px solid rgba(255,210,74,.55) !important; outline:0 !important; box-shadow:0 4px 10px rgba(0,0,0,.34); } .bf-ctb-thumb::before { content:''; position:absolute; inset:-26%; background-image:inherit; background-size:cover; background-position:inherit; background-repeat:no-repeat; }
      .bf-shop-mana { position:absolute; top:7px; right:7px; z-index:7; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:1000; font-size:15px; color:#eaf4ff; background:radial-gradient(circle at 34% 28%,#bfe3ff,#3a8bff 46%,#103a8a); border:2px solid #8fc4ff; box-shadow:0 3px 8px rgba(0,0,0,.55), inset 0 1px 2px rgba(255,255,255,.5); text-shadow:0 1px 2px rgba(0,0,0,.5); }
      .hero-acquired { position:relative !important; min-height:76px; padding-left:78px !important; overflow:hidden; }
      .bf-acq-thumb { position:absolute; left:5px; top:5px; bottom:5px; width:66px; border-radius:11px; background-size:cover; background-position:center 18%; background-repeat:no-repeat; background-color:#0a0710; border:0 !important; outline:0 !important; box-shadow:0 5px 12px rgba(0,0,0,.45); overflow:hidden; }
      .bf-acq-thumb::before { content:''; position:absolute; inset:-26%; background-image:inherit; background-size:cover; background-position:center 18%; background-repeat:no-repeat; }
      .bf-result-thumb { position:relative; display:inline-flex; align-items:center; justify-content:center; width:46px; height:46px; border-radius:10px; margin-right:9px; flex-shrink:0; background:#0a0710 !important; border:1.5px solid rgba(255,210,74,.45) !important; outline:0 !important; box-shadow:0 4px 10px rgba(0,0,0,.38); overflow:hidden; }
      .bf-result-thumb img { position:absolute; inset:-26%; width:148%; height:148%; object-fit:cover; object-position:center 18%; display:block; border:0; outline:0; } .bf-chip-card .bf-chip-cost.bf-mana-cost { background:radial-gradient(circle at 35% 25%,#bfe3ff,#3a8bff 46%,#103a8a) !important; border-color:#8fc4ff !important; color:#eaf4ff !important; }
      .pr-got { display:flex !important; align-items:center !important; gap:8px !important; flex-wrap:nowrap !important; } .pr-got > * { vertical-align:middle; }
      .pr-box{display:flex;flex-direction:column;gap:9px;}.pr-box .pr-row{display:none !important;}.pr-verdict{margin-top:4px;padding:11px 13px;border-radius:13px;background:rgba(8,5,14,.55);border:1px solid rgba(255,210,74,.26);color:#fff7ea;font-size:13px;line-height:1.4;text-align:center;}
      .bsum-wrap{border-radius:16px;overflow:hidden;border:1.5px solid rgba(255,210,74,.4);background:linear-gradient(180deg,rgba(24,17,44,.72),rgba(12,8,22,.82));box-shadow:0 10px 28px rgba(0,0,0,.5), inset 0 0 0 1px rgba(255,210,74,.1);}.bsum-head{padding:10px 14px;font-family:'Cinzel',serif;font-weight:1000;font-size:13.5px;letter-spacing:.3px;color:#ffe49a;text-align:center;text-transform:uppercase;background:linear-gradient(180deg,rgba(255,210,74,.16),rgba(255,210,74,.04));border-bottom:1px solid rgba(255,210,74,.22);text-shadow:0 1px 3px #000;}.bsum-debtnote{margin:8px 12px 2px;padding:8px 11px;border-radius:10px;background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.4);color:#ffd2d2;font-size:11px;line-height:1.35;text-align:left;}.bsum-debtnote b{color:#ff8a8a;}.bsum-row{display:grid;grid-template-columns:54px 1fr auto;gap:12px;align-items:center;padding:12px 14px;border-bottom:1px solid rgba(255,210,74,.12);}.bsum-row:last-child{border-bottom:none;}.bsum-row-you{background:rgba(255,210,74,.06);}.bsum-thumb{width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-weight:1000;font-size:25px;color:#fff7dc;background:radial-gradient(circle at 35% 25%,rgba(255,255,255,.42),rgba(255,210,74,.18) 38%,rgba(0,0,0,.72) 72%);border:2.5px solid var(--c,#caa14a);text-shadow:0 2px 4px #000,0 0 10px var(--c,#caa14a);box-shadow:0 4px 12px rgba(0,0,0,.5),0 0 14px color-mix(in srgb, var(--c,#caa14a) 40%, transparent);}.bsum-thumb.bsum-thumb-img{background-size:145% !important;background-position:center 20% !important;background-color:#0a0710 !important;background-repeat:no-repeat !important;}.bsum-main{min-width:0;display:flex;flex-direction:column;gap:4px;}.bsum-player{font-family:'Cinzel',serif;font-weight:1000;font-size:13.5px;color:#fff5dc;display:flex;align-items:center;gap:7px;}.bsum-you{font-family:'Rubik',sans-serif;font-size:9px;font-weight:900;letter-spacing:.4px;color:#3a2600;background:linear-gradient(180deg,#ffe27a,#FFD24A 55%,#c8901f);padding:1px 7px;border-radius:999px;}.bsum-rival{font-family:'Rubik',sans-serif;font-size:9px;font-weight:900;letter-spacing:.4px;color:#cfc6dd;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);padding:1px 7px;border-radius:999px;}.bsum-hero{font-size:13px;font-weight:800;color:#ffe49a;line-height:1.2;}.bsum-hero.bsum-pass{color:#cbb9ee;font-style:italic;font-weight:600;}.bsum-bonus{display:flex;flex-wrap:wrap;gap:4px;margin-top:1px;}.bsum-tag{font-size:10px;font-weight:900;padding:2px 8px;border-radius:999px;line-height:1.3;white-space:nowrap;}.bsum-add{color:#0e2a17;background:linear-gradient(180deg,#8cf2a6,#33d65f);}.bsum-sub{color:#fff;background:linear-gradient(180deg,#ff8a8a,#e0322f);}.bsum-none{color:#bdae87;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);}.bsum-cost{text-align:right;line-height:1.15;}.bsum-cost-raw{font-size:10px;font-weight:700;color:#cfc6dd;}.bsum-cost-fin{font-family:'Cinzel',serif;font-size:19px;font-weight:1000;color:#ffd24a;text-shadow:0 2px 5px #000,0 0 12px rgba(255,210,74,.35);}.bsum-cost-lbl{font-size:8.5px;font-weight:900;letter-spacing:.4px;text-transform:uppercase;color:#bdae87;}.bsum-cost-pass{font-size:22px;color:#6b5e8a;text-align:right;}.bsum-flag{font-size:18px;}.bsum-win{color:#54e876;text-shadow:0 0 8px rgba(84,232,118,.6);}
      .bhero.bf-fx-damage { animation:bfDamageShake .5s ease-in-out 1 !important; box-shadow:0 0 0 2px rgba(255,72,66,.60),0 0 22px rgba(255,72,66,.42) !important; }
      .bhero.bf-fx-heal { animation:bfHealPulse .9s ease-out 1 !important; box-shadow:0 0 0 2px rgba(81,255,138,.70),0 0 26px rgba(81,255,138,.48), inset 0 0 18px rgba(81,255,138,.24) !important; }
      .bhero.bf-fx-paralyze { animation:bfParalyzeJolt .8s steps(2,end) 1 !important; box-shadow:0 0 0 2px rgba(255,210,74,.75),0 0 28px rgba(255,210,74,.55) !important; }
      .bf-combat-fx { position:absolute; inset:0; z-index:4; pointer-events:none; overflow:hidden; border-radius:inherit; }
      .bf-fx-float { position:absolute; left:50%; top:42%; transform:translate(-50%,-50%); font-family:'Cinzel',serif; font-weight:1000; font-size:34px; letter-spacing:.4px; text-shadow:0 3px 8px #000,0 0 16px currentColor; animation:bfFloatHit 1.5s ease-out forwards; }
      .bf-fx-dmg { color:#ff4b45; }
      .bf-fx-heal-txt { color:#51ff8a; }
      .bf-fx-status-txt { color:#ffd24a; font-size:24px; top:35%; }
      .bf-fx-slash { position:absolute; left:18px; right:12px; top:50%; height:5px; border-radius:999px; background:linear-gradient(90deg,transparent,#fff,#ff3b35,transparent); transform:rotate(-18deg) scaleX(0); box-shadow:0 0 22px #ff3b35; animation:bfSlash .7s ease-out forwards; }
      .bf-fx-heal-ring { position:absolute; left:18px; top:14px; width:82px; height:82px; border-radius:50%; border:3px solid rgba(81,255,138,.9); box-shadow:0 0 18px #51ff8a,inset 0 0 14px rgba(81,255,138,.45); animation:bfHealRing 1.3s ease-out forwards; }
      .bf-fx-bolt { position:absolute; left:22px; top:6px; color:#ffd24a; font-size:60px; line-height:1; filter:drop-shadow(0 0 12px #ffd24a); animation:bfBolt 1.2s ease-out forwards; }
      .fx-ring-heal { box-shadow:0 0 24px #51ff8a, inset 0 0 18px #51ff8a !important; }
      .fx-burst { mix-blend-mode:screen; filter:blur(.2px) saturate(1.4); }
      .fx-status, .fx-word, .fx-dmg { text-shadow:0 2px 6px #000,0 0 12px currentColor !important; font-weight:1000 !important; }
      @keyframes bfHealPulse { 0%{transform:scale(1)} 45%{transform:scale(1.05)} 100%{transform:scale(1)} } @keyframes bfParalyzeJolt { 0%,100%{transform:translateX(0)} 18%{transform:translateX(-5px) skewX(-3deg)} 36%{transform:translateX(6px) skewX(3deg)} 54%{transform:translateX(-4px)} 72%{transform:translateX(4px)} } @keyframes bfFloatHit { 0%{opacity:0;transform:translate(-50%,-22%) scale(.7)} 16%{opacity:1;transform:translate(-50%,-52%) scale(1.22)} 30%{transform:translate(-50%,-50%) scale(1)} 100%{opacity:0;transform:translate(-50%,-118%) scale(.92)} } @keyframes bfSlash { 0%{opacity:0;transform:rotate(-18deg) scaleX(0)} 30%{opacity:1;transform:rotate(-18deg) scaleX(1.08)} 100%{opacity:0;transform:rotate(-18deg) scaleX(1.3)} } @keyframes bfHealRing { 0%{opacity:0;transform:scale(.35)} 25%{opacity:1} 100%{opacity:0;transform:scale(1.8)} }
      .bhero.bf-dead { filter:saturate(.35) brightness(.66); }
      .bhero.bf-auto-elite .bf-battle-art { filter:saturate(1.35) contrast(1.14) drop-shadow(0 0 14px #ffd24a) !important; }
      .bf-fx-death-smoke { position:absolute; left:0; right:0; bottom:-20px; height:110px; background:radial-gradient(circle at 45% 70%,rgba(15,15,18,.88),rgba(90,38,120,.36) 38%,transparent 72%); animation:bfDeathSmoke 1.1s ease-out forwards; }
      .bf-fx-skull { position:absolute; left:50%; top:38%; transform:translate(-50%,-50%); font-size:44px; filter:drop-shadow(0 0 15px #000); animation:bfSkullRise 1.05s ease-out forwards; }
      .bf-fx-phoenix { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); font-size:58px; filter:drop-shadow(0 0 16px #ff8a2a); animation:bfPhoenix .95s ease-out forwards; }
      .bf-fx-elite-aura { position:absolute; inset:-8px; border-radius:inherit; background:radial-gradient(circle,rgba(255,210,74,.34),rgba(176,108,255,.20) 36%,transparent 70%); animation:bfEliteAura 1.1s ease-out forwards; }
      .bf-fx-projectile { position:fixed; z-index:9999; pointer-events:none; font-size:38px; filter:drop-shadow(0 0 12px currentColor); transition:left .55s cubic-bezier(.17,.84,.44,1), top .55s cubic-bezier(.17,.84,.44,1); }
      .bf-fx-bullet { color:#ffe49a; }
      .bf-fx-arrow-proj { color:#c6ff8a; }
      .bf-fx-magic-orb { position:fixed; z-index:9999; pointer-events:none; width:40px; height:40px; border-radius:50%; box-shadow:0 0 26px currentColor; background:radial-gradient(circle,#fff,currentColor 44%,transparent 72%); transition:left .65s ease, top .65s ease, transform .65s ease; }
      .bf-fx-spell-wave { position:absolute; left:50%; top:50%; width:34px; height:34px; border-radius:50%; border:3px solid currentColor; transform:translate(-50%,-50%) scale(.2); box-shadow:0 0 20px currentColor,inset 0 0 18px currentColor; animation:bfSpellWave 1.2s ease-out forwards; }
      .bf-fx-bigblast { position:absolute; inset:-10px; border-radius:inherit; background:radial-gradient(circle at 50% 45%,rgba(255,255,255,.9),rgba(255,77,60,.62) 18%,rgba(255,143,42,.26) 42%,transparent 72%); animation:bfBigBlast 1.1s ease-out forwards; }
      .bf-race-list { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:12px; margin-top:12px; }
      .bf-race-card { position:relative; min-height:168px; overflow:hidden; border-radius:16px; padding:14px; border:1.5px solid var(--race,#ffd24a); background:radial-gradient(circle at 22% 14%,color-mix(in srgb,var(--race,#ffd24a) 34%,transparent),transparent 36%),linear-gradient(145deg,#120d1d,#261d3d); box-shadow:0 10px 26px rgba(0,0,0,.38), inset 0 0 0 1px rgba(255,255,255,.06); }
      .bf-race-card::before { content:''; position:absolute; right:-28px; top:-22px; width:132px; height:132px; border-radius:50%; background:radial-gradient(circle,color-mix(in srgb,var(--race,#ffd24a) 32%,transparent),transparent 66%); filter:blur(1px); }
      .bf-race-sigil-big { position:relative; z-index:1; width:58px; height:58px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff7dc; font-family:'Cinzel',serif; font-size:32px; font-weight:1000; background:radial-gradient(circle at 35% 25%,rgba(255,255,255,.42),rgba(255,210,74,.18) 38%,rgba(0,0,0,.72) 72%); border:2px solid var(--race,#ffd24a); text-shadow:0 2px 4px #000,0 0 12px var(--race,#ffd24a); box-shadow:0 5px 16px rgba(0,0,0,.55); } .bf-race-sigil-big svg { width:34px; height:34px; display:block; } .bsum-thumb svg { width:30px; height:30px; display:block; }
      .bf-race-title { position:relative; z-index:1; margin-top:10px; font-family:'Cinzel',serif; font-size:20px; font-weight:1000; color:#fff5dc; text-shadow:0 2px 5px #000; }
      .bf-race-trait { position:relative; z-index:1; margin-top:4px; color:#ffe49a; font-weight:800; font-size:12.5px; line-height:1.25; }
      .bf-race-desc { position:relative; z-index:1; margin-top:7px; color:#efe9dc; font-size:13px; line-height:1.28; }
      .bf-race-stats { position:relative; z-index:1; margin-top:8px; color:#cfc6dd; font-size:11px; line-height:1.25; background:rgba(0,0,0,.28); border:1px solid rgba(255,255,255,.08); border-radius:9px; padding:7px; }
      /* Shop card = the oracle card itself. Card proportion + cover with a tiny
         overscan to eat the white border the source images carry. */
      .shop-card { position:relative; overflow:hidden; }
      /* Foil / holographic effect for special spell cards (Transformer) */
      .bf-foil-card { border-color: rgba(255,233,168,.67) !important; box-shadow:0 10px 28px rgba(0,0,0,.65), 0 0 14px rgba(255,225,150,.32) !important; }
      .bf-foil-card::before { content:''; position:absolute; inset:0; z-index:6; pointer-events:none; border-radius:inherit; mix-blend-mode:soft-light; opacity:.4; background:linear-gradient(125deg,#ffd24a,#ff7adf 18%,#7ad6ff 38%,#9dff8a 56%,#ffe27a 72%,#ff7adf 88%,#ffd24a); background-size:300% 300%; animation:bfFoilShift 9s linear infinite; }
      .bf-foil-shine { position:absolute; inset:0; z-index:7; pointer-events:none; border-radius:inherit; opacity:.6; background:linear-gradient(110deg, transparent 42%, rgba(255,255,255,.35) 49%, rgba(255,255,255,.5) 50%, rgba(255,255,255,.35) 51%, transparent 58%); background-size:250% 250%; mix-blend-mode:screen; animation:bfFoilShine 5.5s ease-in-out infinite; }
      @keyframes bfFoilShine { 0%{background-position:120% 0%} 100%{background-position:-40% 0%} }
      .shop-card.has-art { background:#07050b !important; aspect-ratio:3 / 4.1 !important; min-height:0 !important; height:auto !important; width:100% !important; max-width:168px !important; min-width:0 !important; margin:0 auto !important; padding:0 !important; border:1.5px solid rgba(255,210,74,.45) !important; border-radius:12px !important; }
      /* Shop containers: compact responsive grid so ALL cards fit on screen */
      #s-equip *:has(> .shop-card.has-art), #modalRoot *:has(> .shop-card.has-art) { display:grid !important; grid-template-columns:repeat(auto-fill,minmax(128px,1fr)) !important; gap:10px !important; align-items:start !important; justify-items:center !important; }
      .shop-card.has-art > *:not(.shop-card-art-sharp):not(.shop-card-fill):not(.bf-view-btn):not(.bf-buy-btn):not(.bf-shop-name):not(.bf-shop-txt):not(.bf-shop-num):not(.bf-logo):not(.shop-coin):not(.bf-shop-mana) { display:none !important; }
      .shop-card.has-art > .shop-coin { z-index: 7 !important; }
      .shop-card-art { display:none !important; }
      .shop-card-fill { position:absolute; inset:0; z-index:0; background-size:cover; background-position:center; filter:blur(16px) saturate(1.3) brightness(.85); transform:scale(1.35); }
      .shop-card-art-sharp { position:absolute; inset:-7%; z-index:1; background-size:cover; background-position:center center; background-repeat:no-repeat; }
      /* Hand cards (spells/objects) — the WHOLE oracle card shown, no cropping */
      .chip.bf-chip-card { position:relative !important; width:88px !important; height:120px !important; aspect-ratio:3 / 4.1 !important; padding:0 !important; border-radius:9px !important; overflow:hidden !important; border:1.5px solid rgba(255,210,74,.55) !important; background:#07050b !important; box-shadow:0 4px 12px rgba(0,0,0,.55) !important; font-size:0 !important; line-height:0 !important; display:inline-block !important; vertical-align:top !important; cursor:pointer; transition:transform .14s ease, box-shadow .14s ease; }
      .chip.bf-chip-card:hover { transform:translateY(-5px) scale(1.05); box-shadow:0 10px 22px rgba(0,0,0,.6), 0 0 16px rgba(255,210,74,.4) !important; z-index:5; }
      .chip.bf-chip-card .bf-chip-fill { display:block; position:absolute; inset:0; z-index:0; background-size:cover; background-position:center; filter:blur(14px) saturate(1.3) brightness(.85); transform:scale(1.35); }
      .chip.bf-chip-card .bf-chip-art-layer { position:absolute; inset:-16%; z-index:1; background-size:cover; background-position:center; background-repeat:no-repeat; }
      .chip.bf-chip-card .bf-chip-info { position:absolute; left:0; right:0; bottom:0; z-index:3; padding:2px 3px 3px; font-size:7.5px !important; line-height:1.1; font-weight:800; font-family:'Rubik',sans-serif; color:#cfeaff; text-align:center; text-shadow:0 1px 2px #000,0 0 4px #000; background:linear-gradient(0deg,rgba(4,8,16,.95),rgba(4,8,16,.6) 70%,transparent); white-space:normal; }
      .chip.bf-chip-card.bf-chip-has-info .bf-chip-name { bottom:auto; top:0; background:linear-gradient(180deg,rgba(8,5,14,.92),rgba(8,5,14,.55) 60%,transparent); }
      .chip.bf-chip-card .bf-chip-x { position:absolute !important; top:4px; right:4px; z-index:4; width:22px; height:22px; padding:0; border-radius:50%; background:linear-gradient(180deg,#ff6a6a,#e0322f 60%,#a01210); border:1.5px solid #ffb0ad; color:#fff; font-size:0; line-height:1; font-weight:1000; display:inline-flex; align-items:center; justify-content:center; gap:0; cursor:pointer; box-shadow:0 3px 9px rgba(224,50,47,.5), inset 0 1px 1px rgba(255,255,255,.4); transition:transform .12s ease, filter .12s ease; }
      .chip.bf-chip-card .bf-chip-x::before { content:'✕'; font-size:13px; line-height:1; text-shadow:0 1px 2px rgba(0,0,0,.6); }
      .chip.bf-chip-card .bf-chip-x::after { display:none; }
      .chip.bf-chip-card .bf-chip-x:hover { filter:brightness(1.1); transform:scale(1.06); }
      .chip.bf-chip-card .bf-chip-x:active { transform:scale(.94); }
      .chip.bf-chip-card .bf-chip-cost { position:absolute !important; top:4px; left:4px; z-index:3; width:28px; height:28px; border-radius:50%; background:radial-gradient(circle at 35% 25%,#fff2a7,#ff7a22 32%,#8c1108); border:2px solid #ffc444; color:#1a0a00; font-size:12px; line-height:1; font-weight:900; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,.6); }
      .chip.bf-chip-card.bf-chip-has-info .bf-chip-cost { top: 22px; }
      .chip.bf-chip-card.bf-chip-has-info .bf-chip-x { top: 22px; }
      .chip.bf-chip-card .bf-chip-play { position:absolute !important; top:72%; left:50%; transform:translate(-50%,-50%); z-index:3; width:32px; height:32px; border-radius:50%; background:linear-gradient(180deg,#51ff8a,#2cdd5f); border:1px solid #1fb84a; color:#0a1f0f; font-size:16px; font-weight:900; display:none; align-items:center; justify-content:center; cursor:pointer; padding:0; box-shadow:0 3px 10px rgba(81,255,138,.4); transition:all .12s ease; }
      .chip.bf-chip-card .bf-chip-play.bf-show { display:flex; }
      .chip.bf-chip-card .bf-chip-play:hover { transform:translate(-50%,-50%) scale(1.1); box-shadow:0 5px 14px rgba(81,255,138,.6); }
      .chip.bf-chip-card .bf-chip-play:active { transform:translate(-50%,-50%) scale(.95); }
      .chip.bf-chip-card .bf-chip-zoom { position:absolute !important; top:45%; left:50%; transform:translate(-50%,-50%); z-index:3; width:32px; height:32px; border-radius:50%; background:rgba(0,0,0,.6); border:1px solid rgba(255,210,74,.5); color:#ffe49a; font-size:14px; display:flex; align-items:center; justify-content:center; cursor:pointer; padding:0; transition:all .12s ease; box-shadow:0 3px 8px rgba(0,0,0,.5); }
      .chip.bf-chip-card .bf-chip-zoom:hover { background:rgba(255,210,74,.3); transform:translate(-50%,-50%) scale(1.15); }
      .chip.bf-chip-card .bf-chip-name { position:absolute; left:0; right:0; bottom:0; z-index:2; padding:3px 4px 4px; font-size:8.5px !important; line-height:1.04; font-weight:900; font-family:'Cinzel',serif; color:#fff5dc; text-align:center; text-transform:uppercase; letter-spacing:.1px; text-shadow:0 1px 2px #000,0 0 6px #000; background:linear-gradient(0deg,rgba(8,5,14,.92),rgba(8,5,14,.55) 60%,transparent); white-space:normal; }
      .eq-hero.bf-eq-hero-with-art { position:relative !important; min-height:176px; padding-left:150px !important; overflow:hidden; border-radius:14px; animation:bfHeroIdle 3.8s ease-in-out infinite; transition:box-shadow .25s ease, transform .2s ease; } .eq-hero.bf-eq-hero-with-art:hover { transform:translateY(-3px); box-shadow:0 10px 26px rgba(0,0,0,.5), 0 0 20px rgba(255,210,74,.28); } .eq-hero.bf-eq-hero-with-art.bf-epic-gold { border:3px solid #FFD24A !important; animation:bfHeroIdle 3.8s ease-in-out infinite, bfGoldGlowB 2.4s ease-in-out infinite !important; }
      .eq-hero.bf-eq-hero-with-art > *:not(.bf-eq-hero-art) { position:relative; z-index:2; }
      .bf-eq-hero-art { position:absolute; left:-22px; top:-18px; bottom:-18px; width:216px; z-index:1; background-size:cover; background-position:center 10%; background-repeat:no-repeat; background-color:#0a0710; filter:saturate(1.14) contrast(1.1); cursor:pointer; transition:filter .3s ease; } .eq-hero.bf-eq-hero-with-art:hover .bf-eq-hero-art { filter:saturate(1.28) contrast(1.16) brightness(1.06); }
      .bf-eq-hero-art::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.04) 48%,rgba(21,16,31,.95) 100%); }
      /* Equipped item thumbnail inside a filled slot (no number) */
      .eq-slot.bf-slot-art { position:relative; padding-left:54px !important; min-height:50px; display:flex; align-items:center; }
      .bf-slot-thumb { position:absolute; left:6px; top:50%; transform:translateY(-50%); width:42px; height:42px; border-radius:8px; background-size:158%; background-position:center 20%; border:1.5px solid rgba(255,210,74,.45); box-shadow:0 3px 8px rgba(0,0,0,.5); cursor:pointer; transition:transform .12s ease; background-color:#0a0710; }
      .bf-slot-thumb:hover { border-color:#ffd24a; transform:translateY(-50%) scale(1.15); z-index:10; }
      .bf-slot-zoom { position:absolute; bottom:-4px; right:-4px; font-size:10.5px; background:rgba(0,0,0,.8); border-radius:50%; width:18px; height:18px; display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,210,74,.6); color:#ffe49a; box-shadow:0 1px 3px rgba(0,0,0,.8); pointer-events:none; }
      .bf-quick-num { position:absolute; top:8px; right:8px; z-index:3; font-size:9px; font-weight:900; color:#ffe7a8; background:rgba(0,0,0,.7); border:1px solid rgba(255,210,74,.32); border-radius:999px; padding:2px 7px; } .eq-slot.bf-slot-empty { display:flex; align-items:center; justify-content:space-between; gap:8px; }
      .bf-slot-buy { border:1px solid rgba(255,210,74,.55); background:rgba(255,210,74,.12); color:#ffe49a; border-radius:999px; padding:4px 9px; font-size:10.5px; font-weight:900; cursor:pointer; white-space:nowrap; }
      .bf-slot-buy:hover { background:rgba(255,210,74,.22); }
      .bf-quick-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:10px; margin-top:12px; }
      /* Quick-shop card = the oracle card itself (cover + overscan + card ratio). */
      .bf-quick-card { position:relative; overflow:hidden; aspect-ratio:3 / 4.1; border-radius:13px; border:1.5px solid rgba(255,210,74,.42); background:#07050b; padding:0; cursor:pointer; box-shadow:0 8px 20px rgba(0,0,0,.38); }
      .bf-quick-fill { display:block; position:absolute; inset:0; z-index:0; background-size:cover; background-position:center; filter:blur(16px) saturate(1.3) brightness(.85); transform:scale(1.35); }
      .bf-quick-art { position:absolute; inset:-8%; z-index:1; background-size:cover; background-position:center; background-repeat:no-repeat; }
      .bf-quick-card > *:not(.bf-quick-art):not(.bf-quick-fill):not(.bf-quick-cost):not(.bf-quick-name):not(.bf-quick-txt) { display:none !important; }
      .bf-quick-cost { position:absolute; top:8px; left:8px; z-index:4; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at 34% 28%,#fff0ae,#FFD24A 45%,#b77614); border:2px solid #6f4809; color:#4a2e03; font-weight:1000; box-shadow:0 3px 8px rgba(0,0,0,.55); }
      .bf-quick-name { position:absolute; left:5px; right:5px; bottom:42px; z-index:4; text-align:center; font-family:'Cinzel',serif; font-weight:1000; font-size:12.5px; line-height:1.05; color:#fff5dc; text-transform:uppercase; letter-spacing:.2px; text-shadow:0 2px 5px #000,0 0 10px #000; padding:2px 5px; border-radius:7px; background:linear-gradient(90deg,rgba(0,0,0,0),rgba(0,0,0,.55),rgba(0,0,0,0)); }
      .bf-quick-txt { position:absolute; left:5px; right:5px; bottom:5px; z-index:4; padding:4px 6px; border-radius:7px; background:rgba(8,5,14,.86); border:1px solid rgba(255,210,74,.3); color:#fff7ea; font-size:9px; font-weight:700; line-height:1.2; text-align:center; max-height:34px; overflow:hidden; text-shadow:0 1px 2px #000; }
      /* In-game styled confirm dialog */
      .bf-confirm-overlay { position:fixed; inset:0; z-index:100000; display:flex; align-items:center; justify-content:center; padding:20px; background:radial-gradient(circle at 50% 40%,rgba(20,12,34,.72),rgba(8,5,14,.9)); backdrop-filter:blur(4px); animation:bfFadeIn .2s ease; }
      .bf-confirm-box { width:min(360px,92vw); border-radius:18px; overflow:hidden; border:2px solid rgba(255,210,74,.55); background:linear-gradient(180deg,#1b1430,#120d22); box-shadow:0 18px 50px rgba(0,0,0,.7),0 0 30px rgba(255,210,74,.18), inset 0 0 0 1px rgba(255,210,74,.12); animation:bfPopIn .26s cubic-bezier(.2,.8,.3,1); }
      .bf-confirm-art { position:relative; width:100%; aspect-ratio:3 / 4.1; max-height:320px; overflow:hidden; background:#07050b; }
      .bf-confirm-art .bf-confirm-art-fill { position:absolute; inset:-20%; background-image:var(--bf-cart); background-size:cover; background-position:center; background-repeat:no-repeat; filter:blur(16px) saturate(1.3) brightness(.85); z-index:0; }
      .bf-confirm-art .bf-confirm-art-sharp { position:absolute; inset:-7%; background-image:var(--bf-cart); background-size:cover; background-position:center center; background-repeat:no-repeat; z-index:1; }
      .bf-confirm-mana { position:absolute; top:10px; right:10px; z-index:4; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:1000; font-size:17px; color:#eaf4ff; background:radial-gradient(circle at 34% 28%,#bfe3ff,#3a8bff 46%,#103a8a); border:2px solid #8fc4ff; box-shadow:0 4px 10px rgba(0,0,0,.55), inset 0 1px 2px rgba(255,255,255,.5); text-shadow:0 1px 2px rgba(0,0,0,.5); }
      .bf-confirm-art::after { display:none; } .bf-confirm-art .bf-confirm-cost, .bf-confirm-art .bf-confirm-num { z-index:3; }
      /* "Ver carta" button on every shop card */
      .bf-view-btn { position:absolute; bottom:7px; left:50%; transform:translateX(-50%); z-index:6; border:1px solid rgba(255,210,74,.6); background:rgba(8,5,14,.78); color:#ffe49a; border-radius:999px; padding:4px 12px; font-size:10.5px; font-weight:900; cursor:pointer; white-space:nowrap; backdrop-filter:blur(2px); transition:background .12s ease; }
      .bf-view-btn:hover { background:rgba(255,210,74,.22); color:#fff5dc; }
      /* "Comprar" button on every shop card — SIEMPRE anclado al pie de la carta */
      .bf-buy-btn, .shop-card .bf-buy-btn, .shop-card.has-art > .bf-buy-btn { position:absolute !important; top:auto !important; bottom:7px !important; left:50% !important; right:auto !important; transform:translateX(-50%) !important; margin:0 !important; z-index:8 !important; border:1px solid #ffd24a; background:linear-gradient(180deg,#ffe27a,#FFD24A 55%,#c8901f); color:#3a2600; border-radius:999px; padding:5px 14px; font-size:11px; font-weight:900; cursor:pointer; white-space:nowrap; box-shadow:0 4px 12px rgba(255,210,74,.4); transition:filter .12s ease; display:inline-block !important; }
      .bf-buy-btn:hover { filter:brightness(1.08); }
      /* Card name (stylized) over a shop card image */
      .bf-shop-name { position:absolute; left:6px; right:6px; bottom:92px; z-index:6; text-align:center; font-family:'Cinzel',serif; font-weight:1000; font-size:13px; line-height:1.05; color:#fff5dc; text-transform:uppercase; letter-spacing:.3px; text-shadow:0 2px 5px #000,0 0 12px #000; padding:3px 6px; border-radius:8px; background:linear-gradient(90deg,rgba(0,0,0,0),rgba(0,0,0,.55),rgba(0,0,0,0)); }
      /* Card text strip near the bottom of a shop card image */
      .bf-shop-txt { position:absolute; left:8px; right:8px; bottom:46px; z-index:5; padding:5px 8px; border-radius:8px; background:rgba(8,5,14,.85); border:1px solid rgba(255,210,74,.28); color:#fff7ea; font-size:9.5px; font-weight:700; line-height:1.22; text-align:center; max-height:46px; overflow:hidden; backdrop-filter:blur(2px); text-shadow:0 1px 2px #000; }
      .shop-card.has-art { padding-bottom:34px !important; }
      /* Full-size card view modal */
      .bf-view-wrap { display:flex; justify-content:center; padding:6px 0; }
      .bf-view-card { position:relative; width:min(320px,86vw); aspect-ratio:3/4.1; border-radius:18px; overflow:hidden; border:2.5px solid #caa14a; background:#07050b; box-shadow:0 14px 36px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,210,74,.14); }
      .bf-view-card .bf-view-fill { display:none; }
      .bf-view-card .bf-view-art { position:absolute; inset:-15%; background-image:var(--bf-art); background-size:cover; background-position:center; background-repeat:no-repeat; z-index:1; }
      .bf-view-card .bf-view-shade { position:absolute; inset:0; z-index:2; background:linear-gradient(180deg,rgba(0,0,0,.12) 0%,rgba(0,0,0,0) 40%,rgba(0,0,0,.86) 100%); }
      .bf-view-coin { position:absolute; top:11px; left:11px; z-index:4; width:46px; height:46px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:1000; color:#4a2e03; font-size:19px; background:radial-gradient(circle at 34% 28%,#fff0ae,#FFD24A 45%,#b77614); border:2px solid #6f4809; box-shadow:0 4px 10px rgba(0,0,0,.6); }
      .bf-view-num { position:absolute; top:14px; right:11px; z-index:4; font-size:9.5px; font-weight:900; color:#ffe7a8; background:rgba(0,0,0,.66); border:1px solid rgba(255,210,74,.34); border-radius:999px; padding:3px 9px; }
      .bf-view-tag { position:absolute; top:44px; right:11px; z-index:4; font-size:9.5px; font-weight:900; color:#fff; background:rgba(124,84,16,.85); border:1px solid rgba(255,210,74,.4); border-radius:999px; padding:3px 9px; }
      .bf-view-info { position:absolute; left:13px; right:13px; bottom:13px; z-index:4; text-align:center; }
      .bf-view-name { font-family:'Cinzel',serif; font-weight:1000; font-size:22px; color:#fff5dc; text-shadow:0 2px 6px #000,0 0 14px #000; }
      .bf-view-stat { display:inline-block; margin-top:6px; font-size:12px; font-weight:900; color:#ffe49a; background:rgba(0,0,0,.6); border:1px solid rgba(255,210,74,.3); border-radius:999px; padding:3px 11px; }
      .bf-view-txt { margin-top:8px; font-size:13px; font-weight:700; line-height:1.32; color:#fff7ea; text-shadow:0 2px 4px #000; }
      .bf-view-set { margin-top:9px; font-size:8.5px; font-weight:900; letter-spacing:.4px; color:#bdae87; }
      .bf-confirm-cost { position:absolute; top:10px; left:10px; z-index:2; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:1000; color:#5a3d06; background:radial-gradient(circle at 34% 28%,#fff0ae,#FFD24A 45%,#b77614); border:2px solid #6f4809; box-shadow:0 4px 10px rgba(0,0,0,.55); }
      .bf-confirm-num { position:absolute; top:12px; right:10px; z-index:2; font-size:9px; font-weight:900; color:#ffe7a8; background:rgba(0,0,0,.7); border:1px solid rgba(255,210,74,.32); border-radius:999px; padding:3px 8px; }
      .bf-confirm-body { padding:4px 18px 18px; text-align:center; }
      .bf-confirm-name { font-family:'Cinzel',serif; font-weight:1000; font-size:19px; color:#fff5dc; text-shadow:0 2px 6px #000; margin-top:6px; position:relative; z-index:2; }
      .bf-confirm-effect { margin-top:8px; padding:8px 11px; border-radius:10px; background:rgba(8,5,14,.6); border:1px solid rgba(255,210,74,.3); color:#fff7ea; font-size:12.5px; font-weight:700; line-height:1.34; text-shadow:0 1px 2px #000; }
      .bf-confirm-msg { color:#cfc6dd; font-size:13px; line-height:1.35; margin-top:8px; }
      .bf-confirm-msg b { color:#ffe49a; }
      .bf-confirm-actions { display:flex; gap:10px; margin-top:16px; }
      .bf-confirm-btn { flex:1; border-radius:11px; padding:11px 10px; font-family:'Cinzel',serif; font-weight:900; font-size:14px; cursor:pointer; border:none; transition:transform .12s ease,filter .12s ease; }
      .bf-confirm-btn:active { transform:scale(.96); }
      .bf-confirm-yes { color:#3a2600; background:linear-gradient(180deg,#ffe27a,#FFD24A 55%,#c8901f); box-shadow:0 5px 14px rgba(255,210,74,.32); }
      .bf-confirm-yes:hover { filter:brightness(1.08); }
      .bf-confirm-no { color:#efe9dc; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.18); }
      .bf-confirm-no:hover { background:rgba(255,255,255,.12); }
      @keyframes bfFadeIn { from{opacity:0} to{opacity:1} } @keyframes bfPopIn { from{opacity:0;transform:translateY(14px) scale(.94)} to{opacity:1;transform:none} } @keyframes bfDeathSmoke { 0%{opacity:0;transform:translateY(22px) scale(.8)} 35%{opacity:1} 100%{opacity:0;transform:translateY(-18px) scale(1.22)} } @keyframes bfSkullRise { 0%{opacity:0;transform:translate(-50%,-18%) scale(.7)} 25%{opacity:1;transform:translate(-50%,-50%) scale(1.1)} 100%{opacity:0;transform:translate(-50%,-112%) scale(.9)} }
      @keyframes bfPhoenix { 0%{opacity:0;transform:translate(-50%,10%) scale(.45) rotate(-12deg)} 35%{opacity:1;transform:translate(-50%,-50%) scale(1.15) rotate(6deg)} 100%{opacity:0;transform:translate(-50%,-110%) scale(.95) rotate(0)} } @keyframes bfEliteAura { 0%{opacity:0;transform:scale(.75) rotate(0)} 35%{opacity:1} 100%{opacity:0;transform:scale(1.25) rotate(18deg)} } @keyframes bfSpellWave { 0%{opacity:0;transform:translate(-50%,-50%) scale(.2)} 25%{opacity:1} 100%{opacity:0;transform:translate(-50%,-50%) scale(3.6)} } @keyframes bfBigBlast { 0%{opacity:0;transform:scale(.5)} 35%{opacity:1;transform:scale(1.08)} 100%{opacity:0;transform:scale(1.3)} } @keyframes bfBolt { 0%{opacity:0;transform:translateY(-10px) scale(.6)} 20%{opacity:1;transform:translateY(0) scale(1.14)} 100%{opacity:0;transform:translateY(12px) scale(.95)} }
      /* ---- ÉLITE in battle: flip the portrait + golden glow ---- */
      .bhero.bf-auto-elite .bf-battle-art { transform: scaleX(-1); filter: saturate(1.3) contrast(1.14) drop-shadow(0 0 14px #ffd24a) !important; transition: transform .55s cubic-bezier(.2,.8,.3,1), filter .4s ease; }
      .bhero.bf-auto-elite { box-shadow: 0 0 0 2px rgba(255,176,0,.6), 0 0 22px rgba(255,176,0,.4) !important; }
      .bf-fx-elite-flip { position:absolute; inset:0; z-index:5; pointer-events:none; background:radial-gradient(circle at 50% 45%,rgba(255,210,74,.55),rgba(255,176,0,.15) 45%,transparent 72%); animation:bfEliteFlash .6s ease-out forwards; }
      @keyframes bfEliteFlash { 0%{opacity:0} 30%{opacity:1} 100%{opacity:0} }
      .bhero.bf-transforming { animation:bfTransformShake .9s ease-in-out; } .bhero.bf-transforming .bf-battle-art { animation:bfTransformBlur .9s ease-in-out; } .bf-fx-transform-ring { position:absolute; inset:-6px; z-index:5; pointer-events:none; border-radius:inherit; background:radial-gradient(circle at 50% 50%,rgba(199,155,255,.65),rgba(138,61,240,.28) 42%,transparent 72%); animation:bfTransformRing 1.3s ease-out forwards; } .bf-fx-transform-q { position:absolute; left:50%; top:46%; transform:translate(-50%,-50%); z-index:6; font-family:'Cinzel',serif; font-weight:1000; font-size:66px; color:#f0e2ff; text-shadow:0 0 18px #c79bff,0 3px 8px #000; animation:bfTransformQ 1.3s cubic-bezier(.2,.8,.3,1) forwards; } @keyframes bfTransformRing { 0%{opacity:0;transform:scale(.4) rotate(0)} 25%{opacity:1} 100%{opacity:0;transform:scale(1.7) rotate(180deg)} } @keyframes bfTransformQ { 0%{opacity:0;transform:translate(-50%,-50%) scale(.3) rotate(-20deg)} 35%{opacity:1;transform:translate(-50%,-50%) scale(1.25) rotate(12deg)} 65%{transform:translate(-50%,-50%) scale(1) rotate(-6deg)} 100%{opacity:0;transform:translate(-50%,-110%) scale(.9)} } @keyframes bfTransformShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px) rotate(-3deg)} 40%{transform:translateX(7px) rotate(3deg)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} } @keyframes bfTransformBlur { 0%{filter:none} 45%{filter:blur(6px) saturate(2) hue-rotate(60deg)} 100%{filter:none} }
      /* ---- Equipped weapons/armor thumbnails on battle heroes ---- */
      .bhero .bf-battle-gear { position:absolute; left:6px; bottom:6px; z-index:6; display:flex; flex-direction:row; gap:5px; padding:3px; border-radius:10px; background:rgba(8,5,14,.55); backdrop-filter:blur(2px); box-shadow:0 2px 8px rgba(0,0,0,.5); }
      .bhero .bf-gear-icon { position:relative; width:32px; height:32px; border-radius:8px; background-size:158%; background-position:center 20%; border:1.5px solid rgba(255,210,74,.6); box-shadow:0 3px 8px rgba(0,0,0,.6), inset 0 1px 2px rgba(255,255,255,.2); background-color:#0a0710; cursor:pointer; transition:transform .12s ease, border-color .12s ease; }
      .bhero .bf-gear-icon:hover { border-color:#ffd24a; transform:scale(1.15); z-index:10; }
      .bhero .bf-gear-zoom { position:absolute; bottom:-4px; right:-4px; font-size:8.5px; background:rgba(0,0,0,.8); border-radius:50%; width:14px; height:14px; display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,210,74,.6); color:#ffe49a; box-shadow:0 1px 3px rgba(0,0,0,.8); pointer-events:none; }
      /* ---- Action panel of the active hero: AI battle background ---- */
      .bf-action-bg { position:absolute; inset:-20px; z-index:0; pointer-events:none; background-image:var(--bf-action-art); background-size:cover; background-position:center 18%; filter:saturate(1.25) contrast(1.12); opacity:.55; animation:bfActionZoom 7s ease-in-out infinite alternate; will-change:transform,background-position; }
      .bf-action-bg::after { content:''; position:absolute; inset:0; background:radial-gradient(circle at 50% 10%, rgba(0,0,0,0) 0%, rgba(10,7,18,.85) 60%, rgba(10,7,18,1) 100%); }
      @keyframes bfActionZoom { 0% { transform:scale(1.02); background-position:center 8%; } 100% { transform:scale(1.42); background-position:center 42%; } }
      .bf-action-embers { position:absolute; inset:0; z-index:1; pointer-events:none; background-image:radial-gradient(circle, #ffd24a 1.5px, transparent 1.5px); background-size: 32px 32px; opacity:0.12; animation:bfEmbers 12s linear infinite; }
      @keyframes bfEmbers { 0% { background-position: 0 0; } 100% { background-position: -64px -128px; } }
      .bf-action-host { position:relative !important; overflow:hidden; border-radius:14px; }
      .bf-action-host > *:not(.bf-action-bg):not(.bf-active-banner) { position:relative; z-index:1; }
      /* Active hero banner: name + ability, shown at the top of the action panel */
      .bf-active-banner { position:relative; z-index:2; margin:0 0 10px; padding:12px 14px; border-radius:14px; background:linear-gradient(180deg,rgba(255,210,74,.15),rgba(255,210,74,.06)); border:2px solid rgba(255,210,74,.55); box-shadow:0 6px 20px rgba(0,0,0,.55), inset 0 0 0 1px rgba(255,210,74,.25); backdrop-filter:blur(3px); display:grid; grid-template-columns:50px 1fr; gap:12px; align-items:flex-start; }
      .bf-active-banner.bf-banner-elite { border-color:rgba(190,108,255,.75); background:linear-gradient(180deg,rgba(190,108,255,.18),rgba(190,108,255,.08)); box-shadow:0 6px 24px rgba(190,108,255,.35), inset 0 0 0 1px rgba(190,108,255,.35); }
      .bf-ab-orb { position:relative; width:48px; height:48px; border-radius:50%; background:radial-gradient(circle at 38% 28%,#fff2a7,#ff7a22 32%,#8c1108 62%,#170101); border:2.5px solid rgba(255,224,121,.92); box-shadow:0 0 18px rgba(255,95,25,.8), inset 0 0 10px rgba(255,255,255,.22); flex-shrink:0; }
      .bf-ab-orb::before { content:'✦'; position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#fff7d7; font-size:26px; font-weight:900; text-shadow:0 0 10px #fff,0 2px 4px #000; }
      .bf-banner-elite .bf-ab-orb { background:radial-gradient(circle at 38% 28%,#f4dbff,#c16aff 36%,#4c0b86 66%,#090012); box-shadow:0 0 20px rgba(190,91,255,.9), inset 0 0 10px rgba(255,255,255,.2); }
      .bf-ab-hero { font-family:'Cinzel',serif; font-weight:1000; font-size:15px; color:#ffe07b; letter-spacing:.3px; text-transform:uppercase; text-shadow:0 2px 5px #000,0 0 12px rgba(255,210,74,.5); line-height:1; }
      .bf-banner-elite .bf-ab-hero { color:#ffc8ff; text-shadow:0 2px 5px #000,0 0 12px rgba(190,108,255,.6); }
      .bf-ab-name { font-family:'Cinzel',serif; font-weight:900; font-size:13px; color:#fff5dc; margin-top:4px; line-height:1.1; letter-spacing:.15px; }
      .bf-ab-text { color:#fff7ea; font-size:12px; font-weight:700; line-height:1.35; margin-top:5px; text-shadow:0 1px 3px #000; max-height:none; overflow:visible; }
      /* Beefed-up action buttons in the active panel */
      .bf-action-host button { transition:transform .12s ease, box-shadow .12s ease, filter .12s ease; }
      .bf-action-host button:hover { transform:translateY(-2px); filter:brightness(1.08); }
      /* ---- Hand card "play it?" confirm + cast animation ---- */
      .bf-cast-flash { position:fixed; inset:0; z-index:99998; pointer-events:none; background:radial-gradient(circle at 50% 45%,rgba(255,255,255,.5),rgba(176,108,255,.25) 30%,transparent 65%); animation:bfCastFlash .8s ease-out forwards; }
      @keyframes bfCastFlash { 0%{opacity:0} 25%{opacity:1} 100%{opacity:0} }
      .bf-cast-runes { position:fixed; left:50%; top:50%; z-index:99999; pointer-events:none; transform:translate(-50%,-50%); font-size:84px; filter:drop-shadow(0 0 24px currentColor); animation:bfCastRune 1s ease-out forwards; }
      @keyframes bfCastRune { 0%{opacity:0;transform:translate(-50%,-30%) scale(.4) rotate(-20deg)} 35%{opacity:1;transform:translate(-50%,-50%) scale(1.2) rotate(8deg)} 100%{opacity:0;transform:translate(-50%,-72%) scale(1) rotate(0)} }
      /* ---- True death: gravestone / RIP ---- */
      .bf-fx-grave { position:absolute; left:50%; top:46%; transform:translate(-50%,-50%); z-index:5; font-size:52px; filter:drop-shadow(0 4px 8px #000); animation:bfGraveRise 1.3s cubic-bezier(.2,.8,.3,1) forwards; }
      .bf-fx-grave-shade { position:absolute; inset:0; z-index:4; background:radial-gradient(circle at 50% 55%,rgba(0,0,0,.55),rgba(40,20,60,.3) 45%,transparent 75%); animation:bfDeathSmoke 1.3s ease-out forwards; }
      @keyframes bfGraveRise { 0%{opacity:0;transform:translate(-50%,10%) scale(.5) rotate(-8deg)} 40%{opacity:1;transform:translate(-50%,-50%) scale(1.15) rotate(4deg)} 70%{transform:translate(-50%,-50%) scale(1) rotate(0)} 100%{opacity:1;transform:translate(-50%,-50%) scale(1)} }
      .bhero.bf-truedead { filter:grayscale(.85) brightness(.5) !important; }
      .bhero.bf-truedead .bf-battle-art { filter:grayscale(1) brightness(.45) !important; }
      /* ---- Hero info modal: dramatic art background ---- */
      .bf-info-art { position:absolute; inset:0; z-index:0; border-radius:inherit; overflow:hidden; pointer-events:none; }
      .bf-info-art .bf-info-fill { position:absolute; inset:-30px; background-image:var(--bf-info-art); background-size:cover; background-position:center 14%; filter:blur(26px) saturate(1.3) contrast(1.1); transform:scale(1.4); opacity:.9; }
      .bf-info-art .bf-info-sharp { position:absolute; right:-8px; top:-8px; bottom:-8px; width:46%; background-image:var(--bf-info-art); background-size:cover; background-position:center 12%; filter:saturate(1.12) contrast(1.08); opacity:.42; -webkit-mask-image:linear-gradient(90deg,transparent,#000 60%); mask-image:linear-gradient(90deg,transparent,#000 60%); }
      .bf-info-art .bf-info-shade { position:absolute; inset:0; background:linear-gradient(120deg,rgba(18,13,34,.96) 0%,rgba(18,13,34,.86) 42%,rgba(18,13,34,.55) 100%); }
      .modal-box.bf-info-themed > *:not(.bf-info-art) { position:relative; z-index:1; }
      /* ---- Élite badge in hero info modal ---- */
      .bf-elite-badge { display:flex; align-items:center; gap:8px; margin:8px 0 4px; padding:8px 12px; border-radius:11px; font-family:'Cinzel',serif; font-weight:1000; font-size:14px; color:#3a2600; background:linear-gradient(180deg,#ffe27a,#FFD24A 55%,#c8901f); box-shadow:0 4px 14px rgba(255,210,74,.4), inset 0 0 0 1px rgba(255,255,255,.3); text-shadow:0 1px 1px rgba(255,255,255,.4); animation:bfBadgePulse 1.8s ease-in-out infinite; }
      @keyframes bfBadgePulse { 0%,100%{box-shadow:0 4px 14px rgba(255,210,74,.4), inset 0 0 0 1px rgba(255,255,255,.3)} 50%{box-shadow:0 4px 22px rgba(255,210,74,.7), inset 0 0 0 1px rgba(255,255,255,.45)} }
      /* ---- Lupa (zoom) en cartas de héroe ---- */
      .bf-zoom-btn { position:absolute; top:50%; right:8px; transform:translateY(-50%); z-index:9; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; cursor:pointer; background:rgba(0,0,0,.62); border:1px solid rgba(255,210,74,.55); color:#ffe49a; box-shadow:0 3px 8px rgba(0,0,0,.5); transition:background .12s ease; padding:0; }
      .bf-zoom-btn:hover { background:rgba(255,210,74,.22); }
      .bf-zoom-overlay { position:fixed; inset:0; z-index:100001; display:flex; align-items:center; justify-content:center; padding:16px; background:rgba(6,4,12,.92); backdrop-filter:blur(6px); animation:bfFadeIn .2s ease; }
      .bf-zoom-cardwrap { position:relative; width:min(420px,90vw); height:min(640px,86vh); aspect-ratio:7/10; box-shadow:0 0 50px rgba(0,0,0,.85); animation:bfPopIn .26s cubic-bezier(.2,.8,.3,1); }
      .bf-zoom-cardwrap .bf-hero-card { position:absolute; inset:0; }
      .bf-zoom-bonuswrap { position:relative; width:min(420px,90vw); height:min(560px,84vh); box-shadow:0 0 50px rgba(0,0,0,.85); animation:bfPopIn .26s cubic-bezier(.2,.8,.3,1); }
      .bf-zoom-cardwrap h3 svg, .modal h3 svg { width:22px; height:22px; }
      /* ---- Guía Punkito: draggable, animado ---- */
      .bf-guide { position:fixed; bottom:8px; left:8px; z-index:90000; display:flex; align-items:flex-end; gap:10px; max-width:min(440px,72vw); pointer-events:none; animation:bfFadeIn .35s ease; user-select:none; }
      .bf-guide.bf-guide-hidden .bf-guide-bubble { display:none; }
      .bf-guide-char { position:relative; flex:0 0 auto; width:88px; height:88px; pointer-events:auto; animation:bfGuideFloat 3.2s ease-in-out infinite; filter:drop-shadow(0 6px 14px rgba(0,0,0,.7)); cursor:grab; transition:transform .2s ease,filter .2s ease; }
      .bf-guide-char:hover { filter:drop-shadow(0 8px 20px rgba(255,210,74,.6)); transform:scale(1.08); }
      .bf-guide-char:active { cursor:grabbing; }
      .bf-guide-char img { width:100%; height:100%; object-fit:contain; display:block; background:transparent!important; transition:opacity .18s ease; }
      .bf-guide-char.bf-react-cheer { animation:bfGuideCheer 1.1s ease-in-out 2; } .bf-guide-char.bf-react-wow { animation:bfGuideWow 1s ease-in-out 2; } .bf-guide-char.bf-react-shock { animation:bfGuideShock 0.9s ease-in-out 2; }
      .bf-guide-char.bf-battle-ride { animation:bfBattleRide 2.2s cubic-bezier(.22,1,.36,1) forwards !important; filter:drop-shadow(0 8px 24px rgba(255,160,40,.9)) !important; z-index:99999 !important; }
      @keyframes bfBattleRide { 0%{transform:translateX(0) scale(1)} 15%{transform:translateX(10vw) scale(1.35) rotate(-8deg)} 50%{transform:translateX(calc(50vw - 44px)) scale(1.55) rotate(-5deg)} 70%{transform:translateX(calc(50vw - 44px)) scale(1.6) rotate(0)} 85%{transform:translateX(calc(50vw - 44px)) scale(1.5) rotate(5deg)} 100%{transform:translateX(0) scale(1) rotate(0)} }
      .bf-guide-char .bf-guide-spark { position:absolute; inset:-14px; z-index:-1; pointer-events:none; border-radius:50%; opacity:0; background:radial-gradient(circle,rgba(255,210,74,.7),rgba(255,160,40,.3) 42%,transparent 72%); }
      .bf-guide-char.bf-react-cheer .bf-guide-spark, .bf-guide-char.bf-react-wow .bf-guide-spark { animation:bfGuideSpark 1.1s ease-out 2; } .bf-guide-char.bf-react-shock .bf-guide-spark { background:radial-gradient(circle,rgba(176,108,255,.55),rgba(80,20,120,.25) 42%,transparent 72%); animation:bfGuideSpark 1.1s ease-out 2; }
      @keyframes bfGuideCheer { 0%,100%{transform:translateY(0) rotate(0)} 25%{transform:translateY(-14px) rotate(-8deg) scale(1.18)} 50%{transform:translateY(-3px) rotate(6deg) scale(1.08)} 75%{transform:translateY(-12px) rotate(-5deg) scale(1.14)} } @keyframes bfGuideWow { 0%,100%{transform:scale(1) rotate(0)} 30%{transform:scale(1.28) rotate(4deg)} 60%{transform:scale(1.12) rotate(-4deg)} } @keyframes bfGuideShock { 0%,100%{transform:translateX(0) rotate(0)} 15%{transform:translateX(-9px) rotate(-6deg) scale(1.1)} 35%{transform:translateX(9px) rotate(6deg)} 55%{transform:translateX(-6px) rotate(-4deg)} 75%{transform:translateX(5px)} } @keyframes bfGuideSpark { 0%{opacity:0;transform:scale(.6)} 30%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1.5)} }
      .bf-guide-pop { position:absolute; left:50%; top:-20px; transform:translateX(-50%); z-index:5; pointer-events:none; font-family:'Cinzel',serif; font-weight:1000; font-size:13px; letter-spacing:.4px; white-space:nowrap; padding:3px 10px; border-radius:999px; color:#3a2600; background:linear-gradient(180deg,#ffe27a,#FFD24A 55%,#c8901f); box-shadow:0 4px 12px rgba(255,210,74,.55); animation:bfGuidePop 1.6s ease-out forwards; } .bf-guide-pop.bf-pop-shock { color:#fff; background:linear-gradient(180deg,#c79bff,#8a3df0 55%,#4c0b86); box-shadow:0 4px 12px rgba(160,80,255,.55); }
      @keyframes bfGuidePop { 0%{opacity:0;transform:translate(-50%,8px) scale(.6)} 20%{opacity:1;transform:translate(-50%,0) scale(1.15)} 80%{opacity:1;transform:translate(-50%,-8px) scale(1)} 100%{opacity:0;transform:translate(-50%,-22px) scale(.9)} }
      .bf-guide-bubble { position:relative; pointer-events:auto; background:linear-gradient(180deg,#1c1533,#130d24); border:2px solid rgba(255,210,74,.6); border-radius:14px; padding:9px 30px 10px 13px; box-shadow:0 8px 28px rgba(0,0,0,.6),0 0 22px rgba(255,210,74,.18), inset 0 0 0 1px rgba(255,210,74,.1); animation:bfBubblePulse 4s ease-in-out infinite; }
      @keyframes bfBubblePulse { 0%,100%{box-shadow:0 8px 28px rgba(0,0,0,.6),0 0 14px rgba(255,210,74,.1),inset 0 0 0 1px rgba(255,210,74,.1)} 50%{box-shadow:0 8px 28px rgba(0,0,0,.6),0 0 28px rgba(255,210,74,.28),inset 0 0 0 1px rgba(255,210,74,.18)} }
      .bf-guide-bubble::before { content:''; position:absolute; left:-9px; bottom:14px; width:0; height:0; border-top:8px solid transparent; border-bottom:8px solid transparent; border-right:9px solid rgba(255,210,74,.6); }
      .bf-guide-title { font-family:'Cinzel',serif; font-weight:1000; font-size:12px; color:#ffd24a; letter-spacing:.3px; text-shadow:0 1px 2px #000; margin-bottom:3px; }
      .bf-guide-text { font-size:12.5px; line-height:1.32; color:#f3ecff; font-weight:600; text-shadow:0 1px 2px #000; }
      .bf-guide-text b { color:#ffe49a; }
      .bf-guide-x { position:absolute; top:3px; right:3px; width:24px; height:24px; border-radius:50%; border:none; background:rgba(255,255,255,.12); color:#cbb9ee; font-size:13px; line-height:1; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:5; }
      .bf-guide-x:hover { background:rgba(255,255,255,.2); color:#fff; }
      .bf-guide-show { position:fixed; bottom:10px; left:10px; z-index:90000; width:52px; height:52px; border-radius:50%; overflow:hidden; border:2.5px solid rgba(255,210,74,.7); background:#130d24; box-shadow:0 4px 14px rgba(0,0,0,.6),0 0 18px rgba(255,210,74,.28); cursor:pointer; display:none; padding:0; animation:bfGuideFloat 3.2s ease-in-out infinite; }
      .bf-guide-show img { width:100%; height:100%; object-fit:contain; display:block; background:transparent!important; }
      .bf-guide-show.bf-guide-visible { display:block; } .bf-guide-show.bf-guide-blink { animation:bfGuideShowBlink .8s ease-in-out infinite !important; } @keyframes bfGuideShowBlink { 0%,100%{box-shadow:0 4px 14px rgba(0,0,0,.6),0 0 18px rgba(255,210,74,.28)} 50%{box-shadow:0 4px 14px rgba(0,0,0,.6),0 0 32px 8px rgba(255,60,60,.95)} }
      @keyframes bfGuideFloat { 0%,100%{transform:translateY(0) rotate(0)} 25%{transform:translateY(-10px) rotate(2deg)} 75%{transform:translateY(5px) rotate(-2deg)} }
      @media(max-width:640px){.bf-guide{top:6px;left:6px;gap:7px;max-width:74vw}.bf-guide-char{width:64px;height:64px}.bf-guide-bubble{padding:7px 34px 8px 11px}.bf-guide-title{font-size:11px}.bf-guide-text{font-size:11px;line-height:1.25}}
      @media(min-width:641px) and (max-width:1024px){.bf-race-list{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))!important}.bf-quick-grid{grid-template-columns:repeat(auto-fit,minmax(190px,1fr))!important}.chip.bf-chip-card{width:96px!important;height:131px!important}.bf-confirm-box{width:min(420px,90vw)!important}.bf-guide{max-width:min(460px,66vw)!important}}
      @media(max-width:420px){.chip.bf-chip-card{width:76px!important;height:104px!important}.bf-confirm-box{width:96vw!important}.bf-confirm-btn{font-size:13px!important;padding:10px 8px!important}.bf-quick-grid{grid-template-columns:repeat(auto-fit,minmax(140px,1fr))!important}}
      @media(max-height:480px) and (orientation:landscape){.bf-guide{top:4px!important}.bf-guide-char{width:50px!important;height:50px!important}.bf-guide-bubble{padding:6px 30px 7px 10px!important}}
      .bf-coin-fly{position:fixed;z-index:100050;pointer-events:none;font-size:26px;line-height:1;transform:translate(-50%,-50%) scale(.85);filter:drop-shadow(0 3px 6px rgba(0,0,0,.6)) drop-shadow(0 0 8px rgba(255,210,74,.85));opacity:1;transition:left .72s cubic-bezier(.3,.55,.25,1),top .72s cubic-bezier(.3,.55,.25,1),transform .72s ease,opacity .72s ease;will-change:left,top,transform,opacity} html.bf-locked,html.bf-locked body{font-size:17px!important}html.bf-locked .screen{max-width:1180px!important;margin-left:auto!important;margin-right:auto!important}html.bf-locked .chip.bf-chip-card{width:84px!important;height:116px!important}@media(max-width:420px){html.bf-locked .chip.bf-chip-card{width:76px!important;height:104px!important}}html.bf-locked .bf-role-emblem{width:18px;height:18px}html.bf-locked .bf-gear-icon{width:34px;height:34px}
      html.bf-client-flip .r-layout>:nth-child(1){order:3}
      html.bf-client-flip .r-layout>:nth-child(2){order:2}
      html.bf-client-flip .r-layout>:nth-child(3){order:1}
      html.bf-client-flip .b-grid>:nth-child(1){order:3}
      html.bf-client-flip .b-grid>:nth-child(2){order:2}
      html.bf-client-flip .b-grid>:nth-child(3){order:1}
      .bf-xfer-btn{width:100%;margin:6px 0 10px;padding:8px 14px;border-radius:999px;border:2px solid #c8901f;background:linear-gradient(180deg,#ffe27a,#FFD24A 55%,#c8901f);color:#3a2600;font-family:'Cinzel',serif;font-weight:1000;font-size:12px;letter-spacing:.3px;text-transform:uppercase;cursor:pointer;box-shadow:0 4px 12px rgba(255,210,74,.4),inset 0 1px 1px rgba(255,255,255,.45);transition:transform .12s ease,filter .12s ease,box-shadow .12s ease;display:flex;align-items:center;justify-content:center;gap:6px;text-shadow:0 1px 1px rgba(255,255,255,.35)}
      .bf-xfer-btn:hover{transform:translateY(-2px);filter:brightness(1.08);box-shadow:0 8px 18px rgba(255,210,74,.55)}
      .bf-xfer-btn:active{transform:scale(.96);filter:brightness(.95)}
      .bf-xfer-btn .bf-xfer-left{font-family:'Rubik',sans-serif;font-weight:700;font-size:10px;opacity:.85;text-transform:none;letter-spacing:0}
    \`;
    document.head.appendChild(style);
    document.documentElement.classList.add('bf-locked');
    if (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) document.documentElement.classList.add('bf-mobile');
  }
  // ---- PATCH cardFace (heroes) — premium full-art layout ----
  function patchCardFace() {
    if (typeof window.cardFace !== 'function' || window.cardFace.__patched) return !!(window.cardFace && window.cardFace.__patched);
    var RB='https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/',ROLE_EMBLEM={CC:RB+'ab147bafb_generated_image.png',AD:RB+'fd388871c_generated_image.png',HE:RB+'cfd5e317c_generated_image.png'};
    window.__BF_ROLE_EMBLEM = ROLE_EMBLEM;
    // AI-generated ability emblems by hero type (CC melee, AD ranged, HE magic).
    var ABILITY_ICON={CC:RB+'705b92520_generated_image.png',AD:RB+'4ed918861_generated_image.png',HE:RB+'78ce43e5c_generated_image.png'};
    window.__BF_ABILITY_ICON = ABILITY_ICON;
    function clean(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[c];});}
    function typeLabel(t){if(t==='CC')return'CUERPO A CUERPO';if(t==='AD')return'A DISTANCIA';if(t==='HE')return'MAGIA';return clean(t||'HÉROE');}
    function typeIcon(t){if(ROLE_EMBLEM[t])return'<img class="bf-role-emblem" src="'+ROLE_EMBLEM[t]+'" alt="">';return'★';}
    function raceSigil(c){return raceSigilSvg(c, '#fff7dc');}
    
    var DB_HERO_OBJS = ${JSON.stringify(DB_HERO_OBJS)};
    var baseHeroCount = (typeof HEROES !== 'undefined') ? HEROES.length : 0;
    DB_HERO_OBJS.forEach(function(h) { if (typeof HEROES === 'undefined') return; var eh = HEROES.find(function(x){ return x && x.id === h.id; }); if (!eh) { var num = Number(h.num); if (num >= 1 && num <= baseHeroCount) eh = HEROES[num - 1]; } if (!eh) { HEROES.push(h); return; } eh.id = h.id; ['name','title','clan','clanColor','type','cc','ad','he','hp','eCc','eAd','eHe','eHp','ability','abilityTxt','eAbility','eTxt','num'].forEach(function(k){ if (h[k] != null && h[k] !== '') eh[k] = h[k]; }); eh.gold_border = h.gold_border; eh.foil = h.foil; eh.rainbow_border = h.rainbow_border; if (h.cost != null) eh.cost = Number(h.cost) + ((eh.__bfEpicRaised === 1 && (h.clan || eh.clan) === 'Épicas') ? 10 : 0); }); // BD (Oráculo) manda: sincroniza TODOS los campos del héroe (nombre, stats, habilidades, coste...) para que cualquier actualización de cartas llegue al juego sin tocar código. Si el id cambió en el backoffice, empareja por NÚMERO y actualiza también el id, para que no quede un héroe "fantasma" con el id antiguo.
    function padNum(v,h){var n=parseInt(v||0,10);if(!n&&h&&h.id){var i=HERO_IDS.indexOf(h.id);if(i>=0)n=i+1;}return n?String(n).padStart(3,'0'):'---';}
    var patched = function(h, variant) {
      var elite = variant === 'elite';
      var cc = elite ? h.eCc : h.cc;
      var ad = elite ? h.eAd : h.ad;
      var he = elite ? h.eHe : h.he;
      var hp = elite ? h.eHp : h.hp;
      var ability = elite ? h.eAbility : h.ability;
      var abilityTxt = elite ? h.eTxt : h.abilityTxt;
      var col = h.clanColor || '#caa14a';
      var isEpic = h.clan === 'Épicas';
      var artId = (h && h._token) || (h && h.id); var url = elite ? (ELITE_BY_ID[artId] || ART_BY_ID[artId]) : ART_BY_ID[artId];
      var safeUrl = String(url || '').replace(/'/g, '%27');
      return '<div class="cardface bf-hero-card ' + (elite ? 'cf-elite' : '') + (h.rainbow_border===true ? ' cf-rainbow' : (h.gold_border===true ? ' cf-epic' : '')) + ((isEpic||h.foil===true) ? ' cf-foiled' : '') + '" style="--clan:' + clean(col) + ';--bf-art:url(\\'' + safeUrl + '\\')">' + ((isEpic||h.foil===true) ? '<div class="bf-foil"></div>' : '') + '<div class="bf-hero-bg" style="background-position:' + bfHeroBgPos(artId) + '"></div><div class="bf-hero-frame"></div><div class="bf-coin">' + clean(h.cost) + '</div>' + '<div class="bf-race-sigil" title="' + clean(h.clan || '') + '">' + raceSigilSvg(h.clan, '#fff7dc') + '</div>' + '<div class="bf-type-medal">' + typeIcon(h.type) + '<span>' + clean(h.type || '') + '</span></div>' + '<div class="bf-stats"><div class="bf-stat bf-stat-cc"><span>CC</span><b>' + clean(cc) + '</b></div><div class="bf-stat bf-stat-ad"><span>AD</span><b>' + clean(ad) + '</b></div><div class="bf-stat bf-stat-he"><span>HE</span><b>' + clean(he) + '</b></div></div>' + '<div class="bf-nameplate"><div class="bf-hero-name">' + clean(h.name) + '</div><div class="bf-hero-title">' + clean(h.title) + (elite ? ' · ÉLITE' : '') + '</div></div>' + '<div class="bf-heart"><span class="cf-heart-ico">❤</span><span class="cf-hp">' + clean(hp) + '</span></div>' + '<div class="bf-ability-panel"><div class="bf-ability-orb bf-ability-orb-img"><img src="' + (ABILITY_ICON[h.type] || ABILITY_ICON.HE) + '" alt=""></div><div><div class="bf-ability-name">' + clean(ability) + '</div><div class="bf-ability-text">' + clean(abilityTxt) + '</div></div></div>' + '<div class="bf-card-num">Base Set · Nº ' + padNum(h.num, h) + '</div>' + '<div class="bf-logo"><img src="' + LOGO_URL + '" alt="BF" style="width:100%;height:100%;object-fit:contain;display:block;"></div></div>';
    };
    patched.__patched = true;
    window.cardFace = patched;
    return true;
  }
  // ---- Full-screen card zoom (lupa) — shows the WHOLE card (art + stats + ability), enlarged ----
  // All card zooms now open in the game's own modal (same look as the auction
  // hero zoom, which scales perfectly on mobile), with a Normal/Élite toggle.
  function bfZoomCard(heroId, variant, side) {
    if (typeof window.cardFace !== 'function' || typeof window.modal !== 'function') return;
    var h = side ? (typeof G !== 'undefined' && G.team && G.team[side] || []).find(function(x) { return x && x.id === heroId; }) : null;
    if (!h) h = (typeof HEROES !== 'undefined' ? HEROES : []).find(function(x) { return x && x.id === heroId; });
    if (!h) return;
    window.__bfZoomH = h; window.__bfZoomV = variant === 'elite' ? 'elite' : 'normal';
    // Flip 3D entre Normal y Élite: ambas caras se renderizan a la vez y el
    // botón solo gira la carta (sin recargar la imagen).
    window.bfZoomToggle = function() {
      var w = document.getElementById('bf-zoom-flip');
      if (!w) return;
      w.classList.toggle('flipped');
      window.__bfZoomV = w.classList.contains('flipped') ? 'elite' : 'normal';
    };
    window.bfZoomRender = function() {
      var hh = window.__bfZoomH, v = window.__bfZoomV;
      window.modal('<div style="display:flex;justify-content:center"><div id="bf-zoom-flip" class="flip3d' + (v === 'elite' ? ' flipped' : '') + '" style="width:min(340px,74vw);aspect-ratio:7/10;position:relative"><div class="flip3d-inner" style="position:relative;width:100%;height:100%"><div class="face front" style="position:absolute;inset:0">' + window.cardFace(hh, 'normal') + '</div><div class="face back" style="position:absolute;inset:0">' + window.cardFace(hh, 'elite') + '</div></div></div></div><div style="text-align:center;margin-top:12px"><button onclick="bfZoomToggle()" style="padding:10px 22px;border-radius:12px;border:2px solid #7c5410;background:linear-gradient(180deg,#ffe27a,#FFD24A 55%,#c8901f);color:#3a2600;font-family:Cinzel,serif;font-weight:900;font-size:14px;cursor:pointer">⚙ Ver Normal / Élite</button></div>');
      document.querySelectorAll('#bf-zoom-flip .bf-zoom-btn').forEach(function(ib) { ib.remove(); });
      setTimeout(function() { if (typeof bfAutoFitHeroCards === 'function') bfAutoFitHeroCards(); }, 30);
    };
    window.bfZoomRender();
  }
  window.bfZoomCard = bfZoomCard;
  // ---- Full-screen bonus/restador zoom (lupa) — shows the whole bonus card enlarged ----
  function bfZoomBonus(name,url,found){if(!url||typeof window.modal!=='function')return;var it=found?found.item:null;var ty=found?found.kind:'bonus';if(!it){var ob=typeof OBJECTS!=='undefined'?OBJECTS.find(function(o){return o&&o.name===name;}):null;var sp=typeof SPELLS!=='undefined'?SPELLS.find(function(s){return s&&s.name===name;}):null;var bo=typeof BONUS!=='undefined'?BONUS.find(function(b){return b&&b.name===name;}):null;if(ob){it=ob;ty='object';}else if(sp){it=sp;ty='spell';}else if(bo){it=bo;ty='bonus';}}var num=it?((typeof cardNo==='function'&&it.id?cardNo(it.id):0)||it.num||it.number||0):0;var desc=it?(it.txt||it.description||''):'';var cost=it&&it.cost!=null&&it.cost!=='—'?it.cost:null;var TC={spell:'#8b6bff',melee:'#e0653f',ranged:'#3fb56a',armor:'#5a8fd6',object:'#d6b13f',bonus:'#d39b22'};var EC={fuego:'#d6552a',hielo:'#3aa0c8',rayo:'#caa12f',agua:'#2f7fd6',curacion:'#2f9d54',proteccion:'#caa12f',arcano:'#7a5fd0',estado:'#8a5fb0'};var bc=TC[ty]||'#d39b22';var tl=ty==='spell'?(it&&it.element?it.element.toUpperCase():(it?it.tag:'')):(it?it.tag:'');if(ty==='bonus')tl=it&&(it.type||it.tag)?(it.type||it.tag):'BON';var bg=ty==='spell'&&it&&it.element?(EC[it.element.toLowerCase()]||bc):bc;var sl=null;if(it){if(it.cc!=null)sl='+'+it.cc+' CC';else if(it.power!=null)sl='Pot. '+it.power;else if(it.hp!=null&&ty==='armor')sl='+'+it.hp+' HP';else if(it.mana!=null)sl='🔵 '+it.mana+' maná';}var isFoil=(it&&it.foil===true)||name==='Transformer';var ht='<div class="'+(isFoil?'bf-foil-card':'')+'" style="position:relative;width:100%;height:100%;border-radius:18px;overflow:hidden;background:#07050b;box-shadow:0 10px 40px rgba(0,0,0,0.8);border:2px solid '+bc+'88;"><div style="position:absolute;inset:0;z-index:0;background-image:url(\\''+url+'\\');background-size:cover;background-position:center;filter:blur(18px) saturate(1.3) brightness(.7);transform:scale(1.3);"></div><img src="'+url+'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;filter:saturate(1.1) contrast(1.08);z-index:1;" /><div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.05) 0%,transparent 40%,rgba(0,0,0,0.9) 100%);z-index:2;"></div><div style="position:absolute;left:12px;right:12px;top:12px;display:flex;flex-direction:column;gap:6px;align-items:flex-start;z-index:3;">'+(cost!=null?'<div style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:\\'Rubik\\',sans-serif;font-weight:900;font-size:18px;color:#5a3d06;background:radial-gradient(circle at 34% 30%,#ffeaa6,#FFD24A 46%,#a9771f);border:2px solid #7c5410;box-shadow:0 4px 10px rgba(0,0,0,0.5);">'+cost+'</div>':'')+(tl?'<span style="font-size:13px;font-weight:900;color:#fff;background:'+bg+';border-radius:999px;padding:4px 12px;text-transform:uppercase;box-shadow:0 2px 6px rgba(0,0,0,0.5);">'+tl+'</span>':'')+(sl?'<span style="font-size:13px;font-weight:900;color:#ffe49a;background:rgba(0,0,0,0.7);border-radius:999px;padding:4px 12px;box-shadow:0 2px 6px rgba(0,0,0,0.5);">'+sl+'</span>':'')+'</div><div style="position:absolute;left:12px;right:12px;bottom:12px;text-align:center;border-radius:12px;background:rgba(0,0,0,0.75);border:1px solid '+bc+'66;padding:16px;backdrop-filter:blur(4px);z-index:3;"><div style="font-family:\\'Cinzel\\',serif;font-weight:900;font-size:26px;line-height:1.1;color:#fff5d9;text-shadow:0 2px 6px #000, 0 0 12px #000;margin-bottom:8px;text-transform:uppercase;">'+name+'</div>'+(desc?'<div style="font-family:\\'Rubik\\',sans-serif;font-size:15px;font-weight:700;line-height:1.3;color:#efe9dc;margin-bottom:14px;">'+desc+'</div>':'')+'<div style="font-family:\\'Rubik\\',sans-serif;font-size:11px;font-weight:900;color:#bdae87;letter-spacing:1px;text-transform:uppercase;">Base Set · Nº '+String(num).padStart(3,'0')+'</div></div><div class="bf-logo"><img src="'+LOGO_URL+'" alt="BF"></div>'+(isFoil?'<div class="bf-foil-shine"></div>':'')+'</div>';window.modal('<h3>'+name+'</h3><div style="display:flex;justify-content:center"><div class="bf-zoom-cardwrap" style="width:min(340px,74vw);height:auto;aspect-ratio:7/10;box-shadow:none">'+ht+'</div></div>');}
  window.bfZoomBonus = bfZoomBonus;
  var ART_SQUARE_CACHE = {}; function fitArtEl(el,url){if(!url)return;if(ART_SQUARE_CACHE[url]!==undefined){if(ART_SQUARE_CACHE[url]){el.style.setProperty('--bf-art-size','contain');el.style.backgroundColor='#07050b';}return;}var img=new Image();img.onload=function(){var sq=img.naturalWidth>0&&img.naturalHeight>0&&(img.naturalWidth/img.naturalHeight)>0.88&&(img.naturalWidth/img.naturalHeight)<1.14;ART_SQUARE_CACHE[url]=sq;if(sq){el.style.setProperty('--bf-art-size','contain');el.style.backgroundColor='#07050b';}};img.src=url;} var BF_FIT_CACHE={};function bfDetectMarginPct(url,cb){if(BF_FIT_CACHE.hasOwnProperty(url)){cb(BF_FIT_CACHE[url]);return;}var img2=new Image();img2.crossOrigin='anonymous';img2.onload=function(){try{var w=48,h=48,c=document.createElement('canvas');c.width=w;c.height=h;var ctx=c.getContext('2d');ctx.drawImage(img2,0,0,w,h);var data=ctx.getImageData(0,0,w,h).data;function isBg(x,y){var i=(y*w+x)*4,r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];return a<10||(r>232&&g>232&&b>232);}var midY=Math.floor(h/2),midX=Math.floor(w/2);function depth(dir){var s=0;if(dir==='t'){while(s<h&&isBg(midX,s))s++;}else if(dir==='b'){while(s<h&&isBg(midX,h-1-s))s++;}else if(dir==='l'){while(s<w&&isBg(s,midY))s++;}else{while(s<w&&isBg(w-1-s,midY))s++;}return s;}var margin=Math.max(depth('t')/h,depth('b')/h,depth('l')/w,depth('r')/w);BF_FIT_CACHE[url]=margin;cb(margin);}catch(e){BF_FIT_CACHE[url]=0;cb(0);}};img2.onerror=function(){BF_FIT_CACHE[url]=0;cb(0);};img2.src=url;} function bfReadArtUrl(el){var s=el.style.getPropertyValue('--bf-art'),m=s&&s.match(/^url\\((['"]?)(.*)\\1\\)$/);return m?m[2]:'';} function bfApplyFit(el,url){if(!url||!el||el.dataset.bfFitUrl===url)return;el.dataset.bfFitUrl=url;bfDetectMarginPct(url,function(margin){if(margin<=0.015){el.style.setProperty('--bf-fit','0%');el.style.setProperty('--bf-fitmode','contain');el.style.setProperty('--bf-art-size','contain');return;}var zoom=1/(1-2*margin),pct=Math.max(8,Math.min(38,Math.round((zoom-1)*50)+4));el.style.setProperty('--bf-fit','-'+pct+'%');el.style.setProperty('--bf-fitmode','cover');el.style.setProperty('--bf-art-size','cover');});} function bfAutoFitHeroCards(){document.querySelectorAll('.bf-hero-card').forEach(function(el){var url=bfReadArtUrl(el);if(url)bfApplyFit(el,url);});document.querySelectorAll('.cf-art.has-art').forEach(function(el){var url=bfReadArtUrl(el);if(url)bfApplyFit(el,url);});} function bfApplyFitBg(el,url){if(!url||!el||el.dataset.bfFitUrl===url)return;el.dataset.bfFitUrl=url;bfDetectMarginPct(url,function(margin){var pct;if(margin<=0.015)pct=110;else{var zoom=1/(1-2*margin);pct=Math.round(zoom*100)+6;}pct=Math.max(108,Math.min(180,pct));el.style.backgroundSize=pct+'%';});} function bfApplyFitInset(el,url){if(!url||!el||el.dataset.bfInsetUrl===url)return;el.dataset.bfInsetUrl=url;bfDetectMarginPct(url,function(margin){var p=margin<=0.015?2:Math.round(100*margin/(1-2*margin))+4;p=Math.max(2,Math.min(40,p));el.style.inset='-'+p+'%';});} function bfAutoFitSharpLayers(){document.querySelectorAll('.shop-card-art-sharp,.bf-confirm-art-sharp,.bf-quick-art').forEach(function(el){var bg=el.style.backgroundImage||getComputedStyle(el).backgroundImage,m=bg&&bg.match(/url\\(['"]?(.*?)['"]?\\)/);var url=m?m[1]:'';if(url)bfApplyFitInset(el,url);});} function bfAutoFitThumbs(){document.querySelectorAll('.bf-acq-thumb,.bf-slot-thumb,.bsum-thumb-img,.bf-chip-art-layer,.bf-chip-fill').forEach(function(el){var bg=el.style.backgroundImage,m=bg&&bg.match(/url\\(['"]?(.*?)['"]?\\)/);var url=m?m[1]:'';if(url)bfApplyFitBg(el,url);});bfAutoFitSharpLayers();}
  function injectHeroArt(){document.querySelectorAll('.cardface').forEach(function(c){var a=c.querySelector('.cf-art');if(!a||a.classList.contains('has-art'))return;var n=c.querySelector('.cf-name');if(!n)return;var nt=n.textContent.replace(/★/g,'').trim();var u=c.classList.contains('cf-elite')?(ELITE_BY_NAME[nt]||ART_BY_NAME[nt]):ART_BY_NAME[nt];if(!u)return;a.style.setProperty('--bf-art',"url('"+u+"')");fitArtEl(a,u);a.classList.add('has-art');});}
  function injectEquipArt() {
    document.querySelectorAll('.shop-card').forEach(function(card) {
      if (card.dataset.bfShopArt === '1') return;
      var bf = card.querySelector('.shop-bf span'); if (!bf) return;
      var m = bf.textContent.match(/(\\d+)/); if (!m) return;
      var url = NUM_ART[m[1]]; if (!url) return;
      var nameEl = card.querySelector('.shop-name'), nameTxt = nameEl ? nameEl.textContent.trim() : '';
      card.dataset.bfShopArt = '1';
      var fill = document.createElement('div'); fill.className = 'shop-card-fill'; fill.style.backgroundImage = 'url("' + url + '")'; card.insertBefore(fill, card.firstChild);
      var sharp = document.createElement('div'); sharp.className = 'shop-card-art-sharp'; sharp.style.backgroundImage = 'url("' + url + '")'; card.insertBefore(sharp, card.firstChild);
      card.classList.add('has-art');
      if (nameTxt && !card.querySelector('.bf-shop-name')) { var nm = document.createElement('div'); nm.className = 'bf-shop-name'; nm.textContent = nameTxt; card.appendChild(nm); } if (nameTxt === 'Transformer') { card.style.borderColor = 'rgba(255,233,168,.67)'; if (!card.querySelector('.bf-foil-layer')) { var fl = document.createElement('div'); fl.className = 'bf-foil-layer'; fl.style.cssText = 'position:absolute;inset:0;z-index:6;pointer-events:none;border-radius:inherit;mix-blend-mode:soft-light;opacity:.4;background:linear-gradient(125deg,#ffd24a,#ff7adf 18%,#7ad6ff 38%,#9dff8a 56%,#ffe27a 72%,#ff7adf 88%,#ffd24a);background-size:300% 300%;animation:bfFoilShift 9s linear infinite'; card.appendChild(fl); } if (!card.querySelector('.bf-foil-shine')) { var ef = document.createElement('div'); ef.className = 'bf-foil-shine'; card.appendChild(ef); } }
    });
  }
  function injectBonusArt() {
    document.querySelectorAll('.hand-lbl').forEach(function(lbl) {
      if (!/Bonificador de esta ronda/i.test(lbl.textContent)) return;
      // The bonus name lives in the next .chip sibling — but be tolerant: it may
      // be the immediate sibling, or a .chip somewhere after the label.
      var chip = lbl.nextElementSibling;
      while (chip && (!chip.classList || !chip.classList.contains('chip'))) {
        chip = chip.nextElementSibling;
      }
      if (!chip) return;
      if (chip.dataset.bfDone === '1') return;
      var name = chip.textContent.trim();
      var url = BONUS_ART_BY_NAME[name] || BONUS_ART_BY_KEY[bfKey(name)];
      if (!url) return;
      chip.dataset.bfDone = '1';
      chip.style.display = 'none';
      var card = document.createElement('div');
      card.className = 'bf-bonus-card';
      var safeName = name.replace(/'/g, "\\\\'");
      card.innerHTML =
        '<div class="bf-bonus-fill" style="background-image:url(\\'' + url + '\\')"></div>' +
        '<div class="bf-bonus-art" style="background-image:url(\\'' + url + '\\')"></div>' +
        '<div class="bf-hero-frame" style="border-radius:11px; z-index:2"></div>' +
        '<div class="bf-bonus-shade"></div>' +
        '<button class="bf-zoom-btn" onclick="event.stopPropagation();bfZoomBonus(\\'' + safeName + '\\',\\'' + url + '\\')" aria-label="Ampliar">🔍</button>' +
        '<div class="bf-bonus-name">' + name + '</div>';
      chip.parentNode.insertBefore(card, chip.nextSibling);
    });
  }
  // Build a name -> art map for every weapon/armor, used to show equipped
  // gear thumbnails on battle heroes. Resolved by array index in the game lists.
  function buildGearArtByName() {
    if (window.__bfGearArtByName || typeof MELEE === 'undefined') return;
    var map = {};
    function add(list, arts) {
      (list || []).forEach(function(it, i) { if (it && it.name && arts[i]) map[it.name] = arts[i]; });
    }
    add(typeof MELEE !== 'undefined' ? MELEE : [], MELEE_ART);
    add(typeof RANGED !== 'undefined' ? RANGED : [], RANGED_ART);
    add(typeof ARMORS !== 'undefined' ? ARMORS : [], ARMOR_ART);
    window.__bfGearArtByName = map;
  }
  function injectBattleHeroArt() {
    buildGearArtByName();
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(c) {
      var mid=c.id.match(/^b_([po])_(.+)$/); if(!mid)return; var s=mid[1], i=mid[2], h=(typeof G!=='undefined'&&G.team&&G.team[s]||[]).find(function(x){return x&&x.id===i;});
      var t=(h&&h._token)?h._token:i, u=ART_BY_ID[t]||ELITE_BY_ID[t], e=c.querySelector('.bf-battle-art');
      var hEpic=h&&h.clan==='Épicas',hGold=(h&&h.gold_border===true),hFoil=hEpic||(h&&h.foil===true);if(hGold)c.classList.add('bf-epic-gold');if(h&&h.rainbow_border===true)c.classList.add('bf-rainbow');if(hFoil&&!c.querySelector('.bf-epic-foil')){var fo=document.createElement('div');fo.className='bf-epic-foil';fo.style.cssText='position:absolute;inset:0;z-index:3;pointer-events:none;mix-blend-mode:soft-light;opacity:.4;background:linear-gradient(125deg,#ffd24a,#ff7adf 18%,#7ad6ff 38%,#9dff8a 56%,#ffe27a 72%,#ff7adf 88%,#ffd24a);background-size:300% 300%;animation:bfFoilShift 9s linear infinite';c.appendChild(fo);}
      if(c.dataset.bfBattleArt===t&&e){injectBattleGear(c);return;}
      if(e){if(u){e.style.backgroundImage='url("'+u+'")';e.style.backgroundSize='cover';e.style.backgroundPosition=bfHeroBgPos(t);}c.dataset.bfBattleArt=t;injectBattleGear(c);return;}
      if(!u){injectBattleGear(c);return;}
      var a=document.createElement('div');a.className='bf-battle-art';a.style.backgroundImage='url("'+u+'")';a.style.backgroundSize='cover';a.style.backgroundPosition=bfHeroBgPos(t);c.insertBefore(a,c.firstChild);var z=document.createElement('div');z.className='bf-battle-zoom';z.innerHTML='🔍';z.onclick=function(x){x.stopPropagation();bfZoomCard(i,c.classList.contains('elite-mode')||c.classList.contains('bf-auto-elite')?'elite':'normal',s);};c.insertBefore(z,a.nextSibling);c.dataset.bfBattleArt=t;injectBattleGear(c);
    });
    document.querySelectorAll('.ctb-slot').forEach(function(l) {
      var n=l.querySelector('.ctb-hero-name');if(!n)return;var nx=n.textContent.replace(/★/g,'').trim(),u=ART_BY_NAME[nx],pid=HERO_IDS[HERO_NAMES.indexOf(nx)];var e=l.querySelector('.bf-ctb-thumb');if(!u||(l.dataset.bfCtbArt===nx&&e))return;
      if(e){e.style.backgroundImage='url("'+u+'")';e.style.backgroundPosition=bfHeroBgPos(pid);l.dataset.bfCtbArt=nx;}
      else{var t=document.createElement('div');t.className='bf-ctb-thumb';t.style.backgroundImage='url("'+u+'")';t.style.backgroundPosition=bfHeroBgPos(pid);l.insertBefore(t,l.firstChild);l.dataset.bfCtbArt=nx;}
    });
  }
  function readHeroHp(c){var h=c.querySelector('.bhero-hpnum'),t=h?h.textContent:'',m=String(t).match(/-?\d+/);return m?parseInt(m[0],10):null;}
  function statusText(c){var s=c.querySelector('.bhero-status');return s?s.textContent:'';}
  function isHeroParalyzed(c){return c.classList.contains('s-paralyzed')||/par[aá]li/i.test(statusText(c));}
  // Resolve the current status of a battle hero: 'paralyzed' | 'sleeping' | 'cursed' | ''.
  function heroIsFrozen(card) {
    if (/congel/i.test(statusText(card))) return true;
    var id = heroIdFromCard(card), side = (String(card.id || '').split('_')[1]) || 'p';
    var h = (typeof G !== 'undefined' && G.team && G.team[side] || []).find(function(x) { return x && x.id === id; });
    return !!(h && h.alive && h._mods && h._mods.some(function(m) { return m && Number(m.vel) < 0; }));
  }
  function heroStatusOf(card) {
    var t = statusText(card);
    if (card.classList.contains('s-paralyzed') || /par[aá]li/i.test(t)) return 'paralyzed';
    if (card.classList.contains('s-sleeping') || /dorm|sue[ñn]/i.test(t)) return 'sleeping';
    if (heroIsFrozen(card)) return 'frozen';
    if (card.classList.contains('s-cursed') || /maldi|maldec/i.test(t)) return 'cursed';
    if (card.classList.contains('s-blessed') || /bendi|bendec|bless/i.test(t)) return 'blessed';
    return '';
  }
  // Rich animated overlay markup per status (sleeping zzz+sheep, paralyzed arcs, cursed runes, blessed halo).
  var STATUS_FX_HTML = {
    sleeping: '<div class="bf-fx-overlay bf-sleep-fx"><span class="bf-sleep-z z1">Z</span><span class="bf-sleep-z z2">z</span><span class="bf-sleep-z z3">z</span><span class="bf-sleep-sheep">🐑</span><span class="bf-sleep-count">+1</span></div>',
    paralyzed: '<div class="bf-fx-overlay bf-shock-fx"><span class="bf-shock-bolt b1">⚡</span><span class="bf-shock-bolt b2">⚡</span><span class="bf-shock-bolt b3">⚡</span></div>',
    cursed: '<div class="bf-fx-overlay bf-curse-fx"><span class="bf-curse-rune r1">☠</span><span class="bf-curse-rune r2">⛧</span><span class="bf-curse-rune r3">☠</span></div>',
    blessed: '<div class="bf-fx-overlay bf-bless-fx"><div class="bf-bless-halo"></div><span class="bf-bless-spark s1">✦</span><span class="bf-bless-spark s2">✧</span><span class="bf-bless-spark s3">✦</span></div>',
  };
  var STATUS_INFO = {
    paralyzed: { ico: '⚡', label: 'PARALIZADO', cls: 'bf-status-paralyzed' }, sleeping: { ico: '💤', label: 'DORMIDO', cls: 'bf-status-sleeping' }, frozen: { ico: '❄', label: 'CONGELADO', cls: 'bf-status-frozen' }, cursed: { ico: '☠', label: 'MALDITO', cls: 'bf-status-cursed' }, blessed: { ico: '😇', label: 'BENDITO', cls: 'bf-status-blessed' }, tank: { ico: '🛡️', label: 'TANQUEANDO', cls: 'bf-status-tank' },
  };
  // Ensure the active hero has its dramatic aura/ring/tag layers, and that every hero shows a floating status badge matching its current condition.
  // Is this battle card a hero currently in TANK mode (absorbing every hit)?
  function heroIsTank(card) {
    var id = heroIdFromCard(card), side = (String(card.id || '').split('_')[1]) || 'p';
    var h = (typeof G !== 'undefined' && G.team && G.team[side] || []).find(function(x) { return x && x.id === id; });
    return !!(h && h.alive && h._bfTank);
  }
  function decorateBattleHeroState(card) {
    if (!card || !card.isConnected) return;
    if (!card.querySelector('.bf-active-aura')) {
      var aura = document.createElement('div'); aura.className = 'bf-active-aura';
      var ring = document.createElement('div'); ring.className = 'bf-active-ring';
      var tag = document.createElement('div'); tag.className = 'bf-active-tag'; tag.textContent = '★ SU TURNO';
      card.insertBefore(ring, card.firstChild); card.insertBefore(aura, card.firstChild); card.appendChild(tag);
    }
    // Tank overlay (armored shield + juggernaut ring) shown only while tanking.
    var tank = heroIsTank(card); card.classList.toggle('s-tank', tank);
    var tankEl = card.querySelector('.bf-tank-shield');
    if (tank) { if (!tankEl) { tankEl = document.createElement('div'); tankEl.className = 'bf-tank-shield'; tankEl.innerHTML = '<div class="bf-tank-ring">🛡️</div>'; card.appendChild(tankEl); } }
    else if (tankEl) tankEl.remove();
    var st = heroStatusOf(card) || (tank ? 'tank' : ''), badge = card.querySelector('.bf-status-badge');
    card.classList.toggle('s-frozen', st === 'frozen');
    ['sleeping','paralyzed','cursed','blessed'].forEach(function(s){ card.classList.toggle('s-' + s, st === s); });
    var frost = card.querySelector('.bf-frost');
    if (st === 'frozen') { if (!frost) { frost = document.createElement('div'); frost.className = 'bf-frost'; frost.innerHTML = '<div class="bf-frost-sheet"></div><div class="bf-frost-crack"></div><span class="bf-frost-flake bf-flake-a">❄</span><span class="bf-frost-flake bf-flake-b">❅</span><span class="bf-frost-flake bf-flake-c">❄</span>'; card.appendChild(frost); } }
    else if (frost) frost.remove();
    if (!st) {
      if (badge) badge.remove();
      var z = card.querySelector('.bf-fx-overlay'); if (z) z.remove();
      card.dataset.bfStatus = ''; return;
    }
    if (card.dataset.bfStatus !== st) {
      if (badge) badge.remove();
      var info = STATUS_INFO[st], b = document.createElement('div');
      b.className = 'bf-status-badge ' + info.cls;
      b.innerHTML = '<span class="bf-status-ico">' + info.ico + '</span>' + info.label;
      card.appendChild(b);
      var existingFx = card.querySelector('.bf-fx-overlay'); if (existingFx) existingFx.remove();
      if (STATUS_FX_HTML[st]) { var wrap = document.createElement('div'); wrap.innerHTML = STATUS_FX_HTML[st]; card.appendChild(wrap.firstChild); }
      card.dataset.bfStatus = st;
    }
  }
  function heroIdFromCard(c){var m=String(c&&c.id||'').match(/^b_[po]_(.+)$/);return m?m[1]:'';}
  function bfArtId(card){var id=heroIdFromCard(card),side=(String(card&&card.id||'').split('_')[1])||'p',h=(typeof G!=='undefined'&&G.team&&G.team[side]||[]).find(function(x){return x&&x.id===id;});return (h&&h._token)?h._token:id;}
  function addOverlayFx(card, html, ms) {
    if (!card || !card.isConnected) return;
    var fx = document.createElement('div'); fx.className = 'bf-combat-fx'; fx.innerHTML = html; card.appendChild(fx);
    setTimeout(function() { if (fx.parentNode) fx.parentNode.removeChild(fx); }, ms || 1000);
  }
  function playUniqueAbilityFx(side, hero) {
    var card = getBattleCard(side, hero && hero.id);
    if (!card || !hero) return;
    var isDuck = hero.akind === 'duck-summon', isReflect = hero.akind === 'reflect-damage';
    var label = isDuck ? '🦆 INVOCACIÓN' : isReflect ? '↺ REFRACCIÓN ARCANA' : '✦ ' + (hero.eliteMode ? (hero.eAbility || 'HABILIDAD ÉLITE') : (hero.ability || 'HABILIDAD'));
    var color = isDuck ? '#ffe14a' : isReflect ? '#c79bff' : '#7ad6ff';
    addOverlayFx(card, '<div class="bf-fx-elite-aura"></div><div class="bf-fx-spell-wave" style="color:' + color + '"></div><div class="bf-fx-float bf-fx-status-txt" style="color:' + color + '">' + label + '</div>', 1150);
  }
  function transformHeroToElite(card) {
    if (!card || card.dataset.bfAutoElite === '1') return;
    var id = bfArtId(card), eliteUrl = ELITE_BY_ID[id], art = card.querySelector('.bf-battle-art');
    if (art && eliteUrl) art.style.backgroundImage = 'url("' + eliteUrl + '")';
    card.dataset.bfAutoElite = '1'; card.classList.add('bf-auto-elite', 'elite-mode'); addOverlayFx(card, '<div class="bf-fx-elite-flip"></div><div class="bf-fx-elite-aura"></div><div class="bf-fx-float bf-fx-status-txt">★ ÉLITE</div>', 1200);
  }
  function playTrueDeath(card) {
    if (!card || !card.isConnected) return; card.classList.add('bf-dead', 'bf-truedead');
    addOverlayFx(card, '<div class="bf-fx-grave-shade"></div><div class="bf-fx-grave">🪦</div><div class="bf-fx-float bf-fx-status-txt">R.I.P.</div>', 1400);
  }
  // Inject thumbnails of the hero's equipped weapon + armor onto a battle card.
  function injectBattleGear(card) {
    if (!card || card.dataset.bfGear === '1') return;
    var id = heroIdFromCard(card), side = (String(card.id || '').split('_')[1]) || 'p';
    var hero = (typeof G !== 'undefined' && G.team && G.team[side] || []).find(function(h) { return h && h.id === id; });
    if (!hero) return;
    card.dataset.bfGear = '1';
    var items = [], w = hero.mwep || hero.rwep;
    if (w) items.push({ it: w, kind: hero.mwep ? 'melee' : 'ranged' });
    if (hero.armor) items.push({ it: hero.armor, kind: 'armor' });
    if (!items.length) return;
    var gearByName = window.__bfGearArtByName || {}, row = document.createElement('div'); row.className = 'bf-battle-gear';
    items.forEach(function(o) {
      var it = o.it, url = gearByName[it.name]; if (!url) return;
      var icon = document.createElement('div'); icon.className = 'bf-gear-icon'; icon.title = it.name; icon.style.backgroundImage = 'url("' + url + '")';
      icon.innerHTML = '<div class="bf-gear-zoom">🔍</div>';
      icon.onclick = function(e) { e.stopPropagation(); bfZoomBonus(String(it.name || '').replace(/'/g, "\\'"), url, { item: it, kind: o.kind }); };
      row.appendChild(icon);
    });
    if (row.children.length) card.appendChild(row);
  }
  function playHeroFx(card, type, value) {
    if (!card || !card.isConnected) return;
    var cls = type === 'heal' || type === 'revive' ? 'bf-fx-heal' : (type === 'paralyze' ? 'bf-fx-paralyze' : 'bf-fx-damage');
    card.classList.remove('bf-fx-damage', 'bf-fx-heal', 'bf-fx-paralyze'); void card.offsetWidth; card.classList.add(cls);
    setTimeout(function() { card.classList.remove(cls); }, 760);
    if (type === 'damage') { var big = Math.abs(value || 0) >= 18 ? '<div class="bf-fx-bigblast"></div>' : ''; addOverlayFx(card, big + '<div class="bf-fx-slash"></div><div class="bf-fx-float bf-fx-dmg">-' + Math.abs(value || 0) + '</div>', 950); }
    else if (type === 'heal') { addOverlayFx(card, '<div class="bf-fx-heal-ring"></div><div class="bf-fx-float bf-fx-heal-txt">+' + Math.abs(value || 0) + '</div>', 950); }
    else if (type === 'revive') { card.classList.remove('bf-dead'); addOverlayFx(card, '<div class="bf-fx-phoenix">🔥</div><div class="bf-fx-float bf-fx-heal-txt">REVIVE</div>', 1100); }
    else if (type === 'death') { if (card.classList.contains('bf-auto-elite') || card.classList.contains('elite-mode')) { playTrueDeath(card); } else { card.classList.add('bf-dead'); addOverlayFx(card, '<div class="bf-fx-death-smoke"></div><div class="bf-fx-skull">💀</div>', 1150); } }
    else { addOverlayFx(card, '<div class="bf-fx-bolt">⚡</div><div class="bf-fx-float bf-fx-status-txt">PARALIZADO</div>', 950); }
  }
  function syncBattleFx() {
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card) {
      // Watch for the game flagging this hero as elite (class .elite-mode or a ★
      // in its name) and flip the portrait to the elite art automatically.
      var nameEl = card.querySelector('.bhero-name');
      var isEliteNow = card.classList.contains('elite-mode') || (nameEl && nameEl.textContent.indexOf('★') !== -1);
      if (isEliteNow && card.dataset.bfAutoElite !== '1') {
        transformHeroToElite(card);
      }
      // Keep the active-hero aura/ring/tag and status badge always in sync.
      decorateBattleHeroState(card);
      var hp = readHeroHp(card);
      if (hp !== null) {
        if (card.dataset.bfPrevHp !== undefined) {
          var oldHp = parseInt(card.dataset.bfPrevHp, 10);
          if (!isNaN(oldHp) && oldHp > 0 && hp <= 0) playHeroFx(card, 'death', oldHp);
          else if (!isNaN(oldHp) && oldHp <= 0 && hp > 0) playHeroFx(card, 'revive', hp);
          else if (!isNaN(oldHp) && hp < oldHp) playHeroFx(card, 'damage', oldHp - hp);
          else if (!isNaN(oldHp) && hp > oldHp) playHeroFx(card, 'heal', hp - oldHp);
        }
        card.dataset.bfPrevHp = String(hp);
      }
      // Detect a freshly applied status (paralyzed/sleeping/cursed) and pop an fx.
      var st = heroStatusOf(card);
      if (card.dataset.bfPrevStatusFx !== undefined && card.dataset.bfPrevStatusFx !== st && st) {
        playStatusFx(card, st);
      }
      card.dataset.bfPrevStatusFx = st;
    });
  }
  function playStatusFx(card, st) {
    var info = STATUS_INFO[st];
    if (!info) return;
    if (st === 'paralyzed') { playHeroFx(card, 'paralyze'); return; }
    if (st === 'frozen') { addOverlayFx(card, '<div class="bf-fx-frost-burst"></div><div class="bf-fx-float bf-fx-status-txt" style="color:#8fe6ff">❄ CONGELADO</div>', 1300); return; }
    if (st === 'blessed') { addOverlayFx(card, '<div class="bf-fx-bless-burst"></div><div class="bf-fx-float bf-fx-status-txt" style="color:#ffe49a">😇 BENDITO</div>', 1300); return; }
    var color = st === 'sleeping' ? '#8aaaff' : st === 'blessed' ? '#ffe49a' : st === 'paralyzed' ? '#ffe14a' : '#c79bff';
    addOverlayFx(card, '<div class="bf-fx-float bf-fx-status-txt" style="color:' + color + '">' + info.ico + ' ' + info.label + '</div>', 1300);
  }
  function getBattleCard(side, id) {
    return document.getElementById('b_' + side + '_' + id);
  }
  function cardCenter(card) {
    if (!card) return null;
    var r = card.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, card: card };
  }
  function targetCenter(side, id) {
    return cardCenter(getBattleCard(side, id));
  }
  function elementColor(el) {
    var map = { fuego:'#ff5a2a', hielo:'#5ad0ff', rayo:'#ffe14a', agua:'#3aa0ff', curacion:'#5fffa0', proteccion:'#ffd23a', arcano:'#c79bff', estado:'#c79bff' };
    return map[el] || '#ffffff';
  }
  function launchProjectile(from, to, kind, color) {
    if (!from || !to) return;
    var p = document.createElement('div');
    p.className = 'bf-fx-projectile ' + (kind === 'arrow' ? 'bf-fx-arrow-proj' : 'bf-fx-bullet');
    p.textContent = kind === 'arrow' ? '➤' : '•';
    p.style.left = from.x + 'px'; p.style.top = from.y + 'px'; p.style.color = color || (kind === 'arrow' ? '#c6ff8a' : '#ffe49a');
    var ang = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI; p.style.transform = 'translate(-50%,-50%) rotate(' + ang + 'deg)';
    document.body.appendChild(p);
    requestAnimationFrame(function() { p.style.left = to.x + 'px'; p.style.top = to.y + 'px'; });
    setTimeout(function() { if (p.parentNode) p.parentNode.removeChild(p); }, 430);
  }
  function launchMagic(from, to, el) {
    if (!from || !to) return;
    var orb = document.createElement('div'); orb.className = 'bf-fx-magic-orb';
    orb.style.color = elementColor(el); orb.style.left = from.x + 'px'; orb.style.top = from.y + 'px';
    document.body.appendChild(orb);
    requestAnimationFrame(function() { orb.style.left = to.x + 'px'; orb.style.top = to.y + 'px'; orb.style.transform = 'scale(1.35)'; });
    setTimeout(function() { if (orb.parentNode) orb.parentNode.removeChild(orb); }, 560);
  }
  function enhanceCombatEvent(ev) {
    if (!ev || !ev.k) return;
    if (ev.k === 'arrow') { launchProjectile(targetCenter(ev.fromSide, ev.fromId), targetCenter(ev.toSide, ev.toId), 'arrow', '#c6ff8a'); return; }
    if (ev.k === 'hit') {
      var card = getBattleCard(ev.side, ev.id); if (!card) return;
      if (ev.dtype === 'ranged') addOverlayFx(card, '<div class="bf-fx-bigblast"></div>', 740);
      if (ev.dtype === 'spell') addOverlayFx(card, '<div class="bf-fx-spell-wave" style="color:#c79bff"></div>', 780);
      if (Number(ev.dmg || 0) >= 22) addOverlayFx(card, '<div class="bf-fx-bigblast"></div><div class="bf-fx-float bf-fx-dmg">CRÍTICO</div>', 950);
      return;
    }
    if (ev.k === 'spell') {
      var target = getBattleCard(ev.toSide, ev.toId); if (!target) return;
      var actor = document.querySelector('.bhero.active-turn') || target;
      launchMagic(cardCenter(actor), cardCenter(target), ev.el);
      addOverlayFx(target, '<div class="bf-fx-spell-wave" style="color:' + elementColor(ev.el) + '"></div>', 820);
      return;
    }
    if (ev.k === 'death') { var deadCard=getBattleCard(ev.side, ev.id); playHeroFx(deadCard, 'death'); bfGuideReact('shock', '¡OH NO!'); if(deadCard)setTimeout(function(){bfKillCinematic(deadCard);},80); return; }
    if (ev.k === 'elite') { transformHeroToElite(getBattleCard(ev.side, ev.id)); bfGuideReact('wow', '¡RENACE!'); return; }
    if (ev.k === 'heal') { var healed = getBattleCard(ev.side, ev.id); if (healed && healed.classList.contains('bf-dead')) playHeroFx(healed, 'revive', ev.amt); return; }
    if (ev.k === 'manaup' || ev.k === 'shieldup' || ev.k === 'wardup') { var buff = getBattleCard(ev.side || ev.toSide, ev.id || ev.toId); if (buff) addOverlayFx(buff, '<div class="bf-fx-elite-aura"></div>', 900); }
  }
  function patchCombatFx() {
    if (typeof window.flushFx !== 'function' || window.flushFx.__bfEnhanced) return;
    var original = window.flushFx;
    window.flushFx = function(list) {
      original(list);
      setTimeout(function() { (list || []).forEach(enhanceCombatEvent); }, 20);
    };
    window.flushFx.__bfEnhanced = true;
  }
  function bfTankBurstById(id) { ['p', 'o'].forEach(function(s) { var c = getBattleCard(s, id); if (c) addOverlayFx(c, '<div class="bf-fx-tank-burst"></div>', 850); }); }
  function patchTankRules() {
    if (window.__bfTankPatched || typeof window.dealDamage !== 'function' || typeof G === 'undefined') return;
    window.__bfTankPatched = true;
    // The active hero declares itself a tank: until its next turn (and while alive)
    // it absorbs every hit aimed at its allies. Uses the turn like any action.
    window.bfTankear = function() {
      if (typeof NET !== 'undefined' && NET.role === 'client' && typeof sendIntent === 'function') { sendIntent('bfTank', {}); if (typeof notif === 'function') notif('🛡️ Tu héroe se planta como MURO DE HIERRO.'); return; }
      var BB = (typeof B !== 'undefined') ? B : null, h = (BB && BB.current) ? getHero(BB.current.side, BB.current.id) : null;
      if (!h) return;
      var card = getBattleCard(BB.current.side, h.id);
      if (h._bfTank) { h._bfTank = false; if (typeof pushLog === 'function') pushLog('li', h.name + ' deja de tanquear.'); if (card) addOverlayFx(card, '<div class="bf-fx-float bf-fx-status-txt" style="color:#ffb43a">Tanque desactivado</div>', 900); if (typeof injectActionPanelBg === 'function') injectActionPanelBg(); if (typeof renderBattle === 'function') renderBattle(); if (typeof netSync === 'function') netSync('s-battle'); return; }
      var otherTank = (G.team && G.team[BB.current.side] || []).find(function(x) { return x && x.alive && x._bfTank && x !== h; }); if (otherTank) { if (typeof notif === 'function') notif(otherTank.name + ' ya está tanqueando. Solo un héroe puede tanquear a la vez.'); return; }
      h._bfTank = true;
      if (typeof pushLog === 'function') pushLog('li', h.name + ' se planta como un MURO DE HIERRO y absorberá los golpes de su equipo.');
      if (card) addOverlayFx(card, '<div class="bf-fx-tank-burst"></div><div class="bf-fx-iron-wall"></div><div class="bf-fx-float bf-fx-status-txt" style="color:#ffb43a">🛡️ MURO DE HIERRO</div>', 1300);
      if (typeof bfGuideReact === 'function') bfGuideReact('cheer', '¡MURO!');
      if (typeof finishAct === 'function') finishAct();
    };
    // Living ally tank on the same team as the target (never the target itself).
    function bfTankProtector(target) {
      if (!target) return null;
      var side = tSide(target);
      return (G.team && G.team[side] || []).find(function(x) { return x && x.alive && x._bfTank && x !== target; }) || null;
    }
    // Redirect any hit aimed at a protected ally onto the tank that's soaking.
    var originalDealDamage = window.dealDamage;
    window.dealDamage = function(target, amount, opts) { var prot = bfTankProtector(target); if (prot) { if (typeof pushLog === 'function') pushLog('li', '🛡️ ' + prot.name + ' intercepta el golpe dirigido a ' + target.name + '.'); bfTankBurstById(prot.id); return originalDealDamage.call(this, prot, amount, opts); } return originalDealDamage.apply(this, arguments); };
    // Tank protection lasts until the tank's OWN next turn — clear it then.
    if (typeof window.stepTurn === 'function' && !window.stepTurn.__bfTank) {
      var originalStepTurn = window.stepTurn;
      window.stepTurn = function() { var BB = (typeof B !== 'undefined') ? B : null; if (BB && BB.current) { var cur = getHero(BB.current.side, BB.current.id); if (cur && cur._bfTank) cur._bfTank = false; } return originalStepTurn.apply(this, arguments); };
      window.stepTurn.__bfTank = 1;
    }
    // Reintento del "Tanquear" remoto: si el intent llega mientras el host está ocupado (animación/acción pendiente), antes se descartaba en silencio y el invitado se quedaba "pillado". Ahora se reintenta hasta ~4s.
    window.__bfTryTank = function(attempt) { var ok = (typeof B !== 'undefined') && B && B.current && B.current.side === 'o' && !B.over && !B.pending; if (ok) { if (typeof window.bfTankear === 'function') window.bfTankear(); return; } if ((attempt || 0) < 20 && typeof B !== 'undefined' && B && !B.over) setTimeout(function() { window.__bfTryTank((attempt || 0) + 1); }, 200); };
    if (typeof window.handleIntent === 'function' && !window.handleIntent.__bfTank) {
      var originalHandleIntent = window.handleIntent;
      window.handleIntent = function(msg) { if (msg && msg.t === 'intent' && msg.op === 'bfTank') { if (msg.__bfTankDone) return; msg.__bfTankDone = 1; window.__bfTryTank(0); return; } if (msg && msg.t === 'intent' && msg.op === 'bfDebtBid') { if (G.phaseNeeds && !G.phaseNeeds.o) return; if (G.bidsIn && G.bidsIn.o) return; G.bids = G.bids || {}; G.bids.o = { heroId: msg.heroId, amount: Number(msg.amount || 0), debt: true }; if (G.bidsIn) G.bidsIn.o = true; if (typeof renderRecruit === 'function') renderRecruit('p'); if (typeof netSync === 'function') netSync('s-recruit'); if (G.bidsIn && G.bidsIn.p && typeof tryResolveRound === 'function') tryResolveRound(); return; } if (msg && msg.t === 'intent' && msg.op === 'bfXferEq') { if (typeof window.bfTransferToAuction === 'function') window.bfTransferToAuction('o', msg.amount); return; } if (msg && msg.t === 'intent' && msg.op === 'bfBizarroFill') { if (typeof bfNoCoinDialog === 'function') bfNoCoinDialog('o'); return; } return originalHandleIntent.apply(this, arguments); };
      window.handleIntent.__bfTank = 1;
    }
    // Safety net: own 'data' listener on the host's PeerJS conn so a 'bfTank'
    // intent still runs even if the game's intent router misses it. __bfTankDone
    // dedupes vs the handleIntent wrapper.
    var bfTankConn=null;setInterval(function(){if(typeof NET==='undefined'||NET.role!=='host'||!NET.conn||NET.conn===bfTankConn)return;bfTankConn=NET.conn;try{NET.conn.on('data',function(m){if(!m||m.t!=='intent'||m.op!=='bfTank'||m.__bfTankDone)return;m.__bfTankDone=1;if(typeof window.__bfTryTank==='function')window.__bfTryTank(0);});}catch(e){}},300);
  }
  window.__bfPatchTankRules = patchTankRules;
  // ---- TRANSFORMER spell + token heroes ----
  function patchTransformer() {
    if (window.__bfTransformerPatched || typeof SPELLS === 'undefined' || typeof HEROES === 'undefined' || typeof G === 'undefined' || typeof window.castSpell !== 'function') return;
    window.__bfTransformerPatched = true;
    TOKENS.forEach(function(t) { if (!HEROES.some(function(h){return h && h.id===t.id;})) HEROES.push(t); });
    if (!SPELLS.some(function(s){return s && s.id==='sp_transform';})) SPELLS.push({ id:'sp_transform', name:'Transformer', element:'arcano', kind:'transform', base:1, mana:20, cost:25, foil:true, num:108, txt:'Transforma a uno de los 6 héroes (propio o rival) de forma totalmente aleatoria en un token sorpresivo.' });
    function bfMorph(t, by) {
      var morphPool = TOKENS.filter(function(token){ return token && token.id !== 'tk_patito_goma' && !token._bfDuck; }); var tk = morphPool[Math.floor(Math.random()*morphPool.length)], old = t.name;
      ['name','title','clan','clanColor','type','cc','ad','he','hp','eCc','eAd','eHe','eHp','ability','abilityTxt','eAbility','eTxt','akind','num','art','eliteArt'].forEach(function(k){ t[k]=tk[k]; });
      ART_BY_ID[t.id] = tk.art || ART_BY_ID[tk.id] || ART_BY_ID[t.id]; ELITE_BY_ID[t.id] = tk.eliteArt || tk.art || ELITE_BY_ID[tk.id] || ART_BY_ID[t.id];
      // Reset elite state so the transformed token can ALSO renace Élite when it
      // dies — from the moment it enters play it behaves like any other hero.
      t._token=tk.id; t.eliteMode=false; t.eliteUsed=false; t.abilityUsed=false; t._mods=[]; t.shield=0; t.sleep=0; t.para=0; t.skip=0; t.silence=0; t.evade=0; t.maxHp=tk.hp; t.hp=tk.hp; t.mwep=null; t.rwep=null; t.armor=null;
      if (typeof pushFx==='function') pushFx({ k:'transform', side:tSide(t), id:t.id, tokenId:tk.id });
      if (typeof pushLog==='function') pushLog('lx', by + ': ¡' + old + ' se transforma en ' + tk.name + '!');
    }
    window.bfMorphHero = bfMorph;
    var origCast = window.castSpell;
    window.castSpell = function(id) {
      if (id !== 'sp_transform') return origCast.apply(this, arguments);
      if (typeof NET !== 'undefined' && NET.role === 'client') { if(typeof sendIntent==='function') sendIntent('castSpell',{id:id}); return; }
      var side=B.current.side, h=getHero(side,B.current.id), s=byId(SPELLS,id);
      if (h.mana < s.mana) { if(window.notif) notif('Maná insuficiente'); return; }
      var pool = (living('p')||[]).concat(living('o')||[]).filter(function(t){ return t && t.id !== h.id; });
      if (!pool.length) return;
      var tgt = pool[Math.floor(Math.random()*pool.length)];
      h.mana -= s.mana;
      bfMorph(tgt, h.name+' lanza Transformer');
      if(typeof finishAct==='function') finishAct();
    };
    if (typeof window.castSpell_AI === 'function') {
      var origAi = window.castSpell_AI;
      window.castSpell_AI = function(side,h,s,target){
        if (!s || s.kind !== 'transform') return origAi.apply(this, arguments);
        h.mana -= s.mana;
        var pool = (living('p')||[]).concat(living('o')||[]).filter(function(t){ return t && t.id !== h.id; });
        var tgt = target || (pool.length ? pool[Math.floor(Math.random()*pool.length)] : null);
        if (tgt) bfMorph(tgt, h.name+' lanza Transformer'); if (typeof endTurn==='function') endTurn();
      };
    }
    if (typeof window.flushFx === 'function' && !window.flushFx.__bfTransform) {
      var origFlush = window.flushFx;
      window.flushFx = function(list){ origFlush.apply(this, arguments); setTimeout(function(){ (list||[]).forEach(function(ev){
        if (!ev || ev.k!=='transform') return;
        var card = getBattleCard(ev.side, ev.id); if (!card) return;
        var url=ART_BY_ID[ev.tokenId], art=card.querySelector('.bf-battle-art');
        addOverlayFx(card, '<div class="bf-fx-transform-ring"></div><div class="bf-fx-transform-q">?</div><div class="bf-fx-float bf-fx-status-txt" style="color:#c79bff">✦ TRANSFORM ✦</div>', 1400);
        card.classList.add('bf-transforming');
        setTimeout(function(){if(art&&url){art.style.backgroundImage='url("'+url+'")';card.dataset.bfBattleArt=ev.tokenId;}},360);
        setTimeout(function(){card.classList.remove('bf-transforming');},1300);
        if (typeof bfGuideReact==='function') bfGuideReact('wow','¡TRANSFORM!');
      }); }, 20); };
      window.flushFx.__bfTransform = 1;
    }
  }
  window.__bfPatchTransformer = patchTransformer;
  function patchDuckAbility() {
    if (window.__bfDuckPatched || typeof window.useAbility !== 'function' || typeof window.dealDamage !== 'function') return;
    window.__bfDuckPatched = true;
    var originalUseAbility = window.useAbility, originalDealDamage = window.dealDamage;
    window.useAbility = function(side, hero, done) {
      if (!hero || (hero.akind !== 'duck-summon' && hero.akind !== 'reflect-damage')) return originalUseAbility.apply(this, arguments);
      var complete = typeof done === 'function' ? done : function() { if (typeof finishAct === 'function') finishAct(); };
      if (hero.akind === 'reflect-damage') { hero.abilityUsed = true; if (typeof notif === 'function') notif('✦ ' + hero.name + ': Refracción Arcana se activa automáticamente al recibir daño.'); complete(); return; }
      var duck = (TOKENS || []).find(function(t) { return t && t.id === 'tk_patito_goma'; });
      if (!duck || typeof G === 'undefined' || !G.team) return originalUseAbility.apply(this, arguments);
      var amount = hero.eliteMode ? 4 : 2;
      for (var i = 0; i < amount; i++) {
        var instance = typeof makeInstance === 'function' ? makeInstance(duck) : Object.assign({}, duck);
        instance.id = 'duck_' + Date.now() + '_' + i; instance._token = duck.id; instance._bfDuck = true;
        instance.eliteUsed = true; instance.eliteMode = false; instance.abilityUsed = false;
        instance._mods = []; instance.shield = 0; instance.wardTurns = 0; instance.evade = 0; instance.defending = false;
        instance._bfDuckRetaliate = hero.eliteMode ? 3 : 0;
        instance.maxHp = hero.eliteMode ? 2 : 1; instance.hp = instance.maxHp; instance.alive = true;
        (G.team[side] || (G.team[side] = [])).push(instance);
      }
      hero.abilityUsed = true;
      if (typeof pushLog === 'function') pushLog('lg', hero.name + ' invoca ' + amount + ' Patito' + (amount > 1 ? 's' : '') + ' de Goma bloqueador' + (amount > 1 ? 'es' : '') + '.');
      if (typeof pushFx === 'function') pushFx({ k: 'status', side: side, id: hero.id, txt: '🦆' });
      if (typeof renderBattle === 'function') renderBattle();
      setTimeout(complete, 420);
    };
    window.dealDamage = function(target, amount, opts) {
      if (target && !target._bfDuck) {
        var side = typeof tSide === 'function' ? tSide(target) : null;
        var duck = side && (G.team[side] || []).find(function(h) { return h && h.alive && h._bfDuck; });
        if (duck) { var dealt = originalDealDamage.call(this, duck, amount, opts); if (duck._bfDuckRetaliate && dealt > 0 && typeof B !== 'undefined' && B.current && B.current.side !== side) { var attacker = typeof getHero === 'function' ? getHero(B.current.side, B.current.id) : null; if (attacker && attacker.alive) originalDealDamage.call(this, attacker, duck._bfDuckRetaliate, { type: 'true', bfReflect: true }); } if (!duck.alive && typeof pushLog === 'function') pushLog('li', '🦆 ' + duck.name + ' bloquea el golpe dirigido a ' + target.name + '.'); return dealt; }
      }
      var dealt = originalDealDamage.apply(this, arguments);
      if (target && target.akind === 'reflect-damage' && dealt > 0 && !(opts && opts.bfReflect)) {
        var foes = typeof enemySide === 'function' ? enemySide(typeof tSide === 'function' ? tSide(target) : '') : '';
        var enemies = typeof living === 'function' ? living(foes) : [];
        var reflected = target.eliteMode ? dealt : Math.ceil(dealt / 2);
        var victims = target.eliteMode ? enemies : (enemies.length ? [enemies[Math.floor(Math.random() * enemies.length)]] : []);
        var sourceCard = getBattleCard(typeof tSide === 'function' ? tSide(target) : '', target.id);
        if (sourceCard) addOverlayFx(sourceCard, '<div class="bf-fx-elite-aura"></div><div class="bf-fx-spell-wave" style="color:#c79bff"></div><div class="bf-fx-float bf-fx-status-txt" style="color:#c79bff">↺ REFRACCIÓN</div>', 1050);
        victims.forEach(function(enemy) { var enemyCard = getBattleCard(foes, enemy.id); launchMagic(cardCenter(sourceCard), cardCenter(enemyCard), 'arcano'); originalDealDamage.call(this, enemy, reflected, { type: 'spell', element: 'arcano', bfReflect: true }); if (typeof pushFx === 'function') pushFx({ k: 'spell', toSide: foes, toId: enemy.id, el: 'arcano' }); });
        if (victims.length && typeof pushLog === 'function') pushLog('li', '✦ ' + target.name + ' devuelve ' + reflected + ' de daño mágico con Refracción Arcana.');
      }
      return dealt;
    };
  }
  function patchAbilityVisuals() {
    if (window.__bfAbilityVisuals || typeof window.useAbility !== 'function') return;
    window.__bfAbilityVisuals = true;
    var originalUseAbility = window.useAbility;
    window.useAbility = function(side, hero, done) {
      if (hero) playUniqueAbilityFx(side, hero);
      return originalUseAbility.apply(this, arguments);
    };
  }
  function patchGameRules() {
    if (window.__bfRulesPatched || typeof HEROES === 'undefined' || typeof BONUS === 'undefined' || typeof G === 'undefined') return;
    window.__bfRulesPatched = true;
    if (typeof window.modal === 'function' && !window.modal.__bfHooked) { var origModal = window.modal; window.modal = function(html) { if (bfInBattle() && html && typeof html === 'string') { var temp = document.createElement('div'); temp.innerHTML = html; var modified = false, active = bfActiveHero(); if (active && active.hero) { temp.querySelectorAll('button').forEach(function(el) { var found = bfFindItemByName(el.textContent || ''); if (found && found.item) { var eff = bfCalcEffective(found.kind, found.item, active.card, true); if (eff && !el.dataset.bfEff) { el.dataset.bfEff = '1'; var ed = document.createElement('div'); ed.innerHTML = eff; ed.style.cssText = 'font-size:11.5px;margin-top:3px;font-weight:700;text-transform:none;letter-spacing:0;color:'+(found.kind==='spell'?'#ff9eb5':'#8effb2'); el.appendChild(ed); modified = true; } } }); } if (modified) html = temp.innerHTML; } return origModal.apply(this, arguments); }; window.modal.__bfHooked = true; }
    // Updated "how to play" rules, including auction rules, combat actions and every battle status.
    if (typeof window.rulesBody === 'function' && !window.rulesBody.__bf) {
      window.rulesBody = function() { var RI='https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/'; var _ic={cc:RI+'fefda0ace_generated_image.png',ad:RI+'210f89d43_generated_image.png',he:RI+'7c59e1ff7_generated_image.png',item:RI+'90ff926d5_generated_image.png',def:RI+'1d9e5fb8f_generated_image.png',tank:RI+'b5ca5c078_generated_image.png',roleCC:RI+'ab147bafb_generated_image.png',roleAD:RI+'fd388871c_generated_image.png',roleHE:RI+'cfd5e317c_generated_image.png'}; var _S='<style>.rb-step{display:flex;gap:12px;align-items:flex-start;background:linear-gradient(135deg,rgba(28,16,46,.7),rgba(12,7,20,.85));border:1px solid rgba(255,210,74,.28);border-radius:14px;padding:12px 14px;margin:10px 0;box-shadow:0 6px 16px rgba(0,0,0,.4)}.rb-step-n{flex:0 0 34px;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:"Cinzel",serif;font-weight:1000;font-size:16px;color:#3a2600;background:radial-gradient(circle at 35% 30%,#ffeaa6,#FFD24A 50%,#a9771f);border:2px solid #7c5410;box-shadow:0 2px 8px rgba(0,0,0,.5)}.rb-step-b{flex:1}.rb-step-t{font-family:"Cinzel",serif;font-weight:900;color:#ffd24a;font-size:14.5px;letter-spacing:.3px;margin-bottom:3px;text-shadow:0 1px 3px #000}.rb-step-x{color:#efe9dc;font-size:12.5px;line-height:1.4}.rb-emb{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;border:1.5px solid rgba(255,210,74,.6);box-shadow:0 0 8px rgba(255,210,74,.4);overflow:hidden;background:radial-gradient(circle at 40% 30%,#1a0a00,#0a0500);vertical-align:middle;flex:0 0 30px}.rb-emb img{width:100%;height:100%;object-fit:cover;display:block}.rb-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0 4px}.rb-act{display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;background:linear-gradient(180deg,rgba(20,10,35,.85),rgba(10,5,15,.95));border:1px solid rgba(255,210,74,.4);border-radius:12px;padding:9px 6px}.rb-act-im{width:42px;height:42px;border-radius:50%;border:2px solid rgba(255,210,74,.6);box-shadow:0 0 10px rgba(255,210,74,.5);overflow:hidden;background:radial-gradient(circle at 40% 30%,#1a0a00,#0a0500)}.rb-act-im img{width:100%;height:100%;object-fit:cover;display:block}.rb-act-t{font-family:"Cinzel",serif;font-weight:900;color:#ffd24a;font-size:11.5px;letter-spacing:.2px}.rb-act-x{color:#d8d0e4;font-size:10px;line-height:1.25}.rb-act-ab{grid-column:1/-1;flex-direction:row;text-align:left;gap:11px;border:2px solid rgba(255,210,74,.7);background:linear-gradient(135deg,rgba(28,16,46,.96),rgba(12,7,20,.98))}.rb-act-ab .rb-act-im{width:46px;height:46px;flex:0 0 46px}.rb-act-ab .rb-act-b{flex:1}.rb-cap{font-size:10.5px;color:#b8aacb;text-align:center;margin:2px 0 8px;font-style:italic}</style>'; return '<div class="rules-body">' + _S + '<p><b>🎯 Objetivo:</b> arma un equipo de <b>3 héroes</b> y derrota a los 3 del rival.</p>' + '<div class="rb-step"><div class="rb-step-n">1</div><div class="rb-step-b"><div class="rb-step-t">Subasta · 3 fases</div><div class="rb-step-x">Una fase para cada tipo de héroe: <span class="rb-emb"><img src="'+_ic.roleCC+'"></span> <b>cuerpo a cuerpo</b>, <span class="rb-emb"><img src="'+_ic.roleAD+'"></span> <b>distancia</b> y <span class="rb-emb"><img src="'+_ic.roleHE+'"></span> <b>magia</b>. En cada fase ves <b>6 héroes</b> y eliges uno con una <b>puja sellada</b> (a ciegas): quien ofrezca más se lo lleva. Cada ronda trae un <b>bonificador único</b> (no se repite): más monedas o un castigo al rival. Tus monedas de equipamiento <b>ya incluyen las de la subasta</b>: cada puja que pagues se resta de ese presupuesto.</div></div></div>' + '<p style="margin:8px 0"><b>✦ Cartas Épicas.</b> Las más poderosas, cuestan <b>+20 monedas</b>. No salen normalmente, pero ciertos bonificadores hacen que <b>tú</b> (o tu <b>rival</b>) recibáis una oferta Épica extra.</p>' + '<p style="margin:8px 0"><b>🏦 ¿Sin monedas en la última fase?</b> No te quedas sin tu tercer héroe: reclutas <b>con deuda</b> y lo que falte se resta de tu presupuesto de equipamiento. El resumen de la ronda te lo indica.</p>' + '<div class="rb-step"><div class="rb-step-n">2</div><div class="rb-step-b"><div class="rb-step-t">Equipamiento</div><div class="rb-step-x">Tu presupuesto de equipamiento es una base de <b>100 monedas</b> más las que no gastaste en la subasta (las pujas pagadas ya están restadas). Con él equipas a cada héroe con <b>1 arma</b> (cuerpo a cuerpo <i>o</i> distancia) y <b>1 armadura</b>. Los hechizos y objetos van a tu <b>mano</b> para la batalla.</div></div></div>' + '<div class="rb-step"><div class="rb-step-n">3</div><div class="rb-step-b"><div class="rb-step-t">Combate por rondas</div><div class="rb-step-x">Orden de turnos: <b>distancia → hechizos → cuerpo a cuerpo</b> (si empatan, va antes quien tenga más velocidad). En el turno de cada héroe verás este <b>panel de acciones</b>:</div></div></div>' + '<div class="rb-actions"><div class="rb-act"><div class="rb-act-im"><img src="'+_ic.cc+'"></div><div class="rb-act-t">Cuerpo a cuerpo</div><div class="rb-act-x">Golpe melé: daño = tu <b>CC</b> + arma.</div></div><div class="rb-act"><div class="rb-act-im"><img src="'+_ic.ad+'"></div><div class="rb-act-t">Disparo</div><div class="rb-act-x">Necesita arma a distancia; daño por potencia × tu <b>AD</b>.</div></div><div class="rb-act"><div class="rb-act-im"><img src="'+_ic.he+'"></div><div class="rb-act-t">Hechizo</div><div class="rb-act-x">Usa <b>HE</b> y gasta <b>maná</b>.</div></div><div class="rb-act rb-act-ab"><div class="rb-act-im"><img src="'+_ic.roleHE+'"></div><div class="rb-act-b"><div class="rb-act-t">Habilidad del héroe</div><div class="rb-act-x">El poder especial propio de ese héroe (cada uno el suyo). Se lee en la franja dorada del panel.</div></div></div><div class="rb-act"><div class="rb-act-im"><img src="'+_ic.item+'"></div><div class="rb-act-t">Objeto</div><div class="rb-act-x">Juega un objeto de tu mano (poción, maná…).</div></div><div class="rb-act"><div class="rb-act-im"><img src="'+_ic.def+'"></div><div class="rb-act-t">Defender</div><div class="rb-act-x">Te cubres: recibes menos daño este turno.</div></div><div class="rb-act"><div class="rb-act-im"><img src="'+_ic.tank+'"></div><div class="rb-act-t">Tanquear</div><div class="rb-act-x">Atraes los ataques rivales para proteger al equipo.</div></div></div>' + '<div class="rb-cap">Así se ve el panel del héroe activo en batalla.</div>' + '<p style="margin:8px 0"><b>⚡ Importante:</b> <b>cada acción gasta el turno</b> de ese héroe. El maná es una reserva fija para toda la batalla que <b>no se regenera</b>: recupéralo con Cristal u Orbe de Maná.</p>' + '<p style="margin:8px 0"><b>🛡️ Armaduras:</b> reducen el daño de golpes, disparos y hechizos. Las <b>elementales</b> anulan por completo su elemento contrario (agua↔fuego, rayo↔agua, hielo↔rayo, fuego↔hielo). La <b>Barrera Arcana</b> protege del daño mágico.</p>' + '<p style="margin:8px 0"><b style="color:#ffaa00">⭐ Forma Élite:</b> cuando un héroe cae por primera vez, <b>renace</b> con parte de su vida y stats mejorados, según su raza (los No-muertos renacen con más). Si vuelve a caer, muere de verdad (salvo Pluma Fénix para revivir, o Ave Fénix para curar a dos héroes a vida completa).</p>' + '<div style="margin:12px 0;padding:12px 14px;border-radius:14px;background:linear-gradient(135deg,rgba(28,16,46,.8),rgba(12,7,20,.9));border:1px solid rgba(255,210,74,.35)"><div class="rb-step-t">✨ Estados de combate</div><div class="rb-step-x"><b>💤 Dormido:</b> pierde su próximo turno.<br><b>⚡ Paralizado:</b> pierde su próximo turno.<br><b>❄ Congelado:</b> actúa con velocidad reducida.<br><b>☠ Maldito:</b> sufre una reducción temporal de atributos.<br><b>✦ Bendito:</b> recibe un aumento temporal de atributos.<br><b>🛡 Tanqueando:</b> intercepta los ataques a sus aliados hasta su próximo turno.<br><b>★ Confuso:</b> dura 2 turnos (3 en Élite) y tiene un 50% de probabilidad de perder cada acción.<br><b>◉ Borracho:</b> recibe 3 de daño, pierde 3 CC, AD y HE durante 2 turnos (3 en Élite) y tiene un 35% de probabilidad de fallar cada acción.</div></div>' + '<p style="margin:8px 0 2px"><b>Consulta también las</b> <span class="rules-link" onclick="racesModal()">🧬 razas</span>.</p></div>'; };
      window.rulesBody.__bf = 1; if (typeof window.modal === 'function') { window.rulesModalStatic = function() { window.modal('<h3>📖 Cómo se juega</h3>' + window.rulesBody()); }; }
    }
    if (typeof window.roleIcon === 'function' && !window.roleIcon.__bf) {
      window.roleIcon = function(t) { var M = { CC: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ab147bafb_generated_image.png', AD: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/fd388871c_generated_image.png', HE: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/cfd5e317c_generated_image.png' }; return '<img class="bf-role-emblem" src="' + (M[t] || M.HE) + '" alt="">'; };
      window.roleIcon.__bf = 1;
    }
    if (typeof window.renderSetup === 'function' && !window.renderSetup.__bf) {
      var bfOrigRenderSetup = window.renderSetup;
      window.renderSetup = function() { var r = bfOrigRenderSetup.apply(this, arguments); var box = document.getElementById('s-setup'); if (box) { var ic = box.querySelectorAll('.mode-icon'); var urls = ['https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/6a8371b6d_generated_image.png','https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/392a70151_generated_image.png']; ic.forEach(function(el,i){if(!urls[i])return;el.textContent='';el.style.cssText='background:none!important;padding:0!important;overflow:hidden!important;';var img=document.createElement('img');img.src=urls[i];img.style.cssText='width:100%;height:100%;object-fit:cover;display:block;border-radius:50%;';el.appendChild(img);}); } return r; };
      window.renderSetup.__bf = 1;
    }
    HEROES.forEach(function(h) {
      if (h.clan === 'Épicas' && h.__bfEpicRaised !== 1) {
        h.cost = Number(h.cost || 0) + 10;
        h.__bfEpicRaised = 1;
      }
      // Inject the official Base Set card number so cardFace can render "Nº XXX".
      var idx = HERO_IDS.indexOf(h.id);
      if (idx >= 0) h.num = idx + 1;
    });
    if (!BONUS.some(function(b) { return b.id === 'epic_self'; })) {
      BONUS.push({ id: 'epic_self', name: 'Convocatoria Épica', type: 'BON', effect: 0, txt: 'En esta subasta sólo tú verás una criatura Épica para pujar.' });
    }
    if (!BONUS.some(function(b) { return b.id === 'epic_rival'; })) {
      BONUS.push({ id: 'epic_rival', name: 'Destino Épico Rival', type: 'RES', effect: 0, txt: 'En esta subasta tu rival verá una criatura Épica para pujar.' });
    }
    // Force at least 6 candidates per auction round (épicas never in normal slate).
    var TARGET_CANDS = 6;
    if (typeof window.drawRaceSlate === 'function' && !window.drawRaceSlate.__bf6) {
      var originalDrawRaceSlate = window.drawRaceSlate;
      window.drawRaceSlate = function(pool) {
        // Strip épicas, Bizarros and heroes already owned by either team before handing it to the original function.
        var owned = {}; ['p','o'].forEach(function(s) { (G.team && G.team[s] || []).forEach(function(h) { if (h) owned[h.id] = true; }); }); var safePool = (pool || []).filter(function(h) { return h && h.clan !== 'Épicas' && h.clan !== 'Bizarros' && !String(h.id || '').startsWith('tk_') && !owned[h.id]; });
        var out = (originalDrawRaceSlate.apply(this, [safePool]) || []).filter(function(h) { return h && h.clan !== 'Épicas' && h.clan !== 'Bizarros' && !String(h.id || '').startsWith('tk_') && !owned[h.id]; });
        if (out.length >= TARGET_CANDS) return out;
        var chosen = {};
        out.forEach(function(h) { if (h) chosen[h.id] = true; });
        var rest = safePool.filter(function(h) { return h && !chosen[h.id]; });
        // shuffle the remaining pool
        for (var i = rest.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = rest[i]; rest[i] = rest[j]; rest[j] = t;
        }
        for (var k = 0; k < rest.length && out.length < TARGET_CANDS; k++) {
          out.push(rest[k]);
        }
        return out;
      };
      window.drawRaceSlate.__bf6 = 1;
    }
    function findHero(heroId) { var lists = [G.cands || []]; if (G.epicCands) lists = lists.concat(Object.values(G.epicCands)); lists.push(HEROES || []); for (var i = 0; i < lists.length; i++) { var found = (lists[i] || []).find(function(h) { return h && h.id === heroId; }); if (found) return found; } return null; }
    // Bonus modifiers on the FINAL bid value: add = own bonus, sub = rival restador.
    window.bidMods = function(side) {
      var mb = G.bonus && G.bonus[side], ob = G.bonus && G.bonus[other(side)];
      return { add: (mb && mb.type === 'BID_ADD') ? Number(mb.effect || 0) : 0, sub: (ob && ob.type === 'BID_SUB') ? Number(ob.effect || 0) : 0 };
    };
    window.minRawBid=function(s,h){return!h?0:Math.max(0,Number(h.cost||0));};
    window.bfBidDelta=function(s){var mb=G.bonus&&G.bonus[s],rb=G.bonus&&G.bonus[other(s)],d=0,l='';if(mb&&mb.type==='BID_ADD'){d+=Number(mb.effect||0);l='+'+Number(mb.effect||0)+' '+mb.name;}if(rb&&rb.type==='BID_SUB'){d-=Number(rb.effect||0);l=(l?l+' · ':'')+'-'+Number(rb.effect||0)+' '+rb.name;}return{delta:d,label:l};};
    window.bfDefaultBid=function(s,h){if(!h)return 0;return Math.max(0,Number(h.cost||0));};
    window.bfUpdateBidPreview=function(id){var bx=document.getElementById('bidcalc_'+id);if(!bx)return;var s=humanSide(),h=((G.epicCands&&G.epicCands[s])||G.cands||[]).find(function(x){return x&&x.id===id;});if(!h)return;var inp=document.getElementById('bid_'+id),bid=inp?(parseInt(inp.value||'0',10)||0):window.bfDefaultBid(s,h),mb=G.bonus&&G.bonus[s],rb=G.bonus&&G.bonus[other(s)],a=(mb&&mb.type==='BID_ADD')?Number(mb.effect||0):0,u=(rb&&rb.type==='BID_SUB')?Number(rb.effect||0):0,pd=Math.max(0,bid-a+u),html='<div style="color:#ffe49a">Tu puja: <b>'+bid+'</b> 🪙</div>';if(a>0)html+='<div style="color:#54e876">Tu bonificador: <b>−'+a+' 🪙 al pagar</b> <span style="font-weight:700;opacity:.85">('+mb.name+')</span></div>';if(u>0)html+='<div style="color:#ff6b6b">El rival te resta: <b>+'+u+' 🪙 al pagar</b> <span style="font-weight:700;opacity:.85">('+rb.name+')</span></div>';if(a>0||u>0)html+='<div style="color:#FFD24A;margin-top:2px;border-top:1px solid rgba(255,210,74,.22);padding-top:3px">Si ganas pagarás: <b>'+pd+' 🪙</b></div>';else html+='<div style="color:#FFD24A;margin-top:2px;border-top:1px solid rgba(255,210,74,.22);padding-top:3px">Si ganas pagarás <b>'+bid+' 🪙</b></div>';bx.innerHTML=html;};
    function adjustBid(s,id,amt){var h=findHero(id);if(!h)return amt;var c=Number((G.coins&&G.coins[s])||0),mr=window.minRawBid(s,h),m=window.bidMods(s),mx=c+m.add-m.sub;if(mx<mr)return null;var b=Number(amt||0);return b<mr?mr:(b>mx?mx:b);}
    function patchBidInputs(){var all=(G.cands||[]).slice();if(G.epicCands)Object.values(G.epicCands).forEach(function(l){all=all.concat(l||[]);});all.forEach(function(h){var inp=document.getElementById('bid_'+h.id);if(!inp)return;var s=humanSide(),mr=window.minRawBid(s,h),m=window.bidMods(s),c=Number((G.coins&&G.coins[s])||0);inp.min=String(mr);inp.max=String(Math.max(0,c+m.add-m.sub));if(!inp.dataset.bfTouched)inp.value=String(window.bfDefaultBid(s,h));if(!inp.dataset.bfTouchBound){inp.dataset.bfTouchBound='1';inp.addEventListener('input',function(){this.dataset.bfTouched='1';});}window.bfUpdateBidPreview(h.id);});} function bfPlayCoinFlight(fromEl,toEl){if(!fromEl||!toEl)return;var fr=fromEl.getBoundingClientRect(),tr=toEl.getBoundingClientRect();var fx=fr.left+fr.width/2,fy=fr.top+fr.height/2,tx=tr.left+tr.width/2,ty=tr.top+tr.height/2;for(var i=0;i<8;i++){(function(i){setTimeout(function(){var c=document.createElement('div');c.className='bf-coin-fly';c.textContent='🪙';c.style.left=fx+'px';c.style.top=fy+'px';c.style.transform='translate(-50%,-50%) rotate(0deg) scale(1.15)';c.style.opacity='1';document.body.appendChild(c);void c.offsetWidth;requestAnimationFrame(function(){requestAnimationFrame(function(){c.style.left=tx+'px';c.style.top=ty+'px';c.style.transform='translate(-50%,-50%) rotate('+(Math.random()*640-320)+'deg) scale(1.15)';c.style.opacity='.1';});});setTimeout(function(){if(c.parentNode)c.parentNode.removeChild(c);},800);},i*60);})(i);}} window.bfTransferToAuction=function(side,amt,btnEl){if(typeof NET!=='undefined'&&NET.role==='client'){if(typeof sendIntent==='function')sendIntent('bfXferEq',{amount:amt});return;}if(typeof G==='undefined')return;if(!G.bfEquipXfer)G.bfEquipXfer={p:0,o:0};var left=100-(G.bfEquipXfer[side]||0);var t=Math.max(0,Math.min(Number(amt||0),left));if(t<=0){if(window.notif)notif('Ya has transferido el máximo de 100 monedas de equipamiento a la subasta.');return;}var panel=btnEl&&btnEl.closest?btnEl.closest('.side-panel'):null;var rows=panel?panel.querySelectorAll('.coins-row .coins-num'):null;if(rows&&rows[0]&&rows[1])bfPlayCoinFlight(rows[1],rows[0]);G.coins[side]=(G.coins[side]||0)+t;G.bfEquipXfer[side]=(G.bfEquipXfer[side]||0)+t;if(window.notif)notif('🪙 Transferidas '+t+' monedas de equipamiento a la subasta.');if(typeof renderRecruit==='function')renderRecruit('p');if(typeof patchBidInputs==='function')patchBidInputs();if(typeof netSync==='function')netSync('s-recruit');}; window.bfEqXferBtn=function(side){var human=(typeof NET!=='undefined'&&NET.role==='client')?NET.mySide:'p';if(side!==human)return '';var left=100-((typeof G!=='undefined'&&G.bfEquipXfer&&G.bfEquipXfer[side])||0);return '<button type="button" class="bf-xfer-btn" onclick="event.stopPropagation();window.bfTransferToAuction(&quot;'+side+'&quot;,10,this)">↷ Transferir 10 🪙 a la subasta <span class="bf-xfer-left">(quedan '+Math.max(0,left)+')</span></button>';};
    function epicPoolForCurrentType(){var t=(G.cands&&G.cands[0]&&G.cands[0].type)||G.curType||G.phaseType||G.auctType;var u={};['p','o'].forEach(function(s){(G.team&&G.team[s]||[]).forEach(function(h){u[h.id]=1;});});(G.cands||[]).forEach(function(h){if(h)u[h.id]=1;});var p=HEROES.filter(function(h){return h.clan==='Épicas'&&(!t||h.type===t)&&!u[h.id];});if(!p.length)p=HEROES.filter(function(h){return h.clan==='Épicas'&&!u[h.id];});return p;}
    // Each flagged side sees the normal candidates PLUS one epic hero; the other side keeps seeing only G.cands.
    function prepareEpicOffers() { G.epicCands = {}; if (!G.forceEpic) return; var baseCands = (G.cands || []).slice(); ['p','o'].forEach(function(side) { if (!G.forceEpic[side]) return; var pool = epicPoolForCurrentType(); if (!pool.length) return; var h = pool[Math.floor(Math.random() * pool.length)]; G.epicCands[side] = baseCands.concat([h]); }); G.forceEpic = {}; }
    var originalApplyBonus = window.applyBonus;
    window.applyBonus = function(side, b) {
      if (!G.forceEpic) G.forceEpic = {};
      if (b && b.id === 'epic_self') G.forceEpic[side] = true;
      if (b && b.id === 'epic_rival') G.forceEpic[other(side)] = true;
      return originalApplyBonus.apply(this, arguments);
    };
    function epicBonusById(id) { return (BONUS || []).find(function(b) { return b && b.id === id; }) || null; }
    // Sometimes swap the round bonus for an epic bonus card so they show up.
    function maybeForceEpicBonus() {
      var self = epicBonusById('epic_self');
      var rival = epicBonusById('epic_rival');
      if (!self || !rival || !G.bonus) return;
      ['p','o'].forEach(function(side) {
        var cur = G.bonus[side];
        // Don't override an already-epic pick.
        if (cur && (cur.id === 'epic_self' || cur.id === 'epic_rival')) return;
        var roll = Math.random();
        if (roll < 0.18) G.bonus[side] = self;
        else if (roll < 0.34) G.bonus[side] = rival;
      });
    }
    // Bonus/restador cards are UNIQUE per game (epics exempt): once used as a
    // round bonus for either side, a card never reappears in any later phase.
    function enforceUniqueBonuses() {
      if (!G.bonus) return;
      var used = G.__bfUsedBonus || (G.__bfUsedBonus = {});
      var pool = (BONUS || []).filter(function(b) { return b && b.id; });
      ['p','o'].forEach(function(side) {
        var cur = G.bonus[side], oth = G.bonus[side === 'p' ? 'o' : 'p'], othId = oth && oth.id;
        if (!cur || used[cur.id] || (othId && cur.id === othId)) {
          var avail = pool.filter(function(b) { return !used[b.id] && b.id !== othId; });
          if (avail.length) G.bonus[side] = avail[Math.floor(Math.random() * avail.length)];
        }
        if (G.bonus[side] && G.bonus[side].id) used[G.bonus[side].id] = true;
      });
    }
    var originalStartAuctionPhase = window.startAuctionPhase;
    window.startAuctionPhase = function() {
      // Intercept applyBonus so we can finalize G.bonus before its effects and UI rendering
      var realApply = window.applyBonus; window.applyBonus = function(side, b) { /* delayed */ };
      if (G.pools) { ['CC','AD','HE'].forEach(function(t) { G.pools[t] = (G.pools[t] || []).filter(function(h) { return h && h.clan !== 'Épicas' && h.clan !== 'Bizarros' && !String(h.id || '').startsWith('tk_'); }); }); }
      var ret = originalStartAuctionPhase.apply(this, arguments);
      window.applyBonus = realApply; maybeForceEpicBonus(); enforceUniqueBonuses();
      ['p','o'].forEach(function(side) { if (G.bonus && G.bonus[side] && typeof window.applyBonus === 'function') window.applyBonus(side, G.bonus[side]); });
      prepareEpicOffers();
      if (typeof window.renderRecruit === 'function') window.renderRecruit('p');
      if (typeof window.netSync === 'function') window.netSync('s-recruit');
      return ret;
    };
    function humanSide() {
      if (typeof NET !== 'undefined' && NET.role === 'client' && NET.mySide) return NET.mySide;
      return 'p';
    }
    var originalBeginBidRound = window.beginBidRound;
    window.beginBidRound = function() {
      if (!G.forceEpic) G.forceEpic = {};
      ['p','o'].forEach(function(side) { if (G.bonus && G.bonus[side]) { if (G.bonus[side].id === 'epic_self') G.forceEpic[side] = true; if (G.bonus[side].id === 'epic_rival') G.forceEpic[side==='p'?'o':'p'] = true; } });
      var ret = originalBeginBidRound.apply(this, arguments);
      prepareEpicOffers(); renderRecruit(humanSide());
      if (typeof NET !== 'undefined' && NET.role !== 'client') netSync('s-recruit');
      return ret;
    };
    var originalRenderRecruit = window.renderRecruit;
    window.renderRecruit = function(forSide) {
      var saved = G.cands;
      if (!G.phaseResult && G.epicCands && G.epicCands[forSide]) G.cands = G.epicCands[forSide];
      var ret = originalRenderRecruit.apply(this, arguments);
      G.cands = saved;
      patchBidInputs();
      return ret;
    };
    function isLastAuct(){var tl=(G.team&&G.team['p']&&G.team['p'].length)||0;if(tl>=2)return true;var c=(G.epicCands&&G.epicCands['p'])||G.cands||[];return c.length>0&&c[0]&&c[0].type==='HE';}
    function bfAssignBizarro(side){var pool=(typeof TOKENS!=='undefined')?TOKENS:[];if(!pool.length)return null;var tk=pool[Math.floor(Math.random()*pool.length)];var inst=(typeof makeInstance==='function')?makeInstance(tk):Object.assign({},tk);inst.boughtFor=0;inst._token=tk.id;if(!G.team[side])G.team[side]=[];G.team[side].push(inst);if(G.phaseNeeds)G.phaseNeeds[side]=false;if(typeof pushLog==='function')pushLog('lx','⚠️ Sin monedas suficientes: el equipo de '+((G.names&&G.names[side])||side)+' se completa con el héroe Bizarro «'+tk.name+'».');return tk;} function bfBizarroEligible(side){var xl=100-((G.bfEquipXfer&&G.bfEquipXfer[side])||0);return Number((G.coins&&G.coins[side])||0)<=0&&xl<=0;} function bfNoCoinDialog(side){if(typeof NET!=='undefined'&&NET.role==='client'){if(typeof sendIntent==='function')sendIntent('bfBizarroFill',{});return;}var tk=bfAssignBizarro(side);if(!tk)return;if(G.bidsIn)G.bidsIn[side]=true;if(window.notif)notif('Sin monedas suficientes: se añade automáticamente el héroe Bizarro «'+tk.name+'» a tu equipo.');bfGuideReact('shock','¡BIZARRO!');var oth=side==='p'?'o':'p';var isOnline=typeof NET!=='undefined'&&NET.role==='host';if(isOnline){if(!G.bids[side])G.bids[side]={pass:true};if(typeof renderRecruit==='function')renderRecruit('p');if(typeof netSync==='function')netSync('s-recruit');if(typeof tryResolveRound==='function')tryResolveRound();return;}if(!G.bidsIn||G.bidsIn[oth]!==true){if(typeof window.aiBid==='function'){try{window.aiBid(oth);}catch(e){}}if(!G.bids[oth])G.bids[oth]={pass:true};if(G.bidsIn)G.bidsIn[oth]=true;}if(!G.bids[side])G.bids[side]={pass:true};if(typeof window.resolveBidRound==='function')window.resolveBidRound();else{if(typeof renderRecruit==='function')renderRecruit('p');if(typeof netSync==='function')netSync('s-recruit');}};
    var originalSubmitBid = window.submitBid;
    window.submitBid = function(s, id) {
      var inp=document.getElementById('bid_'+id),raw=inp?(parseInt(inp.value||'0',10)||0):0,amt=adjustBid(s,id,raw),h=findHero(id);
      if(amt===null){
        var c=Number((G.coins&&G.coins[s])||0),p=(G.epicCands&&G.epicCands[s])||G.cands||[],ch=p.reduce(function(m,x){return x&&Number(x.cost||0)<m?Number(x.cost||0):m;},Infinity),m=window.bidMods(s),req=ch-m.add+m.sub;
        if(c<req&&ch<Infinity){bfGuideReact('shock','¡SIN MONEDAS!');var _xl=100-((G.bfEquipXfer&&G.bfEquipXfer[s])||0);if(_xl>0){if(window.notif)notif('No te alcanzan las monedas de subasta (necesitas '+req+', tienes '+c+'). Transfiere monedas de equipamiento a la subasta con el botón de abajo.');}else{bfNoCoinDialog(s);}}
        else if(window.notif&&h)notif('Necesitas '+(Number(h.cost||0)-m.add+m.sub)+' monedas para pujar por '+h.name+'.');
        return;
      }
      if(inp)inp.value=String(amt);return originalSubmitBid.apply(this,arguments);
    };
    var originalNetBid = window.netBid;
    window.netBid = function(heroId, amount) {
      var amt = adjustBid('o', heroId, amount);
      if (amt === null) return netPass();
      return originalNetBid.call(this, heroId, amt);
    };
    function minPoolCost(side){var pool=(G.epicCands&&G.epicCands[side])||G.cands||[];var m=Infinity;for(var i=0;i<pool.length;i++){var c=Number(pool[i]&&pool[i].cost||0);if(c<m)m=c;}return m===Infinity?5:m;}
    function roundsLeft(side){return Math.max(1,3-((G.team&&G.team[side]&&G.team[side].length)||0));}
    // AI can't afford a hero: take equip-debt for the cheapest hero or skip — either way
    // clear phaseNeeds so the auction advances to equip instead of looping on bad bids.
    function bfAiNoCoin(side){
      var team=(G.team&&G.team[side]&&G.team[side].length)||0;
      if(!G.bfEquipXfer)G.bfEquipXfer={p:0,o:0};
      var pool=(G.epicCands&&G.epicCands[side])||G.cands||[];
      var m=window.bidMods(side);
      function cheapestHero(){var best=null,bc=Infinity;for(var i=0;i<pool.length;i++){var h=pool[i];if(!h)continue;var c=Number(h.cost||0);if(c<bc){bc=c;best=h;}}return best;}
      function canAfford(){var h=cheapestHero();if(!h)return false;var need=Math.max(0,Number(h.cost||0)-m.add+m.sub);return Number((G.coins&&G.coins[side])||0)>=need;}
      // Transferir monedas de equipamiento de 10 en 10 (como el humano) hasta
      // poder pujar por el héroe más barato de la tanda.
      while(team<3&&!canAfford()){
        var left=100-(G.bfEquipXfer[side]||0);
        if(left<=0)break;
        var t=Math.min(10,left);
        G.coins[side]=(G.coins[side]||0)+t;
        G.bfEquipXfer[side]=(G.bfEquipXfer[side]||0)+t;
      }
      // Si ya le llega, puja por el héroe más barato en vez de pasar.
      if(team<3&&canAfford()){
        var h=cheapestHero();
        if(h){
          var amt=adjustBid(side,h.id,window.minRawBid(side,h));
          if(amt!=null){G.bids[side]={heroId:h.id,amount:amt};if(G.phaseNeeds)G.phaseNeeds[side]=false;return;}
        }
      }
      // Si tras transferir todo sigue sin llegarle: héroe Bizarro como último recurso.
      if(team<3&&bfBizarroEligible(side)&&typeof bfAssignBizarro==='function')bfAssignBizarro(side);
      G.bids[side]={pass:true};
      if(G.phaseNeeds)G.phaseNeeds[side]=false;
    }
    var originalAiBid=window.aiBid;
    window.aiBid=function(s){
      var sv=G.cands;if(G.epicCands&&G.epicCands[s])G.cands=G.epicCands[s];
      try{originalAiBid.apply(this,arguments);}catch(e){}
      if(!G.bids)G.bids={};var b=G.bids[s];
      if(!b){if(G.acq&&G.acq[s])G.bids[s]={pass:true};else bfAiNoCoin(s);}
      else if(!b.pass){
        var amt=adjustBid(s,b.heroId,b.amount);
        if(amt===null){if(G.acq&&G.acq[s])G.bids[s]={pass:true};else bfAiNoCoin(s);}
        else{
          var c=Number((G.coins&&G.coins[s])||0),mc=minPoolCost(s),m=window.bidMods(s),mx=Math.max(mc,c-mc*Math.max(0,roundsLeft(s)-1)),h=findHero(b.heroId),mr=window.minRawBid(s,h);
          G.bids[s].amount=Math.max(mr,Math.min(amt,mx+m.add-m.sub));
        }
      } else {
        // La IA pasó (seguramente por falta de monedas): si aún necesita un
        // héroe, transferir monedas de equipamiento y volver a intentarlo.
        var tl=(G.team&&G.team[s]&&G.team[s].length)||0;
        if(tl<3)bfAiNoCoin(s);
      }
      G.cands=sv;if(typeof window.checkBids==='function')window.checkBids();
    };
    var originalResolveBidRound = window.resolveBidRound;
    window.resolveBidRound = function() {
      ['p','o'].forEach(function(side) {
        var bid = G.bids && G.bids[side];
        // Safety net: if a side has 0 heroes and is passing, force cheapest hero so game can start.
        if (!bid || bid.pass) { var acq=(G.team&&G.team[side]&&G.team[side].length)||0; if(acq<1&&bfBizarroEligible(side)&&typeof bfAssignBizarro==='function'){bfAssignBizarro(side);}return;}
        var amt = adjustBid(side, bid.heroId, bid.amount);
        if (amt === null) G.bids[side] = { pass: true };
        else G.bids[side].amount = amt;
      });
      var ret = originalResolveBidRound.apply(this, arguments);
      // Fix missing Epic names in auction result if the original logic failed to resolve them
      if (G.phaseResult) {
         if ((!G.phaseResult.bpName || G.phaseResult.bpName === '—') && G.bids && G.bids.p && !G.bids.p.pass) {
            var hp = findHero(G.bids.p.heroId);
            if (hp) G.phaseResult.bpName = hp.name;
         }
         if ((!G.phaseResult.boName || G.phaseResult.boName === '—') && G.bids && G.bids.o && !G.bids.o.pass) {
            var ho = findHero(G.bids.o.heroId);
            if (ho) G.phaseResult.boName = ho.name;
         }
      }
      return ret;
    };
    // 3 vs 3 garantizado: al terminar la subasta, cualquier equipo con menos de
    // 3 héroes se completa automáticamente con héroes Bizarros.
    var originalFinishAuction = window.finishAuction;
    window.finishAuction = function() {
      ['p','o'].forEach(function(side){
        var guard = 0;
        while ((((G.team && G.team[side]) || []).length) < 3 && guard++ < 5) { if (!bfAssignBizarro(side)) break; }
      });
      return originalFinishAuction.apply(this, arguments);
    };
    // Slow down the combat pacing a touch so the (now bigger) animations are
    // easier to follow. We add a short pause before each turn transition.
    if (typeof window.endTurn === 'function' && !window.endTurn.__bfSlow) {
      var originalEndTurn = window.endTurn;
      window.endTurn = function() { var args = arguments, self = this; setTimeout(function() { originalEndTurn.apply(self, args); }, 520); };
      window.endTurn.__bfSlow = 1;
    }
    if (typeof window.finishAct === 'function' && !window.finishAct.__bfSlow) {
      var originalFinishAct = window.finishAct;
      window.finishAct = function() { var args = arguments, self = this; setTimeout(function() { originalFinishAct.apply(self, args); }, 360); };
      window.finishAct.__bfSlow = 1;
    }
    // Show a clear "EN MODO ÉLITE" badge in the hero info modal when the hero
    // is currently in elite form during battle.
    if (typeof window.heroInfo === 'function' && !window.heroInfo.__bfElite) {
      var originalHeroInfo = window.heroInfo;
      window.heroInfo = function(id, side) {
        var h = null;
        if (side && typeof getHero === 'function') h = getHero(side, id);
        if (!h) for (var si = 0; si < 2; si++) { var f = byId(G.team[['p','o'][si]] || [], id); if (f) { h = f; break; } }
        originalHeroInfo.apply(this, arguments);
        // Give the info modal a dramatic gradient background built from the hero art.
        var artUrl = h ? (h.eliteMode ? (ELITE_BY_ID[h.id] || ART_BY_ID[h.id]) : ART_BY_ID[h.id]) : '';
        var box = document.querySelector('#modalRoot .mb');
        if (artUrl && box && box.querySelector('.hi-sub') && !box.querySelector('.bf-info-art')) {
          box.classList.add('bf-info-themed', 'modal-box');
          box.style.setProperty('--bf-info-art', 'url("' + artUrl + '")');
          if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
          var artLayer = document.createElement('div');
          artLayer.className = 'bf-info-art';
          artLayer.innerHTML = '<div class="bf-info-fill"></div><div class="bf-info-sharp"></div><div class="bf-info-shade"></div>';
          box.insertBefore(artLayer, box.firstChild);
        }
        var sub = document.querySelector('.modal .hi-sub') || document.querySelector('.hi-sub');
        if (h && h.eliteMode && sub && !document.querySelector('.bf-elite-badge')) {
          var badge = document.createElement('div');
          badge.className = 'bf-elite-badge';
          badge.innerHTML = '★ EN MODO ÉLITE — versión renacida y potenciada';
          sub.parentNode.insertBefore(badge, sub.nextSibling);
        }
        // Show the hero's current battle status (paralyzed/sleeping/cursed).
        var st = '';
        if (side && typeof getBattleCard === 'function') {
          var bc = getBattleCard(side, id);
          if (bc) st = heroStatusOf(bc);
        }
        if (!st) for (var bi = 0; bi < 2; bi++) {
          var c = getBattleCard(['p','o'][bi], id);
          if (c) { var s2 = heroStatusOf(c); if (s2) { st = s2; break; } }
        }
        if (st && sub && !document.querySelector('.bf-info-status')) {
          var sinfo = STATUS_INFO[st];
          var sb = document.createElement('div');
          sb.className = 'bf-info-status bf-elite-badge ' + sinfo.cls;
          sb.style.background = 'rgba(8,5,14,.9)';
          sb.style.border = '1.5px solid currentColor';
          sb.style.boxShadow = '0 0 16px currentColor';
          sb.innerHTML = sinfo.ico + ' ESTADO: ' + sinfo.label;
          var anchor = document.querySelector('.bf-elite-badge') || sub;
          anchor.parentNode.insertBefore(sb, anchor.nextSibling);
        }
      };
      window.heroInfo.__bfElite = 1;
    }
  }
  function patchRaceModal() {
    if (window.__bfRaceModalPatched || typeof CLAN_PROFILE === 'undefined' || typeof modal !== 'function') return;
    window.__bfRaceModalPatched = true;
    function clean(value) {
      return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[ch];
      });
    }
    function fmt(value) { return (value > 0 ? '+' : '') + value; }
    window.racesModal = function() {
      // 'Bizarros' se muestra con su tarjeta especial al final: se excluye
      // aquí para que no salga dos veces.
      var names = Object.keys(CLAN_PROFILE).filter(function(n) { return n !== 'Bizarros'; });
      var rows = names.map(function(name) {
        var p = CLAN_PROFILE[name];
        var col = (typeof CLAN_COLORS !== 'undefined' && CLAN_COLORS[name]) || '#ffd24a';
        var sigil = raceSigilSvg(name, col);
        return '<div class="bf-race-card" style="--race:' + col + '">' +
          '<div class="bf-race-sigil-big">' + sigil + '</div>' +
          '<div class="bf-race-title">' + clean(name) + '</div>' +
          '<div class="bf-race-trait">' + clean(p.trait) + '</div>' +
          '<div class="bf-race-desc">' + clean(p.desc) + '</div>' +
          '<div class="bf-race-stats">Élite ' + Math.round(p.eliteHpPct * 100) + '% · CC ' + fmt(p.mMelee) + ' · AD ' + fmt(p.mRanged) + ' · HE ' + fmt(p.mSpell) + ' · Vel ' + fmt(p.mVel) + ' · Maná ' + fmt(p.manaBonus) + ' · Res.F ' + fmt(p.resPhys) + ' · Res.M ' + fmt(p.resMagic) + '</div>' +
        '</div>';
      }).join('');
      modal('<h3>🧬 Razas y símbolos</h3><div class="modal-note">Cada héroe lleva ahora su sigilo de raza directamente sobre la ilustración.</div><div class="bf-race-list">' + rows + '<div class="bf-race-card" style="--race:#caa14a"><div class="bf-race-sigil-big">' + raceSigilSvg('Bizarros', '#caa14a') + '</div><div class="bf-race-title">Bizarros</div><div class="bf-race-trait">Héroes sorpresa · No salen en subasta</div><div class="bf-race-desc">Criaturas imposibles que jamás aparecen en la subasta. Solo emergen en plena batalla, de forma sorpresiva e impredecible.</div><div class="bf-race-stats">⚠ No comprables · Aparición aleatoria durante el juego</div></div></div>');
    };
  }
  function patchEquipmentUI() {
    if (window.__bfEquipPatched) return;
    if (typeof window.eqHeroCard !== 'function' || typeof window.doAssign !== 'function') return;
    window.__bfEquipPatched = true;
    function clean(value) {
      return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[ch];
      });
    }
    function findHero(s,i){return((G.team&&G.team[s])||[]).find(function(h){return h&&h.id===i;});}
    function closeAnyModal(){var c=document.querySelector('.modal-close, .modal-x, [onclick="closeModal()"]');if(c)c.click();else if(typeof window.closeModal==='function')closeModal();}
    // Game-styled confirmation dialog. Calls onYes() if the player confirms.
    // artUrl is optional (used for the preview banner).
    function bfConfirm(opts, onYes) {
      var item = opts.item; if (!item) return;
      var cost = Number(item.cost || 0), coins = Number((G.equipCoins && G.equipCoins[opts.side]) || 0);
      if (coins < cost) { if (window.notif) notif('No tienes monedas suficientes para comprar ' + item.name + '.'); return; }
      var existing = document.getElementById('bf-confirm-overlay'); if (existing) existing.remove();
      var target = opts.hero ? ' y equiparlo a <b>' + clean(opts.hero.name) + '</b>' : '', effectTxt = item.txt || item.desc || '';
      var overlay = document.createElement('div'); overlay.id = 'bf-confirm-overlay'; overlay.className = 'bf-confirm-overlay';
      overlay.innerHTML = '<div class="bf-confirm-box' + (item.name === 'Transformer' ? ' bf-foil-card' : '') + '">' + (opts.art ? '<div class="bf-confirm-art" style="--bf-cart:url(&quot;' + opts.art + '&quot;)"><div class="bf-confirm-art-fill"></div><div class="bf-confirm-art-sharp"></div>' + (item.name === 'Transformer' ? '<div class="bf-foil-layer" style="position:absolute;inset:0;z-index:6;pointer-events:none;border-radius:inherit;mix-blend-mode:soft-light;opacity:.4;background:linear-gradient(125deg,#ffd24a,#ff7adf 18%,#7ad6ff 38%,#9dff8a 56%,#ffe27a 72%,#ff7adf 88%,#ffd24a);background-size:300% 300%;animation:bfFoilShift 9s linear infinite"></div><div class="bf-foil-shine"></div>' : '') + '<div class="bf-confirm-cost">' + cost + '</div>' + (bfManaFor(item) != null ? '<div class="bf-confirm-mana">' + bfManaFor(item) + '</div>' : '') + '</div>' : '') + '<div class="bf-confirm-body"><div class="bf-confirm-name">' + clean(item.name) + '</div>' + (effectTxt ? '<div class="bf-confirm-effect">' + clean(effectTxt) + '</div>' : '') + '<div class="bf-confirm-msg">¿Comprar por <b>' + cost + ' monedas</b>' + target + '?</div><div class="bf-confirm-actions"><button class="bf-confirm-btn bf-confirm-no" id="bf-confirm-no">Cancelar</button><button class="bf-confirm-btn bf-confirm-yes" id="bf-confirm-yes">Comprar</button></div></div></div>';
      document.body.appendChild(overlay);
      function close() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }
      overlay.querySelector('#bf-confirm-no').onclick = close;
      overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
      overlay.querySelector('#bf-confirm-yes').onclick = function() { close(); onYes(); };
    }
    function indexInList(l,i){for(var x=0;x<(l||[]).length;x++)if(l[x]&&l[x].id===i)return x;return -1;}
    var originalBuySpell = window.buySpell;
    window.buySpell = function(side, id) {
      // Remote (rival) purchase reaching the host via intent: apply directly, no confirm dialog.
      if (typeof NET !== 'undefined' && NET.role === 'host' && side === 'o') return originalBuySpell(side, id);
      // Spells are UNIQUE cards: only one copy allowed. They live in G.spellbook[side] (array of ids).
      if (typeof G !== 'undefined' && G.spellbook && G.spellbook[side] && G.spellbook[side].indexOf(id) !== -1) {
        if (window.notif) notif('Los hechizos son cartas únicas: ya tienes este hechizo.');
        return;
      }
      var item = typeof byId === 'function' ? byId(SPELLS, id) : null;
      if (!item) return;
      var art = (SPELL_ART[indexInList(SPELLS, id)] || NUM_ART[String(numFor(item))]) || '';
       var itemCopy = {};for(var p in item)itemCopy[p]=item[p];itemCopy.txt=itemCopy.txt||itemCopy.desc||'';
       var opts = { item: itemCopy, side: side, art: art };
       bfConfirm(opts, function() { originalBuySpell(side, id); bfGuideApprovePurchase(item); });
     };
    // How many copies of an object id the side already holds (G.items[side] = array of copies).
    function bfObjectCount(side, id) {
      var list = (typeof G !== 'undefined' && G.items && G.items[side]) || [];
      var n = 0;
      for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) n++;
      return n;
    }
    var originalBuyObject = window.buyObject;
    window.buyObject = function(side, id) {
      // Remote (rival) purchase reaching the host via intent: apply directly, no confirm dialog.
      if (typeof NET !== 'undefined' && NET.role === 'host' && side === 'o') return originalBuyObject(side, id);
      var item = typeof byId === 'function' ? byId(OBJECTS, id) : null;
      if (!item) return;
      // Objects: up to 3 copies of the same object.
      if (bfObjectCount(side, id) >= 3) {
        if (window.notif) notif('Máximo 3 copias de ' + item.name + '.');
        return;
      }
      var art = (OBJECT_ART[indexInList(OBJECTS, id)] || NUM_ART[String(numFor(item))]) || '';
      bfConfirm({ item: item, side: side, art: art }, function() { originalBuyObject(side, id); bfGuideApprovePurchase(item); });
    };
    var originalDoAssign = window.doAssign;
    window.doAssign = function(side, heroId) {
      // Remote (rival) equip reaching the host via intent: apply directly, no confirm dialog.
      if (typeof NET !== 'undefined' && NET.role === 'host' && side === 'o') return originalDoAssign(side, heroId);
      var hero = findHero(side, heroId);
      var a = G.assign || {};
      var kind = a.kind === 'armor' ? 'armor' : (a.kind === 'ranged' ? 'ranged' : 'melee');
      var srcList = kind === 'armor' ? ARMORS : (kind === 'ranged' ? RANGED : MELEE);
      var full = (typeof byId === 'function' ? byId(srcList, a.id) : null) || {};
      var item = a.name ? { name: a.name, cost: a.cost, id: a.id, txt: full.txt || '', desc: full.desc || '' } : null;
      if (!item) return;
      var art = artFor(kind, indexInList(srcList, a.id));
      bfConfirm({ item: item, side: side, hero: hero, art: art }, function() { originalDoAssign(side, heroId); bfGuideApprovePurchase(item); });
    };
    // Resolve an item's art + number by its INDEX inside the game's own list
    // (MELEE/RANGED/ARMORS), which is index-for-index with the art arrays.
    function artFor(kind, idx) {
      var arr = kind === 'armor' ? ARMOR_ART : (kind === 'ranged' ? RANGED_ART : MELEE_ART);
      return arr[idx] || '';
    }
    function numFor(item) {
      return (typeof cardNo === 'function' ? cardNo(item.id) : item.num) || item.num || 0;
    }
    // Build a name -> {num, art} map for every equipment item, so we can show
    // a thumbnail and number on equipped slots. Art resolved by array index.
    function itemArtByName() {
      var map = {};
      function add(list, kind) {
        (list || []).forEach(function(it, i) {
          if (!it || !it.name) return;
          map[it.name] = { num: numFor(it), art: artFor(kind, i) };
        });
      }
      if (typeof MELEE !== 'undefined') add(MELEE, 'melee');
      if (typeof RANGED !== 'undefined') add(RANGED, 'ranged');
      if (typeof ARMORS !== 'undefined') add(ARMORS, 'armor');
      return map;
    }
    // Inject a thumbnail into a filled equipment slot, matching it to the slot
    // whose text contains the item's name (so weapon vs armor never get mixed up).
    function decorateSlotByName(html, name, art, item, kind) {
      if (!name || !art) return html;
      var safeName = String(name).replace(/'/g, "\\'");
      var jsonItem = encodeURIComponent(JSON.stringify(item || {}));
      var thumb = '<div class="bf-slot-thumb" style="background-image:url(&quot;' + art + '&quot;)" onclick="event.stopPropagation(); bfZoomBonus(&quot;' + safeName + '&quot;, &quot;' + art + '&quot;, { item: JSON.parse(decodeURIComponent(&quot;' + jsonItem + '&quot;)), kind: &quot;' + kind + '&quot; })"><div class="bf-slot-zoom">🔍</div></div>';
      var box = document.createElement('div');
      box.innerHTML = html;
      var slots = box.querySelectorAll('.eq-slot');
      for (var i = 0; i < slots.length; i++) {
        var slot = slots[i];
        if (slot.classList.contains('bf-slot-art')) continue;
        if (slot.textContent.indexOf(name) !== -1) {
          slot.classList.add('bf-slot-art');
          slot.insertAdjacentHTML('afterbegin', thumb);
          break;
        }
      }
      return box.innerHTML;
    }
    var originalEqHeroCard = window.eqHeroCard;
    window.eqHeroCard = function(h, side) {
      var html = originalEqHeroCard.apply(this, arguments);
      var byName = itemArtByName();
      var url = ART_BY_ID[h && h.id] || '';
      if (url && html.indexOf('bf-eq-hero-art') === -1) {
        var hEpic=(h&&h.clan==='Épicas'),hGold=(h&&h.gold_border===true),hFoil=hEpic||(h&&h.foil===true);var epicFoil = (hFoil ? '<div style="position:absolute;left:-32px;top:-32px;bottom:-32px;width:190px;z-index:2;pointer-events:none;mix-blend-mode:soft-light;opacity:.4;background:linear-gradient(125deg,#ffd24a,#ff7adf 18%,#7ad6ff 38%,#9dff8a 56%,#ffe27a 72%,#ff7adf 88%,#ffd24a);background-size:300% 300%;animation:bfFoilShift 9s linear infinite"></div>' : '');
        html = html.replace(/<div class="eq-hero([^"]*)"/, '<div class="eq-hero bf-eq-hero-with-art' + (hGold ? ' bf-epic-gold' : '') + ((h && h.rainbow_border === true) ? ' bf-rainbow' : '') + '$1"').replace(/(<div class="eq-hero[^>]*>)/, '$1<div class="bf-eq-hero-art" style="background-image:url(&quot;' + url + '&quot;);background-position:' + bfHeroBgPos(h && h.id) + '"></div>' + epicFoil + '<div class="bf-battle-zoom" style="position:absolute;top:6px;left:6px;z-index:10" onclick="event.stopPropagation();bfZoomCard(&quot;' + h.id + '&quot;,&quot;normal&quot;,&quot;' + side + '&quot;)">🔍</div>');
      }
      // Equipped weapon thumbnail
      var weapon = h.mwep || h.rwep;
      if (weapon && byName[weapon.name]) html = decorateSlotByName(html, weapon.name, byName[weapon.name].art, weapon, h.mwep ? 'melee' : 'ranged');
      // Equipped armor thumbnail
      if (h.armor && byName[h.armor.name]) html = decorateSlotByName(html, h.armor.name, byName[h.armor.name].art, h.armor, 'armor');
      if (!h.mwep && !h.rwep) {
        var weaponSlotPattern = new RegExp('<div class="eq-slot">Arma: vacía([\\\\s\\\\S]*?)</div>');
        html = html.replace(weaponSlotPattern, '<div class="eq-slot bf-slot-empty" onclick="event.stopPropagation();bfOpenQuickShop(&quot;' + side + '&quot;,&quot;' + h.id + '&quot;,&quot;weapon&quot;)"><span>Arma: vacía$1</span><button class="bf-slot-buy">Comprar</button></div>');
      }
      if (!h.armor) {
        html = html.replace('<div class="eq-slot">Armadura: vacía</div>', '<div class="eq-slot bf-slot-empty" onclick="event.stopPropagation();bfOpenQuickShop(&quot;' + side + '&quot;,&quot;' + h.id + '&quot;,&quot;armor&quot;)"><span>Armadura: vacía</span><button class="bf-slot-buy">Comprar</button></div>');
      }
      return html;
    };
    // Resolve art + number for any shop item by its id (robust, order-independent).
    function metaById(id) {
      var sets = [[MELEE, 'melee'], [RANGED, 'ranged'], [ARMORS, 'armor'], [SPELLS, 'spell'], [OBJECTS, 'object']];
      for (var s = 0; s < sets.length; s++) {
        var list = sets[s][0] || [];
        for (var i = 0; i < list.length; i++) {
          if (list[i] && list[i].id === id) {
            return { item: list[i], kind: sets[s][1], idx: i, art: shopArt(sets[s][1], i), num: numFor(list[i]) };
          }
        }
      }
      return null;
    }
    function shopArt(kind, idx) {
      var arr = kind === 'armor' ? ARMOR_ART : kind === 'ranged' ? RANGED_ART :
        kind === 'melee' ? MELEE_ART : kind === 'spell' ? SPELL_ART : OBJECT_ART;
      return (arr && arr[idx]) || '';
    }
    // Buy an item straight from a shop card.
    // - Spells/objects go to the player's hand right away (with confirm).
    // - Weapons/armor need a target hero: select the item (as clicking the card
    //   does in the base game) and tell the player to pick a hero.
    window.bfShopBuy = function(side, kind, id) {
      if (kind === 'spell') { return window.buySpell(side, id); }
      if (kind === 'object') { return window.buyObject(side, id); }
      var src = kind === 'armor' ? ARMORS : (kind === 'ranged' ? RANGED : MELEE);
      var item = typeof byId === 'function' ? byId(src, id) : null;
      if (!item) return;
      G.assign = { kind: kind, id: id, cost: item.cost, name: item.name };
      // Mark the card as selected if the base game uses a selection highlight.
      document.querySelectorAll('.shop-card.selected').forEach(function(c) { c.classList.remove('selected'); });
      if (window.notif) notif('Has seleccionado ' + item.name + '. Ahora pulsa «Comprar» en el héroe que quieras equiparlo.');
    };
    // Rebuild the shop grid so every card shows full-bleed art + a "Ver carta" button.
    if (typeof window.eqShopGrid === 'function' && !window.eqShopGrid.__bfArt) {
      var originalEqShopGrid = window.eqShopGrid;
      window.eqShopGrid = function(side) {
        var html = originalEqShopGrid.apply(this, arguments);
        var box = document.createElement('div');
        box.innerHTML = html;
        // Resolve each shop card's art by the item's NAME (robust — the card's
        // ".shop-name" always matches the item name, while the Nº numbering used
        // by the game may not match our hardcoded number→art map).
        var byName = {};
        function reg(list, kind) {
          (list || []).forEach(function(it, i) {
            if (it && it.name) byName[it.name] = { id: it.id, art: shopArt(kind, i), kind: kind, txt: it.txt || '', mana: it.mana, num: numFor(it) };
          });
        }
        reg(MELEE, 'melee'); reg(RANGED, 'ranged'); reg(ARMORS, 'armor'); reg(SPELLS, 'spell'); reg(OBJECTS, 'object');
        box.querySelectorAll('.shop-card').forEach(function(card) {
          var nameEl = card.querySelector('.shop-name');
          var meta = nameEl ? byName[nameEl.textContent.trim()] : null;
          var url = meta && meta.art;
          // Fallback to the old number→art lookup if the name didn't resolve.
          if (!url) {
            var span = card.querySelector('.shop-bf span');
            var no = span ? (span.textContent.match(/(\d+)/) || [])[1] : null;
            url = no ? NUM_ART[no] : null;
          }
          if (!url) return;
          var id = meta && meta.id;
          card.classList.add('has-art');
          card.dataset.bfShopArt = '1';
          var fill = document.createElement('div'); fill.className = 'shop-card-fill'; fill.style.backgroundImage = 'url("' + url + '")';
          card.insertBefore(fill, card.firstChild);
          var sharp = document.createElement('div'); sharp.className = 'shop-card-art-sharp'; sharp.style.backgroundImage = 'url("' + url + '")';
          card.insertBefore(sharp, card.firstChild);
          var spMana = nameEl ? bfManaFor({ name: nameEl.textContent.trim(), mana: meta && meta.mana }) : null;
          if (spMana != null) { var mb = document.createElement('div'); mb.className = 'bf-shop-mana'; mb.textContent = spMana; card.appendChild(mb); }
          var noBadge = document.createElement('div'); noBadge.className = 'bf-shop-num'; noBadge.textContent = 'Nº ' + String((meta && meta.num) || 0).padStart(3, '0'); noBadge.style.cssText = 'position:absolute;right:7px;top:7px;z-index:8;font-size:8px;font-weight:900;color:#ffe7a8;background:rgba(0,0,0,.72);border:1px solid rgba(255,210,74,.38);border-radius:999px;padding:2px 6px;'; card.appendChild(noBadge);
          var shopLogo = document.createElement('div'); shopLogo.className = 'bf-logo'; shopLogo.innerHTML = '<img src="' + LOGO_URL + '" alt="BF">'; card.appendChild(shopLogo);
          // Card name (stylized) over the image.
          if (nameEl) {
            var nm = document.createElement('div');
            nm.className = 'bf-shop-name';
            nm.textContent = nameEl.textContent.trim();
            card.appendChild(nm);
            if (nm.textContent === 'Transformer') { card.classList.add('bf-foil-card'); if (!card.querySelector('.bf-foil-shine')) { var fsh = document.createElement('div'); fsh.className = 'bf-foil-shine'; card.appendChild(fsh); } }
          }
          // Card text strip at the bottom of the image.
          if (meta && meta.txt) {
            var txt = document.createElement('div');
            txt.className = 'bf-shop-txt';
            txt.textContent = meta.txt;
            card.appendChild(txt);
          }
          // "Comprar" button — buys this item (spells/objects to hand, weapons/armor
          // need a hero so we open the quick-shop chooser via the assign flow).
          if (id && meta) {
            var btn = document.createElement('button');
            btn.className = 'bf-buy-btn';
            btn.textContent = '🛒 Comprar';
            btn.setAttribute('onclick', "event.stopPropagation();bfShopBuy('" + side + "','" + meta.kind + "','" + id + "')"); btn.style.cssText = 'position:absolute;z-index:8;top:auto;bottom:7px;left:50%;transform:translateX(-50%);';
            card.appendChild(btn);
          }
        });
        return box.innerHTML;
      };
      window.eqShopGrid.__bfArt = 1;
      if (typeof window.renderEquip === 'function' && G && G.eqSide) {
        try { window.renderEquip(G.eqSide); } catch (e) {}
      }
    }
    window.bfOpenQuickShop = function(side, heroId, slot) {
      var hero = findHero(side, heroId);
      if (!hero || typeof modal !== 'function') return;
      var items = slot === 'armor' ? (ARMORS || []).map(function(x) { return { kind:'armor', item:x }; }) :
        (MELEE || []).map(function(x) { return { kind:'melee', item:x }; }).concat((RANGED || []).map(function(x) { return { kind:'ranged', item:x }; }));
      var coins = Number((G.equipCoins && G.equipCoins[side]) || 0);
      // Track per-kind index so we can resolve art by array position.
      var kindIdx = { melee: 0, ranged: 0, armor: 0 };
      var cards = items.map(function(row) {
        var item = row.item;
        var idx = kindIdx[row.kind]++;
        var art = artFor(row.kind, idx);
        var disabled = Number(item.cost || 0) > coins;
        var no = numFor(item);
        return '<div class="bf-quick-card" ' + (disabled ? 'style="opacity:.45;cursor:not-allowed"' : 'onclick="bfQuickBuy(&quot;' + side + '&quot;,&quot;' + heroId + '&quot;,&quot;' + row.kind + '&quot;,&quot;' + item.id + '&quot;)"') + '>' +
          (art ? '<div class="bf-quick-fill" style="background-image:url(&quot;' + art + '&quot;)"></div><div class="bf-quick-art" style="background-image:url(&quot;' + art + '&quot;)"></div>' : '') +
          '<div class="bf-quick-num">Nº ' + String(no || 0).padStart(3, '0') + '</div>' +
          '<div class="bf-quick-cost">' + clean(item.cost) + '</div>' +
          '<div class="bf-quick-name">' + clean(item.name) + '</div>' +
          '<div class="bf-quick-txt">' + clean(item.txt || '') + '</div>' +
        '</div>';
      }).join('');
      modal('<h3>Comprar para ' + clean(hero.name) + '</h3><div class="modal-note">Elige ' + (slot === 'armor' ? 'una armadura' : 'un arma') + '. Antes de pagar se pedirá confirmación.</div><div class="bf-quick-grid">' + cards + '</div>');
    };
    window.bfQuickBuy = function(side, heroId, kind, id) {
      var src = kind === 'armor' ? ARMORS : (kind === 'melee' ? MELEE : RANGED);
      var item = typeof byId === 'function' ? byId(src, id) : null;
      if (!item) return;
      G.assign = { kind: kind, id: id, cost: item.cost, name: item.name };
      closeAnyModal();
      // doAssign now shows the in-game styled confirm itself.
      return window.doAssign(side, heroId);
    };
    // Collect equipment warnings before entering battle:
    // - AD heroes with no ranged weapon (can't shoot)
    // - any hero with no weapon at all
    // - any hero with no armor
    function equipWarnings(side) {
      var team = (G.team && G.team[side]) || [];
      var warns = [];
      team.forEach(function(h) {
        if (!h) return;
        if (h.type === 'AD' && !h.rwep) warns.push('<b>' + clean(h.name) + '</b> (sin arma a distancia, no podrá disparar)');
        else if (!h.mwep && !h.rwep) warns.push('<b>' + clean(h.name) + '</b> (sin arma)');
        if (!h.armor) warns.push('<b>' + clean(h.name) + '</b> (sin armadura)');
      });
      return warns;
    }
    function bfWarnConfirm(title, message, onYes) {
      var existing = document.getElementById('bf-confirm-overlay'); if (existing) existing.remove();
      var overlay = document.createElement('div'); overlay.id = 'bf-confirm-overlay'; overlay.className = 'bf-confirm-overlay';
      overlay.innerHTML = '<div class="bf-confirm-box"><div class="bf-confirm-body"><div class="bf-confirm-name" style="margin-top:14px">' + title + '</div><div class="bf-confirm-msg">' + message + '</div><div class="bf-confirm-actions"><button class="bf-confirm-btn bf-confirm-no" id="bf-confirm-no">Volver a equipar</button><button class="bf-confirm-btn bf-confirm-yes" id="bf-confirm-yes">Entrar igual</button></div></div></div>';
      document.body.appendChild(overlay);
      function close() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }
      overlay.querySelector('#bf-confirm-no').onclick = close;
      overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
      overlay.querySelector('#bf-confirm-yes').onclick = function() { close(); onYes(); };
    }
    // ---- AI auto-equip: optimize gear purchases for the whole team ----
    var bfAEisClient=function(){return typeof NET!=='undefined'&&NET.role==='client';}; // Client owns no authoritative state: send each buy as an intent (same path manual buys use); host applies + snapshots back. Deduct locally so the planner respects the budget; host re-syncs real coins right after.
    function bfEqCoins(side){return Number((G.equipCoins&&G.equipCoins[side])||0);}
    function bfAEspend(side,cost){if(G.equipCoins&&G.equipCoins[side]!=null)G.equipCoins[side]=Math.max(0,G.equipCoins[side]-Number(cost||0));}
    function bfBuyGear(side,hId,kind,it){G.assign={kind:kind,id:it.id,cost:it.cost,name:it.name};if(bfAEisClient()){bfAEspend(side,it.cost);if(typeof sendIntent==='function')sendIntent('doAssign',{heroId:hId,assign:G.assign});G.assign=null;return;}if(typeof originalDoAssign==='function')originalDoAssign(side,hId);}
    function bfBuySpellAE(side,id,cost){if(bfAEisClient()){bfAEspend(side,cost);if(typeof sendIntent==='function')sendIntent('buySpell',{id:id});return;}if(typeof originalBuySpell==='function')originalBuySpell(side,id);}
    function bfBuyObjectAE(side,id,cost){if(bfAEisClient()){bfAEspend(side,cost);if(typeof sendIntent==='function')sendIntent('buyObject',{id:id});return;}if(typeof originalBuyObject==='function')originalBuyObject(side,id);}
    function bfAutoEquip(side){
      var tm=((G.team&&G.team[side])||[]).filter(Boolean), ml=typeof MELEE!=='undefined'?MELEE:[], rg=typeof RANGED!=='undefined'?RANGED:[], am=typeof ARMORS!=='undefined'?ARMORS:[], sp=typeof SPELLS!=='undefined'?SPELLS:[], ob=typeof OBJECTS!=='undefined'?OBJECTS:[];
      var ownedSpells=(G.spellbook&&G.spellbook[side])||[], ownedItems=(G.items&&G.items[side])||[];
      var g={w:[],a:[],h:ownedSpells.length+ownedItems.length, nObj:ownedItems.length, nSp:ownedSpells.length}, mH=0, hC=0;
      tm.forEach(function(h,i){if(h){g.w[i]=!!(h.mwep||h.rwep);g.a[i]=!!h.armor;if(h.he>mH)mH=h.he;if(h.type==='HE')hC++;}});
      function bfHasSpell(id){return ((G.spellbook&&G.spellbook[side])||[]).indexOf(id)!==-1;}
      function bfItemCopies(id){var l=(G.items&&G.items[side])||[],n=0;for(var x=0;x<l.length;x++)if(l[x]&&l[x].id===id)n++;return n;}
      function sc(it,h,k){
        var s=0; if(k==='melee'||k==='ranged'||k==='armor'){
          if(it.cc)s+=it.cc*(h.type==='CC'?2.5:0.5);if(it.power)s+=it.power*(h.type==='AD'?2.5:0.8);
          if(it.hp)s+=it.hp*1.2;if(it.def)s+=it.def*2;if(it.mana)s+=it.mana*(h.type==='HE'?1.5:0.5);if(it.he)s+=it.he*(h.type==='HE'?2.5:0.5);
          return s*(k==='ranged'&&h.type==='AD'?3:k==='melee'&&h.type==='CC'?3:k==='armor'?2.2:1);
        } else {
          s+=(it.power||0)*(1+mH*0.15)*1.5+(it.heal||0)*2+(it.mana||0)*1.5;
          if(/Curación Divina|Maremoto|Tormenta|Cadena|Fuego/i.test(it.name||''))s+=15;
          if(/f[eé]nix|despertar/i.test(it.name||''))s+=25;
          if(k==='object')s+=40+(g.nObj===0?60:0);
          if(k==='spell')s+=30+(g.nSp===0?60:0);
          return s*(1+hC*0.6);
        }
      }
      var b=0;
      // Coste mínimo de hechizo/objeto: se reserva para garantizar comprar al menos 1 de cada.
      function bfMinCost(list){var m=Infinity;(list||[]).forEach(function(x){var c=Number(x&&x.cost||0);if(c>0&&c<m)m=c;});return m===Infinity?0:m;}
      var minSp=bfMinCost(sp),minOb=bfMinCost(ob);
      function bfMissingGear(){var n=0;for(var i=0;i<tm.length;i++){if(tm[i]&&!g.w[i])n++;if(tm[i]&&!g.a[i])n++;}return n;}
      function bfBestGear(h,kind,cap){var list=kind==='armor'?am:(kind==='ranged'?rg:ml),best=null,bs=-1;list.forEach(function(it){var c=Number(it.cost||0);if(c<=0||c>cap)return;var v=sc(it,h,kind),rs=v+(v/Math.max(1,c))*2;if(rs>bs){bs=rs;best=it;}});return best;}
      for(var gi=0;gi<48;gi++){ // PHASE 1: weapons + armor for all heroes; reserve 1 coin per other empty slot.
        var bd=bfEqCoins(side);if(bd<=0)break;var missing=bfMissingGear();if(missing===0)break;
        var resv=(missing-1)+(g.nSp===0?minSp:0)+(g.nObj===0?minOb:0),cap=Math.max(1,bd-resv),pick=null;
        for(var i=0;i<tm.length;i++){var h=tm[i];if(!h)continue;
          if(!g.w[i]){var rk=h.type==='AD'?'ranged':'melee',w=bfBestGear(h,rk,cap)||bfBestGear(h,h.type==='AD'?'melee':'ranged',cap);if(w){var wk=ml.indexOf(w)!==-1?'melee':'ranged',v=sc(w,h,wk);if(!pick||v>pick.v)pick={k:wk,it:w,hi:i,h:h,v:v};}}
          if(!g.a[i]){var a=bfBestGear(h,'armor',cap);if(a){var av=sc(a,h,'armor');if(!pick||av>pick.v)pick={k:'armor',it:a,hi:i,h:h,v:av};}}
        }
        if(!pick)break;
        bfBuyGear(side,pick.h.id,pick.k,pick.it);if(pick.k==='armor')g.a[pick.hi]=true;else g.w[pick.hi]=true;b++;
      }
      // PHASE 2 — spells with the remaining budget.
      for(var si=0;si<12;si++){var bd2=bfEqCoins(side)-(g.nObj===0?minOb:0);if(bd2<=0)break;var bSp=null,bSpS=-1;
        sp.forEach(function(s){if(bfHasSpell(s.id))return;var c=Number(s.cost||0);if(c<=0||c>bd2)return;var v=sc(s,null,'spell'),rs=v+(v/Math.max(1,c))*2;if(rs>bSpS){bSpS=rs;bSp=s;}});
        if(!bSp)break;bfBuySpellAE(side,bSp.id,bSp.cost);g.nSp++;b++;}
      // PHASE 3 — objects last, up to 3 copies each.
      for(var oi=0;oi<18;oi++){var bd3=bfEqCoins(side);if(bd3<=0)break;var bOb=null,bObS=-1;
        ob.forEach(function(o){if(bfItemCopies(o.id)>=3)return;var c=Number(o.cost||0);if(c<=0||c>bd3)return;var v=sc(o,null,'object'),rs=v+(v/Math.max(1,c))*2;if(rs>bObS){bObS=rs;bOb=o;}});
        if(!bOb)break;bfBuyObjectAE(side,bOb.id,bOb.cost);g.nObj++;b++;}
      if(typeof window.renderEquip==='function')try{window.renderEquip(side);}catch(e){}
      if(window.notif)notif(b>0?'⚡ La IA equipó a tu equipo ('+b+' adquisiciones).':'No quedan monedas para equipar automáticamente.');
      bfGuideReact('cheer','¡OPTIMIZADO!');
    }
    window.bfAutoEquip=bfAutoEquip;
    // Auto-equip works for everyone now: a client plans against its own snapshot but commits each buy as an intent to the host (see bfBuyGear). The button always equips THIS player's own side.
    // FAB en <body>: el layout/overflow de la tienda nunca lo tapa ni lo desplaza. Se quita solo al salir de la fase de equipamiento. click+touchend para que siempre responda en móvil.
    window.__bfInjectAutoEquipBtn=function(){var sc=document.getElementById('s-equip');var ex=document.getElementById('bf-autoequip-btn');var act=!!(sc&&sc.classList.contains('active'));if(!act){if(ex)ex.remove();return;}if(ex)return;var b=document.createElement('button');b.id='bf-autoequip-btn';b.type='button';b.className='bf-autoequip-btn';b.innerHTML='<span class="bf-ae-spark">✦</span><span class="bf-ae-col"><span class="bf-ae-txt">Equipar con IA</span><span class="bf-ae-sub">optimiza y compra por ti</span></span>';var go=function(e){e.preventDefault();e.stopPropagation();var side=(typeof NET!=='undefined'&&NET.role==='client')?NET.mySide:((typeof G!=='undefined'&&G&&G.eqSide)||'p');window.__bfAEAuto=true;try{bfAutoEquip(side);}catch(err){if(window.notif)notif('No se pudo auto-equipar: '+(err&&err.message||err));}finally{window.__bfAEAuto=false;}};b.addEventListener('click',go);b.addEventListener('touchend',go,{passive:false});var done=sc.querySelector('button[onclick*="eqDone"]')||Array.prototype.find.call(sc.querySelectorAll('button'),function(x){return /listo/i.test(x.textContent||'');});if(done&&done.parentNode){b.classList.add('bf-ae-inline');done.parentNode.insertBefore(b,done);}else{document.body.appendChild(b);}};
    if (typeof window.eqDone === 'function' && !window.eqDone.__bfWarn) {
      var originalEqDone = window.eqDone;
      window.eqDone = function(side) {
        if (G.demoExample) return originalEqDone.apply(this, arguments);
        // Ready del RIVAL llegando como intent al host: sin aviso de equipamiento —
        // el diálogo se tragaba el "listo" del rival y la batalla nunca empezaba.
        if (typeof NET !== 'undefined' && NET.role === 'host' && side === 'o') return originalEqDone.apply(this, arguments);
        var mySide = (NET.role === 'client') ? NET.mySide : (side || G.eqSide);
        var warns = equipWarnings(mySide);
        if (warns.length && !G.__bfAdWarnAck) {
          bfWarnConfirm('⚠️ Equipamiento incompleto', 'Hay héroes sin equipamiento completo:<br><br>' + warns.join('<br>') + '<br><br>¿Entrar en batalla de todos modos?', function() { G.__bfAdWarnAck = true; window.eqDone(side); });
          return;
        }
        G.__bfAdWarnAck = false;
        return originalEqDone.apply(this, arguments);
      };
      window.eqDone.__bfWarn = 1;
    }
  }
  // ---- Hand chips (spells/objects) → add a small art thumbnail ----
  var __bfHandArtByName = null;
  function handArtByName() {
    if (typeof SPELLS === 'undefined' || typeof OBJECTS === 'undefined') return null;
    // La caché se invalida si cambian las listas (p. ej. Transformer se añade
    // a SPELLS después del primer render y sin esto se quedaba sin imagen).
    var sig = SPELLS.length + '/' + OBJECTS.length;
    if (__bfHandArtByName && __bfHandArtByName.__sig === sig) return __bfHandArtByName;
    var map = { __sig: sig };
    (SPELLS || []).forEach(function(s, i) { if (s && s.name && SPELL_ART[i]) map[s.name] = SPELL_ART[i]; });
    (OBJECTS || []).forEach(function(o, i) { if (o && o.name && OBJECT_ART[i]) map[o.name] = OBJECT_ART[i]; });
    __bfHandArtByName = map;
    return map;
  }
  // Build a name -> item lookup for spells/objects, so we can read each card's
  // effect (damage / heal / mana / etc.) and show it on the hand card.
  var __bfHandItemByName = null;
  function handItemByName() {
    if (typeof SPELLS === 'undefined' || typeof OBJECTS === 'undefined') return null;
    var sigI = SPELLS.length + '/' + OBJECTS.length;
    if (__bfHandItemByName && __bfHandItemByName.__sig === sigI) return __bfHandItemByName;
    var map = { __sig: sigI };
    (SPELLS || []).forEach(function(s) { if (s && s.name) { var copy = {}; for (var k in s) copy[k] = s[k]; map[s.name] = { item: copy, kind: 'spell' }; } });
    (OBJECTS || []).forEach(function(o) { if (o && o.name) { var copy = {}; for (var k in o) copy[k] = o[k]; map[o.name] = { item: copy, kind: 'object' }; } });
    __bfHandItemByName = map;
    return map;
  }
  function handCardSummary(found) {
    if (!found || !found.item) return '';
    var it = found.item;
    var txt = it.txt || it.desc || it.description || '';
    return txt.length > 50 ? txt.slice(0, 48) + '…' : txt;
  }
  function bfAddChipButtons(chip, found, origOnclickProp, origOnclickAttr, url, name) {
    var mySide = (typeof NET !== 'undefined' && NET.role === 'client' && NET.mySide) ? NET.mySide : 'p';
    var isMyHand = !!chip.closest('#hand_' + mySide);
    var costBadge = document.createElement('div');
    var chipMana = found && found.item ? bfManaFor(found.item) : null;
    costBadge.className = 'bf-chip-cost' + (chipMana != null ? ' bf-mana-cost' : '');
    costBadge.textContent = (chipMana != null) ? chipMana : ((found && (found.kind === 'object' || found.kind === 'equipment')) ? (found.item.cost || '0') : '0');
    chip.appendChild(costBadge);
    
    if (found) {
        if (found.kind === 'spell') {
            chip.style.cssText += 'border-width:3.5px !important;border-color:#c79bff !important;box-shadow:0 4px 16px rgba(199,155,255,0.45) !important;';
        } else if (found.kind === 'object') {
            chip.style.cssText += 'border-width:3.5px !important;border-color:#ffd24a !important;box-shadow:0 4px 16px rgba(255,210,74,0.45) !important;';
        }
    }
    
    if (isMyHand) {
      var playBtn = document.createElement('button');
      playBtn.className = 'bf-chip-play';
      playBtn.innerHTML = '✦';
      playBtn.title = 'Jugar carta';
      playBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var kind = found ? found.kind : 'spell';
        if (kind === 'spell' && typeof window.actSpellMenu === 'function') {
           window.actSpellMenu();
        } else if (kind === 'object' && typeof window.actItemMenu === 'function') {
           window.actItemMenu();
        }
      });
      chip.appendChild(playBtn);
      if (document.getElementById('s-battle') && document.getElementById('s-battle').classList.contains('active')) playBtn.classList.add('bf-show');
    }
    if (url) {
      var safeName = String(name || '').replace(/'/g, "\\'");
      var zoomBtn = document.createElement('button');
      zoomBtn.className = 'bf-chip-zoom';
      zoomBtn.textContent = '🔍';
      zoomBtn.title = 'Ampliar carta';
      zoomBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        bfZoomBonus(safeName, url, found);
      });
      chip.appendChild(zoomBtn);
    }
  }
  function injectHandArt() {
    var map = handArtByName();
    if (!map) return;
    document.querySelectorAll('.chip-spell, .chip-object').forEach(function(chip) {
      if (chip.dataset.bfHandArt === '1') return;
      var name = (chip.childNodes[0] && chip.childNodes[0].textContent || '').trim();
      var url = map[name];
      if (!url) return;
      chip.dataset.bfHandArt = '1';
      chip.classList.add('bf-chip-card');
      if (name === 'Transformer') { chip.classList.add('bf-foil-card'); if (!chip.querySelector('.bf-foil-shine')) { var cfsh = document.createElement('div'); cfsh.className = 'bf-foil-shine'; chip.appendChild(cfsh); } }
      chip.title = name;
      for (var n = 0; n < chip.childNodes.length; n++) { var node = chip.childNodes[n]; if (node.nodeType === 3) node.textContent = ''; }
      var removeBtn = chip.querySelector('button, .chip-x, span[onclick]');
      if (removeBtn) removeBtn.classList.add('bf-chip-x');
      var art = document.createElement('div'); art.className = 'bf-chip-art-layer'; art.style.backgroundImage = 'url("' + url + '")';
      var fill = document.createElement('div'); fill.className = 'bf-chip-fill'; fill.style.backgroundImage = 'url("' + url + '")';
      chip.insertBefore(art, chip.firstChild); chip.insertBefore(fill, chip.firstChild);
       var nm = document.createElement('div'); nm.className = 'bf-chip-name'; nm.textContent = name; chip.appendChild(nm);
       var items = handItemByName(); var found = items ? items[name] : null;
       bfAddChipButtons(chip, found, chip.onclick, chip.getAttribute('onclick'), url, name);
    });
    
    // Battle hand natively separates spells and objects now.
  }
  function injectRecruitHeroArt() {
    document.querySelectorAll('.hero-acquired').forEach(function(card){if(card.dataset.bfAcqArt==='1'&&card.querySelector('.bf-acq-thumb'))return;var on=card.getAttribute('onclick')||'',hit=on.split("heroInfo('")[1],id=hit?hit.split("'")[0]:'',url=id?ART_BY_ID[id]:null;if(!url)return;var thumb=document.createElement('div');thumb.className='bf-acq-thumb';thumb.style.backgroundImage='url("'+url+'")';card.insertBefore(thumb,card.firstChild);card.dataset.bfAcqArt='1';});
    document.querySelectorAll('.pr-got').forEach(function(row){if(row.dataset.bfResultArt==='1')return;var b=row.querySelector('b');if(!b)return;var url=ART_BY_NAME[b.textContent.trim()];if(!url)return;var thumb=document.createElement('span');thumb.className='bf-result-thumb';var timg=document.createElement('img');timg.src=url;timg.alt='';thumb.appendChild(timg);row.insertBefore(thumb,row.firstChild);row.dataset.bfResultArt='1';});
  }
  // Round summary table on the auction result panel: each player's applied bonuses + final card cost.
  function injectAuctionSummary() {
    var box=document.querySelector('.pr-box');
    if(!box||box.dataset.bfSummary==='1'||typeof G==='undefined'||!G.phaseResult)return;
    var r=G.phaseResult;
    function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[c];});}
    function bInfo(side){var mb=G.bonus&&G.bonus[side],rb=G.bonus&&G.bonus[other(side)],add=0,sub=0,t=[];if(mb){if(mb.type==='BID_ADD'){add=Number(mb.effect||0);t.push('<span class="bsum-tag bsum-add">−'+add+' 🪙 al pagar · '+esc(mb.name)+'</span>');}else if(mb.type==='PERM'||mb.type==='EQP'||mb.type==='BON'){t.push('<span class="bsum-tag bsum-none">'+esc(mb.name)+'</span>');}}if(rb&&rb.type==='BID_SUB'){sub=Number(rb.effect||0);t.push('<span class="bsum-tag bsum-sub">+'+sub+' 🪙 al pagar · '+esc(rb.name)+'</span>');}return{add:add,sub:sub,html:t.length?t.join(''):'<span class="bsum-tag bsum-none">sin bonificador</span>'};}
    function rowH(side){
      var pass=side==='p'?r.pPass:r.oPass,name=side==='p'?r.bpName:r.boName,bid=Number((side==='p'?r.bpAmt:r.boAmt)||0),got=side==='p'?r.gotP:r.gotO,bi=bInfo(side),won=!!got,paid=Math.max(0,bid-bi.add+bi.sub);
      var hero=(G.cands||[]).find(function(h){return h&&h.name===name;})||(typeof HEROES!=='undefined'?HEROES:[]).find(function(h){return h&&h.name===name;})||((G.team&&G.team[side])||[]).slice(-1)[0],col=(hero&&hero.clanColor)||'#caa14a',url=hero?ART_BY_NAME[hero.name]:null,sym=hero?raceSigilSvg(hero.clan, col):raceSigilSvg('', col),tag=side==='p'?'<span class="bsum-you">TÚ</span>':((typeof NET!=='undefined'&&NET.role)?'<span class="bsum-rival">rival</span>':'<span class="bsum-rival">IA</span>');
      var isEpic=hero&&hero.clan==='Épicas';
      var nameDisp = isEpic?(name+' ★'):name;
      var costCell=pass?'<div class="bsum-cost-pass">—</div>':'<div class="bsum-cost"><div class="bsum-cost-fin">'+((won?paid:bid)+' 🪙')+'</div><div class="bsum-cost-lbl">'+(won?('pagado (puja '+bid+')'):'pujó '+bid)+'</div></div>';
      var thumbHtml=url?'<div class="bsum-thumb bsum-thumb-img" style="--c:'+col+';background-image:url(\\''+url+'\\')"></div>':'<div class="bsum-thumb" style="--c:'+col+'">'+sym+'</div>';
      var winBadge=won?'<div style="font-size:10px;font-weight:900;color:#54e876;text-transform:uppercase;letter-spacing:0.5px;background:rgba(84,232,118,0.15);border:1px solid rgba(84,232,118,0.4);padding:2px 6px;border-radius:6px;display:inline-block;margin-top:2px;">★ GANÓ LA PUJA</div>':'';
      return '<div class="bsum-row'+(side==='p'?' bsum-row-you':'')+'" style="position:relative">'+thumbHtml+'<div class="bsum-main"><div class="bsum-player">'+esc((G.names&&G.names[side])||'')+' '+tag+'</div>'+(pass?'<div class="bsum-hero bsum-pass">conserva su héroe y pasa</div>':'<div class="bsum-hero">'+esc(nameDisp||'—')+'</div><div class="bsum-bonus">'+bi.html+'</div>'+winBadge)+'</div>'+costCell+'</div>';
    }
    box.dataset.bfSummary='1';
    var verdict = box.querySelector('.pr-verdict');
    Array.from(box.children).forEach(function(c) { c.style.display = 'none'; });
    var wrap=document.createElement('div');wrap.className='bsum-wrap';
    wrap.innerHTML='<div class="bsum-head">Resumen de la ronda · puja y coste pagado</div>'+rowH('p')+rowH('o');
    box.appendChild(wrap);
    if(verdict){verdict.style.display='';box.appendChild(verdict);}
  }
  function injectTitleIcons() {
    var row = document.querySelector('.title-emoji');
    if (!row || row.dataset.bfIconsDone === '1') return;
    row.dataset.bfIconsDone = '1';
    var titleScreen = document.getElementById('s-title');
    if (!titleScreen) return;
    // Big logo above the game title
    if (!titleScreen.querySelector('.bf-title-logo')) {
      var gtitle = titleScreen.querySelector('.gtitle');
      var lw = document.createElement('div'); lw.className = 'bf-title-logo';
      lw.innerHTML = '<img src="' + LOGO_URL + '" alt="Bizarre Fantasies">';
      if (gtitle) gtitle.parentNode.insertBefore(lw, gtitle); else titleScreen.insertBefore(lw, titleScreen.firstChild);
    }
  }
  // Punkito's other looks: élite (Harley, battle-only) + reaction faces.
  var GUIDE_IMG = "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/292c04262_generated_image.png", GUIDE_ELITE_IMG = "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/d7e007cd6_generated_image.png";
  var GUIDE_FACE = { wow: "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/e5071f94c_generated_image.png", cheer: "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/51ec29abd_generated_image.png", shock: "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/63a162077_generated_image.png" };
  function bfInBattle() { var b = document.getElementById('s-battle'); return !!(b && b.classList.contains('active')); } // Punkito rides his Harley (élite look) only in battle.
  function bfGuideBaseImg() { return bfInBattle() ? GUIDE_ELITE_IMG : GUIDE_IMG; } // Idle look: élite (Harley) in battle, normal elsewhere.
  // Make Punkito react: swap to an expression face, animate + float a word,
  // then settle back. Reactions don't stack. type: 'cheer' | 'wow' | 'shock'.
  function bfGuideReact(type, word) {
    var wrap = document.getElementById('bf-guide');
    if (!wrap || window.__bfGuideHidden) return;
    var charEl = wrap.querySelector('.bf-guide-char');
    var img = charEl && charEl.querySelector('img');
    if (!charEl || !img || charEl.dataset.bfReacting === '1') return;
    charEl.dataset.bfReacting = '1';
    img.src = GUIDE_FACE[type] || GUIDE_FACE.wow;
    charEl.classList.remove('bf-react-cheer', 'bf-react-wow', 'bf-react-shock', 'bf-battle-ride');
    void charEl.offsetWidth;
    // In battle: do a dramatic ride-to-center animation on cheer/wow
    if (bfInBattle() && (type === 'cheer' || type === 'wow')) {
      charEl.classList.add('bf-battle-ride');
      if (!charEl.querySelector('.bf-guide-spark')) { var spark2 = document.createElement('div'); spark2.className = 'bf-guide-spark'; charEl.insertBefore(spark2, charEl.firstChild); }
      if (word) { var pop2 = document.createElement('div'); pop2.className = 'bf-guide-pop'; pop2.textContent = word; charEl.appendChild(pop2); setTimeout(function() { if (pop2.parentNode) pop2.remove(); }, 1700); }
      setTimeout(function() { charEl.classList.remove('bf-battle-ride'); img.src = bfGuideBaseImg(); charEl.dataset.bfReacting = ''; }, 2300);
      return;
    }
    var animMap = { cheer: 'bf-react-cheer', wow: 'bf-react-wow', shock: 'bf-react-shock' };
    charEl.classList.add(animMap[type] || 'bf-react-wow');
    if (!charEl.querySelector('.bf-guide-spark')) { var spark = document.createElement('div'); spark.className = 'bf-guide-spark'; charEl.insertBefore(spark, charEl.firstChild); }
    if (word) { var pop = document.createElement('div'); pop.className = 'bf-guide-pop' + (type === 'shock' ? ' bf-pop-shock' : ''); pop.textContent = word; charEl.appendChild(pop); setTimeout(function() { if (pop.parentNode) pop.remove(); }, 1700); }
    setTimeout(function() { charEl.classList.remove('bf-react-cheer', 'bf-react-wow', 'bf-react-shock'); img.src = bfGuideBaseImg(); charEl.dataset.bfReacting = ''; }, 2300);
  }
  window.bfGuideReact = bfGuideReact;
  // Keep Punkito's idle look synced with the screen (Harley in battle).
  function bfSyncGuideLook() {
    var charEl = document.querySelector('#bf-guide .bf-guide-char');
    var img = charEl && charEl.querySelector('img');
    if (!img || charEl.dataset.bfReacting === '1') return;
    var base = bfGuideBaseImg();
    if (img.getAttribute('src') !== base) img.src = base;
    var showImg = document.querySelector('#bf-guide-show img');
    if (showImg && showImg.getAttribute('src') !== base) showImg.src = base;
  }
  // Detect strong battle/equip events and trigger a Punkito reaction. Watches: hero deaths (shock), revive/phoenix (wow), epic bonus appearing (wow).
  function bfMakeNarratorDraggable(w){var ch=w.querySelector('.bf-nar-ch');if(!ch||w.dataset.bfDrag==='1')return;w.dataset.bfDrag='1';ch.style.cursor='grab';ch.style.touchAction='none';var drag=null;function pt(e){return e.touches&&e.touches[0]?e.touches[0]:e;}function start(e){var p=pt(e),r=w.getBoundingClientRect();w.style.animation='none';w.style.left=r.left+'px';w.style.top=r.top+'px';w.style.transform='none';drag={sx:p.clientX-r.left,sy:p.clientY-r.top};e.preventDefault();e.stopPropagation();}function move(e){if(!drag)return;var p=pt(e),maxX=Math.max(0,window.innerWidth-w.offsetWidth-4),maxY=Math.max(0,window.innerHeight-w.offsetHeight-4);w.style.left=Math.max(0,Math.min(maxX,p.clientX-drag.sx))+'px';w.style.top=Math.max(0,Math.min(maxY,p.clientY-drag.sy))+'px';e.preventDefault();}function end(){drag=null;}ch.addEventListener('mousedown',start);ch.addEventListener('touchstart',start,{passive:false});document.addEventListener('mousemove',move);document.addEventListener('touchmove',move,{passive:false});document.addEventListener('mouseup',end);document.addEventListener('touchend',end);}
  // ---- Cinemática de remate: cuando un héroe cae a 0 HP, el asesino entra a pantalla completa con un tajo de luz ----
  function bfKillCinematic(victimCard){ if(window.__bfKillAnim||document.getElementById('bf-kill-ov'))return; var vid=heroIdFromCard(victimCard),vSide=(String(victimCard.id||'').split('_')[1])||'p'; var ak=document.querySelector('.bhero.active-turn'),kid=null,kElite=false; if(ak&&ak!==victimCard){var aSide=(String(ak.id||'').split('_')[1])||'p'; if(aSide!==vSide){kid=heroIdFromCard(ak);kElite=ak.classList.contains('elite-mode')||ak.classList.contains('bf-auto-elite');}} var vh=(typeof G!=='undefined'&&G.team&&G.team[vSide]||[]).find(function(h){return h&&h.id===vid;}); var vArtId=(vh&&vh._token)?vh._token:vid; var kh=null; if(kid){var kSide=vSide==='p'?'o':'p';kh=(G.team&&G.team[kSide]||[]).find(function(h){return h&&h.id===kid;});} var kArtId=(kh&&kh._token)?kh._token:kid; var vArt=ART_BY_ID[vArtId]||'',kArt=kid?((kElite?ELITE_BY_ID[kArtId]:0)||ART_BY_ID[kArtId]||''):''; if(!vArt&&!kArt)return; window.__bfKillAnim=1; var ov=document.createElement('div');ov.id='bf-kill-ov'; ov.innerHTML='<style>#bf-kill-ov{position:fixed;inset:0;z-index:100000;pointer-events:none;overflow:hidden;background:radial-gradient(circle at 50% 45%,rgba(60,0,0,.5),rgba(0,0,0,.9));animation:bfKovIn .25s ease-out}.bf-kill-killer{position:absolute;left:4%;bottom:-2%;height:92%;max-width:48vw;object-fit:contain;filter:drop-shadow(0 0 44px rgba(255,60,40,.85)) saturate(1.3);animation:bfKillerIn .55s cubic-bezier(.2,.9,.3,1.15)}.bf-kill-victim{position:absolute;right:6%;bottom:4%;height:70%;max-width:40vw;object-fit:contain;filter:grayscale(1) brightness(.75);animation:bfVictimOut 1.5s ease-in .55s forwards}.bf-kill-slash{position:absolute;inset:-25%;background:linear-gradient(115deg,transparent 46%,rgba(255,255,255,.95) 49.4%,#ffdca0 50%,rgba(255,255,255,.95) 50.6%,transparent 54%);opacity:0;animation:bfSlash .5s ease-out .4s}.bf-kill-txt{position:absolute;top:10%;left:50%;transform:translateX(-50%);font-family:"Cinzel",serif;font-weight:1000;font-size:clamp(30px,7vw,64px);color:#ff4b45;letter-spacing:3px;white-space:nowrap;text-shadow:0 0 26px rgba(255,60,40,.95),0 4px 12px #000;opacity:0;animation:bfKillTxt 2s ease-out .5s forwards}.bf-kill-name{position:absolute;top:24%;left:50%;transform:translateX(-50%);font-family:"Cinzel",serif;font-weight:900;font-size:clamp(13px,2.4vw,20px);color:#ffe49a;text-shadow:0 2px 8px #000;background:rgba(8,5,14,.72);border:1px solid rgba(255,210,74,.5);border-radius:999px;padding:6px 18px;opacity:0;animation:bfKillTxt 2s ease-out .7s forwards;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis}@keyframes bfKovIn{from{opacity:0}to{opacity:1}}@keyframes bfKillerIn{from{transform:translateX(-70%) scale(.8);opacity:0}to{transform:none;opacity:1}}@keyframes bfVictimOut{0%{opacity:1}20%{transform:translateX(16px) rotate(3deg)}100%{opacity:0;transform:translateY(28%) rotate(15deg);filter:grayscale(1) brightness(.15)}}@keyframes bfSlash{0%{opacity:0;transform:translateX(-40%)}30%{opacity:1}100%{opacity:0;transform:translateX(40%)}}@keyframes bfKillTxt{0%{opacity:0;transform:translateX(-50%) scale(2.2)}16%{opacity:1;transform:translateX(-50%) scale(1)}82%{opacity:1}100%{opacity:0}}@keyframes bfKillShake{0%,100%{transform:none}20%{transform:translate(-8px,4px)}40%{transform:translate(7px,-5px)}60%{transform:translate(-5px,3px)}80%{transform:translate(4px,-2px)}}</style>'+(kArt?'<img class="bf-kill-killer" src="'+kArt+'">':'')+(vArt?'<img class="bf-kill-victim" src="'+vArt+'">':'')+'<div class="bf-kill-slash"></div><div class="bf-kill-txt">¡GOLPE MORTAL!</div>'+((kh&&vh)?'<div class="bf-kill-name">'+(kh.name||'')+' acaba con '+(vh.name||'su rival')+'</div>':''); document.body.appendChild(ov); var bs=document.getElementById('s-battle'); if(bs){bs.style.animation='bfKillShake .5s ease-in-out .35s';setTimeout(function(){bs.style.animation='';},1100);} setTimeout(function(){ov.style.transition='opacity .35s';ov.style.opacity='0';},2150); setTimeout(function(){if(ov.parentNode)ov.parentNode.removeChild(ov);window.__bfKillAnim=0;},2550); }
  // ---- Cinemática final: vídeo distinto para victoria/derrota + los seis héroes reales animados ----
  function bfEndCinematic(forceWin){var sc=document.getElementById('s-result');if(!sc||!sc.classList.contains('active')){window.__bfEndCine=0;return;}if(window.__bfEndCine)return;window.__bfEndCine=1;var mySide=(typeof NET!=='undefined'&&NET.mySide)||'p',hasForced=typeof forceWin==='boolean',hasStored=!!(typeof G!=='undefined'&&G._result&&typeof G._result.pWin==='boolean'),storedPWin=hasStored?G._result.pWin:false,localWin=hasForced?forceWin:(hasStored?(mySide==='p'?storedPWin:!storedPWin):/victoria/i.test(sc.textContent||'')),winSide=localWin?mySide:(mySide==='p'?'o':'p');var VICTORY_VIDEOS=['https://media.base44.com/videos/public/6a39c9aee54efe3a86d6d69a/a070f4f82_Victoria_Final.mp4','https://media.base44.com/videos/public/6a39c9aee54efe3a86d6d69a/aabbb7c13_Vdeo_Victoria_2.mp4','https://media.base44.com/videos/public/6a39c9aee54efe3a86d6d69a/8fb555ac0_Vdeo_Victoria_3.mp4','https://media.base44.com/videos/public/6a39c9aee54efe3a86d6d69a/11197a899_Vdeo_Victoria_4.mp4'],DEFEAT_VIDEOS=['https://media.base44.com/videos/public/6a39c9aee54efe3a86d6d69a/b8f67814b_Derrota_Final.mp4','https://media.base44.com/videos/public/6a39c9aee54efe3a86d6d69a/1b65cc210_Vdeo_Derrota_2.mp4','https://media.base44.com/videos/public/6a39c9aee54efe3a86d6d69a/b3cae352d_Vdeo_Derrota_3.mp4','https://media.base44.com/videos/public/6a39c9aee54efe3a86d6d69a/b6afc1db7_Vdeo_Derrota_4.mp4'],victoryVideo=VICTORY_VIDEOS[Math.floor(Math.random()*VICTORY_VIDEOS.length)],defeatVideo=DEFEAT_VIDEOS[Math.floor(Math.random()*DEFEAT_VIDEOS.length)];function originals(side){return((G&&G.team&&G.team[side])||[]).filter(function(h){return h&&!h._bfDuck;}).slice(0,3);}function heroMarkup(h,side,i){var aid=h._token||h.id,url=(h.eliteMode?ELITE_BY_ID[aid]:null)||ART_BY_ID[aid]||'',won=side===winSide,delay=(i*.16)+(side==='o'?.18:0);return '<div class="bf-cine-hero '+(won?'bf-cine-winner':'bf-cine-fallen')+'" style="--bf-delay:'+delay+'s"><div class="bf-cine-portrait">'+(url?'<img src="'+url+'" alt="'+bfEsc(h.name||'Héroe')+'">':'')+'</div><div class="bf-cine-name">'+bfEsc(h.name||'Héroe')+'</div></div>';}var localHeroes=originals(mySide),rivalSide=mySide==='p'?'o':'p',rivalHeroes=originals(rivalSide),lineup='<div class="bf-cine-team bf-cine-local">'+localHeroes.map(function(h,i){return heroMarkup(h,mySide,i);}).join('')+'</div><div class="bf-cine-vs">VS</div><div class="bf-cine-team bf-cine-rival">'+rivalHeroes.map(function(h,i){return heroMarkup(h,rivalSide,i);}).join('')+'</div>';var ov=document.createElement('div');ov.id='bf-end-cine';ov.className=localWin?'bf-cine-victory':'bf-cine-defeat';ov.innerHTML='<style>#bf-end-cine{position:fixed;inset:0;z-index:100002;background:#000;overflow:hidden;display:flex;align-items:center;justify-content:center;animation:bfCineIn .35s ease-out}#bf-end-cine video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.16) contrast(1.08)}#bf-end-cine:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.18),rgba(8,5,14,.42) 55%,rgba(3,2,8,.84));pointer-events:none}.bf-cine-ttl{position:absolute;top:6%;left:50%;transform:translateX(-50%);z-index:4;font-family:"Cinzel",serif;font-weight:1000;font-size:clamp(34px,7vw,76px);letter-spacing:5px;white-space:nowrap;opacity:0;animation:bfCineTtl 3.1s ease-out .25s forwards}.bf-cine-victory .bf-cine-ttl{color:#ffd24a;text-shadow:0 0 32px rgba(255,210,74,.95),0 4px 12px #000}.bf-cine-defeat .bf-cine-ttl{color:#ff6262;text-shadow:0 0 32px rgba(255,60,60,.8),0 4px 12px #000}.bf-cine-lineup{position:absolute;left:3%;right:3%;bottom:7%;z-index:3;display:grid;grid-template-columns:1fr auto 1fr;gap:clamp(8px,2vw,28px);align-items:end}.bf-cine-team{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(5px,1.2vw,16px);align-items:end}.bf-cine-vs{align-self:center;font-family:"Cinzel",serif;font-size:clamp(20px,4vw,44px);font-weight:1000;color:#fff;text-shadow:0 0 18px #c06bff,0 3px 8px #000}.bf-cine-hero{min-width:0;text-align:center;opacity:0;animation:bfHeroRise .8s cubic-bezier(.18,.88,.28,1.2) calc(.6s + var(--bf-delay)) forwards}.bf-cine-portrait{position:relative;margin:auto;width:min(13vw,150px);height:min(25vh,220px);border-radius:18px 18px 10px 10px;overflow:hidden;background:#09070d;border:3px solid rgba(255,210,74,.65);box-shadow:0 12px 28px rgba(0,0,0,.75),0 0 24px rgba(255,210,74,.32);animation:bfHeroFloat 2.8s ease-in-out calc(1.5s + var(--bf-delay)) infinite}.bf-cine-portrait img{width:100%;height:100%;object-fit:cover;object-position:center 18%;filter:saturate(1.2) contrast(1.08)}.bf-cine-winner .bf-cine-portrait{border-color:#ffd24a;box-shadow:0 12px 28px rgba(0,0,0,.75),0 0 34px rgba(255,210,74,.72)}.bf-cine-fallen .bf-cine-portrait{border-color:#7f6a94;filter:grayscale(.72) brightness(.62);transform:translateY(16px) rotate(-2deg)}.bf-cine-name{margin-top:7px;padding:4px 5px;border-radius:999px;background:rgba(8,5,14,.78);border:1px solid rgba(255,210,74,.38);font-family:"Cinzel",serif;font-weight:900;font-size:clamp(7px,1.1vw,13px);color:#fff5dc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 4px #000}.bf-cine-skip{position:absolute;top:18px;right:18px;z-index:5;padding:9px 20px;border-radius:999px;border:1.5px solid rgba(255,210,74,.7);background:rgba(8,5,14,.82);color:#ffe49a;font-family:"Cinzel",serif;font-weight:900;font-size:13px;cursor:pointer}@keyframes bfCineIn{from{opacity:0}to{opacity:1}}@keyframes bfCineTtl{0%{opacity:0;transform:translateX(-50%) scale(1.8)}16%,82%{opacity:1;transform:translateX(-50%) scale(1)}100%{opacity:0}}@keyframes bfHeroRise{from{opacity:0;transform:translateY(80px) scale(.72)}to{opacity:1;transform:none}}@keyframes bfHeroFloat{0%,100%{translate:0 0}50%{translate:0 -10px}}@media(max-width:640px){.bf-cine-lineup{left:2%;right:2%;bottom:12%;gap:4px}.bf-cine-team{gap:3px}.bf-cine-portrait{width:min(14vw,78px);height:min(22vh,140px);border-width:2px}.bf-cine-vs{font-size:18px}.bf-cine-name{font-size:6.5px;padding:3px 2px}.bf-cine-ttl{top:10%;font-size:clamp(30px,11vw,48px);letter-spacing:2px}}</style><video src="'+(localWin?victoryVideo:defeatVideo)+'" autoplay muted playsinline></video><div class="bf-cine-ttl">'+(localWin?'¡VICTORIA!':'DERROTA')+'</div><div class="bf-cine-lineup">'+lineup+'</div><button class="bf-cine-skip">Saltar ▸</button>';var closed=false;function done(){if(closed)return;closed=true;ov.style.transition='opacity .4s';ov.style.opacity='0';setTimeout(function(){if(ov.parentNode)ov.parentNode.removeChild(ov);},420);}ov.querySelector('.bf-cine-skip').onclick=done;var vd=ov.querySelector('video');vd.onended=done;vd.onerror=done;document.body.appendChild(ov);var playAttempt=vd.play();if(playAttempt&&playAttempt.catch)playAttempt.catch(function(){vd.muted=true;vd.play().catch(function(){});});setTimeout(done,10000);}
  window.bfKillCinematic=bfKillCinematic;
  window.bfEndCinematic=bfEndCinematic;
  function bfWatchGuideEvents() {
    // In battle there's a single Punkito: the narrator, fixed at the very top
    // center. Hide the draggable guide so only one Punkito shows.
    var dgWrap = document.getElementById('bf-guide'), dgShow = document.getElementById('bf-guide-show');
    if (bfInBattle()) {
      if (dgWrap) dgWrap.style.display = 'none';
      if (dgShow) dgShow.classList.remove('bf-guide-visible');
    } else if (dgWrap && !window.__bfGuideHidden && dgWrap.style.display === 'none') {
      dgWrap.style.display = '';
    }
    var resScreen=document.getElementById('s-result');if(resScreen&&resScreen.classList.contains('active')){var exNar=document.getElementById('bf-narrator');if(exNar)exNar.remove();var exNarShow=document.getElementById('bf-nar-show');if(exNarShow)exNarShow.remove();}
    if(!document.getElementById('bf-narrator')&&bfInBattle()){
      var w=document.createElement('div');w.id='bf-narrator';
      w.innerHTML='<style>.bf-nar{position:fixed;top:8px;left:50%;transform:translateX(-50%);display:flex;align-items:flex-end;gap:12px;width:min(440px,92vw);z-index:90001;animation:bfNarRide 4.6s cubic-bezier(.16,.84,.3,1)}.bf-nar.hid{display:none!important}.bf-nar-ch{position:relative;width:84px;height:84px;flex-shrink:0;animation:bfGuideFloat 3.2s ease-in-out infinite;filter:drop-shadow(0 6px 14px rgba(0,0,0,.7))}.bf-nar-circle{position:absolute;inset:0}.bf-nar-ch img{width:100%;height:100%;object-fit:contain;background:transparent!important;filter:saturate(1.2) drop-shadow(0 0 8px rgba(255,210,74,.4))}.bf-nar-dust{position:absolute;left:-30px;bottom:6px;width:46px;height:30px;border-radius:50%;background:radial-gradient(circle,rgba(255,210,74,.55),rgba(255,160,40,.18) 50%,transparent 72%);opacity:0;animation:bfNarDust 4.6s ease-out}.bf-nar-bub{position:relative;background:linear-gradient(180deg,#1c1533,#130d24);border:2px solid rgba(255,210,74,.6);border-radius:14px;padding:12px 34px 12px 14px;box-shadow:0 8px 24px rgba(0,0,0,.6),inset 0 0 0 1px rgba(255,210,74,.15);flex:1;animation:bfBubblePulse 4s ease-in-out infinite}.bf-nar-bub::before{content:"";position:absolute;left:-10px;bottom:20px;border-width:8px 10px 8px 0;border-style:solid;border-color:transparent rgba(255,210,74,.6) transparent transparent}.bf-nar-bub::after{content:"";position:absolute;left:-7px;bottom:20px;border-width:8px 10px 8px 0;border-style:solid;border-color:transparent #130d24 transparent transparent;z-index:1}.bf-nar-tt{font-family:"Cinzel",serif;font-weight:1000;font-size:11.5px;color:#ffd24a;letter-spacing:.3px;text-shadow:0 1px 2px #000;margin-bottom:4px}.bf-nar-tx{font-size:13px;line-height:1.35;color:#f3ecff;font-weight:600;text-shadow:0 1px 2px #000}.bf-nar-tx b{color:#ffe49a}.bf-nar-off{position:absolute;top:4px;right:4px;width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.08);color:#cbb9ee;border:none;cursor:pointer;font-size:14px;z-index:2}.bf-nar-off:hover{background:rgba(255,255,255,.2);color:#fff}@keyframes bfTextPop{0%{opacity:0;transform:translateY(4px) scale(0.98)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes bfNarRide{0%{transform:translateX(-210%) rotate(-7deg) scale(.78);opacity:0}12%{opacity:1}50%{transform:translateX(6%) rotate(2deg) scale(1.07)}68%{transform:translateX(-4%) rotate(-1.5deg) scale(1.02)}82%{transform:translateX(1%) rotate(.5deg) scale(1)}100%{transform:translateX(-50%) rotate(0) scale(1);left:50%}}@keyframes bfNarDust{0%{opacity:0;transform:translateX(0) scale(.6)}20%{opacity:.9}55%{opacity:.7}100%{opacity:0;transform:translateX(-80px) scale(1.7)}}@media(max-width:640px){.bf-nar{gap:8px;top:6px}.bf-nar-ch{width:66px;height:66px}.bf-nar-bub{padding:10px 30px 10px 12px}.bf-nar-tx{font-size:12px}}</style>'+
      '<div class="bf-nar-ch"><div class="bf-nar-circle"><div class="bf-nar-dust"></div><img src="'+GUIDE_ELITE_IMG+'" alt="Punkito"></div></div><div class="bf-nar-bub"><button class="bf-nar-off">✕</button><div class="bf-nar-tt">Punkito Élite narra:</div><div class="bf-nar-tx" id="bf-nar-txt">¡A luchar!</div></div>';
      w.className='bf-nar';document.body.appendChild(w);if(!document.getElementById('bf-nar-show')){var nshow=document.createElement('div');nshow.id='bf-nar-show';nshow.innerHTML='<img src="'+GUIDE_ELITE_IMG+'" alt="Punkito" style="width:100%;height:100%;object-fit:contain;">';nshow.style.cssText='position:fixed;top:8px;left:50%;transform:translateX(-50%);width:52px;height:52px;border-radius:50%;overflow:hidden;border:2.5px solid rgba(255,210,74,.8);box-shadow:0 4px 14px rgba(0,0,0,.6),0 0 14px rgba(255,210,74,.5);cursor:pointer;z-index:90002;display:none;background:radial-gradient(circle at 42% 32%,#302254,#0e091c);animation:bfGuideFloat 3.2s ease-in-out infinite;';var narStyleTag=w.querySelector('style');if(narStyleTag)narStyleTag.textContent+='.bf-nar-blink{animation:bfNarBlink .8s ease-in-out infinite!important}@keyframes bfNarBlink{0%,100%{box-shadow:0 4px 14px rgba(0,0,0,.6),0 0 14px rgba(255,210,74,.5)}50%{box-shadow:0 4px 14px rgba(0,0,0,.6),0 0 30px 8px rgba(255,60,60,.95)}}';nshow.onclick=function(){w.classList.remove('hid');nshow.style.display='none';nshow.classList.remove('bf-nar-blink');};document.body.appendChild(nshow);}
      w.querySelector('.bf-nar-off').onclick=function(){w.classList.add('hid');var nshow=document.getElementById('bf-nar-show');if(nshow)nshow.style.display='flex';};bfMakeNarratorDraggable(w);var nshowInit=document.getElementById('bf-nar-show');if(nshowInit)nshowInit.style.display='none';
    }
    var nw=document.getElementById('bf-narrator');
    if(nw&&!nw.classList.contains('hid')){
      var l=document.querySelector('.b-log')||document.getElementById('b-log')||document.querySelector('.log-box')||document.querySelector('.battle-log')||document.querySelector('.jrpg-log')||document.getElementById('jrpg-log')||document.querySelector('.coach-txt');
      if(l){
        var es=l.children,lh='';
        if(es.length) lh=es[0].innerHTML;
        else{var ps=l.innerHTML.split(/<br\\s*\\/?>/i).filter(function(s){return s.trim().length>0;});if(ps.length)lh=ps[0];}
        if(lh&&nw.dataset.last!==lh){
          nw.dataset.last=lh;
          var txt = document.getElementById('bf-nar-txt');
          txt.innerHTML=lh;
          txt.style.animation='none';void txt.offsetWidth;txt.style.animation='bfTextPop .35s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          var ch=nw.querySelector('.bf-nar-ch');ch.style.animation='none';void ch.offsetWidth;ch.style.animation='bfGuideFloat 3.2s ease-in-out infinite';
        }
      }
    } else { var lx=document.querySelector('.b-log')||document.getElementById('b-log')||document.querySelector('.log-box')||document.querySelector('.battle-log')||document.querySelector('.jrpg-log')||document.getElementById('jrpg-log')||document.querySelector('.coach-txt'); if(nw&&nw.classList.contains('hid')&&lx){ var esx=lx.children,lhx=''; if(esx.length)lhx=esx[0].innerHTML; else{var psx=lx.innerHTML.split(/<br\\s*\\/?>/i).filter(function(s){return s.trim().length>0;});if(psx.length)lhx=psx[0];} if(lhx&&nw.dataset.last!==lhx){nw.dataset.last=lhx;var nshowx=document.getElementById('bf-nar-show');if(nshowx)nshowx.classList.add('bf-nar-blink');} } }
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card) {
      var hp = readHeroHp(card);
      if (hp === null) return;
      if (card.dataset.bfGuideHp !== undefined) { var old = parseInt(card.dataset.bfGuideHp, 10); if (!isNaN(old) && old > 0 && hp <= 0) { bfGuideReact('shock', '¡OH NO!'); bfKillCinematic(card); } else if (!isNaN(old) && old <= 0 && hp > 0) bfGuideReact('wow', '¡REVIVE!'); }
      card.dataset.bfGuideHp = String(hp);
    });
    var bonusName = '';
    document.querySelectorAll('.hand-lbl').forEach(function(lbl) { if (!/Bonificador de esta ronda/i.test(lbl.textContent)) return; var chip = lbl.nextElementSibling; while (chip && (!chip.classList || !chip.classList.contains('chip'))) chip = chip.nextElementSibling; if (chip) bonusName = chip.textContent.trim(); });
    if (bonusName && bonusName !== window.__bfGuideBonus) { window.__bfGuideBonus = bonusName; if (/Épic|Convocatoria|Destino/i.test(bonusName)) bfGuideReact('wow', '¡ÉPICO!'); }
  }
  // Punkito approves powerful equip purchases (phoenix, plasma/thunder weapons…).
  function bfGuideApprovePurchase(item) {
    if (!item) return;
    var name = (item.name || '') + ' ' + (item.id || '');
    if (/f[eé]nix|phoenix|plasma|thunder|trueno|ca[ñn][oó]n|cannon|aegis|exo|arcan|revive|revivir|pluma/i.test(name)) bfGuideReact('cheer', '¡BUENA ELECCIÓN!');
  }
  window.bfGuideApprovePurchase = bfGuideApprovePurchase;
  // What the guide says on each screen. Resolved from the active screen id.
  function guideMessageFor(id, active) {
    if (id === 's-title') {
      return { t: '¡Hola, aventurero!', m: 'Soy <b>Punkito</b>, tu guía. Pulsa <b>Comenzar</b> para empezar. Espero que disfrutes de la experiencia.' };
    }
    if (id === 's-equip') {
      return { t: 'Fase de Equipamiento', m: 'Para equipar un arma o armadura: <b>1)</b> pulsa la carta de la tienda para <b>seleccionarla</b>, <b>2)</b> luego pulsa <b>«Comprar»</b> en el héroe al que se la quieras poner. Los hechizos y objetos van a tu <b>mano</b>. Recuerda: tus monedas de equipamiento <b>ya incluían las de la subasta</b>: lo gastado al pujar por héroes se ha restado de este presupuesto. Cuando termines, pulsa <b>«Listo — a la batalla»</b>.' };
    }
    if (id === 's-battle') {
      return { t: '¡A la batalla!', m: 'Elige una <b>acción</b> con el héroe activo (atacar, hechizo u objeto). Vence a los <b>3 héroes</b> rivales.' };
    }
    if (id && id !== 's-title') {
      var txt = (active && active.textContent) || '';
      // "Preparar Partida" — choose game mode (vs IA / Multijugador). Not the auction.
      if (/Preparar Partida|vs\\s*IA|Multijugador/i.test(txt) && !/Fase\\s*\\d|puja|subasta/i.test(txt)) {
        return { t: 'Preparar Partida', m: 'Elige el modo: <b>vs IA</b> o <b>Multijugador</b>, escribe tu nombre y pulsa <b>Comenzar</b>.' };
      }
      // Auction / recruit screens
      return { t: 'Fase de Subasta', m: 'Mira los <b>6 héroes</b> y haz una <b>puja sellada</b> por el que quieras. Quien ofrezca más se lo lleva. Al acabar toda la subasta, las monedas que te sobren se <b>sumarán a tu presupuesto de equipamiento</b>, junto con los bonificadores de equipamiento que te salgan.' };
    }
    return null;
  }
  function ensureGuide() {
    if (document.getElementById('bf-guide')) return;
    var wrap = document.createElement('div');
    wrap.id = 'bf-guide';
    wrap.className = 'bf-guide';
    wrap.innerHTML =
      '<div class="bf-guide-char"><img src="' + GUIDE_IMG + '" alt="Guía"></div>' +
      '<div class="bf-guide-bubble">' +
        '<button class="bf-guide-x" aria-label="Ocultar guía">✕</button>' +
        '<div class="bf-guide-title"></div>' +
        '<div class="bf-guide-text"></div>' +
      '</div>';
    document.body.appendChild(wrap);
    var show = document.createElement('button');
    show.id = 'bf-guide-show';
    show.className = 'bf-guide-show';
    show.setAttribute('aria-label', 'Mostrar guía');
    show.innerHTML = '<img src="' + GUIDE_IMG + '" alt="Guía">';
    document.body.appendChild(show);
    function bfHideGuide(e) { if (e) { e.preventDefault(); e.stopPropagation(); } window.__bfGuideHidden = true; wrap.style.display = 'none'; show.classList.add('bf-guide-visible'); }
    function bfShowGuide(e) { if (e) { e.preventDefault(); e.stopPropagation(); } window.__bfGuideHidden = false; wrap.style.display = ''; wrap.style.left = '8px'; wrap.style.top = 'auto'; wrap.style.bottom = '8px'; show.classList.remove('bf-guide-visible'); show.classList.remove('bf-guide-blink'); var titleEl = wrap.querySelector('.bf-guide-title'); var textEl = wrap.querySelector('.bf-guide-text'); if (titleEl && wrap.dataset.bfLastTitle) titleEl.innerHTML = wrap.dataset.bfLastTitle; if (textEl && wrap.dataset.bfLastText) textEl.innerHTML = wrap.dataset.bfLastText; }
    // Bind click AND touchend so the close button works on mobile, where the guide's drag touch handlers can swallow the synthetic click.
    var hideBtn = wrap.querySelector('.bf-guide-x');
    hideBtn.addEventListener('click', bfHideGuide); hideBtn.addEventListener('touchend', bfHideGuide, { passive: false });
    show.addEventListener('click', bfShowGuide); show.addEventListener('touchend', bfShowGuide, { passive: false });
    // Drag to reposition
    var dragState = null;
    var charDrag = wrap.querySelector('.bf-guide-char');
    function onDragMove(cx, cy) { if (!dragState) return; wrap.style.left = Math.max(0, Math.min(window.innerWidth - 120, cx - dragState.sx)) + 'px'; wrap.style.top = Math.max(0, Math.min(window.innerHeight - 60, cy - dragState.sy)) + 'px'; wrap.style.bottom = 'auto'; }
    charDrag.addEventListener('mousedown', function(e) { if (e.button) return; dragState = { sx: e.clientX - wrap.offsetLeft, sy: e.clientY - wrap.offsetTop }; wrap.style.transition = 'none'; e.preventDefault(); });
    charDrag.addEventListener('touchstart', function(e) { var t = e.touches[0]; dragState = { sx: t.clientX - wrap.offsetLeft, sy: t.clientY - wrap.offsetTop }; wrap.style.transition = 'none'; }, { passive: true });
    document.addEventListener('mousemove', function(e) { onDragMove(e.clientX, e.clientY); });
    document.addEventListener('touchmove', function(e) { onDragMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    document.addEventListener('mouseup', function() { dragState = null; wrap.style.transition = ''; });
    document.addEventListener('touchend', function() { dragState = null; wrap.style.transition = ''; }); bfHideGuide();
  }
  function updateGuide() {
    ensureGuide();
    var wrap = document.getElementById('bf-guide');
    if (!wrap) return;
    var active = document.querySelector('.screen.active');
    var id = active ? active.id : 's-title';
    var msg = guideMessageFor(id, active);
    if (!msg) return;
    // Always update on screen change; ignore __bfGuideHidden for message sync
    var key = id + '|' + msg.t;
    if (wrap.dataset.bfMsgId !== key) {
      wrap.dataset.bfMsgId = key;
      // Store so show-button re-open always has fresh content
      wrap.dataset.bfLastTitle = msg.t;
      wrap.dataset.bfLastText = msg.m;
      var titleEl = wrap.querySelector('.bf-guide-title');
      var textEl = wrap.querySelector('.bf-guide-text');
      if (titleEl) titleEl.innerHTML = msg.t;
      if (textEl) textEl.innerHTML = msg.m;
      if (window.__bfGuideHidden) { var showBtn = document.getElementById('bf-guide-show'); if (showBtn) showBtn.classList.add('bf-guide-blink'); } }
  }
  // ---- (A) Active hero's action panel: their own AI battle art as background,
  // plus a banner showing their name + ability right in the panel ----
  function bfActiveHero() {
    var card = document.querySelector('.bhero.active-turn');
    if (!card) return null;
    var id = heroIdFromCard(card), side = (String(card.id || '').split('_')[1]) || 'p';
    var hero = (typeof G !== 'undefined' && G.team && G.team[side] || []).find(function(h) { return h && h.id === id; });
    var artId = (hero && hero._token) ? hero._token : id;
    return hero ? { hero: hero, id: id, artId: artId, side: side, card: card } : { hero: null, id: id, artId: artId, side: side, card: card };
  }
  function bfEsc(v){if(v==null)return '';return String(v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[c];});}
  function injectActionPanelBg() {
    var b = document.getElementById('s-battle');
    if (!b || !b.classList.contains('active')) return;
    var p = b.querySelector('.active-hero-panel');
    if (!p) return;
    p.classList.add('bf-action-host');
    var bg = p.querySelector('.bf-action-bg');
    if (!bg) { bg = document.createElement('div'); bg.className = 'bf-action-bg'; p.insertBefore(bg, p.firstChild); }
    if (!p.querySelector('.bf-action-embers')) { var em = document.createElement('div'); em.className = 'bf-action-embers'; p.insertBefore(em, bg.nextSibling); }
    var a = bfActiveHero(), h = a && a.hero, el = a && a.card && (a.card.classList.contains('elite-mode') || a.card.classList.contains('bf-auto-elite'));
    var url = ACTION_BG;
    if (a && a.artId) url = (el ? (ELITE_BY_ID[a.artId] || ART_BY_ID[a.artId]) : ART_BY_ID[a.artId]) || ACTION_BG;
    if (p.dataset.bfActionArt !== url) { bg.style.setProperty('--bf-action-art', 'url("'+url+'")'); p.dataset.bfActionArt = url; }
    
    // Check and show status
    var st = (a && a.card) ? heroStatusOf(a.card) : '';
    if (st && typeof STATUS_INFO !== 'undefined') {
       var sinfo = STATUS_INFO[st];
       if (sinfo) {
          var sbg = p.querySelector('.bf-action-status');
          if (!sbg) { sbg = document.createElement('div'); sbg.className = 'bf-action-status'; p.insertBefore(sbg, bg.nextSibling); }
          var scolor = st === 'sleeping' ? '#8aaaff' : st === 'cursed' ? '#c79bff' : '#ffe14a';
          sbg.style.cssText = 'position:relative;z-index:2;margin-bottom:10px;text-align:center;padding:6px;border-radius:10px;background:rgba(8,5,14,0.85);border:1px solid '+scolor+';color:'+scolor+';font-family:"Cinzel",serif;font-weight:1000;letter-spacing:0.5px;box-shadow:0 0 12px '+scolor;
          sbg.innerHTML = '<span style="font-size:16px">' + sinfo.ico + '</span> ' + sinfo.label;
       }
    } else {
       var sbg = p.querySelector('.bf-action-status');
       if (sbg) sbg.remove();
    }
    
    var m = p.querySelector('.jrpg-menu'); if (m) { m.style.display = 'grid'; m.style.gridTemplateColumns = 'repeat(3,1fr)'; }
    // Inject the "Tanquear" action button: compact cell next to "Defender" so the
    // panel reads as 3 buttons (CC/AD/HE) · ability (full width) · 3 buttons (item/defend/tank).
    if (m && h) {
      var alreadyTank = !!h._bfTank, teamArr = (typeof G !== 'undefined' && G.team && G.team[a.side]) || [], otherTanking = teamArr.some(function(x) { return x && x.alive && x._bfTank && x !== h; });
      var tb = m.querySelector('.bf-tank-btn') || document.createElement('div');
      tb.className = 'jrpg-btn bf-tank-btn bf-jrpg-tank' + (alreadyTank ? ' bf-tank-on' : '');
      tb.style.cssText = 'position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:10px 8px;border-radius:14px;color:#fff5dc;cursor:pointer;text-shadow:0 2px 4px #000;text-align:center;line-height:1.15;transition:transform .15s ease,box-shadow .15s ease;' + (otherTanking && !alreadyTank ? 'opacity:.5;cursor:not-allowed;' : '');
      tb.innerHTML = '<div style="width:42px;height:42px;border-radius:50%;overflow:hidden;border:2px solid rgba(255,180,70,.85);box-shadow:0 0 12px rgba(255,140,30,.6);background:radial-gradient(circle at 40% 30%,#1a0a00,#0a0500);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin:0 auto"><img src="https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/b5ca5c078_generated_image.png" style="width:100%;height:100%;object-fit:cover;display:block;"></div><div style="font-family:&quot;Cinzel&quot;,serif;color:#ffb43a;font-size:13px;font-weight:1000;letter-spacing:.4px;text-transform:uppercase;text-shadow:0 2px 4px #000,0 0 12px rgba(255,150,40,.4)">' + (alreadyTank ? '🛡️ Dejar de tanquear' : (otherTanking ? 'Ya hay un tanque' : 'Tanquear')) + '</div>';
      tb.onclick = function(e) { e.stopPropagation(); if (otherTanking && !alreadyTank) { if (typeof notif === 'function') notif('Ya hay un héroe tanqueando. Solo uno puede hacerlo a la vez.'); return; } if (typeof window.bfTankear === 'function') window.bfTankear(); };
      if (!tb.parentNode) m.appendChild(tb);
    }
    p.querySelectorAll('.jrpg-btn').forEach(function(btn) {
      if (btn.classList.contains('bf-tank-btn')) return;
      if (btn.dataset.bfIco === '1') return;
      btn.dataset.bfIco = '1';
      btn.style.cssText = 'position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font-family:"Cinzel",serif;font-weight:1000;font-size:14px;padding:10px 8px;border-radius:14px;border:1px solid rgba(255,210,74,0.4);background:linear-gradient(180deg,rgba(20,10,35,0.85),rgba(10,5,15,0.95));color:#fff5dc;box-shadow:0 6px 16px rgba(0,0,0,0.5),inset 0 1px 1px rgba(255,255,255,0.1);text-shadow:0 2px 4px #000;transition:transform 0.15s ease,box-shadow 0.15s ease,border-color 0.15s ease;text-align:center;line-height:1.15;cursor:pointer;';
      btn.onmouseenter = function() { if(!btn.classList.contains('disabled')) { btn.style.transform='translateY(-3px) scale(1.02)';btn.style.borderColor='#ffd24a';btn.style.boxShadow='0 8px 24px rgba(255,210,74,0.3),inset 0 1px 1px rgba(255,255,255,0.2)'; }};
      btn.onmouseleave = function() { btn.style.transform='none';btn.style.borderColor='rgba(255,210,74,0.4)';btn.style.boxShadow='0 6px 16px rgba(0,0,0,0.5),inset 0 1px 1px rgba(255,255,255,0.1)'; };
      var ic = btn.querySelector('.jrpg-btn-icon'), iu = '';
      if (btn.classList.contains('cc')) iu = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/fefda0ace_generated_image.png';
      else if (btn.classList.contains('ad')) iu = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/210f89d43_generated_image.png';
      else if (btn.classList.contains('he')) iu = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/7c59e1ff7_generated_image.png';
      else if (btn.classList.contains('item')) iu = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/90ff926d5_generated_image.png';
      else if (btn.classList.contains('defend')) iu = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/1d9e5fb8f_generated_image.png';
      if (iu && ic) {
        ic.innerHTML = '<img src="'+iu+'" style="width:46px;height:46px;border-radius:50%;border:2px solid rgba(255,210,74,0.6);box-shadow:0 0 12px rgba(255,210,74,0.5);display:block;margin:0 auto;object-fit:cover;">';
        ic.style.cssText = 'background:none;border:none;box-shadow:none;width:auto;height:auto;margin:0 0 4px;';
      }
      if (btn.classList.contains('ability') && h) {
         var t = (el ? (h.eTxt || h.eAbilityTxt) : '') || h.abilityTxt || h.abText || h.abilityText || h.text || h.txt || h.desc || h.description || '', inIco = btn.querySelector('.jrpg-info');
         if (inIco) {
            inIco.style.cssText = 'display:flex;align-items:center;justify-content:center;margin-left:auto;width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,0.6);border:1.5px solid rgba(255,210,74,0.6);color:#ffe49a;font-size:17px;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,0.5);transition:all 0.12s ease;';
            inIco.innerHTML = 'ℹ️';
            inIco.onmouseenter = function() { inIco.style.background = 'rgba(255,210,74,0.3)'; inIco.style.transform = 'scale(1.1)'; };
            inIco.onmouseleave = function() { inIco.style.background = 'rgba(0,0,0,0.6)'; inIco.style.transform = 'none'; };
         }
         // Card look like the reference: dark panel, gold border, round AI emblem on the left, gold uppercase title + white description.
         btn.style.cssText += 'grid-column:1/-1;flex-direction:row;align-items:center;justify-content:flex-start;text-align:left;gap:12px;padding:12px 14px;border:2px solid rgba(255,210,74,0.72);border-radius:16px;background:linear-gradient(135deg,rgba(28,16,46,0.96),rgba(12,7,20,0.98));box-shadow:0 8px 22px rgba(0,0,0,0.6),inset 0 0 0 1px rgba(255,210,74,0.14),0 0 18px rgba(255,170,40,0.18);';
         var abIco = (window.__BF_ABILITY_ICON || {})[h.type] || (window.__BF_ABILITY_ICON || {}).HE || '';
         if (ic) ic.innerHTML = '<div style="width:50px;height:50px;border-radius:50%;overflow:hidden;border:2px solid rgba(255,224,121,.85);box-shadow:0 0 16px rgba(255,170,40,.6);background:radial-gradient(circle at 40% 30%,#1a0a00,#0a0500);display:flex;align-items:center;justify-content:center;">'+(abIco?'<img src="'+abIco+'" style="width:100%;height:100%;object-fit:cover;display:block;">':'<span style="color:#fff7d7;font-size:24px;font-weight:900">✦</span>')+'</div>';
         var lbl = btn.querySelector('.jrpg-btn-label');
         if (lbl) {
           var abName = lbl.textContent.replace(/:$/, '').trim();
           lbl.innerHTML = '<div style="font-family:&quot;Cinzel&quot;,serif;color:#ffd24a;font-size:15px;font-weight:900;letter-spacing:.6px;margin-bottom:4px;text-transform:uppercase;text-shadow:0 2px 4px #000,0 0 12px rgba(255,210,74,.4)">'+abName+'</div><div style="color:#f3ecff;text-transform:none;font-family:&quot;Rubik&quot;,sans-serif;font-weight:600;font-size:12.5px;letter-spacing:0;line-height:1.3;text-shadow:0 1px 3px #000;">'+(typeof bfEsc === 'function' ? bfEsc(t) : t)+'</div>';
           lbl.style.flex = '1';
         }
         var v = btn.querySelector('.jrpg-btn-val');
         if (v) v.style.display = 'none';
      } else {
         var lbl = btn.querySelector('.jrpg-btn-label');
         if (lbl) lbl.style.fontSize = '12px';
      }
    });
  }
  // ---- (B) Play a hand card (spell/object) with a confirm + cast animation ----
  function bfHandClean(v){return clean(v);}
  function bfActiveMana() {
    var active = document.querySelector('.bhero.active-turn');
    if (!active) return null;
    var mp = active.querySelector('.mp-num');
    var m = mp ? String(mp.textContent).match(/-?\\d+/) : null;
    return m ? parseInt(m[0], 10) : null;
  }
  function bfFindItemByName(name) {
    var key = (name || '').trim();
    var sp = (typeof SPELLS !== 'undefined' ? SPELLS : []).find(function(s) { return s && s.name === key; });
    if (sp) return { item: sp, kind: 'spell' };
    var ob = (typeof OBJECTS !== 'undefined' ? OBJECTS : []).find(function(o) { return o && o.name === key; });
    if (ob) return { item: ob, kind: 'object' };
    return null;
  }
  function bfPlayCastAnim(kind, el) {
    var color = kind === 'object' ? '#5fffa0' : elementColor(el || 'arcano');
    var flash = document.createElement('div');
    flash.className = 'bf-cast-flash';
    flash.style.color = color;
    document.body.appendChild(flash);
    var rune = document.createElement('div');
    rune.className = 'bf-cast-runes';
    rune.style.color = color;
    rune.textContent = kind === 'object' ? '🧪' : '✦';
    document.body.appendChild(rune);
    setTimeout(function() { if (flash.parentNode) flash.remove(); if (rune.parentNode) rune.remove(); }, 1000);
  }
  function bfCalcEffective(kind, item, heroCard, forInline) {
     if (!item || !heroCard) return '';
     var id = heroIdFromCard(heroCard);
     var side = (String(heroCard.id || '').split('_')[1]) || 'p';
     var h = (typeof G !== 'undefined' && G.team && G.team[side] || []).find(function(x) { return x && x.id === id; });
     if (!h) return '';
     var he = h.eliteMode ? h.eHe : h.he;
     if (kind === 'spell') {
        if (item.power) return forInline ? 'Daño: ' + (item.power * he) : 'Daño efectivo: <b style="color:#ff4b45">' + (item.power * he) + '</b> (Pot ' + item.power + ' × HE ' + he + ')';
        if (item.heal) return forInline ? 'Cura: ' + (item.heal * he) : 'Curación efectiva: <b style="color:#51ff8a">+' + (item.heal * he) + ' HP</b> (Cura ' + item.heal + ' × HE ' + he + ')';
     } else if (kind === 'object') {
        if (item.mana) return forInline ? '+' + item.mana + ' Maná' : 'Restaura <b style="color:#3aa0ff">' + item.mana + ' Maná</b>';
        if (item.heal) return forInline ? '+' + item.heal + ' HP' : 'Restaura <b style="color:#51ff8a">+' + item.heal + ' HP</b>';
     }
     return '';
  }
  function bfConfirmPlayCard(opts, onYes) {
    var existing = document.getElementById('bf-confirm-overlay'); if (existing) existing.remove();
    var overlay = document.createElement('div'); overlay.id = 'bf-confirm-overlay'; overlay.className = 'bf-confirm-overlay';
    var manaLine = '', canPlay = true;
    if (opts.kind === 'spell') {
      var cost = Number(opts.manaCost || 0), mana = opts.mana;
      if (mana !== null && mana !== undefined && cost > mana) canPlay = false;
      manaLine = '<div class="bf-confirm-msg">Coste de maná: <b>' + cost + '</b>' + (mana !== null && mana !== undefined ? ' · Maná del Héroe: <b>' + mana + '</b>' : '') + '</div>' + (canPlay ? '' : '<div class="bf-confirm-msg" style="color:#ff8a8a;margin-top:6px;font-weight:700">El héroe activo no tiene maná suficiente.</div>');
    }
    var effectiveHtml = opts.effective ? '<div class="bf-confirm-effect" style="background:rgba(20,10,30,0.8);border-color:#b06cff;text-align:center;font-size:14.5px;">' + opts.effective + '</div>' : '';
    overlay.innerHTML = '<div class="bf-confirm-box"><div class="bf-confirm-body"><div class="bf-confirm-name" style="margin-top:14px">' + bfHandClean(opts.name) + '</div>' + (opts.effect ? '<div class="bf-confirm-effect">' + bfHandClean(opts.effect) + '</div>' : '') + effectiveHtml + manaLine + '<div class="bf-confirm-msg">¿Jugar esta carta ahora? <b>Usará el turno del héroe activo.</b></div><div class="bf-confirm-actions"><button class="bf-confirm-btn bf-confirm-no" id="bf-confirm-no">Cancelar</button>' + (canPlay ? '<button class="bf-confirm-btn bf-confirm-yes" id="bf-confirm-yes">Jugar</button>' : '') + '</div></div></div>';
    document.body.appendChild(overlay);
    function close() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }
    overlay.querySelector('#bf-confirm-no').onclick = close;
    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    var yes = overlay.querySelector('#bf-confirm-yes'); if (yes) yes.onclick = function() { close(); onYes(); };
  }
  // Intercept clicks on hand cards: confirm + animate, then run the game's own
  // play action (which deducts mana, ends the turn, applies effects, etc.).
  function bfBindHandPlay() {
    document.querySelectorAll('.chip.bf-chip-card').forEach(function(chip) {
      if (chip.dataset.bfPlayBound === '1') return;
      var origOnclickAttr = chip.getAttribute('onclick');
      var origOnclickProp = chip.onclick;
      if (!origOnclickAttr && !origOnclickProp) return;
      chip.dataset.bfPlayBound = '1';
      chip.removeAttribute('onclick');
      chip.onclick = null;
      chip.addEventListener('click', function(e) {
        if (e.target.closest('.bf-chip-x') || e.target.closest('.bf-chip-play')) return;
        e.preventDefault();
        e.stopPropagation();
        var name = chip.title || (chip.querySelector('.bf-chip-name') && chip.querySelector('.bf-chip-name').textContent) || '';
        var found = bfFindItemByName(name);
        var item = found ? found.item : null;
        var kind = found ? found.kind : 'spell';
        var run = function() {
          bfPlayCastAnim(kind, item && (item.el || item.element));
          setTimeout(function() {
            if (origOnclickProp) origOnclickProp.call(chip, e);
            else if (origOnclickAttr) { try { new Function('event', origOnclickAttr).call(chip, e); } catch (err) {} }
          }, 240);
        };
        bfConfirmPlayCard({name: name, kind: kind, effect: item ? (item.txt || item.desc || '') : '', manaCost: item ? (bfManaFor(item) != null ? bfManaFor(item) : (item.manaCost || item.cost || 0)) : 0, mana: kind === 'spell' ? bfActiveMana() : null}, run);
      }, true);
    });
  }
  // Unify CC/AD/HE icons: swap loose role emojis for the same image emblems used on hero cards.
  var BF_ROLE_EMOJI = { '\u2694\ufe0f':'CC','\u2694':'CC','\ud83c\udff9':'AD','\ud83d\udd2e':'HE' };
  function bfRoleEmblemImg(t){var u=(window.__BF_ROLE_EMBLEM||{})[t];return u?'<img class="bf-role-emblem" src="'+u+'" alt="'+t+'" style="width:18px;height:18px;vertical-align:middle;display:inline-block">':'';}
  function unifyRoleIcons(){var scope=document.getElementById('s-equip');if(!scope)return;var ems=Object.keys(BF_ROLE_EMOJI),w=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT,null),hits=[],n;while((n=w.nextNode())){var t=n.nodeValue;if(t)for(var i=0;i<ems.length;i++)if(t.indexOf(ems[i])!==-1){hits.push(n);break;}}hits.forEach(function(tn){var p=tn.parentNode;if(!p)return;var h=tn.nodeValue;ems.forEach(function(e){if(h.indexOf(e)!==-1)h=h.split(e).join(bfRoleEmblemImg(BF_ROLE_EMOJI[e]));});var s=document.createElement('span');s.innerHTML=h;p.replaceChild(s,tn);});}
  function injectPhaseBadgeIcon() {
    document.querySelectorAll('.phase-badge').forEach(function(badge) {
      if (badge.dataset.bfIcon === '1') return;
      if (badge.querySelector('.bf-role-emblem')) { badge.dataset.bfIcon = '1'; return; }
      var t = '', btxt = (badge.textContent || '').toUpperCase();
      if (badge.classList.contains('bf-role-cc') || btxt.indexOf('CUERPO') !== -1) t = 'CC';
      else if (badge.classList.contains('bf-role-ad') || btxt.indexOf('DISTANCIA') !== -1) t = 'AD';
      else if (badge.classList.contains('bf-role-he') || btxt.indexOf('MAGIA') !== -1) t = 'HE';
      if (t && window.__BF_ROLE_EMBLEM) {
        var img = document.createElement('img');
        img.className = 'bf-role-emblem';
        img.src = window.__BF_ROLE_EMBLEM[t];
        badge.insertBefore(img, badge.firstChild);
        badge.dataset.bfIcon = '1';
      }
    }); (document.getElementById('s-recruit') || document.body).querySelectorAll('button, div, span').forEach(function(el) { if (el.dataset.bfIcon === '1' || el.children.length) return; var m = { 'CUERPO A CUERPO': 'CC', 'A DISTANCIA': 'AD', 'MAGIA': 'HE' }[el.textContent.trim()]; if (m && window.__BF_ROLE_EMBLEM) { var img2 = document.createElement('img'); img2.className = 'bf-role-emblem'; img2.src = window.__BF_ROLE_EMBLEM[m]; el.insertBefore(img2, el.firstChild); el.dataset.bfIcon = '1'; } });
  }
  function injectArtIntoDOM() {
    if (typeof NET !== 'undefined' && NET.role === 'client') document.documentElement.classList.add('bf-client-flip'); else document.documentElement.classList.remove('bf-client-flip');
    injectHeroArt();
    injectEquipArt();
    if (window.__bfInjectAutoEquipBtn) window.__bfInjectAutoEquipBtn();
    unifyRoleIcons();
    injectPhaseBadgeIcon();
    injectHandArt();
    injectBonusArt();
    injectBattleHeroArt();
    injectRecruitHeroArt();
    injectAuctionSummary();
    injectTitleIcons();
    injectActionPanelBg();
    bfAutoFitHeroCards(); bfAutoFitThumbs(); bfBindHandPlay();
    syncBattleFx();
    bfSyncGuideLook();
    bfWatchGuideEvents();
  }
  function startObserver() {
    var scheduled = false;
    var observer = new MutationObserver(function() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function() { scheduled = false; injectArtIntoDOM(); });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  // ---- Screen background on a dedicated full-screen layer ----
  function ensureCoverLayer() {
    var layer = document.getElementById('bf-cover-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'bf-cover-layer';
      layer.style.cssText =
        'position:fixed;inset:0;z-index:-1;pointer-events:none;' +
        'background-image:linear-gradient(180deg,rgba(18,14,28,0.45) 0%,rgba(14,10,22,0.72) 100%),url("' + COVER_BG + '");' +
        'background-size:cover,cover;background-position:center center,center center;' +
        'background-repeat:no-repeat,no-repeat;transition:opacity .35s ease;opacity:1;';
      document.body.appendChild(layer);
    }
    return layer;
  }
  function applyCover() {
    var layer = ensureCoverLayer();
    var active = document.querySelector('.screen.active');
    var id = active ? active.id : 's-title';
    var bg = COVER_BG;
    if (id === 's-equip') bg = SHOP_BG;
    else if (id === 's-battle') bg = BATTLE_BG;
    else if (id !== 's-title') bg = AUCTION_BG;
    var shade = id === 's-title'
      ? 'linear-gradient(180deg,rgba(18,14,28,0.45) 0%,rgba(14,10,22,0.72) 100%)'
      : 'linear-gradient(180deg,rgba(12,8,20,0.70) 0%,rgba(10,7,15,0.84) 100%)';
    layer.style.backgroundImage = shade + ',url("' + bg + '")';
    layer.style.opacity = '1';
    // The game body has an opaque gradient background that would cover our fixed layer.
    document.body.style.background = 'transparent';
    updateGuide();
  }
  // ---- "Salir" button → force a clean reload back to the title screen ----
  function patchQuitToHome() {
    var btn = document.getElementById('homeBtn');
    if (!btn || btn.dataset.bfQuit === '1') return;
    btn.dataset.bfQuit = '1';
    btn.removeAttribute('onclick'); btn.onclick = null;
    btn.addEventListener('click', function(e) {
      e.preventDefault(); e.stopPropagation();
      var ex = document.getElementById('bf-confirm-overlay'); if (ex) ex.remove();
      var ov = document.createElement('div'); ov.id = 'bf-confirm-overlay'; ov.className = 'bf-confirm-overlay';
      ov.innerHTML = '<div class="bf-confirm-box"><div class="bf-confirm-body"><div style="font-size:42px;margin-top:14px;filter:drop-shadow(0 3px 8px rgba(0,0,0,.6))">🚪</div><div class="bf-confirm-name" style="margin-top:6px">¿Salir de la partida?</div><div class="bf-confirm-msg">Volverás a la <b>pantalla inicial</b> y se perderá el progreso de esta partida.</div><div class="bf-confirm-actions"><button class="bf-confirm-btn bf-confirm-no" id="bf-quit-no">Cancelar</button><button class="bf-confirm-btn bf-confirm-yes" id="bf-quit-yes">Salir</button></div></div></div>';
      document.body.appendChild(ov);
      function bfQuitClose() { if (ov.parentNode) ov.parentNode.removeChild(ov); }
      ov.querySelector('#bf-quit-no').onclick = bfQuitClose;
      ov.addEventListener('click', function(ev) { if (ev.target === ov) bfQuitClose(); });
      ov.querySelector('#bf-quit-yes').onclick = function() { bfQuitClose(); if (typeof window.doQuitHome === 'function') window.doQuitHome(); else window.parent.location.href = window.parent.location.pathname + '?bf=' + Date.now(); };
    });
  }
  // BD (Oráculo) = fuente de verdad del EQUIPAMIENTO: sobreescribe stats, texto,
  // coste y maná de hechizos/armas/armaduras/objetos en los arrays del juego
  // (MELEE/RANGED/ARMORS/SPELLS/OBJECTS) emparejando por número de carta. Así
  // cualquier edición en el admin se propaga a la partida (local y online).
  // No toca id/kind/element (lógica del juego) salvo element si ya existía.
  function syncDbEquipment() {
    if (window.__bfEquipSynced) return;
    if (typeof MELEE === 'undefined' || typeof SPELLS === 'undefined' || typeof OBJECTS === 'undefined' || typeof ARMORS === 'undefined' || typeof RANGED === 'undefined') return;
    if (!DB_EQUIP || !DB_EQUIP_NUMS) { window.__bfEquipSynced = true; return; }
    window.__bfEquipSynced = true;
    var CAT = { melee_weapon:'MELEE', ranged_weapon:'RANGED', armor:'ARMORS', spell:'SPELLS', object:'OBJECTS' };
    DB_EQUIP.forEach(function(db){
      var arrName = CAT[db.cat]; if (!arrName) return;
      var nums = DB_EQUIP_NUMS[db.cat]; if (!nums) return;
      var idx = nums.indexOf(db.num); if (idx < 0) return;
      var list = window[arrName]; if (!list || !list[idx]) return;
      var it = list[idx];
      if (db.name) it.name = db.name;
      if (db.cost != null) it.cost = Number(db.cost);
      if (db.txt) { it.txt = db.txt; it.desc = db.txt; }
      if (db.cc != null && it.cc != null) it.cc = Number(db.cc);
      if (db.power != null && it.power != null) it.power = Number(db.power);
      if (db.hp != null && it.hp != null) it.hp = Number(db.hp);
      if (db.mana != null && it.mana != null) it.mana = Number(db.mana);
      if (db.heal != null && it.heal != null) it.heal = Number(db.heal);
      if (db.element && it.element) it.element = db.element;
    });
  }
  function init() {
    injectCoverStyle();
    applyCover();
    patchQuitToHome();
    // Startup loop: patch the game's functions once defined, then stop.
    var attempts = 0;
    var patchedFace = false;
    var interval = setInterval(function() {
      attempts++;
      applyCover();
      patchQuitToHome();
      syncDbEquipment();
      patchGameRules();
      if (window.__bfPatchTankRules) window.__bfPatchTankRules();
      patchRaceModal();
      patchEquipmentUI();
      patchCombatFx(); patchTransformer(); patchDuckAbility(); patchAbilityVisuals();
      if (!patchedFace) patchedFace = patchCardFace();
      injectArtIntoDOM();
      if ((patchedFace && attempts > 8) || attempts > 60) clearInterval(interval);
    }, 150);
    startObserver();
    // Re-sync the cover background on screen transitions, throttled.
    var lastScreenId = '';
    setInterval(function() {
      var active = document.querySelector('.screen.active');
      var id = active ? active.id : '';
      if (id !== lastScreenId) { lastScreenId = id; applyCover(); } bfEndCinematic(); injectArtIntoDOM();
    }, 400);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>
`;
}
// In-memory cache of the fully assembled HTML, keyed by patch version. The
// upstream file only changes when we bump GAME_PATCH_VERSION, so we fetch +
// assemble once per deploy and serve every later request straight from memory.
async function buildGameHtml(req) {
  // CACHE removed so cards reload on refresh
  const SRC = 'https://media.base44.com/files/public/6a39c9aee54efe3a86d6d69a/2b855b7c8_bizarre_fantasies_v5-4.html';
  const upstream = await fetch(SRC + '?bfv=' + GAME_PATCH_VERSION, { cache: 'no-store' });
  let html = await upstream.text();
  const RB = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/';
  var BTN_LEARN = RB+'843af3814_generated_image.png', BTN_RULES = RB+'0848f4ffb_generated_image.png', BTN_RACES = RB+'5e41f1add_generated_image.png';
  html = html.replace('const AD_REF=18,HE_REF=18,EQUIP_BASE=45,START_COINS=100;', 'const AD_REF=18,HE_REF=18,EQUIP_BASE=100,START_COINS=100;');
  // Batalla reordenada: campo de batalla (héroes + mano) arriba, después el
  // panel de acciones del héroe activo, luego el orden de turno y al final el registro.
  html = html.replace(
    "${ctbBar()}${actionArea}\n    <div class=\"b-grid\">${army('p')}<div class=\"vs-mid\"><span class=\"vs-txt\">VS</span></div>${army('o')}</div>",
    "<div class=\"b-grid\">${army('p')}<div class=\"vs-mid\"><span class=\"vs-txt\">VS</span></div>${army('o')}</div>\n    ${actionArea}${ctbBar()}"
  );
  html = html.replace("function roleIcon(t){return t==='CC'?'\ud83d\udde1\ufe0f':t==='AD'?'\ud83c\udff9':'\ud83d\udd2e';}", "function roleIcon(t){var E={CC:'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ab147bafb_generated_image.png',AD:'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/fd388871c_generated_image.png',HE:'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/cfd5e317c_generated_image.png'};return '<img class=\"bf-role-emblem\" src=\"'+(E[t]||E.HE)+'\">';}").replace("try{ lobbyTeardown(); }catch(e){} location.reload(); }", "try{ lobbyTeardown(); }catch(e){} try{ window.top.location.href = window.top.location.pathname + '?bf=' + Date.now(); }catch(e){ location.reload(); } }").replace('onclick="startDemo()">\ud83c\udf93 Aprender a jugar</button>', 'onclick="startDemo()"><span class="tc-img"><img src="' + BTN_LEARN + '" alt=""></span><span>Aprende<br>a jugar</span></button>').replace('onclick="rulesModalStatic()">\ud83d\udcd6 C\u00f3mo se juega</button>', 'onclick="rulesModalStatic()"><span class="tc-img"><img src="' + BTN_RULES + '" alt=""></span><span>Cómo<br>se juega</span></button>').replace('onclick="racesModal()">\ud83e\uddec Razas</button>', 'onclick="racesModal()"><span class="tc-img"><img src="' + BTN_RACES + '" alt=""></span><span>Razas</span></button>').replace('<div class="coach-txt">${G._coachMsg?esc(G._coachMsg):\'\'}</div>', '<div class="coach-txt">${G._coachMsg||\'\'}</div>');
  // Re-define bonuses array, styles, logic and resolution
  html = html.replace('const BONUS=[{"id": "ban"', 'const BONUS=[{"id": "mina", "name": "Mina de Oro", "type": "PERM", "effect": 15, "txt": "+15 monedas a tu bolsa (permanente)."}, {"id": "roba", "name": "Ladrón de Guante", "type": "PERM", "effect": 15, "txt": "El rival pierde 15 monedas (permanente)."}, {"id": "ban"').replace(/"type": "BON"/g, '"type": "BID_ADD"').replace(/"type": "RES"/g, '"type": "BID_SUB"').replace(/HEROES\.filter\(h=>h\.type===['"](CC|AD|HE)['"]\)/g, "HEROES.filter(h=>h.type==='$1'&&h.clan!=='Bizarros'&&!String(h.id||'').startsWith('tk_'))");
  html = html.replace(/monedas para esta subasta/g, 'al valor de tu puja').replace(/monedas esta subasta/g, 'al valor de tu puja').replace(/monedas esta ronda/g, 'a su puja').replace('Esto es solo un ejemplo: pulsa abajo para continuar.', 'Si te quedas corto puedes transferir monedas de equipamiento a la subasta de 10 en 10. Al acabar toda la subasta, las monedas de subasta que te sobren se suman a tu presupuesto de equipamiento, junto con los bonificadores de equipamiento que te hayan salido. Esto es solo un ejemplo: pulsa abajo para continuar.').replace('PASO 2 · EQUIPAMIENTO. A cada héroe', 'PASO 2 · EQUIPAMIENTO. Tu presupuesto son 100 monedas base más lo no gastado en la subasta. A cada héroe');
  html = html.replace('function bonusChipClass(t){return t===\'BON\'?\'chip-bon\':t===\'EQP\'?\'chip-eqp\':\'chip-res\';}', 'function bonusChipClass(t){return (t===\'BID_ADD\'||t===\'PERM\')?\'chip-bon\':t===\'EQP\'?\'chip-eqp\':\'chip-res\';}');
  html = html.replace('function applyBonus(side,b){\n  if(G.pendDebt[side]){ G.coins[side]=Math.max(0,G.coins[side]-G.pendDebt[side]); G.pendDebt[side]=0; }\n  if(b.type===\'BON\'){ G.coins[side]+=b.effect; if(b.id===\'pre\')G.pendDebt[side]=8; }\n  else if(b.type===\'EQP\'){ G.equipReserve[side]+=b.effect; }\n  else if(b.type===\'RES\'){ G.coins[other(side)]=Math.max(0,G.coins[other(side)]-b.effect); }\n}', 'function applyBonus(side,b){if(G.pendDebt[side]){G.coins[side]=Math.max(0,G.coins[side]-G.pendDebt[side]);G.pendDebt[side]=0;}if(!b)return;if(b.type==="PERM"){if(b.id==="mina")G.coins[side]+=b.effect;else G.coins[other(side)]=Math.max(0,G.coins[other(side)]-b.effect);}else if(b.type==="BID_ADD"){if(b.id==="pre")G.pendDebt[side]=8;}else if(b.type==="EQP"){G.equipReserve[side]+=b.effect;}}');
  const resolveRoundOriginal = 'function resolveBidRound(){\n  const bp=G.bids.p, bo=G.bids.o; const pBid=bp&&!bp.pass, oBid=bo&&!bo.pass;\n  let contested=false, winner=null, contestId=null;\n  if(pBid && oBid && bp.heroId===bo.heroId){\n    contested=true; contestId=bp.heroId; winner=(bp.amount>=bo.amount)?\'p\':\'o\';\n    award(winner,contestId, winner===\'p\'?bp.amount:bo.amount); G.phaseNeeds[winner]=false; G.phaseNeeds[other(winner)]=true;\n  } else {\n    if(pBid){ award(\'p\',bp.heroId,bp.amount); G.phaseNeeds.p=false; }\n    if(oBid){ award(\'o\',bo.heroId,bo.amount); G.phaseNeeds.o=false; }\n  }\n  G.phaseResult={ phase:G.aIndex, sub:G.subRound, contested, winner,\n    contestName: contested?((byId(G.cands,contestId)||{}).name)||\'—\':\'\',\n    pPass:!pBid, oPass:!oBid,\n    bpName: pBid?(((byId(G.cands,bp.heroId)||{}).name)||\'—\':\'\'), boName: oBid?(((byId(G.cands,bo.heroId)||{}).name)||\'—\'):\'\',\n    bpAmt: pBid?bp.amount:0, boAmt: oBid?bo.amount:0,\n    gotP: G.phaseNeeds.p?null:nameOf(phaseHeroOf(\'p\')), gotO: G.phaseNeeds.o?null:nameOf(phaseHeroOf(\'o\')),\n    needMore: (G.phaseNeeds.p||G.phaseNeeds.o) };\n  show(\'s-recruit\'); renderRecruit(\'p\'); netSync(\'s-recruit\');\n}';
  // The bid the player sets IS the final cost (it already includes the round bonus). The winner is
  // decided by that bid directly and that exact amount is paid — the bonus is NOT re-applied here.
  const resolveRoundPatched = 'function resolveBidRound(){const bp=G.bids.p,bo=G.bids.o;const pBid=bp&&!bp.pass,oBid=bo&&!bo.pass;let contested=false,winner=null,contestId=null;if(pBid&&oBid&&bp.heroId===bo.heroId){contested=true;contestId=bp.heroId;winner=(bp.amount>=bo.amount)?"p":"o";award(winner,contestId,winner==="p"?bp.amount:bo.amount);G.phaseNeeds[winner]=false;G.phaseNeeds[other(winner)]=true;}else{if(pBid){award("p",bp.heroId,bp.amount);G.phaseNeeds.p=false;}if(oBid){award("o",bo.heroId,bo.amount);G.phaseNeeds.o=false;}}if(!pBid)G.phaseNeeds.p=false;if(!oBid)G.phaseNeeds.o=false;var fh=function(i){var c=[];if(G.epicCands){if(G.epicCands.p)c=c.concat(G.epicCands.p);if(G.epicCands.o)c=c.concat(G.epicCands.o);}if(G.cands)c=c.concat(G.cands);if(typeof HEROES!=="undefined")c=c.concat(HEROES);for(var k=0;k<c.length;k++){if(c[k]&&c[k].id===i)return c[k];}return {};};G.phaseResult={phase:G.aIndex,sub:G.subRound,contested,winner,contestName:contested?(fh(contestId).name||"—"):"",pPass:!pBid,oPass:!oBid,bpName:pBid?(fh(bp.heroId).name||"—"):"",boName:oBid?(fh(bo.heroId).name||"—"):"",bpAmt:pBid?bp.amount:0,boAmt:oBid?bo.amount:0,gotP:G.phaseNeeds.p?null:nameOf(phaseHeroOf("p")),gotO:G.phaseNeeds.o?null:nameOf(phaseHeroOf("o")),needMore:(G.phaseNeeds.p||G.phaseNeeds.o)};show("s-recruit");renderRecruit("p");netSync("s-recruit");}';
  html = html.replace(resolveRoundOriginal, resolveRoundPatched); html = html.replace('{"id": "zar", "name": "Zarmandis", "title": "Sombra del Claro", "clan": "Elfos", "clanColor": "#33aa66", "type": "AD", "cost": 16, "cc": 6, "ad": 17, "he": 5, "hp": 22, "eCc": 8, "eAd": 23, "eHe": 7, "eHp": 32, "ability": "Disparo Silencioso", "abilityTxt": "Dispara de inmediato, no puede ser bloqueado.", "eAbility": "Fantasma del Claro", "eTxt": "Dispara dos veces en silencio.", "akind": "double-ad", "weapon": "Daga Élfica"}', '{"id": "zar", "name": "Zarmanda", "title": "Sombra del Claro", "clan": "Elfos", "clanColor": "#33aa66", "type": "AD", "cost": 16, "cc": 6, "ad": 17, "he": 5, "hp": 22, "eCc": 8, "eAd": 23, "eHe": 7, "eHp": 32, "ability": "Disparo Silencioso", "abilityTxt": "Dispara de inmediato, no puede ser bloqueado.", "eAbility": "Modo Guerrera Definitiva", "eTxt": "Su pelo se eriza y brilla con un aura dorada: dispara dos veces con una fuerza descomunal digna de leyenda (aunque solo le dura el combate).", "akind": "double-ad", "weapon": "Daga Élfica"}');
  // Payment adjustment: the bid decides the winner, but bonuses DON'T count toward coins.
  // When a side wins, the coins actually deducted = bid − own adder + rival's subtractor.
  // (Own adder makes the hero cheaper to pay; rival's subtractor makes it costlier.)
  const awardOriginal = 'function award(side,heroId,amount){\n  const tmpl=byId(G.cands,heroId)||byId(HEROES,heroId);\n  G.coins[side]=Math.max(0,G.coins[side]-amount);\n  const inst=makeInstance(tmpl); inst.boughtFor=amount; G.team[side].push(inst);';
  const awardPatched = 'function award(side,heroId,amount){\n  const tmpl=byId(G.cands,heroId)||byId(HEROES,heroId);\n  var _mb=G.bonus&&G.bonus[side],_rb=G.bonus&&G.bonus[other(side)];\n  var _add=(_mb&&_mb.type==="BID_ADD")?Number(_mb.effect||0):0;\n  var _sub=(_rb&&_rb.type==="BID_SUB")?Number(_rb.effect||0):0;\n  var _paid=Math.max(0,Number(amount||0)-_add+_sub);\n  G.coins[side]=G.coins[side]-_paid;\n  const inst=makeInstance(tmpl); inst.boughtFor=_paid; G.team[side].push(inst);';
  html = html.replace(awardOriginal, awardPatched).replace('aIndex:G.aIndex, cands:G.cands, phaseResult', 'aIndex:G.aIndex, cands:G.cands, epicCands:G.epicCands, bfEquipXfer:G.bfEquipXfer, phaseResult').replace('G.cands=g.cands; G.bidsIn=g.bidsIn;', 'G.cands=g.cands; G.epicCands=g.epicCands; G.bfEquipXfer=g.bfEquipXfer||G.bfEquipXfer; G.bidsIn=g.bidsIn;');
  const recruitOriginal = '<div class="hcard-bid-zone"><input class="bid-mini-input" id="bid_${h.id}" type="number" min="0" max="${G.coins[side]}" value="${Math.min(h.cost,G.coins[side])}"><button class="btn-bid-card" onclick="submitBid(\'${side}\',\'${h.id}\')">Pujar</button></div>';
  const recruitPatched = '<div class="hcard-bid-zone" style="flex-direction:column;align-items:stretch"><div style="display:flex;gap:6px"><input style="flex:1" class="bid-mini-input" id="bid_${h.id}" type="number" min="${h.cost}" max="${G.coins[side]}" value="${Math.min(h.cost,G.coins[side])}" oninput="if(window.bfUpdateBidPreview)bfUpdateBidPreview(\'${h.id}\')"><button class="btn-bid-card" onclick="submitBid(\'${side}\',\'${h.id}\')">Pujar</button></div><div id="bidcalc_${h.id}" style="font-size:10.5px;text-align:center;line-height:1.25;margin-top:5px;font-weight:900;text-shadow:0 1px 3px #000;background:rgba(8,5,14,.6);border:1px solid rgba(255,210,74,.25);border-radius:8px;padding:4px 6px;"></div></div>';
  html = html.replace("const eqPool=BONUS.filter(b=>b.type==='EQP');\n  for(const s of ['p','o']){ const eb=pick(eqPool); G.equipReserve[s]+=eb.effect; G.bonus[s]=eb; G.equipCoins[s]=G.coins[s]+EQUIP_BASE+G.equipReserve[s]; }", "for(const s of ['p','o']){ G.equipCoins[s]=G.coins[s]+EQUIP_BASE+G.equipReserve[s]; }");
  html = html.replace(recruitOriginal, recruitPatched).replace("G.equipCoins[s]=G.coins[s]+EQUIP_BASE+G.equipReserve[s]; }", "G.equipCoins[s]=Math.max(0,G.coins[s]+EQUIP_BASE+G.equipReserve[s]-2*((G.bfEquipXfer&&G.bfEquipXfer[s])||0)); }").replace("G.equipReserve={p:0,o:0}; G.equipCoins={p:0,o:0};", "G.equipReserve={p:0,o:0}; G.equipCoins={p:0,o:0}; G.bfEquipXfer={p:0,o:0};").replace("equipReserve:{p:0,o:0}, equipCoins:{p:0,o:0},", "equipReserve:{p:0,o:0}, equipCoins:{p:0,o:0}, bfEquipXfer:{p:0,o:0},").replace('<div class="hand-lbl">Héroes</div>${acq}</div>', '<div class="coins-row" style="opacity:.85;margin-bottom:4px;width:100%"><div class="coins-num">${Math.max(0,G.coins[side]+EQUIP_BASE+G.equipReserve[side]-2*((G.bfEquipXfer&&G.bfEquipXfer[side])||0))}</div><div class="coins-lbl">monedas<br>equipamiento</div></div>${window.bfEqXferBtn(side)}<div class="hand-lbl">Héroes</div>${acq}</div>');
  // Separate Spells and Objects in battle hand and add ID to hand section so bfAddChipButtons can attach zoom, mana and cast buttons
  const hcRe = new RegExp('function handChips\\\\(side\\\\)\\\\{[\\\\s\\\\S]*?<\\\\/div>\\\\`;\\\\n\\\\}');
  html = html.replace(hcRe, 'function handChips(side){const sp=(G.spellbook[side]||[]).map(id=>{const s=byId(SPELLS,id);return "<span class=\\"chip chip-spell\\" title=\\""+esc(s.txt)+"\\">"+esc(s.name)+"</span>";}).join("")||"<span style=\\"color:#666;font-size:11px\\">—</span>";const it=(G.items[side]||[]).map(o=>"<span class=\\"chip chip-object\\" title=\\""+esc(o.txt)+"\\">"+esc(o.name)+"</span>").join("")||"<span style=\\"color:#666;font-size:11px\\">—</span>";return "<div class=\\"hand-lbl\\">Mano · Hechizos</div><div class=\\"hand-chips\\" style=\\"margin-bottom:8px\\">"+sp+"</div><div class=\\"hand-lbl\\">Mano · Objetos</div><div class=\\"hand-chips\\">"+it+"</div>";}');
  html = html.replace('<div class="hand-section"><div class="hand-lbl">Mano</div>${handChips(side)}</div>', '<div class="hand-section" id="hand_${side}">${handChips(side)}</div>');
  html = html.replace('"txt": "Revive a TODOS tus h\u00e9roes ca\u00eddos. La carta cumbre."', '"txt": "Resucita a DOS h\u00e9roes ca\u00eddos y les restaura toda la vida. La carta cumbre."').replace("case 'reviveAll':{let any=false;G.team[allies].forEach(t=>{if(!t.alive){reviveHero(t,0.5);pushFx({k:'elite',side:tSide(t),id:t.id});any=true;}});pushLog('lx',`${o.name}: ${any?'\u00a1todos reviven!':'no hab\u00eda ca\u00eddos.'}`);consume();finishAct();return;}", "case 'reviveAll':{const _d=(G.team[allies]||[]).filter(t=>!t.alive).slice(0,2);if(!_d.length){pushLog('lx',`${o.name}: no hay ca\u00eddos.`);consume();finishAct();return;}_d.forEach(t=>{reviveHero(t,1);t.hp=t.maxHp;pushFx({k:'elite',side:tSide(t),id:t.id});});pushLog('lx',`${o.name}: ${_d.map(t=>t.name).join(' y ')} ${_d.length>1?'reviven':'revive'} con vida completa.`);consume();finishAct();return;}").replace("case 'reviveAll':{let any=false;G.team[allies].forEach(t=>{if(!t.alive){reviveHero(t,0.5);any=true;}});pushLog('lx',`${o.name}: ${any?'todos reviven':'sin ca\u00eddos'}.`);break;}", "case 'reviveAll':{const _d=(G.team[allies]||[]).filter(t=>!t.alive).slice(0,2);if(_d.length){_d.forEach(t=>{reviveHero(t,1);t.hp=t.maxHp;pushFx({k:'elite',side:tSide(t),id:t.id});});pushLog('lx',`${o.name}: ${_d.map(t=>t.name).join(' y ')} ${_d.length>1?'reviven':'revive'} con vida completa.`);}else{pushLog('lx',`${o.name}: sin ca\u00eddos.`);}break;}");
  
  html = html.replace(/Quita sueño\/parálisis\/maldición a un aliado\./g, 'Elimina cualquier estado negativo del héroe.');
  html = html.replace("case 'cleanse': pendTarget('Aliado a liberar',allies,(t)=>{t.sleep=0;t.para=0;t.skip=0;t._mods=t._mods.filter(m=>!(m.cc<0||m.ad<0||m.he<0));pushLog('lh',`${o.name}: ${t.name} liberado.`);consume();finishAct();});return;", "case 'cleanse': pendTarget('Héroe a restablecer',allies,(t)=>{t.sleep=0;t.para=0;t.skip=0;t.silence=0;t.mark=null;t._bfConfused=0;t._bfDrunk=0;t._mods=(t._mods||[]).filter(m=>!((m.cc||0)<0||(m.ad||0)<0||(m.he||0)<0||(m.vel||0)<0));pushLog('lh',`${o.name}: ${t.name} vuelve a su estado normal.`);consume();finishAct();});return;");
  html = html.replace("case 'cleanse':{const t=living(allies).find(a=>a.sleep||a.para||a.skip)||living(allies)[0];t.sleep=0;t.para=0;t.skip=0;pushLog('lh',`${o.name}: ${t.name} liberado.`);break;}", "case 'cleanse':{const t=living(allies).find(a=>a.sleep||a.para||a.skip||a.silence||a.mark||a._bfConfused||a._bfDrunk||(a._mods||[]).some(m=>(m.cc||0)<0||(m.ad||0)<0||(m.he||0)<0||(m.vel||0)<0))||living(allies)[0];t.sleep=0;t.para=0;t.skip=0;t.silence=0;t.mark=null;t._bfConfused=0;t._bfDrunk=0;t._mods=(t._mods||[]).filter(m=>!((m.cc||0)<0||(m.ad||0)<0||(m.he||0)<0||(m.vel||0)<0));pushLog('lh',`${o.name}: ${t.name} vuelve a su estado normal.`);break;}");
  const base44 = createClientFromRequest(req);
  const dbCards = await base44.asServiceRole.entities.Card.list('number', 1000);
  const artScript = buildArtScript(dbCards || []);
 html = html.includes('</body>') ? html.replace('</body>', artScript + '</body>') : html + artScript;
  // caching disabled: always regenerate fresh HTML
  return html;
}
Deno.serve(async (req) => {
  try {
    const html = await buildGameHtml(req);
    return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-BF-Patch-Version': GAME_PATCH_VERSION, 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0', 'Pragma': 'no-cache', 'Expires': '0' } });
  } catch (error) {
    return new Response('<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;color:#fff;background:#0e0a16;padding:24px">Error: ' + (error?.message || error) + '</body>', { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
});