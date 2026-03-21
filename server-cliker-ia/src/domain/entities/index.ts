// ============================================
// ENTIDADES DEL DOMINIO
// ============================================

/**
 * Upgrade - Representa una mejora que el jugador puede comprar
 */
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  costMultiplier: number;
  effect: number;
  maxLevel: number;
  purchased: number; // nivel actual
}

export type UpgradeType = 'click' | 'passive';

/**
 * UpgradeConfig - Configuración de una mejora (definida por el admin)
 */
export interface UpgradeConfig {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  effect: number;
  maxLevel: number;
  type: UpgradeType;
  enabled?: boolean;
}

/**
 * Player - Entidad principal del jugador
 */
export interface Player {
  id: string; // playerId
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  upgrades: Upgrade[]; // upgrades comprados
  shopUpgrades: Upgrade[]; // upgrades disponibles en shop
  lastUpdate: number; // timestamp
}

/**
 * GameState - Estado del juego para el cliente
 */
export interface GameState {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  upgrades: Upgrade[];
  shopUpgrades?: Upgrade[];
}

/**
 * SyncData - Datos para sincronización
 */
export interface SyncData {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  lastSync: number;
}

// ============================================
// VALUE OBJECTS
// ============================================

/**
 * Resultado de un click
 * FIX: Ahora incluye breakdown de earnings (pasivo + click)
 */
export interface ClickResult {
  earned: number;        // Total ganado (passiveEarned + clickEarned)
  newCoins: number;      // Coins totales después del click
  coinsPerClick: number; // Power de click
  passiveEarned: number; // Ingresos pasivos desde el último click
  clickEarned: number;    // Ganancias del click en sí
}

/**
 * Resultado de compra de upgrade
 */
export interface PurchaseResult {
  success: boolean;
  newCoins?: number;
  upgrade?: Upgrade;
  error?: string;
}

/**
 * Resultado de ingresos pasivos
 */
export interface OfflineProgressResult {
  earned: number;
  newCoins: number;
}
