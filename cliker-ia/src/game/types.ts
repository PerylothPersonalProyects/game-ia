/**
 * Tipos para la comunicación entre Phaser (View) y React (Controller/Store)
 * 
 * Arquitectura:
 * - React: Maneja el estado, lógica de negocio, y comunicación con servidor
 * - Phaser: Solo renderiza lo que React le indica
 * - Phaser notifica a React de eventos (clicks)
 * - React actualiza el estado y le dice a Phaser qué renderizar
 */

import type { GameState } from '../types';

// ============================================
// EVENTOS: Phaser → React
// ============================================

export interface GameEvents {
  onClick: () => void;
  onPurchaseUpgrade: (upgradeId: string) => void;
  onSaveGame: () => void;
  onLoadGame: () => void;
}

// ============================================
// RENDER DATA: React → Phaser  
// ============================================

export interface RenderUpgrade {
  id: string;
  name: string;
  description: string;
  level: number;
  cost: number;
  canAfford: boolean;
}

export interface RenderStats {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
}

export interface RenderData {
  stats: RenderStats;
  upgrades: RenderUpgrade[];
}

// ============================================
// CONVERTIDORES: GameState → RenderData
// ============================================

export function toRenderData(state: GameState): RenderData {
  return {
    stats: {
      coins: Math.floor(state.coins),
      coinsPerClick: state.coinsPerClick,
      coinsPerSecond: state.coinsPerSecond,
    },
    upgrades: state.upgrades.map(u => ({
      id: u.id,
      name: u.name,
      description: u.description,
      level: u.purchased,
      cost: Math.floor(u.cost * Math.pow(u.costMultiplier, u.purchased)),
      canAfford: state.coins >= Math.floor(u.cost * Math.pow(u.costMultiplier, u.purchased)) && u.purchased < u.maxLevel,
    })),
  };
}

// ============================================
// API DEL JUEGO (para el servidor - futuro)
// ============================================

export interface GameAPI {
  // Estado
  getState: () => GameState;
  
  // Acciones del jugador
  click: () => void;
  buyUpgrade: (upgradeId: string) => boolean;
  
  // Persistencia
  save: () => Promise<void>;
  load: () => Promise<void>;
  
  // Suscripción a cambios
  subscribe: (callback: (state: GameState) => void) => () => void;
}

// ============================================
// EVENTOS DEL SERVIDOR (futuro)
// ============================================

export interface ServerEvents {
  onStateSync: (state: GameState) => void;
  onError: (error: string) => void;
  onConnected: () => void;
  onDisconnected: () => void;
}
