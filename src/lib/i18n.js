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
  'Oráculo Bizarro': 'Bizarre Oracle',
  'ORÁCULO BIZARRO': 'BIZARRE ORACLE',
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
  // --- Guía "Conocer las Cartas" ---
  'Conocer las Cartas': 'Know the Cards',
  'En Bizarre Fantasies cada carta es un héroe, un hechizo, un arma, una armadura, un objeto o un bonificador. Esta guía explica qué es cada tipo, qué hace en el juego y qué significa cada stat. Empieza por las partes de una carta:': 'In Bizarre Fantasies every card is a hero, a spell, a weapon, an armor, an item or a booster. This guide explains what each type is, what it does in the game and what each stat means. Start with the parts of a card:',
  'Cómo usar esta guía:': 'How to use this guide:',
  'pasa el ratón (o toca en el móvil) sobre cada marcador de la carta para ver qué es: el coste de oro, la vida (HP), CC, AD, HE, el maná y la habilidad. También puedes pasar el ratón por la lista de la derecha y se señalará lo mismo en la carta.': 'hover (or tap on mobile) over each marker on the card to see what it is: the gold cost, health (HP), CC, AD, HE, mana and the ability. You can also hover over the list on the right and the same spot will be highlighted on the card.',
  'Partes de una carta de equipamiento': 'Parts of an equipment card',
  'Hechizos, armas, armaduras y objetos comparten el mismo diseño: el coste de oro arriba a la izquierda, el texto de la habilidad abajo y, solo en los hechizos, el orbe azul de maná arriba a la derecha. Aquí tienes un hechizo de ejemplo:': 'Spells, weapons, armors and items share the same layout: the gold cost at the top left, the ability text at the bottom and, only on spells, the blue mana orb at the top right. Here is an example spell:',
  'Armas a distancia': 'Ranged Weapons',
  'Tus combatientes. Formas un equipo de 3 héroes, uno de cada tipo: CC (cuerpo a cuerpo), AD (a distancia) y HE (magia). Cada uno tiene sus stats, una habilidad propia y una forma Élite que renace al caer. Aquí tienes un ejemplo de cada tipo:': 'Your fighters. You build a team of 3 heroes, one of each type: CC (melee), AD (ranged) and HE (magic). Each has its stats, a signature ability and an Elite form that is reborn when it falls. Here is an example of each type:',
  'Héroes especiales e impredecibles. No salen en subasta: aparecen en plena batalla de forma sorpresiva. Cada uno rompe las reglas a su manera.': 'Special, unpredictable heroes. They never appear in the auction: they show up mid-battle as a surprise. Each one breaks the rules in its own way.',
  'Cartas únicas (1 sola copia) que gastan maná 🔵 para lanzarse. Van a tu mano. Los hay de fuego, hielo, rayo, agua, curación, protección, arcano y estado. El coste de maná va en el orbe azul arriba a la derecha.': 'Unique cards (a single copy) that spend mana 🔵 to be cast. They go to your hand. There are fire, ice, lightning, water, healing, protection, arcane and status spells. The mana cost is shown in the blue orb at the top right.',
  'Potencian el disparo: el daño de un héroe AD es la potencia del arma × su AD. Solo los héroes AD pueden equiparlas y disparar.': 'They boost the shot: an AD hero’s damage is the weapon’s power × its AD. Only AD heroes can equip them and shoot.',
  'Potencian el golpe cuerpo a cuerpo: el daño melé es tu CC + el arma. Solo los héroes CC las equipan.': 'They boost the melee strike: melee damage is your CC + the weapon. Only CC heroes equip them.',
  'Reducen el daño recibido. Las elementales anulan por completo su elemento contrario (agua↔fuego, rayo↔agua, hielo↔rayo, fuego↔hielo). La Barrera Arcana protege del daño mágico.': 'They reduce incoming damage. Elemental armors fully negate their opposing element (water↔fire, lightning↔water, ice↔lightning, fire↔ice). The Arcane Barrier protects from magic damage.',
  'Consumibles que van a tu mano (hasta 3 copias de cada): pociones de vida, cristales de maná, orbes… Se usan en batalla y van al descarte al consumirse.': 'Consumables that go to your hand (up to 3 copies each): health potions, mana crystals, orbs… They are used in battle and go to the discard pile once consumed.',
  'Cartas que modifican la partida: más monedas, ventajas para ti o castigos al rival. Cada ronda de subasta trae uno único que no se repite.': 'Cards that change the match: more coins, perks for you or penalties for your rival. Each auction round brings a unique one that never repeats.',
  'Explorar el Oráculo completo': 'Explore the full Oracle',
  'Glosario de stats': 'Stat glossary',
};

export const t = (es) => (getLang() === 'en' ? (UI_EN[es] ?? es) : es);