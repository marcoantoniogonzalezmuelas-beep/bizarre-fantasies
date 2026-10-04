import React from 'react';

// Fila de un héroe en el ranking de compras de subasta: arte, nombre, raza,
// rol, barra de frecuencia y conteo total (con desglose élite).
export default function HeroStatRow({ stat, max, rank }) {
  const { name, count, eliteCount, card, winRate, wins, played } = stat;
  // % de victorias: verde si gana mucho, rojo si pierde mucho (solo con partidas suficientes).
  const wrColor = winRate == null ? '#8f86a3' : winRate >= 55 ? '#7ee07e' : winRate <= 45 ? '#ff8a8a' : '#efe9dc';
  const pct = max ? Math.max(4, Math.round((count / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#ffd24a22] bg-black/30 px-3 py-2">
      <span className="w-6 shrink-0 text-right text-xs font-black text-[#cfc6dd]">{rank}</span>
      <div className="h-10 w-8 shrink-0 overflow-hidden rounded-md border border-[#ffd24a33] bg-black/50">
        {card?.art_url ? <img src={card.art_url} alt={name} className="h-full w-full object-cover" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-black text-[#fff5dc]">{name}</span>
          {card?.clan && (
            <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black text-white" style={{ background: card.clan_color || '#3c3158' }}>{card.clan}</span>
          )}
          {card?.type && <span className="shrink-0 text-[10px] font-black text-[#7ad6ff]">{card.type}</span>}
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/50">
          <div className="h-full rounded-full bg-gradient-to-r from-[#ffd24a] to-[#ff9d5c]" style={{ width: pct + '%' }} />
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-sm font-black text-[#ffe49a]">{count}</div>
        {eliteCount > 0 && <div className="text-[10px] font-black text-[#c05bff]">Élite ×{eliteCount}</div>}
        <div className="text-[10px] font-black" style={{ color: wrColor }} title={played ? `${wins} victorias en ${played} partidas` : 'Sin partidas registradas'}>
          {winRate == null ? (played ? `${wins}/${played} partidas` : 'sin partidas') : `${winRate}% victorias`}
        </div>
      </div>
    </div>
  );
}