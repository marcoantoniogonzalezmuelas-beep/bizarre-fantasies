import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PlayerRow from '@/components/admin/players/PlayerRow';
import PairRow from '@/components/admin/players/PairRow';
import { usePlayersAdmin, monthLabel } from '@/hooks/usePlayersAdmin';

export default function AdminPlayers() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [query, setQuery] = useState('');
  const { loading, month, setMonth, months, players, pairs, matches, resetPlayer, resetPair } = usePlayersAdmin();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setChecking(false)); }, []);

  if (checking) return <div className="min-h-screen bg-[#0e0a16] p-8 text-[#efe9dc]">Cargando…</div>;
  if (user?.role !== 'admin') return <div className="min-h-screen bg-[#0e0a16] p-8 text-center text-[#efe9dc]"><h1 className="font-heading text-3xl font-black">Jugadores</h1><p className="mt-4 text-[#cfc6dd]">Esta zona sólo está disponible para administradores.</p><Link to="/" className="mt-6 inline-block rounded-xl bg-[#ffd24a] px-5 py-3 font-black text-[#3a2600]">Volver al juego</Link></div>;

  const q = query.trim().toLowerCase();
  const shownPlayers = q ? players.filter(p => p.key.includes(q)) : players;
  const shownPairs = q ? pairs.filter(p => p.pair_key.includes(q)) : pairs;

  return (
    <div className="min-h-screen bg-[#0e0a16] px-4 py-6 text-[#efe9dc] md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-black text-[#fff5dc]">Jugadores y enfrentamientos</h1>
            <p className="mt-1 text-sm text-[#cfc6dd]">Quién ha jugado, cuándo y con qué resultados. Puedes resetear el histórico de un nick o el marcador de un enfrentamiento.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/estadisticas-heroes" className="rounded-xl border border-[#66ffaa66] px-4 py-2 text-sm font-black text-[#9dffcf] hover:bg-[#66ffaa] hover:text-[#0a1f0e]">Stats héroes</Link>
            <Link to="/admin" className="rounded-xl border border-[#ffd24a66] px-4 py-2 text-sm font-black text-[#ffe49a] hover:bg-[#ffd24a] hover:text-[#3a2600]">Backoffice de cartas</Link>
            <Link to="/" className="rounded-xl border border-[#ffd24a66] px-4 py-2 text-sm font-black text-[#ffe49a] hover:bg-[#ffd24a] hover:text-[#3a2600]">Volver al juego</Link>
          </div>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar nick…" className="rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]" />
          <select value={month} onChange={e => setMonth(e.target.value)} className="rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]">
            <option value="all">Todos los meses</option>
            {months.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
        </div>

        {loading ? <p className="text-sm text-[#cfc6dd]">Cargando datos…</p> : (
          <div className="grid gap-6">
            <section className="rounded-3xl border border-[#ffd24a33] bg-[#140d24]/90 p-4 md:p-6">
              <h2 className="mb-3 font-heading text-xl font-black text-[#ffe49a]">Jugadores · {shownPlayers.length} · {matches.length} partidas</h2>
              <div className="grid gap-2">
                {shownPlayers.map(p => <PlayerRow key={p.key} player={p} onReset={resetPlayer} />)}
                {!shownPlayers.length && <p className="text-sm text-[#cfc6dd]">No hay partidas registradas en este periodo.</p>}
              </div>
            </section>

            <section className="rounded-3xl border border-[#ffd24a33] bg-[#140d24]/90 p-4 md:p-6">
              <h2 className="mb-1 font-heading text-xl font-black text-[#ffe49a]">Enfrentamientos entre nicks · {shownPairs.length}</h2>
              <p className="mb-3 text-xs text-[#cfc6dd]">Marcador histórico acumulado (no depende del filtro de mes).</p>
              <div className="grid gap-2">
                {shownPairs.map(p => <PairRow key={p.pair_key} pair={p} onReset={resetPair} />)}
                {!shownPairs.length && <p className="text-sm text-[#cfc6dd]">Todavía no hay enfrentamientos registrados.</p>}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}