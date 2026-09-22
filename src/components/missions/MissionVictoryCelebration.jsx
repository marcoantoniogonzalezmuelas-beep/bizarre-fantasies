import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MISSION_VIDEOS, VIDEO_DURATION_MS } from '@/components/missions/missionVideoUrls';

const REWARDS = {
  1: { color: '#7ec97e', title: '¡INICIACIÓN SUPERADA!', sub: 'El pollo de guerra te concede su casco torcido.', joke: '“El pollo aún cree que ‘puya’ es una estrategia.” 🐤', badge: '⚡ NIVEL 2 DESBLOQUEADO' },
  2: { color: '#ff7a5a', title: '¡SOBRE DOMESTICADO!', sub: 'El pato épico salió del sobre antes que las cartas.', joke: '“El pato siempre sale del sobre antes que las cartas.” 🦆', badge: '⚡ NIVEL 3 DESBLOQUEADO' },
  3: { color: '#7ab8ff', title: '¡DESAFÍO APLASTADO!', sub: 'Un caballero diminuto persigue al dragón equivocado.', joke: '“El dragón no esperaba al caballero… ni nadie.” 🐉', badge: '⚡ NIVEL 4 DESBLOQUEADO' },
  4: { color: '#c06bff', title: '¡MAESTRÍA BIZARRA!', sub: 'La corona eligió al goblin. Nadie se atreve a discutirlo.', joke: '“La corona eligió al goblin. Nadie discute.” 👑', badge: '⚡ NIVEL 5 DESBLOQUEADO' },
  5: { color: '#ff44dd', title: '¡SELLO ÉPICO CONQUISTADO!', sub: 'La bestia alada aterrizó dentro del trofeo. Cuenta como victoria.', joke: '“Eres un BIZARRO legendario. Los dioses del caos te temen.” 🃏', badge: '🏆 MISIÓN COMPLETADA' },
};

const COLORS = ['#ff44dd', '#ffd24a', '#7ab8ff', '#66ffaa', '#ff7a5a', '#c06bff', '#ffffff'];

export default function MissionVictoryCelebration({ reward, onClose }) {
  const scene = REWARDS[reward.level] || REWARDS[1];
  const videoUrl = MISSION_VIDEOS[reward.mission]?.[reward.level] || MISSION_VIDEOS.club[1];
  const videoRef = useRef(null);
  const closed = useRef(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [finished, setFinished] = useState(false);
  const close = () => { if (closed.current) return; closed.current = true; onClose(); };

  useEffect(() => {
    const end = Date.now() + VIDEO_DURATION_MS;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors: COLORS });
      confetti({ particleCount: 3, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors: COLORS });
      if (Date.now() < end && !closed.current) requestAnimationFrame(frame);
    };
    confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 }, colors: COLORS });
    requestAnimationFrame(frame);
    const overlayTimer = setTimeout(() => setShowOverlay(true), 1800);
    const finishTimer = setTimeout(() => { setFinished(true); }, VIDEO_DURATION_MS);
    const autoClose = setTimeout(close, VIDEO_DURATION_MS + 4000);
    return () => { clearTimeout(overlayTimer); clearTimeout(finishTimer); clearTimeout(autoClose); };
  }, []);

  return (
    <div className="mc-stage" style={{ '--mc-c': scene.color }} role="status" aria-live="assertive">
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(.85) contrast(1.05)' }}
      />
      <div className="mc-veil" style={{ background: `radial-gradient(circle at 50% 40%, ${scene.color}22, transparent 70%)` }} />
      <button className="mc-skip-btn" onClick={close} aria-label="Saltar celebración"><X size={18} /></button>
      {showOverlay && (
        <div className="mc-content" style={{ pointerEvents: 'none' }}>
          <p className="mc-eyebrow">MISIÓN {reward.mission.toUpperCase()} · NIVEL {reward.level}</p>
          <h2 className="mc-title" style={{ color: scene.color, textShadow: `0 0 30px ${scene.color}, 0 0 60px ${scene.color}55, 0 4px 10px #000` }}>{scene.title}</h2>
          <p className="mc-sub">{scene.sub}</p>
          <p className="mc-joke">{scene.joke}</p>
          <div className="mc-badge">{scene.badge}</div>
        </div>
      )}
      {finished && (
        <button className="mc-continue" onClick={close} style={{ pointerEvents: 'auto' }}>Continuar</button>
      )}
    </div>
  );
}