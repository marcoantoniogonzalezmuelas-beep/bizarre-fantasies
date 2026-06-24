import React, { createContext, useContext, useState, useCallback } from 'react';
import { createGame, playerDecision, advancePhase } from '@/lib/game/engine';

const GameCtx = createContext(null);
export const useGame = () => useContext(GameCtx);

const bump = (g) => ({ ...g });

export function GameProvider({ children }) {
  const [game, setGame] = useState(null);

  const newGame = useCallback(() => {
    setGame(createGame());
  }, []);

  // El jugador puja por un héroe { heroId, amount } o pasa (null).
  const decide = useCallback((decision) => {
    setGame((prev) => {
      playerDecision(prev, decision);
      return bump(prev);
    });
  }, []);

  // Avanza tras ver el resultado de la ronda.
  const advance = useCallback(() => {
    setGame((prev) => {
      advancePhase(prev);
      return bump(prev);
    });
  }, []);

  const resetGame = useCallback(() => setGame(null), []);

  return (
    <GameCtx.Provider value={{ game, newGame, decide, advance, resetGame, setGame }}>
      {children}
    </GameCtx.Provider>
  );
}