// Datos de la sección "Jugadores" del backoffice: quién ha jugado, cuándo, con
// qué resultados, y los enfrentamientos entre nicks. Permite resetear los
// resultados de un nick o de un enfrentamiento concreto.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';

const norm = (s) => String(s || '').trim().toLowerCase();

export function monthKey(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(key) {
  if (!key) return '';
  const [y, m] = key.split('-');
  const names = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${names[Number(m) - 1]} ${y}`;
}

export function usePlayersAdmin() {
  const [matches, setMatches] = useState([]);
  const [h2h, setH2h] = useState([]);
  const [progress, setProgress] = useState([]);
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    const [m, h, p, a] = await Promise.all([
      base44.entities.MatchResult.list('-created_date', 2000).catch(() => []),
      base44.entities.HeadToHead.list('-updated_date', 1000).catch(() => []),
      base44.entities.PlayerAiProgress.list('-updated_date', 1000).catch(() => []),
      base44.entities.PlayerAvatar.list('-updated_date', 1000).catch(() => []),
    ]);
    setMatches(m || []); setH2h(h || []); setProgress(p || []); setAvatars(a || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const months = useMemo(() => {
    const set = new Set();
    matches.forEach(mt => { const k = monthKey(mt.created_date); if (k) set.add(k); });
    return [...set].sort().reverse();
  }, [matches]);

  const visibleMatches = useMemo(
    () => (month === 'all' ? matches : matches.filter(mt => monthKey(mt.created_date) === month)),
    [matches, month]
  );

  const avatarOf = useCallback((nick) => {
    const found = avatars.find(a => norm(a.nick) === norm(nick));
    return found?.avatar_url || '';
  }, [avatars]);

  // Jugadores: se agregan victorias/derrotas del periodo filtrado, la primera y
  // la última partida, y los modos jugados.
  const players = useMemo(() => {
    const map = {};
    const get = (nick, isAi) => {
      const k = norm(nick);
      if (!map[k]) map[k] = { nick: String(nick), key: k, isAi: !!isAi, wins: 0, losses: 0, first: null, last: null, modes: new Set() };
      return map[k];
    };
    visibleMatches.forEach(mt => {
      const when = new Date(mt.created_date);
      [[mt.winner_nick, mt.winner_is_ai, true], [mt.loser_nick, mt.loser_is_ai, false]].forEach(([nick, isAi, won]) => {
        if (!nick) return;
        const p = get(nick, isAi);
        if (won) p.wins++; else p.losses++;
        if (mt.mode) p.modes.add(mt.mode);
        if (!p.first || when < p.first) p.first = when;
        if (!p.last || when > p.last) p.last = when;
      });
    });
    return Object.values(map)
      .map(p => ({ ...p, modes: [...p.modes], games: p.wins + p.losses, avatar: avatarOf(p.nick) }))
      .sort((a, b) => (b.last?.getTime() || 0) - (a.last?.getTime() || 0));
  }, [visibleMatches, avatarOf]);

  // Enfrentamientos entre nicks (marcador histórico de la BD).
  const pairs = useMemo(() => {
    const map = {};
    h2h.forEach(r => {
      if (!r.pair_key) return;
      const rec = (map[r.pair_key] = map[r.pair_key] || { pair_key: r.pair_key, scores: {}, ids: [], updated: null });
      rec.scores[norm(r.nick)] = Math.max(rec.scores[norm(r.nick)] || 0, r.wins || 0);
      rec.ids.push(r.id);
      const u = new Date(r.updated_date);
      if (!rec.updated || u > rec.updated) rec.updated = u;
    });
    return Object.values(map).map(rec => {
      const [a, b] = rec.pair_key.split('||');
      return { ...rec, a, b, aWins: rec.scores[a] || 0, bWins: rec.scores[b] || 0 };
    }).sort((x, y) => (y.updated?.getTime() || 0) - (x.updated?.getTime() || 0));
  }, [h2h]);

  // Resetea TODO el histórico de un nick: partidas, enfrentamientos y progreso IA.
  const resetPlayer = useCallback(async (nick) => {
    const k = norm(nick);
    const targets = [
      ...matches.filter(m => norm(m.winner_nick) === k || norm(m.loser_nick) === k).map(m => ['MatchResult', m.id]),
      ...h2h.filter(r => norm(r.nick) === k || String(r.pair_key || '').split('||').includes(k)).map(r => ['HeadToHead', r.id]),
      ...progress.filter(p => norm(p.nick) === k).map(p => ['PlayerAiProgress', p.id]),
    ];
    for (const [entity, id] of targets) await base44.entities[entity].delete(id).catch(() => {});
    await load();
  }, [matches, h2h, progress, load]);

  // Resetea solo un enfrentamiento (marcador entre dos nicks y sus partidas).
  const resetPair = useCallback(async (pair) => {
    const [a, b] = pair.pair_key.split('||');
    for (const id of pair.ids) await base44.entities.HeadToHead.delete(id).catch(() => {});
    const between = matches.filter(m => {
      const w = norm(m.winner_nick), l = norm(m.loser_nick);
      return (w === a && l === b) || (w === b && l === a);
    });
    for (const m of between) await base44.entities.MatchResult.delete(m.id).catch(() => {});
    await load();
  }, [matches, load]);

  return { loading, month, setMonth, months, players, pairs, matches: visibleMatches, resetPlayer, resetPair, reload: load };
}