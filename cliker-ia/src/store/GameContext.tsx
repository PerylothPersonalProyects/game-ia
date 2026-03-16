import { createContext, useContext, type ReactNode } from 'react';
import { useGame } from './useGameState';

type GameContextValue = ReturnType<typeof useGame>;

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const gameValue = useGame();
  
  return (
    <GameContext.Provider value={gameValue}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
