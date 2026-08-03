import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCutoutSrc } from '@/lib/useCutoutSrc';

const DECEPTICON_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/888548f76_generated_image.png';

// Robot Decepticon (transformable volador) que sobrevuela la escena del
// Transformer contra el Tanque emitiendo focos de color que barren e
// iluminan a los dos combatientes. Vuela en arco horizontal bobeando y
// desde él descienden dos conos de luz (~22% y ~78%) que pulsan y cambian
// de color, como cámaras/focos de un combate mecánico sobrevolando a los
// protagonistas. Reemplaza al dron genérico por un mecha Decepticon.
export default function DecepticonLights() {
  const colors = useMemo(
    () => ['#ff3c6a', '#3cd0ff', '#9d5bff', '#ffd24a', '#5affc8', '#ff7adf'],
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* Conos de luz sobre cada combatiente (fijos, pulsan color) */}
      {[22, 78].map((cx, k) => (
        <div key={k} className="absolute top-0 pointer-events-none" style={{ left: `${cx}%`, transform: 'translateX(-50%)' }}>
          <motion.div
            className="pointer-events-none"
            style={{
              width: 260, height: '72vh',
              background: `radial-gradient(ellipse 42% 78% at 50% 8%, currentColor 0%, transparent 74%)`,
              filter: 'blur(7px)', mixBlendMode: 'screen',
            }}
            animate={{ color: colors, opacity: [0.35, 0.7, 0.5, 0.7, 0.35] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: k * 1.2 }}
          />
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
            style={{ bottom: '6vh', width: 220, height: 160, filter: 'blur(8px)', mixBlendMode: 'screen' }}
            animate={{ background: colors.map((c) => `radial-gradient(circle, ${c}cc, ${c}33 55%, transparent 75%)`), opacity: [0.5, 0.9, 0.6, 0.9, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: k * 1.2 }}
          />
        </div>
      ))}

      {/* Estela de propulsores/jets detrás del mecha */}
      <DecepticonJetTrail colors={colors} />

      {/* Neblina tecnológica de escenario */}
      <div className="absolute -bottom-10 left-0 right-0 h-1/3 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(120,90,200,.4), transparent 70%)' }} />
    </div>
  );
}

function DecepticonJetTrail({ colors }) {
  const cut = useCutoutSrc(DECEPTICON_IMG);
  return (
    <motion.div
      className="absolute top-[6%] left-0"
      animate={{ left: ['12%', '74%', '40%', '16%', '12%'], y: [0, -18, 12, -10, 0], rotate: [-8, 8, -4, 5, -8] }}
      transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Estela de propulsores magenta/cian */}
      <motion.div
        className="absolute left-[-30px] top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{ width: 70, height: 16, filter: 'blur(6px)', mixBlendMode: 'screen' }}
        animate={{ background: ['#ff3c6a', '#3cd0ff', '#9d5bff', '#5affc8'].map((c) => `linear-gradient(to left, ${c}, transparent)`), opacity: [0.6, 0.9, 0.5, 0.9, 0.6] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
      />
      {cut && (
        <motion.img
          src={cut} alt="" draggable={false}
          className="relative select-none pointer-events-none"
          style={{ width: 130, height: 'auto', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,.75))' }}
          animate={{ scale: [1, 1.05, 0.98, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {/* Halo de color que envuelve al mecha */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{ width: 130, height: 130, filter: 'blur(14px)', mixBlendMode: 'screen' }}
        animate={{ background: colors.map((c) => `radial-gradient(circle, ${c}88, transparent 70%)`) }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Láseres: chorros finos y brillantes que dispara el mecha hacia abajo,
          con núcleo blanco y halo de color, pulsando como ráfagas. */}
      {[
        { dx: -42, tilt: -16, hue: '#ff2a4a', dur: 0.7, delay: 0 },
        { dx: 0, tilt: 6, hue: '#3cd0ff', dur: 0.9, delay: 0.25 },
        { dx: 46, tilt: 22, hue: '#9d5bff', dur: 0.8, delay: 0.5 },
      ].map((l, k) => (
        <div key={k} className="absolute left-1/2 top-[55%] pointer-events-none" style={{ transform: `translateX(${l.dx}px) rotate(${l.tilt}deg)`, transformOrigin: '50% 0%' }}>
          {/* Haz principal del láser */}
          <motion.div
            className="pointer-events-none rounded-full"
            style={{ width: 5, height: '90vh', marginLeft: -2.5,
              background: `linear-gradient(to bottom, #fff 0%, ${l.hue} 18%, ${l.hue} 70%, transparent 100%)`,
              boxShadow: `0 0 10px ${l.hue}, 0 0 22px ${l.hue}` }}
            animate={{ opacity: [0, 1, 0.25, 1, 0.15, 0], scaleY: [0.6, 1, 0.9, 1, 0.7, 0.5] }}
            transition={{ duration: l.dur, repeat: Infinity, ease: 'easeOut', delay: l.delay }}
          />
          {/* Halo difuso alrededor del haz */}
          <motion.div
            className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none rounded-full"
            style={{ width: 26, height: '90vh', filter: 'blur(8px)', mixBlendMode: 'screen',
              background: `linear-gradient(to bottom, ${l.hue}cc, ${l.hue}55 50%, transparent 100%)` }}
            animate={{ opacity: [0, 0.8, 0.3, 0.8, 0.2, 0] }}
            transition={{ duration: l.dur, repeat: Infinity, ease: 'easeOut', delay: l.delay }}
          />
          {/* Fogonazo en la boca del cañón (origen) */}
          <motion.div
            className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{ width: 22, height: 22, background: `radial-gradient(circle, #fff, ${l.hue} 55%, transparent 75%)`, filter: 'blur(2px)' }}
            animate={{ opacity: [0, 1, 0.2, 1, 0.1, 0], scale: [0.5, 1.4, 0.8, 1.3, 0.6, 0.4] }}
            transition={{ duration: l.dur, repeat: Infinity, ease: 'easeOut', delay: l.delay }}
          />
          {/* Impacto en el suelo */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
            style={{ bottom: '-2vh', width: 90, height: 46, filter: 'blur(8px)', mixBlendMode: 'screen',
              background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${l.hue}cc, ${l.hue}33 55%, transparent 75%)` }}
            animate={{ opacity: [0, 0.9, 0.2, 0.85, 0.1, 0], scale: [0.5, 1.15, 0.8, 1.1, 0.6, 0.4] }}
            transition={{ duration: l.dur, repeat: Infinity, ease: 'easeOut', delay: l.delay }}
          />
        </div>
      ))}
    </motion.div>
  );
}