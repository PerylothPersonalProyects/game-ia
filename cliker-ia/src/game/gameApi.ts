/**
 * API de comunicación entre Phaser y React
 * 
 * Phaser (Vista) <-> React (Controlador)
 */

import type { GameState } from '../types';

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
  maxLevel: number;
  cost: number;
  canAfford: boolean;
  type: 'click' | 'passive';
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
  // Usar shopUpgrades si están disponibles (nuevo sistema)
  // Si no, usar upgrades como fallback (sistema antiguo)
  const displayUpgrades = state.shopUpgrades && state.shopUpgrades.length > 0
    ? state.shopUpgrades 
    : state.upgrades;

  // Convertir upgrades del estado a datos de renderizado
  const upgrades: RenderUpgradeData[] = displayUpgrades.map(u => {
    // El costo ya está calculado en el estado (del servidor o local)
    // Solo usamos el costo directamente
    const cost = u.cost;
    // Si maxLevel no está definido, asumir infinito (9999)
    const maxLevel = u.maxLevel || 9999;
    // Si type no está definido, asumir 'click' por defecto
    const upgradeType = u.type || 'click';
    const canAfford = state.coins >= cost && u.purchased < maxLevel;
    
    console.log('[gameApi] Render -', u.name, 'Lv:', u.purchased + '/' + maxLevel, 'coste:', cost, 'puede:', canAfford);
    
    return {
      id: u.id,
      name: u.name,
      description: u.description,
      level: u.purchased,
      maxLevel: maxLevel,
      cost: cost,
      canAfford,
      type: upgradeType,
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
