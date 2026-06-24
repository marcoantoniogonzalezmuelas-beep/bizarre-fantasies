import React, { useState } from 'react';
import { Coins, Gavel, Trophy, ArrowRight, Star } from 'lucide-react';
import AuctionHeroCard from '@/components/game/AuctionHeroCard';
import { useGame } from '@/lib/game/GameContext';
import { currentAuctionType, auctionTypeLabel, typeIcon } from '@/lib/game/engine';
import { CLAN_COLORS } from '@/lib/cardData';

// Pantalla de la fase de Subasta — réplica exacta del juego original.
export default function AuctionScreen() {
  const { game, decide, advance } = useGame();
  const [selected, setSelected] = useState(null);
  const [bid, setBid] = useState('');

  if (!game) return null;
  const a = game.auction;
  const type = currentAuctionType(game);
  const result = a.phaseResult;
  const needsHero = a.phaseNeeds.p;

  const handleSelect = (hero) => {
    setSelected(hero);
    setBid(String(Math.min(hero.cost, game.coins.p)));
  };

  const handleBid = () => {
    if (!selected) return;
    decide({ heroId: selected.id, amount: Number(bid) });
    setSelected(null);
    setBid('');
  };

  const handlePass = () => {
    decide(null);
    setSelected(null);
    setBid('');
  };

  const handleNext = () => advance();

  // Panel de resultado idéntico en información al original.
  const ResultPanel = () => {
    const Line = ({ side }) => {
      const isYou = side === 'p';
      const pass = isYou ? result.pPass : result.oPass;
      const name = isYou ? result.bpName : result.boName;
      const amt = isYou ? result.bpAmt : result.boAmt;
      const got = isYou ? result.gotP : result.gotO;
      const isWin = result.contested && result.winner === side;
      return (
        <div className={`rounded-xl p-3 border ${isYou ? 'border-[#FFD24A55] bg-[#FFD24A0d]' : 'border-[#3c3158] bg-[#15101f]'}`}>
          <div className="font-black text-sm text-white">{game.names[side]}{isYou ? ' · TÚ' : ''}</div>
          <div className="text-sm text-[#cbbfe0] mt-1">
            {pass ? <i>conserva su héroe y pasa</i> : <>pujó <b className="text-[#FFD24A]">{amt}</b> 🪙 por <b>{name}</b></>}
          </div>
          <div className="text-sm mt-1">
            {got ? <>obtiene: <b className="text-[#FFD24A]">{got}</b></> : <span className="text-[#ffaa66]"><i>aún sin héroe</i></span>}
            {isWin && <span className="ml-2 text-[#6bff9a] font-bold">★ ganó la puja</span>}
          </div>
        </div>
      );
    };

    let verdict;
    if (result.contested) {
      verdict = <>Empate en <b className="text-white">{result.contestName}</b>: gana <b className="text-[#FFD24A]">{game.names[result.winner]}</b>. {result.needMore && 'Se abre una nueva terna para completar la fase.'}</>;
    } else {
      verdict = result.needMore ? 'Continúa la puja para completar la fase.' : 'Fase completada: cada jugador tiene su héroe.';
    }

    return (
      <div className="bg-[#15101f] border border-[#FFD24A55] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 text-[#FFD24A] font-heading font-black text-lg"><Trophy size={18} /> Resultado de la puja</div>
            <div className="text-xs text-[#a89fbb] mt-0.5">Fase {result.phase + 1}/3{result.sub > 0 ? ` · re-puja ${result.sub}` : ''} · {auctionTypeLabel(type)}</div>
          </div>
          <div className="text-2xl">{typeIcon(type)}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Line side="p" />
          <Line side="o" />
        </div>
        <div className="text-sm text-[#efe9dc] mt-3 bg-[#1a1430] border border-[#3c3158] rounded-lg p-2.5">{verdict}</div>
        <button onClick={handleNext} className="w-full flex items-center justify-center gap-2 mt-4 px-6 py-3.5 rounded-2xl font-heading font-black text-[#2a1d05]" style={{ background: 'linear-gradient(180deg,#ffe49a,#FFD24A 55%,#d8a431)' }}>
          {result.needMore ? 'Nueva terna / re-puja' : (result.phase >= 2 ? 'Ir al Equipamiento' : 'Siguiente fase de subasta')} <ArrowRight size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen px-4 py-5" style={{ background: 'linear-gradient(180deg,#0d0a14,#0a0810)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Cabecera de fase */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 font-heading font-black text-xl text-[#FFD24A]">
            <Gavel size={22} /> Subasta de Héroes
          </div>
          <span className="text-sm text-[#a89fbb]">Fase {a.aIndex + 1}/3{a.subRound > 0 ? ` · re-puja ${a.subRound}` : ''} · {typeIcon(type)} {auctionTypeLabel(type)}</span>
          <div className="ml-auto flex items-center gap-2 bg-[#1a1430] border border-[#3c3158] rounded-full px-4 py-1.5">
            <Coins size={16} className="text-[#FFD24A]" />
            <span className="font-black text-[#FFD24A]">{game.coins.p}</span>
            <span className="text-xs text-[#a89fbb]">monedas</span>
          </div>
        </div>

        {/* Equipos */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {['p', 'o'].map((side) => (
            <div key={side} className="bg-[#15101f] border border-[#3c3158] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-[#a89fbb]">{side === 'p' ? 'TU EQUIPO' : 'RIVAL'} ({game.team[side].length}/3)</div>
                <div className="text-[11px] text-[#FFD24A] font-bold">{game.coins[side]} 🪙</div>
              </div>
              <div className="flex gap-1.5">
                {game.team[side].map((h) => (
                  <div key={h.id} className="flex-1 text-center rounded-lg py-1.5 px-1 border" style={{ borderColor: (CLAN_COLORS[h.clan] || '#3c3158') + '88', background: '#1a1430' }}>
                    <div className="text-[10px] font-black text-white truncate">{h.name}</div>
                    <div className="text-[9px] text-[#a89fbb]">{h.type} · {h.boughtFor}🪙</div>
                  </div>
                ))}
                {Array.from({ length: 3 - game.team[side].length }).map((_, i) => (
                  <div key={i} className="flex-1 rounded-lg py-1.5 border border-dashed border-[#3c3158] text-center text-[10px] text-[#564b6e]">—</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bonificador (por jugador) */}
        {a.bonus.p && !result && (
          <div className="bg-gradient-to-r from-[#1f1638] to-[#15101f] border border-[#b06cff55] rounded-xl p-3 mb-4">
            <span className="text-xs font-black text-[#c79bff]">TU BONIFICADOR · </span>
            <span className="text-sm font-bold text-[#e2b0ff]">{a.bonus.p.name}</span>
            <span className="text-sm text-[#cbbfe0]"> — {a.bonus.p.txt}</span>
          </div>
        )}

        {result ? (
          <ResultPanel />
        ) : (
          <>
            <div className="text-sm text-[#a89fbb] mb-3">
              {needsHero
                ? 'Hay un héroe de cada raza. Elige UNO y haz tu puja sellada — el rival puja a ciegas. Si pujáis al mismo, gana la puja más alta.'
                : 'Ya tienes tu héroe de esta fase. Puedes pasar mientras el rival completa el suyo.'}
            </div>

            {needsHero && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-5">
                {a.cands.map((h) => (
                  <AuctionHeroCard key={h.id} hero={h} selected={selected?.id === h.id} onSelect={handleSelect} />
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 sticky bottom-4 bg-[#15101f] border border-[#3c3158] rounded-2xl p-3">
              {needsHero && selected ? (
                <>
                  <div className="text-sm text-[#efe9dc]">Pujar por <b className="text-white">{selected.name}</b></div>
                  <input type="number" min={0} max={game.coins.p} value={bid} onChange={(e) => setBid(e.target.value)} className="w-24 px-3 py-2 bg-[#0e0a16] border border-[#3c3158] rounded-lg text-[#FFD24A] font-black focus:outline-none focus:border-[#FFD24A]" />
                  <button onClick={handleBid} className="px-6 py-2.5 rounded-xl font-heading font-black text-[#2a1d05]" style={{ background: 'linear-gradient(180deg,#ffe49a,#FFD24A 55%,#d8a431)' }}>Pujar</button>
                </>
              ) : (
                <div className="text-sm text-[#a89fbb] flex items-center gap-2">
                  {needsHero ? <><Star size={15} className="text-[#FFD24A]" /> Selecciona un héroe para pujar...</> : 'Tu héroe de esta fase ya está asegurado.'}
                </div>
              )}
              <button onClick={handlePass} className="ml-auto px-5 py-2.5 rounded-xl font-bold text-[#a89fbb] border border-[#3c3158] hover:text-white">
                {needsHero ? 'Pasar ronda' : 'Continuar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}