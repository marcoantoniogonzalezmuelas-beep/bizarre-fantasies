import React from 'react';

// Medalla del podio (oro · plata · bronce) dibujada en SVG: disco metálico con
// borde dentado, anillo grabado, corona de laurel, estrella y número en relieve,
// más cinta trasera. Brillo pulsante y destello que barre el metal.
const THEMES = [
  { id: 'g', light: '#fff8d0', mid: '#ffd24a', deep: '#c98a00', dark: '#7d5100', ink: '#5a3600', glow: 'rgba(255,196,40,.9)', ribbon: ['#d42a22', '#7d1410'], label: '1' },
  { id: 's', light: '#ffffff', mid: '#dfe3ec', deep: '#a8aebd', dark: '#6d7482', ink: '#40454f', glow: 'rgba(220,228,245,.85)', ribbon: ['#4d5e86', '#232c44'], label: '2' },
  { id: 'b', light: '#ffe0bd', mid: '#e0a05a', deep: '#b06a26', dark: '#6f4114', ink: '#42250b', glow: 'rgba(214,138,60,.85)', ribbon: ['#7d4c1e', '#41250c'], label: '3' },
];

// Borde dentado: 32 puntas suaves alrededor del disco.
const scallop = (cx, cy, r, teeth = 32, depth = 3.2) => {
  let d = '';
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2 - Math.PI / 2;
    const rr = r + (i % 2 ? -depth : depth);
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    d += `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d + 'Z';
};

const LAUREL = 'M0 0 C -7 -4 -11 -11 -11 -19 C -4 -17 0 -10 0 -3 Z';

export default function RankMedal({ rank = 0, size = 56 }) {
  const th = THEMES[rank] || THEMES[0];
  const u = th.id;
  return (
    <div
      className="relative"
      style={{ width: size, height: size * 1.34, animation: 'bfMedalFloat 3s ease-in-out infinite' }}
    >
      <svg viewBox="0 0 100 134" width={size} height={size * 1.34} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`rb1${u}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={th.ribbon[0]} />
            <stop offset="100%" stopColor={th.ribbon[1]} />
          </linearGradient>
          <radialGradient id={`disc${u}`} cx="34%" cy="26%" r="78%">
            <stop offset="0%" stopColor={th.light} />
            <stop offset="42%" stopColor={th.mid} />
            <stop offset="80%" stopColor={th.deep} />
            <stop offset="100%" stopColor={th.dark} />
          </radialGradient>
          <linearGradient id={`edge${u}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={th.light} />
            <stop offset="50%" stopColor={th.deep} />
            <stop offset="100%" stopColor={th.light} />
          </linearGradient>
          <linearGradient id={`sweep${u}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity=".85" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`clip${u}`}>
            <circle cx="50" cy="84" r="43" />
          </clipPath>
        </defs>

        {/* Cintas */}
        <path d="M50 78 L26 74 L10 6 L40 2 Z" fill={`url(#rb1${u})`} opacity=".95" />
        <path d="M50 78 L74 74 L90 6 L60 2 Z" fill={`url(#rb1${u})`} opacity=".8" />
        <path d="M32 40 L68 40 L66 52 L34 52 Z" fill="#000" opacity=".18" />

        {/* Disco */}
        <g style={{ filter: `drop-shadow(0 3px 7px rgba(0,0,0,.65)) drop-shadow(0 0 ${size * 0.22}px ${th.glow})`, animation: 'bfMedalGlow 2.2s ease-in-out infinite' }}>
          <path d={scallop(50, 84, 46)} fill={`url(#edge${u})`} />
          <circle cx="50" cy="84" r="43" fill={`url(#disc${u})`} />
          <circle cx="50" cy="84" r="43" fill="none" stroke={th.light} strokeWidth="1.6" opacity=".75" />
          <circle cx="50" cy="84" r="34" fill="none" stroke={th.ink} strokeWidth="1.3" opacity=".45" />
          <circle cx="50" cy="84" r="31" fill="none" stroke={th.light} strokeWidth="1" opacity=".4" />

          {/* Laureles */}
          <g fill={th.ink} opacity=".5">
            {[0, 1].map(side => (
              <g key={side} transform={`translate(${side ? 72 : 28} 104) scale(${side ? -1 : 1} 1)`}>
                {[0, 1, 2].map(i => (
                  <path key={i} d={LAUREL} transform={`translate(0 ${-i * 11}) rotate(${-14 + i * 8})`} />
                ))}
              </g>
            ))}
          </g>

          {/* Estrella + número en relieve */}
          <path
            d="M50 56 L54 66 L65 66 L56 73 L59 84 L50 77 L41 84 L44 73 L35 66 L46 66 Z"
            fill={th.light}
            opacity=".9"
          />
          <text
            x="50"
            y="108"
            textAnchor="middle"
            fontFamily="Cinzel, serif"
            fontWeight="900"
            fontSize="34"
            fill={th.ink}
            style={{ paintOrder: 'stroke' }}
            stroke={th.light}
            strokeWidth="1.2"
            strokeOpacity=".55"
          >
            {th.label}
          </text>

          {/* Destello que barre el metal */}
          <g clipPath={`url(#clip${u})`}>
            <rect
              x="-40"
              y="30"
              width="34"
              height="110"
              fill={`url(#sweep${u})`}
              transform="rotate(14 50 84)"
              style={{ animation: 'bfMedalSvgSweep 3s ease-in-out infinite' }}
            />
          </g>
        </g>
      </svg>
    </div>
  );
}