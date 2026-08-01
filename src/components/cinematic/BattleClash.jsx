import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Choque bizarro entre dos animaciones 3D reales del juego (ability_anim).
// Se muestran COMPLETOS (object-contain, altura a pantalla) anclados a los
// bordes exteriores, sin marco y a pantalla completa. Cada combatiente tiene
// movimiento artesanal: flote vertical, embestida hacia el centro y retroceso,
// temblor de respiración y pulso de escala. Con `swap` los combatientes
// cambian de lado entre escenas para dar sensación de enfrentamiento.
export default function BattleClash({ left, right, accent = '#ff7a18', kind = 'clash', swap = false }) {
  const embers = useMemo(
    () => Array.from({ length: 14 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 3,
      dur: 2.5 + Math.random() * 2.8,
      size: 2 + Math.random() * 4,
    })),
    []
  );

  // swap: invierte qué combatiente va a cada lado.
  const leftSrc = swap ? right : left;
  const rightSrc = swap ? left : right;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050308]">
      <div className="absolute inset-0 flex">
        {/* combatiente izquierdo, anclado al borde izquierdo */}
        <div className="relative w-1/2 h-full flex justify-start items-center overflow-hidden">
          <motion.img
            src={leftSrc} alt="" draggable={false}
            className="h-full w-auto max-w-none object-contain select-none"
            initial={{ opacity: 0, x: '-8%' }}
            animate={{ opacity: 1, x: ['0%', '8%', '0%'], y: [0, -10, 0], scale: [1, 1.05, 1], rotate: [-1.6, 1.6, -1.6] }}
            transition={{
              opacity: { duration: 0.7 },
              x: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent 52%, #050308)' }} />
        </div>
        {/* combatiente derecho, anclado al borde derecho */}
        <div className="relative w-1/2 h-full flex justify-end items-center overflow-hidden">
          <motion.img
            src={rightSrc} alt="" draggable={false}
            className="h-full w-auto max-w-none object-contain select-none"
            initial={{ opacity: 0, x: '8%' }}
            animate={{ opacity: 1, x: ['0%', '-8%', '0%'], y: [0, -10, 0], scale: [1, 1.05, 1], rotate: [1.6, -1.6, 1.6] }}
            transition={{
              opacity: { duration: 0.7 },
              x: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 5.4, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(270deg, transparent 52%, #050308)' }} />
        </div>
      </div>

      {/* scrim central para legibilidad del texto narrado */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 58% 68% at 50% 52%, #050308e0, transparent 82%)' }} />

      {/* ---- efectos de interacción ---- */}
      {kind === 'shoot' && (
        <>
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] h-[3px] rounded-full"
            style={{ background: `linear-gradient(90deg, transparent, ${accent}, #fff, ${accent}, transparent)`, boxShadow: `0 0 20px ${accent}` }}
            initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.7 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full"
            style={{ background: `radial-gradient(${accent}, transparent 70%)` }}
            animate={{ scale: [0.4, 1.5, 0.4], opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </>
      )}

      {kind === 'sword' && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: '78%', height: '6px', borderRadius: 999, background: `linear-gradient(90deg, transparent, #fff, ${accent}, transparent)`, boxShadow: `0 0 26px ${accent}`, rotate: '-18deg' }}
          initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: [0, 1.15, 1], opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 1.3 }}
        />
      )}

      {kind === 'clash' && (
        <>
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full"
            style={{ background: `radial-gradient(${accent}, transparent 70%)` }}
            animate={{ scale: [0.6, 1.8, 0.6], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2"
            style={{ borderColor: accent }}
            animate={{ scale: [0.5, 2.3], opacity: [0.8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        </>
      )}

      {kind === 'chill' && (
        <>
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
            style={{ background: `radial-gradient(${accent}66, transparent 70%)` }}
            animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {Array.from({ length: 10 }).map((_, k) => (
            <motion.span
              key={k} className="absolute bottom-[18%] rounded-full"
              style={{ left: `${42 + k * 3.4}%`, width: 7, height: 7, background: accent, boxShadow: `0 0 10px ${accent}` }}
              animate={{ y: [0, -200], opacity: [0, 1, 0] }}
              transition={{ duration: 3 + (k % 3), repeat: Infinity, delay: k * 0.3, ease: 'easeOut' }}
            />
          ))}
        </>
      )}

      {kind === 'fire' && (
        <>
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full"
            style={{ background: `radial-gradient(${accent}, #ffea00 40%, transparent 72%)` }}
            animate={{ scale: [0.7, 1.3, 0.7], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {Array.from({ length: 18 }).map((_, k) => (
            <motion.span
              key={k} className="absolute bottom-0 rounded-full pointer-events-none"
              style={{ left: `${30 + (k * 2.4)}%`, width: 4 + (k % 3), height: 4 + (k % 3), background: k % 2 ? accent : '#ffea00', boxShadow: `0 0 10px ${accent}` }}
              animate={{ y: [0, -260], opacity: [0, 1, 0], scale: [1, 0.4] }}
              transition={{ duration: 2.4 + (k % 3), repeat: Infinity, delay: k * 0.18, ease: 'easeOut' }}
            />
          ))}
        </>
      )}

      {/* brasas ascendentes */}
      {embers.map((e, k) => (
        <motion.span
          key={k} className="absolute bottom-0 rounded-full pointer-events-none"
          style={{ left: `${e.left}%`, width: e.size, height: e.size, background: accent, boxShadow: `0 0 8px ${accent}` }}
          animate={{ y: [0, -300], opacity: [0, 0.8, 0] }}
          transition={{ duration: e.dur, repeat: Infinity, delay: e.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}