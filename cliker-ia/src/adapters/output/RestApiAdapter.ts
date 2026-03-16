/**
 * RestApiAdapter - Implementación de ISyncService
 * 
 * Adapter que conecta con el servidor REST backend.
 * Implementa el puerto ISyncService definido en la capa de puertos.
 */

import type { GameState } from '../../types';
import type {
  ISyncService,
  ClickServerResponse,
  PurchaseServerResponse,
  SyncServerResponse,
} from '../../ports';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
// ADAPTER
// ============================================

export class RestApiAdapter implements ISyncService {
  async loadGame(playerId: string): Promise<GameState> {
    const response = await fetchApi<{ success: boolean; data?: GameState; error?: string }>(
      `/api/game/${playerId}`
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get game state');
    }
    return response.data;
  }

  async click(playerId: string): Promise<ClickServerResponse> {
    const response = await fetchApi<{ success: boolean; data?: ClickServerResponse; error?: string }>(
      `/api/game/${playerId}/click`,
      { method: 'POST' }
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to click');
    }
    return response.data;
  }

  async purchaseUpgrade(playerId: string, upgradeId: string): Promise<PurchaseServerResponse> {
    const response = await fetchApi<{ success: boolean; data?: PurchaseServerResponse; error?: string }>(
      `/api/game/${playerId}/upgrade`,
      {
        method: 'POST',
        body: JSON.stringify({ upgradeId }),
      }
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to buy upgrade');
    }
    return response.data;
  }

  async sync(playerId: string): Promise<SyncServerResponse> {
    const response = await fetchApi<{ success: boolean; data?: SyncServerResponse; error?: string }>(
      `/api/game/${playerId}/sync`
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to sync');
    }
    return response.data;
  }

  async save(playerId: string, state: GameState): Promise<{ savedAt: number }> {
    const response = await fetchApi<{ success: boolean; data?: { savedAt: number }; error?: string }>(
      `/api/game/${playerId}/save`,
      {
        method: 'POST',
        body: JSON.stringify({ state }),
      }
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to save');
    }
    return response.data || { savedAt: Date.now() };
  }

  async deleteGame(playerId: string): Promise<void> {
    await fetchApi<{ success: boolean }>(`/api/game/${playerId}`, {
      method: 'DELETE',
    });
  }

  async ping(): Promise<boolean> {
    try {
      await fetchApi<{ status: string }>('/openapi.json');
      return true;
    } catch {
      return false;
    }
  }

  getBaseUrl(): string {
    return API_BASE_URL;
  }
}

// ============================================
// INSTANCIA ÚNICA (Singleton)
// ============================================

export const restApiAdapter = new RestApiAdapter();
