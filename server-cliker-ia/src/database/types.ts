export interface Player {
  id: string;
  playerId: string;
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  upgrades: any[];
  shopUpgrades: any[];
  lastUpdate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpgradeConfig {
  id: string;
  name: string;
  description: string | null;
  baseCost: number;
  costMultiplier: number;
  effect: number;
  maxLevel: number;
  type: 'click' | 'passive';
  tier: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerGameState {
  playerId: string;
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  upgrades: any[];
  shopUpgrades: any[];
  lastUpdate: number;
}
