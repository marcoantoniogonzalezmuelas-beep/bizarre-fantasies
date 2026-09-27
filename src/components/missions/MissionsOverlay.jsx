import React, { useEffect, useMemo, useRef, useState } from 'react';
import useMissionPinch from '@/components/missions/useMissionPinch';
import { X, ScrollText, LoaderCircle } from 'lucide-react';
import useMissionSession from '@/components/missions/useMissionSession';
import MissionLevels from '@/components/missions/MissionLevels';
import MissionPreparation from '@/components/missions/MissionPreparation';
import MissionVictoryCelebration from '@/components/missions/MissionVictoryCelebration';
import MissionMpLobby from '@/components/missions/MissionMpLobby';
import { MISSIONS, missionPool } from '@/components/missions/missionRules';
import '@/components/missions/missions.css';
const MISSION_BACKGROUND = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/38d52015c_generated_720c056f.png';
export default function MissionsOverlay({ iframeRef }) {
  const s = useMissionSession(iframeRef), [missionId, setMissionId] = useState('club'), [level, setLevel] = useState(null), [mpMode, setMpMode] = useState(false);
  const mission = MISSIONS.find(m => m.id === missionId), pool = useMemo(() => missionPool(s.cards, missionId), [s.cards, missionId]);
  const shellRef = useRef(null);
  useMissionPinch(shellRef, Boolean(s.session && !s.celebration));
  useEffect(() => { const image = new Image(); image.src = MISSION_BACKGROUND; }, []);
  useEffect(() => { if (s.session) setLevel(null); }, [s.session]);
  if (s.celebration) return <MissionVictoryCelebration reward={s.celebration} onClose={s.dismissCelebration} />;
  if (!s.session) return null;
  return <div className="bf-missions" role="dialog" aria-modal="true" aria-labelledby="mission-title">
    <img className="mission-background" src={MISSION_BACKGROUND} alt="" aria-hidden="true" />
    <div className="mission-shell" ref={shellRef}><header className="mission-header"><div className="flex items-center gap-3"><ScrollText size={28} /><div><p className="mission-eyebrow">PARTIDAS INDIVIDUALES</p><h1 id="mission-title" className="font-heading text-3xl md:text-4xl">Misiones</h1></div></div><button className="mission-button" aria-label="Cerrar misiones" onClick={s.close} disabled={s.starting}><X size={20} /></button></header>
      <p className="mission-intro">Antes de la campaña, demuestra de qué está hecho tu ejército.</p>
      <div className="mission-rules"><span>3 héroes por ejército</span><span>Sin subastas</span><span>100 monedas de equipo por partida</span><span>Progreso de {s.session.nick}</span></div>
      {s.notice && <p className="mission-notice" role="status">{s.notice}</p>}
      {s.error && <div className="mission-notice" role="alert">{s.error}{s.hasPending && <button className="mission-button mt-2" onClick={s.persist}>Reintentar guardado</button>}</div>}
      {s.loading ? <div className="mission-pack"><LoaderCircle className="animate-spin" /><p>Cargando héroes y progreso…</p></div> : <>
        <div className="mission-mode-toggle" role="tablist" aria-label="Modo de misión"><button className={mpMode ? '' : 'active'} role="tab" aria-selected={!mpMode} onClick={() => setMpMode(false)}>Individual</button><button className={mpMode ? 'active' : ''} role="tab" aria-selected={mpMode} onClick={() => setMpMode(true)}>Multijugador</button></div>
        {mpMode ? <MissionMpLobby cards={s.cards} nick={s.session.nick} starting={s.starting} onBack={() => setMpMode(false)} onStart={s.startMp} /> : <>
        {!level && <nav className="mission-tabs" aria-label="Elegir misión">{MISSIONS.map(m => <button key={m.id} className={m.id === missionId ? 'active' : ''} aria-pressed={m.id === missionId} onClick={() => setMissionId(m.id)}><span className="font-heading text-xl">Misión {m.name}</span><span className="text-sm opacity-75">{m.description}</span></button>)}</nav>}
        {pool.length < 3 ? <p role="alert">Esta misión necesita al menos tres héroes etiquetados y disponibles en el juego.</p> : level ? <MissionPreparation key={`${missionId}-${level.id}`} mission={mission} level={level} pool={pool} onBack={() => setLevel(null)} starting={s.starting} onStart={(player, rival) => s.start(mission, level, player, rival)} /> : <MissionLevels mission={mission} pool={pool} victories={s.victories} onChoose={setLevel} />}
        </>}
      </>}
    </div>
  </div>;
}