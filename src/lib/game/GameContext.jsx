import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  createGame, playerDecision, advancePhase,
  buySpell, buyObject, removeSpell, removeItem, assignEquip, unequip, finishEquip,
} from '@/lib/game/engine';

const GameCtx = createContext(null);
export const useGame = () => useContext(GameCtx);

const bump = (g) => ({ ...g });

export function GameProvider({ children }) {
  const [game, setGame] = useState(null);

  const newGame = useCallback(() => setGame(createGame()), []);
  const resetGame = useCallback(() => setGame(null), []);

  // Helper: aplica una mutación del motor y re-renderiza.
  const mutate = useCallback((fn) => {
    setGame((prev) => { if (!prev) return prev; fn(prev); return bump(prev); });
  }, []);

  // --- Subasta ---
  const decide = useCallback((decision) => mutate((g) => playerDecision(g, decision)), [mutate]);
  const advance = useCallback(() => mutate((g) => advancePhase(g)), [mutate]);

  // --- Equipamiento ---
  const eqBuySpell = useCallback((side, id) => mutate((g) => buySpell(g, side, id)), [mutate]);
  const eqBuyObject = useCallback((side, id) => mutate((g) => buyObject(g, side, id)), [mutate]);
  const eqRemoveSpell = useCallback((side, i) => mutate((g) => removeSpell(g, side, i)), [mutate]);
  const eqRemoveItem = useCallback((side, i) => mutate((g) => removeItem(g, side, i)), [mutate]);
  const eqAssign = useCallback((side, heroId, kind, id) => mutate((g) => assignEquip(g, side, heroId, kind, id)), [mutate]);
  const eqUnequip = useCallback((side, heroId, slot) => mutate((g) => unequip(g, side, heroId, slot)), [mutate]);
  const eqSetShop = useCallback((tab) => mutate((g) => { g.eqShop = tab; }), [mutate]);
  const eqFinish = useCallback(() => mutate((g) => finishEquip(g)), [mutate]);

  return (
    <GameCtx.Provider value={{
      game, newGame, resetGame, setGame,
      decide, advance,
      eqBuySpell, eqBuyObject, eqRemoveSpell, eqRemoveItem, eqAssign, eqUnequip, eqSetShop, eqFinish,
    }}>
      {children}
    </GameCtx.Provider>
  );
}

export { GameCtx };