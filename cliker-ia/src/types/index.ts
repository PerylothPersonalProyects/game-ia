export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  costMultiplier: number;
  effect: number;
  maxLevel: number;
  purchased: number;
  type: 'click' | 'passive';
}

export interface GameState {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  upgrades: Upgrade[];       // Upgrades comprados por el jugador
  shopUpgrades?: Upgrade[];  // Upgrades disponibles en el shop (máx 4)
}

export interface UpgradeEffect {
  type: 'click' | 'passive';
  value: number;
}
