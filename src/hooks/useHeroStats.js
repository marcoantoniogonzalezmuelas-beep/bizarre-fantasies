// Datos de la sección "Estadísticas de héroes" del backoffice: qué héroes se
// compran más y menos en las subastas. Cada aparición de un héroe en
// player_heroes / opponent_heroes de un GameLog cuenta como una compra en
// subasta. Se cruza con la entidad Card para mostrar raza, rol y arte.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { heroWinRates } from '@/lib/heroWinRates';

const norm = (s) => String(s || '').trim().toLowerCase();

export function useHeroStats() {
  const [logs, setLogs] = useState([]);
  const [cards, setCards] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [l, c, m] = await Promise.all([
      base44.entities.GameLog.list('-created_date', 2000).catch(() => []),
      base44.entities.Card.list('-number', 500).catch(() => []),
      base44.entities.MatchResult.list('-created_date', 3000).catch(() => []),
    ]);
    setLogs(l || []); setCards(c || []); setResults(m || []); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const cardByName = useMemo(() => {
    const m = {};
    (cards || []).forEach((card) => { if (card.name) m[norm(card.name)] = card; });
    return m;
  }, [cards]);

  // Cuenta cuántas veces se ha comprado cada héroe en subastas.
  const stats = useMemo(() => {
    const map = {};
    const get = (name) => {
      const k = norm(name);
      if (!map[k]) map[k] = { name: String(name), key: k, count: 0, eliteCount: 0 };
      return map[k];
    };
    logs.forEach((log) => {
      const add = (arr) => {
        (arr || []).forEach((h) => {
          if (!h || !h.name) return;
          const r = get(h.name);
          r.count++;
          if (h.elite) r.eliteCount++;
        });
      };
      add(log.player_heroes);
      add(log.opponent_heroes);
    });
    // % de victorias de cada héroe (resultados de partida); también aparecen los que no salen en las subastas.
    const wr = heroWinRates(results);
    Object.values(wr).forEach((w) => { if (!map[w.key]) map[w.key] = { name: w.name, key: w.key, count: 0, eliteCount: 0 }; });
    return Object.values(map)
      .map((r) => ({ ...r, ...(wr[r.key] ? { wins: wr[r.key].wins, losses: wr[r.key].losses, played: wr[r.key].played, winRate: wr[r.key].winRate } : { wins: 0, losses: 0, played: 0, winRate: null }), card: cardByName[r.key] }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [logs, results, cardByName]);

  const totalPicks = useMemo(() => stats.reduce((s, r) => s + r.count, 0), [stats]);

  return { loading, stats, totalPicks, games: logs.length, reload: load };
}