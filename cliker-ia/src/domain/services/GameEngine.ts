/**
 * GameEngine - Lógica pura del dominio del juego
 * 
 * Este módulo contiene SOLO lógica de negocio, sin dependencias externas.
 * Todas las funciones son puras y facilmente testeables.
 */

import type { GameState, Upgrade } from '../../types';

// ============================================
// VALUE OBJECTS / HELPERS
// ============================================

/**
 * Mapeo de IDs legacy a IDs modernos (compatibilidad hacia atrás)
 */
const ID_ALIASES: Record<string, string> = {
  'cursor': 'click_1',
  'grandma': 'passive_1',
  'farm': 'passive_2',
  'mine': 'passive_3',
};

/**
 * Resuelve un ID de upgrade (soporta alias legacy)
 */
export function resolveUpgradeId(upgradeId: string): string {
  return ID_ALIASES[upgradeId] || upgradeId;
}

/**
 * Determina si un upgrade es de tipo click basándose en su ID
 */
export function isClickUpgrade(upgradeId: string): boolean {
  const resolved = resolveUpgradeId(upgradeId);
  return resolved.startsWith('click_') || upgradeId === 'cursor';
}

/**
 * Determina si un upgrade es de tipo passive basándose en su ID
 */
export function isPassiveUpgrade(upgradeId: string): boolean {
  const resolved = resolveUpgradeId(upgradeId);
  return resolved.startsWith('passive_') || 
         upgradeId === 'grandma' || 
         upgradeId === 'farm' || 
         upgradeId === 'mine';
}

/**
 * Busca un upgrade en el estado (primero en upgrades, luego en shopUpgrades)
 * Si no lo encuentra y es un ID conocido, lo crea y agrega a la lista
 */
export function findOrCreateUpgrade(state: GameState, upgradeId: string): { upgrade: Upgrade | null; isNew: boolean } {
  const resolvedId = resolveUpgradeId(upgradeId);
  
  // Buscar en upgrades primero
  let upgrade = state.upgrades.find((u) => u.id === resolvedId);
  if (upgrade) return { upgrade, isNew: false };
  
  // Buscar en shopUpgrades
  if (state.shopUpgrades) {
    upgrade = state.shopUpgrades.find((u) => u.id === resolvedId);
    if (upgrade) return { upgrade, isNew: false };
  }
  
  // Si es un ID legacy conocido, crear el upgrade
  if (ID_ALIASES[upgradeId]) {
    const newUpgrade = createDefaultUpgrade(resolvedId, upgradeId);
    return { upgrade: newUpgrade, isNew: true };
  }
  
  return { upgrade: null, isNew: false };
}

/**
 * Crea un upgrade por defecto basado en su ID
 */
function createDefaultUpgrade(resolvedId: string, originalId: string): Upgrade {
  const isClick = isClickUpgrade(originalId);
  
  // Mapeo de propiedades por ID
  const defaults: Record<string, { name: string; description: string; cost: number; effect: number; maxLevel: number }> = {
    'click_1': { name: 'Dedo Rápido', description: '+1 moneda por click', cost: 10, effect: 1, maxLevel: 100 },
    'click_2': { name: 'Mano Firme', description: '+5 monedas por click', cost: 100, effect: 5, maxLevel: 50 },
    'click_3': { name: 'Poder Digital', description: '+25 monedas por click', cost: 1000, effect: 25, maxLevel: 25 },
    'passive_1': { name: 'Inversor Novato', description: '+1 moneda por segundo', cost: 50, effect: 1, maxLevel: 100 },
    'passive_2': { name: 'Emprendedor', description: '+5 monedas por segundo', cost: 500, effect: 5, maxLevel: 50 },
    'passive_3': { name: 'Magnate', description: '+25 monedas por segundo', cost: 5000, effect: 25, maxLevel: 25 },
  };
  
  const props = defaults[resolvedId] || { name: 'Unknown', description: '', cost: 10, effect: 1, maxLevel: 100 };
  
  return {
    id: resolvedId,
    name: props.name,
    description: props.description,
    cost: props.cost,
    costMultiplier: 1.5,
    effect: props.effect,
    maxLevel: props.maxLevel,
    purchased: 0,
    type: isClick ? 'click' : 'passive',
  };
}

// Alias para compatibilidad
export const findUpgrade = findOrCreateUpgrade;

// ============================================
// DOMAIN SERVICES
// ============================================

export const GameEngine = {
  /**
   * Efectúa un click del jugador
   * @param state - Estado actual del juego
   * @returns Nuevo estado con las monedas incrementadas
   */
  click(state: GameState): GameState {
    return {
      ...state,
      coins: state.coins + state.coinsPerClick,
    };
  },

  /**
   * Efectúa el ingreso pasivo (coins por segundo)
   * @param state - Estado actual del juego
   * @returns Nuevo estado con las monedas incrementadas
   */
  passiveIncome(state: GameState): GameState {
    return {
      ...state,
      coins: state.coins + state.coinsPerSecond,
    };
  },

  /**
   * Efectúa el ingreso pasivo multiplicado (para batching)
   * @param state - Estado actual del juego
   * @param seconds - Segundos a multiplicar
   * @returns Nuevo estado con las monedas incrementadas
   */
  passiveIncomeMultiplied(state: GameState, seconds: number): GameState {
    return {
      ...state,
      coins: state.coins + (state.coinsPerSecond * seconds),
    };
  },

  /**
   * Compra un upgrade
   * @param state - Estado actual del juego
   * @param upgradeId - ID del upgrade a comprar
   * @returns Nuevo estado con el upgrade comprado, o el mismo estado si no es posible
   */
  purchase(state: GameState, upgradeId: string): GameState {
    const { upgrade, isNew } = findOrCreateUpgrade(state, upgradeId);
    
    if (!upgrade) {
      console.log('[GameEngine] Upgrade no encontrado:', upgradeId);
      return state;
    }

    const { canAfford: canBuy, newCost } = GameEngine.calculatePurchase(state, upgrade);
    
    if (!canBuy) {
      console.log('[GameEngine] No se puede comprar:', upgradeId);
      return state;
    }

    // Determinar tipo de upgrade
    const isClick = isClickUpgrade(upgradeId);
    const isPassive = isPassiveUpgrade(upgradeId);
    
    const newCoinsPerClick = isClick
      ? state.coinsPerClick + upgrade.effect
      : state.coinsPerClick;
      
    const newCoinsPerSecond = isPassive
      ? state.coinsPerSecond + upgrade.effect
      : state.coinsPerSecond;

    // Actualizar el upgrade en la lista correspondiente
    const resolvedId = resolveUpgradeId(upgradeId);
    const newUpgrades = [...state.upgrades];
    const newShopUpgrades = state.shopUpgrades ? [...state.shopUpgrades] : undefined;
    
    // Buscar y actualizar en la lista correcta
    const upgradeIndexInUpgrades = newUpgrades.findIndex((u) => u.id === resolvedId);
    const upgradeIndexInShop = newShopUpgrades ? newShopUpgrades.findIndex((u) => u.id === resolvedId) : -1;
    
    const updatedUpgrade = {
      ...upgrade,
      purchased: upgrade.purchased + 1,
      cost: newCost,
    };
    
    if (upgradeIndexInUpgrades !== -1) {
      newUpgrades[upgradeIndexInUpgrades] = updatedUpgrade;
    } else if (isNew) {
      // Agregar el nuevo upgrade a la lista
      newUpgrades.push(updatedUpgrade);
    } else if (upgradeIndexInShop !== -1 && newShopUpgrades) {
      newShopUpgrades[upgradeIndexInShop] = updatedUpgrade;
    }

    console.log('[GameEngine] Comprado:', upgradeId, '- nuevo nivel:', upgrade.purchased + 1);

    return {
      ...state,
      coins: state.coins - upgrade.cost,
      coinsPerClick: newCoinsPerClick,
      coinsPerSecond: newCoinsPerSecond,
      upgrades: newUpgrades,
      shopUpgrades: newShopUpgrades,
    };
  },

  /**
   * Verifica si se puede comprar un upgrade y calcula el nuevo costo
   */
  calculatePurchase(state: GameState, upgrade: Upgrade): { canAfford: boolean; newCost: number } {
    const cost = upgrade.cost;
    const canBuy = state.coins >= cost && upgrade.purchased < upgrade.maxLevel;
    const newCost = Math.floor(upgrade.cost * upgrade.costMultiplier);
    
    return { canAfford: canBuy, newCost };
  },

  /**
   * Verifica si el jugador puede comprar un upgrade
   */
  canAfford(state: GameState, upgradeId: string): boolean {
    const { upgrade } = findOrCreateUpgrade(state, upgradeId);
    
    if (!upgrade) return false;
    
    return state.coins >= upgrade.cost && upgrade.purchased < upgrade.maxLevel;
  },

  /**
   * Inicializa el estado del juego con valores por defecto
   */
  createInitialState(): GameState {
    return {
      coins: 0,
      coinsPerClick: 1,
      coinsPerSecond: 0,
      upgrades: [],
      shopUpgrades: [],
    };
  },

  /**
   * Reinicia el estado del juego (ignora el estado actual)
   */
  reset(_state: GameState): GameState {
    return GameEngine.createInitialState();
  },
};

// ============================================
// EXPORTS CONVENIENCE (funciones sueltas para backward compatibility)
// ============================================

export const clickCoins = GameEngine.click;
export const passiveIncome = GameEngine.passiveIncome;
export const purchaseUpgrade = GameEngine.purchase;
export const canAfford = GameEngine.canAfford;
export const findUpgradeInState = findUpgrade;
