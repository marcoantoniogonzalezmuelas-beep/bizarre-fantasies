import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '@/lib/i18n';

const ITEMS = [
  { to: '/reglas', label: 'Reglas', sub: 'Cómo jugar', icon: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/0848f4ffb_generated_image.png' },
  { to: '/races', label: 'Razas', sub: 'Clanes y linajes', icon: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/5e41f1add_generated_image.png' },
];

function Card({ to, label, sub, icon, narrow }) {
  return (
    <Link to={to} aria-label={t(label)} className="group flex items-center gap-2 no-underline">
      <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[#c06bff] shadow-[0_0_22px_rgba(192,91,255,0.55)] transition-transform group-hover:scale-110">
        <img src={icon} alt="" className="h-full w-full object-cover" />
      </div>
      <div className={narrow ? 'min-w-[88px] rounded-xl border border-[#c06bff]/60 bg-[#120a1e]/95 px-2.5 py-1.5 shadow-lg backdrop-blur-sm' : 'min-w-[118px] rounded-xl border border-[#c06bff]/60 bg-[#120a1e]/95 px-3 py-1.5 shadow-lg backdrop-blur-sm'}>
        <div className="font-heading text-[13px] font-black leading-none tracking-wide text-[#e2b0ff]">{t(label)}</div>
        <div className="mt-0.5 text-[9px] font-bold tracking-wider text-[#b06cff]">{t(sub)}</div>
      </div>
    </Link>
  );
}

export default function HomeSecondaryLinks({ style }) {
  const [rules, races] = ITEMS;
  return (
    <>
      <div className="absolute z-20 pointer-events-auto" style={{ top: 16, left: 16 }}>
        <Card {...rules} narrow />
      </div>
      <div className="absolute z-20 pointer-events-auto" style={style}>
        <Card {...races} />
      </div>
    </>
  );
}