import React from 'react';
import { Trophy, Skull, RotateCcw, Home as HomeIcon } from 'lucide-react';
import { useGame } from '@/lib/game/GameContext';
import { heroArt } from '@/lib/game/engine';

export default function ResultScreen() {
  const { game, newGame, resetGame } = useGame();
  if (!game) return null;
  const win = game.winner === 'p';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-10" style={{ background: 'linear-gradient(180deg,#0d0a14,#0a0810)' }}>
      <div className={`flex items-center justify-center w-20 h-20 rounded-full mb-4 ${win ? 'bg-[#FFD24A1f] border-2 border-[#FFD24A]' : 'bg-[#ff444418] border-2 border-[#ff6b6b]'}`}>
        {win ? <Trophy size={40} className="text-[#FFD24A]" /> : <Skull size={40} className="text-[#ff6b6b]" />}
      </div>
      <div className="font-heading font-black text-3xl mb-2" style={{ color: win ? '#FFD24A' : '#ff6b6b' }}>
        {win ? '¡VICTORIA!' : 'DERROTA'}
      </div>
      <p className="text-[#a89fbb] max-w-md mb-6">
        {win ? 'Tu equipo ha aplastado a la IA Némesis. Las leyendas de Bizarre Fantasies hablarán de esta batalla.' : 'La IA Némesis se impuso esta vez. Reagrupa, equipa mejor y vuelve a intentarlo.'}
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-lg mb-7">
        {['p', 'o'].map((side) => (
          <div key={side} className="bg-[#15101f] border border-[#3c3158] rounded-xl p-3">
            <div className="text-xs font-bold text-[#a89fbb] mb-2">{side === 'p' ? 'TU EQUIPO' : 'RIVAL'}</div>
            <div className="flex flex-col gap-2">
              {game.team[side].map((h) => (
                <div key={h.id} className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-cover shrink-0" style={{ backgroundImage: `url("${heroArt(h, h.eliteMode)}")`, backgroundPosition: 'center 14%', filter: h.alive ? 'none' : 'grayscale(1) brightness(.5)' }} />
                  <div className="min-w-0 text-left">
                    <div className="text-[12px] font-black text-white truncate">{h.name}{!h.alive && ' 💀'}</div>
                    <div className="text-[10px] text-[#a89fbb]">{h.alive ? `${Math.max(0, h.hp)}/${h.maxHp} HP` : 'Caído'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={newGame} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-heading font-black text-[#2a1d05]" style={{ background: 'linear-gradient(180deg,#ffe49a,#FFD24A 55%,#d8a431)' }}>
          <RotateCcw size={18} /> Jugar de nuevo
        </button>
        <button onClick={resetGame} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-[#a89fbb] border border-[#3c3158] hover:text-white">
          <HomeIcon size={18} /> Menú principal
        </button>
      </div>
    </div>
  );
}