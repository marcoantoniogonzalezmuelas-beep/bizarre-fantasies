import React from 'react';
import { UserRound, Swords } from 'lucide-react';
export default function MissionRoomSeats({ nick, opponent, ready, opponentReady }) {
  return <div className="mission-budget" aria-label="Jugadores de la sala">
    <div className="flex min-w-0 flex-1 items-center gap-3"><UserRound size={32} /><div><strong className="break-all">{nick}</strong><p className="text-sm">{ready ? 'Ejército listo' : 'En la sala'}</p></div></div>
    <Swords className="self-center" size={28} />
    <div className="flex min-w-0 flex-1 items-center justify-end gap-3"><div className="text-right"><strong className="break-all">{opponent || 'Plaza disponible'}</strong><p className="text-sm">{opponentReady ? 'Ejército listo' : opponent ? 'Preparando ejército' : 'Esperando rival'}</p></div><UserRound size={32} /></div>
  </div>;
}