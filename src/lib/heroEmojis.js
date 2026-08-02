// Emojis del chat basados en la BD del juego (Bizarre Fantasies).
//
// Cuatro categorías:
//   1. HERO_STICKER_EMOJIS — 8 caras expresivas tipo sticker generadas por IA.
//   2. HERO_ART_EMOJIS     — arte de carta de cada héroe (art_url de la BD),
//                            agrupado por clan.
//   3. ABILITY_EMOJIS      — animaciones de habilidad (ability_anim_url de la
//                            BD): el arte 3D cinemático de cada habilidad.
//   4. BIZARRO_EMOJIS     — arte de los héroes bizarros.

const MEDIA = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a';
const FILES = 'https://base44.app/api/apps/6a39c9aee54efe3a86d6d69a/files/mp/public/6a39c9aee54efe3a86d6d69a';
const M = (h) => `${MEDIA}/${h}`;
const F = (h) => `${FILES}/${h}`;

// 1. Stickers de reacción (8 caras expresivas generadas por IA)
export const HERO_STICKER_EMOJIS = [
  { id: 'stk_xabierus', name: 'Xabierus', clan: 'Guerreros', url: M('cbb16120d_generated_image.png') },
  { id: 'stk_renhubero', name: 'Renhubero', clan: 'Druidas', url: M('f3eeea1d9_generated_image.png') },
  { id: 'stk_vragnar', name: 'Vragnar', clan: 'No-muertos', url: M('1ef2df5b2_generated_image.png') },
  { id: 'stk_vap_rogers', name: 'Vap Rogers', clan: 'Vaqueros', url: M('e2f8c1f2f_generated_image.png') },
  { id: 'stk_boss', name: 'Boss', clan: 'Guerreros', url: M('762564682_generated_image.png') },
  { id: 'stk_morthex', name: 'Morthex', clan: 'No-muertos', url: M('9ce7d8950_generated_image.png') },
  { id: 'stk_boskimano', name: 'Boskimano', clan: 'Druidas', url: M('f9949af20_generated_image.png') },
  { id: 'stk_hannai', name: 'Hannai Boa', clan: 'Vaqueros', url: M('e890e45e0_generated_image.png') },
];

// 2. Héroes — arte de carta (art_url de la BD), agrupado por clan
export const HERO_ART_EMOJIS = [
  // Guerreros
  { id: 'hero_xabierus', name: 'Xabierus', clan: 'Guerreros', ability: 'Torbellino', url: M('fe63611da_generated_image.png') },
  { id: 'hero_boss', name: 'Boss', clan: 'Guerreros', ability: 'Intimidación', url: F('6512204da_card_art.jpg') },
  { id: 'hero_narbon', name: 'Narbon', clan: 'Guerreros', ability: 'El Soltaito', url: F('e7366cdb3_card_art.jpg') },
  { id: 'hero_hildra', name: 'Hildra', clan: 'Guerreros', ability: 'Furia Ciega', url: M('28129e547_generated_image.png') },
  { id: 'hero_bermellus', name: 'Bermellus', clan: 'Guerreros', ability: 'Muro', url: F('36b43eb32_card_art.jpg') },
  { id: 'hero_undertaker', name: 'Undertaker', clan: 'Guerreros', ability: 'Decapitación', url: F('27b0f0177c0_card_art.jpg') },
  // Druidas
  { id: 'hero_renhubero', name: 'Renhubero', clan: 'Druidas', ability: 'Enredadera', url: M('46731be45_generated_image.png') },
  { id: 'hero_boskimano', name: 'Boskimano', clan: 'Druidas', ability: 'Raíces Ancestrales', url: F('9e43be1e4_card_art.jpg') },
  { id: 'hero_chivo', name: 'Chivo', clan: 'Druidas', ability: 'Balada Curativa', url: M('786d9a5d9_generated_image.png') },
  { id: 'hero_solenna', name: 'Solenna', clan: 'Druidas', ability: 'Renacimiento', url: F('aae5a6404_card_art.jpg') },
  { id: 'hero_mantto', name: 'Mantenimiento', clan: 'Druidas', ability: 'Reequilibrio', url: M('43b4d55e6_generated_image.png') },
  // No-muertos
  { id: 'hero_vragnar', name: 'Vragnar', clan: 'No-muertos', ability: 'Atravesar', url: M('166727ba9_generated_image.png') },
  { id: 'hero_morthex', name: 'Morthex', clan: 'No-muertos', ability: 'Absorción Oscura', url: M('44d09cf98_generated_image.png') },
  { id: 'hero_skarla', name: 'Skarla', clan: 'No-muertos', ability: 'Grito del Vacío', url: M('85fcc4f77_generated_image.png') },
  { id: 'hero_pacopiton', name: 'Pacopiton', clan: 'No-muertos', ability: 'Maldición Eterna', url: M('d9a306f6c_generated_image.png') },
  { id: 'hero_frutera', name: 'Frutera', clan: 'No-muertos', ability: 'Fruta de la Pasión', url: F('5af84b094_card_art.jpg') },
  // Vaqueros
  { id: 'hero_vap_rogers', name: 'Vap Rogers', clan: 'Vaqueros', ability: 'Aplastamiento', url: F('89aad3d6b_card_art.jpg') },
  { id: 'hero_hannai_boa', name: 'Hannai Boa', clan: 'Vaqueros', ability: 'Sigilo Cuántico', url: F('152effcd4_card_art.jpg') },
  { id: 'hero_alfredinho', name: 'Alfredinho', clan: 'Vaqueros', ability: 'Doble Disparo', url: F('af980e7140_card_art.jpg') },
  { id: 'hero_dixie_plasma', name: 'Dixie Plasma', clan: 'Vaqueros', ability: 'Punto Débil', url: F('e7cf944e9_card_art.jpg') },
  { id: 'hero_reverendo', name: 'Reverendo Sapis', clan: 'Vaqueros', ability: 'Maldición Estelar', url: M('c8b5e2201_generated_image.png') },
  { id: 'hero_clint', name: 'Clint Tripud', clan: 'Vaqueros', ability: 'Inyección', url: M('94697d8820_generated_image.png') },
  // Épicas
  { id: 'hero_krunderkrak', name: 'KrunderKrak', clan: 'Épicas', ability: 'Devastación', url: M('d31d5f27b_generated_image.png') },
  { id: 'hero_heavy', name: 'El Heavy', clan: 'Épicas', ability: 'Headbang', url: M('45ce0f135_generated_image.png') },
  { id: 'hero_sylvex', name: 'Sylvex', clan: 'Épicas', ability: 'Mutación', url: M('ff652a33d_generated_image.png') },
  { id: 'hero_gorvak', name: 'Gorvak', clan: 'Épicas', ability: 'Onda de Impacto', url: M('a5bde0e30_generated_image.png') },
  { id: 'hero_zarmandis', name: 'Zarmandis', clan: 'Épicas', ability: 'Juicio Divino', url: F('12ef30612_card_art.jpg') },
  { id: 'hero_coffetath', name: 'Coffetath', clan: 'Épicas', ability: 'Colapso Mental', url: F('cc077b164_card_art.jpg') },
  { id: 'hero_killerducks', name: 'KillerDucks', clan: 'Épicas', ability: 'Cuac-osmia', url: F('b78e10a89_card_art.jpg') },
  // Cotidianos
  { id: 'hero_pijo', name: 'El Pijo', clan: 'Cotidianos', ability: 'Postureo', url: M('5cc21af85_generated_image.png') },
  { id: 'hero_futbolista', name: 'El Futbolista', clan: 'Cotidianos', ability: 'Tiro Libre', url: F('a48a9e5c1_card_art.jpg') },
  { id: 'hero_gamer', name: 'El Gamer', clan: 'Cotidianos', ability: 'Headshot', url: F('57b4b1fbb_card_art.jpg') },
  { id: 'hero_ajedrecista', name: 'El Ajedrecista', clan: 'Cotidianos', ability: 'Jaque Mate', url: M('0b8c4d069_generated_image.png') },
  { id: 'hero_rolero', name: 'El Rolero', clan: 'Cotidianos', ability: 'Tirada Crítica', url: M('1de790e63_generated_image.png') },
  { id: 'hero_politico', name: 'El Político', clan: 'Cotidianos', ability: 'Promesa Vacía', url: M('4ad6c76c5_generated_image.png') },
  // Elfos
  { id: 'hero_patron', name: 'Patrón', clan: 'Elfos', ability: 'Flecha Guiada', url: M('5620665370_generated_image.png') },
  { id: 'hero_sylvara', name: 'Sylvara', clan: 'Elfos', ability: 'Lluvia de Flechas', url: M('122d2a463_generated_image.png') },
  { id: 'hero_elderbar', name: 'Elderbar', clan: 'Elfos', ability: 'Marca del Cazador', url: F('a742626d5_card_art.jpg') },
  { id: 'hero_zarmanda', name: 'Zarmanda', clan: 'Elfos', ability: 'Disparo Silencioso', url: M('d2ea825f7_generated_image.png') },
  { id: 'hero_edredon', name: 'Edredon', clan: 'Elfos', ability: 'Maestría', url: M('7d2b9c3f9_generated_image.png') },
  // Magos
  { id: 'hero_retropoeta', name: 'Retropoeta', clan: 'Magos', ability: 'Paradoja Arcana', url: F('75528fea7_card_art.jpg') },
  { id: 'hero_malallet', name: 'Malallet', clan: 'Magos', ability: 'Tormenta Mágica', url: F('3b9b29870_card_art.jpg') },
  { id: 'hero_serafis', name: 'Serafis', clan: 'Magos', ability: 'Inversión', url: M('59aed8957_generated_image.png') },
  { id: 'hero_batu', name: 'Batu', clan: 'Magos', ability: 'Espíritu Guardián', url: F('99058139a_card_art.jpg') },
  { id: 'hero_nixara', name: 'Nixara', clan: 'Magos', ability: 'Drenaje Vital', url: F('31aadce0b_card_art.jpg') },
  { id: 'hero_vexal', name: 'Vexal', clan: 'Magos', ability: 'Interferencia', url: M('6a68b95c8_generated_image.png') },
  { id: 'hero_juniana', name: 'Juniana', clan: 'Magos', ability: 'Refracción Arcana', url: F('1f1c7f50c_card_art.jpg') },
];

// 3. Habilidades — animaciones 3D cinemáticas (ability_anim_url de la BD)
export const ABILITY_EMOJIS = [
  { id: 'anim_torbellino', name: 'Torbellino', hero: 'Xabierus', clan: 'Guerreros', url: M('0940b8c4c_generated_image.png') },
  { id: 'anim_intimidacion', name: 'Intimidación', hero: 'Boss', clan: 'Guerreros', url: M('1330d6dbf0_generated_image.png') },
  { id: 'anim_soltaito', name: 'El Soltaito', hero: 'Narbon', clan: 'Guerreros', url: M('2f9aade2d_generated_image.png') },
  { id: 'anim_furia', name: 'Furia Ciega', hero: 'Hildra', clan: 'Guerreros', url: M('e90702da8_generated_image.png') },
  { id: 'anim_decapitacion', name: 'Decapitación', hero: 'Undertaker', clan: 'Guerreros', url: M('5487d7928_generated_image.png') },
  { id: 'anim_enredadera', name: 'Enredadera', hero: 'Renhubero', clan: 'Druidas', url: M('089e4218d_generated_image.png') },
  { id: 'anim_raices', name: 'Raíces Ancestrales', hero: 'Boskimano', clan: 'Druidas', url: M('c36cac9460_generated_image.png') },
  { id: 'anim_balada', name: 'Balada Curativa', hero: 'Chivo', clan: 'Druidas', url: M('0259c21e4_generated_image.png') },
  { id: 'anim_renacimiento', name: 'Renacimiento', hero: 'Solenna', clan: 'Druidas', url: M('49afa7a4e_generated_image.png') },
  { id: 'anim_reequilibrio', name: 'Reequilibrio', hero: 'Mantenimiento', clan: 'Druidas', url: M('5f01da87e_generated_image.png') },
  { id: 'anim_maldicion', name: 'Maldición Eterna', hero: 'Pacopiton', clan: 'No-muertos', url: M('e181130e8_generated_image.png') },
  { id: 'anim_fruta', name: 'Fruta de la Pasión', hero: 'Frutera', clan: 'No-muertos', url: M('333b17e38_generated_image.png') },
  { id: 'anim_sigilo', name: 'Sigilo Cuántico', hero: 'Hannai Boa', clan: 'Vaqueros', url: M('70ab16a53_generated_image.png') },
  { id: 'anim_doble_disparo', name: 'Doble Disparo', hero: 'Alfredinho', clan: 'Vaqueros', url: M('95146ea6f_generated_image.png') },
  { id: 'anim_maldicion_estelar', name: 'Maldición Estelar', hero: 'Reverendo Sapis', clan: 'Vaqueros', url: M('3e140e4760_generated_image.png') },
  { id: 'anim_inyeccion', name: 'Inyección', hero: 'Clint Tripud', clan: 'Vaqueros', url: M('a7395b4ae_generated_image.png') },
  { id: 'anim_devastacion', name: 'Devastación', hero: 'KrunderKrak', clan: 'Épicas', url: M('22295a6ed_generated_image.png') },
  { id: 'anim_headbang', name: 'Headbang', hero: 'El Heavy', clan: 'Épicas', url: M('104e2f355_generated_image.png') },
  { id: 'anim_mutacion', name: 'Mutación', hero: 'Sylvex', clan: 'Épicas', url: M('21b96f7c7_generated_image.png') },
  { id: 'anim_onda_impacto', name: 'Onda de Impacto', hero: 'Gorvak', clan: 'Épicas', url: M('2b21e2f69_generated_image.png') },
  { id: 'anim_juicio_divino', name: 'Juicio Divino', hero: 'Zarmandis', clan: 'Épicas', url: M('b158b0415_generated_image.png') },
  { id: 'anim_colapso', name: 'Colapso Mental', hero: 'Coffetath', clan: 'Épicas', url: M('0b6d418b1_generated_image.png') },
  { id: 'anim_cuacosmia', name: 'Cuac-osmia', hero: 'KillerDucks', clan: 'Épicas', url: M('c40fc88dd_generated_image.png') },
  { id: 'anim_tiro_libre', name: 'Tiro Libre', hero: 'El Futbolista', clan: 'Cotidianos', url: M('37644e0d0_generated_image.png') },
  { id: 'anim_headshot', name: 'Headshot', hero: 'El Gamer', clan: 'Cotidianos', url: M('13266939b_generated_image.png') },
  { id: 'anim_jaque_mate', name: 'Jaque Mate', hero: 'El Ajedrecista', clan: 'Cotidianos', url: M('6c3c2bc98_generated_image.png') },
  { id: 'anim_paradoja', name: 'Paradoja Arcana', hero: 'Retropoeta', clan: 'Magos', url: M('2ca9bc580_generated_image.png') },
  { id: 'anim_espiritu', name: 'Espíritu Guardián', hero: 'Batu', clan: 'Magos', url: M('e20f77c2e_generated_image.png') },
  { id: 'anim_drenaje', name: 'Drenaje Vital', hero: 'Nixara', clan: 'Magos', url: M('16ec909b5_generated_image.png') },
  { id: 'anim_disparo_silencioso', name: 'Disparo Silencioso', hero: 'Zarmanda', clan: 'Elfos', url: M('5ae5d65cf_generated_image.png') },
];

// 4. Bizarros — arte de los héroes bizarros
export const BIZARRO_EMOJIS = [
  { id: 'biz_butifarra', name: 'La Butifarra', clan: 'Bizarros', ability: 'Petardeo', url: F('85a2086e4_card_art.jpg') },
  { id: 'biz_lavadora', name: 'La Lavadora', clan: 'Bizarros', ability: 'Centrifugado', url: F('57f1541b8_card_art.jpg') },
  { id: 'biz_bañador', name: 'El Bañador', clan: 'Bizarros', ability: 'Masaje', url: F('6551d4340_card_art.jpg') },
  { id: 'biz_caja', name: 'La Caja de Zapatos', clan: 'Bizarros', ability: 'Guardar un Zapato', url: F('996283b89_card_art.jpg') },
  { id: 'biz_pez', name: 'El Pez Espada', clan: 'Bizarros', ability: 'Licor de Tres Ojos', url: F('a050e88e8_card_art.jpg') },
  { id: 'biz_patito', name: 'Patito de Goma', clan: 'Bizarros', ability: 'Picotazo', url: M('34e71934f_generated_image.png') },
];

// Alias de compatibilidad para el ChatOverlay existente
export const HERO_EMOJIS = HERO_STICKER_EMOJIS;

// Todas las categorías para el selector con pestañas
export const EMOJI_CATEGORIES = [
  { id: 'stickers', label: 'Reacciones', emojis: HERO_STICKER_EMOJIS },
  { id: 'heroes', label: 'Héroes', emojis: HERO_ART_EMOJIS },
  { id: 'abilities', label: 'Habilidades', emojis: ABILITY_EMOJIS },
  { id: 'bizarros', label: 'Bizarros', emojis: BIZARRO_EMOJIS },
];