import React, { useState } from 'react';
import { Package, LoaderCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PackOpening from '@/components/missions/PackOpening';

export default function MissionMpPacks({ cards, mission, code, token, onTeamSelected }) {
  const [packs, setPacks] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function open() {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const { data } = await base44.functions.invoke('missionMp', { action: 'mp_open_packs', code, token });
      if (!data.ok) throw new Error(data.error);
      const dealt = data.packs.map(pack => pack.map(id => cards.find(c => c.card_id === id && c.engineId)));
      if (dealt.flat().some(c => !c)) throw new Error('Una carta del reparto no está disponible. Vuelve a abrir las misiones para actualizar el catálogo.');
      setPacks(dealt);
    } catch (e) { setError(e.response?.data?.error || e.message || 'No se pudieron abrir los sobres.'); }
    finally { setBusy(false); }
  }
  if (packs) return <PackOpening packs={packs} mission={mission} level={{ epics: 3 }} onTeamSelected={onTeamSelected} />;
  return <div className="mission-pack"><Package size={62} /><h3 className="font-heading text-2xl">{mission.id === 'l5r' ? 'Un sobre de 4 héroes' : 'Tres sobres de 4 héroes'}</h3>
    <p>Elige 3 para tu ejército. Reparto aleatorio, sin héroes repetidos entre jugadores ni entre sobres y sin límite de épicas.{(mission.id === 'club' || mission.id === 'todos') && ' Incluye todas las épicas del juego.'}</p>
    <button className="mission-button primary" onClick={open} disabled={busy}>{busy && <LoaderCircle className="animate-spin" size={18} />}{busy ? 'Abriendo…' : 'Abrir mis sobres'}</button>
    {error && <p role="alert">{error}</p>}
  </div>;
}