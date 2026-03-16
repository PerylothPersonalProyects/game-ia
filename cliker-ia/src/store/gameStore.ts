import type { GameState, Upgrade } from '../types';
import { GameEngine } from '../domain/services/GameEngine';

// Re-export del dominio para uso externo
export { GameEngine, resolveUpgradeId, isClickUpgrade, isPassiveUpgrade } from '../domain/services/GameEngine';

// ============================================
// UPGRADES - Coinciden con el backend
// ============================================

export const INITIAL_UPGRADES: Upgrade[] = [
  // Click upgrades (del backend)
  {
    id: 'click_1',
    name: 'Dedo Rápido',
    description: '+1 moneda por click',
    cost: 10,
    costMultiplier: 1.5,
    effect: 1,
    maxLevel: 100,
    purchased: 0,
    type: 'click',
  },
  {
    id: 'click_2',
    name: 'Mano Firme',
    description: '+5 monedas por click',
    cost: 100,
    costMultiplier: 1.6,
    effect: 5,
    maxLevel: 50,
    purchased: 0,
    type: 'click',
  },
  {
    id: 'click_3',
    name: 'Poder Digital',
    description: '+25 monedas por click',
    cost: 1000,
    costMultiplier: 1.7,
    effect: 25,
    maxLevel: 25,
    purchased: 0,
    type: 'click',
  },
  // Passive upgrades (del backend)
  {
    id: 'passive_1',
    name: 'Inversor Novato',
    description: '+1 moneda por segundo',
    cost: 50,
    costMultiplier: 1.5,
    effect: 1,
    maxLevel: 100,
    purchased: 0,
    type: 'passive',
  },
  {
    id: 'passive_2',
    name: 'Emprendedor',
    description: '+5 monedas por segundo',
    cost: 500,
    costMultiplier: 1.6,
    effect: 5,
    maxLevel: 50,
    purchased: 0,
    type: 'passive',
  },
  {
    id: 'passive_3',
    name: 'Magnate',
    description: '+25 monedas por segundo',
    cost: 5000,
    costMultiplier: 1.7,
    effect: 25,
    maxLevel: 25,
    purchased: 0,
    type: 'passive',
  },
];

// Estado inicial SIN upgrades - se cargan del servidor
export const initialState: GameState = {
  coins: 0,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  upgrades: [], // Se carga desde el servidor (upgrades comprados)
  shopUpgrades: [], // Se carga desde el servidor (upgrades disponibles en shop)
};

// ============================================
// HELPERS - Delegados al dominio
// ============================================

export function clickCoins(state: GameState): GameState {
  return GameEngine.click(state);
}

export function passiveIncome(state: GameState): GameState {
  return GameEngine.passiveIncome(state);
}

export function calculateCost(upgrade: Upgrade): number {
  return Math.floor(upgrade.cost * Math.pow(upgrade.costMultiplier, upgrade.purchased));
}

export function purchaseUpgrade(state: GameState, upgradeId: string): GameState {
  return GameEngine.purchase(state, upgradeId);
}

export function canAfford(state: GameState, upgradeId: string): boolean {
  return GameEngine.canAfford(state, upgradeId);
}
