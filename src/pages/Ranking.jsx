import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import RankList from '@/components/ranking/RankList';
import { t } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';

const BG_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/e6f0b7316_generated_image.png';
const ICON_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/5f6dbe23d_generated_image.png';

function top(map, n = 10, extraMap) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, value]) => ({ name, value, extra: extraMap ? extraMap(name) : undefined }));
}

export default function Ranking() {
  const [results, setResults] = useState(null);

  useEffect(() => {
    base44.entities.MatchResult.list('-created_date', 500).then(setResults);
  }, []);

  // Tokens invocados en batalla (no son héroes): fuera de las listas de héroes.
  const SUMMON_TOKENS = ['Patito de Goma'];
  const wins = {}, losses = {}, heroWins = {}, heroLosses = {}, heroDeaths = {}, heroElites = {};
  (results || []).forEach(r => {
    if (!r.winner_is_ai) wins[r.winner_nick] = (wins[r.winner_nick] || 0) + 1;
    if (!r.loser_is_ai) losses[r.loser_nick] = (losses[r.loser_nick] || 0) + 1;
    (r.winner_heroes || []).forEach(h => {
      if (!h.name || SUMMON_TOKENS.includes(h.name)) return;
      heroWins[h.name] = (heroWins[h.name] || 0) + 1;
      if (h.died) heroDeaths[h.name] = (heroDeaths[h.name] || 0) + 1;
      if (h.elite) heroElites[h.name] = (heroElites[h.name] || 0) + 1;
    });
    (r.loser_heroes || []).forEach(h => {
      if (!h.name || SUMMON_TOKENS.includes(h.name)) return;
      heroLosses[h.name] = (heroLosses[h.name] || 0) + 1;
      if (h.died) heroDeaths[h.name] = (heroDeaths[h.name] || 0) + 1;
      if (h.elite) heroElites[h.name] = (heroElites[h.name] || 0) + 1;
    });
  });
  const playerExtra = (nick) => {
    const w = wins[nick] || 0, l = losses[nick] || 0;
    return `${w + l} ${t('partidas')} · ${Math.round((w / Math.max(1, w + l)) * 100)}% ${t('victorias')}`;
  };

  return (
    <div className="min-h-screen relative text-[#efe9dc]" style={{ background: '#0e0a16' }}>
      <LanguageSelector />
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BG_IMG})` }} />
      <div className="fixed inset-0 bg-gradient-to-b from-[#0e0a16]/80 via-[#0e0a16]/70 to-[#0e0a16]/95" />

      <div className="relative max-w-5xl mx-auto px-4 py-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-sm font-bold text-[#cfc6dd] border border-[#3c3158] rounded-xl px-4 py-2 bg-[#161028]/80 hover:bg-[#221a3d] transition-colors">{t('← Volver al juego')}</Link>
        </div>

        <div className="text-center mb-10">
          <img src={ICON_IMG} alt="Top Ranking" className="w-24 h-24 mx-auto rounded-full border-2 border-[#FFD24A] shadow-[0_0_30px_rgba(255,210,74,.5)] object-cover mb-4" />
          <h1 className="font-heading font-black text-4xl md:text-5xl text-[#FFD24A] drop-shadow-[0_2px_12px_rgba(255,210,74,.35)] tracking-wide">Top Ranking</h1>
          <p className="text-[#cfc6dd] mt-2 text-sm">{t('El salón de la fama de Bizarre Fantasies')} · {results ? results.length : '…'} {t('partidas registradas')}</p>
        </div>

        {!results ? (
          <div className="flex justify-center py-20">
            <div className="w-9 h-9 border-4 border-[#3c3158] border-t-[#FFD24A] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <RankList title={t('Mejores jugadores')} icon="👑" rows={top(wins, 10, playerExtra)} valueLabel={t('victorias')} accent="#FFD24A" empty={t('Nadie ha ganado todavía. ¡Sé el primero en entrar en la leyenda!')} />
            </div>
            <RankList title={t('Héroes más victoriosos')} icon="⚔️" rows={top(heroWins, 8)} valueLabel={t('batallas ganadas')} accent="#7ddf7d" />
            <RankList title={t('Héroes más derrotados')} icon="💀" rows={top(heroLosses, 8)} valueLabel={t('batallas perdidas')} accent="#ff7d7d" />
            <RankList title={t('Héroes más veces caídos')} icon="⚰️" rows={top(heroDeaths, 8)} valueLabel={t('caídas')} accent="#c06bff" />
            <RankList title={t('Renaceres Élite')} icon="🔥" rows={top(heroElites, 8)} valueLabel={t('renaceres')} accent="#ffa94a" empty={t('Ningún héroe ha renacido en su forma Élite aún.')} />
          </div>
        )}
      </div>
    </div>
  );
}