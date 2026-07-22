// Sistema de idioma global: ES (original) / EN. La elección persiste en
// localStorage y se aplica en todas las páginas. Cambiar de idioma recarga la
// página para que el juego (iframe) se reconstruya con la traducción activa.
export const getLang = () => {
  try { return localStorage.getItem('bfLang') || 'es'; } catch { return 'es'; }
};

export const setLang = (lang) => {
  try { localStorage.setItem('bfLang', lang); } catch { /* noop */ }
  window.location.reload();
};

// Textos de la interfaz React (páginas Cartas, Razas, Ranking, Portada),
// indexados por su texto original en español.
const UI_EN = {
  'Héroes': 'Heroes',
  'Hechizos': 'Spells',
  'Armas Dist.': 'Ranged Wpns',
  'Armas C/C': 'Melee Wpns',
  'Armaduras': 'Armors',
  'Objetos': 'Objects',
  'Héroes bizarros': 'Bizarre Heroes',
  'Bonificadores': 'Boosters',
  'Razas': 'Races',
  'Todos': 'All',
  'Guerreros': 'Warriors',
  'Druidas': 'Druids',
  'No-muertos': 'Undead',
  'Vaqueros': 'Cowboys',
  'Elfos': 'Elves',
  'Magos': 'Mages',
  'Épicas': 'Epics',
  'Cotidianos': 'Everyday Folk',
  'Buscar héroe...': 'Search hero...',
  'cartas · Base Set': 'cards · Base Set',
  'Volver': 'Back',
  'No se encontraron héroes con esos filtros.': 'No heroes match those filters.',
  'Aún no hay Bizarros en el catálogo.': 'No Bizarros in the catalog yet.',
  'RAZAS': 'RACES',
  '9 razas · potenciadores aplicados en batalla': '9 races · boosts applied in battle',
  '← Volver al juego': '← Back to the game',
  'Top Ranking': 'Top Ranking',
  'El salón de la fama de Bizarre Fantasies': 'The Bizarre Fantasies hall of fame',
  'partidas registradas': 'battles recorded',
  'Mejores jugadores': 'Greatest Players',
  'Héroes más victoriosos': 'Most Victorious Heroes',
  'Héroes más derrotados': 'Most Defeated Heroes',
  'Héroes más veces caídos': 'Most Fallen Heroes',
  'Renaceres Élite': 'Elite Rebirths',
  'victorias': 'victories',
  'batallas ganadas': 'battles won',
  'batallas perdidas': 'battles lost',
  'caídas': 'falls',
  'renaceres': 'rebirths',
  'partidas': 'matches',
  'Nadie ha ganado todavía. ¡Sé el primero en entrar en la leyenda!': 'No one has triumphed yet. Be the first to enter legend!',
  'Ningún héroe ha renacido en su forma Élite aún.': 'No hero has been reborn in Elite form yet.',
  'cartas': 'cards',
  'No se pudo cargar el juego. Recarga la página para intentarlo de nuevo.': 'The game could not be loaded. Reload the page to try again.',
};

export const t = (es) => (getLang() === 'en' ? (UI_EN[es] ?? es) : es);