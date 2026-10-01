// NICK CANÓNICO. Un jugador es el mismo jugador aunque cambie las mayúsculas de su nick, y una IA
// es la misma IA aunque el juego esté en inglés. Antes el nick de la IA cambiaba con el idioma
// ("IA Novata" / "AI Novice"): al cambiar de idioma el marcador contra la IA y el ranking se
// partían en dos, y "Ana"/"ana" contaban como dos jugadores en el ranking.
// (Misma tabla en base44/shared/nickCanon.ts; un test comprueba que no se desincronizan.)
export const AI_NAMES = [
  { id: 'novice', es: 'IA Novata', en: 'AI Novice' },
  { id: 'berserker', es: 'IA Bersérker', en: 'AI Berserker' },
  { id: 'strategist', es: 'IA Estratega', en: 'AI Strategist' },
  { id: 'nemesis', es: 'IA Némesis', en: 'AI Nemesis' },
  { id: 'bizarra', es: 'IA Bizarra', en: 'Bizarre AI' },
];
export const AI_LEVEL_NICKS = Object.fromEntries(AI_NAMES.map((a) => [a.id, a.es]));

const EN_TO_ES = Object.fromEntries(AI_NAMES.map((a) => [a.en.toLowerCase(), a.es]));
const ES_TO_EN = Object.fromEntries(AI_NAMES.map((a) => [a.es.toLowerCase(), a.en]));

export function canonNick(n) {
  const s = String(n == null ? '' : n).trim();
  return EN_TO_ES[s.toLowerCase()] || s;
}
export const nickKey = (n) => canonNick(n).toLowerCase();

// Para MOSTRAR: las IAs en el idioma activo; las personas, con la primera grafía vista (en el
// ranking los resultados vienen del más reciente al más antiguo, así que es la última que usó).
export function makeNickDisplay(lang) {
  const seen = Object.create(null);
  return (n) => {
    const key = nickKey(n);
    if (!seen[key]) {
      const c = canonNick(n);
      seen[key] = lang === 'en' && ES_TO_EN[c.toLowerCase()] ? ES_TO_EN[c.toLowerCase()] : c;
    }
    return seen[key];
  };
}

// Normaliza una clave de pareja "a||b" (nicks en minúsculas, ordenados) a su forma canónica.
export function canonPairKey(pairKey) {
  const parts = String(pairKey || '').split('||');
  if (parts.length !== 2) return String(pairKey || '');
  return parts.map(nickKey).sort().join('||');
}

// Versión para el iframe del juego: window.bfCanonNick / window.bfNickKey.
export const NICK_CANON_PATCH = `
<script>
(function(){
  if(window.bfNickKey)return;
  var EN=${JSON.stringify(EN_TO_ES)};
  window.bfCanonNick=function(n){var s=String(n==null?'':n).trim();return EN[s.toLowerCase()]||s;};
  window.bfNickKey=function(n){return window.bfCanonNick(n).toLowerCase();};
})();
</script>
`;
