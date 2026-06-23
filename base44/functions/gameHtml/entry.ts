const COVER_BG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/db79541e2_generated_image.png';
const AUCTION_BG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/4b309b8a3_generated_image.png';
const SHOP_BG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/d82531745_generated_image.png';
const BATTLE_BG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/e8006df25_generated_image.png';
const GAME_PATCH_VERSION = 'bf-2026-06-23-equip-v4';

const HERO_ART = [
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/0a701a388_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/0ae86f5cf_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/3144fa0cc_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/b3befffca_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/b27af2a2e_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/49da10371_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/4b39462db_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/70e5ca186_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/2321b345c_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/7b6b1032e_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/3bbcf59c0_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/dc308d368_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/a53c0e073_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/362ea0a4b_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/861dbe1ad_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/72ce7dd1a_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/3ec5dbfd9_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/e5d35394d_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/49c4de216_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/a96095ce8_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/dd9ae011d_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/d9d830676_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/54365cb73_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/b34bdb48f_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/a237d8ffc_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/99d2f7a81_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/dcee2560b_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ed76b96e2_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/a1aed5117_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/998c3949c_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/3c97a29dd_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/5a9d97619_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/1bd2bdf6d_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/40de7f507_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/a6a9e3561_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/a291e62f4_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/3e72cf42e_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/95e8228cd_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/b5be72327_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/c71c525b8_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/0ad0be833_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/3aedc4e62_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/0b3987343_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/2cfe0922c_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/9c56aea64_generated_image.png',
];

const HERO_ELITE_ART = [
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/b2219417f_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/a2abfb434_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/4952ab881_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/01e96302a_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/e908b3273_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/650b7ff27_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/4d934fdf4_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/f7954d1fc_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/8bc966bfa_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/452bb4fb7_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/653c2036d_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/141eb7445_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ddf40d7ab_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/12f840fe3_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/4cf89ac43_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/8019f9f21_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/8979eecb4_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/87c291158_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/e7ace3347_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/8d6e97ce2_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/33eb953a8_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ffd892ff4_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/5a79e3638_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/b08f41b13_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/fb9937c69_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/04b64ecc7_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/d9ef92043_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/40e91e893_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/437bbb48b_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/35add4eeb_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/0827725df_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/2c7c03c8f_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/d0512bd56_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ae296c827_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/8cde88cb7_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ea100edfb_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/7764cb9ea_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/84c9693dc_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/907ef8e72_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/b96972130_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/8959bebcc_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/e7ce90f66_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/4328395b6_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/06c814afa_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/12a5ddb5c_generated_image.png',
];

const MELEE_ART = [
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/2ef6e8fd8_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/90d5f4f20_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ca0217dac_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/79830b431_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/b5b6160a3_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/a8ea859a5_generated_image.png',
];

const RANGED_ART = [
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/2146a215b_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ab826c633_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/88e45b0a1_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/93554b1ee_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/c8cf4c6d1_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/06ce99379_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/08cb8f198_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/809f7051c_generated_image.png',
];

const ARMOR_ART = [
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/b989796b2_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/37519e06c_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/4a38b42e1_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/6889c5c36_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/fefd71323_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/2de5cea6a_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/244338b2e_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/adc154eaf_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/46890f673_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ed198ba53_generated_image.png',
];

const SPELL_ART = [
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/16656e37c_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/3ecdf6d2c_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/f07673381_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/c9386b2a6_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/77fcb19fb_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/75254b62e_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/fbc82143b_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/0cc792c57_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/05dd1e130_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/938f0dfba_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/299116e86_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/3e1c0a659_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/e73cbd75b_generated_image.png',
];

const OBJECT_ART = [
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/58d239c00_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/1688e1433_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/9b9d6986f_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/dd35e9e6b_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/026d2d45d_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/d138d9427_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/6eec753dd_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/4581afaa7_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/b990b1173_generated_image.png',
];

const BONUS_ART = [
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/88ffc8b21_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/a644bca96_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/a5d3ecf52_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/a58e01097_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/664754ee3_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/6c0160e33_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/fbe03869b_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/5369480ce_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/e5c4370fc_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/26219e884_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/1acefc0e0_generated_image.png',
  'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/77bc42e4f_generated_image.png',
];

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
  var BONUS_ART = ${JSON.stringify(BONUS_ART)};
  var BONUS_IDS = ${JSON.stringify(BONUS_IDS)};
  var BONUS_NAMES = ${JSON.stringify(BONUS_NAMES)};
  var COVER_BG = "${COVER_BG}";
  var AUCTION_BG = "${AUCTION_BG}";
  var SHOP_BG = "${SHOP_BG}";
  var BATTLE_BG = "${BATTLE_BG}";
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
      /* Title screen emoji row — bigger, spaced, with a soft golden glow */
      .title-emoji {
        font-size: clamp(34px, 7vw, 54px) !important;
        letter-spacing: 14px !important;
        margin-bottom: 6px !important;
        filter: drop-shadow(0 0 18px rgba(255,210,74,0.55)) drop-shadow(0 4px 10px rgba(0,0,0,0.6)) !important;
        animation: bfEmojiFloat 3.2s ease-in-out infinite !important;
      }
      @keyframes bfEmojiFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
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
        position: absolute; inset: -3%; z-index: 0; pointer-events: none;
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
      /* Equipment / spell / object shop card art (background banner at top) */
      .shop-card { position: relative; overflow: hidden; }
      .shop-card.has-art > * { position: relative; z-index: 2; }
      .shop-card-art {
        position: absolute; left: 0; right: 0; top: 0; height: 96px;
        background-size: cover; background-position: center center;
        z-index: 0; opacity: 0.9;
        -webkit-mask-image: linear-gradient(180deg, #000 55%, transparent 100%);
        mask-image: linear-gradient(180deg, #000 55%, transparent 100%);
      }
      /* Bonus / restador shown as a mini-card with the whole card visible */
      .bf-bonus-card {
        position: relative; display: block; border-radius: 13px; overflow: hidden;
        height: 214px; margin: 5px 0 8px; border: 2px solid rgba(255,210,74,0.68);
        background: #07050b;
        box-shadow: 0 7px 20px rgba(0,0,0,0.52), inset 0 0 0 1px rgba(255,210,74,.10);
      }
      .bf-bonus-card .bf-bonus-fill,
      .bf-bonus-card .bf-bonus-art {
        position: absolute; inset: -10px; border-radius: 0; background-position: center center; background-repeat: no-repeat; z-index: 0;
      }
      .bf-bonus-card .bf-bonus-fill { background-size: cover; filter: blur(14px) saturate(1.25) contrast(1.12); transform: scale(1.18); opacity: 1; }
      .bf-bonus-card .bf-bonus-art {
        inset: -1px; background-size: cover; z-index: 1;
        filter: saturate(1.1) contrast(1.08);
      }
      .bf-bonus-card .bf-bonus-shade {
        position: absolute; inset: 0; z-index: 2;
        background: linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0) 68%, rgba(0,0,0,0.72) 100%);
      }
      .bf-bonus-card .bf-bonus-name {
        position: absolute; left: 8px; right: 8px; bottom: 7px; z-index: 2;
        font-family: 'Cinzel', serif; font-weight: 900; font-size: 14px; color: #fff5d9;
        text-align: center; text-shadow: 0 2px 6px #000, 0 0 12px rgba(0,0,0,0.95);
      }

      /* Mobile card fit: keep art and text inside the phone frame */
      @media (max-width: 640px) {
        .cardface, .bf-hero-card { max-width: 100% !important; }
        .bf-hero-bg, .cf-art.has-art::before { inset: -4% !important; background-size: cover !important; background-position: center center !important; }
        .bf-race-sigil { top: 9px !important; width: 39px !important; height: 39px !important; font-size: 21px !important; }
        .bf-nameplate { left: 9px !important; right: 9px !important; bottom: 99px !important; padding: 4px 7px !important; }
        .bf-hero-name { font-size: clamp(13px, 4.9vw, 18px) !important; line-height: 1 !important; }
        .bf-hero-title { font-size: 9.5px !important; padding: 2px 6px !important; }
        .bf-coin { width: 38px !important; height: 38px !important; font-size: 16px !important; }
        .bf-type-medal { width: 37px !important; height: 44px !important; font-size: 18px !important; }
        .bf-stats { left: 10px !important; right: 10px !important; bottom: 142px !important; padding: 6px 45px 6px 7px !important; }
        .bf-stat b { font-size: 17px !important; }
        .bf-heart { right: 8px !important; bottom: 146px !important; width: 50px !important; height: 46px !important; }
        .bf-heart .cf-heart-ico { font-size: 48px !important; line-height: 46px !important; }
        .bf-heart .cf-hp { font-size: 16px !important; }
        .bf-ability-panel { left: 8px !important; right: 8px !important; bottom: 8px !important; min-height: 94px !important; grid-template-columns: 38px 1fr !important; gap: 7px !important; padding: 8px 8px 18px 8px !important; }
        .bf-ability-orb { width: 35px !important; height: 35px !important; }
        .bf-ability-orb::before { font-size: 20px !important; }
        .bf-ability-name { font-size: 10.8px !important; }
        .bf-ability-text { font-size: 10.6px !important; line-height: 1.18 !important; }
        .bf-card-num { left: 52px !important; bottom: 9px !important; font-size: 7.6px !important; }
        .bf-logo { right: 7px !important; bottom: 8px !important; font-size: 13px !important; }
        .shop-card { max-width: 100% !important; }
        .shop-card-art { height: 104px !important; background-size: cover !important; background-position: center center !important; background-repeat: no-repeat !important; }
        .bf-bonus-card { height: clamp(190px, 62vw, 250px) !important; margin: 4px 0 7px !important; background:#07050b !important; }
        .bf-bonus-card .bf-bonus-art { inset: -1px !important; background-size: cover !important; background-position: center center !important; background-repeat: no-repeat !important; }
        .bf-bonus-card .bf-bonus-name { font-size: 12.2px !important; bottom: 6px !important; }
      }

      /* Battle/recruit hero thumbnails */
      .bhero { overflow:hidden !important; min-height:108px; padding-left:92px !important; animation:bfHeroIdle 3.8s ease-in-out infinite; }
      .bhero .bhero-top, .bhero .bhero-hpnum, .bhero .hp-bar, .bhero .mp-bar, .bhero .mp-num, .bhero .bhero-status { position:relative; z-index:2; }
      .bf-battle-art { position:absolute; left:-16px; top:-16px; bottom:-16px; width:112px; z-index:1; background-size:cover; background-position:center 18%; background-repeat:no-repeat; filter:saturate(1.12) contrast(1.08); opacity:.96; border:0 !important; outline:0 !important; box-shadow:none !important; }
      .bf-battle-art::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.04) 48%,rgba(21,16,31,.95) 100%); }
      .bhero.active-turn { animation:bfHeroActive 1.35s ease-in-out infinite !important; }
      .bhero.fx-shake { animation:bfDamageShake .34s ease-in-out 1 !important; }
      .bhero.s-paralyzed .bf-battle-art { filter:saturate(1.35) contrast(1.15) drop-shadow(0 0 10px #ffd24a); animation:bfZap .55s steps(2,end) infinite; }
      .bhero.s-sleeping .bf-battle-art { filter:saturate(.7) contrast(.9) brightness(.82); }
      .bhero.s-cursed .bf-battle-art { filter:saturate(.75) contrast(1.2) hue-rotate(245deg) drop-shadow(0 0 9px #b06cff); }
      .bhero.elite-mode .bf-battle-art { filter:saturate(1.25) contrast(1.12) drop-shadow(0 0 10px #ffd24a); }
      @keyframes bfHeroIdle { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
      @keyframes bfHeroActive { 0%,100%{transform:translateY(0);box-shadow:0 0 0 2px rgba(255,210,74,.34),0 0 14px rgba(255,210,74,.18)} 50%{transform:translateY(-4px);box-shadow:0 0 0 3px rgba(255,210,74,.55),0 0 24px rgba(255,210,74,.38)} }
      @keyframes bfDamageShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(3px)} }
      @keyframes bfZap { 0%,100%{opacity:.98} 50%{opacity:.66} }
      .ctb-slot { position:relative !important; min-width:104px !important; padding-left:43px !important; overflow:hidden; }
      .bf-ctb-thumb { position:absolute; left:3px; top:3px; bottom:3px; width:36px; border-radius:7px; background-size:cover; background-position:center 18%; border:0 !important; outline:0 !important; box-shadow:0 4px 10px rgba(0,0,0,.34); }
      .hero-acquired { position:relative !important; min-height:76px; padding-left:78px !important; overflow:hidden; }
      .bf-acq-thumb { position:absolute; left:5px; top:5px; bottom:5px; width:66px; border-radius:11px; background-size:cover; background-position:center 18%; border:0 !important; outline:0 !important; box-shadow:0 5px 12px rgba(0,0,0,.45); }
      .bf-result-thumb { display:inline-block; width:46px; height:46px; border-radius:10px; margin-right:9px; vertical-align:middle; background-size:cover; background-position:center 18%; border:0 !important; outline:0 !important; box-shadow:0 4px 10px rgba(0,0,0,.38); }
      .bhero.bf-fx-damage { animation:bfDamageShake .34s ease-in-out 1 !important; box-shadow:0 0 0 2px rgba(255,72,66,.60),0 0 22px rgba(255,72,66,.42) !important; }
      .bhero.bf-fx-heal { animation:bfHealPulse .62s ease-out 1 !important; box-shadow:0 0 0 2px rgba(81,255,138,.70),0 0 26px rgba(81,255,138,.48), inset 0 0 18px rgba(81,255,138,.24) !important; }
      .bhero.bf-fx-paralyze { animation:bfParalyzeJolt .55s steps(2,end) 1 !important; box-shadow:0 0 0 2px rgba(255,210,74,.75),0 0 28px rgba(255,210,74,.55) !important; }
      .bf-combat-fx { position:absolute; inset:0; z-index:4; pointer-events:none; overflow:hidden; border-radius:inherit; }
      .bf-fx-float { position:absolute; left:50%; top:42%; transform:translate(-50%,-50%); font-family:'Cinzel',serif; font-weight:1000; font-size:28px; letter-spacing:.4px; text-shadow:0 3px 8px #000,0 0 16px currentColor; animation:bfFloatHit .9s ease-out forwards; }
      .bf-fx-dmg { color:#ff4b45; }
      .bf-fx-heal-txt { color:#51ff8a; }
      .bf-fx-status-txt { color:#ffd24a; font-size:20px; top:35%; }
      .bf-fx-slash { position:absolute; left:18px; right:12px; top:50%; height:4px; border-radius:999px; background:linear-gradient(90deg,transparent,#fff,#ff3b35,transparent); transform:rotate(-18deg) scaleX(0); box-shadow:0 0 18px #ff3b35; animation:bfSlash .42s ease-out forwards; }
      .bf-fx-heal-ring { position:absolute; left:18px; top:14px; width:72px; height:72px; border-radius:50%; border:3px solid rgba(81,255,138,.9); box-shadow:0 0 18px #51ff8a,inset 0 0 14px rgba(81,255,138,.45); animation:bfHealRing .82s ease-out forwards; }
      .bf-fx-bolt { position:absolute; left:22px; top:6px; color:#ffd24a; font-size:54px; line-height:1; filter:drop-shadow(0 0 12px #ffd24a); animation:bfBolt .72s ease-out forwards; }
      .fx-ring-heal { box-shadow:0 0 24px #51ff8a, inset 0 0 18px #51ff8a !important; }
      .fx-burst { mix-blend-mode:screen; filter:blur(.2px) saturate(1.4); }
      .fx-status, .fx-word, .fx-dmg { text-shadow:0 2px 6px #000,0 0 12px currentColor !important; font-weight:1000 !important; }
      @keyframes bfHealPulse { 0%{transform:scale(1)} 45%{transform:scale(1.035)} 100%{transform:scale(1)} }
      @keyframes bfParalyzeJolt { 0%,100%{transform:translateX(0)} 18%{transform:translateX(-4px) skewX(-3deg)} 36%{transform:translateX(5px) skewX(3deg)} 54%{transform:translateX(-3px)} 72%{transform:translateX(3px)} }
      @keyframes bfFloatHit { 0%{opacity:0;transform:translate(-50%,-22%) scale(.78)} 18%{opacity:1;transform:translate(-50%,-50%) scale(1.12)} 100%{opacity:0;transform:translate(-50%,-105%) scale(.92)} }
      @keyframes bfSlash { 0%{opacity:0;transform:rotate(-18deg) scaleX(0)} 25%{opacity:1;transform:rotate(-18deg) scaleX(1.05)} 100%{opacity:0;transform:rotate(-18deg) scaleX(1.24)} }
      @keyframes bfHealRing { 0%{opacity:0;transform:scale(.35)} 20%{opacity:1} 100%{opacity:0;transform:scale(1.65)} }
      .bhero.bf-dead { filter:saturate(.35) brightness(.66); }
      .bhero.bf-auto-elite .bf-battle-art { filter:saturate(1.35) contrast(1.14) drop-shadow(0 0 14px #ffd24a) !important; }
      .bf-fx-death-smoke { position:absolute; left:0; right:0; bottom:-20px; height:110px; background:radial-gradient(circle at 45% 70%,rgba(15,15,18,.88),rgba(90,38,120,.36) 38%,transparent 72%); animation:bfDeathSmoke 1.1s ease-out forwards; }
      .bf-fx-skull { position:absolute; left:50%; top:38%; transform:translate(-50%,-50%); font-size:44px; filter:drop-shadow(0 0 15px #000); animation:bfSkullRise 1.05s ease-out forwards; }
      .bf-fx-phoenix { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); font-size:58px; filter:drop-shadow(0 0 16px #ff8a2a); animation:bfPhoenix .95s ease-out forwards; }
      .bf-fx-elite-aura { position:absolute; inset:-8px; border-radius:inherit; background:radial-gradient(circle,rgba(255,210,74,.34),rgba(176,108,255,.20) 36%,transparent 70%); animation:bfEliteAura 1.1s ease-out forwards; }
      .bf-fx-projectile { position:fixed; z-index:9999; pointer-events:none; font-size:34px; filter:drop-shadow(0 0 10px currentColor); transition:left .34s cubic-bezier(.17,.84,.44,1), top .34s cubic-bezier(.17,.84,.44,1); }
      .bf-fx-bullet { color:#ffe49a; }
      .bf-fx-arrow-proj { color:#c6ff8a; }
      .bf-fx-magic-orb { position:fixed; z-index:9999; pointer-events:none; width:34px; height:34px; border-radius:50%; box-shadow:0 0 20px currentColor; background:radial-gradient(circle,#fff,currentColor 44%,transparent 72%); transition:left .42s ease, top .42s ease, transform .42s ease; }
      .bf-fx-spell-wave { position:absolute; left:50%; top:50%; width:34px; height:34px; border-radius:50%; border:3px solid currentColor; transform:translate(-50%,-50%) scale(.2); box-shadow:0 0 20px currentColor,inset 0 0 18px currentColor; animation:bfSpellWave .75s ease-out forwards; }
      .bf-fx-bigblast { position:absolute; inset:-10px; border-radius:inherit; background:radial-gradient(circle at 50% 45%,rgba(255,255,255,.9),rgba(255,77,60,.62) 18%,rgba(255,143,42,.26) 42%,transparent 72%); animation:bfBigBlast .72s ease-out forwards; }
      .bf-race-list { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:12px; margin-top:12px; }
      .bf-race-card { position:relative; min-height:168px; overflow:hidden; border-radius:16px; padding:14px; border:1.5px solid var(--race,#ffd24a); background:radial-gradient(circle at 22% 14%,color-mix(in srgb,var(--race,#ffd24a) 34%,transparent),transparent 36%),linear-gradient(145deg,#120d1d,#261d3d); box-shadow:0 10px 26px rgba(0,0,0,.38), inset 0 0 0 1px rgba(255,255,255,.06); }
      .bf-race-card::before { content:''; position:absolute; right:-28px; top:-22px; width:132px; height:132px; border-radius:50%; background:radial-gradient(circle,color-mix(in srgb,var(--race,#ffd24a) 32%,transparent),transparent 66%); filter:blur(1px); }
      .bf-race-sigil-big { position:relative; z-index:1; width:58px; height:58px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff7dc; font-family:'Cinzel',serif; font-size:32px; font-weight:1000; background:radial-gradient(circle at 35% 25%,rgba(255,255,255,.42),rgba(255,210,74,.18) 38%,rgba(0,0,0,.72) 72%); border:2px solid var(--race,#ffd24a); text-shadow:0 2px 4px #000,0 0 12px var(--race,#ffd24a); box-shadow:0 5px 16px rgba(0,0,0,.55); }
      .bf-race-title { position:relative; z-index:1; margin-top:10px; font-family:'Cinzel',serif; font-size:20px; font-weight:1000; color:#fff5dc; text-shadow:0 2px 5px #000; }
      .bf-race-trait { position:relative; z-index:1; margin-top:4px; color:#ffe49a; font-weight:800; font-size:12.5px; line-height:1.25; }
      .bf-race-desc { position:relative; z-index:1; margin-top:7px; color:#efe9dc; font-size:13px; line-height:1.28; }
      .bf-race-stats { position:relative; z-index:1; margin-top:8px; color:#cfc6dd; font-size:11px; line-height:1.25; background:rgba(0,0,0,.28); border:1px solid rgba(255,255,255,.08); border-radius:9px; padding:7px; }
      .shop-card.has-art { min-height: 226px !important; padding-top: 92px !important; background: linear-gradient(180deg,rgba(18,12,25,.78),rgba(9,7,13,.96)) !important; }
      .shop-card-art.bf-shop-card-art { height: 112px !important; opacity: 1 !important; filter: saturate(1.14) contrast(1.08); }
      .bf-shop-shade { position:absolute; left:0; right:0; top:0; height:126px; z-index:1; pointer-events:none; background:linear-gradient(180deg,rgba(0,0,0,0) 32%,rgba(0,0,0,.78) 100%); }
      .eq-hero.bf-eq-hero-with-art { position:relative !important; min-height:154px; padding-left:104px !important; overflow:hidden; }
      .eq-hero.bf-eq-hero-with-art > *:not(.bf-eq-hero-art) { position:relative; z-index:2; }
      .bf-eq-hero-art { position:absolute; left:0; top:0; bottom:0; width:92px; z-index:1; background-size:cover; background-position:center 18%; border-right:1px solid rgba(255,210,74,.26); filter:saturate(1.12) contrast(1.08); }
      .bf-eq-hero-art::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(18,12,25,.28) 56%,rgba(18,12,25,.92) 100%); }
      .eq-slot.bf-slot-empty { display:flex; align-items:center; justify-content:space-between; gap:8px; }
      .bf-slot-buy { border:1px solid rgba(255,210,74,.55); background:rgba(255,210,74,.12); color:#ffe49a; border-radius:999px; padding:4px 9px; font-size:10.5px; font-weight:900; cursor:pointer; white-space:nowrap; }
      .bf-slot-buy:hover { background:rgba(255,210,74,.22); }
      .bf-quick-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:10px; margin-top:12px; }
      .bf-quick-card { position:relative; overflow:hidden; min-height:172px; border-radius:13px; border:1.5px solid rgba(255,210,74,.42); background:#0b0811; padding:86px 10px 10px; cursor:pointer; box-shadow:0 8px 20px rgba(0,0,0,.38); }
      .bf-quick-art { position:absolute; left:0; right:0; top:0; height:102px; background-size:cover; background-position:center; }
      .bf-quick-card::after { content:''; position:absolute; left:0; right:0; top:0; height:112px; background:linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(0,0,0,.82) 100%); pointer-events:none; }
      .bf-quick-card > *:not(.bf-quick-art) { position:relative; z-index:2; }
      .bf-quick-cost { position:absolute; top:8px; left:8px; z-index:3; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at 34% 28%,#fff0ae,#FFD24A 45%,#b77614); border:2px solid #6f4809; color:#4a2e03; font-weight:1000; }
      .bf-quick-name { color:#fff5dc; font-family:'Cinzel',serif; font-weight:900; line-height:1.05; }
      .bf-quick-txt { color:#d9d0e8; font-size:11px; line-height:1.25; margin-top:5px; }
      @keyframes bfDeathSmoke { 0%{opacity:0;transform:translateY(22px) scale(.8)} 35%{opacity:1} 100%{opacity:0;transform:translateY(-18px) scale(1.22)} }
      @keyframes bfSkullRise { 0%{opacity:0;transform:translate(-50%,-18%) scale(.7)} 25%{opacity:1;transform:translate(-50%,-50%) scale(1.1)} 100%{opacity:0;transform:translate(-50%,-112%) scale(.9)} }
      @keyframes bfPhoenix { 0%{opacity:0;transform:translate(-50%,10%) scale(.45) rotate(-12deg)} 35%{opacity:1;transform:translate(-50%,-50%) scale(1.15) rotate(6deg)} 100%{opacity:0;transform:translate(-50%,-110%) scale(.95) rotate(0)} }
      @keyframes bfEliteAura { 0%{opacity:0;transform:scale(.75) rotate(0)} 35%{opacity:1} 100%{opacity:0;transform:scale(1.25) rotate(18deg)} }
      @keyframes bfSpellWave { 0%{opacity:0;transform:translate(-50%,-50%) scale(.2)} 25%{opacity:1} 100%{opacity:0;transform:translate(-50%,-50%) scale(3.2)} }
      @keyframes bfBigBlast { 0%{opacity:0;transform:scale(.55)} 30%{opacity:1;transform:scale(1.05)} 100%{opacity:0;transform:scale(1.24)} }
      @keyframes bfBolt { 0%{opacity:0;transform:translateY(-8px) scale(.7)} 18%{opacity:1;transform:translateY(0) scale(1.08)} 100%{opacity:0;transform:translateY(10px) scale(.95)} }
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
    function padNum(value) {
      var n = parseInt(value || 0, 10);
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
      var url = elite ? (ELITE_BY_ID[h && h.id] || ART_BY_ID[h && h.id]) : ART_BY_ID[h && h.id];
      var safeUrl = String(url || '').replace(/'/g, '%27');
      return '<div class="cardface bf-hero-card ' + (elite ? 'cf-elite' : '') + '" style="--clan:' + clean(col) + ';--bf-art:url(\\'' + safeUrl + '\\')">' +
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
        '<div class="bf-card-num">Base Set · Nº ' + padNum(h.num) + '</div>' +
        '<div class="bf-logo">BF</div>' +
      '</div>';
    };
    patched.__patched = true;
    window.cardFace = patched;
    return true;
  }

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

  // ---- DOM injection for equipment shop cards (match by "Nº X") ----
  function injectEquipArt() {
    document.querySelectorAll('.shop-card').forEach(function(card) {
      if (card.querySelector('.shop-card-art')) return;
      var bf = card.querySelector('.shop-bf span');
      if (!bf) return;
      var m = bf.textContent.match(/(\\d+)/);
      if (!m) return;
      var url = NUM_ART[m[1]];
      if (!url) return;
      var art = document.createElement('div');
      art.className = 'shop-card-art bf-shop-card-art';
      art.style.backgroundImage = 'url("' + url + '")';
      var shade = document.createElement('div');
      shade.className = 'bf-shop-shade';
      card.insertBefore(shade, card.firstChild);
      card.insertBefore(art, card.firstChild);
      card.classList.add('has-art');
    });
  }

  // ---- DOM injection for the round bonus/restador (turn its chip into a card) ----
  function injectBonusArt() {
    document.querySelectorAll('.hand-lbl').forEach(function(lbl) {
      if (!/Bonificador de esta ronda/i.test(lbl.textContent)) return;
      var chip = lbl.nextElementSibling;
      if (!chip || !chip.classList || !chip.classList.contains('chip')) return;
      if (chip.dataset.bfDone === '1') return;
      var name = chip.textContent.trim();
      var url = BONUS_ART_BY_NAME[name] || BONUS_ART_BY_KEY[bfKey(name)];
      if (!url) return;
      chip.dataset.bfDone = '1';
      chip.style.display = 'none';
      var card = document.createElement('div');
      card.className = 'bf-bonus-card';
      card.innerHTML =
        '<div class="bf-bonus-fill" style="background-image:url(\\'' + url + '\\')"></div>' +
        '<div class="bf-bonus-art" style="background-image:url(\\'' + url + '\\')"></div>' +
        '<div class="bf-bonus-shade"></div>' +
        '<div class="bf-bonus-name">' + name + '</div>';
      chip.parentNode.insertBefore(card, chip.nextSibling);
    });
  }

  function injectBattleHeroArt() {
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card) {
      if (card.dataset.bfBattleArt === '1') return;
      var parts = card.id.split('_');
      var id = parts[parts.length - 1];
      var url = ART_BY_ID[id] || ELITE_BY_ID[id];
      if (!url) return;
      var art = document.createElement('div');
      art.className = 'bf-battle-art';
      art.style.backgroundImage = 'url("' + url + '")';
      card.insertBefore(art, card.firstChild);
      card.dataset.bfBattleArt = '1';
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

  function isHeroParalyzed(card) {
    var status = card.querySelector('.bhero-status');
    var text = status ? status.textContent : '';
    return card.classList.contains('s-paralyzed') || /par[aá]li/i.test(text);
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
    if (!eliteUrl) return;
    var art = card.querySelector('.bf-battle-art');
    if (art) art.style.backgroundImage = 'url("' + eliteUrl + '")';
    card.dataset.bfAutoElite = '1';
    card.classList.add('bf-auto-elite', 'elite-mode');
    addOverlayFx(card, '<div class="bf-fx-elite-aura"></div><div class="bf-fx-float bf-fx-status-txt">★ ÉLITE</div>', 1150);
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
      card.classList.add('bf-dead');
      addOverlayFx(card, '<div class="bf-fx-death-smoke"></div><div class="bf-fx-skull">💀</div>', 1150);
      setTimeout(function() { transformHeroToElite(card); }, 420);
    } else {
      addOverlayFx(card, '<div class="bf-fx-bolt">⚡</div><div class="bf-fx-float bf-fx-status-txt">PARALIZADO</div>', 950);
    }
  }

  function syncBattleFx() {
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card) {
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
      var paralyzed = isHeroParalyzed(card) ? '1' : '0';
      if (card.dataset.bfPrevParalyzed !== undefined && card.dataset.bfPrevParalyzed !== paralyzed && paralyzed === '1') {
        playHeroFx(card, 'paralyze');
      }
      card.dataset.bfPrevParalyzed = paralyzed;
    });
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
      return;
    }
    if (ev.k === 'elite') {
      transformHeroToElite(getBattleCard(ev.side, ev.id));
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

    HEROES.forEach(function(h) {
      if (h.clan === 'Épicas' && h.__bfEpicRaised !== 1) {
        h.cost = Number(h.cost || 0) + 10;
        h.__bfEpicRaised = 1;
      }
    });

    if (!BONUS.some(function(b) { return b.id === 'epic_self'; })) {
      BONUS.push({ id: 'epic_self', name: 'Convocatoria Épica', type: 'BON', effect: 0, txt: 'En esta subasta sólo tú verás una criatura Épica para pujar.' });
    }
    if (!BONUS.some(function(b) { return b.id === 'epic_rival'; })) {
      BONUS.push({ id: 'epic_rival', name: 'Destino Épico Rival', type: 'RES', effect: 0, txt: 'En esta subasta tu rival verá una criatura Épica para pujar.' });
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
      var type = G.curType;
      var usedIds = {};
      ['p','o'].forEach(function(side) { (G.team && G.team[side] || []).forEach(function(h) { usedIds[h.id] = true; }); });
      (G.cands || []).forEach(function(h) { if (h) usedIds[h.id] = true; });
      return HEROES.filter(function(h) { return h.clan === 'Épicas' && h.type === type && !usedIds[h.id]; });
    }

    function prepareEpicOffers() {
      G.epicCands = {};
      if (!G.forceEpic) return;
      ['p','o'].forEach(function(side) {
        if (!G.forceEpic[side]) return;
        var pool = epicPoolForCurrentType();
        if (!pool.length) return;
        var h = pool[Math.floor(Math.random() * pool.length)];
        G.epicCands[side] = [h];
        if (!(G.cands || []).some(function(x) { return x.id === h.id; })) G.cands.push(h);
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

    var originalStartAuctionPhase = window.startAuctionPhase;
    window.startAuctionPhase = function() {
      if (G.pools) {
        ['CC','AD','HE'].forEach(function(t) {
          G.pools[t] = (G.pools[t] || []).filter(function(h) { return h.clan !== 'Épicas'; });
        });
      }
      return originalStartAuctionPhase.apply(this, arguments);
    };

    var originalBeginBidRound = window.beginBidRound;
    window.beginBidRound = function() {
      var ret = originalBeginBidRound.apply(this, arguments);
      prepareEpicOffers();
      if (NET.role !== 'client') {
        renderRecruit('p');
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
    function confirmPurchase(item, side, hero) {
      if (!item) return false;
      var cost = Number(item.cost || 0);
      var coins = Number((G.equipCoins && G.equipCoins[side]) || 0);
      if (coins < cost) {
        if (window.notif) notif('No tienes monedas suficientes para comprar ' + item.name + '.');
        return false;
      }
      var target = hero ? ' y equiparlo a ' + hero.name : '';
      return window.confirm('Comprar ' + item.name + ' por ' + cost + ' monedas' + target + '?');
    }
    function closeAnyModal() {
      var close = document.querySelector('.modal-close, .modal-x, [onclick="closeModal()"]');
      if (close) close.click();
      else if (typeof window.closeModal === 'function') closeModal();
    }

    var originalBuySpell = window.buySpell;
    window.buySpell = function(side, id) {
      var item = typeof byId === 'function' ? byId(SPELLS, id) : null;
      if (!confirmPurchase(item, side)) return;
      return originalBuySpell.apply(this, arguments);
    };

    var originalBuyObject = window.buyObject;
    window.buyObject = function(side, id) {
      var item = typeof byId === 'function' ? byId(OBJECTS, id) : null;
      if (!confirmPurchase(item, side)) return;
      return originalBuyObject.apply(this, arguments);
    };

    var originalDoAssign = window.doAssign;
    window.doAssign = function(side, heroId) {
      var hero = findHero(side, heroId);
      var item = G.assign ? { name: G.assign.name, cost: G.assign.cost } : null;
      if (!confirmPurchase(item, side, hero)) return;
      return originalDoAssign.apply(this, arguments);
    };

    var originalEqHeroCard = window.eqHeroCard;
    window.eqHeroCard = function(h, side) {
      var html = originalEqHeroCard.apply(this, arguments);
      var url = ART_BY_ID[h && h.id] || '';
      if (url && html.indexOf('bf-eq-hero-art') === -1) {
        html = html.replace(/<div class="eq-hero([^"]*)"/, '<div class="eq-hero bf-eq-hero-with-art$1"');
        html = html.replace(/(<div class="eq-hero[^>]*>)/, '$1<div class="bf-eq-hero-art" style="background-image:url(&quot;' + url + '&quot;)"></div>');
      }
      if (!h.mwep && !h.rwep) {
        var weaponSlotPattern = new RegExp('<div class="eq-slot">Arma: vacía([\\\\s\\\\S]*?)</div>');
        html = html.replace(weaponSlotPattern, '<div class="eq-slot bf-slot-empty" onclick="event.stopPropagation();bfOpenQuickShop(&quot;' + side + '&quot;,&quot;' + h.id + '&quot;,&quot;weapon&quot;)"><span>Arma: vacía$1</span><button class="bf-slot-buy">Comprar</button></div>');
      }
      if (!h.armor) {
        html = html.replace('<div class="eq-slot">Armadura: vacía</div>', '<div class="eq-slot bf-slot-empty" onclick="event.stopPropagation();bfOpenQuickShop(&quot;' + side + '&quot;,&quot;' + h.id + '&quot;,&quot;armor&quot;)"><span>Armadura: vacía</span><button class="bf-slot-buy">Comprar</button></div>');
      }
      return html;
    };

    window.bfOpenQuickShop = function(side, heroId, slot) {
      var hero = findHero(side, heroId);
      if (!hero || typeof modal !== 'function') return;
      var items = slot === 'armor' ? (ARMORS || []).map(function(x) { return { kind:'armor', item:x }; }) :
        (MELEE || []).map(function(x) { return { kind:'melee', item:x }; }).concat((RANGED || []).map(function(x) { return { kind:'ranged', item:x }; }));
      var coins = Number((G.equipCoins && G.equipCoins[side]) || 0);
      var cards = items.map(function(row) {
        var item = row.item;
        var art = NUM_ART[String(cardNo(item.id))] || NUM_ART[cardNo(item.id)] || '';
        var disabled = Number(item.cost || 0) > coins;
        return '<div class="bf-quick-card" ' + (disabled ? 'style="opacity:.45;cursor:not-allowed"' : 'onclick="bfQuickBuy(&quot;' + side + '&quot;,&quot;' + heroId + '&quot;,&quot;' + row.kind + '&quot;,&quot;' + item.id + '&quot;)"') + '>' +
          (art ? '<div class="bf-quick-art" style="background-image:url(&quot;' + art + '&quot;)"></div>' : '') +
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
      var hero = findHero(side, heroId);
      if (!confirmPurchase(item, side, hero)) return;
      G.assign = { kind: kind, id: id, cost: item.cost, name: item.name };
      closeAnyModal();
      return originalDoAssign.call(this, side, heroId);
    };
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

  function injectArtIntoDOM() {
    injectHeroArt();
    injectEquipArt();
    injectBonusArt();
    injectBattleHeroArt();
    injectRecruitHeroArt();
    syncBattleFx();
  }

  // ---- OBSERVE DOM MUTATIONS ----
  function startObserver() {
    var observer = new MutationObserver(function() { injectArtIntoDOM(); });
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
  }

  // ---- MAIN INIT ----
  function init() {
    injectCoverStyle();
    applyCover();

    var attempts = 0;
    var patchedFace = false;
    var interval = setInterval(function() {
      attempts++;
      applyCover();
      patchGameRules();
      patchRaceModal();
      patchEquipmentUI();
      patchCombatFx();
      if (!patchedFace) patchedFace = patchCardFace();
      injectArtIntoDOM();
      if ((patchedFace && attempts > 8) || attempts > 60) clearInterval(interval);
    }, 150);

    startObserver();

    document.addEventListener('click', function() {
      setTimeout(function() { applyCover(); injectArtIntoDOM(); }, 80);
      setTimeout(function() { applyCover(); injectArtIntoDOM(); }, 400);
    });

    // Keep cover in sync even if screen changes without a click
    setInterval(applyCover, 600);
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

Deno.serve(async (req) => {
  try {
    const SRC = 'https://media.base44.com/files/public/6a39c9aee54efe3a86d6d69a/2b855b7c8_bizarre_fantasies_v5-4.html';
    const upstream = await fetch(SRC + '?bfv=' + GAME_PATCH_VERSION + '&t=' + Date.now(), { cache: 'no-store' });
    let html = await upstream.text();

    // Prevent in-game "back to start" buttons from reloading cached/raw HTML.
    html = html.replaceAll('location.reload()', 'window.parent.location.href = window.parent.location.pathname + "?bf=" + Date.now()');

    // Inject art script right before </body> so the game's own script
    // (cardFace, HEROES, etc.) is already defined when we hook it.
    const artScript = buildArtScript();
    if (html.includes('</body>')) {
      html = html.replace('</body>', artScript + '</body>');
    } else {
      html = html + artScript;
    }

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