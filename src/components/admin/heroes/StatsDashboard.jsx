import React, { useMemo, useState } from 'react';
import { summaryStats, heroRanking, gearRanking, aiStats, topBottom, GEAR_CATS, MIN_GAMES } from '@/lib/adminStats';

// Panel de estadísticas del backoffice: resumen, ranking de héroes por victorias, equipo y partidas contra la IA.
const AI_NAMES = { novice: 'IA Novata', berserker: 'IA Bersérker', strategist: 'IA Estratega', nemesis: 'IA Némesis', bizarre: 'IA Bizarra' };
const color = (r) => (r == null ? '#8f86a3' : r >= 55 ? '#7ee07e' : r <= 45 ? '#ff8a8a' : '#efe9dc');
const fmtTime = (s) => (s == null ? '—' : `${Math.floor(s / 60)} min ${s % 60} s`);

function Card({ title, children }) {
  return <section className="rounded-3xl border border-[#ffd24a33] bg-[#140d24]/90 p-4 md:p-5"><h2 className="mb-3 font-heading text-lg font-black text-[#ffe49a]">{title}</h2>{children}</section>;
}
function Table({ rows, cols }) {
  if (!rows.length) return <p className="text-sm text-[#cfc6dd]">Aún no hay partidas suficientes (mínimo {MIN_GAMES} por carta).</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[12px]">
        <thead><tr className="text-[10px] uppercase tracking-wider text-[#8f86a3]">{cols.map((c) => <th key={c.k} className="px-2 py-1 font-black">{c.t}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={r.key || i} className="border-t border-white/5">
            {cols.map((c) => <td key={c.k} className="px-2 py-1.5 font-bold" style={c.color ? { color: color(r[c.k]) } : null}>{c.f ? c.f(r, i) : (r[c.k] == null ? '—' : r[c.k])}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
const rateCol = (k, t) => ({ k, t, color: true, f: (r) => (r[k] == null ? '—' : `${r[k]}%`) });

export default function StatsDashboard({ results, logs, cards }) {
  const [gearCat, setGearCat] = useState('melee_weapon');
  const S = useMemo(() => summaryStats(results, logs), [results, logs]);
  const heroes = useMemo(() => heroRanking(results), [results]);
  const heroTB = useMemo(() => topBottom(heroes), [heroes]);
  const gear = useMemo(() => gearRanking(logs, cards), [logs, cards]);
  const ai = useMemo(() => aiStats(results), [results]);
  const gearRows = gear.filter((g) => g.category === gearCat);
  const gearByUse = [...gearRows].sort((a, b) => b.used - a.used).slice(0, 12);
  const gearTB = topBottom(gearRows, 'winRate', 8);
  const heroCols = [{ k: 'rank', t: '#', f: (r, i) => i + 1 }, { k: 'name', t: 'Héroe' }, rateCol('winRate', 'Victorias'), { k: 'played', t: 'Partidas' }, rateCol('survivalRate', 'Sobrevive'), { k: 'eliteRate', t: 'Pasa a élite', f: (r) => (r.eliteRate == null ? '—' : `${r.eliteRate}%`) }];
  const gearCols = [{ k: 'rank', t: '#', f: (r, i) => i + 1 }, { k: 'name', t: 'Carta' }, { k: 'used', t: 'Usada' }, rateCol('winRate', 'Victorias')];

  return (
    <div className="mb-8 grid gap-6">
      <Card title="📊 Resumen">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[['Partidas', S.games], ['Registros de batalla', S.logs], ['Duración media', fmtTime(S.avgSeconds)], ['Rondas medias', S.avgRounds ?? '—']].map(([t, v]) => (
            <div key={t} className="rounded-2xl border border-white/10 bg-black/30 p-3"><div className="text-[10px] font-black uppercase tracking-wider text-[#8f86a3]">{t}</div><div className="mt-1 text-xl font-black text-[#fff5dc]">{v}</div></div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-[#cfc6dd]">
          {Object.entries(S.byMode).sort((a, b) => b[1] - a[1]).map(([m, n]) => <span key={m} className="rounded-full border border-white/10 px-3 py-1">{m}: <b className="text-[#fff5dc]">{n}</b></span>)}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="🏆 Héroes que más ganan"><Table rows={heroTB.best} cols={heroCols} /></Card>
        <Card title="💀 Héroes que menos ganan"><Table rows={heroTB.worst} cols={heroCols} /></Card>
      </div>
      {heroTB.unrated ? <p className="-mt-3 text-[11px] text-[#8f86a3]">{heroTB.unrated} héroes todavía con menos de {MIN_GAMES} partidas (sin porcentaje).</p> : null}

      <Card title="⚔️ Equipo">
        <div className="mb-3 flex flex-wrap gap-2">
          {GEAR_CATS.map((g) => (
            <button key={g.key} type="button" onClick={() => setGearCat(g.key)}
              className={`rounded-xl border px-3 py-1.5 text-[12px] font-black ${gearCat === g.key ? 'border-[#ffd24a] bg-[#ffd24a] text-[#3a2600]' : 'border-white/15 text-[#efe9dc] hover:bg-white/10'}`}>{g.label}</button>
          ))}
        </div>
        {!gear.length ? <p className="text-sm text-[#cfc6dd]">El equipo de cada partida se registra desde esta versión: las estadísticas irán apareciendo con las próximas partidas.</p> : (
          <div className="grid gap-5 lg:grid-cols-3">
            <div><div className="mb-1 text-[11px] font-black text-[#cfc6dd]">Más usadas</div><Table rows={gearByUse} cols={gearCols} /></div>
            <div><div className="mb-1 text-[11px] font-black text-[#7ee07e]">Las que más ganan</div><Table rows={gearTB.best} cols={gearCols} /></div>
            <div><div className="mb-1 text-[11px] font-black text-[#ff8a8a]">Las que menos ganan</div><Table rows={gearTB.worst} cols={gearCols} /></div>
          </div>
        )}
      </Card>

      <Card title="🤖 Jugadores contra la IA">
        <Table rows={ai.map((a) => ({ ...a, key: a.level, name: AI_NAMES[a.level] || a.level }))}
          cols={[{ k: 'name', t: 'Nivel' }, { k: 'games', t: 'Partidas' }, { k: 'humanWins', t: 'Ganan los jugadores' }, rateCol('humanWinRate', '% jugadores')]} />
      </Card>
    </div>
  );
}
