import React, { createContext, useContext, useState, useCallback } from 'react';
import { createGame, dealAuctionRound, resolveAuctionBids, advanceAuction } from '@/lib/game/engine';

const GameCtx = createContext(null);
export const useGame = () => useContext(GameCtx);

// Clona superficialmente el game para forzar re-render tras mutar el motor.
const bump = (g) => ({ ...g });

export function GameProvider({ children }) {
  const [game, setGame] = useState(null);

  const newGame = useCallback(() => {
    const g = createGame();
    dealAuctionRound(g);
    setGame(g);
  }, []);

  // Resuelve la ronda de puja y devuelve el resultado para mostrarlo en UI.
  const submitBid = useCallback((playerBid) => {
    let result;
    setGame((prev) => {
      result = resolveAuctionBids(prev, playerBid);
      return bump(prev);
    });
    return result;
  }, []);

  // Avanza a la siguiente ronda o fase. Devuelve true si la subasta terminó.
  const nextAuctionRound = useCallback(() => {
    let ended = false;
    setGame((prev) => {
      ended = advanceAuction(prev);
      if (!ended) dealAuctionRound(prev);
      else prev.phase = 'equip';
      return bump(prev);
    });
    return ended;
  }, []);

  const resetGame = useCallback(() => setGame(null), []);

  return (
    <GameCtx.Provider value={{ game, newGame, submitBid, nextAuctionRound, resetGame, setGame }}>
      {children}
    </GameCtx.Provider>
  );
}