// Nick canónico en el servidor (misma tabla que src/lib/nickCanon.js; un test las compara).
// Un jugador es el mismo aunque cambie las mayúsculas, y una IA es la misma aunque el juego esté
// en inglés: así el ranking y el marcador no se parten por idioma.
const AI_EN_TO_ES: Record<string, string> = {
  'ai novice': 'IA Novata',
  'ai berserker': 'IA Bersérker',
  'ai strategist': 'IA Estratega',
  'ai nemesis': 'IA Némesis',
  'bizarre ai': 'IA Bizarra',
};

export function canonNick(n: unknown): string {
  const s = String(n == null ? '' : n).trim();
  return AI_EN_TO_ES[s.toLowerCase()] || s;
}
export const nickKey = (n: unknown): string => canonNick(n).toLowerCase();

export function canonPairKey(pairKey: unknown): string {
  const parts = String(pairKey || '').split('||');
  if (parts.length !== 2) return String(pairKey || '');
  return parts.map(nickKey).sort().join('||');
}
