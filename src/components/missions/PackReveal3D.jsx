import React, { useEffect, useRef, useState } from 'react';
import PackCard from '@/components/missions/PackCard';
import { CARD_BACK_URL } from '@/lib/rivalHandBackPatch';
import '@/components/missions/packReveal3d.css';

// Carta del sobre en 3D: se revela con un giro y después se puede girar
// libremente arrastrando (ratón o dedo) para ver anverso y reverso.
export default function PackReveal3D({ card, onReveal }) {
  const [revealed, setRevealed] = useState(false), [spin, setSpin] = useState(0), [drag, setDrag] = useState(null);
  const turnRef = useRef(null);
  useEffect(() => { if (!revealed) return; const timer = setTimeout(() => onReveal(), 1450); return () => clearTimeout(timer); }, [revealed]);
  const angle = drag ? drag.base + drag.dx : spin;
  const showingBack = revealed && Math.round(angle / 180) % 2 === 0;
  function reveal() { if (!revealed) { setRevealed(true); setSpin(180); } }
  function down(e) {
    if (!revealed) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ x: e.clientX, base: spin, dx: 0 });
  }
  function move(e) { if (drag) setDrag({ ...drag, dx: (e.clientX - drag.x) * 0.9 }); }
  function up() {
    if (!drag) return;
    const moved = Math.abs(drag.dx) > 6;
    setSpin(moved ? Math.round((drag.base + drag.dx) / 180) * 180 : drag.base);
    setDrag(null);
  }
  const style = revealed ? { transform: `rotateX(${drag ? -4 : 0}deg) rotateY(${angle}deg)`, transition: drag ? 'none' : undefined } : undefined;
  return <div className={`pack-reveal-3d ${revealed ? 'can-drag' : ''}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
    <div ref={turnRef} className={`pack-reveal-turn ${revealed ? 'is-revealed' : ''}`} style={style}>
      <span className="pack-reveal-core" aria-hidden="true" />
      <span className="pack-reveal-core pack-reveal-core-2" aria-hidden="true" />
      <button className="pack-reveal-back" aria-label="Revelar carta" disabled={revealed} onClick={reveal} tabIndex={revealed ? -1 : 0} aria-hidden={revealed && !showingBack}>
        <img src={CARD_BACK_URL} alt="Reverso BF con el emblema del pollito" draggable={false} />
        <span className="pack-back-frame" aria-hidden="true" />
        <span className="pack-back-holo" aria-hidden="true" />
        {!revealed && <span className="pack-back-label">Toca para revelar</span>}
      </button>
      <div className="pack-reveal-front" aria-hidden={!revealed || showingBack}><PackCard card={card} /><span className="pack-reveal-shine" aria-hidden="true" /></div>
    </div>
    {revealed && <div className="pack-inspect-controls"><button className="mission-button" onPointerDown={e => e.stopPropagation()} onClick={() => setSpin(s => s + 180)}>{showingBack ? 'Ver anverso' : 'Ver reverso'}</button><span className="pack-drag-hint">Arrastra para girar</span></div>}
  </div>;
}