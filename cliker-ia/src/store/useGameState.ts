/**
 * Game Store - Maneja toda la lógica del juego
 * 
 * Arquitectura híbrida:
 * - WebSocket para comunicación en tiempo real (clicks, compras, sync)
 * - REST API como fallback (save, load, reset)
 * - Servidor es la fuente de verdad para monedas
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Upgrade } from '../types';
import { initialState, canAfford } from '../store/gameStore';
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
  
  // Player ID (generado una vez y persistente)
  const [playerId] = useState(() => getOrCreatePlayerId());
  
  // Ref para acceso a estado en callbacks (evita stale closures)
  const gameStateRef = useRef(gameState);
  const renderCallbackRef = useRef<((data: RenderData) => void) | null>(null);
  
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // ============================================
  // WEBSOCKET - Fuente de verdad en tiempo real
  // ============================================
  
  const updateFromWebSocket = useCallback((wsState: GameStateWS) => {
    console.log('[useGame] WS state:', wsState);
    
    setGameState(prev => ({
      ...prev,
      coins: wsState.coins,
      coinsPerClick: wsState.coinsPerClick,
      coinsPerSecond: wsState.coinsPerSecond,
      upgrades: wsState.upgrades || prev.upgrades,
      shopUpgrades: wsState.shopUpgrades || prev.shopUpgrades,
    }));
  }, []);
  
  const handleWsError = useCallback((error: string) => {
    console.error('[useGame] WS error:', error);
    setWsError(error);
  }, []);
  
  const { isConnected, hasJoined, click: wsClick, buy: wsBuy } = useWebSocket({
    playerId,
    onStateUpdate: updateFromWebSocket,
    onError: handleWsError,
  });
  
  // Track conexión WebSocket
  useEffect(() => {
    if (isConnected && hasJoined) {
      setIsOnline(true);
      setIsLoaded(true);
      setWsError(null);
      console.log('[useGame] WebSocket connected');
    } else if (isConnected && !hasJoined) {
      console.log('[useGame] WebSocket connecting...');
    } else {
      setIsOnline(false);
    }
  }, [isConnected, hasJoined]);
  
  // Fallback: Si WebSocket falla, usar REST API
  useEffect(() => {
    if (wsError && !isLoaded) {
      console.warn('[useGame] WebSocket failed, using REST fallback');
      
      const loadFromServer = async () => {
        try {
          const state = await gameApi.initGame(playerId);
          setGameState(state);
          setIsOnline(true);
        } catch (error) {
          console.warn('[useGame] REST fallback failed:', error);
          // Cargar desde localStorage si todo falla
          const saved = localStorage.getItem('idle-clicker-game');
          if (saved) {
            setGameState(JSON.parse(saved));
          }
        }
        setIsLoaded(true);
      };
      
      loadFromServer();
    }
  }, [wsError, playerId]);

  // ============================================
  // PERSISTENCIA - Guardar cada 30 segundos
  // ============================================
  
  const saveGame = useCallback(async () => {
    try {
      // Save al servidor (coins son calculados server-side)
      await gameApi.saveGame(playerId, gameState);
    } catch (e) {
      console.warn('[useGame] Save failed:', e);
    }
    // Siempre guardar en localStorage como backup
    localStorage.setItem('idle-clicker-game', JSON.stringify(gameState));
  }, [gameState, playerId]);

  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(saveGame, 30000);
    return () => clearInterval(interval);
  }, [isLoaded, saveGame]);

  // ============================================
  // ACCIONES DEL JUGADOR
  // ============================================

  const handleClick = useCallback(() => {
    if (hasJoined) {
      // Usar WebSocket (fuente de verdad)
      wsClick();
      return;
    }
    
    // Fallback REST (solo si WebSocket no está disponible)
    console.warn('[useGame] Click without WebSocket - using REST');
    
    if (!isOnline) {
      // Modo offline: actualizar local
      setGameState(prev => ({
        ...prev,
        coins: prev.coins + prev.coinsPerClick,
      }));
    } else {
      // REST API fallback
      gameApi.processClick(playerId).then(result => {
        setGameState(prev => ({
          ...prev,
          coins: result.coins,
          coinsPerClick: result.coinsPerClick ?? prev.coinsPerClick,
        }));
      }).catch(console.error);
    }
  }, [hasJoined, isOnline, playerId, wsClick]);

  const handleBuyUpgrade = useCallback((upgradeId: string) => {
    const currentState = gameStateRef.current;
    
    // Validación local para UX (antes de enviar al servidor)
    if (!canAfford(currentState, upgradeId)) {
      console.log('[useGame] Cannot afford upgrade:', upgradeId);
      return;
    }
    
    if (hasJoined) {
      // Usar WebSocket (fuente de verdad)
      wsBuy(upgradeId);
      return;
    }
    
    // Fallback REST
    console.warn('[useGame] Buy without WebSocket - using REST');
    
    if (!isOnline) {
      // Modo offline: no permitir compras
      console.warn('[useGame] Cannot buy while offline');
      return;
    }
    
    gameApi.purchaseUpgrade(playerId, upgradeId).then(result => {
      setGameState(prev => {
        const updatedUpgrades = prev.upgrades.map(u => {
          if (u.id === upgradeId) {
            return { ...u, purchased: result.data.newLevel, cost: result.data.newCost };
          }
          return u;
        });
        return {
          ...prev,
          coins: result.coins,
          coinsPerClick: result.data.coinsPerClick,
          coinsPerSecond: result.data.coinsPerSecond,
          upgrades: updatedUpgrades,
        };
      });
    }).catch(console.error);
  }, [hasJoined, isOnline, playerId, wsBuy]);

  const handleReset = useCallback(async () => {
    try {
      await gameApi.deleteGame(playerId);
    } catch {
      // Ignore errors on reset
    }
    setGameState(initialState);
    localStorage.removeItem('idle-clicker-game');
  }, [playerId]);

  // ============================================
  // RENDER - Notificar a Phaser
  // ============================================

  const onRenderReady = useCallback((callback: (data: RenderData) => void) => {
    renderCallbackRef.current = callback;
  }, []);

  useEffect(() => {
    if (renderCallbackRef.current && isLoaded) {
      const data = stateToRenderData(gameState);
      renderCallbackRef.current(data);
    }
  }, [gameState, isLoaded]);

  // ============================================
  // EXPORTS
  // ============================================

  return {
    gameState,
    isLoaded,
    isOnline,
    playerId,
    handleClick,
    handleBuyUpgrade,
    handleReset,
    saveGame,
    onRenderReady,
  };
}

export const gameHelpers = { canAfford };
export type { GameState, Upgrade };
