import React from 'react';

// Avatar circular de un nivel de IA. El arte original es una ilustración de
// carta (cuerpo completo con márgenes), así que dentro del círculo se amplía y
// se ancla arriba para que el rostro llene todo el hueco en vez de quedar
// pequeño y con bordes vacíos.
export default function AiLevelAvatar({ src, alt, color, size = 52 }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}`,
        background: `radial-gradient(circle at 50% 35%, ${color}33, #0b0715 70%)`,
        boxShadow: `0 0 14px ${color}66, inset 0 0 10px rgba(0,0,0,.55)`,
      }}
    >
      <img
        src={src}
        alt={alt}
        className="absolute left-1/2 top-0 h-auto w-full max-w-none"
        style={{ transform: 'translateX(-50%) scale(2.15)', transformOrigin: 'top center' }}
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ boxShadow: `inset 0 0 0 1px ${color}88, inset 0 -8px 14px rgba(0,0,0,.55)` }}
      />
    </div>
  );
}