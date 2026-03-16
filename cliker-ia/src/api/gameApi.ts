/**
 * API Layer - Comunicación con el servidor backend
 * 
 * Proporciona una interfaz unificada para:
 * - localStorage (fallback offline)
 * - Servidor REST (principal)
 * 
 * La app siempre usa esta capa - no necesita saber si está offline o online
 */

import type { GameState } from '../types';

// ============================================
// CONFIG
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ============================================
// TIPOS
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SyncResponse {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  lastSync: number;
  offlineEarned?: number;
}

export interface ClickResponse {
  coins: number;
  clickPower: number;
  coinsPerClick: number;
}

export interface UpgradeResponse {
  upgradeId: string;
  newLevel: number;
  newCost: number;
  coinsPerClick: number;
  coinsPerSecond: number;
}

// ============================================
// HELPERS
// ============================================

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// ============================================
// REST API
// ============================================

const restApi = {
  // Obtener estado del juego
  async getGameState(playerId: string): Promise<GameState> {
    const response = await fetchApi<ApiResponse<GameState>>(`/api/game/${playerId}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get game state');
    }
    return response.data;
  },

  // Sincronización rápida
  async sync(playerId: string): Promise<SyncResponse> {
    const response = await fetchApi<ApiResponse<SyncResponse>>(`/api/game/${playerId}/sync`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to sync');
    }
    return response.data;
  },

  // Procesar click
  async click(playerId: string): Promise<ClickResponse> {
    const response = await fetchApi<ApiResponse<ClickResponse>>(`/api/game/${playerId}/click`, {
      method: 'POST',
    });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to click');
    }
    return response.data;
  },

  // Comprar upgrade
  async buyUpgrade(playerId: string, upgradeId: string): Promise<UpgradeResponse> {
    const response = await fetchApi<ApiResponse<UpgradeResponse>>(`/api/game/${playerId}/upgrade`, {
      method: 'POST',
      body: JSON.stringify({ upgradeId }),
    });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to buy upgrade');
    }
    return response.data;
  },

  // Guardar estado
  async save(playerId: string, state: GameState): Promise<{ savedAt: number }> {
    const response = await fetchApi<ApiResponse<{ savedAt: number }>>(`/api/game/${playerId}/save`, {
      method: 'POST',
      body: JSON.stringify({ state }),
    });
    if (!response.success) {
      throw new Error(response.error || 'Failed to save');
    }
    return response.data || { savedAt: Date.now() };
  },

  // Eliminar datos
  async delete(playerId: string): Promise<void> {
    await fetchApi<ApiResponse<void>>(`/api/game/${playerId}`, {
      method: 'DELETE',
    });
  },

  // Verificar si el servidor está disponible
  async ping(): Promise<boolean> {
    try {
      await fetchApi<{ status: string }>('/openapi.json');
      return true;
    } catch {
      return false;
    }
  },
};

// ============================================
// LOCAL STORAGE (Fallback)
// ============================================

const STORAGE_KEY = 'idle-clicker-game';

const localStorageApi = {
  async save(state: GameState): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  async load(): Promise<GameState | null> {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  },

  async delete(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  },
};

// ============================================
// GAME API - Interfaz unificada
// ============================================

export const gameApi = {
  /**
   * Cargar estado del juego desde el servidor (sin fallback local)
   */
  async loadGame(playerId: string): Promise<GameState> {
    return restApi.getGameState(playerId);
  },

  /**
   * Inicializar juego - cargar desde servidor o local
   */
  async initGame(playerId: string): Promise<GameState> {
    try {
      // Intentar cargar del servidor
      const serverState = await restApi.getGameState(playerId);
      // Guardar también localmente como backup
      await localStorageApi.save(serverState);
      return serverState;
    } catch (error) {
      console.warn('Failed to load from server, falling back to local:', error);
      const localState = await localStorageApi.load();
      if (localState) return localState;
      
      // Si no hay nada, retornar estado inicial
      return {
        coins: 0,
        coinsPerClick: 1,
        coinsPerSecond: 0,
        upgrades: [],
        shopUpgrades: [],
      };
    }
  },

  /**
   * Procesar click (servidor)
   */
  async processClick(playerId: string): Promise<ClickResponse> {
    return restApi.click(playerId);
  },

  /**
   * Comprar upgrade (servidor)
   */
  async purchaseUpgrade(playerId: string, upgradeId: string): Promise<UpgradeResponse> {
    return restApi.buyUpgrade(playerId, upgradeId);
  },

  /**
   * Guardar estado en servidor
   */
  async saveGame(playerId: string, state: GameState): Promise<void> {
    try {
      await restApi.save(playerId, state);
    } catch (error) {
      console.warn('Failed to save to server, saving locally:', error);
    }
    // Siempre guardar localmente como backup
    await localStorageApi.save(state);
  },

  /**
   * Sincronizar con servidor
   */
  async syncGame(playerId: string): Promise<SyncResponse> {
    return restApi.sync(playerId);
  },

  /**
   * Eliminar datos del juego
   */
  async deleteGame(playerId: string): Promise<void> {
    try {
      await restApi.delete(playerId);
    } catch (error) {
      console.warn('Failed to delete from server:', error);
    }
    await localStorageApi.delete();
  },

  /**
   * Verificar si hay conexión al servidor
   */
  async isOnline(): Promise<boolean> {
    return restApi.ping();
  },

  /**
   * Obtener URL base de la API
   */
  getBaseUrl(): string {
    return API_BASE_URL;
  },
};
