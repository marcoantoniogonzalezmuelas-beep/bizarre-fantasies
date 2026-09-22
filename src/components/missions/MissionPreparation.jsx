import React, { useMemo, useState } from 'react';
import { ArrowLeft, Package, Swords } from 'lucide-react';
import MissionHero from '@/components/missions/MissionHero';
import PackOpening from '@/components/missions/PackOpening';
import { heroBudget, isEpic, drawPacks, chooseRival, valueOf, equipCoinsForLevel } from '@/components/missions/missionRules';
export default function MissionPreparation({ mission, level, pool, onBack, onStart, starting }) {
  const [chosen, setChosen] = useState([]), [packs, setPacks] = useState(null), [packTeam, setPackTeam] = useState(null), [error, setError] = useState('');
  const budget = useMemo(() => heroBudget(pool, level), [pool, level]);
  const cards = pool.filter(c => level.epics || !isEpic(c)), team = level.pack ? (packTeam || []) : chosen;
  const total = valueOf(team);
  const [rival, setRival] = useState(null);
  function toggle(card) { setRival(null); setChosen(prev => prev.some(c => c.id === card.id) ? prev.filter(c => c.id !== card.id) : [...prev, card]); }
  function initPacks() { try { setPacks(drawPacks(pool, level)); } catch (e) { setError(e.message); } }
  function handlePackTeam(selectedTeam) { setPackTeam(selectedTeam); try { setRival(chooseRival(pool, selectedTeam, level)); } catch (e) { setError(e.message); } }
  function prepare() { try { setRival(chooseRival(pool, team, level)); } catch (e) { setError(e.message); } }
  return <section className="space-y-6">
    <button className="mission-link" onClick={onBack} disabled={starting}><ArrowLeft size={16} /> Niveles</button>
    <div><p className="mission-eyebrow">{mission.name} · NIVEL {level.id}</p><h2 className="font-heading text-3xl">{level.name}</h2><p className="mt-2 opacity-80">{level.description}</p></div>
    <div className="mission-budget"><span>{level.pack ? 'Tres sobres de 4 héroes · sin compra' : `Héroes: ${total} / ${budget} monedas · ${team.length}/3 elegidos`}</span><strong>Equipamiento: {equipCoinsForLevel(level.id)} monedas</strong></div>
    {level.pack ? (
      !packs ? <div className="mission-pack"><Package size={62} /><h3 className="font-heading text-2xl">El destino está en tus manos</h3><p>Tres sobres de 4 héroes del {mission.name}. Rasga los bordes para abrirlos y elige tu ejército de 3.{level.id === 5 ? ' Una épica garantizada.' : ' Hasta una épica.'}</p><button className="mission-button primary" onClick={initPacks}>Empezar a abrir sobres</button></div>
      : !packTeam ? <PackOpening packs={packs} mission={mission} level={level} onTeamSelected={handlePackTeam} />
      : <div className="mission-rival space-y-4"><h3 className="font-heading text-xl">Tu ejército · {total} monedas</h3><div className="mission-heroes">{packTeam.map(card => <MissionHero key={card.id} card={card} />)}</div>{rival && <><h3 className="font-heading text-xl">Tu rival · {valueOf(rival)} monedas en héroes</h3><p className="text-sm opacity-80">Ambos disponéis de {equipCoinsForLevel(level.id)} monedas de equipamiento.</p><div className="mission-heroes">{rival.map(card => <MissionHero key={card.id} card={card} />)}</div><button className="mission-button primary" disabled={starting} onClick={() => onStart(packTeam, rival)}><Swords size={18} />{starting ? 'Preparando…' : 'Ir a equipamiento'}</button></>}</div>
    ) : <>
      <div className="mission-heroes">{cards.map(card => <MissionHero key={card.id} card={card} selected={team.some(c => c.id === card.id)} disabled={!team.some(c => c.id === card.id) && (team.length === 3 || total + Number(card.cost) > budget)} onSelect={() => toggle(card)} />)}</div>
      {team.length === 3 && !rival && <button className="mission-button primary" onClick={prepare}>Confirmar ejército y ver rival</button>}
      {rival && <div className="mission-rival space-y-4"><h3 className="font-heading text-xl">Tu rival · {valueOf(rival)} monedas en héroes</h3><p className="text-sm opacity-80">Tu ejército: {total} monedas. Ambos disponéis de {equipCoinsForLevel(level.id)} monedas de equipamiento.</p><div className="mission-heroes">{rival.map(card => <MissionHero key={card.id} card={card} />)}</div><button className="mission-button primary" disabled={starting} onClick={() => onStart(team, rival)}><Swords size={18} />{starting ? 'Preparando…' : 'Ir a equipamiento'}</button></div>}
    </>}
    {error && <p role="alert">{error}</p>}
  </section>;
}