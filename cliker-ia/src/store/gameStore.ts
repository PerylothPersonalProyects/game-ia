import type { GameState, Upgrade } from '../types';

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
  },
];

// Estado inicial SIN upgrades - se cargan del servidor
export const initialState: GameState = {
  coins: 0,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  upgrades: [], // Se carga desde el servidor
};

// ============================================
// HELPERS
// ============================================

export function clickCoins(state: GameState): GameState {
  return {
    ...state,
    coins: state.coins + state.coinsPerClick,
  };
}

export function passiveIncome(state: GameState): GameState {
  return {
    ...state,
    coins: state.coins + state.coinsPerSecond,
  };
}

export function calculateCost(upgrade: Upgrade): number {
  return Math.floor(upgrade.cost * Math.pow(upgrade.costMultiplier, upgrade.purchased));
}

export function purchaseUpgrade(state: GameState, upgradeId: string): GameState {
  const upgradeIndex = state.upgrades.findIndex((u) => u.id === upgradeId);
  if (upgradeIndex === -1) {
    console.log('[purchaseUpgrade] Upgrade no encontrado:', upgradeId);
    return state;
  }

  const upgrade = state.upgrades[upgradeIndex];
  // Usar el costo directamente del upgrade (el servidor lo calcula)
  const cost = upgrade.cost;

  console.log('[purchaseUpgrade] Comprando', upgradeId, '- costo:', cost, 'coins:', state.coins);

  if (state.coins < cost || upgrade.purchased >= upgrade.maxLevel) {
    console.log('[purchaseUpgrade] No se puede comprar - coins:', state.coins, 'cost:', cost, 'maxLevel:', upgrade.maxLevel, 'current:', upgrade.purchased);
    return state;
  }

  // Determinar si es click o passive según el ID
  const isClickUpgrade = upgradeId.startsWith('click_');
  const isPassiveUpgrade = upgradeId.startsWith('passive_');
  
  const newCoinsPerClick = isClickUpgrade
    ? state.coinsPerClick + upgrade.effect
    : state.coinsPerClick;
    
  const newCoinsPerSecond = isPassiveUpgrade
    ? state.coinsPerSecond + upgrade.effect
    : state.coinsPerSecond;

  // Calcular nuevo costo para la siguiente compra
  const newCost = Math.floor(upgrade.cost * upgrade.costMultiplier);

  const newUpgrades = [...state.upgrades];
  newUpgrades[upgradeIndex] = {
    ...upgrade,
    purchased: upgrade.purchased + 1,
    cost: newCost, // Actualizar costo para siguiente compra
  };

  console.log('[purchaseUpgrade] Nueva compra - level:', upgrade.purchased + 1, 'nuevo costo:', newCost);

  return {
    ...state,
    coins: state.coins - cost,
    coinsPerClick: newCoinsPerClick,
    coinsPerSecond: newCoinsPerSecond,
    upgrades: newUpgrades,
  };
}

export function canAfford(state: GameState, upgradeId: string): boolean {
  const upgrade = state.upgrades.find((u) => u.id === upgradeId);
  if (!upgrade) return false;
  const cost = calculateCost(upgrade);
  return state.coins >= cost && upgrade.purchased < upgrade.maxLevel;
}
