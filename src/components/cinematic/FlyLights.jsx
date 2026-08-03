import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCutoutSrc } from '@/lib/useCutoutSrc';

const FLY_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/5b9a5b402_generated_image.png';

// Mosca mágica que revolotea por la escena y se posa alternativamente sobre el
// rostro de los dos héroes, dejando conos de luz y destellos donde aterriza.
// Pensada para la diapositiva de bienvenida (clash comedy).
export default function FlyLights() {
  const cut = useCutoutSrc(FLY_IMG);
  const colors = useMemo(() => ['#7cff5a', '#ffd24a', '#05d9ff', '#b13bff'], []);

  // Posiciones aproximadas de los rostros de los dos héroes en BattleClash.
  const leftFace = { x: '26vw', y: '30vh' };
  const rightFace = { x: '68vw', y: '30vh' };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[3]">
      {/* Conos de luz que siguen a la mosca y se encienden al posarse */}
      {[
        { face: leftFace, hue: colors[0], delay: 0 },
        { face: rightFace, hue: colors[2], delay: 3.5 },
      ].map((c, k) => (
        <motion.div key={k}
          className="absolute top-0 -translate-x-1/2"
          style={{ left: c.face.x, width: 160, height: '60%', transformOrigin: '50% 0%' }}
          animate={{ opacity: [0, 0, 0.85, 0.3, 0], x: [0, 0, 0, 0, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: c.delay, times: [0, 0.35, 0.5, 0.7, 0.85] }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{ width: 5, height: '60%', background: `linear-gradient(to bottom, ${c.hue}, transparent)`, filter: 'blur(3px)' }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
            style={{ width: 160, height: 160, background: `radial-gradient(ellipse 50% 70% at 50% 22%, ${c.hue}66 0%, ${c.hue}22 42%, transparent 72%)`, filter: 'blur(8px)', mixBlendMode: 'screen' }} />
        </motion.div>
      ))}

      {/* Pools de luz en los rostros al posarse */}
      {[
        { face: leftFace, hue: colors[1], delay: 0 },
        { face: rightFace, hue: colors[3], delay: 3.5 },
      ].map((p, k) => (
        <motion.div key={k}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{ left: p.face.x, top: p.face.y, width: 120, height: 120,
            background: `radial-gradient(circle, ${p.hue}66, transparent 70%)`,
            filter: 'blur(10px)', mixBlendMode: 'screen' }}
          animate={{ opacity: [0, 0, 0.9, 0.3, 0], scale: [0.5, 0.5, 1.2, 0.9, 0.5] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: p.delay, times: [0, 0.4, 0.5, 0.7, 0.85] }}
        />
      ))}

      {/* Mosca revoloteando entre los dos rostros */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ x: 0, y: 0 }}
        animate={{
          x: [leftFace.x, '46vw', rightFace.x, '52vw', leftFace.x],
          y: [leftFace.y, '22vh', rightFace.y, '26vh', leftFace.y],
          rotate: [-12, 8, -6, 10, -12],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Estela de polvo mágico */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.span key={i}
            className="absolute rounded-full pointer-events-none"
            style={{ width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2,
              background: colors[i % colors.length],
              boxShadow: `0 0 8px ${colors[i % colors.length]}`,
              left: -(6 + i * 8), top: 6 + (i % 2 ? -4 : 4) }}
            animate={{ opacity: [0, 1, 0], x: [0, -6, 8], y: [0, 8, -6] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: i * 0.18 }}
          />
        ))}

        {cut && (
          <motion.img
            src={cut} alt="Mosca" draggable={false}
            className="relative select-none pointer-events-none"
            style={{ width: 70, height: 'auto', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,.7))' }}
            animate={{ scale: [1, 1.12, 0.94, 1.08, 1], rotate: [0, 4, -3, 5, 0] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Halo de color alrededor de la mosca */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{ width: 80, height: 80, filter: 'blur(10px)', mixBlendMode: 'screen' }}
          animate={{ background: colors.map((c) => `radial-gradient(circle, ${c}99, transparent 70%)`) }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
}