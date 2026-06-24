import React from 'react';
import { GameProvider, useGame } from '@/lib/game/GameContext';
import TitleScreen from '@/components/game/TitleScreen';
import AuctionScreen from '@/components/game/AuctionScreen';
import EquipScreen from '@/components/game/EquipScreen';

function GameFlow() {
  const { game, newGame } = useGame();

  if (!game) return <TitleScreen onPlay={newGame} />;
  if (game.phase === 'auction') return <AuctionScreen />;
  if (game.phase === 'equip') return <EquipScreen />;

  // La fase de Combate se construirá encima.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6" style={{ background: 'linear-gradient(180deg,#0d0a14,#0a0810)' }}>
      <div className="font-heading font-black text-2xl text-[#FFD24A] mb-3">¡Listos para la batalla!</div>
      <p className="text-[#a89fbb] max-w-md">Has terminado la fase de Equipamiento. La fase de Combate llega a continuación.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-lg">
        {['p', 'o'].map((side) => (
          <div key={side} className="bg-[#15101f] border border-[#3c3158] rounded-xl p-3">
            <div className="text-xs font-bold text-[#a89fbb] mb-2">{side === 'p' ? 'TU EQUIPO' : 'RIVAL'}</div>
            {game.team[side].map((h) => (
              <div key={h.id} className="text-sm font-black text-white">{h.name} <span className="text-[#a89fbb] font-normal">· {h.clan}</span></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <GameProvider>
      <GameFlow />
    </GameProvider>
  );
}