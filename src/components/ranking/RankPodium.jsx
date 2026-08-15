import React from 'react';
import RankMedal from './RankMedal';

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
                <img
                  src={info.art}
                  alt={h.name}
                  className="absolute inset-0 w-full h-full object-cover object-[center_15%]"
                  style={info.zoom ? { transform: `scale(${info.zoom})`, transformOrigin: 'center center' } : undefined}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-heading font-black text-4xl" style={{ color: accent }}>{h.name.charAt(0)}</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25 pointer-events-none" />
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                <RankMedal rank={h.rank} size={first ? 62 : 48} />
              </div>
              <div className="absolute left-1.5 right-1.5 bottom-2.5">
                <div
                  className={`font-heading font-black leading-tight text-[#fff8e2] truncate uppercase tracking-wide ${first ? 'text-xl md:text-2xl' : 'text-base md:text-lg'}`}
                  style={{ textShadow: `0 2px 6px #000, 0 0 16px ${color}88` }}
                >
                  {h.name}
                </div>
                <div className={`font-heading font-black leading-none mt-0.5 ${first ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`} style={{ color, textShadow: `0 2px 5px #000, 0 0 14px ${color}99` }}>
                  {h.value}{' '}
                  <span className={`font-body font-bold text-[#e5dcf2] uppercase tracking-wider ${first ? 'text-[11px]' : 'text-[10px]'}`}>{valueLabel}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}