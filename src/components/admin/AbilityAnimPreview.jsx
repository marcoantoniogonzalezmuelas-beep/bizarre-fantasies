import React, { useEffect, useRef, useState } from 'react';
import { pickMotion, ALL_MOTION_CSS } from '@/lib/abilityAnimMotions';

// Vista previa de la cinemática 3D de una habilidad, idéntica a la que se ve
// en el juego al usar la habilidad: overlay a pantalla completa, criatura
// (con el fondo recortado a transparente vía canvas) entrando en 3D, flash,
// halo, anillos y partículas de color de clan. El MOVIMIENTO de entrada
// (tajo de espada, fogonazo de pistola, etc.) se elige por palabras clave en
// la descripción (desc) — ver abilityAnimMotions. Se reproduce al montarse
// y se cierra al tocar.
const KEYFRAMES = `
@keyframes bfAaPrvIn{from{opacity:0}to{opacity:1}}
@keyframes bfAaPrvTtl{0%{opacity:0;transform:translateX(-50%) scale(2)}15%{opacity:1;transform:translateX(-50%) scale(1)}82%{opacity:1}100%{opacity:0;transform:translateX(-50%) scale(1.1)}}
@keyframes bfAaPrvFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}
@keyframes bfAaPrvVeil{0%{opacity:0}30%{opacity:.6}100%{opacity:0}}
@keyframes bfAaPrvSpark{0%{opacity:0;transform:translateY(0) scale(.3)}15%{opacity:1}100%{opacity:0;transform:translateY(-70vh) scale(1.4) translateX(var(--dx,0px))}}
@keyframes bfAaPrvRing{0%{width:10%;height:10%;opacity:1;border-width:4px}100%{width:250%;height:250%;opacity:0;border-width:1px}}
${ALL_MOTION_CSS}
`;

function hexToRgba(hex, a) {
  if (!hex) return null;
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex));
  if (!m) return null;
  const r = parseInt(m[1].slice(0, 2), 16), g = parseInt(m[1].slice(2, 4), 16), b = parseInt(m[1].slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// Recorta el fondo oscuro/negro de la imagen (lo vuelve transparente con un
// canvas) para que solo quede la criatura — mismo tratamiento que en el juego.
function useCutout(url) {
  const [out, setOut] = useState('');
  useEffect(() => {
    let cancelled = false;
    if (!url) { setOut(''); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        const x = c.getContext('2d');
        x.drawImage(img, 0, 0);
        const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
        for (let i = 0; i < p.length; i += 4) {
          const m2 = Math.max(p[i], p[i + 1], p[i + 2]);
          if (m2 < 32) p[i + 3] = 0;
          else if (m2 < 90) p[i + 3] = Math.round(p[i + 3] * (m2 - 32) / 58);
        }
        x.putImageData(d, 0, 0);
        setOut(c.toDataURL('image/png'));
      } catch (e) { setOut(url); }
    };
    img.onerror = () => { if (!cancelled) setOut(url); };
    img.src = url;
    return () => { cancelled = true; };
  }, [url]);
  return out || url;
}

export default function AbilityAnimPreview({ artUrl, abilityName, clanColor, elite, desc, motionId, onClose }) {
  const styleRef = useRef(null);
  const color = clanColor || (elite ? '#c05bff' : '#ffd24a');
  const glow = hexToRgba(color, 0.38) || 'rgba(255,210,74,0.38)';
  const flash = hexToRgba(color, 0.7) || 'rgba(255,255,255,0.7)';
  const cutUrl = useCutout(artUrl);
  const motion = pickMotion(desc || abilityName, motionId);

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

  const sparks = Array.from({ length: 14 }, () => ({
    left: 4 + Math.random() * 92,
    dx: Math.round(Math.random() * 100 - 50),
    delay: Math.random() * 1.2,
  }));

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100009, overflow: 'hidden',
        perspective: '900px', cursor: 'pointer', animation: 'bfAaPrvIn .3s ease-out',
        background: 'radial-gradient(circle at 50% 45%, rgba(10,6,18,.86), rgba(4,2,8,.96))',
        ['--aa-color']: color, ['--aa-glow']: glow, ['--aa-flash']: flash,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent,rgba(0,0,0,.4),transparent)', animation: 'bfAaPrvVeil 2s ease-out forwards' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle, ${flash}, transparent 65%)`, animation: 'bfAaPrvFlash .7s ease-out .25s both' }} />
      {sparks.map((sp, i) => (
        <span key={'s' + i} style={{ position: 'absolute', bottom: '10%', left: sp.left + '%', width: 4, height: 4, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}, 0 0 14px ${glow}`, opacity: 0, animation: `bfAaPrvSpark 2s ease-out ${sp.delay}s forwards`, ['--dx']: sp.dx + 'px' }} />
      ))}
      {/* FX temático del movimiento elegido (tajo, fogonazo, proyectil…) */}
      {motion.fxTag ? (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} dangerouslySetInnerHTML={{ __html: motion.fxTag }} />
      ) : null}
      <img
        src={cutUrl}
        alt=""
        style={{
          position: 'absolute', top: '50%', left: '50%', transformOrigin: 'center',
          width: 'min(74vmin,640px)', height: 'min(78vmin,680px)', objectFit: 'contain',
          transformStyle: 'preserve-3d',
          margin: 'calc(min(78vmin,680px)/-2) 0 0 calc(min(74vmin,640px)/-2)',
          filter: `saturate(1.25) brightness(1.1) drop-shadow(0 14px 34px rgba(0,0,0,.65))`,
          animation: `${motion.anim} 3.2s cubic-bezier(.2,.85,.3,1) forwards`,
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
        Toca para cerrar · Vista previa de la cinemática 3D {motion.id !== 'default' ? `· ${motion.id}` : ''}
      </div>
    </div>
  );
}