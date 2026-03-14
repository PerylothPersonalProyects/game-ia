// DTOs para el Idle Game - Alineados con el frontend

// ============================================
// TIPOS PRINCIPALES
// ============================================

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

// Estado del juego (compatible con frontend)
export interface GameState {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  upgrades: Upgrade[];
}

// Estado interno del servidor (más detallado)
export interface PlayerState {
  id: string;
  coins: number;
  clickPower: number;
  passiveIncome: number;
  lastUpdate: number;
}

// Upgrade interno del servidor
export interface ServerUpgrade {
  id: string;
  level: number;
  cost: number;
  multiplier: number;
}

// ============================================
// CONFIGURACIÓN DE UPGRADES
// ============================================

export interface UpgradeConfig {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  effect: number;
  maxLevel: number;
  type: 'click' | 'passive';
  enabled?: boolean;
}

// Configuración por defecto (fallback si no hay DB)
export const UPGRADE_CONFIGS: UpgradeConfig[] = [
  // Click upgrades
  {
    id: 'click_1',
    name: 'Dedo Rápido',
    description: 'Mejora tu dedo para hacer clicks más rápidos',
    baseCost: 10,
    costMultiplier: 1.5,
    effect: 1,
    maxLevel: 100,
    type: 'click',
  },
  {
    id: 'click_2',
    name: 'Mano Firme',
    description: 'Tu mano es más precisa y fuerte',
    baseCost: 100,
    costMultiplier: 1.6,
    effect: 5,
    maxLevel: 50,
    type: 'click',
  },
  {
    id: 'click_3',
    name: 'Poder Digital',
    description: 'Tus dedos tienen poder sobrenatural',
    baseCost: 1000,
    costMultiplier: 1.7,
    effect: 25,
    maxLevel: 25,
    type: 'click',
  },
  // Passive upgrades
  {
    id: 'passive_1',
    name: 'Inversor Novato',
    description: 'Empieza a ganar dinero automáticamente',
    baseCost: 50,
    costMultiplier: 1.5,
    effect: 1,
    maxLevel: 100,
    type: 'passive',
  },
  {
    id: 'passive_2',
    name: 'Emprendedor',
    description: 'Tus inversiones generan más ganancias',
    baseCost: 500,
    costMultiplier: 1.6,
    effect: 5,
    maxLevel: 50,
    type: 'passive',
  },
  {
    id: 'passive_3',
    name: 'Magnate',
    description: 'Construye un imperio financiero',
    baseCost: 5000,
    costMultiplier: 1.7,
    effect: 25,
    maxLevel: 25,
    type: 'passive',
  },
];

// ============================================
// RESPONSE TYPES
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
}

export interface ClickResponse {
  coins: number;
  clickPower: number;
  coinsPerClick: number;
  totalClicks: number;
}

export interface PurchaseResponse {
  success: boolean;
  newCoins?: number;
  upgradeId?: string;
  newLevel?: number;
  error?: string;
}

export interface UpgradeResponse {
  upgradeId: string;
  newLevel: number;
  newCost: number;
  coinsPerClick: number;
  coinsPerSecond: number;
}

export interface SaveResponse {
  savedAt: number;
  coins: number;
}

export interface UpgradesResponse {
  upgrades: Upgrade[];
}

// ============================================
// REQUEST TYPES
// ============================================

export interface ClickRequest {
  playerId: string;
}

export interface BuyUpgradeRequest {
  playerId: string;
  upgradeId: string;
}

export interface SaveRequest {
  playerId: string;
  state: GameState;
}
