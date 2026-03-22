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
import { initialState, purchaseUpgrade, canAfford } from '../store/gameStore';
import { stateToRenderData, type RenderData } from '../game/gameApi';
import { gameApi } from '../api/gameApi';
import { useWebSocket, type GameStateWS } from '../hooks/useWebSocket';

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
  const [wsError, setWsError] = useState<string | null>(null);
  
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
  // WEBSOCKET HANDLER
  // ============================================
  
  // Convert WebSocket state to GameState
  const updateFromWebSocket = useCallback((wsState: GameStateWS) => {
    console.log('[useGame] Updating from WebSocket:', wsState);
    
    setGameState(prev => ({
      ...prev,
      coins: wsState.coins,
      coinsPerClick: wsState.coinsPerClick,
      coinsPerSecond: wsState.coinsPerSecond,
      upgrades: wsState.upgrades || prev.upgrades,
      shopUpgrades: wsState.shopUpgrades || prev.shopUpgrades,
    }));
  }, []);
  
  // Handle WebSocket errors
  const handleWsError = useCallback((error: string) => {
    console.error('[useGame] WebSocket error:', error);
    setWsError(error);
  }, []);
  
  // WebSocket connection
  const { isConnected, hasJoined, click: wsClick, buy: wsBuy } = useWebSocket({
    playerId,
    onStateUpdate: updateFromWebSocket,
    onError: handleWsError,
  });
  
  // Track connection state
  useEffect(() => {
    if (isConnected && hasJoined) {
      setIsOnline(true);
      setIsLoaded(true);
      setWsError(null);
      console.log('[useGame] WebSocket connected and joined');
    } else if (isConnected && !hasJoined) {
      console.log('[useGame] WebSocket connecting...');
    } else {
      setIsOnline(false);
    }
  }, [isConnected, hasJoined]);
  
  // Fallback: Si WebSocket falla, usar REST API
  useEffect(() => {
    if (wsError && !isLoaded) {
      console.warn('[useGame] WebSocket failed, falling back to REST API');
      
      const loadFromServer = async () => {
        try {
          const state = await gameApi.initGame(playerId);
          setGameState(state);
          setIsOnline(true);
        } catch (error) {
          console.warn('[useGame] REST fallback also failed:', error);
          const saved = localStorage.getItem('idle-clicker-game');
          if (saved) {
            setGameState(JSON.parse(saved));
          }
        }
        setIsLoaded(true);
      };
      
      loadFromServer();
    }
  }, [wsError]);

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
  // GENERACIÓN PASIVA (ahora viene del servidor via WebSocket)
  // ============================================
  // El servidor envía actualizaciones via WebSocket sync event
  // Ya no necesitamos calcular pasivo localmente
  
  // ============================================
  // ACCIONES DEL JUGADOR
  // ============================================

  const handleClick = useCallback(async () => {
    // Usar WebSocket si está conectado
    if (hasJoined) {
      wsClick();
      return;
    }
    
    // Fallback a REST API si WebSocket no está disponible
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
  }, [hasJoined, wsClick]);

  const handleBuyUpgrade = useCallback(async (upgradeId: string) => {
    const currentState = gameStateRef.current;
    const isCurrentlyOnline = isOnlineRef.current;
    
    console.log('[handleBuyUpgrade] Intentando comprar:', upgradeId, 'coins:', currentState.coins);
    
    // Verificar si puede comprar (validación local para UX)
    if (!canAfford(currentState, upgradeId)) {
      console.log('[handleBuyUpgrade] No puede comprar');
      return;
    }
    
    // Usar WebSocket si está conectado
    if (hasJoined) {
      wsBuy(upgradeId);
      return;
    }
    
    // Fallback a REST API si WebSocket no está disponible
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
  }, [saveGame, hasJoined, wsBuy]);

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
