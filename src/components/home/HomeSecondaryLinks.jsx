import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenText, Dna } from 'lucide-react';
import { t } from '@/lib/i18n';

export default function HomeSecondaryLinks({ style }) {
  const items = [
    { to: '/reglas', label: t('Reglas'), Icon: BookOpenText },
    { to: '/races', label: t('Razas'), Icon: Dna },
  ];

  return (
    <div className="absolute z-20 flex gap-2 pointer-events-auto" style={style}>
      {items.map(({ to, label, Icon }) => (
        <Link key={to} to={to} aria-label={label} title={label} className="group flex h-11 w-11 items-center justify-center rounded-full border border-[#c06bff]/60 bg-[#120a1e]/95 shadow-[0_0_16px_rgba(192,91,255,0.35)] backdrop-blur-sm transition-transform hover:scale-110">
          <Icon size={21} className="text-[#e2b0ff]" />
        </Link>
      ))}
    </div>
  );
}