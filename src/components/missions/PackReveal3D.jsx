import React, { useEffect, useState } from 'react';
import PackCard from '@/components/missions/PackCard';
import { CARD_BACK_URL } from '@/lib/rivalHandBackPatch';
import '@/components/missions/packReveal3d.css';

export default function PackReveal3D({ card, onReveal }) {
  const [revealed, setRevealed] = useState(false), [back, setBack] = useState(false);
  useEffect(() => { if (!revealed) return; const timer = setTimeout(() => onReveal(), 1450); return () => clearTimeout(timer); }, [revealed]);
  function reveal() { if (!revealed) setRevealed(true); }
  function tilt(event) {
    if (event.pointerType !== 'mouse' || !revealed) return;
    const r = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--tilt-x', `${-(event.clientY - r.top - r.height / 2) / r.height * 16}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${(event.clientX - r.left - r.width / 2) / r.width * 30}deg`);
  }
  return <div className="pack-reveal-3d" onPointerMove={tilt} onPointerLeave={e => { e.currentTarget.style.setProperty('--tilt-x', '0deg'); e.currentTarget.style.setProperty('--tilt-y', '0deg'); }}>
    <div className={`pack-reveal-turn ${revealed ? 'is-revealed' : ''} ${back ? 'is-back' : ''}`}>
      <button className="pack-reveal-back" aria-label="Revelar carta" disabled={revealed} onClick={reveal} tabIndex={revealed ? -1 : 0} aria-hidden={revealed && !back}>
        <img src={CARD_BACK_URL} alt="Reverso BF con el emblema del pollito" draggable={false} />
        <span>{revealed ? 'Bizarre Fantasies · Reverso BF' : 'Toca para revelar'}</span>
      </button>
      <div className="pack-reveal-front" aria-hidden={!revealed || back}><PackCard card={card} /><span className="pack-reveal-shine" aria-hidden="true" /></div>
    </div>
    {revealed && <div className="pack-inspect-controls"><button className="mission-button" aria-pressed={back} onClick={() => setBack(v => !v)}>{back ? 'Ver anverso' : 'Ver reverso'}</button></div>}
  </div>;
}