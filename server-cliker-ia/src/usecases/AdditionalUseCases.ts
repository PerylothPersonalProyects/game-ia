// ============================================
// CASOS DE USO ADICIONALES (UC-005 a UC-010)
// ============================================

import type { PlayerRepository, UpgradeConfigRepository } from '../ports/index.js';
import type { Upgrade, UpgradeConfig, GameState, SyncData } from '../domain/entities/index.js';
import { GameCalculator } from '../domain/services/GameCalculator.js';

// ============================================
// UC-005: Obtener Shop Upgrades
// ============================================

export class GetShopUpgradesUseCase {
  constructor(
    private playerRepo: PlayerRepository,
    private upgradeConfigRepo: UpgradeConfigRepository
  ) {}

  async execute(playerId: string): Promise<Upgrade[]> {
    const player = await this.playerRepo.findById(playerId);
    if (!player) {
      throw new Error(`Player not found: ${playerId}`);
    }
    return player.shopUpgrades || [];
  }
}

// ============================================
// UC-006: Comprar Upgrade del Shop
// ============================================

export class BuyShopUpgradeUseCase {
  constructor(
    private playerRepo: PlayerRepository,
    private upgradeConfigRepo: UpgradeConfigRepository
  ) {}

  async execute(playerId: string, upgradeId: string): Promise<{ success: boolean; error?: string }> {
    const player = await this.playerRepo.findById(playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    const shopUpgrade = player.shopUpgrades?.find(u => u.id === upgradeId);
    if (!shopUpgrade) {
      return { success: false, error: 'Upgrade not found in shop' };
    }

    if (player.coins < shopUpgrade.cost) {
      return { success: false, error: 'Insufficient coins' };
    }

    // Buscar si ya tiene el upgrade
    const existingUpgrade = player.upgrades.find(u => u.id === upgradeId);
    const config = await this.upgradeConfigRepo.findById(upgradeId);
    
    if (!config) {
      return { success: false, error: 'Upgrade config not found' };
    }

    // Si ya tiene el upgrade, verificar nivel máximo
    if (existingUpgrade && existingUpgrade.purchased >= config.maxLevel) {
      return { success: false, error: 'Max level reached' };
    }

    // Actualizar jugador
    let newUpgrades: Upgrade[];
    let newCoinsPerClick = player.coinsPerClick;
    let newCoinsPerSecond = player.coinsPerSecond;

    if (existingUpgrade) {
      // Aumentar nivel
      existingUpgrade.purchased += 1;
      existingUpgrade.costMultiplier = Math.pow(config.costMultiplier, existingUpgrade.purchased);
      existingUpgrade.cost = GameCalculator.calculateUpgradeCost(
        config.baseCost,
        config.costMultiplier,
        existingUpgrade.purchased
      );
      newUpgrades = [...player.upgrades];
    } else {
      // Agregar nuevo upgrade
      newUpgrades = [...player.upgrades, {
        ...shopUpgrade,
        purchased: 1,
        costMultiplier: config.costMultiplier,
        cost: GameCalculator.calculateUpgradeCost(config.baseCost, config.costMultiplier, 1),
      }];
    }

    // Aplicar efecto
    if (config.type === 'click') {
      newCoinsPerClick += config.effect;
    } else {
      newCoinsPerSecond += config.effect;
    }

    // Remover del shop y agregar nuevo
    const newShopUpgrades = (player.shopUpgrades || []).filter(u => u.id !== upgradeId);
    
    // Agregar nuevo upgrade al shop
    const purchasedIds = newUpgrades.map(u => u.id);
    const shopIds = newShopUpgrades.map(u => u.id);
    const excludeIds = [...purchasedIds, ...shopIds];
    
    const allConfigs = await this.upgradeConfigRepo.findAllEnabled();
    const availableConfigs = allConfigs.filter(c => !excludeIds.includes(c.id));
    
    if (availableConfigs.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableConfigs.length);
      const newConfig = availableConfigs[randomIndex];
      newShopUpgrades.push({
        id: newConfig.id,
        name: newConfig.name,
        description: newConfig.description,
        cost: newConfig.baseCost,
        costMultiplier: 1,
        effect: newConfig.effect,
        maxLevel: newConfig.maxLevel,
        purchased: 0,
      });
    }

    await this.playerRepo.update({
      ...player,
      coins: player.coins - shopUpgrade.cost,
      upgrades: newUpgrades,
      shopUpgrades: newShopUpgrades,
      coinsPerClick: newCoinsPerClick,
      coinsPerSecond: newCoinsPerSecond,
      lastUpdate: Date.now(),
    });

    return { success: true };
  }
}

// ============================================
// UC-009: Guardar Estado del Juego
// ============================================

export class SaveGameUseCase {
  constructor(
    private playerRepo: PlayerRepository,
    private upgradeConfigRepo: UpgradeConfigRepository
  ) {}

  async execute(playerId: string, state: GameState): Promise<{ success: boolean }> {
    const player = await this.playerRepo.findById(playerId);
    if (!player) {
      throw new Error(`Player not found: ${playerId}`);
    }

    // Recalcular stats desde los upgrades (no aceptar del cliente)
    const configs = await this.upgradeConfigRepo.findAllEnabled();
    
    const validUpgrades = state.upgrades.filter(u => u.purchased >= 0);
    
    const newCoinsPerClick = GameCalculator.calculateCoinsPerClick(validUpgrades, configs);
    const newCoinsPerSecond = GameCalculator.calculateCoinsPerSecond(validUpgrades, configs);

    // Actualizar costos
    const updatedUpgrades = validUpgrades.map(u => {
      const config = configs.find(c => c.id === u.id);
      if (!config) return u;
      
      const costMultiplier = Math.pow(config.costMultiplier, u.purchased);
      const cost = GameCalculator.calculateUpgradeCost(config.baseCost, costMultiplier, u.purchased);
      
      return { ...u, costMultiplier, cost };
    });

    await this.playerRepo.update({
      ...player,
      coins: state.coins,
      upgrades: updatedUpgrades,
      coinsPerClick: newCoinsPerClick,
      coinsPerSecond: newCoinsPerSecond,
      lastUpdate: Date.now(),
    });

    return { success: true };
  }
}

// ============================================
// UC-010: Obtener Datos de Sincronización
// ============================================

export class GetSyncDataUseCase {
  constructor(
    private playerRepo: PlayerRepository,
  ) {}

  async execute(playerId: string): Promise<SyncData> {
    const player = await this.playerRepo.findById(playerId);
    if (!player) {
      throw new Error(`Player not found: ${playerId}`);
    }

    return GameCalculator.toSyncData(player);
  }
}
