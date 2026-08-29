import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useHeroStats } from '@/hooks/useHeroStats';
import HeroStatRow from '@/components/admin/heroes/HeroStatRow';

export default function AdminHeroStats() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [query, setQuery] = useState('');
  const { loading, stats, totalPicks, games } = useHeroStats();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setChecking(false)); }, []);

  if (checking) return <div className="min-h-screen bg-[#0e0a16] p-8 text-[#efe9dc]">Cargando…</div>;
  if (user?.role !== 'admin') return <div className="min-h-screen bg-[#0e0a16] p-8 text-center text-[#efe9dc]"><h1 className="font-heading text-3xl font-black">Estadísticas de héroes</h1><p className="mt-4 text-[#cfc6dd]">Esta zona sólo está disponible para administradores.</p><Link to="/" className="mt-6 inline-block rounded-xl bg-[#ffd24a] px-5 py-3 font-black text-[#3a2600]">Volver al juego</Link></div>;

  const q = query.trim().toLowerCase();
  const shown = q ? stats.filter((s) => s.key.includes(q)) : stats;
  const maxCount = stats[0]?.count || 1;
  const most = shown.slice(0, 25);
  const least = [...shown].reverse().slice(0, 25);

  return (
    <div className="min-h-screen bg-[#0e0a16] px-4 py-6 text-[#efe9dc] md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-black text-[#fff5dc]">Estadísticas de héroes</h1>
            <p className="mt-1 text-sm text-[#cfc6dd]">Héroes más y menos comprados en las subastas, a partir de {games} partidas registradas ({totalPicks} compras totales).</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/jugadores" className="rounded-xl border border-[#ffb34a66] px-4 py-2 text-sm font-black text-[#ffcf8a] hover:bg-[#ffb34a] hover:text-[#3a2600]">Jugadores</Link>
            <Link to="/admin" className="rounded-xl border border-[#ffd24a66] px-4 py-2 text-sm font-black text-[#ffe49a] hover:bg-[#ffd24a] hover:text-[#3a2600]">Backoffice de cartas</Link>
            <Link to="/" className="rounded-xl border border-[#ffd24a66] px-4 py-2 text-sm font-black text-[#ffe49a] hover:bg-[#ffd24a] hover:text-[#3a2600]">Volver al juego</Link>
          </div>
        </div>

        <div className="mb-5">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar héroe por nombre…" className="w-full max-w-sm rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]" />
        </div>

        {loading ? <p className="text-sm text-[#cfc6dd]">Cargando datos…</p> : (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-[#ffd24a33] bg-[#140d24]/90 p-4 md:p-6">
              <h2 className="mb-3 font-heading text-xl font-black text-[#ffe49a]">🏆 Más comprados · {shown.length}</h2>
              <div className="grid gap-2">
                {most.map((s, i) => <HeroStatRow key={s.key} stat={s} max={maxCount} rank={i + 1} />)}
                {!most.length && <p className="text-sm text-[#cfc6dd]">No hay partidas registradas todavía.</p>}
              </div>
            </section>
            <section className="rounded-3xl border border-[#ffd24a33] bg-[#140d24]/90 p-4 md:p-6">
              <h2 className="mb-3 font-heading text-xl font-black text-[#ffe49a]">📉 Menos comprados · {shown.length}</h2>
              <div className="grid gap-2">
                {least.map((s, i) => <HeroStatRow key={s.key} stat={s} max={maxCount} rank={shown.length - i} />)}
                {!least.length && <p className="text-sm text-[#cfc6dd]">No hay partidas registradas todavía.</p>}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}