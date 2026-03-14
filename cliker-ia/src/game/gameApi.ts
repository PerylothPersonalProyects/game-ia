/**
 * API de comunicación entre Phaser y React
 * 
 * Phaser (Vista) <-> React (Controlador)
 */

import type { GameState, Upgrade } from '../types';

// ============================================
// EVENTOS: Phaser -> React
// ============================================

export interface GameEvents {
  onClick: () => void;
  onPurchaseUpgrade: (upgradeId: string) => void;
  onSaveGame: () => void;
}

// ============================================
// DATOS DE RENDERIZADO: React -> Phaser
// ============================================

export interface RenderUpgradeData {
  id: string;
  name: string;
  description: string;
  level: number;
  cost: number;
  canAfford: boolean;
}

export interface RenderStatsData {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
}

export interface RenderData {
  stats: RenderStatsData;
  upgrades: RenderUpgradeData[];
}

// ============================================
// CONVERTIDOR: GameState -> RenderData
// ============================================

export function stateToRenderData(state: GameState): RenderData {
  // Convertir upgrades del estado a datos de renderizado
  const upgrades: RenderUpgradeData[] = state.upgrades.map(u => {
    // El costo ya está calculado en el estado (del servidor o local)
    // Solo usamos el costo directamente
    const cost = u.cost;
    const canAfford = state.coins >= cost && u.purchased < u.maxLevel;
    
    return {
      id: u.id,
      name: u.name,
      description: u.description,
      level: u.purchased,
      cost: cost,
      canAfford,
    };
  });

  return {
    stats: {
      coins: Math.floor(state.coins),
      coinsPerClick: state.coinsPerClick,
      coinsPerSecond: state.coinsPerSecond,
    },
    upgrades,
  };
}
