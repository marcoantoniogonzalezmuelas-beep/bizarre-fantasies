import React from 'react';
import { Lock, CheckCircle, ChevronRight, Package, Shield } from 'lucide-react';
import { LEVELS, heroBudget, unlocked, winsFor } from '@/components/missions/missionRules';
export default function MissionLevels({ mission, pool, victories, onChoose }) {
  const complete = LEVELS.every(l => winsFor(victories, mission.id, l.id) >= l.wins);
  return <section className="space-y-5">
    <div className="mission-section-heading"><div><p className="mission-eyebrow">MISIÓN {mission.name}</p><h2 className="font-heading text-2xl">{complete ? 'Misión completada' : 'Tu camino hacia la campaña'}</h2></div><Shield className="text-mission-accent" size={32} /></div>
    <div className="mission-levels">{LEVELS.map(level => {
      const open = unlocked(victories, mission.id, level), count = winsFor(victories, mission.id, level.id), done = count >= level.wins;
      const budget = heroBudget(pool, level);
      return <button key={level.id} className="mission-level" disabled={!open || pool.length < 3} onClick={() => onChoose(level)} aria-label={`Nivel ${level.id} · ${level.name}`}>
        <span className="mission-level-number">{done ? <CheckCircle /> : !open ? <Lock size={18} /> : String(level.id).padStart(2, '0')}</span>
        <div className="flex-1 min-w-0"><h3 className="font-heading text-lg">{level.name}</h3><p className="text-sm opacity-80 mt-1">{level.description}</p>
          <div className="mission-level-meta"><span>{level.pack ? <><Package size={14} /> Sobre · sin presupuesto de héroes</> : `${budget} monedas para héroes`}</span><span>Equipo: 100 monedas</span><span>{Math.min(count, level.wins)}/{level.wins} victorias</span></div>
          {!open && <p className="text-xs mt-2">Completa el nivel anterior para desbloquearlo.</p>}
          {budget > level.budget && <p className="text-xs mt-2">Ajustado al coste mínimo de tres héroes de esta misión.</p>}
        </div><ChevronRight size={18} className="shrink-0" />
      </button>;
    })}</div>
    <p className="text-sm opacity-70">Victorias acumuladas: perder no borra tu avance. Los niveles completados se pueden volver a jugar.</p>
  </section>;
}