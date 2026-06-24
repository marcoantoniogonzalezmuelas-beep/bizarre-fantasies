const COVER_BG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/db79541e2_generated_image.png';
const AUCTION_BG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/f9a34e5e7_generated_image.png';
const SHOP_BG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/8a8abf227_generated_image.png';
const BATTLE_BG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/67703a458_generated_image.png';
const GAME_PATCH_VERSION = 'bf-2026-06-30-punk-v45';

const HERO_ART = [
  '0a701a388','0ae86f5cf','3144fa0cc','b3befffca','b27af2a2e','49da10371','4b39462db','70e5ca186','2321b345c','7b6b1032e',
  '3bbcf59c0','dc308d368','a53c0e073','362ea0a4b','861dbe1ad','72ce7dd1a','3ec5dbfd9','e5d35394d','49c4de216','a96095ce8',
  'dd9ae011d','d9d830676','54365cb73','b34bdb48f','a237d8ffc','99d2f7a81','dcee2560b','ed76b96e2','a1aed5117','998c3949c',
  '3c97a29dd','5a9d97619','1bd2bdf6d','40de7f507','a6a9e3561','a291e62f4','3e72cf42e','95e8228cd','b5be72327','c71c525b8',
  '0ad0be833','3aedc4e62','0b3987343','2cfe0922c','9c56aea64',
].map(function(id){return 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/' + id + '_generated_image.png';});

const HERO_ELITE_ART = [
  'b2219417f','a2abfb434','4952ab881','01e96302a','e908b3273','650b7ff27','4d934fdf4','f7954d1fc','8bc966bfa','452bb4fb7',
  '653c2036d','141eb7445','ddf40d7ab','12f840fe3','4cf89ac43','8019f9f21','8979eecb4','87c291158','e7ace3347','8d6e97ce2',
  '33eb953a8','ffd892ff4','5a79e3638','b08f41b13','fb9937c69','04b64ecc7','d9ef92043','40e91e893','437bbb48b','35add4eeb',
  '0827725df','2c7c03c8f','d0512bd56','ae296c827','8cde88cb7','ea100edfb','7764cb9ea','84c9693dc','907ef8e72','b96972130',
  '8959bebcc','e7ce90f66','4328395b6','06c814afa','12a5ddb5c',
].map(function(id){return 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/' + id + '_generated_image.png';});

const IMG_BASE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/';
const toArt = function(id){ return IMG_BASE + id + '_generated_image.png'; };

const MELEE_ART = ['2ef6e8fd8','90d5f4f20','ca0217dac','79830b431','b5b6160a3','a8ea859a5'].map(toArt);

const RANGED_ART = ['2146a215b','ab826c633','88e45b0a1','93554b1ee','c8cf4c6d1','06ce99379','08cb8f198','809f7051c'].map(toArt);

const ARMOR_ART = ['b989796b2','37519e06c','4a38b42e1','6889c5c36','fefd71323','2de5cea6a','244338b2e','adc154eaf','46890f673','ed198ba53'].map(toArt);

const SPELL_ART = ['16656e37c','3ecdf6d2c','f07673381','c9386b2a6','77fcb19fb','75254b62e','fbc82143b','0cc792c57','05dd1e130','938f0dfba','299116e86','3e1c0a659','e73cbd75b'].map(toArt);

const OBJECT_ART = ['58d239c00','1688e1433','9b9d6986f','dd35e9e6b','026d2d45d','d138d9427','6eec753dd','4581afaa7','b990b1173'].map(toArt);

// Last two match the DB: Bandolero Seco, Glitch.
const BONUS_ART = ['88ffc8b21','a644bca96','a5d3ecf52','a58e01097','664754ee3','6c0160e33','fbe03869b','5369480ce','e5c4370fc','26219e884','1acefc0e0','77bc42e4f'].map(toArt);

// Bonus / restador ids and display names, index-for-index with BONUS_ART.
const BONUS_IDS = ["ban","cor","mer","nau","pre","for","arm","pir","cor2","hac","ban2","gli"];
const BONUS_NAMES = ["Gran Banquero","Corredor de Bolsa","Mercader Zeta","Nauta Financiero","La Prestamista","Patrón de Forja","Armero Real","El Pirata","La Corsaria","Hacker Nexus","Bandolero Seco","Glitch"];

// Hero id order, matching the HERO_ART / HERO_ELITE_ART arrays index-for-index.
const HERO_IDS = ["kru","bos","nar","hil","tor","vor","bra","gna","vra","mor","buc","com","kre","hev","pij","pat","syl","ael","zar","ere","alf","dix","ska","syx","gor","fut","gam","ret","mal","ser","bat","nix","vex","chi","sol","man","pac","hex","rev","doc","zer","xer","aje","rol","pol"];

// Hero id -> display name (so we can match cards already rendered in the DOM by name).
const HERO_NAMES = ["Krunder","Boss","Narbon","Hildra","Torax","Vorn","Bramblok","Gnarr","Vragnar","Morthex","Buck Ironclad","La Comadreja","Krunder Mec.","El Heavy","El Pijo","Patrón","Sylvara","Aelion","Zarmandis","Eredon","Alfredinho","Dixie Plasma","Skarla","Sylvex","Gorvak","El Futbolista","El Gamer","Retropoeta","Malachar","Serafis","Batu","Nixara","Vexal","Chivo","Solenne","Mantenimiento","Pacopiton","Hexara","Reverendo Hex","Doc Radiante","Zarmandis","Xerath","El Ajedrecista","El Rolero","El Político"];

// Equipment ids by category, index-for-index with their art arrays. Also their
// card numbers (cardNo) so we can match the "Nº X" shown on shop cards.
const EQUIP = {
  melee:  { ids:["mw_sword","mw_mace","mw_axe","mw_dagger","mw_plasma","mw_thunder"], nums:[59,60,61,62,63,64] },
  ranged: { ids:["rw_sling","rw_cross","rw_pistol","rw_smg","rw_cannon","rw_plasma","rw_elfbow","rw_photon"], nums:[65,66,67,68,69,70,71,72] },
  armor:  { ids:["ar_leather","ar_mail","ar_plate","ar_arcane","ar_aegis","ar_exo","ar_water","ar_thunder","ar_ice","ar_fire"], nums:[73,74,75,76,77,78,79,80,81,82] },
  spell:  { ids:["sp_fire1","sp_fire2","sp_ice1","sp_ray1","sp_agua1","sp_heal1","sp_heal2","sp_prot1","sp_ward","sp_sleep","sp_para","sp_curse","sp_bless"], nums:[46,47,48,49,50,51,52,53,54,55,56,57,58] },
  object: { ids:["ob_pot","ob_potbig","ob_mana","ob_manabig","ob_shield","ob_cleanse","ob_bomb","ob_revive","ob_phoenix"], nums:[83,84,85,86,87,88,89,90,91] },
};

// Build a number -> art map for all equipment (used to patch shop cards by their "Nº").
function buildNumArtMap() {
  const map = {};
  const sets = [
    [EQUIP.melee, MELEE_ART], [EQUIP.ranged, RANGED_ART], [EQUIP.armor, ARMOR_ART],
    [EQUIP.spell, SPELL_ART], [EQUIP.object, OBJECT_ART],
  ];
  for (const [cat, arts] of sets) {
    cat.nums.forEach((n, i) => { if (arts[i]) map[n] = arts[i]; });
  }
  return map;
}

// Build the JS injection snippet for the game HTML
function buildArtScript() {
  const NUM_ART = buildNumArtMap();
  return `
<script>
(function() {
  // ---- ART DATA ----
  var HERO_ART = ${JSON.stringify(HERO_ART)};
  var HERO_ELITE_ART = ${JSON.stringify(HERO_ELITE_ART)};
  var HERO_IDS = ${JSON.stringify(HERO_IDS)};
  var HERO_NAMES = ${JSON.stringify(HERO_NAMES)};
  var NUM_ART = ${JSON.stringify(NUM_ART)};
  var MELEE_ART = ${JSON.stringify(MELEE_ART)};
  var RANGED_ART = ${JSON.stringify(RANGED_ART)};
  var ARMOR_ART = ${JSON.stringify(ARMOR_ART)};
  var SPELL_ART = ${JSON.stringify(SPELL_ART)};
  var OBJECT_ART = ${JSON.stringify(OBJECT_ART)};
  var BONUS_ART = ${JSON.stringify(BONUS_ART)};
  var BONUS_IDS = ${JSON.stringify(BONUS_IDS)};
  var BONUS_NAMES = ${JSON.stringify(BONUS_NAMES)};
  var COVER_BG = "${COVER_BG}";
  var AUCTION_BG = "${AUCTION_BG}";
  var SHOP_BG = "${SHOP_BG}";
  var BATTLE_BG = "${BATTLE_BG}";
  var ACTION_BG = "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/9e0b3119e_generated_image.png";
  var ICON_CC = "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/119c5390a_generated_image.png";
  var ICON_AD = "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/93cdad509_generated_image.png";
  var ICON_HE = "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ccdd4a1ec_generated_image.png";
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
  BONUS_ART_BY_NAME['Convocatoria Épica'] = HERO_ELITE_ART[12];
  BONUS_ART_BY_NAME['Destino Épico Rival'] = HERO_ELITE_ART[23];
  BONUS_ART_BY_KEY[bfKey('Convocatoria Épica')] = HERO_ELITE_ART[12];
  BONUS_ART_BY_KEY[bfKey('Destino Épico Rival')] = HERO_ELITE_ART[23];

  var RACE_SIGILS = {
    'Guerreros': '⚔',
    'Druidas': '❦',
    'No-muertos': '☠',
    'Vaqueros': '✦',
    'Elfos': '⟐',
    'Magos': '✧',
    'Épicas': '◆',
    'Cotidianos': '◈'
  };

  // id -> art, name -> art lookups for heroes
  var ART_BY_ID = {}, ELITE_BY_ID = {}, ART_BY_NAME = {}, ELITE_BY_NAME = {};
  HERO_IDS.forEach(function(id, i) {
    ART_BY_ID[id] = HERO_ART[i];
    ELITE_BY_ID[id] = HERO_ELITE_ART[i] || HERO_ART[i];
    var nm = HERO_NAMES[i];
    ART_BY_NAME[nm] = HERO_ART[i];
    ELITE_BY_NAME[nm] = HERO_ELITE_ART[i] || HERO_ART[i];
  });

  // ---- STYLES for injected art ----
  function injectCoverStyle() {
    var style = document.createElement('style');
    style.textContent = \`
      .gtitle { text-shadow: 0 0 50px rgba(255,210,74,0.7), 0 4px 30px rgba(255,210,74,0.3) !important; }
      /* Title screen icon row — replaced by sprite sheet icons */
      .title-emoji { display: none !important; }
      .bf-title-icons { display: flex !important; gap: 18px !important; justify-content: center !important; align-items: center !important; margin-bottom: 8px !important; }
      .bf-title-icon {
        width: 72px !important; height: 72px !important; border-radius: 50% !important; overflow: hidden !important;
        border: 2px solid rgba(255,210,74,0.5) !important;
        box-shadow: 0 0 22px rgba(255,210,74,0.38), 0 0 8px rgba(0,0,0,0.7) !important;
        background: #0a0710 !important;
        animation: bfIconFloat 3.2s ease-in-out infinite !important;
        position: relative !important; cursor: default !important;
      }
      .bf-title-icon:nth-child(2) { animation-delay: -1.1s !important; }
      .bf-title-icon:nth-child(3) { animation-delay: -2.2s !important; }
      .bf-title-icon img { width: 100% !important; height: 100% !important; object-fit: cover !important; display: block !important; }
      /* Each icon shows a third of the icons image */
      .bf-icon-cc  img { object-position: 14% center !important; }
      .bf-icon-ad  img { object-position: 50% center !important; }
      .bf-icon-he  img { object-position: 86% center !important; }
      @keyframes bfIconFloat { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-7px) scale(1.06); } }
      /* Real 3D flip, with corrected back face */
      .flip3d { perspective: 1300px !important; }
      .flip3d-inner { transform-style: preserve-3d !important; transition: transform .62s cubic-bezier(.2,.72,.2,1) !important; will-change: transform !important; }
      .flip3d.flipped .flip3d-inner { transform: rotateY(180deg) !important; }
      .flip3d .face { backface-visibility: hidden !important; -webkit-backface-visibility: hidden !important; transform-style: preserve-3d !important; }
      .flip3d .face.front { transform: rotateY(0deg) translateZ(1px) !important; }
      .flip3d .face.back { transform: rotateY(180deg) translateZ(1px) !important; }
      .face.back .bf-hero-card.cf-elite .bf-hero-bg,
      .face.back .cf-elite .cf-art.has-art::before { transform: none !important; }

      /* Premium full-art hero cards */
      .bf-hero-card {
        position: relative !important; height: 100% !important; overflow: hidden !important;
        border-radius: 18px !important; border: 2.5px solid var(--clan,#caa14a) !important;
        background: #09070d !important; box-shadow: 0 10px 28px rgba(0,0,0,.65), inset 0 0 0 1px rgba(255,210,74,.24) !important;
      }
      .bf-hero-bg {
        position: absolute; inset: -8%; z-index: 0; pointer-events: none;
        background-image: var(--bf-art); background-size: cover; background-position: center center; background-repeat: no-repeat;
        filter: saturate(1.12) contrast(1.08);
      }
      .bf-hero-card::before {
        content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none;
        background:
          linear-gradient(180deg, rgba(0,0,0,.54) 0%, rgba(0,0,0,.12) 20%, rgba(0,0,0,0) 42%, rgba(0,0,0,.12) 64%, rgba(0,0,0,.68) 100%),
          radial-gradient(circle at 50% 4%, rgba(255,210,74,.20), rgba(0,0,0,0) 28%);
      }
      .bf-hero-card.cf-elite::before {
        background:
          linear-gradient(180deg, rgba(16,0,34,.58) 0%, rgba(20,0,42,.10) 24%, rgba(0,0,0,0) 43%, rgba(18,0,35,.16) 66%, rgba(0,0,0,.70) 100%),
          radial-gradient(circle at 50% 4%, rgba(192,91,255,.28), rgba(0,0,0,0) 30%);
      }
      /* Épicas: borde foiled holográfico animado */
      .bf-hero-card.cf-epic { border-color:transparent !important; box-shadow:0 10px 28px rgba(0,0,0,.65), 0 0 24px rgba(255,170,80,.4) !important; }
      .bf-hero-card.cf-epic .bf-foil { position:absolute; inset:-3px; z-index:6; border-radius:21px; padding:3px; pointer-events:none;
        background:linear-gradient(125deg,#ffd24a,#ff7adf 18%,#7ad6ff 38%,#9dff8a 56%,#ffe27a 72%,#ff7adf 88%,#ffd24a);
        background-size:300% 300%; animation:bfFoilShift 4s linear infinite;
        -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0); mask-composite:exclude;
        filter:drop-shadow(0 0 8px rgba(255,200,120,.7)); }
      .bf-hero-card.cf-epic::after { content:''; position:absolute; inset:0; z-index:2; pointer-events:none; border-radius:18px;
        background:linear-gradient(125deg,transparent 30%,rgba(255,255,255,.18) 47%,transparent 62%); background-size:250% 250%; animation:bfFoilShift 4s linear infinite; mix-blend-mode:screen; }
      @keyframes bfFoilShift { 0%{background-position:0% 0%} 100%{background-position:300% 300%} }
      .bf-hero-frame { position:absolute; inset:7px; z-index:2; border:1px solid rgba(255,210,74,.36); border-radius:14px; pointer-events:none; box-shadow: inset 0 0 18px rgba(0,0,0,.72); }
      .bf-hero-top, .bf-hero-band { display:none !important; }
      .bf-race-sigil { position:absolute; top:12px; left:50%; transform:translateX(-50%); z-index:5; width:46px; height:46px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff7dc; font-family:'Cinzel',serif; font-size:25px; font-weight:1000; background:radial-gradient(circle at 35% 25%,rgba(255,255,255,.42),rgba(255,210,74,.18) 38%,rgba(0,0,0,.72) 72%); border:2px solid var(--clan,#caa14a); text-shadow:0 2px 4px #000,0 0 10px var(--clan,#caa14a); box-shadow:0 4px 12px rgba(0,0,0,.55),0 0 15px color-mix(in srgb, var(--clan,#caa14a) 45%, transparent); }
      .bf-nameplate { position:absolute; left:15px; right:15px; bottom:108px; z-index:4; text-align:center; padding:4px 9px 5px; border-radius:10px; background:linear-gradient(90deg,rgba(0,0,0,.14),rgba(0,0,0,.62),rgba(0,0,0,.14)); border:1px solid rgba(255,210,74,.18); backdrop-filter:blur(1.5px); }
      .bf-hero-name { display:block; margin:0 auto; font-family:'Cinzel',serif; font-weight:900; font-size:clamp(15px, 5.4vw, 21px); line-height:1; color:#fff5dc; text-transform:uppercase; letter-spacing:.15px; text-shadow:0 2px 4px #000,0 0 12px rgba(0,0,0,.95); overflow-wrap:anywhere; text-align:center; }
      .bf-hero-card.cf-elite .bf-hero-name { color:#ffd66a; text-shadow:0 0 10px rgba(255,187,52,.78),0 2px 4px #000; }
      .bf-hero-title { display:block; margin:3px auto 0; max-width:92%; padding:2px 7px; border-radius:999px; color:#fff0bd; background:rgba(8,5,12,.62); border:1px solid rgba(255,210,74,.22); font-family:'Cinzel',serif; font-size:10.8px; line-height:1.08; font-weight:800; font-style:italic; text-shadow:0 1px 2px #000,0 0 8px rgba(255,210,74,.22); text-align:center; letter-spacing:.12px; }
      .bf-coin { position:absolute; top:9px; left:9px; z-index:5; width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at 34% 28%,#fff0ae,#FFD24A 45%,#b77614); border:2px solid #6f4809; color:#4a2e03; font-size:18px; font-weight:1000; box-shadow:0 4px 10px rgba(0,0,0,.65), inset 0 1px 2px rgba(255,255,255,.62); }
      .bf-type-medal { position:absolute; top:10px; right:9px; z-index:5; width:42px; height:50px; border-radius:50%; background:rgba(0,0,0,.66); border:1.5px solid rgba(255,210,74,.5); color:#ead49a; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:20px; box-shadow:0 4px 10px rgba(0,0,0,.55); }
      .bf-type-medal span { font-size:7.5px; line-height:1; font-weight:800; letter-spacing:.2px; margin-top:1px; }
      .bf-heart { position:absolute; right:9px; bottom:164px; z-index:4; width:58px; height:52px; display:flex; align-items:center; justify-content:center; }
      .bf-heart .cf-heart-ico { position:absolute; inset:0; font-size:54px; color:#e23d3a; line-height:52px; text-align:center; filter:drop-shadow(0 3px 5px rgba(0,0,0,.85)); }
      .bf-heart .cf-hp { position:relative; z-index:2; font-weight:1000; color:#fff; font-size:18px; text-shadow:0 2px 3px #000; }
      .bf-stats { position:absolute; left:16px; right:16px; bottom:158px; z-index:3; display:grid; grid-template-columns:repeat(3,1fr); gap:4px; padding:7px 50px 7px 8px; border-radius:10px; background:linear-gradient(180deg,rgba(9,7,13,.36),rgba(9,7,13,.58)); border:1px solid rgba(255,210,74,.18); box-shadow:0 3px 12px rgba(0,0,0,.36); backdrop-filter:blur(2px); }
      .bf-stat { text-align:center; font-weight:900; line-height:1; text-shadow:0 1px 2px #000,0 0 8px #000; }
      .bf-stat span { display:block; font-size:9px; letter-spacing:1px; margin-bottom:2px; }
      .bf-stat b { display:block; font-size:20px; }
      .bf-stat-cc span,.bf-stat-cc b { color:#ff4b45; }
      .bf-stat-ad span,.bf-stat-ad b { color:#54e876; }
      .bf-stat-he span,.bf-stat-he b { color:#b06cff; }
      .bf-ability-panel { position:absolute; left:11px; right:11px; bottom:11px; z-index:3; min-height:99px; display:grid; grid-template-columns:44px 1fr; gap:9px; align-items:center; padding:9px 10px 20px 9px; border-radius:11px; background:linear-gradient(180deg,rgba(19,12,7,.30),rgba(4,3,5,.62)); border:1px solid rgba(255,210,74,.34); box-shadow:0 -2px 18px rgba(0,0,0,.42), inset 0 0 0 1px rgba(255,255,255,.05); backdrop-filter:blur(2px); }
      .bf-ability-orb { position:relative; width:40px; height:40px; border-radius:50%; background:radial-gradient(circle at 38% 28%,#fff2a7,#ff7a22 32%,#8c1108 62%,#170101); border:2px solid rgba(255,224,121,.82); box-shadow:0 0 16px rgba(255,95,25,.72), inset 0 0 10px rgba(255,255,255,.18); }
      .bf-ability-orb::before { content:'✦'; position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#fff7d7; font-size:23px; font-weight:900; text-shadow:0 0 8px #fff,0 2px 4px #000; }
      .bf-ability-orb::after { content:''; position:absolute; inset:-5px; border-radius:50%; border:1px solid rgba(255,210,74,.34); box-shadow:0 0 14px rgba(255,210,74,.32); }
      .bf-hero-card.cf-elite .bf-ability-orb { background:radial-gradient(circle at 38% 28%,#f4dbff,#c16aff 36%,#4c0b86 66%,#090012); box-shadow:0 0 17px rgba(190,91,255,.82), inset 0 0 10px rgba(255,255,255,.16); }
      .bf-ability-name { color:#ffe07b; font-family:'Cinzel',serif; font-size:12.6px; font-weight:1000; letter-spacing:.25px; text-transform:uppercase; text-shadow:0 2px 4px #000,0 0 10px rgba(255,210,74,.32); }
      .bf-hero-card.cf-elite .bf-ability-name { color:#d9a2ff; }
      .bf-ability-text { margin-top:3px; color:#fff7ea; font-size:12px; font-weight:700; line-height:1.25; text-shadow:0 2px 3px #000,0 0 8px #000; }
      .bf-logo { position:absolute; right:8px; bottom:11px; z-index:8; font-family:'Cinzel',serif; font-weight:1000; color:#ffd24a; font-size:16px; line-height:1; letter-spacing:-1px; padding:4px 5px 3px; border-radius:7px; background:linear-gradient(135deg,#0a0500,#2b1600 55%,#050300); border:1.5px solid #d39b22; text-shadow:0 0 8px rgba(255,210,74,.6),0 1px 1px #000; box-shadow:0 0 9px rgba(255,210,74,.25), inset 0 0 8px rgba(255,210,74,.12); }
      .bf-card-num { position:absolute; left:62px; bottom:13px; z-index:8; color:#ffe7a8; font-size:8.5px; font-weight:900; letter-spacing:.25px; padding:2px 7px; border-radius:999px; background:rgba(0,0,0,.62); border:1px solid rgba(255,210,74,.32); text-shadow:0 1px 2px #000; }

      /* Fallback for any old-format hero cards already on screen */
      .cf-art.has-art::before { content:''; position:absolute; inset:-4%; z-index:0; pointer-events:none; background-image:var(--bf-art); background-size:cover; background-position:center center; background-repeat:no-repeat; }
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
      .bf-bonus-card {
        position: relative; display: block; border-radius: 13px; overflow: hidden;
        aspect-ratio: 3 / 4.1; margin: 5px auto 8px; max-width: 250px; width: 100%; border: 2px solid rgba(255,210,74,0.68);
        background: #07050b;
        box-shadow: 0 7px 20px rgba(0,0,0,0.52), inset 0 0 0 1px rgba(255,210,74,.10);
      }
      .bf-bonus-card .bf-bonus-fill { display: block; position:absolute; inset:0; z-index:0; background-size:cover; background-position:center; filter:blur(16px) saturate(1.3) brightness(.85); transform:scale(1.35); }
      .bf-bonus-card .bf-bonus-art {
        position: absolute; inset: -3%; background-size: cover; background-position: center center; background-repeat: no-repeat; z-index: 1;
      }
      .bf-bonus-card .bf-bonus-shade { display: none; }
      .bf-bonus-card .bf-bonus-name { display: none; }

      /* Mobile card fit: keep art and text inside the phone frame */
      @media (max-width: 640px) {
        .cardface, .bf-hero-card { max-width: 100% !important; }
        .bf-hero-bg, .cf-art.has-art::before { inset: -8% !important; background-size: cover !important; background-position: center center !important; }
        .bf-race-sigil { top: 9px !important; width: 39px !important; height: 39px !important; font-size: 21px !important; }
        .bf-nameplate { left: 9px !important; right: 9px !important; bottom: 107px !important; padding: 4px 7px !important; }
        .bf-hero-name { font-size: clamp(13px, 4.9vw, 18px) !important; line-height: 1 !important; }
        .bf-hero-title { font-size: 9.5px !important; padding: 2px 6px !important; }
        .bf-coin { width: 38px !important; height: 38px !important; font-size: 16px !important; }
        .bf-type-medal { width: 37px !important; height: 44px !important; font-size: 18px !important; }
        .bf-stats { left: 10px !important; right: 10px !important; bottom: 150px !important; padding: 6px 45px 6px 7px !important; }
        .bf-stat b { font-size: 17px !important; }
        .bf-heart { right: 8px !important; bottom: 154px !important; width: 50px !important; height: 46px !important; }
        .bf-heart .cf-heart-ico { font-size: 48px !important; line-height: 46px !important; }
        .bf-heart .cf-hp { font-size: 16px !important; }
        .bf-ability-panel { left: 8px !important; right: 8px !important; bottom: 8px !important; min-height: 90px !important; max-height: 138px !important; overflow: hidden !important; grid-template-columns: 34px 1fr !important; gap: 7px !important; padding: 8px 8px 18px 8px !important; align-items: start !important; }
        .bf-ability-orb { width: 32px !important; height: 32px !important; margin-top: 1px !important; }
        .bf-ability-orb::before { font-size: 18px !important; }
        .bf-ability-name { font-size: 10.2px !important; line-height: 1.1 !important; }
        .bf-ability-text { font-size: 9.8px !important; line-height: 1.16 !important; }
        .bf-zoom-btn { width: 30px !important; height: 30px !important; font-size: 14px !important; right: 6px !important; }
        .bf-card-num { left: 52px !important; bottom: 9px !important; font-size: 7.6px !important; }
        .bf-logo { right: 7px !important; bottom: 8px !important; font-size: 13px !important; }
        .shop-card { max-width: 100% !important; }
        .shop-card-art-sharp { inset: -3% !important; background-size: cover !important; background-position: center center !important; }
        .bf-bonus-card { aspect-ratio: 3 / 4.1 !important; height: auto !important; max-width: 200px !important; margin: 4px auto 7px !important; background:#07050b !important; }
        .bf-bonus-card .bf-bonus-art { inset: -3% !important; background-size: cover !important; background-position: center center !important; background-repeat: no-repeat !important; }
      }

      /* Battle/recruit hero thumbnails */
      .bhero { overflow:hidden !important; min-height:108px; padding-left:92px !important; animation:bfHeroIdle 3.8s ease-in-out infinite; }
      .bhero .bhero-top, .bhero .bhero-hpnum, .bhero .hp-bar, .bhero .mp-bar, .bhero .mp-num, .bhero .bhero-status { position:relative; z-index:2; }
      .bf-battle-art { position:absolute; left:-22px; top:-22px; bottom:-22px; width:130px; z-index:1; background-size:118% auto; background-position:center 18%; background-repeat:no-repeat; background-color:#0a0710; filter:saturate(1.12) contrast(1.08); opacity:.96; border:0 !important; outline:0 !important; box-shadow:none !important; transition:filter .4s ease, transform .5s cubic-bezier(.2,.8,.3,1); }
      .bf-battle-art::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.04) 48%,rgba(21,16,31,.95) 100%); }

      /* ---- ACTIVE HERO: dramatic gradient glow built from their own portrait ---- */
      .bhero.active-turn { animation:bfHeroActive 2.1s ease-in-out infinite !important; z-index:5 !important; }
      .bhero.active-turn .bf-battle-art { width:138px !important; filter:saturate(1.3) contrast(1.16) brightness(1.08) drop-shadow(0 0 16px rgba(255,210,74,.55)) !important; transform:scale(1.04); }
      .bf-active-aura { position:absolute; inset:-14px; z-index:0; pointer-events:none; border-radius:22px;
        background:radial-gradient(120% 120% at 0% 50%, rgba(255,210,74,.42), rgba(255,160,40,.18) 38%, rgba(255,210,74,0) 70%);
        opacity:0; transition:opacity .45s ease; animation:bfAuraBreath 2.4s ease-in-out infinite; }
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
      .bhero.s-sleeping .bf-battle-art { filter:saturate(.55) contrast(.9) brightness(.7) blur(.4px); }
      .bhero.s-sleeping { box-shadow:0 0 0 2px rgba(120,160,255,.6), 0 0 22px rgba(120,160,255,.4) !important; }
      .bhero.s-cursed .bf-battle-art { filter:saturate(.78) contrast(1.22) hue-rotate(255deg) drop-shadow(0 0 11px #b06cff); }
      .bhero.s-cursed { box-shadow:0 0 0 2px rgba(176,108,255,.65), 0 0 22px rgba(176,108,255,.45) !important; }
      .bhero.elite-mode .bf-battle-art { filter:saturate(1.25) contrast(1.12) drop-shadow(0 0 10px #ffd24a); }

      /* Floating status emblem, always visible while the status is active */
      .bf-status-badge { position:absolute; top:6px; right:6px; z-index:6; display:flex; align-items:center; gap:4px; padding:3px 9px 3px 6px; border-radius:999px; font-family:'Cinzel',serif; font-weight:1000; font-size:10px; letter-spacing:.3px; color:#fff; background:rgba(8,5,14,.82); border:1.5px solid currentColor; box-shadow:0 0 12px currentColor; animation:bfBadgeFloat 1.8s ease-in-out infinite; }
      .bf-status-badge .bf-status-ico { font-size:14px; line-height:1; } .bf-status-paralyzed { color:#ffe14a; } .bf-status-sleeping { color:#8aaaff; } .bf-status-cursed { color:#c79bff; }
      @keyframes bfBadgeFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} } @keyframes bfSleepZ { 0%{opacity:0;transform:translate(-50%,4px) scale(.7)} 30%{opacity:1} 100%{opacity:0;transform:translate(-30%,-22px) scale(1.1)} }
      .bf-sleep-z { position:absolute; left:50%; top:8%; z-index:6; pointer-events:none; font-family:'Cinzel',serif; font-weight:1000; color:#9bb4ff; font-size:18px; text-shadow:0 0 10px #5a7fff; animation:bfSleepZ 2.6s ease-in-out infinite; }

      @keyframes bfHeroIdle { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} } @keyframes bfHeroActive { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} } @keyframes bfDamageShake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-9px)} 30%{transform:translateX(8px)} 45%{transform:translateX(-6px)} 60%{transform:translateX(5px)} 80%{transform:translateX(-3px)} } @keyframes bfZap { 0%,100%{opacity:1} 50%{opacity:.62} }
      .ctb-slot { position:relative !important; min-width:104px !important; padding-left:43px !important; overflow:hidden; }
      .bf-ctb-thumb { position:absolute; left:3px; top:3px; bottom:3px; width:36px; border-radius:7px; background-size:122% auto; background-position:center 20%; background-repeat:no-repeat; background-color:#0a0710; border:0 !important; outline:0 !important; box-shadow:0 4px 10px rgba(0,0,0,.34); }
      .hero-acquired { position:relative !important; min-height:76px; padding-left:78px !important; overflow:hidden; }
      .bf-acq-thumb { position:absolute; left:5px; top:5px; bottom:5px; width:66px; border-radius:11px; background-size:122% auto; background-position:center 20%; background-repeat:no-repeat; background-color:#0a0710; border:0 !important; outline:0 !important; box-shadow:0 5px 12px rgba(0,0,0,.45); }
      .bf-result-thumb { display:inline-block; width:46px; height:46px; border-radius:10px; margin-right:9px; vertical-align:middle; background-size:122% auto; background-position:center 20%; background-repeat:no-repeat; background-color:#0a0710; border:0 !important; outline:0 !important; box-shadow:0 4px 10px rgba(0,0,0,.38); }
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
      .bf-race-sigil-big { position:relative; z-index:1; width:58px; height:58px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff7dc; font-family:'Cinzel',serif; font-size:32px; font-weight:1000; background:radial-gradient(circle at 35% 25%,rgba(255,255,255,.42),rgba(255,210,74,.18) 38%,rgba(0,0,0,.72) 72%); border:2px solid var(--race,#ffd24a); text-shadow:0 2px 4px #000,0 0 12px var(--race,#ffd24a); box-shadow:0 5px 16px rgba(0,0,0,.55); }
      .bf-race-title { position:relative; z-index:1; margin-top:10px; font-family:'Cinzel',serif; font-size:20px; font-weight:1000; color:#fff5dc; text-shadow:0 2px 5px #000; }
      .bf-race-trait { position:relative; z-index:1; margin-top:4px; color:#ffe49a; font-weight:800; font-size:12.5px; line-height:1.25; }
      .bf-race-desc { position:relative; z-index:1; margin-top:7px; color:#efe9dc; font-size:13px; line-height:1.28; }
      .bf-race-stats { position:relative; z-index:1; margin-top:8px; color:#cfc6dd; font-size:11px; line-height:1.25; background:rgba(0,0,0,.28); border:1px solid rgba(255,255,255,.08); border-radius:9px; padding:7px; }
      /* Shop card = the oracle card itself. Card proportion + cover with a tiny
         overscan to eat the white border the source images carry. */
      .shop-card { position:relative; overflow:hidden; }
      .shop-card.has-art { background:#07050b !important; aspect-ratio:3 / 4.1 !important; min-height:0 !important; height:auto !important; padding:0 !important; border:1.5px solid rgba(255,210,74,.45) !important; border-radius:12px !important; }
      .shop-card.has-art > *:not(.shop-card-art-sharp):not(.shop-card-fill):not(.bf-view-btn):not(.bf-buy-btn):not(.bf-shop-name):not(.bf-shop-txt) { display:none !important; }
      .shop-card-art { display:none !important; }
      .shop-card-fill { position:absolute; inset:0; z-index:0; background-size:cover; background-position:center; filter:blur(16px) saturate(1.3) brightness(.85); transform:scale(1.35); }
      .shop-card-art-sharp { position:absolute; inset:-7%; z-index:1; background-size:cover; background-position:center center; background-repeat:no-repeat; }
      /* Hand cards (spells/objects) — the WHOLE oracle card shown, no cropping */
      .chip.bf-chip-card { position:relative !important; width:88px !important; height:120px !important; aspect-ratio:3 / 4.1 !important; padding:0 !important; border-radius:9px !important; overflow:hidden !important; border:1.5px solid rgba(255,210,74,.55) !important; background:#07050b !important; box-shadow:0 4px 12px rgba(0,0,0,.55) !important; font-size:0 !important; line-height:0 !important; display:inline-block !important; vertical-align:top !important; cursor:pointer; transition:transform .14s ease, box-shadow .14s ease; }
      .chip.bf-chip-card:hover { transform:translateY(-5px) scale(1.05); box-shadow:0 10px 22px rgba(0,0,0,.6), 0 0 16px rgba(255,210,74,.4) !important; z-index:5; }
      .chip.bf-chip-card .bf-chip-fill { display:block; position:absolute; inset:0; z-index:0; background-size:cover; background-position:center; filter:blur(14px) saturate(1.3) brightness(.85); transform:scale(1.35); }
      .chip.bf-chip-card .bf-chip-art-layer { position:absolute; inset:-7%; z-index:1; background-size:cover; background-position:center; background-repeat:no-repeat; }
      .chip.bf-chip-card .bf-chip-info { position:absolute; left:0; right:0; bottom:0; z-index:3; padding:2px 3px 3px; font-size:7.5px !important; line-height:1.1; font-weight:800; font-family:'Rubik',sans-serif; color:#cfeaff; text-align:center; text-shadow:0 1px 2px #000,0 0 4px #000; background:linear-gradient(0deg,rgba(4,8,16,.95),rgba(4,8,16,.6) 70%,transparent); white-space:normal; }
      .chip.bf-chip-card.bf-chip-has-info .bf-chip-name { bottom:auto; top:0; background:linear-gradient(180deg,rgba(8,5,14,.92),rgba(8,5,14,.55) 60%,transparent); }
      .chip.bf-chip-card .bf-chip-x { position:absolute !important; top:2px; right:2px; z-index:3; width:18px; height:18px; border-radius:50%; background:rgba(8,5,14,.82); border:1px solid rgba(255,120,120,.6); color:#ff9a9a; font-size:11px; line-height:1; font-weight:900; display:flex; align-items:center; justify-content:center; cursor:pointer; padding:0; }
      .chip.bf-chip-card .bf-chip-x:hover { background:rgba(255,80,80,.35); color:#fff; }
      .chip.bf-chip-card .bf-chip-name { position:absolute; left:0; right:0; bottom:0; z-index:2; padding:3px 4px 4px; font-size:8.5px !important; line-height:1.04; font-weight:900; font-family:'Cinzel',serif; color:#fff5dc; text-align:center; text-transform:uppercase; letter-spacing:.1px; text-shadow:0 1px 2px #000,0 0 6px #000; background:linear-gradient(0deg,rgba(8,5,14,.92),rgba(8,5,14,.55) 60%,transparent); white-space:normal; }
      .eq-hero.bf-eq-hero-with-art { position:relative !important; min-height:176px; padding-left:150px !important; overflow:hidden; }
      .eq-hero.bf-eq-hero-with-art > *:not(.bf-eq-hero-art) { position:relative; z-index:2; }
      .bf-eq-hero-art { position:absolute; left:-10px; top:-10px; bottom:-10px; width:150px; z-index:1; background-size:cover; background-position:center 20%; background-repeat:no-repeat; border-right:1px solid rgba(255,210,74,.26); filter:saturate(1.12) contrast(1.08); }
      .bf-eq-hero-art::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(18,12,25,.22) 58%,rgba(18,12,25,.92) 100%); }
      /* Equipped item thumbnail inside a filled slot (no number) */
      .eq-slot.bf-slot-art { position:relative; padding-left:54px !important; min-height:50px; display:flex; align-items:center; }
      .bf-slot-thumb { position:absolute; left:6px; top:50%; transform:translateY(-50%); width:42px; height:42px; border-radius:8px; background-size:cover; background-position:center; border:1px solid rgba(255,210,74,.45); box-shadow:0 3px 8px rgba(0,0,0,.5); }
      .bf-quick-num { position:absolute; top:8px; right:8px; z-index:3; font-size:9px; font-weight:900; color:#ffe7a8; background:rgba(0,0,0,.7); border:1px solid rgba(255,210,74,.32); border-radius:999px; padding:2px 7px; }
      .eq-slot.bf-slot-empty { display:flex; align-items:center; justify-content:space-between; gap:8px; }
      .bf-slot-buy { border:1px solid rgba(255,210,74,.55); background:rgba(255,210,74,.12); color:#ffe49a; border-radius:999px; padding:4px 9px; font-size:10.5px; font-weight:900; cursor:pointer; white-space:nowrap; }
      .bf-slot-buy:hover { background:rgba(255,210,74,.22); }
      .bf-quick-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:10px; margin-top:12px; }
      /* Quick-shop card = the oracle card itself (cover + overscan + card ratio). */
      .bf-quick-card { position:relative; overflow:hidden; aspect-ratio:3 / 4.1; border-radius:13px; border:1.5px solid rgba(255,210,74,.42); background:#07050b; padding:0; cursor:pointer; box-shadow:0 8px 20px rgba(0,0,0,.38); }
      .bf-quick-fill { display:block; position:absolute; inset:0; z-index:0; background-size:cover; background-position:center; filter:blur(16px) saturate(1.3) brightness(.85); transform:scale(1.35); }
      .bf-quick-art { position:absolute; inset:-3%; z-index:1; background-size:cover; background-position:center; background-repeat:no-repeat; }
      .bf-quick-card > *:not(.bf-quick-art):not(.bf-quick-fill):not(.bf-quick-cost) { display:none !important; }
      .bf-quick-cost { position:absolute; top:8px; left:8px; z-index:4; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at 34% 28%,#fff0ae,#FFD24A 45%,#b77614); border:2px solid #6f4809; color:#4a2e03; font-weight:1000; box-shadow:0 3px 8px rgba(0,0,0,.55); }
      /* In-game styled confirm dialog */
      .bf-confirm-overlay { position:fixed; inset:0; z-index:100000; display:flex; align-items:center; justify-content:center; padding:20px; background:radial-gradient(circle at 50% 40%,rgba(20,12,34,.72),rgba(8,5,14,.9)); backdrop-filter:blur(4px); animation:bfFadeIn .2s ease; }
      .bf-confirm-box { width:min(360px,92vw); border-radius:18px; overflow:hidden; border:2px solid rgba(255,210,74,.55); background:linear-gradient(180deg,#1b1430,#120d22); box-shadow:0 18px 50px rgba(0,0,0,.7),0 0 30px rgba(255,210,74,.18), inset 0 0 0 1px rgba(255,210,74,.12); animation:bfPopIn .26s cubic-bezier(.2,.8,.3,1); }
      .bf-confirm-art { position:relative; aspect-ratio:3 / 4.1; max-height:300px; overflow:hidden; background:#07050b; }
      .bf-confirm-art .bf-confirm-art-fill { position:absolute; inset:0; background-image:var(--bf-cart); background-size:cover; background-position:center; background-repeat:no-repeat; filter:blur(16px) saturate(1.3) brightness(.85); transform:scale(1.35); z-index:0; }
      .bf-confirm-art .bf-confirm-art-sharp { position:absolute; inset:-3%; background-image:var(--bf-cart); background-size:cover; background-position:center center; background-repeat:no-repeat; z-index:1; }
      .bf-confirm-art::after { display:none; }
      .bf-confirm-art .bf-confirm-cost, .bf-confirm-art .bf-confirm-num { z-index:3; }
      /* "Ver carta" button on every shop card */
      .bf-view-btn { position:absolute; bottom:7px; left:50%; transform:translateX(-50%); z-index:6; border:1px solid rgba(255,210,74,.6); background:rgba(8,5,14,.78); color:#ffe49a; border-radius:999px; padding:4px 12px; font-size:10.5px; font-weight:900; cursor:pointer; white-space:nowrap; backdrop-filter:blur(2px); transition:background .12s ease; }
      .bf-view-btn:hover { background:rgba(255,210,74,.22); color:#fff5dc; }
      /* "Comprar" button on every shop card */
      .bf-buy-btn { position:absolute; bottom:7px; left:50%; transform:translateX(-50%); z-index:6; border:1px solid #ffd24a; background:linear-gradient(180deg,#ffe27a,#FFD24A 55%,#c8901f); color:#3a2600; border-radius:999px; padding:5px 14px; font-size:11px; font-weight:900; cursor:pointer; white-space:nowrap; box-shadow:0 4px 12px rgba(255,210,74,.4); transition:filter .12s ease; }
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
      .bf-view-card .bf-view-art { position:absolute; inset:-3px; background-image:var(--bf-art); background-size:cover; background-position:center; background-repeat:no-repeat; z-index:1; }
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

      /* ---- Equipped weapons/armor thumbnails on battle heroes ---- */
      .bhero .bf-battle-gear { position:absolute; left:80px; bottom:6px; z-index:3; display:flex; gap:4px; }
      .bhero .bf-gear-icon { width:26px; height:26px; border-radius:6px; background-size:cover; background-position:center; border:1.5px solid rgba(255,210,74,.55); box-shadow:0 2px 6px rgba(0,0,0,.6); background-color:#0a0710; }

      /* ---- Action panel of the active hero: AI battle background ---- */
      .bf-action-bg { position:absolute; inset:0; z-index:0; pointer-events:none; background-image:var(--bf-action-art); background-size:cover; background-position:center 22%; background-repeat:no-repeat; opacity:.95; transition:background-image .4s ease; }
      .bf-action-bg::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg,rgba(10,7,18,.74) 0%,rgba(10,7,18,.55) 38%,rgba(10,7,18,.9) 100%); }
      .bf-action-host { position:relative !important; overflow:hidden; border-radius:14px; }
      .bf-action-host > *:not(.bf-action-bg):not(.bf-active-banner) { position:relative; z-index:1; }
      /* Active hero banner: name + ability, shown at the top of the action panel */
      .bf-active-banner { position:relative; z-index:2; margin:0 0 10px; padding:9px 11px; border-radius:12px; background:linear-gradient(180deg,rgba(20,12,34,.78),rgba(8,5,14,.85)); border:1px solid rgba(255,210,74,.4); box-shadow:0 4px 16px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.05); backdrop-filter:blur(2px); display:grid; grid-template-columns:42px 1fr; gap:10px; align-items:center; }
      .bf-active-banner.bf-banner-elite { border-color:rgba(190,108,255,.55); }
      .bf-ab-orb { position:relative; width:40px; height:40px; border-radius:50%; background:radial-gradient(circle at 38% 28%,#fff2a7,#ff7a22 32%,#8c1108 62%,#170101); border:2px solid rgba(255,224,121,.82); box-shadow:0 0 14px rgba(255,95,25,.7), inset 0 0 8px rgba(255,255,255,.18); }
      .bf-ab-orb::before { content:'✦'; position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#fff7d7; font-size:21px; font-weight:900; text-shadow:0 0 8px #fff,0 2px 4px #000; }
      .bf-banner-elite .bf-ab-orb { background:radial-gradient(circle at 38% 28%,#f4dbff,#c16aff 36%,#4c0b86 66%,#090012); box-shadow:0 0 15px rgba(190,91,255,.8), inset 0 0 8px rgba(255,255,255,.16); }
      .bf-ab-hero { font-family:'Cinzel',serif; font-weight:1000; font-size:13px; color:#ffe07b; letter-spacing:.2px; text-transform:uppercase; text-shadow:0 2px 4px #000,0 0 8px rgba(255,210,74,.3); line-height:1; }
      .bf-banner-elite .bf-ab-hero { color:#d9a2ff; }
      .bf-ab-name { font-family:'Cinzel',serif; font-weight:900; font-size:11px; color:#fff5dc; margin-top:3px; line-height:1; }
      .bf-ab-text { color:#fff7ea; font-size:11px; font-weight:600; line-height:1.22; margin-top:3px; text-shadow:0 1px 2px #000; }
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
      .bf-zoom-close { position:absolute; top:16px; right:16px; z-index:2; width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; cursor:pointer; background:rgba(0,0,0,.6); border:1px solid rgba(255,210,74,.55); color:#ffe49a; }
      .bf-zoom-close:hover { background:rgba(0,0,0,.85); }

      /* ---- Guía (ave fantasía tipo chocobo) — anclada a la IZQUIERDA ---- */
      .bf-guide { position:fixed; top:8px; left:8px; z-index:90000; display:flex; align-items:flex-end; gap:10px; max-width:min(440px,72vw); pointer-events:none; animation:bfFadeIn .35s ease; }
      .bf-guide.bf-guide-hidden .bf-guide-bubble, .bf-guide.bf-guide-hidden .bf-guide-char { display:none; }
      .bf-guide-char { position:relative; flex:0 0 auto; width:78px; height:78px; pointer-events:auto; animation:bfGuideFloat 3.2s ease-in-out infinite; filter:drop-shadow(0 6px 10px rgba(0,0,0,.6)); cursor:pointer; transition:transform .2s ease; }
      .bf-guide-char img { width:100%; height:100%; object-fit:contain; display:block; transition:opacity .18s ease; }
      /* Reaction animations (triggered on strong battle / equip events) */
      .bf-guide-char.bf-react-cheer { animation:bfGuideCheer 1.1s ease-in-out 2; } .bf-guide-char.bf-react-wow { animation:bfGuideWow 1s ease-in-out 2; } .bf-guide-char.bf-react-shock { animation:bfGuideShock 0.9s ease-in-out 2; }
      .bf-guide-char .bf-guide-spark { position:absolute; inset:-12px; z-index:-1; pointer-events:none; border-radius:50%; opacity:0; background:radial-gradient(circle,rgba(255,210,74,.6),rgba(255,160,40,.25) 42%,transparent 72%); }
      .bf-guide-char.bf-react-cheer .bf-guide-spark, .bf-guide-char.bf-react-wow .bf-guide-spark { animation:bfGuideSpark 1.1s ease-out 2; } .bf-guide-char.bf-react-shock .bf-guide-spark { background:radial-gradient(circle,rgba(176,108,255,.55),rgba(80,20,120,.25) 42%,transparent 72%); animation:bfGuideSpark 1.1s ease-out 2; }
      @keyframes bfGuideCheer { 0%,100%{transform:translateY(0) rotate(0)} 25%{transform:translateY(-12px) rotate(-7deg) scale(1.12)} 50%{transform:translateY(-2px) rotate(5deg) scale(1.06)} 75%{transform:translateY(-10px) rotate(-4deg) scale(1.1)} } @keyframes bfGuideWow { 0%,100%{transform:scale(1) rotate(0)} 30%{transform:scale(1.22) rotate(3deg)} 60%{transform:scale(1.1) rotate(-3deg)} } @keyframes bfGuideShock { 0%,100%{transform:translateX(0) rotate(0)} 15%{transform:translateX(-7px) rotate(-5deg) scale(1.08)} 35%{transform:translateX(7px) rotate(5deg)} 55%{transform:translateX(-5px) rotate(-3deg)} 75%{transform:translateX(4px)} } @keyframes bfGuideSpark { 0%{opacity:0;transform:scale(.6)} 30%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1.4)} }
      /* Floating reaction word above Punkito */
      .bf-guide-pop { position:absolute; left:50%; top:-18px; transform:translateX(-50%); z-index:5; pointer-events:none; font-family:'Cinzel',serif; font-weight:1000; font-size:13px; letter-spacing:.4px; white-space:nowrap; padding:3px 10px; border-radius:999px; color:#3a2600; background:linear-gradient(180deg,#ffe27a,#FFD24A 55%,#c8901f); box-shadow:0 4px 12px rgba(255,210,74,.55); animation:bfGuidePop 1.6s ease-out forwards; } .bf-guide-pop.bf-pop-shock { color:#fff; background:linear-gradient(180deg,#c79bff,#8a3df0 55%,#4c0b86); box-shadow:0 4px 12px rgba(160,80,255,.55); }
      @keyframes bfGuidePop { 0%{opacity:0;transform:translate(-50%,8px) scale(.6)} 20%{opacity:1;transform:translate(-50%,0) scale(1.1)} 80%{opacity:1;transform:translate(-50%,-6px) scale(1)} 100%{opacity:0;transform:translate(-50%,-20px) scale(.9)} }
      .bf-guide-bubble { position:relative; pointer-events:auto; background:linear-gradient(180deg,#1c1533,#130d24); border:2px solid rgba(255,210,74,.6); border-radius:14px; padding:9px 30px 10px 13px; box-shadow:0 8px 24px rgba(0,0,0,.55),0 0 18px rgba(255,210,74,.14), inset 0 0 0 1px rgba(255,210,74,.1); }
      .bf-guide-bubble::before { content:''; position:absolute; left:-9px; bottom:14px; width:0; height:0; border-top:8px solid transparent; border-bottom:8px solid transparent; border-right:9px solid rgba(255,210,74,.6); }
      .bf-guide-title { font-family:'Cinzel',serif; font-weight:1000; font-size:12px; color:#ffd24a; letter-spacing:.3px; text-shadow:0 1px 2px #000; margin-bottom:2px; }
      .bf-guide-text { font-size:12.5px; line-height:1.3; color:#f3ecff; font-weight:600; text-shadow:0 1px 2px #000; }
      .bf-guide-text b { color:#ffe49a; }
      .bf-guide-x { position:absolute; top:3px; right:3px; width:24px; height:24px; border-radius:50%; border:none; background:rgba(255,255,255,.12); color:#cbb9ee; font-size:13px; line-height:1; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:5; }
      .bf-guide-x:hover { background:rgba(255,255,255,.2); color:#fff; }
      .bf-guide-show { position:fixed; top:10px; left:10px; z-index:90000; width:46px; height:46px; border-radius:50%; overflow:hidden; border:2px solid rgba(255,210,74,.6); background:#130d24; box-shadow:0 4px 12px rgba(0,0,0,.55),0 0 14px rgba(255,210,74,.2); cursor:pointer; display:none; padding:0; animation:bfGuideFloat 3.2s ease-in-out infinite; }
      .bf-guide-show img { width:100%; height:100%; object-fit:contain; display:block; }
      .bf-guide-show.bf-guide-visible { display:block; }
      @keyframes bfGuideFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      @media (max-width: 640px) {
        .bf-guide { top:6px; left:6px; gap:7px; max-width:74vw; }
        .bf-guide-char { width:58px; height:58px; }
        .bf-guide-bubble { padding:7px 34px 8px 11px; }
        .bf-guide-title { font-size:11px; }
        .bf-guide-text { font-size:11px; line-height:1.25; }
        .bf-guide-x { top:2px; right:2px; width:30px; height:30px; font-size:16px; background:rgba(255,255,255,.18); }
      }

      /* ---- Tablets (portrait + landscape): roomier than phones, tighter than desktop ---- */
      @media (min-width: 641px) and (max-width: 1024px) {
        .bf-hero-bg, .cf-art.has-art::before { inset:-7% !important; background-size:cover !important; background-position:center center !important; }
        .bf-race-list { grid-template-columns:repeat(auto-fit,minmax(260px,1fr)) !important; }
        .bf-quick-grid { grid-template-columns:repeat(auto-fit,minmax(190px,1fr)) !important; }
        .chip.bf-chip-card { width:96px !important; height:131px !important; }
        .bf-confirm-box { width:min(420px,90vw) !important; }
        .bf-guide { max-width:min(460px,66vw) !important; }
        .bf-eq-hero-art { width:140px !important; }
        .eq-hero.bf-eq-hero-with-art { padding-left:140px !important; }
      }

      /* ---- Small phones: shrink hand cards & confirm dialog so they always fit ---- */
      @media (max-width: 420px) {
        .chip.bf-chip-card { width:76px !important; height:104px !important; }
        .bf-confirm-box { width:96vw !important; }
        .bf-confirm-name { font-size:17px !important; }
        .bf-confirm-btn { font-size:13px !important; padding:10px 8px !important; }
        .bf-action-bg { background-position:center 35% !important; }
        .bf-quick-grid { grid-template-columns:repeat(auto-fit,minmax(140px,1fr)) !important; }
      }

      /* ---- Landscape phones: keep the guide & action panel out of the way ---- */
      @media (max-height: 480px) and (orientation: landscape) {
        .bf-guide { top:4px !important; }
        .bf-guide-char { width:50px !important; height:50px !important; }
        .bf-guide-bubble { padding:6px 30px 7px 10px !important; }
        .bf-guide-text { font-size:10.5px !important; }
      }
    \`;
    document.head.appendChild(style);
  }

  // ---- PATCH cardFace (heroes) — premium full-art layout ----
  function patchCardFace() {
    if (typeof window.cardFace !== 'function' || window.cardFace.__patched) return !!(window.cardFace && window.cardFace.__patched);

    function clean(value) {
      return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[ch];
      });
    }
    function typeLabel(type) {
      if (type === 'CC') return 'CUERPO A CUERPO';
      if (type === 'AD') return 'A DISTANCIA';
      if (type === 'HE') return 'HECHICERÍA';
      return clean(type || 'HÉROE');
    }
    function typeIcon(type) {
      if (type === 'CC') return '⚔';
      if (type === 'AD') return '🏹';
      if (type === 'HE') return '✦';
      return '★';
    }
    function raceSigil(clan) {
      return RACE_SIGILS[clan] || '◆';
    }
    function padNum(value, hero) {
      var n = parseInt(value || 0, 10);
      if (!n && hero && hero.id) {
        var idx = HERO_IDS.indexOf(hero.id);
        if (idx >= 0) n = idx + 1;
      }
      return n ? String(n).padStart(3, '0') : '---';
    }

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
      var url = elite ? (ELITE_BY_ID[h && h.id] || ART_BY_ID[h && h.id]) : ART_BY_ID[h && h.id];
      var safeUrl = String(url || '').replace(/'/g, '%27');
      return '<div class="cardface bf-hero-card ' + (elite ? 'cf-elite' : '') + (isEpic ? ' cf-epic' : '') + '" style="--clan:' + clean(col) + ';--bf-art:url(\\'' + safeUrl + '\\')">' +
        (isEpic ? '<div class="bf-foil"></div>' : '') +
        '<div class="bf-hero-bg"></div>' +
        '<div class="bf-hero-frame"></div>' +
        '<div class="bf-coin">' + clean(h.cost) + '</div>' +
        '<div class="bf-race-sigil" title="' + clean(h.clan || '') + '">' + clean(raceSigil(h.clan)) + '</div>' +
        '<div class="bf-type-medal">' + typeIcon(h.type) + '<span>' + clean(h.type || '') + '</span></div>' +
        '<div class="bf-stats">' +
          '<div class="bf-stat bf-stat-cc"><span>CC</span><b>' + clean(cc) + '</b></div>' +
          '<div class="bf-stat bf-stat-ad"><span>AD</span><b>' + clean(ad) + '</b></div>' +
          '<div class="bf-stat bf-stat-he"><span>HE</span><b>' + clean(he) + '</b></div>' +
        '</div>' +
        '<div class="bf-nameplate"><div class="bf-hero-name">' + clean(h.name) + '</div><div class="bf-hero-title">' + clean(h.title) + (elite ? ' · ÉLITE' : '') + '</div></div>' +
        '<div class="bf-heart"><span class="cf-heart-ico">❤</span><span class="cf-hp">' + clean(hp) + '</span></div>' +
        '<div class="bf-ability-panel">' +
          '<div class="bf-ability-orb"></div>' +
          '<div><div class="bf-ability-name">' + clean(ability) + '</div><div class="bf-ability-text">' + clean(abilityTxt) + '</div></div>' +
        '</div>' +
        '<div class="bf-card-num">Base Set · Nº ' + padNum(h.num, h) + '</div>' +
        '<div class="bf-logo">BF</div>' +
      '</div>';
    };
    patched.__patched = true;
    window.cardFace = patched;
    return true;
  }

  // ---- Full-screen card zoom (lupa) — shows the WHOLE card (art + stats + ability), enlarged ----
  function bfZoomCard(heroId, variant) {
    if (typeof window.cardFace !== 'function') return;
    var h = (typeof HEROES !== 'undefined' ? HEROES : []).find(function(x) { return x && x.id === heroId; });
    if (!h) return;
    var existing = document.getElementById('bf-zoom-overlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.id = 'bf-zoom-overlay';
    overlay.className = 'bf-zoom-overlay';
    overlay.innerHTML =
      '<button class="bf-zoom-close" aria-label="Cerrar">✕</button>' +
      '<div class="bf-zoom-cardwrap">' + window.cardFace(h, variant === 'elite' ? 'elite' : 'normal') + '</div>';
    document.body.appendChild(overlay);
    // Don't let the zoomed card's own lupa button re-trigger inside the modal.
    var innerBtn = overlay.querySelector('.bf-zoom-cardwrap .bf-zoom-btn');
    if (innerBtn) innerBtn.remove();
    function close() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }
    overlay.addEventListener('click', function(e) { if (e.target === overlay || e.target.className === 'bf-zoom-close') close(); });
    var wrap = overlay.querySelector('.bf-zoom-cardwrap');
    if (wrap) wrap.addEventListener('click', function(e) { e.stopPropagation(); });
  }
  window.bfZoomCard = bfZoomCard;

  // ---- Full-screen bonus/restador zoom (lupa) — shows the whole bonus card enlarged ----
  function bfZoomBonus(name, url) {
    if (!url) return;
    var existing = document.getElementById('bf-zoom-overlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.id = 'bf-zoom-overlay';
    overlay.className = 'bf-zoom-overlay';
    overlay.innerHTML =
      '<button class="bf-zoom-close" aria-label="Cerrar">✕</button>' +
      '<div class="bf-zoom-bonuswrap">' +
        '<div class="bf-bonus-card" style="height:100%;margin:0">' +
          '<div class="bf-bonus-fill" style="background-image:url(\\'' + url + '\\')"></div>' +
          '<div class="bf-bonus-art" style="background-image:url(\\'' + url + '\\')"></div>' +
          '<div class="bf-bonus-shade"></div>' +
          '<div class="bf-bonus-name">' + name + '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    function close() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }
    overlay.addEventListener('click', function(e) { if (e.target === overlay || e.target.className === 'bf-zoom-close') close(); });
    var wrap = overlay.querySelector('.bf-zoom-bonuswrap');
    if (wrap) wrap.addEventListener('click', function(e) { e.stopPropagation(); });
  }
  window.bfZoomBonus = bfZoomBonus;

  // ---- DOM injection for hero cards (match by name) ----
  function injectHeroArt() {
    document.querySelectorAll('.cardface').forEach(function(card) {
      var artDiv = card.querySelector('.cf-art');
      if (!artDiv || artDiv.classList.contains('has-art')) return;
      var nameEl = card.querySelector('.cf-name');
      if (!nameEl) return;
      var nameText = nameEl.textContent.replace(/★/g, '').trim();
      var isElite = card.classList.contains('cf-elite');
      var url = isElite ? (ELITE_BY_NAME[nameText] || ART_BY_NAME[nameText]) : ART_BY_NAME[nameText];
      if (!url) return;
      artDiv.style.setProperty('--bf-art', "url('" + url + "')");
      artDiv.classList.add('has-art');
    });
  }

  // ---- DOM injection for equipment shop cards — full-bleed like bonus cards ----
  function injectEquipArt() {
    document.querySelectorAll('.shop-card').forEach(function(card) {
      if (card.dataset.bfShopArt === '1') return;
      var bf = card.querySelector('.shop-bf span');
      if (!bf) return;
      var m = bf.textContent.match(/(\\d+)/);
      if (!m) return;
      var url = NUM_ART[m[1]];
      if (!url) return;
      // Capture the card name BEFORE we hide it, so we can re-show it on top.
      var nameEl = card.querySelector('.shop-name');
      var nameTxt = nameEl ? nameEl.textContent.trim() : '';
      card.dataset.bfShopArt = '1';
      var fill = document.createElement('div');
      fill.className = 'shop-card-fill';
      fill.style.backgroundImage = 'url("' + url + '")';
      card.insertBefore(fill, card.firstChild);
      var sharp = document.createElement('div');
      sharp.className = 'shop-card-art-sharp';
      sharp.style.backgroundImage = 'url("' + url + '")';
      card.insertBefore(sharp, card.firstChild);
      card.classList.add('has-art');
      // Re-add the name on top of the art (the original .shop-name is hidden).
      if (nameTxt && !card.querySelector('.bf-shop-name')) {
        var nm = document.createElement('div');
        nm.className = 'bf-shop-name';
        nm.textContent = nameTxt;
        card.appendChild(nm);
      }
    });
  }

  // ---- DOM injection for the round bonus/restador (turn its chip into a card) ----
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
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card) {
      if (card.dataset.bfBattleArt === '1') { injectBattleGear(card); return; }
      var parts = card.id.split('_');
      var id = parts[parts.length - 1];
      var url = ART_BY_ID[id] || ELITE_BY_ID[id];
      if (!url) { injectBattleGear(card); return; }
      var art = document.createElement('div');
      art.className = 'bf-battle-art';
      art.style.backgroundImage = 'url("' + url + '")';
      card.insertBefore(art, card.firstChild);
      card.dataset.bfBattleArt = '1';
      injectBattleGear(card);
    });
    document.querySelectorAll('.ctb-slot').forEach(function(slot) {
      if (slot.dataset.bfCtbArt === '1') return;
      var nm = slot.querySelector('.ctb-hero-name');
      if (!nm) return;
      var url = ART_BY_NAME[nm.textContent.trim()];
      if (!url) return;
      var thumb = document.createElement('div');
      thumb.className = 'bf-ctb-thumb';
      thumb.style.backgroundImage = 'url("' + url + '")';
      slot.insertBefore(thumb, slot.firstChild);
      slot.dataset.bfCtbArt = '1';
    });
  }

  function readHeroHp(card) {
    var hp = card.querySelector('.bhero-hpnum');
    var text = hp ? hp.textContent : '';
    var match = String(text).match(/-?\d+/);
    return match ? parseInt(match[0], 10) : null;
  }

  function statusText(card) {
    var status = card.querySelector('.bhero-status');
    return status ? status.textContent : '';
  }

  function isHeroParalyzed(card) {
    return card.classList.contains('s-paralyzed') || /par[aá]li/i.test(statusText(card));
  }

  // Resolve the current status of a battle hero: 'paralyzed' | 'sleeping' | 'cursed' | ''.
  function heroStatusOf(card) {
    var t = statusText(card);
    if (card.classList.contains('s-paralyzed') || /par[aá]li/i.test(t)) return 'paralyzed';
    if (card.classList.contains('s-sleeping') || /dorm|sue[ñn]/i.test(t)) return 'sleeping';
    if (card.classList.contains('s-cursed') || /maldi|maldec/i.test(t)) return 'cursed';
    return '';
  }

  var STATUS_INFO = {
    paralyzed: { ico: '⚡', label: 'PARALIZADO', cls: 'bf-status-paralyzed' },
    sleeping:  { ico: '💤', label: 'DORMIDO',    cls: 'bf-status-sleeping' },
    cursed:    { ico: '☠', label: 'MALDITO',     cls: 'bf-status-cursed' },
  };

  // Ensure the active hero has its dramatic aura/ring/tag layers, and that every
  // hero shows a floating status badge matching its current condition.
  function decorateBattleHeroState(card) {
    if (!card || !card.isConnected) return;
    if (!card.querySelector('.bf-active-aura')) {
      var aura = document.createElement('div'); aura.className = 'bf-active-aura';
      var ring = document.createElement('div'); ring.className = 'bf-active-ring';
      var tag = document.createElement('div'); tag.className = 'bf-active-tag'; tag.textContent = '★ SU TURNO';
      card.insertBefore(ring, card.firstChild);
      card.insertBefore(aura, card.firstChild);
      card.appendChild(tag);
    }
    var st = heroStatusOf(card);
    var badge = card.querySelector('.bf-status-badge');
    if (!st) {
      if (badge) badge.remove();
      var z = card.querySelector('.bf-sleep-z'); if (z) z.remove();
      card.dataset.bfStatus = '';
      return;
    }
    if (card.dataset.bfStatus !== st) {
      if (badge) badge.remove();
      var info = STATUS_INFO[st];
      var b = document.createElement('div');
      b.className = 'bf-status-badge ' + info.cls;
      b.innerHTML = '<span class="bf-status-ico">' + info.ico + '</span>' + info.label;
      card.appendChild(b);
      var existingZ = card.querySelector('.bf-sleep-z'); if (existingZ) existingZ.remove();
      if (st === 'sleeping') {
        var zz = document.createElement('div'); zz.className = 'bf-sleep-z'; zz.textContent = 'Z';
        card.appendChild(zz);
      }
      card.dataset.bfStatus = st;
    }
  }

  function heroIdFromCard(card) {
    var parts = String(card && card.id || '').split('_');
    return parts[parts.length - 1] || '';
  }

  function addOverlayFx(card, html, ms) {
    if (!card || !card.isConnected) return;
    var fx = document.createElement('div');
    fx.className = 'bf-combat-fx';
    fx.innerHTML = html;
    card.appendChild(fx);
    setTimeout(function() { if (fx.parentNode) fx.parentNode.removeChild(fx); }, ms || 1000);
  }

  function transformHeroToElite(card) {
    if (!card || card.dataset.bfAutoElite === '1') return;
    var id = heroIdFromCard(card);
    var eliteUrl = ELITE_BY_ID[id];
    var art = card.querySelector('.bf-battle-art');
    if (art && eliteUrl) art.style.backgroundImage = 'url("' + eliteUrl + '")';
    card.dataset.bfAutoElite = '1';
    card.classList.add('bf-auto-elite', 'elite-mode');
    addOverlayFx(card, '<div class="bf-fx-elite-flip"></div><div class="bf-fx-elite-aura"></div><div class="bf-fx-float bf-fx-status-txt">★ ÉLITE</div>', 1200);
  }

  // Permanent death animation (gravestone / RIP) for a hero that dies for good.
  function playTrueDeath(card) {
    if (!card || !card.isConnected) return;
    card.classList.add('bf-dead', 'bf-truedead');
    addOverlayFx(card, '<div class="bf-fx-grave-shade"></div><div class="bf-fx-grave">🪦</div><div class="bf-fx-float bf-fx-status-txt">R.I.P.</div>', 1400);
  }

  // Inject thumbnails of the hero's equipped weapon + armor onto a battle card.
  function injectBattleGear(card) {
    if (!card || card.dataset.bfGear === '1') return;
    var id = heroIdFromCard(card);
    var side = (String(card.id || '').split('_')[1]) || 'p';
    var hero = (typeof G !== 'undefined' && G.team && G.team[side] || []).find(function(h) { return h && h.id === id; });
    if (!hero) return;
    card.dataset.bfGear = '1';
    var items = [];
    var w = hero.mwep || hero.rwep;
    if (w) items.push(w);
    if (hero.armor) items.push(hero.armor);
    if (!items.length) return;
    var gearByName = window.__bfGearArtByName || {};
    var row = document.createElement('div');
    row.className = 'bf-battle-gear';
    items.forEach(function(it) {
      var url = gearByName[it.name];
      if (!url) return;
      var icon = document.createElement('div');
      icon.className = 'bf-gear-icon';
      icon.title = it.name;
      icon.style.backgroundImage = 'url("' + url + '")';
      row.appendChild(icon);
    });
    if (row.children.length) card.appendChild(row);
  }

  function playHeroFx(card, type, value) {
    if (!card || !card.isConnected) return;
    var cls = type === 'heal' || type === 'revive' ? 'bf-fx-heal' : (type === 'paralyze' ? 'bf-fx-paralyze' : 'bf-fx-damage');
    card.classList.remove('bf-fx-damage', 'bf-fx-heal', 'bf-fx-paralyze');
    void card.offsetWidth;
    card.classList.add(cls);
    setTimeout(function() { card.classList.remove(cls); }, 760);

    if (type === 'damage') {
      var big = Math.abs(value || 0) >= 18 ? '<div class="bf-fx-bigblast"></div>' : '';
      addOverlayFx(card, big + '<div class="bf-fx-slash"></div><div class="bf-fx-float bf-fx-dmg">-' + Math.abs(value || 0) + '</div>', 950);
    } else if (type === 'heal') {
      addOverlayFx(card, '<div class="bf-fx-heal-ring"></div><div class="bf-fx-float bf-fx-heal-txt">+' + Math.abs(value || 0) + '</div>', 950);
    } else if (type === 'revive') {
      card.classList.remove('bf-dead');
      addOverlayFx(card, '<div class="bf-fx-phoenix">🔥</div><div class="bf-fx-float bf-fx-heal-txt">REVIVE</div>', 1100);
    } else if (type === 'death') {
      // Second fall (was already elite) => permanent death with gravestone.
      // First fall => the game itself revives it in elite form (handled by class watch).
      if (card.classList.contains('bf-auto-elite') || card.classList.contains('elite-mode')) {
        playTrueDeath(card);
      } else {
        card.classList.add('bf-dead');
        addOverlayFx(card, '<div class="bf-fx-death-smoke"></div><div class="bf-fx-skull">💀</div>', 1150);
      }
    } else {
      addOverlayFx(card, '<div class="bf-fx-bolt">⚡</div><div class="bf-fx-float bf-fx-status-txt">PARALIZADO</div>', 950);
    }
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
    var color = st === 'sleeping' ? '#8aaaff' : '#c79bff';
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
    p.style.left = from.x + 'px';
    p.style.top = from.y + 'px';
    p.style.color = color || (kind === 'arrow' ? '#c6ff8a' : '#ffe49a');
    var ang = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
    p.style.transform = 'translate(-50%,-50%) rotate(' + ang + 'deg)';
    document.body.appendChild(p);
    requestAnimationFrame(function() { p.style.left = to.x + 'px'; p.style.top = to.y + 'px'; });
    setTimeout(function() { if (p.parentNode) p.parentNode.removeChild(p); }, 430);
  }

  function launchMagic(from, to, el) {
    if (!from || !to) return;
    var orb = document.createElement('div');
    orb.className = 'bf-fx-magic-orb';
    orb.style.color = elementColor(el);
    orb.style.left = from.x + 'px';
    orb.style.top = from.y + 'px';
    document.body.appendChild(orb);
    requestAnimationFrame(function() { orb.style.left = to.x + 'px'; orb.style.top = to.y + 'px'; orb.style.transform = 'scale(1.35)'; });
    setTimeout(function() { if (orb.parentNode) orb.parentNode.removeChild(orb); }, 560);
  }

  function enhanceCombatEvent(ev) {
    if (!ev || !ev.k) return;
    if (ev.k === 'arrow') {
      launchProjectile(targetCenter(ev.fromSide, ev.fromId), targetCenter(ev.toSide, ev.toId), 'arrow', '#c6ff8a');
      return;
    }
    if (ev.k === 'hit') {
      var card = getBattleCard(ev.side, ev.id);
      if (!card) return;
      if (ev.dtype === 'ranged') addOverlayFx(card, '<div class="bf-fx-bigblast"></div>', 740);
      if (ev.dtype === 'spell') addOverlayFx(card, '<div class="bf-fx-spell-wave" style="color:#c79bff"></div>', 780);
      if (Number(ev.dmg || 0) >= 22) addOverlayFx(card, '<div class="bf-fx-bigblast"></div><div class="bf-fx-float bf-fx-dmg">CRÍTICO</div>', 950);
      return;
    }
    if (ev.k === 'spell') {
      var target = getBattleCard(ev.toSide, ev.toId);
      if (!target) return;
      var actor = document.querySelector('.bhero.active-turn') || target;
      launchMagic(cardCenter(actor), cardCenter(target), ev.el);
      addOverlayFx(target, '<div class="bf-fx-spell-wave" style="color:' + elementColor(ev.el) + '"></div>', 820);
      return;
    }
    if (ev.k === 'death') {
      var dead = getBattleCard(ev.side, ev.id);
      playHeroFx(dead, 'death');
      bfGuideReact('shock', '¡OH NO!');
      return;
    }
    if (ev.k === 'elite') {
      transformHeroToElite(getBattleCard(ev.side, ev.id));
      bfGuideReact('wow', '¡RENACE!');
      return;
    }
    if (ev.k === 'heal') {
      var healed = getBattleCard(ev.side, ev.id);
      if (healed && healed.classList.contains('bf-dead')) playHeroFx(healed, 'revive', ev.amt);
      return;
    }
    if (ev.k === 'manaup' || ev.k === 'shieldup' || ev.k === 'wardup') {
      var buff = getBattleCard(ev.side || ev.toSide, ev.id || ev.toId);
      if (buff) addOverlayFx(buff, '<div class="bf-fx-elite-aura"></div>', 900);
    }
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

  function patchGameRules() {
    if (window.__bfRulesPatched || typeof HEROES === 'undefined' || typeof BONUS === 'undefined' || typeof G === 'undefined') return;
    window.__bfRulesPatched = true;

    // Updated "how to play" rules, in plain language, including the new rules
    // (6 candidates per auction, Epic offers, epic cost +10).
    if (typeof window.rulesBody === 'function' && !window.rulesBody.__bf) {
      window.rulesBody = function() {
        return '<div class="rules-body">' +
          '<p><b>🎯 Objetivo:</b> arma un equipo de <b>3 héroes</b> y derrota a los 3 del rival.</p>' +
          '<p><b>1 · Subasta (3 fases).</b> Una para cuerpo a cuerpo, otra para distancia y otra para magia. En cada fase verás <b>6 héroes</b> y eliges uno con una <b>puja sellada</b> (a ciegas): quien ofrezca más se lo lleva. Cada ronda trae un <b>bonificador</b> distinto (más monedas, o un castigo para el rival). Las monedas que no gastes pasan al Equipamiento.</p>' +
          '<p><b>✦ Cartas Épicas.</b> Son las más poderosas y cuestan <b>+10 monedas</b>. Normalmente no aparecen en la subasta, pero ciertos bonificadores pueden hacer que <b>tú</b> (o tu <b>rival</b>) reciba una oferta Épica extra en esa puja.</p>' +
          '<p><b>2 · Equipamiento.</b> Con las monedas sobrantes (+ una base) equipas a cada héroe con <b>1 arma</b> (cuerpo a cuerpo <i>o</i> distancia) y <b>1 armadura</b>. Los hechizos y objetos van a tu <b>mano</b> para usarlos en combate.</p>' +
          '<p><b>3 · Combate por rondas.</b> Los turnos van en este orden: <b>distancia → hechizos → cuerpo a cuerpo</b> (si empatan, actúa antes quien tenga más velocidad).</p>' +
          '<ul>' +
            '<li><b style="color:#ff8888">Cuerpo a cuerpo:</b> el daño es tu CC más el arma equipada.</li>' +
            '<li><b style="color:#88ff88">A distancia:</b> necesitas un arma; el daño depende de su potencia y de tu AD.</li>' +
            '<li><b style="color:#8899ff">Hechizos:</b> dependen de tu HE y gastan <b>maná</b>. Tienes una reserva fija para toda la batalla que <b>no se regenera</b>: recupérala con Cristal u Orbe de Maná.</li>' +
          '</ul>' +
          '<p><b>🛡️ Armaduras:</b> reducen el daño de golpes, disparos y hechizos. Las <b>elementales</b> anulan por completo su elemento contrario (agua↔fuego, rayo↔agua, hielo↔rayo, fuego↔hielo). La <b>Barrera Arcana</b> protege del daño mágico.</p>' +
          '<p><b style="color:#ffaa00">⭐ Forma Élite:</b> cuando un héroe cae por primera vez, <b>renace</b> con parte de su vida y stats mejorados, según su raza (los No-muertos renacen con más). Si vuelve a caer, muere de verdad (salvo que uses Pluma o Ave Fénix).</p>' +
          '<p><b>Cada acción pasa el turno.</b> Consulta también las <span class="rules-link" onclick="racesModal()">🧬 razas</span>.</p>' +
        '</div>';
      };
      window.rulesBody.__bf = 1;
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

    // Force at least 6 candidates per auction round. The base game draws one
    // hero per available race; we top it up with extra heroes from the pool.
    var TARGET_CANDS = 6;
    if (typeof window.drawRaceSlate === 'function' && !window.drawRaceSlate.__bf6) {
      var originalDrawRaceSlate = window.drawRaceSlate;
      window.drawRaceSlate = function(pool) {
        var out = originalDrawRaceSlate.apply(this, arguments) || [];
        if (out.length >= TARGET_CANDS) return out;
        var chosen = {};
        out.forEach(function(h) { if (h) chosen[h.id] = true; });
        var rest = (pool || []).filter(function(h) { return h && !chosen[h.id]; });
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

    function findHero(heroId) {
      var lists = [G.cands || []];
      if (G.epicCands) lists = lists.concat(Object.values(G.epicCands));
      lists.push(HEROES || []);
      for (var i = 0; i < lists.length; i++) {
        var found = (lists[i] || []).find(function(h) { return h && h.id === heroId; });
        if (found) return found;
      }
      return null;
    }

    function adjustBid(side, heroId, amount) {
      var h = findHero(heroId);
      if (!h) return amount;
      var coins = Number((G.coins && G.coins[side]) || 0);
      if (coins < h.cost) return null;
      return Math.min(coins, Math.max(Number(amount || 0), h.cost));
    }

    function patchBidInputs() {
      var all = (G.cands || []).slice();
      if (G.epicCands) Object.values(G.epicCands).forEach(function(list) { all = all.concat(list || []); });
      all.forEach(function(h) {
        var inp = document.getElementById('bid_' + h.id);
        if (!inp) return;
        inp.min = String(h.cost);
        var current = parseInt(inp.value || '0', 10) || 0;
        if (current < h.cost) inp.value = String(Math.min(h.cost, Number((G.coins && (G.coins.p || G.coins.o)) || h.cost)));
      });
    }

    function epicPoolForCurrentType() {
      // Derive the auction's type from the candidates themselves so we never
      // depend on the exact name of the game's internal phase-type field.
      var type = (G.cands && G.cands[0] && G.cands[0].type) || G.curType || G.phaseType || G.auctType;
      var usedIds = {};
      ['p','o'].forEach(function(side) { (G.team && G.team[side] || []).forEach(function(h) { usedIds[h.id] = true; }); });
      (G.cands || []).forEach(function(h) { if (h) usedIds[h.id] = true; });
      var pool = HEROES.filter(function(h) { return h.clan === 'Épicas' && (!type || h.type === type) && !usedIds[h.id]; });
      // Fallback: if no epic matches this type, allow any unused epic.
      if (!pool.length) pool = HEROES.filter(function(h) { return h.clan === 'Épicas' && !usedIds[h.id]; });
      return pool;
    }

    function prepareEpicOffers() {
      G.epicCands = {};
      if (!G.forceEpic) return;
      var baseCands = (G.cands || []).slice();
      ['p','o'].forEach(function(side) {
        if (!G.forceEpic[side]) return;
        var pool = epicPoolForCurrentType();
        if (!pool.length) return;
        var h = pool[Math.floor(Math.random() * pool.length)];
        // This side sees the normal candidates PLUS one epic hero. The other
        // side keeps seeing only G.cands (without this epic).
        G.epicCands[side] = baseCands.concat([h]);
      });
      G.forceEpic = {};
    }

    var originalApplyBonus = window.applyBonus;
    window.applyBonus = function(side, b) {
      if (!G.forceEpic) G.forceEpic = {};
      if (b && b.id === 'epic_self') G.forceEpic[side] = true;
      if (b && b.id === 'epic_rival') G.forceEpic[other(side)] = true;
      return originalApplyBonus.apply(this, arguments);
    };

    function epicBonusById(id) {
      return (BONUS || []).find(function(b) { return b && b.id === id; }) || null;
    }

    // After the game picks the round bonus, sometimes swap it for one of the
    // two epic bonus cards so they actually show up during play.
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

    var originalStartAuctionPhase = window.startAuctionPhase;
    window.startAuctionPhase = function() {
      if (G.pools) {
        ['CC','AD','HE'].forEach(function(t) {
          G.pools[t] = (G.pools[t] || []).filter(function(h) { return h.clan !== 'Épicas'; });
        });
      }
      var ret = originalStartAuctionPhase.apply(this, arguments);
      // The original just set G.bonus + called applyBonus. Re-roll for epics and,
      // if we swapped, re-apply the (now epic) bonus so its effect/flags trigger.
      var before = { p: G.bonus && G.bonus.p, o: G.bonus && G.bonus.o };
      maybeForceEpicBonus();
      ['p','o'].forEach(function(side) {
        if (G.bonus && G.bonus[side] !== before[side] && typeof window.applyBonus === 'function') {
          window.applyBonus(side, G.bonus[side]);
        }
      });
      return ret;
    };

    function humanSide() {
      if (typeof NET !== 'undefined' && NET.role === 'client' && NET.mySide) return NET.mySide;
      return 'p';
    }

    var originalBeginBidRound = window.beginBidRound;
    window.beginBidRound = function() {
      var ret = originalBeginBidRound.apply(this, arguments);
      prepareEpicOffers();
      // Re-render the human's recruit screen so their epic (if any) shows up,
      // and the rival's epic does NOT appear on the human's board.
      renderRecruit(humanSide());
      if (typeof NET !== 'undefined' && NET.role !== 'client') {
        netSync('s-recruit');
      }
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

    var originalSubmitBid = window.submitBid;
    window.submitBid = function(side, heroId) {
      var inp = document.getElementById('bid_' + heroId);
      var raw = inp ? (parseInt(inp.value || '0', 10) || 0) : 0;
      var amt = adjustBid(side, heroId, raw);
      var h = findHero(heroId);
      if (amt === null) {
        if (window.notif && h) notif('Necesitas al menos ' + h.cost + ' monedas para pujar por ' + h.name + '.');
        return;
      }
      if (inp) inp.value = String(amt);
      return originalSubmitBid.apply(this, arguments);
    };

    var originalNetBid = window.netBid;
    window.netBid = function(heroId, amount) {
      var amt = adjustBid('o', heroId, amount);
      if (amt === null) return netPass();
      return originalNetBid.call(this, heroId, amt);
    };

    var originalAiBid = window.aiBid;
    window.aiBid = function(side) {
      var saved = G.cands;
      if (G.epicCands && G.epicCands[side]) G.cands = G.epicCands[side];
      originalAiBid.apply(this, arguments);
      var bid = G.bids && G.bids[side];
      if (bid && !bid.pass) {
        var amt = adjustBid(side, bid.heroId, bid.amount);
        if (amt === null) G.bids[side] = { pass: true };
        else G.bids[side].amount = amt;
      }
      G.cands = saved;
    };

    var originalResolveBidRound = window.resolveBidRound;
    window.resolveBidRound = function() {
      ['p','o'].forEach(function(side) {
        var bid = G.bids && G.bids[side];
        if (!bid || bid.pass) return;
        var amt = adjustBid(side, bid.heroId, bid.amount);
        if (amt === null) G.bids[side] = { pass: true };
        else G.bids[side].amount = amt;
      });
      return originalResolveBidRound.apply(this, arguments);
    };

    // Slow down the combat pacing a touch so the (now bigger) animations are
    // easier to follow. We add a short pause before each turn transition.
    if (typeof window.endTurn === 'function' && !window.endTurn.__bfSlow) {
      var originalEndTurn = window.endTurn;
      window.endTurn = function() {
        var args = arguments, self = this;
        setTimeout(function() { originalEndTurn.apply(self, args); }, 520);
      };
      window.endTurn.__bfSlow = 1;
    }
    if (typeof window.finishAct === 'function' && !window.finishAct.__bfSlow) {
      var originalFinishAct = window.finishAct;
      window.finishAct = function() {
        var args = arguments, self = this;
        setTimeout(function() { originalFinishAct.apply(self, args); }, 360);
      };
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
      var names = Object.keys(CLAN_PROFILE);
      var rows = names.map(function(name) {
        var p = CLAN_PROFILE[name];
        var col = (typeof CLAN_COLORS !== 'undefined' && CLAN_COLORS[name]) || '#ffd24a';
        var sigil = RACE_SIGILS[name] || '◆';
        return '<div class="bf-race-card" style="--race:' + col + '">' +
          '<div class="bf-race-sigil-big">' + clean(sigil) + '</div>' +
          '<div class="bf-race-title">' + clean(name) + '</div>' +
          '<div class="bf-race-trait">' + clean(p.trait) + '</div>' +
          '<div class="bf-race-desc">' + clean(p.desc) + '</div>' +
          '<div class="bf-race-stats">Élite ' + Math.round(p.eliteHpPct * 100) + '% · CC ' + fmt(p.mMelee) + ' · AD ' + fmt(p.mRanged) + ' · HE ' + fmt(p.mSpell) + ' · Vel ' + fmt(p.mVel) + ' · Maná ' + fmt(p.manaBonus) + ' · Res.F ' + fmt(p.resPhys) + ' · Res.M ' + fmt(p.resMagic) + '</div>' +
        '</div>';
      }).join('');
      modal('<h3>🧬 Razas y símbolos</h3><div class="modal-note">Cada héroe lleva ahora su sigilo de raza directamente sobre la ilustración.</div><div class="bf-race-list">' + rows + '</div>');
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
    function findHero(side, heroId) {
      return ((G.team && G.team[side]) || []).find(function(h) { return h && h.id === heroId; });
    }
    function closeAnyModal() {
      var close = document.querySelector('.modal-close, .modal-x, [onclick="closeModal()"]');
      if (close) close.click();
      else if (typeof window.closeModal === 'function') closeModal();
    }

    // Game-styled confirmation dialog. Calls onYes() if the player confirms.
    // artUrl is optional (used for the preview banner).
    function bfConfirm(opts, onYes) {
      var item = opts.item;
      if (!item) return;
      var cost = Number(item.cost || 0);
      var coins = Number((G.equipCoins && G.equipCoins[opts.side]) || 0);
      if (coins < cost) {
        if (window.notif) notif('No tienes monedas suficientes para comprar ' + item.name + '.');
        return;
      }
      var existing = document.getElementById('bf-confirm-overlay');
      if (existing) existing.remove();
      var no = numFor(item);
      var target = opts.hero ? ' y equiparlo a <b>' + clean(opts.hero.name) + '</b>' : '';
      var effectTxt = item.txt || item.desc || '';
      var overlay = document.createElement('div');
      overlay.id = 'bf-confirm-overlay';
      overlay.className = 'bf-confirm-overlay';
      overlay.innerHTML =
        '<div class="bf-confirm-box">' +
          (opts.art ? '<div class="bf-confirm-art" style="--bf-cart:url(&quot;' + opts.art + '&quot;)"><div class="bf-confirm-art-fill"></div><div class="bf-confirm-art-sharp"></div><div class="bf-confirm-cost">' + cost + '</div><div class="bf-confirm-num">Nº ' + String(no || 0).padStart(3, '0') + '</div></div>' : '') +
          '<div class="bf-confirm-body">' +
            '<div class="bf-confirm-name">' + clean(item.name) + '</div>' +
            (effectTxt ? '<div class="bf-confirm-effect">' + clean(effectTxt) + '</div>' : '') +
            '<div class="bf-confirm-msg">¿Comprar por <b>' + cost + ' monedas</b>' + target + '?</div>' +
            '<div class="bf-confirm-actions">' +
              '<button class="bf-confirm-btn bf-confirm-no" id="bf-confirm-no">Cancelar</button>' +
              '<button class="bf-confirm-btn bf-confirm-yes" id="bf-confirm-yes">Comprar</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);
      function close() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }
      overlay.querySelector('#bf-confirm-no').onclick = close;
      overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
      overlay.querySelector('#bf-confirm-yes').onclick = function() { close(); onYes(); };
    }

    function indexInList(list, id) {
      for (var i = 0; i < (list || []).length; i++) { if (list[i] && list[i].id === id) return i; }
      return -1;
    }

    var originalBuySpell = window.buySpell;
    window.buySpell = function(side, id) {
      var item = typeof byId === 'function' ? byId(SPELLS, id) : null;
      if (!item) return;
      var art = (SPELL_ART[indexInList(SPELLS, id)] || NUM_ART[String(numFor(item))]) || '';
      bfConfirm({ item: item, side: side, art: art }, function() { originalBuySpell(side, id); bfGuideApprovePurchase(item); });
    };

    var originalBuyObject = window.buyObject;
    window.buyObject = function(side, id) {
      var item = typeof byId === 'function' ? byId(OBJECTS, id) : null;
      if (!item) return;
      var art = (OBJECT_ART[indexInList(OBJECTS, id)] || NUM_ART[String(numFor(item))]) || '';
      bfConfirm({ item: item, side: side, art: art }, function() { originalBuyObject(side, id); bfGuideApprovePurchase(item); });
    };

    var originalDoAssign = window.doAssign;
    window.doAssign = function(side, heroId) {
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
    function decorateSlotByName(html, name, art) {
      if (!name || !art) return html;
      var thumb = '<div class="bf-slot-thumb" style="background-image:url(&quot;' + art + '&quot;)"></div>';
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
        html = html.replace(/<div class="eq-hero([^"]*)"/, '<div class="eq-hero bf-eq-hero-with-art$1"');
        html = html.replace(/(<div class="eq-hero[^>]*>)/, '$1<div class="bf-eq-hero-art" style="background-image:url(&quot;' + url + '&quot;)"></div>');
      }
      // Equipped weapon thumbnail
      var weapon = h.mwep || h.rwep;
      if (weapon && byName[weapon.name]) html = decorateSlotByName(html, weapon.name, byName[weapon.name].art);
      // Equipped armor thumbnail
      if (h.armor && byName[h.armor.name]) html = decorateSlotByName(html, h.armor.name, byName[h.armor.name].art);
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
            if (it && it.name) byName[it.name] = { id: it.id, art: shopArt(kind, i), kind: kind, txt: it.txt || '' };
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
          // Card name (stylized) over the image.
          if (nameEl) {
            var nm = document.createElement('div');
            nm.className = 'bf-shop-name';
            nm.textContent = nameEl.textContent.trim();
            card.appendChild(nm);
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
            btn.setAttribute('onclick', 'event.stopPropagation();bfShopBuy(&quot;' + side + '&quot;,&quot;' + meta.kind + '&quot;,&quot;' + id + '&quot;)');
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
      var existing = document.getElementById('bf-confirm-overlay');
      if (existing) existing.remove();
      var overlay = document.createElement('div');
      overlay.id = 'bf-confirm-overlay';
      overlay.className = 'bf-confirm-overlay';
      overlay.innerHTML =
        '<div class="bf-confirm-box">' +
          '<div class="bf-confirm-body">' +
            '<div class="bf-confirm-name" style="margin-top:14px">' + title + '</div>' +
            '<div class="bf-confirm-msg">' + message + '</div>' +
            '<div class="bf-confirm-actions">' +
              '<button class="bf-confirm-btn bf-confirm-no" id="bf-confirm-no">Volver a equipar</button>' +
              '<button class="bf-confirm-btn bf-confirm-yes" id="bf-confirm-yes">Entrar igual</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);
      function close() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }
      overlay.querySelector('#bf-confirm-no').onclick = close;
      overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
      overlay.querySelector('#bf-confirm-yes').onclick = function() { close(); onYes(); };
    }

    if (typeof window.eqDone === 'function' && !window.eqDone.__bfWarn) {
      var originalEqDone = window.eqDone;
      window.eqDone = function(side) {
        if (G.demoExample) return originalEqDone.apply(this, arguments);
        var mySide = (NET.role === 'client') ? NET.mySide : (side || G.eqSide);
        var warns = equipWarnings(mySide);
        if (warns.length && !G.__bfAdWarnAck) {
          bfWarnConfirm(
            '⚠️ Equipamiento incompleto',
            'Hay héroes sin equipamiento completo:<br><br>' + warns.join('<br>') + '<br><br>¿Entrar en batalla de todos modos?',
            function() { G.__bfAdWarnAck = true; window.eqDone(side); }
          );
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
    if (__bfHandArtByName) return __bfHandArtByName;
    if (typeof SPELLS === 'undefined' || typeof OBJECTS === 'undefined') return null;
    var map = {};
    (SPELLS || []).forEach(function(s, i) { if (s && s.name && SPELL_ART[i]) map[s.name] = SPELL_ART[i]; });
    (OBJECTS || []).forEach(function(o, i) { if (o && o.name && OBJECT_ART[i]) map[o.name] = OBJECT_ART[i]; });
    __bfHandArtByName = map;
    return map;
  }

  // Build a name -> item lookup for spells/objects, so we can read each card's
  // effect (damage / heal / mana / etc.) and show it on the hand card.
  var __bfHandItemByName = null;
  function handItemByName() {
    if (__bfHandItemByName) return __bfHandItemByName;
    if (typeof SPELLS === 'undefined' || typeof OBJECTS === 'undefined') return null;
    var map = {};
    (SPELLS || []).forEach(function(s) { if (s && s.name) map[s.name] = { item: s, kind: 'spell' }; });
    (OBJECTS || []).forEach(function(o) { if (o && o.name) map[o.name] = { item: o, kind: 'object' }; });
    __bfHandItemByName = map;
    return map;
  }

  // Short, battle-useful summary of what a card does (damage / heal / effect).
  function handCardSummary(found) {
    if (!found || !found.item) return '';
    var it = found.item;
    var parts = [];
    var dmg = it.dmg != null ? it.dmg : (it.damage != null ? it.damage : (it.power != null ? it.power : null));
    var heal = it.heal != null ? it.heal : (it.hp != null ? it.hp : null);
    var manaGain = it.manaGain != null ? it.manaGain : (it.giveMana != null ? it.giveMana : null);
    var manaCost = it.mana != null ? it.mana : (it.manaCost != null ? it.manaCost : null);
    if (dmg) parts.push('💥 ' + dmg + ' daño');
    if (heal) parts.push('💚 +' + heal + ' vida');
    if (manaGain) parts.push('🔷 +' + manaGain + ' maná');
    if (found.kind === 'spell' && manaCost) parts.push('coste ' + manaCost);
    // If nothing numeric was found, fall back to the card's own short text.
    if (!parts.length) {
      var txt = it.txt || it.desc || '';
      return txt.length > 46 ? txt.slice(0, 44) + '…' : txt;
    }
    return parts.join(' · ');
  }

  function injectHandArt() {
    var map = handArtByName();
    if (!map) return;
    document.querySelectorAll('.chip-spell, .chip-object').forEach(function(chip) {
      if (chip.dataset.bfHandArt === '1') return;
      // The chip text is the item name plus the "×" remove button — read the
      // leading text node only.
      var name = (chip.childNodes[0] && chip.childNodes[0].textContent || '').trim();
      var url = map[name];
      if (!url) return;
      chip.dataset.bfHandArt = '1';
      chip.classList.add('bf-chip-card');
      chip.title = name;
      // Hide the chip's own text nodes (the name) without removing the original
      // remove button (which carries the onclick to discard the card).
      for (var n = 0; n < chip.childNodes.length; n++) {
        var node = chip.childNodes[n];
        if (node.nodeType === 3) node.textContent = '';
      }
      // Reposition the existing remove button ("×") to the card corner.
      var removeBtn = chip.querySelector('button, .chip-x, span[onclick]');
      if (removeBtn) removeBtn.classList.add('bf-chip-x');
      // Blurred fill (hides white borders) + the whole card shown with "contain".
      var art = document.createElement('div');
      art.className = 'bf-chip-art-layer';
      art.style.backgroundImage = 'url("' + url + '")';
      var fill = document.createElement('div');
      fill.className = 'bf-chip-fill';
      fill.style.backgroundImage = 'url("' + url + '")';
      chip.insertBefore(art, chip.firstChild);
      chip.insertBefore(fill, chip.firstChild);
      // Card name label on top of the art (so the player can identify it).
      var nm = document.createElement('div');
      nm.className = 'bf-chip-name';
      nm.textContent = name;
      chip.appendChild(nm);
      // Effect line (damage / heal / mana / short text) at the bottom — most
      // useful during battle so the player knows what each card does.
      var items = handItemByName();
      var found = items ? items[name] : null;
      var summary = handCardSummary(found);
      if (summary) {
        var info = document.createElement('div');
        info.className = 'bf-chip-info';
        info.textContent = summary;
        chip.appendChild(info);
        chip.classList.add('bf-chip-has-info');
      }
    });
  }

  function injectRecruitHeroArt() {
    document.querySelectorAll('.hero-acquired').forEach(function(card) {
      if (card.dataset.bfAcqArt === '1') return;
      var on = card.getAttribute('onclick') || '';
      var hit = on.split("heroInfo('")[1];
      var id = hit ? hit.split("'")[0] : '';
      var url = id ? ART_BY_ID[id] : null;
      if (!url) return;
      var thumb = document.createElement('div');
      thumb.className = 'bf-acq-thumb';
      thumb.style.backgroundImage = 'url("' + url + '")';
      card.insertBefore(thumb, card.firstChild);
      card.dataset.bfAcqArt = '1';
    });
    document.querySelectorAll('.pr-got').forEach(function(row) {
      if (row.dataset.bfResultArt === '1') return;
      var b = row.querySelector('b');
      if (!b) return;
      var url = ART_BY_NAME[b.textContent.trim()];
      if (!url) return;
      var thumb = document.createElement('span');
      thumb.className = 'bf-result-thumb';
      thumb.style.backgroundImage = 'url("' + url + '")';
      row.insertBefore(thumb, row.firstChild);
      row.dataset.bfResultArt = '1';
    });
  }

  // ---- Replace title emoji row with custom icon images ----
  function injectTitleIcons() {
    var row = document.querySelector('.title-emoji');
    if (!row || row.dataset.bfIconsDone === '1') return;
    row.dataset.bfIconsDone = '1';
    var icons = [
      { cls: 'bf-icon-cc', src: ICON_CC, label: 'CC' },
      { cls: 'bf-icon-ad', src: ICON_AD, label: 'AD' },
      { cls: 'bf-icon-he', src: ICON_HE, label: 'HE' },
    ];
    var container = document.createElement('div');
    container.className = 'bf-title-icons';
    icons.forEach(function(ic) {
      var div = document.createElement('div');
      div.className = 'bf-title-icon ' + ic.cls;
      var img = document.createElement('img');
      img.src = ic.src;
      img.alt = ic.label;
      div.appendChild(img);
      container.appendChild(div);
    });
    row.parentNode.insertBefore(container, row);
  }

  var GUIDE_IMG = "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/292c04262_generated_image.png";
  // Punkito's other looks: élite (Harley, battle-only) + reaction faces.
  var GUIDE_ELITE_IMG = "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/d7e007cd6_generated_image.png";
  var GUIDE_FACE = { wow: "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/e5071f94c_generated_image.png", cheer: "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/51ec29abd_generated_image.png", shock: "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/63a162077_generated_image.png" };

  // Battle screen active? Punkito rides his Harley (élite look) only in battle.
  function bfInBattle() { var b = document.getElementById('s-battle'); return !!(b && b.classList.contains('active')); }
  // Idle look Punkito returns to: élite (Harley) in battle, normal elsewhere.
  function bfGuideBaseImg() { return bfInBattle() ? GUIDE_ELITE_IMG : GUIDE_IMG; }

  // Make Punkito react: swap to an expression face, animate + float a word,
  // then settle back. Reactions don't stack. type: 'cheer' | 'wow' | 'shock'.
  function bfGuideReact(type, word) {
    var wrap = document.getElementById('bf-guide');
    if (!wrap || window.__bfGuideHidden) return;
    var charEl = wrap.querySelector('.bf-guide-char');
    var img = charEl && charEl.querySelector('img');
    if (!charEl || !img || charEl.dataset.bfReacting === '1') return;
    charEl.dataset.bfReacting = '1';
    var animMap = { cheer: 'bf-react-cheer', wow: 'bf-react-wow', shock: 'bf-react-shock' };
    img.src = GUIDE_FACE[type] || GUIDE_FACE.wow;
    charEl.classList.remove('bf-react-cheer', 'bf-react-wow', 'bf-react-shock');
    void charEl.offsetWidth;
    charEl.classList.add(animMap[type] || 'bf-react-wow');
    if (!charEl.querySelector('.bf-guide-spark')) { var spark = document.createElement('div'); spark.className = 'bf-guide-spark'; charEl.insertBefore(spark, charEl.firstChild); }
    if (word) {
      var pop = document.createElement('div');
      pop.className = 'bf-guide-pop' + (type === 'shock' ? ' bf-pop-shock' : '');
      pop.textContent = word; charEl.appendChild(pop);
      setTimeout(function() { if (pop.parentNode) pop.remove(); }, 1700);
    }
    setTimeout(function() {
      charEl.classList.remove('bf-react-cheer', 'bf-react-wow', 'bf-react-shock');
      img.src = bfGuideBaseImg(); charEl.dataset.bfReacting = '';
    }, 2300);
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

  // Detect strong battle/equip events and trigger a Punkito reaction. Watches:
  // hero deaths (shock), revive/phoenix (wow), epic bonus appearing (wow).
  function bfWatchGuideEvents() {
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card) {
      var hp = readHeroHp(card);
      if (hp === null) return;
      if (card.dataset.bfGuideHp !== undefined) {
        var old = parseInt(card.dataset.bfGuideHp, 10);
        if (!isNaN(old) && old > 0 && hp <= 0) bfGuideReact('shock', '¡OH NO!');
        else if (!isNaN(old) && old <= 0 && hp > 0) bfGuideReact('wow', '¡REVIVE!');
      }
      card.dataset.bfGuideHp = String(hp);
    });
    var bonusName = '';
    document.querySelectorAll('.hand-lbl').forEach(function(lbl) {
      if (!/Bonificador de esta ronda/i.test(lbl.textContent)) return;
      var chip = lbl.nextElementSibling;
      while (chip && (!chip.classList || !chip.classList.contains('chip'))) chip = chip.nextElementSibling;
      if (chip) bonusName = chip.textContent.trim();
    });
    if (bonusName && bonusName !== window.__bfGuideBonus) {
      window.__bfGuideBonus = bonusName;
      if (/Épic|Convocatoria|Destino/i.test(bonusName)) bfGuideReact('wow', '¡ÉPICO!');
    }
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
      return { t: '¡Hola, aventurero!', m: 'Soy <b>Punkito</b>, tu guía. Pulsa <b>Jugar</b> para empezar. Te explicaré cada paso.' };
    }
    if (id === 's-equip') {
      return { t: 'Fase de Equipamiento', m: 'Para equipar un arma o armadura: <b>1)</b> pulsa la carta de la tienda para <b>seleccionarla</b>, <b>2)</b> luego pulsa <b>«Comprar»</b> en el héroe al que se la quieras poner. Los hechizos y objetos van a tu <b>mano</b>. Cuando termines, pulsa <b>«Listo — a la batalla»</b>.' };
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
      return { t: 'Fase de Subasta', m: 'Mira los <b>6 héroes</b> y haz una <b>puja sellada</b> por el que quieras. Quien ofrezca más se lo lleva. ¡No gastes todas las monedas!' };
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

    wrap.querySelector('.bf-guide-x').addEventListener('click', function() {
      window.__bfGuideHidden = true;
      wrap.classList.add('bf-guide-hidden');
      show.classList.add('bf-guide-visible');
    });
    show.addEventListener('click', function() {
      window.__bfGuideHidden = false;
      wrap.classList.remove('bf-guide-hidden');
      show.classList.remove('bf-guide-visible');
    });
  }

  function updateGuide() {
    ensureGuide();
    var wrap = document.getElementById('bf-guide');
    if (!wrap) return;
    if (window.__bfGuideHidden) return;
    var active = document.querySelector('.screen.active');
    var id = active ? active.id : 's-title';
    var msg = guideMessageFor(id, active);
    if (!msg) return;
    var key = id + '|' + msg.t;
    if (wrap.dataset.bfMsgId === key) return;
    wrap.dataset.bfMsgId = key;
    wrap.querySelector('.bf-guide-title').innerHTML = msg.t;
    wrap.querySelector('.bf-guide-text').innerHTML = msg.m;
  }

  // ---- (A) Active hero's action panel: their own AI battle art as background,
  // plus a banner showing their name + ability right in the panel ----
  function bfActiveHero() {
    var card = document.querySelector('.bhero.active-turn');
    if (!card) return null;
    var id = heroIdFromCard(card);
    var side = (String(card.id || '').split('_')[1]) || 'p';
    var hero = (typeof G !== 'undefined' && G.team && G.team[side] || []).find(function(h) { return h && h.id === id; });
    return hero ? { hero: hero, id: id, side: side, card: card } : { hero: null, id: id, side: side, card: card };
  }

  function bfEsc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[ch];
    });
  }

  function injectActionPanelBg() {
    var battle = document.getElementById('s-battle');
    if (!battle || !battle.classList.contains('active')) return;
    // Find the action buttons panel (contains the turn actions). We locate the
    // closest container that holds action buttons like Atacar/Hechizo/Objeto/Pasar.
    var btns = battle.querySelectorAll('button');
    var host = null;
    for (var i = 0; i < btns.length; i++) {
      var t = (btns[i].textContent || '').trim();
      if (/Atacar|Hechizo|Objeto|Pasar turno|Pasar/i.test(t)) { host = btns[i].parentElement; break; }
    }
    if (!host) return;
    host.classList.add('bf-action-host');
    var bg = host.querySelector('.bf-action-bg');
    if (!bg) {
      bg = document.createElement('div');
      bg.className = 'bf-action-bg';
      host.insertBefore(bg, host.firstChild);
    }

    // Resolve the active hero so we can use their portrait + ability.
    var active = bfActiveHero();
    var hero = active && active.hero;
    var elite = active && active.card && (active.card.classList.contains('elite-mode') || active.card.classList.contains('bf-auto-elite'));
    // Background = the active hero's battle art (elite art when in elite form),
    // falling back to the generic battle background.
    var artUrl = ACTION_BG;
    if (active && active.id) {
      artUrl = (elite ? (ELITE_BY_ID[active.id] || ART_BY_ID[active.id]) : ART_BY_ID[active.id]) || ACTION_BG;
    }
    if (host.dataset.bfActionArt !== artUrl) {
      bg.style.setProperty('--bf-action-art', 'url("' + artUrl + '")');
      host.dataset.bfActionArt = artUrl;
    }

    // Banner with the active hero's name + ability, placed at the top of panel.
    if (hero) {
      var ability = elite ? (hero.eAbility || hero.ability) : hero.ability;
      var abilityTxt = elite ? (hero.eTxt || hero.abilityTxt) : hero.abilityTxt;
      var key = active.id + '|' + (elite ? 'e' : 'n');
      var banner = host.querySelector('.bf-active-banner');
      if (!banner) {
        banner = document.createElement('div');
        banner.className = 'bf-active-banner';
        host.insertBefore(banner, bg.nextSibling);
      }
      if (banner.dataset.bfKey !== key) {
        banner.dataset.bfKey = key;
        banner.className = 'bf-active-banner' + (elite ? ' bf-banner-elite' : '');
        banner.innerHTML =
          '<div class="bf-ab-orb"></div>' +
          '<div>' +
            '<div class="bf-ab-hero">' + bfEsc(hero.name) + (elite ? ' ★' : '') + '</div>' +
            (ability ? '<div class="bf-ab-name">' + bfEsc(ability) + '</div>' : '') +
            (abilityTxt ? '<div class="bf-ab-text">' + bfEsc(abilityTxt) + '</div>' : '') +
          '</div>';
      }
    }
  }

  // ---- (B) Play a hand card (spell/object) with a confirm + cast animation ----
  function bfHandClean(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[ch];
    });
  }

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

  function bfConfirmPlayCard(opts, onYes) {
    var existing = document.getElementById('bf-confirm-overlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.id = 'bf-confirm-overlay';
    overlay.className = 'bf-confirm-overlay';
    var manaLine = '';
    var canPlay = true;
    if (opts.kind === 'spell') {
      var cost = Number(opts.manaCost || 0);
      var mana = opts.mana;
      if (mana !== null && mana !== undefined && cost > mana) canPlay = false;
      manaLine = '<div class="bf-confirm-msg">Coste de maná: <b>' + cost + '</b>' +
        (mana !== null && mana !== undefined ? ' · Maná disponible: <b>' + mana + '</b>' : '') + '</div>' +
        (canPlay ? '' : '<div class="bf-confirm-msg" style="color:#ff8a8a">No tienes maná suficiente para lanzarlo.</div>');
    }
    overlay.innerHTML =
      '<div class="bf-confirm-box">' +
        '<div class="bf-confirm-body">' +
          '<div class="bf-confirm-name" style="margin-top:14px">' + bfHandClean(opts.name) + '</div>' +
          (opts.effect ? '<div class="bf-confirm-effect">' + bfHandClean(opts.effect) + '</div>' : '') +
          manaLine +
          '<div class="bf-confirm-msg">¿Jugar esta carta ahora? <b>Usará el turno del héroe activo.</b></div>' +
          '<div class="bf-confirm-actions">' +
            '<button class="bf-confirm-btn bf-confirm-no" id="bf-confirm-no">Cancelar</button>' +
            (canPlay ? '<button class="bf-confirm-btn bf-confirm-yes" id="bf-confirm-yes">Jugar</button>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    function close() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }
    overlay.querySelector('#bf-confirm-no').onclick = close;
    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    var yes = overlay.querySelector('#bf-confirm-yes');
    if (yes) yes.onclick = function() { close(); onYes(); };
  }

  // Intercept clicks on hand cards: confirm + animate, then run the game's own
  // play action (which deducts mana, ends the turn, applies effects, etc.).
  function bfBindHandPlay() {
    document.querySelectorAll('.chip.bf-chip-card').forEach(function(chip) {
      if (chip.dataset.bfPlayBound === '1') return;
      // Capture the game's original click handler so we can run it on confirm.
      var origOnclickAttr = chip.getAttribute('onclick');
      var origOnclickProp = chip.onclick;
      if (!origOnclickAttr && !origOnclickProp) return;
      chip.dataset.bfPlayBound = '1';
      // Remove the inline handler so our gate runs first.
      chip.removeAttribute('onclick');
      chip.onclick = null;
      chip.addEventListener('click', function(e) {
        // Ignore clicks on the remove "×" button.
        if (e.target.closest('.bf-chip-x')) return;
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
        bfConfirmPlayCard({
          name: name,
          kind: kind,
          effect: item ? (item.txt || item.desc || '') : '',
          manaCost: item ? (item.mana || item.manaCost || item.cost || 0) : 0,
          mana: kind === 'spell' ? bfActiveMana() : null,
        }, run);
      }, true);
    });
  }

  function injectArtIntoDOM() {
    injectHeroArt();
    injectEquipArt();
    injectHandArt();
    injectBonusArt();
    injectBattleHeroArt();
    injectRecruitHeroArt();
    injectTitleIcons();
    injectActionPanelBg();
    bfBindHandPlay();
    syncBattleFx();
    bfSyncGuideLook();
    bfWatchGuideEvents();
  }

  // ---- OBSERVE DOM MUTATIONS (debounced via rAF so a burst of mutations
  // triggers a single injection pass on the next frame, not dozens) ----
  function startObserver() {
    var scheduled = false;
    var observer = new MutationObserver(function() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function() { scheduled = false; injectArtIntoDOM(); });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ---- APPLY AI BACKGROUNDS DIRECTLY (robust) ----
  // We put the current screen background on a dedicated full-screen layer.
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

  // ---- "Salir" button → always return to the start screen reliably ----
  // The base game's quitToHome() can leave stale state / not reset properly,
  // so we force a clean reload back to the title screen.
  function patchQuitToHome() {
    if (window.quitToHome && window.quitToHome.__bf) return;
    window.quitToHome = function() {
      try {
        var ok = window.confirm('¿Salir de la partida y volver a la pantalla inicial?');
        if (!ok) return;
      } catch (e) {}
      window.parent.location.href = window.parent.location.pathname + '?bf=' + Date.now();
    };
    window.quitToHome.__bf = 1;
  }

  // ---- MAIN INIT ----
  function init() {
    injectCoverStyle();
    applyCover();
    patchQuitToHome();

    // Startup loop: keep trying until the game's own functions are defined and
    // patched, then stop. The MutationObserver takes over afterwards, so we no
    // longer need perpetual intervals or per-click timers (less CPU, smoother).
    var attempts = 0;
    var patchedFace = false;
    var interval = setInterval(function() {
      attempts++;
      applyCover();
      patchQuitToHome();
      patchGameRules();
      patchRaceModal();
      patchEquipmentUI();
      patchCombatFx();
      if (!patchedFace) patchedFace = patchCardFace();
      injectArtIntoDOM();
      if ((patchedFace && attempts > 8) || attempts > 60) clearInterval(interval);
    }, 150);

    startObserver();

    // The observer catches DOM changes; this only re-syncs the cover background
    // on screen transitions (which may not mutate body children), throttled.
    var lastScreenId = '';
    setInterval(function() {
      var active = document.querySelector('.screen.active');
      var id = active ? active.id : '';
      if (id !== lastScreenId) { lastScreenId = id; applyCover(); }
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
let CACHED_HTML = null;

async function buildGameHtml() {
  if (CACHED_HTML) return CACHED_HTML;
  const SRC = 'https://media.base44.com/files/public/6a39c9aee54efe3a86d6d69a/2b855b7c8_bizarre_fantasies_v5-4.html';
  const upstream = await fetch(SRC + '?bfv=' + GAME_PATCH_VERSION, { cache: 'no-store' });
  let html = await upstream.text();

  // Prevent in-game "back to start" buttons from reloading cached/raw HTML.
  html = html.replaceAll('location.reload()', 'window.parent.location.href = window.parent.location.pathname + "?bf=" + Date.now()');

  // Inject art script right before </body> so the game's own script
  // (cardFace, HEROES, etc.) is already defined when we hook it.
  const artScript = buildArtScript();
  html = html.includes('</body>') ? html.replace('</body>', artScript + '</body>') : html + artScript;
  CACHED_HTML = html;
  return html;
}

Deno.serve(async (req) => {
  try {
    const html = await buildGameHtml();

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-BF-Patch-Version': GAME_PATCH_VERSION,
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    return new Response('<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;color:#fff;background:#0e0a16;padding:24px">Error: ' + (error?.message || error) + '</body>', {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
});