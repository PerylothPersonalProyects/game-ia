/**
 * Game Store - Maneja toda la lógica del juego
 * 
 * Este es el "Controlador" de la arquitectura:
 * - React maneja el estado y la lógica
 * - Phaser solo renderiza lo que aquí se define
 * - El servidor provee la fuente de verdad
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Upgrade } from '../types';
import { initialState, passiveIncome, purchaseUpgrade, canAfford } from '../store/gameStore';
import { stateToRenderData, type RenderData } from '../game/gameApi';
import { gameApi } from '../api/gameApi';

// ============================================
// PLAYER ID - Identificador único del jugador
// ============================================

const PLAYER_ID_KEY = 'idle-clicker-player-id';

function getOrCreatePlayerId(): string {
  let playerId = localStorage.getItem(PLAYER_ID_KEY);
  if (!playerId) {
    playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(PLAYER_ID_KEY, playerId);
  }
  return playerId;
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  
  // Store playerId in state to avoid ref access during render
  const [playerId] = useState(() => getOrCreatePlayerId());
  
  // Refs (only access in effects/callbacks, never during render)
  const isOnlineRef = useRef(isOnline);
  const gameStateRef = useRef(gameState);
  const renderCallbackRef = useRef<((data: RenderData) => void) | null>(null);
  
  // Sync refs with state (must be in useEffect, not during render)
  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);
  
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // ============================================
  // INICIALIZACIÓN
  // ============================================
  
  // Cargar estado del servidor
  useEffect(() => {
    const loadFromServer = async () => {
      try {
        console.log('[useGame] Cargando desde servidor...');
        const state = await gameApi.initGame(playerId);
        setGameState(state);
        setIsOnline(true);
        console.log('[useGame] Cargado. Upgrades:', state.upgrades.length);
      } catch (error) {
        console.warn('[useGame] Error, usando local:', error);
        const saved = localStorage.getItem('idle-clicker-game');
        if (saved) {
          setGameState(JSON.parse(saved));
        }
        setIsOnline(false);
      }
      setIsLoaded(true);
    };
    
    loadFromServer();
  }, []);

  // ============================================
  // PERSISTENCIA
  // ============================================
  
  const saveGame = useCallback(async () => {
    try {
      await gameApi.saveGame(playerId, gameState);
      localStorage.setItem('idle-clicker-game', JSON.stringify(gameState));
    } catch (e) {
      localStorage.setItem('idle-clicker-game', JSON.stringify(gameState));
    }
  }, [gameState]);

  // Auto-save cada 30 segundos
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(saveGame, 30000);
    return () => clearInterval(interval);
  }, [isLoaded, saveGame]);

  // ============================================
  // GENERACIÓN PASIVA
  // ============================================
  
  useEffect(() => {
    if (!isLoaded) return;
    
    const interval = setInterval(() => {
      setGameState(prev => passiveIncome(prev));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isLoaded]);

  // ============================================
  // ACCIONES DEL JUGADOR
  // ============================================

  const handleClick = useCallback(async () => {
    // Always read current values at execution time, not at creation time
    const currentPlayerId = playerId;
    const currentState = gameStateRef.current;
    const isCurrentlyOnline = isOnlineRef.current;
    
    console.log('[handleClick] isOnline:', isCurrentlyOnline);
    console.log('[handleClick] setGameState called with coins:', currentState.coins + currentState.coinsPerClick);
    
    // Actualizar local INMEDIATAMENTE usando valores frescos
    const newCoins = currentState.coins + currentState.coinsPerClick;
    
    console.log('[handleClick] Local - prev:', currentState.coins, '+', currentState.coinsPerClick, '=', newCoins);
    
    setGameState(prev => {
      console.log('[handleClick] setGameState EXECUTED, prev.coins:', prev.coins, '-> new:', newCoins);
      return {
        ...prev,
        coins: newCoins,
      };
    });
    
    // Sincronizar con servidor
    if (isCurrentlyOnline) {
      try {
        const result = await gameApi.processClick(currentPlayerId);
        console.log('[handleClick] Server returned - coins:', result.coins);
        
        // Usar el valor del servidor (que es la fuente de verdad)
        // Importante: usar functional update para evitar stale closure
        setGameState(prev => ({
          ...prev,
          coins: result.coins,
          coinsPerClick: result.coinsPerClick ?? prev.coinsPerClick,
        }));
      } catch (error) {
        console.error('[handleClick] Error calling server:', error);
      }
    }
  }, []);

  const handleBuyUpgrade = useCallback(async (upgradeId: string) => {
    const currentState = gameStateRef.current;
    const isCurrentlyOnline = isOnlineRef.current;
    
    console.log('[handleBuyUpgrade] Intentando comprar:', upgradeId, 'coins:', currentState.coins);
    
    // Verificar si puede comprar
    if (!canAfford(currentState, upgradeId)) {
      console.log('[handleBuyUpgrade] No puede comprar');
      return;
    }
    
    // Sincronizar con servidor
    if (isCurrentlyOnline) {
      try {
        // Usar coins del servidor para evitar inconsistencias (evita double-spend)
        const result = await gameApi.purchaseUpgrade(playerId, upgradeId);
        console.log('[handleBuyUpgrade] Server returned coins:', result.coins);
        
        // Actualizar estado con coins del servidor (fuente de verdad)
        setGameState(prev => {
          // Find and update the purchased upgrade in state
          const updatedUpgrades = prev.upgrades.map(u => {
            if (u.id === upgradeId) {
              return {
                ...u,
                purchased: result.data.newLevel,
                cost: result.data.newCost,
              };
            }
            return u;
          });
          
          // Also update shopUpgrades if applicable
          const updatedShopUpgrades = prev.shopUpgrades?.map(u => {
            if (u.id === upgradeId) {
              return {
                ...u,
                purchased: result.data.newLevel,
                cost: result.data.newCost,
              };
            }
            return u;
          });
          
          return {
            ...prev,
            coins: result.coins, // Use server coins - this is the source of truth
            coinsPerClick: result.data.coinsPerClick,
            coinsPerSecond: result.data.coinsPerSecond,
            upgrades: updatedUpgrades,
            shopUpgrades: updatedShopUpgrades,
          };
        });
        
        console.log('[handleBuyUpgrade] Estado actualizado con coins del servidor');
        return; // Early return - no need for local update + refetch
      } catch (error) {
        console.error('[handleBuyUpgrade] Error:', error);
        // Fall through to local update if server fails
      }
    }
    
    // Fallback: Actualizar local si no hay conexión o si falló el servidor
    setGameState(prev => {
      const newState = purchaseUpgrade(prev, upgradeId);
      console.log('[handleBuyUpgrade] Nuevo estado (local) - coins:', newState.coins);
      return newState;
    });
    
    // Auto-save después de comprar
    setTimeout(saveGame, 100);
  }, [saveGame]);

  const handleReset = useCallback(async () => {
    try {
      await gameApi.deleteGame(playerId);
    } catch {
      // Silently ignore delete errors
    }
    setGameState(initialState);
    localStorage.removeItem('idle-clicker-game');
  }, []);

  // ============================================
  // RENDER (Phaser)
  // ============================================

  const onRenderReady = useCallback((callback: (data: RenderData) => void) => {
    renderCallbackRef.current = callback;
  }, []);

  // Notificar a Phaser cuando cambia el estado
  useEffect(() => {
    if (renderCallbackRef.current && isLoaded) {
      const data = stateToRenderData(gameState);
      renderCallbackRef.current(data);
    }
  }, [gameState, isLoaded]);

  return {
    // Estado
    gameState,
    isLoaded,
    isOnline,
    playerId: playerId,
    
    // Acciones
    handleClick,
    handleBuyUpgrade,
    handleReset,
    saveGame,
    
    // Para Phaser
    onRenderReady,
  };
}

// ============================================
// EXPORTS ADICIONALES
// ============================================

export const gameHelpers = {
  calculateCost: () => 0,
  canAfford,
};

export type { GameState, Upgrade };
