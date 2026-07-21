import React from 'react';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function RankList({ title, icon, rows, valueLabel, accent = '#FFD24A', empty }) {
  return (
    <div className="rounded-2xl border border-[#3c3158] bg-[#161028]/85 backdrop-blur-sm p-5 shadow-[0_10px_30px_rgba(0,0,0,.5)]">
      <h2 className="font-heading font-black text-lg mb-4 flex items-center gap-2" style={{ color: accent }}>
        <span className="text-xl">{icon}</span>{title}
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-[#8f84a8] italic">{empty || 'Aún no hay datos. ¡Juega partidas para aparecer aquí!'}</p>
      ) : (
        <ol className="space-y-2">
          {rows.map((r, i) => (
            <li key={r.name} className="flex items-center gap-3 rounded-xl px-3 py-2 bg-[#1e1735]/80 border border-[#2c2347]">
              <span className="w-7 text-center font-black text-base">{MEDALS[i] || <span className="text-[#8f84a8] text-sm">{i + 1}</span>}</span>
              <span className="flex-1 font-bold text-[#efe9dc] truncate">{r.name}</span>
              {r.extra && <span className="hidden sm:inline text-[11px] text-[#8f84a8]">{r.extra}</span>}
              <span className="font-heading font-black text-base" style={{ color: accent }}>
                {r.value} <span className="text-[10px] font-body font-semibold text-[#8f84a8]">{valueLabel}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}