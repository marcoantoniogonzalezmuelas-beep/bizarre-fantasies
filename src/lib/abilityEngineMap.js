// Mapa de mecánicas del motor por número de héroe (1-45).
//
// El motor del juego resuelve cada habilidad con una mecánica genérica (akind).
// FAITHFUL marca los héroes cuya habilidad se resuelve además con una
// implementación exacta al texto de la carta (parche faithfulAbilitiesPatch).
// Sirve para que el editor avise si una carta se está quedando con un efecto
// genérico o directamente sin implementar.

export const ENGINE_AKIND = {
  1: 'aoe-cc', 2: 'debuff-all', 3: 'smash-equip', 4: 'self-buff', 5: 'shield-ally',
  6: 'execute', 7: 'debuff', 8: 'self-heal', 9: 'pierce-cc', 10: 'lifesteal-cc',
  11: 'crush-cc', 12: 'evade', 13: 'unblock-cc', 14: 'aoe-cc', 15: 'debuff',
  16: 'pierce-ad', 17: 'aoe-ad', 18: 'mark', 19: 'double-ad', 20: 'self-buff',
  21: 'double-ad', 22: 'pierce-ad', 23: 'debuff-all', 24: 'self-buff', 25: 'aoe-ad',
  26: 'big-ad', 27: 'big-ad', 28: 'big-he', 29: 'aoe-he', 30: 'big-he',
  31: 'shield-ally', 32: 'drain', 33: 'silence', 34: 'heal-all', 35: 'revive',
  36: 'heal-all', 37: 'big-he', 38: 'skip-turn', 39: 'debuff', 40: 'heal-ally',
  41: 'aoe-he', 42: 'big-he', 43: 'skip-turn', 44: 'big-he', 45: 'debuff-all',
};

// Héroes con implementación exacta al texto (parche de habilidades fieles).
export const FAITHFUL_NUMBERS = [2, 3, 4, 7, 8, 10, 12, 15, 16, 18, 19, 20, 21, 22, 24, 30, 31, 32, 36, 37, 39, 42, 44];

// Héroes con habilidad propia programada aparte (parches dedicados).
export const CUSTOM_NUMBERS = { 7: 'Llorilomo (disparos aleatorios y parálisis)', 38: 'Doji Conpuri (Pequeña/Gran Amenaza)', 114: 'Juniana (refracción)', 115: 'KillerDucks (tokens)', 118: 'Daidoji Esva (bonus por aliados)', 119: 'Grulla (token)', 122: 'Pegaso (tormenta de rayos)', 127: 'Monkgeta (Desorientado e Invisible)' };

// Efectos del texto que aún NO existen en el motor y hay que programar.
export const PENDING = {};

export function abilityAuditFor(number) {
  const n = Number(number);
  if (!n) return null;
  if (CUSTOM_NUMBERS[n]) return { level: 'ok', label: 'Habilidad propia programada', detail: CUSTOM_NUMBERS[n] };
  if (PENDING[n]) return { level: 'pending', label: 'Efecto pendiente de programar', detail: PENDING[n] };
  if (FAITHFUL_NUMBERS.includes(n)) return { level: 'ok', label: 'Implementada al pie de la letra', detail: `Mecánica base: ${ENGINE_AKIND[n]}, con los valores exactos del texto.` };
  if (ENGINE_AKIND[n]) return { level: 'generic', label: 'Mecánica genérica del motor', detail: `Usa "${ENGINE_AKIND[n]}". Revisa que el texto coincida con lo que hace esa mecánica.` };
  return { level: 'none', label: 'Sin implementación en el motor', detail: 'Esta carta hará un golpe genérico. Pídeme en el chat que programe su habilidad.' };
}