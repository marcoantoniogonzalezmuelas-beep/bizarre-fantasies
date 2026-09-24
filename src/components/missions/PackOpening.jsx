import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import PackCard from '@/components/missions/PackCard';
import PackReveal3D from '@/components/missions/PackReveal3D';
import { epicCount } from '@/components/missions/missionRules';

const PACK_ART = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/5190ba71a_generated_image.png';

export default function PackOpening({ packs, mission, level, onTeamSelected }) {
  const [opened, setOpened] = useState(() => packs.map(() => false));
  const [activeIdx, setActiveIdx] = useState(null);
  const [tearProgress, setTearProgress] = useState(0);
  const [packOpened, setPackOpened] = useState(false);
  const [revealIdx, setRevealIdx] = useState(0);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const packRef = useRef(null);
  const dragging = useRef(false);

  const allOpened = opened.every(v => v);
  const allHeroes = packs.flat();
  useEffect(() => {
    if (activeIdx !== null) packRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' });
  }, [activeIdx, packOpened, revealIdx]);

  function startTear(idx) {
    if (opened[idx] || activeIdx !== null) return;
    setActiveIdx(idx);
    setTearProgress(0);
    setPackOpened(false);
    setRevealIdx(0);
    setCardRevealed(false);
  }

  function finishTear() {
    if (packOpened) return;
    dragging.current = false;
    setTearProgress(100);
    setPackOpened(true);
  }

  const handleMove = useCallback((clientX) => {
    if (!dragging.current || !packRef.current || packOpened) return;
    const rect = packRef.current.getBoundingClientRect();
    const progress = Math.max(0, Math.min(100, (clientX - rect.left) / rect.width * 100));
    setTearProgress(progress);
    if (progress >= 92) finishTear();
  }, [packOpened]);

  function onPointerDown(e) {
    if (packOpened) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    handleMove(e.clientX);
  }
  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    setTearProgress(0);
  }

  function continueFromPack() {
    if (!cardRevealed) return;
    setCardRevealed(false);
    if (revealIdx < packs[activeIdx].length - 1) { setRevealIdx(i => i + 1); return; }
    setOpened(prev => prev.map((value, index) => index === activeIdx ? true : value));
    setPackOpened(false);
    setActiveIdx(null);
    setTearProgress(0);
  }

  function toggleHero(card) {
    setError('');
    setSelected(prev => {
      if (prev.some(c => c.id === card.id)) return prev.filter(c => c.id !== card.id);
      if (prev.length >= 3) return prev;
      const newTeam = [...prev, card];
      if (level.exactEpics && epicCount(newTeam) > level.exactEpics) { setError(`Este nivel requiere exactamente ${level.exactEpics} épica(s).`); return prev; }
      if (!level.exactEpics && epicCount(newTeam) > level.epics) { setError(`Máximo ${level.epics} épica(s) en este nivel.`); return prev; }
      return newTeam;
    });
  }

  function confirm() {
    if (selected.length !== 3) { setError('Elige 3 héroes.'); return; }
    if (level.exactEpics && epicCount(selected) !== level.exactEpics) { setError(`Este nivel requiere exactamente ${level.exactEpics} épica(s).`); return; }
    if (!level.exactEpics && epicCount(selected) > level.epics) { setError(`Máximo ${level.epics} épica(s).`); return; }
    onTeamSelected(selected);
  }

  // Selection view (all packs opened)
  if (allOpened && activeIdx === null) {
    return (
      <div className="pack-stage">
        <div className="pack-header">
          <h3 className="font-heading text-2xl">Elige tu ejército</h3>
          <p>3 héroes de los {allHeroes.length} revelados · {selected.length}/3 elegidos</p>
        </div>
        <div className="pack-selection-grid">
          {allHeroes.map(card => (
            <PackCard key={card.id} card={card}
              selected={selected.some(c => c.id === card.id)}
              onSelect={() => toggleHero(card)}
              disabled={!selected.some(c => c.id === card.id) && selected.length >= 3}
            />
          ))}
        </div>
        {error && <p role="alert" className="text-red-400 text-sm">{error}</p>}
        <button className="mission-button primary" disabled={selected.length !== 3} onClick={confirm}>
          <Check size={18} /> Confirmar ejército
        </button>
      </div>
    );
  }

  // Tear only the top seal, then reveal the actual cards one at a time.
  if (activeIdx !== null) {
    const packHeroes = packs[activeIdx];
    return <div className="pack-stage">
      <div className="pack-header"><h3 className="font-heading text-2xl">Sobre {activeIdx + 1}</h3><p>{packOpened ? `Carta ${revealIdx + 1} de ${packHeroes.length}` : 'Desliza el dedo por la parte superior, de izquierda a derecha.'}</p></div>
      <div className="pack-tear-stage" ref={packRef}>
        {packOpened && <div key={`${activeIdx}-${revealIdx}`} className="pack-reveal-card"><PackReveal3D card={packHeroes[revealIdx]} onReveal={() => setCardRevealed(true)} /></div>}
        <div className={`pack-cover ${packOpened ? 'pack-cover-opened' : ''}`} aria-hidden="true">
          <img className="pack-cover-body" src={PACK_ART} alt="" draggable={false} />
          <img className="pack-cover-seal" src={PACK_ART} alt="" draggable={false} style={{ clipPath: `polygon(${tearProgress}% 0, 100% 0, 100% 15%, ${tearProgress}% 15%)` }} />
          {tearProgress > 0 && <img className="pack-cover-torn" src={PACK_ART} alt="" draggable={false} style={{ clipPath: `polygon(0 0, ${tearProgress}% 0, ${tearProgress}% 15%, 0 15%)`, transform: `translateY(-${tearProgress * .45}px) rotate(-${tearProgress * .06}deg)` }} />}
          {!packOpened && <span className="pack-tear-edge" style={{ left: `${tearProgress}%` }} />}
        </div>
        {!packOpened && <div className="pack-tear-target" role="slider" aria-label="Rasgar la parte superior del sobre" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(tearProgress)} tabIndex={0}
          onPointerDown={onPointerDown} onPointerMove={e => handleMove(e.clientX)} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finishTear(); } }} />}
      </div>
      {packOpened ? <button className="mission-button primary" disabled={!cardRevealed} onClick={continueFromPack}><ArrowRight size={18} /> {revealIdx === packHeroes.length - 1 ? 'Terminar sobre' : 'Siguiente carta'}</button>
        : <button className="mission-button" onClick={finishTear}>Abrir sin deslizar</button>}
    </div>;
  }

  // Sealed packs view
  return (
    <div className="pack-stage">
      <div className="pack-header">
        <h3 className="font-heading text-2xl">{packs.length === 1 ? 'Un sobre' : 'Tres sobres'} del {mission.name}</h3>
        <p>Elige un sobre y rasga la parte superior para descubrir sus cartas, una por una.</p>
      </div>
      <div className="pack-row">
        {packs.map((_, i) => (
          <button key={i} className={`pack-sealed ${opened[i] ? 'opened' : ''}`}
            onClick={() => startTear(i)} disabled={opened[i]}>
            <img src={PACK_ART} alt={`Sobre ${i + 1}`} draggable={false} />
            <span className="pack-seal-label">{opened[i] ? '✓ Abierto' : `Sobre ${i + 1}`}</span>
          </button>
        ))}
      </div>
      <p className="pack-progress">{opened.filter(v => v).length}/{packs.length} {packs.length === 1 ? 'abierto' : 'abiertos'}</p>
    </div>
  );
}