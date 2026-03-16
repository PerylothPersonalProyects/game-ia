/**
 * LocalStorageAdapter - Implementación de IGameRepository
 * 
 * Adapter que usa localStorage para persistencia local.
 * Implementa el puerto IGameRepository definido en la capa de puertos.
 */

import type { GameState } from '../../types';
import type { IGameRepository } from '../../ports';

const STORAGE_KEY = 'idle-clicker-game';

// ============================================
// ADAPTER
// ============================================

export class LocalStorageAdapter implements IGameRepository {
  async save(state: GameState): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  async load(): Promise<GameState | null> {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    try {
      return JSON.parse(saved) as GameState;
    } catch {
      return null;
    }
  }

  async delete(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }

  async hasData(): Promise<boolean> {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }
}

// ============================================
// INSTANCIA ÚNICA (Singleton)
// ============================================

export const localStorageAdapter = new LocalStorageAdapter();
