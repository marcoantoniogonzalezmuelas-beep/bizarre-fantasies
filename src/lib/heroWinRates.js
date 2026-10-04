// EQUILIBRADO: victorias, derrotas y % de victorias de cada héroe a partir de los resultados de partida
// (MatchResult.winner_heroes / loser_heroes). Por debajo de MIN_GAMES partidas no se da porcentaje (no es fiable).
export const MIN_GAMES = 5;
const norm = (s) => String(s || '').trim().toLowerCase();

export function heroWinRates(results) {
  const map = {};
  const get = (name) => { const k = norm(name); if (!map[k]) map[k] = { key: k, name: String(name), wins: 0, losses: 0 }; return map[k]; };
  (results || []).forEach((r) => {
    if (!r) return;
    const seen = new Set();
    (r.winner_heroes || []).forEach((h) => { if (h && h.name && !seen.has('w' + norm(h.name))) { seen.add('w' + norm(h.name)); get(h.name).wins++; } });
    (r.loser_heroes || []).forEach((h) => { if (h && h.name && !seen.has('l' + norm(h.name))) { seen.add('l' + norm(h.name)); get(h.name).losses++; } });
  });
  Object.values(map).forEach((x) => {
    x.played = x.wins + x.losses;
    x.winRate = x.played >= MIN_GAMES ? Math.round((x.wins / x.played) * 100) : null;
  });
  return map;
}
