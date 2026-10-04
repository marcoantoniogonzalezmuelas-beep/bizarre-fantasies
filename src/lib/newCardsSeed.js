// CARTAS NUEVAS de equipo (se crean en la base de datos con el botón "Crear cartas nuevas" del backoffice).
// Cada una: la carta (Card) y sus parámetros del motor (AbilityImpl "equipment"). El arte se genera después
// desde el editor de cartas.
export const NEW_CARDS_SEED = [
  { card: { card_id: 'mw_staff', name: 'Bastón Extensible', category: 'melee_weapon', number: 130, cost: 14, cc: 3, type: 'CC', tag: '',
      description: '+3 CC. El golpe escala con tu HE. Hechizos +10%. Se alarga y alcanza también a un segundo rival con la mitad del daño.' },
    effect: { v: 1, he_mult: 1.2, spell_boost_pct: 10, reach_pct: 50 } },
  { card: { card_id: 'rw_wand', name: 'Varita de Juguete Bizarra', category: 'ranged_weapon', number: 131, cost: 8, power: 6, type: 'AD', tag: '',
      description: 'Disparo mágico que escala con tu HE. Hechizos +15%, y +30% contra la debilidad elemental de la armadura rival. 1 de cada 6: ¡¡PÍO!! y el hechizo hace doble daño.' },
    effect: { v: 1, hits: 1, shot_he: 1, spell_boost_pct: 15, weakness_bonus_pct: 30, toy_crit: 6 } },
  { card: { card_id: 'ar_spikes', name: 'Armadura de Pinchos', category: 'armor', number: 132, cost: 12, hp: 10, type: 'ARMOR', tag: '',
      description: '+10 HP. -3 cuerpo a cuerpo y -1 a distancia. Quien te golpee cuerpo a cuerpo recibe 4 de daño. Pesa: -2 de velocidad.' },
    effect: { v: 1, redM: 3, redA: 1, redH: 0, regen: 0, element: null, thorns: 4, vel: -2 } },
  { card: { card_id: 'ob_poison', name: 'Frasco de Veneno', category: 'object', number: 133, cost: 7, type: 'veneno', tag: 'veneno',
      description: 'Envenena a un rival: recibe 4 de daño al empezar cada uno de sus turnos, durante 3 turnos.' },
    effect: { v: 1, kind: 'bf_steps', val: 0, steps: [{ action: 'poison', target: 'enemy', amount: 4, turns: 3 }] } },
  { card: { card_id: 'sp_toxic', name: 'Nube Tóxica', category: 'spell', number: 134, cost: 11, mana: 9, type: 'arcano', tag: 'arcano',
      description: 'Envenena a todos los rivales durante 3 turnos. El veneno escala con tu Magia.' },
    effect: { v: 1, kind: 'bf_steps', element: 'arcano', steps: [{ action: 'poison', target: 'all_enemies', magic_base: 3, turns: 3 }] } },
];

// Ajustes de cartas que YA existen (solo los campos indicados; se aplican con el mismo botón).
export const CARD_UPDATES = [
  // Solo se aplica si la carta sigue con el valor antiguo (from): si lo cambias en el editor, no se vuelve a pisar.
  { card_id: 'sp_steal', from: { mana: 12 }, set: { mana: 20 }, why: 'El Ladrón Enmascarado cuesta 20 de maná.' },
];
