import React, { useState, useRef, useCallback } from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import MissionHero from '@/components/missions/MissionHero';
import { isEpic, epicCount } from '@/components/missions/missionRules';

const PACK_ART = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/5190ba71a_generated_image.png';

function PackHeroCell({ card }) {
  return (
    <div className="pack-hero-cell">
      <img src={card.art_url || card.battle_art_url || card.elite_art_url} alt={card.name} loading="lazy" />
      <span className="pack-hero-name">{card.name}</span>
      {isEpic(card) && <span className="pack-hero-epic">ÉPICA</span>}
    </div>
  );
}

export default function PackOpening({ packs, mission, level, onTeamSelected }) {
  const [opened, setOpened] = useState(() => packs.map(() => false));
  const [activeIdx, setActiveIdx] = useState(null);
  const [tearProgress, setTearProgress] = useState(0);
  const [packOpened, setPackOpened] = useState(false);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const packRef = useRef(null);
  const dragging = useRef(false);

  const allOpened = opened.every(v => v);
  const allHeroes = packs.flat();

  function startTear(idx) {
    if (opened[idx] || packOpened) return;
    setActiveIdx(idx);
    setTearProgress(0);
    setPackOpened(false);
  }

  const handleMove = useCallback((clientX) => {
    if (!dragging.current || !packRef.current || activeIdx === null || packOpened) return;
    const rect = packRef.current.getBoundingClientRect();
    const progress = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setTearProgress(progress);
    if (progress >= 92) {
      dragging.current = false;
      setOpened(prev => { const n = [...prev]; n[activeIdx] = true; return n; });
      setPackOpened(true);
      setTearProgress(100);
    }
  }, [activeIdx, packOpened]);

  function onPointerDown(e) { if (packOpened) return; dragging.current = true; e.preventDefault(); }
  function onPointerMove(e) { handleMove(e.clientX); }
  function onPointerUp() { dragging.current = false; if (!packOpened && tearProgress < 92) setTearProgress(0); }

  function continueFromPack() {
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
        <div className="mission-heroes">
          {allHeroes.map(card => (
            <MissionHero key={card.id} card={card}
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

  // Pack opening view (tearing or just opened)
  if (activeIdx !== null) {
    const packHeroes = packs[activeIdx];
    return (
      <div className="pack-tear-stage" ref={packRef}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
        <div className={`pack-tear-heroes ${packOpened ? 'revealed' : ''}`}>
          {packHeroes.map(card => <PackHeroCell key={card.id} card={card} />)}
        </div>
        {!packOpened && (
          <div className="pack-cover" style={{ clipPath: `inset(0 0 0 ${tearProgress}%)` }}>
            <img src={PACK_ART} alt="Sobre sellado" draggable={false} />
            <div className="pack-tear-edge" style={{ left: `${tearProgress}%` }} />
            <div className="pack-tear-hint">
              <span className="pack-tear-hint-text">← Rasga para abrir →</span>
            </div>
          </div>
        )}
        {packOpened && (
          <button className="pack-continue-btn" onClick={continueFromPack}>
            <ArrowRight size={18} /> Continuar
          </button>
        )}
      </div>
    );
  }

  // Sealed packs view
  return (
    <div className="pack-stage">
      <div className="pack-header">
        <h3 className="font-heading text-2xl">Tres sobres del {mission.name}</h3>
        <p>Toca un sobre y rasga los bordes para abrirlo.</p>
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
      <p className="pack-progress">{opened.filter(v => v).length}/3 abiertos</p>
    </div>
  );
}