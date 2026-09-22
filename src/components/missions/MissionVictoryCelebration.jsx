import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const REWARDS = {
  1: { icon: '🐔', side: '🪖', title: '¡Iniciación superada!', line: 'El pollo de guerra te concede su casco torcido.' },
  2: { icon: '🦆', side: '🎁', title: '¡Sobre domesticado!', line: 'El pato épico salió del sobre antes que las cartas.' },
  3: { icon: '🐲', side: '🗡️', title: '¡Desafío aplastado!', line: 'Un caballero diminuto persigue al dragón equivocado.' },
  4: { icon: '👑', side: '👹', title: '¡Maestría bizarra!', line: 'La corona eligió al goblin. Nadie se atreve a discutirlo.' },
  5: { icon: '🏆', side: '🪽', title: '¡Sello épico conquistado!', line: 'La bestia alada aterrizó dentro del trofeo. Cuenta como victoria.' },
};

export default function MissionVictoryCelebration({ reward, onClose }) {
  const scene = REWARDS[reward.level] || REWARDS[1];
  useEffect(() => { const timer = setTimeout(onClose, 5200); return () => clearTimeout(timer); }, [onClose]);
  return <div className={`mission-celebration level-${reward.level}`} role="status" aria-live="assertive">
    <button onClick={onClose} aria-label="Cerrar celebración"><X size={20} /></button>
    <div className="mission-confetti" aria-hidden="true">✦ ✹ ★ ✦ ★ ✹ ✦</div>
    <div className="mission-comedy" aria-hidden="true"><span>{scene.side}</span><strong>{scene.icon}</strong><span>{scene.side}</span></div>
    <p className="mission-eyebrow">MISIÓN {reward.mission.toUpperCase()} · NIVEL {reward.level}</p>
    <h2>{scene.title}</h2><p>{scene.line}</p>
  </div>;
}