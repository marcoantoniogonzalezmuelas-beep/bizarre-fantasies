import React from 'react';

const MEDALS = ['🥇', '🥈', '🥉'];
// Orden visual de podio: 2º · 1º · 3º (el campeón en el centro, más grande).
const ORDER = [1, 0, 2];

export default function RankPodium({ rows, artMap, accent, valueLabel }) {
  const podium = ORDER.map(i => (rows[i] ? { ...rows[i], rank: i } : null)).filter(Boolean);
  if (!podium.length) return null;
  return (
    <div className="flex items-end justify-center gap-3 mb-5">
      {podium.map(h => {
        const info = artMap[h.name];
        const first = h.rank === 0;
        return (
          <div key={h.name} className={`group flex flex-col items-center text-center cursor-default ${first ? 'w-[34%]' : 'w-[28%]'}`}>
            <div
              className={`relative w-full overflow-hidden rounded-2xl border-2 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1.5 ${first ? 'aspect-[3/3.4]' : 'aspect-[3/3.1]'}`}
              style={{ borderColor: info?.color || accent, background: '#09070d', boxShadow: '0 8px 22px rgba(0,0,0,.55)' }}
            >
              {info?.art ? (
                <img src={info.art} alt={h.name} className="absolute inset-0 w-full h-full object-cover object-[center_15%] transition-all duration-300 saturate-100 group-hover:saturate-150 group-hover:brightness-110 group-hover:scale-110" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-heading font-black text-4xl" style={{ color: accent }}>{h.name.charAt(0)}</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25 pointer-events-none" />
              {/* Brillo del acento al pasar el ratón */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: `inset 0 0 26px ${accent}66, 0 0 26px ${accent}99` }} />
              <span className={`absolute top-1.5 left-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,.8)] transition-transform duration-300 group-hover:scale-125 group-hover:rotate-[-8deg] ${first ? 'text-2xl' : 'text-xl'}`}>{MEDALS[h.rank]}</span>
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