// ESTADÍSTICAS DEL BACKOFFICE (todo con datos que el juego ya guarda):
//   · MatchResult: ganador/perdedor, héroes de cada bando (si murieron y si pasaron a élite), modo y nivel de IA.
//   · GameLog: duración, rondas, modo y el equipo de los dos bandos (items_bought: {name, side}).
// Los porcentajes solo se dan con un mínimo de partidas (MIN_GAMES), para no sacar conclusiones de 1 o 2 partidas.
export const MIN_GAMES = 5;
const norm = (s) => String(s || '').trim().toLowerCase();
const pct = (a, b) => (b ? Math.round((a / b) * 100) : null);
export const GEAR_CATS = [
  { key: 'melee_weapon', label: '⚔️ Armas C/C' }, { key: 'ranged_weapon', label: '🏹 Armas a distancia' },
  { key: 'armor', label: '🛡️ Armaduras' }, { key: 'spell', label: '✨ Hechizos' }, { key: 'object', label: '🧪 Objetos' },
];

export function summaryStats(results, logs) {
  const byMode = {};
  (results || []).forEach((r) => { const m = r && (r.mission ? 'misión' : (r.mode || 'otro')); if (m) byMode[m] = (byMode[m] || 0) + 1; });
  const durs = (logs || []).map((l) => Number(l && l.duration_seconds)).filter((x) => x > 0 && x < 6 * 3600);
  const turns = (logs || []).map((l) => Number(l && l.turns_played)).filter((x) => x > 0 && x < 500);
  const avg = (a) => (a.length ? Math.round(a.reduce((s, x) => s + x, 0) / a.length) : null);
  return { games: (results || []).length, logs: (logs || []).length, byMode, avgSeconds: avg(durs), avgRounds: avg(turns) };
}

export function heroRanking(results) {
  const map = {};
  const get = (n) => { const k = norm(n); if (!map[k]) map[k] = { key: k, name: String(n), wins: 0, losses: 0, survived: 0, elite: 0 }; return map[k]; };
  (results || []).forEach((r) => {
    if (!r) return;
    [['winner_heroes', true], ['loser_heroes', false]].forEach(([f, won]) => {
      const seen = new Set();
      (r[f] || []).forEach((h) => {
        if (!h || !h.name || seen.has(norm(h.name))) return;
        seen.add(norm(h.name));
        const x = get(h.name);
        if (won) x.wins++; else x.losses++;
        if (h.died === false) x.survived++;
        if (h.elite) x.elite++;
      });
    });
  });
  return Object.values(map).map((x) => {
    const played = x.wins + x.losses;
    return { ...x, played, winRate: played >= MIN_GAMES ? pct(x.wins, played) : null, survivalRate: played >= MIN_GAMES ? pct(x.survived, played) : null, eliteRate: played >= MIN_GAMES ? pct(x.elite, played) : null };
  });
}

// cards: filas de Card (para saber la categoría de cada nombre de equipo).
export function gearRanking(logs, cards) {
  const cat = {};
  (cards || []).forEach((c) => { if (c && c.name) cat[norm(c.name)] = c.category; });
  const map = {};
  (logs || []).forEach((l) => {
    if (!l) return;
    const seen = new Set();
    (l.items_bought || []).forEach((it) => {
      const k = norm(it && it.name);
      if (!k || !cat[k] || !GEAR_CATS.some((g) => g.key === cat[k])) return;   // descarta registros antiguos sin carta ("p")
      const side = it.side === 'o' ? 'o' : 'p';
      if (seen.has(side + k)) return;
      seen.add(side + k);
      if (!map[k]) map[k] = { key: k, name: String(it.name), category: cat[k], used: 0, wins: 0 };
      map[k].used++;
      const won = side === 'p' ? !!l.player_won : !l.player_won;
      if (won) map[k].wins++;
    });
  });
  return Object.values(map).map((x) => ({ ...x, winRate: x.used >= MIN_GAMES ? pct(x.wins, x.used) : null }));
}

// Jugadores contra cada nivel de IA (solo partidas jugador contra IA).
export function aiStats(results) {
  const map = {};
  (results || []).forEach((r) => {
    if (!r || r.mission) return;
    const vsAi = r.winner_is_ai || r.loser_is_ai;
    if (!vsAi) return;
    const lvl = String(r.ai_level || 'sin nivel');
    if (!map[lvl]) map[lvl] = { level: lvl, games: 0, humanWins: 0 };
    map[lvl].games++;
    if (!r.winner_is_ai) map[lvl].humanWins++;
  });
  return Object.values(map).map((x) => ({ ...x, humanWinRate: pct(x.humanWins, x.games) })).sort((a, b) => b.games - a.games);
}

// Mejores y peores por % de victorias (solo con partidas suficientes), y los más usados.
export function topBottom(rows, rateKey = 'winRate', n = 10) {
  const rated = rows.filter((r) => r[rateKey] != null);
  const best = [...rated].sort((a, b) => b[rateKey] - a[rateKey] || b.played - a.played).slice(0, n);
  const worst = [...rated].sort((a, b) => a[rateKey] - b[rateKey] || b.played - a.played).slice(0, n);
  return { best, worst, unrated: rows.length - rated.length };
}
