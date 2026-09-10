import React from 'react';

export default function VisitorRow({ visitor, now }) {
  const hb = visitor.last_heartbeat || 0;
  const ago = Math.round((now - hb) / 1000);
  const alive = ago < 40;
  const stale = ago >= 40 && ago < 120;
  const dead = ago >= 120;
  const color = alive ? '#66ffaa' : stale ? '#ffd24a' : '#ff6b6b';
  const label = alive ? 'Conectado' : stale ? 'Lentitud' : 'Desconectado';

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#ffffff0a] bg-black/20 px-3 py-2 text-xs">
      <span className="rounded px-2 py-0.5 font-black" style={{ background: color + '22', color }}>{label}</span>
      <span className="font-black text-[#fff5dc]">{visitor.nick}</span>
      {visitor.match_code && <span className="text-[#7ab8ff]">Sala: {visitor.match_code}</span>}
      {visitor.match_role && <span className="text-[#9a8fb5]">Rol: {visitor.match_role}</span>}
      <span className="text-[#9a8fb5]">Latido hace {ago} s</span>
      {visitor.total_wins > 0 && <span className="text-[#ffd24a]">{visitor.total_wins} victorias</span>}
    </div>
  );
}