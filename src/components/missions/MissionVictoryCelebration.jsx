import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';

const REWARDS = {
  1: { emoji: '🐔', color: '#7ec97e', title: '¡INICIACIÓN SUPERADA!', sub: 'El pollo de guerra te concede su casco torcido.', joke: '“El pollo aún cree que ‘puya’ es una estrategia.” 🐤', badge: '⚡ NIVEL 2 DESBLOQUEADO', duration: 4200 },
  2: { emoji: '🦆', color: '#ff7a5a', title: '¡SOBRE DOMESTICADO!', sub: 'El pato épico salió del sobre antes que las cartas.', joke: '“El pato siempre sale del sobre antes que las cartas.” 🦆', badge: '⚡ NIVEL 3 DESBLOQUEADO', duration: 4800 },
  3: { emoji: '🐲', color: '#7ab8ff', title: '¡DESAFÍO APLASTADO!', sub: 'Un caballero diminuto persigue al dragón equivocado.', joke: '“El dragón no esperaba al caballero… ni nadie.” 🐉', badge: '⚡ NIVEL 4 DESBLOQUEADO', duration: 5400 },
  4: { emoji: '👑', color: '#c06bff', title: '¡MAESTRÍA BIZARRA!', sub: 'La corona eligió al goblin. Nadie se atreve a discutirlo.', joke: '“La corona eligió al goblin. Nadie discute.” 👑', badge: '⚡ NIVEL 5 DESBLOQUEADO', duration: 6500 },
  5: { emoji: '🏆', color: '#ff44dd', title: '¡SELLO ÉPICO CONQUISTADO!', sub: 'La bestia alada aterrizó dentro del trofeo. Cuenta como victoria.', joke: '“Eres un BIZARRO legendario. Los dioses del caos te temen.” 🃏', badge: '🏆 MISIÓN COMPLETADA', duration: 9000 },
};

const EMOJIS = ['🤡', '💀', '🎉', '🌈', '✨', '🃏', '👾', '🤯', '💩', '🦄', '⚡', '🎲'];
const COLORS = ['#ff44dd', '#ffd24a', '#7ab8ff', '#66ffaa', '#ff7a5a', '#c06bff', '#ffffff'];

export default function MissionVictoryCelebration({ reward, onClose }) {
  const scene = REWARDS[reward.level] || REWARDS[1];
  const closed = useRef(false);
  const close = () => { if (closed.current) return; closed.current = true; onClose(); };

  useEffect(() => {
    const end = Date.now() + scene.duration;
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors: COLORS });
      confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors: COLORS });
      if (Date.now() < end && !closed.current) requestAnimationFrame(frame);
    };
    confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 }, colors: COLORS });
    requestAnimationFrame(frame);
    const timer = setTimeout(close, scene.duration + 800);
    return () => clearTimeout(timer);
  }, [scene.duration]);

  const emojis = Array.from({ length: 14 }, (_, i) => ({ char: EMOJIS[i % EMOJIS.length], left: (i * 7 + Math.random() * 5) % 100, delay: Math.random() * 2.5, dur: 2.5 + Math.random() * 3.5 }));

  return (
    <div className="mc-stage" style={{ '--mc-c': scene.color }} role="status" aria-live="assertive">
      <div className="mc-veil" style={{ background: `radial-gradient(circle at 50% 45%, ${scene.color}33, transparent 60%)` }} />
      <button className="mc-skip-btn" onClick={close} aria-label="Saltar celebración"><X size={18} /></button>
      <div className="mc-emoji-rain" aria-hidden="true">
        {emojis.map((e, i) => <span key={i} className="mc-emoji" style={{ left: `${e.left}vw`, animationDelay: `${e.delay}s`, animationDuration: `${e.dur}s` }}>{e.char}</span>)}
      </div>
      <div className="mc-content">
        <div className="mc-avatar" style={{ borderColor: scene.color, boxShadow: `0 0 60px ${scene.color}, 0 0 120px rgba(255,210,74,.5), inset 0 0 30px rgba(0,0,0,.6)` }}>
          <span>{scene.emoji}</span>
        </div>
        <p className="mc-eyebrow">MISIÓN {reward.mission.toUpperCase()} · NIVEL {reward.level}</p>
        <h2 className="mc-title" style={{ color: scene.color, textShadow: `0 0 30px ${scene.color}, 0 0 60px ${scene.color}55, 0 4px 10px #000` }}>{scene.title}</h2>
        <p className="mc-sub">{scene.sub}</p>
        <p className="mc-joke">{scene.joke}</p>
        <div className="mc-badge">{scene.badge}</div>
      </div>
      <button className="mc-continue" onClick={close}>Continuar</button>
    </div>
  );
}