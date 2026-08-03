import React from 'react';

const MEDALS = ['🥇', '🥈', '🥉'];
// Orden visual de podio: 2º · 1º · 3º (el campeón en el centro, más grande).
const ORDER = [1, 0, 2];
// Brillo de borde por medalla: oro · plata brillante · bronce brillante.
const RANK_COLORS = ['#FFD24A', '#D8D8E0', '#CD7F32'];
const RANK_GLOWS = ['rgba(255,210,74,.55)', 'rgba(210,210,225,.5)', 'rgba(205,127,50,.5)'];

export default function RankPodium({ rows, artMap, accent, valueLabel }) {
  const podium = ORDER.map(i => (rows[i] ? { ...rows[i], rank: i } : null)).filter(Boolean);
  if (!podium.length) return null;
  return (
    <div className="flex items-end justify-center gap-3 mb-5">
      {podium.map(h => {
        const info = artMap[h.name];
        const first = h.rank === 0;
        const color = RANK_COLORS[h.rank];
        return (
          <div key={h.name} className={`flex flex-col items-center text-center ${first ? 'w-[34%]' : 'w-[28%]'}`}>
            <div
              className={`relative w-full overflow-hidden rounded-2xl border-2 ${first ? 'aspect-[3/3.4]' : 'aspect-[3/3.1]'}`}
              style={{ borderColor: color, background: '#09070d', boxShadow: `0 0 18px ${RANK_GLOWS[h.rank]}` }}
            >
              {info?.art ? (
                <img src={info.art} alt={h.name} className="absolute inset-0 w-full h-full object-cover object-[center_15%]" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-heading font-black text-4xl" style={{ color: accent }}>{h.name.charAt(0)}</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25 pointer-events-none" />
              <span className="absolute top-1.5 left-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,.8)] text-xl">{MEDALS[h.rank]}</span>
              <div className="absolute left-1 right-1 bottom-1.5">
                <div className="font-heading font-black text-[11px] leading-tight text-[#fff5dc] truncate drop-shadow-[0_2px_3px_#000]">{h.name}</div>
                <div className="font-black text-[11px]" style={{ color: accent }}>
                  {h.value} <span className="font-body font-semibold text-[9px] text-[#cfc6dd]">{valueLabel}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}