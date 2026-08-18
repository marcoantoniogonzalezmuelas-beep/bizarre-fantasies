import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '@/lib/i18n';

const ITEMS = [
  { to: '/reglas', label: 'Reglas', sub: 'Cómo jugar', icon: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/0848f4ffb_generated_image.png' },
  { to: '/races', label: 'Razas', sub: 'Clanes y linajes', icon: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/5e41f1add_generated_image.png' },
];

function Card({ to, label, sub, icon, narrow }) {
  return (
    <Link to={to} aria-label={t(label)} className="group flex items-center gap-1.5 sm:gap-2 no-underline max-w-[62vw]">
      <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full border-2 border-[#c06bff] shadow-[0_0_22px_rgba(192,91,255,0.55)] transition-transform group-hover:scale-110 shrink-0">
        <img src={icon} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="rounded-xl border border-[#c06bff]/60 bg-[#120a1e]/95 px-2 py-1 sm:px-2.5 sm:py-1.5 shadow-lg backdrop-blur-sm min-w-0">
        <div className="font-heading text-[11px] sm:text-[13px] font-black leading-none tracking-wide text-[#e2b0ff] truncate">{t(label)}</div>
        <div className="mt-0.5 text-[8px] sm:text-[9px] font-bold tracking-wider text-[#b06cff] truncate">{t(sub)}</div>
      </div>
    </Link>
  );
}

export default function HomeSecondaryLinks({ style }) {
  const [rules, races] = ITEMS;
  // Reglas se apila encima de Razas (mismo lado derecho), dejando los tres
  // botones (Reglas · Razas · Oráculo) escalonados en la esquina inferior.
  const rulesStyle = { bottom: (style?.bottom ?? 80) + 52, right: style?.right ?? 12 };
  return (
    <>
      <div className="bf-home-utility-link absolute z-20 pointer-events-auto" style={rulesStyle}>
        <Card {...rules} narrow />
      </div>
      <div className="bf-home-utility-link absolute z-20 pointer-events-auto" style={style}>
        <Card {...races} />
      </div>
    </>
  );
}