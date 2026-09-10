import React from 'react';

const STATUS_COLOR = {
  waiting: '#ffd24a',
  playing: '#66ffaa',
  finished: '#9a8fb5',
  resuming: '#7ab8ff',
};

const STATUS_LABEL = {
  waiting: 'En espera',
  playing: 'En partida',
  finished: 'Terminada',
  resuming: 'Reanudando',
};

export default function RoomRow({ room, now }) {
  const updated = Date.parse(room.updated_date || room.created_date || 0);
  const created = Date.parse(room.created_date || 0);
  const ageSec = Math.round((now - updated) / 1000);
  const ageMin = Math.floor(ageSec / 60);
  const leftAt = room.left_at || room.state?.left_at;
  const leftAgo = leftAt ? Math.round((now - leftAt) / 1000) : null;
  const stale = room.status === 'playing' && ageSec > 120;
  const leftExpired = leftAt && (now - leftAt > 300000);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#ffffff0a] bg-black/20 px-3 py-2 text-xs">
      <span className="rounded px-2 py-0.5 font-black" style={{ background: (STATUS_COLOR[room.status] || '#9a8fb5') + '22', color: STATUS_COLOR[room.status] || '#9a8fb5' }}>
        {STATUS_LABEL[room.status] || room.status}
      </span>
      <span className="font-mono font-black text-[#fff5dc]">{room.room_code}</span>
      <span className="text-[#cfc6dd]">Anfitrión: <b className="text-[#fff5dc]">{room.host_name || '—'}</b></span>
      <span className="text-[#cfc6dd]">Invitado: <b className="text-[#fff5dc]">{room.guest_name || '—'}</b></span>
      <span className="text-[#9a8fb5]">Actualizado hace {ageMin > 0 ? ageMin + ' min' : ageSec + ' s'}</span>
      {leftAgo != null && <span className={leftExpired ? 'font-black text-[#ff6b6b]' : 'text-[#ffd24a]'}>Salió hace {Math.floor(leftAgo / 60)} min{leftExpired ? ' (caducado)' : ''}</span>}
      {stale && <span className="font-black text-[#ff6b6b]">⚠ Sin latido {ageMin} min</span>}
    </div>
  );
}