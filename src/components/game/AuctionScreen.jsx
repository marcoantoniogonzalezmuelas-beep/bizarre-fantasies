import React, { useState } from 'react';
import { Coins, Gavel, Trophy, ArrowRight } from 'lucide-react';
import AuctionHeroCard from '@/components/game/AuctionHeroCard';
import { useGame } from '@/lib/game/GameContext';
import { currentAuctionType, auctionTypeLabel } from '@/lib/game/engine';
import { CLAN_COLORS } from '@/lib/cardData';

// Pantalla de la fase de Subasta: 3 fases (CC/AD/HE), pujas selladas vs IA.
export default function AuctionScreen() {
  const { game, submitBid, nextAuctionRound } = useGame();
  const [selected, setSelected] = useState(null);
  const [bid, setBid] = useState('');
  const [result, setResult] = useState(null);

  if (!game) return null;
  const st = game.auction;
  const type = currentAuctionType(game);
  const coins = st.roundCoins?.p ?? st.playerCoinsBase;
  const playerFull = game.team.p.length >= 3;
  const bidsDone = st.bidsDone;

  const handleSelect = (hero) => {
    setSelected(hero);
    setBid(String(hero.cost));
  };

  const handleBid = () => {
    const r = submitBid(selected ? { heroId: selected.id, amount: Number(bid) } : null);
    setResult(r);
  };

  const handlePass = () => {
    const r = submitBid(null);
    setResult(r);
  };

  const handleNext = () => {
    setSelected(null);
    setBid('');
    setResult(null);
    nextAuctionRound();
  };

  const renderResult = () => {
    if (!result) return null;
    const lines = [];
    const describe = (r, who) => {
      if (!r) return;
      if (r.hero) lines.push(`${who} consiguió a ${r.hero.name} por ${r.amount} monedas.`);
      else if (r.passed) lines.push(`${who} pasó.`);
    };
    if (result.multi) {
      describe(result.player ? { ...result.player, hero: st.cands.find(h => h.id === result.player.heroId), amount: result.player.amount } : null, 'Tú');
      describe(result.ai ? { ...result.ai, hero: st.cands.find(h => h.id === result.ai.heroId), amount: result.ai.amount } : null, 'Rival');
    } else if (result.hero) {
      lines.push(`${result.side === 'p' ? 'Tú' : 'El rival'} ganó la puja por ${result.hero.name} (${result.amount} monedas).`);
    } else {
      lines.push('Nadie se llevó una carta esta ronda.');
    }
    return (
      <div className="bg-[#15101f] border border-[#FFD24A55] rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2 text-[#FFD24A] font-heading font-black"><Trophy size={18} /> Resultado de la puja</div>
        {lines.map((l, i) => <div key={i} className="text-sm text-[#efe9dc]">{l}</div>)}
      </div>
    );
  };

  return (
    <div className="min-h-screen px-4 py-5" style={{ background: 'linear-gradient(180deg,#0d0a14,#0a0810)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Cabecera de fase */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 font-heading font-black text-xl text-[#FFD24A]">
            <Gavel size={22} /> Subasta — {auctionTypeLabel(type)}
          </div>
          <div className="ml-auto flex items-center gap-2 bg-[#1a1430] border border-[#3c3158] rounded-full px-4 py-1.5">
            <Coins size={16} className="text-[#FFD24A]" />
            <span className="font-black text-[#FFD24A]">{coins}</span>
            <span className="text-xs text-[#a89fbb]">disponibles</span>
          </div>
        </div>

        {/* Equipos */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {['p', 'o'].map((side) => (
            <div key={side} className="bg-[#15101f] border border-[#3c3158] rounded-xl p-3">
              <div className="text-xs font-bold text-[#a89fbb] mb-2">{side === 'p' ? 'TU EQUIPO' : 'RIVAL'} ({game.team[side].length}/3)</div>
              <div className="flex gap-1.5">
                {game.team[side].map((h) => (
                  <div key={h.id} className="flex-1 text-center rounded-lg py-1.5 px-1 border" style={{ borderColor: (CLAN_COLORS[h.clan] || '#3c3158') + '88', background: '#1a1430' }}>
                    <div className="text-[10px] font-black text-white truncate">{h.name}</div>
                    <div className="text-[9px] text-[#a89fbb]">{h.type}</div>
                  </div>
                ))}
                {Array.from({ length: 3 - game.team[side].length }).map((_, i) => (
                  <div key={i} className="flex-1 rounded-lg py-1.5 border border-dashed border-[#3c3158] text-center text-[10px] text-[#564b6e]">—</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bonificador de la ronda */}
        {st.bonus && (
          <div className="bg-gradient-to-r from-[#1f1638] to-[#15101f] border border-[#b06cff55] rounded-xl p-3 mb-4">
            <span className="text-xs font-black text-[#c79bff]">BONIFICADOR · </span>
            <span className="text-sm font-bold text-[#e2b0ff]">{st.bonus.name}</span>
            <span className="text-sm text-[#cbbfe0]"> — {st.bonus.txt}</span>
          </div>
        )}

        {renderResult()}

        {/* Candidatos */}
        {!bidsDone && !playerFull && (
          <>
            <div className="text-sm text-[#a89fbb] mb-3">Elige UN héroe y haz tu puja sellada. El rival puja a ciegas.</div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
              {st.cands.map((h) => (
                <AuctionHeroCard key={h.id} hero={h} selected={selected?.id === h.id} onSelect={handleSelect} />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 sticky bottom-4 bg-[#15101f] border border-[#3c3158] rounded-2xl p-3">
              {selected ? (
                <>
                  <div className="text-sm text-[#efe9dc]">Pujar por <b className="text-white">{selected.name}</b> (mín. {selected.cost})</div>
                  <input type="number" min={selected.cost} max={coins} value={bid} onChange={(e) => setBid(e.target.value)} className="w-24 px-3 py-2 bg-[#0e0a16] border border-[#3c3158] rounded-lg text-[#FFD24A] font-black focus:outline-none focus:border-[#FFD24A]" />
                  <button onClick={handleBid} className="px-6 py-2.5 rounded-xl font-heading font-black text-[#2a1d05]" style={{ background: 'linear-gradient(180deg,#ffe49a,#FFD24A 55%,#d8a431)' }}>Pujar</button>
                </>
              ) : (
                <div className="text-sm text-[#a89fbb]">Selecciona un héroe para pujar...</div>
              )}
              <button onClick={handlePass} className="ml-auto px-5 py-2.5 rounded-xl font-bold text-[#a89fbb] border border-[#3c3158] hover:text-white">Pasar ronda</button>
            </div>
          </>
        )}

        {/* Avanzar */}
        {(bidsDone || playerFull) && (
          <button onClick={handleNext} className="w-full flex items-center justify-center gap-2 mt-4 px-6 py-4 rounded-2xl font-heading font-black text-lg text-[#2a1d05]" style={{ background: 'linear-gradient(180deg,#ffe49a,#FFD24A 55%,#d8a431)' }}>
            {playerFull && game.team.o.length >= 3 ? 'Ir a Equipamiento' : 'Siguiente ronda'} <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}