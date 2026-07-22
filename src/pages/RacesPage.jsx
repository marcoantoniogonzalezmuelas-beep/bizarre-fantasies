import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RaceCard from '@/components/cards/RaceCard';
import { RACES } from '@/lib/cardData';
import { t } from '@/lib/i18n';

export default function RacesPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0d0a14, #0a0810)' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="text-[#a89fbb] hover:text-[#FFD24A] transition-colors"><ArrowLeft size={20} /></Link>
          <h1 className="font-heading font-extrabold text-2xl text-[#FFD24A] tracking-wider">{t('RAZAS')}</h1>
          <span className="text-xs text-[#a89fbb]">{t('9 razas · potenciadores aplicados en batalla')}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RACES.map(r => <RaceCard key={r.name} race={r} />)}
        </div>
      </div>
    </div>
  );
}