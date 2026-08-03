import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Luces de máquina arcade de los 90: letrero de neón parpadeante en el borde
// superior (tipo marquee de cabinete), bombillas de colores a los lados,
// scanlines CRT parpadeantes y destellos pixelados. Ambiente salón recreativo.
export default function ArcadeLights() {
  const bulbs = useMemo(() => {
    const hues = ['#ff2a6d', '#05d9ff', '#ffd24a', '#39ff14', '#ff7a18', '#b13bff'];
    const L = 16;
    return Array.from({ length: L }, (_, i) => ({
      side: i % 2 === 0 ? 'left' : 'right',
      idx: Math.floor(i / 2),
      hue: hues[i % hues.length],
      dur: 0.7 + (i % 3) * 0.25,
      delay: (i % 5) * 0.18,
    }));
  }, []);

  const neonColors = ['#ff2a6d', '#05d9ff', '#ffd24a', '#39ff14', '#b13bff', '#ff7a18'];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* Marquee superior tipo letrero de cabinate */}
      <div className="absolute top-0 left-0 right-0 h-[14%] pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(5,0,20,.85), transparent)' }} />
        {/* Bombillas del marquee */}
        {Array.from({ length: 22 }).map((_, i) => (
          <motion.span key={i}
            className="absolute top-[18%] rounded-full"
            style={{ left: `${3 + i * 4.4}%`, width: 9, height: 9, background: neonColors[i % neonColors.length], boxShadow: `0 0 8px ${neonColors[i % neonColors.length]}` }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.6 + (i % 4) * 0.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.09 }}
          />
        ))}
        {/* Título pixelado */}
        <motion.div
          className="absolute top-[44%] left-1/2 -translate-x-1/2 font-mono font-black tracking-widest text-center"
          style={{ fontSize: 22, color: '#05d9ff', textShadow: '0 0 8px #05d9ff, 0 0 16px #05d9ff, 2px 2px 0 #ff2a6d' }}
          animate={{ opacity: [0.7, 1, 0.7], color: ['#05d9ff', '#ff2a6d', '#39ff14', '#ffd24a', '#05d9ff'] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          ★ VS ★
        </motion.div>
      </div>

      {/* Bombillas laterales tipo panel de botones */}
      {bulbs.map((b, k) => (
        <motion.span key={k}
          className={`absolute rounded-full ${b.side === 'left' ? '' : ''}`}
          style={{ [b.side]: `${5 + b.idx * 7}%`, top: `${22 + b.idx * 4}%`, width: 12, height: 12, background: b.hue, boxShadow: `0 0 10px ${b.hue}, 0 0 18px ${b.hue}88` }}
          animate={{ opacity: [0.35, 1, 0.35], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut', delay: b.delay }}
        />
      ))}

      {/* Neón parpadeante del borde inferior tipo INSERT COIN */}
      <motion.div
        className="absolute bottom-[6%] left-1/2 -translate-x-1/2 font-mono font-black tracking-[0.3em] text-sm"
        style={{ color: '#ffd24a', textShadow: '0 0 8px #ffd24a, 0 0 16px #ff7a18, 2px 2px 0 #ff2a6d' }}
        animate={{ opacity: [0.4, 1, 0.4, 1, 0.4] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: [0.1, 0, 0.1, 1] }}
      >
        INSERT COIN
      </motion.div>

      {/* Scanlines CRT */}
      <div className="absolute inset-0 pointer-events-none opacity-25"
        style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 2px, rgba(0,0,0,.55) 3px, transparent 4px)' }} />
      <motion.div className="absolute left-0 right-0 h-8 pointer-events-none opacity-20"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(120,200,255,.5), transparent)' }}
        animate={{ y: ['0vh', '100vh'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {/* Destellos pixelados parpadeantes */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.span key={i}
          className="absolute pointer-events-none"
          style={{ left: `${10 + i * 15}%`, top: `${30 + (i % 3) * 18}%`, width: 4, height: 4, background: neonColors[i % neonColors.length], boxShadow: `0 0 6px ${neonColors[i % neonColors.length]}` }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 2, 0.5] }}
          transition={{ duration: 0.4, repeat: Infinity, ease: 'easeOut', delay: i * 0.3 }}
        />
      ))}

      {/* Resplandor neón de fondo */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(255,42,109,.3), transparent 60%)' }} />
    </div>
  );
}