import React, { useEffect, useRef, useState } from 'react';
import { Swords } from 'lucide-react';
import { useGame } from '@/lib/game/GameContext';
import {
  createBattle, startRounds, getCurrent, pickTarget, cancelPending,
  actMelee, actRanged, actDefend, actAbility, castSpell, applyItem,
} from '@/lib/game/combat';
import BattleHero from '@/components/game/BattleHero';
import BattleActionMenu from '@/components/game/BattleActionMenu';

const LOG_COLORS = { lx: '#FFD24A', lg: '#a89fbb', ld: '#ff8a8a', lh: '#8affb0', li: '#9bb4ff' };

export default function BattleScreen() {
  const { game, setGame } = useGame();
  const Bref = useRef(null);
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);

  // Crear la batalla una sola vez y arrancar el bucle de rondas.
  useEffect(() => {
    const B = createBattle(game, { onRender: rerender, onLog: rerender, onEnd: () => { setGame({ ...B.g }); } });
    Bref.current = B;
    startRounds(B);
    return () => { B.over = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const B = Bref.current;
  if (!B) return null;

  const current = getCurrent(B);
  const myTurn = !B.over && current && B.current.side === 'p' && !B.busy;
  const pend = B.pending;

  const handleAct = (action, arg) => {
    if (action === 'melee') actMelee(B);
    else if (action === 'ranged') actRanged(B);
    else if (action === 'defend') actDefend(B);
    else if (action === 'ability') actAbility(B);
    else if (action === 'castSpell') castSpell(B, arg);
    else if (action === 'useItem') applyItem(B, arg);
    rerender();
  };

  const Team = ({ side }) => (
    <div className="flex flex-col gap-2">
      <div className="text-[11px] font-black text-[#a89fbb] px-1">{side === 'p' ? 'TU EQUIPO' : 'RIVAL'}</div>
      {game.team[side].map((h) => {
        const active = current && B.current.side === side && B.current.id === h.id;
        const targetable = pend && pend.validSide === side && (pend.allowDead ? !h.alive : h.alive);
        return <BattleHero key={h.id} hero={h} side={side} active={active} targetable={targetable} onClick={() => { pickTarget(B, side, h.id); rerender(); }} />;
      })}
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-5" style={{ background: 'linear-gradient(180deg,#0d0a14,#0a0810)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 font-heading font-black text-xl text-[#FFD24A] mb-4">
          <Swords size={22} /> Combate <span className="text-sm text-[#a89fbb] font-normal ml-1">· Ronda {B.round}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          <Team side="p" />
          <Team side="o" />
        </div>

        {/* Panel de acción / objetivo */}
        <div className="sticky bottom-3 mt-4 bg-[#15101f] border border-[#3c3158] rounded-2xl p-3">
          {pend ? (
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-bold text-[#ff9b9b]">🎯 {pend.prompt} — pulsa un objetivo resaltado.</div>
              <button onClick={() => { cancelPending(B); rerender(); }} className="text-xs px-3 py-1.5 rounded-lg text-[#a89fbb] border border-[#3c3158] hover:text-white">Cancelar</button>
            </div>
          ) : myTurn ? (
            <BattleActionMenu B={B} hero={current} onAct={handleAct} />
          ) : (
            <div className="flex items-center gap-2 text-sm text-[#a89fbb] py-1">
              <span className="w-3 h-3 border-2 border-[#3c3158] border-t-[#FFD24A] rounded-full animate-spin" />
              {B.over ? 'Batalla terminada.' : current ? `Turno de ${current.name}...` : 'Preparando ronda...'}
            </div>
          )}
        </div>

        {/* Registro de combate */}
        <div className="mt-3 bg-[#0e0a16] border border-[#3c3158] rounded-xl p-3 max-h-44 overflow-y-auto no-scrollbar">
          {B.log.map((l, i) => (
            <div key={i} className="text-[11px] leading-relaxed" style={{ color: LOG_COLORS[l.cls] || '#cbbfe0', opacity: i === 0 ? 1 : 0.7 - Math.min(i * 0.04, 0.45) }}>{l.txt}</div>
          ))}
        </div>
      </div>
    </div>
  );
}