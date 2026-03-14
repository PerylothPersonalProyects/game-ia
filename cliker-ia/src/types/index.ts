export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  costMultiplier: number;
  effect: number;
  maxLevel: number;
  purchased: number;
}

export interface GameState {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  upgrades: Upgrade[];
}

export interface UpgradeEffect {
  type: 'click' | 'passive';
  value: number;
}
