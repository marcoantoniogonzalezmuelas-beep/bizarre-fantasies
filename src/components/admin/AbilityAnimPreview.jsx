import React, { useEffect, useRef } from 'react';

// Vista previa de la cinemática 3D de una habilidad, idéntica a la que se ve
// en el juego al usar la habilidad: overlay a pantalla completa, imagen del
// héroe con entrada 3D (rotación + translateZ), flash, halo, anillos y
// partículas de color de clan. Se reproduce al montarse y se cierra al tocar.
const KEYFRAMES = `
@keyframes bfAaPrvIn{from{opacity:0}to{opacity:1}}
@keyframes bfAaPrvImg{0%{transform:rotateY(-90deg) rotateX(15deg) translateZ(-900px) scale(.15);opacity:0}12%{opacity:1}28%{transform:rotateY(35deg) rotateX(-8deg) translateZ(-250px) scale(.7) translateY(10vh)}42%{transform:rotateY(-22deg) rotateX(5deg) translateZ(0) scale(1.2) translateY(-2vh)}54%{transform:rotateY(18deg) rotateX(-3deg) scale(1.1) translateY(0)}66%{transform:rotateY(-10deg) rotateX(2deg) scale(1.15)}78%{transform:rotateY(6deg) scale(1.2)}100%{transform:rotateY(0) translateZ(0) scale(1.25) translateY(-8vh);opacity:1}}
@keyframes bfAaPrvTtl{0%{opacity:0;transform:translateX(-50%) scale(2)}15%{opacity:1;transform:translateX(-50%) scale(1)}82%{opacity:1}100%{opacity:0;transform:translateX(-50%) scale(1.1)}}
@keyframes bfAaPrvFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}
@keyframes bfAaPrvVeil{0%{opacity:0}30%{opacity:.6}100%{opacity:0}}
@keyframes bfAaPrvSpark{0%{opacity:0;transform:translateY(0) scale(.3)}15%{opacity:1}100%{opacity:0;transform:translateY(-70vh) scale(1.4) translateX(var(--dx,0px))}}
@keyframes bfAaPrvRing{0%{width:10%;height:10%;opacity:1;border-width:4px}100%{width:250%;height:250%;opacity:0;border-width:1px}}
`;

export default function AbilityAnimPreview({ artUrl, abilityName, clanColor, elite, onClose }) {
  const styleRef = useRef(null);
  const color = clanColor || (elite ? '#c05bff' : '#ffd24a');
  // Hex de 8 dígitos (alpha) soportado en navegadores modernos.
  const glow = color + 'cc';
  const flash = color + 'b3';

  useEffect(() => {
    if (!styleRef.current) {
      const s = document.createElement('style');
      s.textContent = KEYFRAMES;
      document.head.appendChild(s);
      styleRef.current = s;
    }
    return () => { if (styleRef.current && styleRef.current.parentNode) styleRef.current.parentNode.removeChild(styleRef.current); styleRef.current = null; };
  }, []);

  if (!artUrl) return null;

  const sparks = Array.from({ length: 14 }, (_, i) => ({
    left: 4 + Math.random() * 92,
    dx: Math.round(Math.random() * 100 - 50),
    delay: Math.random() * 1.2,
  }));
  const rings = [0, 0.25, 0.5];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100009, overflow: 'hidden',
        perspective: '900px', cursor: 'pointer', animation: 'bfAaPrvIn .3s ease-out',
        background: 'radial-gradient(circle at 50% 45%, rgba(10,6,18,.86), rgba(4,2,8,.96))',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent,rgba(0,0,0,.4),transparent)', animation: 'bfAaPrvVeil 2s ease-out forwards' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle, ${flash}, transparent 65%)`, animation: 'bfAaPrvFlash .7s ease-out .25s both' }} />
      {rings.map((d, i) => (
        <div key={'r' + i} style={{ position: 'absolute', left: '50%', top: '50%', borderRadius: '50%', border: `3px solid ${color}`, boxShadow: `0 0 20px ${glow}`, opacity: 0, animation: `bfAaPrvRing 1.5s ease-out ${d}s forwards`, transform: 'translate(-50%,-50%)' }} />
      ))}
      {sparks.map((sp, i) => (
        <span key={'s' + i} style={{ position: 'absolute', bottom: '10%', left: sp.left + '%', width: 4, height: 4, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}, 0 0 14px ${glow}`, opacity: 0, animation: `bfAaPrvSpark 2s ease-out ${sp.delay}s forwards`, ['--dx']: sp.dx + 'px' }} />
      ))}
      <img
        src={artUrl}
        alt=""
        style={{
          position: 'absolute', top: '50%', left: '50%', transformOrigin: 'center',
          width: 'min(66vmin,540px)', height: 'min(70vmin,580px)', objectFit: 'cover',
          borderRadius: 14, transformStyle: 'preserve-3d',
          margin: 'calc(min(70vmin,580px)/-2) 0 0 calc(min(66vmin,540px)/-2)',
          filter: `drop-shadow(0 0 60px ${glow}) saturate(1.4) brightness(1.15)`,
          animation: 'bfAaPrvImg 3.2s cubic-bezier(.2,.85,.3,1) forwards',
          border: `2px solid ${color}`, boxShadow: `0 0 70px ${glow}, 0 8px 30px rgba(0,0,0,.8)`,
        }}
      />
      <div style={{
        position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'Cinzel, serif', fontWeight: 1000, fontSize: 'clamp(22px,5vw,48px)',
        letterSpacing: 4, whiteSpace: 'nowrap', opacity: 0,
        animation: 'bfAaPrvTtl 2.9s ease-out .3s forwards', color,
        textShadow: `0 0 28px ${glow}, 0 4px 12px #000`,
      }}>
        {String(abilityName || '').toUpperCase()}
      </div>
      <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', fontSize: 12, color: '#9d8ab8', pointerEvents: 'none' }}>
        Toca para cerrar · Vista previa de la cinemática 3D
      </div>
    </div>
  );
}