import React, { useMemo, useState } from 'react';
import { ArrowLeft, Package, Swords, Users } from 'lucide-react';
import MissionHero from '@/components/missions/MissionHero';
import { heroBudget, isEpic, drawPack, valueOf, equipCoinsForLevel } from '@/components/missions/missionRules';

export default function MissionPreparationDuo({ mission, level, pool, onBack, onStart, starting }) {
  const [phase, setPhase] = useState(1);
  const [team1, setTeam1] = useState([]);
  const [pack1, setPack1] = useState(null);
  const [team2, setTeam2] = useState([]);
  const [pack2, setPack2] = useState(null);
  const [p2name, setP2name] = useState('');
  const [error, setError] = useState('');

  const budget = useMemo(() => heroBudget(pool, level), [pool, level]);
  const cards = pool.filter(c => level.epics || !isEpic(c));
  const p1Team = level.pack ? (pack1 || []) : team1;
  const p2Team = level.pack ? (pack2 || []) : team2;
  const p1Total = valueOf(p1Team);
  const p2Total = valueOf(p2Team);
  const p1Ids = new Set(p1Team.map(c => c.card_id || c.id || c.number));
  const pool2 = pool.filter(c => !p1Ids.has(c.card_id || c.id || c.number));
  const cards2 = pool2.filter(c => level.epics || !isEpic(c));
  const equipCoins = equipCoinsForLevel(level.id);

  function toggleP1(card) { setError(''); setTeam1(prev => prev.some(c => c.id === card.id) ? prev.filter(c => c.id !== card.id) : [...prev, card]); }
  function toggleP2(card) { setError(''); setTeam2(prev => prev.some(c => c.id === card.id) ? prev.filter(c => c.id !== card.id) : [...prev, card]); }
  function openPackP1() { try { setError(''); setPack1(drawPack(pool, level)); } catch (e) { setError(e.message); } }
  function openPackP2() { try { setError(''); setPack2(drawPack(pool2, level)); } catch (e) { setError(e.message); } }
  function start() {
    if (p1Team.length !== 3 || p2Team.length !== 3) { setError('Cada jugador necesita 3 héroes.'); return; }
    onStart(p1Team, p2Team, { mode: 'local', p2name: p2name.trim() || 'Jugador 2' });
  }

  if (pool.length < 6) return <section className="space-y-6">
    <button className="mission-link" onClick={onBack}><ArrowLeft size={16} /> Niveles</button>
    <p role="alert">El modo 2 jugadores necesita al menos 6 héroes disponibles para esta misión.</p>
  </section>;

  return <section className="space-y-6">
    <button className="mission-link" onClick={onBack} disabled={starting}><ArrowLeft size={16} /> Niveles</button>
    <div><p className="mission-eyebrow">{mission.name} · NIVEL {level.id} · 2 JUGADORES</p><h2 className="font-heading text-3xl">{level.name}</h2><p className="mt-2 opacity-80">{level.description}</p></div>
    <div className="mission-budget"><span>Equipamiento: {equipCoins} monedas por jugador</span><strong>Presupuesto héroes: {budget} monedas por jugador</strong></div>
    <div className="mission-phase-bar">
      <div className={'mission-phase' + (phase === 1 ? ' active' : '')}><Users size={16} /><span><strong>Jugador 1</strong> · {p1Team.length}/3</span></div>
      <div className={'mission-phase' + (phase === 2 ? ' active' : '')}><Users size={16} /><span><strong>Jugador 2</strong> · {p2Team.length}/3</span></div>
    </div>
    {phase === 1 && <>
      <h3 className="font-heading text-xl">Jugador 1 — Elige tu ejército</h3>
      {level.pack && !pack1 ? <div className="mission-pack"><Package size={62} /><h3 className="font-heading text-2xl">El destino está en tus manos</h3><p>Tres héroes de {mission.name}, sin repetidos.{level.id === 5 ? ' Una épica garantizada.' : ' Hasta una épica.'}</p><button className="mission-button primary" onClick={openPackP1}>Abrir sobre</button></div>
        : <div className="mission-heroes">{(level.pack ? p1Team : cards).map(card => <MissionHero key={card.id} card={card} selected={p1Team.some(c => c.id === card.id)} disabled={!p1Team.some(c => c.id === card.id) && (p1Team.length === 3 || p1Total + Number(card.cost) > budget)} onSelect={level.pack ? undefined : () => toggleP1(card)} />)}</div>}
      {p1Team.length === 3 && <button className="mission-button primary" onClick={() => setPhase(2)}>Confirmar ejército del Jugador 1</button>}
    </>}
    {phase === 2 && <>
      <h3 className="font-heading text-xl">Jugador 2 — Elige tu ejército</h3>
      <input className="mission-input" placeholder="Nombre del Jugador 2 (opcional)" value={p2name} onChange={e => setP2name(e.target.value)} maxLength={20} />
      {level.pack && !pack2 ? <div className="mission-pack"><Package size={62} /><h3 className="font-heading text-2xl">Tu sobre, Jugador 2</h3><p>Tres héroes distintos a los del Jugador 1.{level.id === 5 ? ' Una épica garantizada.' : ' Hasta una épica.'}</p><button className="mission-button primary" onClick={openPackP2}>Abrir sobre</button></div>
        : <div className="mission-heroes">{(level.pack ? p2Team : cards2).map(card => <MissionHero key={card.id} card={card} selected={p2Team.some(c => c.id === card.id)} disabled={!p2Team.some(c => c.id === card.id) && (p2Team.length === 3 || p2Total + Number(card.cost) > budget)} onSelect={level.pack ? undefined : () => toggleP2(card)} />)}</div>}
      {p2Team.length === 3 && <button className="mission-button primary" disabled={starting} onClick={start}><Swords size={18} />{starting ? 'Preparando…' : 'Ir a equipamiento'}</button>}
      <button className="mission-link" onClick={() => setPhase(1)} disabled={starting}><ArrowLeft size={16} /> Volver al Jugador 1</button>
    </>}
    {error && <p role="alert">{error}</p>}
  </section>;
}