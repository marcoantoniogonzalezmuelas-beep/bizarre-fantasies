import React from 'react';

// Medalla metálica del podio (oro · plata · bronce): disco con anillo grabado,
// cinta, brillo pulsante y destello que barre el metal.
const STYLES = [
  { ring: '#fff3b0', a: '#ffe27a', b: '#ffb800', c: '#a86b00', glow: 'rgba(255,196,40,.85)', ink: '#4a2d00', ribbon: ['#c8241e', '#7d1410'], label: '1' },
  { ring: '#ffffff', a: '#f2f4f8', b: '#c3c8d4', c: '#7c8390', glow: 'rgba(220,226,240,.8)', ink: '#3a3f4a', ribbon: ['#4a5a80', '#26304a'], label: '2' },
  { ring: '#ffd9ab', a: '#f0c08a', b: '#cd7f32', c: '#7d4715', glow: 'rgba(205,127,50,.8)', ink: '#3d2208', ribbon: ['#7a4a1d', '#43260d'], label: '3' },
];

export default function RankMedal({ rank = 0, size = 54 }) {
  const s = STYLES[rank] || STYLES[0];
  const ribbonW = Math.round(size * 0.34);
  return (
    <div className="relative flex flex-col items-center" style={{ width: size, animation: 'bfMedalFloat 2.8s ease-in-out infinite' }}>
      {/* Cintas traseras */}
      <div className="absolute flex" style={{ top: -Math.round(size * 0.34), gap: Math.round(size * 0.14) }}>
        {[-14, 14].map((rot, i) => (
          <div
            key={i}
            style={{
              width: ribbonW,
              height: Math.round(size * 0.62),
              transform: `rotate(${rot}deg)`,
              background: `linear-gradient(180deg,${s.ribbon[0]},${s.ribbon[1]})`,
              clipPath: 'polygon(0 0,100% 0,100% 100%,50% 82%,0 100%)',
              boxShadow: '0 2px 6px rgba(0,0,0,.6)',
            }}
          />
        ))}
      </div>
      {/* Disco */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 32% 26%,${s.a} 0%,${s.b} 52%,${s.c} 100%)`,
          border: `${Math.max(2, Math.round(size * 0.05))}px solid ${s.ring}`,
          boxShadow: `0 0 ${Math.round(size * 0.42)}px ${s.glow}, inset 0 2px 6px rgba(255,255,255,.6), inset 0 -3px 8px rgba(0,0,0,.45), 0 4px 10px rgba(0,0,0,.65)`,
          animation: 'bfMedalGlow 2.2s ease-in-out infinite',
        }}
      >
        {/* Anillo grabado */}
        <div className="absolute rounded-full" style={{ inset: Math.round(size * 0.12), border: `1px dashed ${s.ink}`, opacity: 0.45 }} />
        {/* Número */}
        <div
          className="absolute inset-0 flex items-center justify-center font-heading font-black"
          style={{ fontSize: Math.round(size * 0.46), color: s.ink, textShadow: '0 1px 0 rgba(255,255,255,.55)' }}
        >
          {s.label}
        </div>
        {/* Destello que barre el metal */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            style={{
              position: 'absolute',
              top: '-40%',
              bottom: '-40%',
              width: '42%',
              background: 'linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.85),rgba(255,255,255,0))',
              animation: 'bfMedalSweep 2.8s ease-in-out infinite',
            }}
          />
        </div>
      </div>
    </div>
  );
}