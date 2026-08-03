import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLightCutoutSrc } from '@/lib/useCutoutSrc';

const PUNKITO_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/97f6581ac_generated_image.png';

// Focos de escenario: pequeñas lámparas circulares colgadas arriba que proyectan
// pools de luz suaves hacia abajo. Pensado para la diapositiva de El Heavy —
// ambiente de concierto, pero discreto (sin haces bestiales ni estroboscopia).
export default function MetalLights() {
  const spots = useMemo(() => {
    const hues = ['#ffd27a', '#ff9a6a', '#8fb6ff', '#c08bff', '#ffd27a', '#7ad9c0', '#ff8fc0'];
    return Array.from({ length: 7 }, (_, i) => ({
      left: 8 + i * 12.6,
      hue: hues[i % hues.length],
      size: 120 + (i % 3) * 50,
      dur: 5 + (i % 3) * 1.6,
      delay: i * 0.45,
      sway: (i % 2 ? 1 : -1) * (6 + (i % 3) * 4),
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* Fila de focos circulares pequeños colgados arriba */}
      {spots.map((s, k) => (
        <div key={k} className="absolute top-0 -translate-x-1/2 pointer-events-none" style={{ left: `${s.left}%` }}>
          {/* Lámpara/foco (circulito sólido) */}
          <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 rounded-full"
            style={{ width: 16, height: 16, background: `radial-gradient(circle at 38% 32%, #fff, ${s.hue} 55%, #1a1018)`, boxShadow: `0 0 10px ${s.hue}, 0 2px 6px rgba(0,0,0,.6)`, border: '1.5px solid rgba(0,0,0,.5)' }} />
          {/* Pool de luz que baja suave */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
            style={{
              width: s.size, height: s.size * 1.4,
              background: `radial-gradient(ellipse 45% 60% at 50% 18%, ${s.hue}88 0%, ${s.hue}33 38%, transparent 72%)`,
              filter: 'blur(6px)', mixBlendMode: 'screen',
            }}
            animate={{ x: [-s.sway / 2, s.sway / 2, -s.sway / 2], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: s.dur, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: s.delay }}
          />
        </div>
      ))}

      {/* Neblina muy sutil de escenario */}
      <div className="absolute -bottom-10 left-0 right-0 h-1/3 opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(120,90,160,.4), transparent 70%)' }} />

      <PunkitoJets />
    </div>
  );
}

// Punkito volando soltando grandes chorros de luz coloreados hacia abajo.
function PunkitoJets() {
  const cut = useLightCutoutSrc(PUNKITO_IMG);
  const jets = useMemo(
    () => Array.from({ length: 5 }, (_, i) => ({
      hue: ['#ffd27a', '#ff9a6a', '#8fb6ff', '#c08bff', '#7ad9c0'][i % 5],
      dx: (i - 2) * 26,
      dur: 1.6 + (i % 3) * 0.5,
      delay: i * 0.18,
      w: 60 + (i % 3) * 30,
    })),
    []
  );
  return (
    <motion.div
      className="absolute top-[6%] left-0"
      animate={{
        x: ['14vw', '72vw', '30vw', '64vw', '18vw', '50vw', '14vw'],
        y: [0, -120, 80, -40, 110, -90, 0],
        rotate: [-8, 12, -5, 9, -7, 6, -8],
      }}
      transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Chorros de luz que caen desde Punkito */}
      {jets.map((j, k) => (
        <motion.div key={k}
          className="absolute left-1/2 top-[70%] -translate-x-1/2 rounded-full pointer-events-none"
          style={{ width: j.w, height: '70vh', marginLeft: j.dx,
            background: `linear-gradient(to bottom, ${j.hue}cc 0%, ${j.hue}55 35%, transparent 78%)`,
            filter: 'blur(9px)', mixBlendMode: 'screen', transformOrigin: '50% 0%' }}
          animate={{ opacity: [0.2, 0.9, 0.4, 0.85, 0.2], scaleY: [0.7, 1.1, 0.85, 1, 0.7] }}
          transition={{ duration: j.dur, repeat: Infinity, ease: 'easeInOut', delay: j.delay }}
        />
      ))}

      {cut && (
        <motion.img
          src={cut} alt="Punkito" draggable={false}
          className="relative select-none pointer-events-none rounded-full"
          style={{ width: 88, height: 88, objectFit: 'cover', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.7))' }}
          animate={{ scale: [1, 1.06, 0.97, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  );
}