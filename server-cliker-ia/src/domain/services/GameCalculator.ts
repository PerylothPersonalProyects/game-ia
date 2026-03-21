// ============================================
// SERVICIOS DEL DOMINIO - LÓGICA PURA DE NEGOCIO
// ============================================

import type { 
  Upgrade, 
  UpgradeConfig, 
  Player, 
  GameState, 
  SyncData,
  ClickResult,
  PurchaseResult,
  OfflineProgressResult 
} from '../entities/index.js';

/**
 * GameCalculator - Lógica pura de cálculo del juego
 * NO tiene dependencias externas - solo opera con tipos del dominio
 */
export class GameCalculator {
  // ============================================
  // CONSTANTES
  // ============================================
  
  static readonly BASE_COINS_PER_CLICK = 1;
  static readonly BASE_COINS_PER_SECOND = 0;
  static readonly MAX_OFFLINE_SECONDS = 8 * 60 * 60; // 8 horas

  // ============================================
  // CÁLCULOS DE COSTO
  // ============================================

  /**
   * Calcular el costo de un upgrade dado su nivel
   * Fórmula: costo = baseCost * (costMultiplier ^ purchased)
   */
  static calculateUpgradeCost(
    baseCost: number, 
    costMultiplier: number, 
    purchased: number
  ): number {
    return Math.floor(baseCost * Math.pow(costMultiplier, purchased));
  }

  /**
   * Calcular el siguiente costo de un upgrade
   */
  static calculateNextCost(upgrade: Upgrade, config: UpgradeConfig): number {
    const nextPurchased = upgrade.purchased + 1;
    return this.calculateUpgradeCost(
      config.baseCost,
      config.costMultiplier,
      nextPurchased
    );
  }

  // ============================================
  // CÁLCULOS DE ESTADÍSTICAS
  // ============================================

  /**
   * Calcular coinsPerClick desde los upgrades comprados
   */
  static calculateCoinsPerClick(upgrades: Upgrade[], configs: UpgradeConfig[]): number {
    let total = this.BASE_COINS_PER_CLICK;
    
    for (const upgrade of upgrades) {
      if (upgrade.purchased > 0) {
        const config = configs.find(c => c.id === upgrade.id);
        if (config && config.type === 'click') {
          total += config.effect * upgrade.purchased;
        }
      }
    }
    
    return total;
  }

  /**
   * Calcular coinsPerSecond desde los upgrades comprados
   */
  static calculateCoinsPerSecond(upgrades: Upgrade[], configs: UpgradeConfig[]): number {
    let total = this.BASE_COINS_PER_SECOND;
    
    for (const upgrade of upgrades) {
      if (upgrade.purchased > 0) {
        const config = configs.find(c => c.id === upgrade.id);
        if (config && config.type === 'passive') {
          total += config.effect * upgrade.purchased;
        }
      }
    }
    
    return total;
  }

  // ============================================
  // VALIDACIONES
  // ============================================

  /**
   * Validar si el jugador puede comprar un upgrade
   */
  static canAffordUpgrade(player: Player, upgrade: Upgrade): boolean {
    return player.coins >= upgrade.cost;
  }

  /**
   * Validar si el upgrade no ha alcanzado el nivel máximo
   */
  static canLevelUp(upgrade: Upgrade, config: UpgradeConfig): boolean {
    return upgrade.purchased < config.maxLevel;
  }

  /**
   * Validar compra completa
   */
  static validatePurchase(
    player: Player, 
    upgrade: Upgrade, 
    config: UpgradeConfig
  ): { valid: boolean; error?: string } {
    if (!this.canAffordUpgrade(player, upgrade)) {
      return { valid: false, error: 'Insufficient coins' };
    }
    if (!this.canLevelUp(upgrade, config)) {
      return { valid: false, error: 'Max level reached' };
    }
    return { valid: true };
  }

  // ============================================
  // PROCESOS DE NEGOCIO
  // ============================================

  /**
   * Procesar un click - retorna el resultado
   * FIX: Ahora incluye ingresos pasivos acumulados desde el último click/acción
   */
  static processClick(player: Player): ClickResult {
    const now = Date.now();
    
    // Calcular ingresos pasivos acumulados desde la última acción
    const secondsSinceLastAction = Math.max(0, Math.floor((now - player.lastUpdate) / 1000));
    const passiveEarned = player.coinsPerSecond * secondsSinceLastAction;
    const clickEarned = player.coinsPerClick;
    const earned = clickEarned + passiveEarned;
    const newCoins = player.coins + earned;
    
    return {
      earned,
      newCoins,
      coinsPerClick: player.coinsPerClick,
      passiveEarned,
      clickEarned,
    };
  }

  /**
   * Calcular ingresos pasivos offline
   */
  static calculateOfflineProgress(player: Player): OfflineProgressResult {
    if (player.coinsPerSecond === 0) {
      return { earned: 0, newCoins: player.coins };
    }

    const now = Date.now();
    const deltaSeconds = Math.floor((now - player.lastUpdate) / 1000);
    const offlineSeconds = Math.min(deltaSeconds, this.MAX_OFFLINE_SECONDS);
    
    const earned = Math.floor(player.coinsPerSecond * offlineSeconds);
    const newCoins = player.coins + earned;

    return { earned, newCoins };
  }

  /**
   * Aplicar compra de upgrade - retorna el jugador actualizado
   * NO valida - asume que ya se validó
   */
  static applyUpgradePurchase(
    player: Player,
    upgrade: Upgrade,
    config: UpgradeConfig
  ): Player {
    const newPurchased = upgrade.purchased + 1;
    const newCostMultiplier = Math.pow(config.costMultiplier, newPurchased);
    const newCost = this.calculateUpgradeCost(
      config.baseCost,
      config.costMultiplier,
      newPurchased
    );

    // Crear copia del jugador
    const updatedPlayer: Player = {
      ...player,
      coins: player.coins - upgrade.cost,
      upgrades: player.upgrades.map(u => {
        if (u.id === upgrade.id) {
          return {
            ...u,
            purchased: newPurchased,
            costMultiplier: newCostMultiplier,
            cost: newCost,
          };
        }
        return u;
      }),
      coinsPerClick: config.type === 'click' 
        ? player.coinsPerClick + config.effect 
        : player.coinsPerClick,
      coinsPerSecond: config.type === 'passive' 
        ? player.coinsPerSecond + config.effect 
        : player.coinsPerSecond,
      lastUpdate: Date.now(),
    };

    return updatedPlayer;
  }

  /**
   * Crear estado del juego desde un jugador
   */
  static toGameState(player: Player): GameState {
    return {
      coins: player.coins,
      coinsPerClick: player.coinsPerClick,
      coinsPerSecond: player.coinsPerSecond,
      upgrades: player.upgrades,
      shopUpgrades: player.shopUpgrades,
    };
  }

  /**
   * Crear datos de sincronización
   */
  static toSyncData(player: Player): SyncData {
    return {
      coins: player.coins,
      coinsPerClick: player.coinsPerClick,
      coinsPerSecond: player.coinsPerSecond,
      lastSync: Date.now(),
    };
  }

  /**
   * Crear un nuevo jugador con valores por defecto
   */
  static createNewPlayer(playerId: string, shopUpgrades: Upgrade[]): Player {
    return {
      id: playerId,
      coins: 0,
      coinsPerClick: this.BASE_COINS_PER_CLICK,
      coinsPerSecond: this.BASE_COINS_PER_SECOND,
      upgrades: [],
      shopUpgrades,
      lastUpdate: Date.now(),
    };
  }

  /**
   * Agregar un upgrade al inventario del jugador
   */
  static addUpgradeToInventory(
    player: Player,
    config: UpgradeConfig
  ): Player {
    const newUpgrade: Upgrade = {
      id: config.id,
      name: config.name,
      description: config.description,
      cost: config.baseCost,
      costMultiplier: 1,
      effect: config.effect,
      maxLevel: config.maxLevel,
      purchased: 0,
    };

    return {
      ...player,
      upgrades: [...player.upgrades, newUpgrade],
    };
  }
}
