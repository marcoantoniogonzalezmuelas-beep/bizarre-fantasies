import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCutoutSrc } from '@/lib/useCutoutSrc';

const PUNKITO_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/6056056ef_generated_image.png';

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

// Punkito volando por toda la diapositiva con vuelo errático, soltando
// grandes chorros de luz coloreados hacia abajo. Renderizado igual que el
// resto de flyers del cine (recorte del fondo negro → sprite visible).
function PunkitoJets() {
  const cut = useCutoutSrc(PUNKITO_IMG);
  const jets = useMemo(
    () => Array.from({ length: 7 }, (_, i) => ({
      hue: ['#ffd27a', '#ff9a6a', '#8fb6ff', '#c08bff', '#7ad9c0', '#ff8fc0', '#ffe27a'][i % 7],
      dx: (i - 3) * 20,
      dur: 1.8 + (i % 3) * 0.5,
      delay: i * 0.2,
      w: 64 + (i % 3) * 30,
    })),
    []
  );
  return (
    <motion.div
      className="absolute top-[8%] left-0 z-[2]"
      animate={{ x: ['10vw', '66vw', '30vw', '58vw', '18vw', '48vw', '10vw'], y: [0, -90, 60, -30, 80, -50, 0], rotate: [-10, 12, -5, 8, -7, 6, -10] }}
      transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Chorros de luz que caen desde el pollito punky */}
      {jets.map((j, k) => (
        <motion.div key={k}
          className="absolute left-1/2 top-[65%] -translate-x-1/2 rounded-full pointer-events-none"
          style={{ width: j.w, height: '60vh', marginLeft: j.dx,
            background: `linear-gradient(to bottom, ${j.hue}cc 0%, ${j.hue}55 35%, transparent 78%)`,
            filter: 'blur(9px)', mixBlendMode: 'screen', transformOrigin: '50% 0%' }}
          animate={{ opacity: [0.2, 0.9, 0.4, 0.85, 0.2], scaleY: [0.7, 1.1, 0.85, 1, 0.7] }}
          transition={{ duration: j.dur, repeat: Infinity, ease: 'easeInOut', delay: j.delay }}
        />
      ))}

      {cut && (
        <motion.img
          src={cut} alt="Pollito punky" draggable={false}
          className="relative select-none pointer-events-none"
          style={{ width: 120, height: 'auto', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,.8))' }}
          animate={{ scale: [1, 1.06, 0.97, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  );
}