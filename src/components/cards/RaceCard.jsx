import React from 'react';
import ClanSigil from '@/components/cards/ClanSigil';

export default function RaceCard({ race }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#0e0b16', border: `2px solid ${race.color}` }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ background: `${race.color}22`, borderBottom: `1px solid ${race.color}44` }}>
        <div className="flex items-center gap-3">
          <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: 44, height: 44, background: 'radial-gradient(circle at 35% 25%,rgba(255,255,255,.18),rgba(0,0,0,.65) 80%)', border: `2px solid ${race.color}`, boxShadow: `0 0 12px ${race.color}55` }}>
            <ClanSigil clan={race.name} size={26} />
          </div>
          <h3 className="font-heading font-extrabold text-lg" style={{ color: race.color }}>{race.name}</h3>
        </div>
        <span className="text-xs font-bold text-[#efe9dc] bg-[#15101f] px-2 py-1 rounded-lg" style={{ border: `1px solid ${race.color}66` }}>
          ÉLITE {race.elite}
        </span>
      </div>
      <div className="px-4 py-3">
        <div className="text-sm font-semibold text-[#ffcf57] mb-1">{race.trait}</div>
        <p className="text-sm text-[#ded6ea] leading-relaxed mb-2">{race.desc}</p>
        <div className="text-xs text-[#a89fbb] bg-[#221a36] rounded-lg px-3 py-2 font-mono">{race.stats}</div>
      </div>
    </div>
  );
}