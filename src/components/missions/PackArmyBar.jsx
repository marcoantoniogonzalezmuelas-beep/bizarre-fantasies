import React from 'react';
import { isEpic, epicCount } from '@/components/missions/missionRules';

export default function PackArmyBar({ selected, level, onRemove, extra, action }) {
  const epics = epicCount(selected);
  const epicRule = level.exactEpics
    ? `Exactamente ${level.exactEpics} héroe(s) épico(s)`
    : level.epics ? `Máximo ${level.epics} héroe(s) épico(s)` : 'No se permiten héroes épicos';
  const epicLimit = level.exactEpics || level.epics || 0;
  return <div className="pack-army">
    <ul className="pack-army-rules">
      <li>Elige <b>3 héroes</b> ({selected.length}/3)</li>
      {extra && <li>{extra}</li>}
      <li>{epicRule} <b>({epics}/{epicLimit})</b></li>
      <li>Toca un héroe elegido abajo para quitarlo</li>
    </ul>
    <div className="pack-army-slots">
      {[0, 1, 2].map(i => {
        const c = selected[i];
        return c
          ? <button key={i} className="pack-army-slot filled" onClick={() => onRemove(c)} title="Quitar">
              {c.art_url && <img src={c.art_url} alt="" />}
              <span>{c.name}{isEpic(c) ? ' ★' : ''}</span>
            </button>
          : <div key={i} className="pack-army-slot"><span>Hueco {i + 1}</span></div>;
      })}
    </div>
    {action}
  </div>;
}