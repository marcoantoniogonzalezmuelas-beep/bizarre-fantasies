import React from 'react';
import { GameProvider, useGame } from '@/lib/game/GameContext';
import TitleScreen from '@/components/game/TitleScreen';
import AuctionScreen from '@/components/game/AuctionScreen';
import EquipScreen from '@/components/game/EquipScreen';
import BattleScreen from '@/components/game/BattleScreen';
import ResultScreen from '@/components/game/ResultScreen';

// Enruta la pantalla activa según la fase del juego nativo (React):
// menú -> subasta -> equipamiento -> batalla -> resultado.
function GameRouter() {
  const { game, newGame } = useGame();

  if (!game) return <TitleScreen onPlay={newGame} />;
  if (game.phase === 'auction') return <AuctionScreen />;
  if (game.phase === 'equip') return <EquipScreen />;
  if (game.phase === 'battle') return <BattleScreen />;
  if (game.phase === 'result') return <ResultScreen />;
  return <TitleScreen onPlay={newGame} />;
}

export default function Home() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}