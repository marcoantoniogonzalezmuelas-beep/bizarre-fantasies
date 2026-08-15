// Fórmula de maná del héroe: MANA_BASE[tipo] + CLAN_MANA_BONUS[clan].
// El editor usa esta fórmula para rellenar el campo "mana" automáticamente al
// generar stats, de forma que la BD siempre es la fuente de verdad del maná
// (igual que con el resto de stats). El juego aplica la misma fórmula como
// fallback cuando un héroe no tiene maná en la BD.
export const MANA_BASE = { HE: 28, AD: 12, CC: 6 };

export const CLAN_MANA_BONUS = {
  Guerreros: -2,
  Druidas: 12,
  'No-muertos': 7,
  Vaqueros: -2,
  Elfos: 7,
  Magos: 16,
  Épicas: 9,
  Cotidianos: 7,
  Bizarros: 0,
};

export function calcHeroMana(type, clan) {
  const base = MANA_BASE[type] || 0;
  const bonus = CLAN_MANA_BONUS[clan] || 0;
  return Math.max(0, base + bonus);
}