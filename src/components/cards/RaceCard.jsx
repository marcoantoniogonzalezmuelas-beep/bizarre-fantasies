import React from 'react';
import ClanSigil from '@/components/cards/ClanSigil';
import { getLang, t } from '@/lib/i18n';
import { RACES_EN } from '@/lib/racesEn';

export default function RaceCard({ race }) {
  const isEn = getLang() === 'en';
  const en = isEn ? RACES_EN[race.name] : null;
  const trait = en?.trait || race.trait;
  const desc = en?.desc || race.desc;
  const stats = (en && en.stats) || race.stats;
  const displayName = isEn ? t(race.name) : race.name;
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#0e0b16', border: `2px solid ${race.color}` }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ background: `${race.color}22`, borderBottom: `1px solid ${race.color}44` }}>
        <div className="flex items-center gap-3">
          <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: 44, height: 44, background: `${race.color}22`, border: `2px solid ${race.color}`, boxShadow: `0 0 12px ${race.color}55` }}>
            <ClanSigil clan={race.name} size={26} />
          </div>
          <h3 className="font-heading font-extrabold text-lg" style={{ color: race.color }}>{displayName}</h3>
        </div>
        <span className="text-xs font-bold text-[#efe9dc] bg-[#15101f] px-2 py-1 rounded-lg" style={{ border: `1px solid ${race.color}66` }}>
          {isEn ? 'ELITE' : 'ÉLITE'} {race.elite}
        </span>
      </div>
      <div className="px-4 py-3">
        <div className="text-sm font-semibold text-[#ffcf57] mb-1">{trait}</div>
        <p className="text-sm text-[#ded6ea] leading-relaxed mb-2">{desc}</p>
        <div className="text-xs text-[#a89fbb] bg-[#221a36] rounded-lg px-3 py-2 font-mono">{stats}</div>
      </div>
    </div>
  );
}