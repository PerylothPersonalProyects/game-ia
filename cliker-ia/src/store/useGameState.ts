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
import { initialState, clickCoins, passiveIncome, purchaseUpgrade, canAfford } from '../store/gameStore';
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
  
  const playerIdRef = useRef(getOrCreatePlayerId());
  const renderCallbackRef = useRef<((data: RenderData) => void) | null>(null);
  
  // Usar ref para el estado actual sin causar re-renders
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // ============================================
  // INICIALIZACIÓN
  // ============================================
  
  // Cargar estado del servidor
  useEffect(() => {
    const loadFromServer = async () => {
      try {
        console.log('[useGame] Cargando desde servidor...');
        const state = await gameApi.initGame(playerIdRef.current);
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
      await gameApi.saveGame(playerIdRef.current, gameState);
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
    // Usar ref para evitar dependencia en gameState
    const currentState = gameStateRef.current;
    
    // Actualizar local
    setGameState(prev => clickCoins(prev));
    
    // Sincronizar con servidor
    if (isOnline) {
      try {
        const result = await gameApi.processClick(playerIdRef.current);
        setGameState(prev => ({
          ...prev,
          coins: result.coins,
          coinsPerClick: result.coinsPerClick,
        }));
      } catch (error) {
        // Ignorar errores de red
      }
    }
  }, [isOnline]);

  const handleBuyUpgrade = useCallback(async (upgradeId: string) => {
    const currentState = gameStateRef.current;
    
    console.log('[handleBuyUpgrade] Intentando comprar:', upgradeId);
    console.log('[handleBuyUpgrade] Coins actuales:', currentState.coins);
    
    // Verificar si puede comprar
    if (!canAfford(currentState, upgradeId)) {
      console.log('[handleBuyUpgrade] No puede comprar - coins insuficientes');
      return;
    }
    
    console.log('[handleBuyUpgrade] Comprando...');
    
    // Actualizar local
    setGameState(prev => {
      const newState = purchaseUpgrade(prev, upgradeId);
      console.log('[handleBuyUpgrade] Nuevo estado - coins:', newState.coins, 'upgrades:', newState.upgrades.length);
      return newState;
    });
    
    // Sincronizar con servidor
    if (isOnline) {
      try {
        const result = await gameApi.purchaseUpgrade(playerIdRef.current, upgradeId);
        console.log('[handleBuyUpgrade] Resultado del servidor:', result);
        setGameState(prev => ({
          ...prev,
          coinsPerClick: result.coinsPerClick,
          coinsPerSecond: result.coinsPerSecond,
          upgrades: prev.upgrades.map(u => 
            u.id === upgradeId 
              ? { ...u, purchased: result.newLevel, cost: result.newCost }
              : u
          ),
        }));
      } catch (error) {
        console.error('[handleBuyUpgrade] Error:', error);
      }
    }
    
    // Auto-save después de comprar
    setTimeout(saveGame, 100);
  }, [isOnline, saveGame]);

  const handleReset = useCallback(async () => {
    try {
      await gameApi.deleteGame(playerIdRef.current);
    } catch (e) {}
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
    playerId: playerIdRef.current,
    
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
