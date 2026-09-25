import React, { useState } from 'react';
import { LockKeyhole, Users } from 'lucide-react';
import { MP_MISSIONS, MP_MODALITIES } from '@/components/missions/missionRules';
export default function MissionRoomCard({ room, onJoin, busy, own, occupied }) {
  const [password, setPassword] = useState(''), [unlock, setUnlock] = useState(false);
  return <article className="mission-budget" data-room-code={room.code}>
    <div className="min-w-0 space-y-2"><h4 className="font-heading text-lg break-words">Sala de {room.host_nick}</h4>
      <p>{MP_MISSIONS.find(m => m.id === room.mission)?.name || room.mission} · {MP_MODALITIES.find(m => m.id === room.modality)?.name || room.modality}</p>
      <p className="flex flex-wrap items-center gap-2 text-sm opacity-80"><Users size={16} /> 1/2 jugadores · {room.is_private ? <><LockKeyhole size={16} /> Privada con contraseña</> : 'Pública'}{own && ' · Tu sala'}</p>
    </div>
    {!unlock ? <button className="mission-button primary self-center" disabled={busy || own || occupied} aria-label={`Entrar en sala de ${room.host_nick}`} onClick={() => room.is_private ? setUnlock(true) : onJoin(room.code, '')}>{own ? 'Esperando rival' : 'Entrar'}</button>
      : <form className="flex w-full flex-wrap gap-2" onSubmit={e => { e.preventDefault(); onJoin(room.code, password); }}>
        <label className="min-w-0 flex-1">Contraseña de la sala<input className="mission-input mt-1" type="password" autoComplete="off" value={password} onChange={e => setPassword(e.target.value)} maxLength={64} required /></label>
        <button className="mission-button primary self-end" disabled={busy}>Entrar en sala privada</button><button type="button" className="mission-link self-end" onClick={() => { setUnlock(false); setPassword(''); }}>Cancelar</button>
      </form>}
  </article>;
}