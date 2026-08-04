import React from 'react';
import RankPodium from '@/components/ranking/RankPodium';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function RankList({ title, icon: Icon, rows, valueLabel, accent = '#FFD24A', empty, artMap }) {
  // Con arte de héroes: los 3 primeros se muestran como podio ilustrado.
  const listRows = artMap ? rows.slice(3) : rows;
  const offset = artMap ? 3 : 0;
  return (
    <div className="rounded-2xl border border-[#3c3158] bg-[#161028]/85 backdrop-blur-sm p-5 shadow-[0_10px_30px_rgba(0,0,0,.5)]">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b" style={{ borderColor: accent + '22' }}>
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl border-2 flex-shrink-0"
          style={{
            borderColor: accent + '99',
            background: `linear-gradient(135deg, ${accent}28, ${accent}06)`,
            boxShadow: `0 0 18px ${accent}55, inset 0 0 12px ${accent}15`,
          }}
        >
          {Icon && <Icon size={24} strokeWidth={2.5} style={{ color: accent, filter: `drop-shadow(0 0 6px ${accent}aa)` }} />}
        </div>
        <h2
          className="font-heading font-black text-xl md:text-2xl tracking-wide uppercase leading-tight"
          style={{ color: accent, textShadow: `0 0 16px ${accent}66, 0 2px 4px #000` }}
        >
          {title}
        </h2>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-[#8f84a8] italic">{empty || 'Aún no hay datos. ¡Juega partidas para aparecer aquí!'}</p>
      ) : (
        <>
        {artMap && <RankPodium rows={rows.slice(0, 3)} artMap={artMap} accent={accent} valueLabel={valueLabel} />}
        <ol className="space-y-2">
          {listRows.map((r, i) => (
            <li key={r.name} className="flex items-center gap-3 rounded-xl px-3 py-2 bg-[#1e1735]/80 border border-[#2c2347]">
              <span className="w-7 text-center font-black text-base">{MEDALS[i + offset] || <span className="text-[#8f84a8] text-sm">{i + offset + 1}</span>}</span>
              {artMap && artMap[r.name]?.art && (
                <img src={artMap[r.name].art} alt="" className="w-7 h-7 rounded-full object-cover border border-[#2c2347] flex-shrink-0" />
              )}
              <span className="flex-1 font-bold text-[#efe9dc] truncate">{r.name}</span>
              {r.extra && <span className="hidden sm:inline text-[11px] text-[#8f84a8]">{r.extra}</span>}
              <span className="font-heading font-black text-base" style={{ color: accent }}>
                {r.value} <span className="text-[10px] font-body font-semibold text-[#8f84a8]">{valueLabel}</span>
              </span>
            </li>
          ))}
        </ol>
        </>
      )}
    </div>
  );
}