// ============================================
// CASO DE USO: UC-003 - Comprar Upgrade (Inventario)
// ============================================

import type { PlayerRepository, UpgradeConfigRepository } from '../ports/index.js';
import { GameCalculator } from '../domain/services/GameCalculator.js';
import type { Upgrade } from '../domain/entities/index.js';

export interface PurchaseUpgradeResult {
  success: boolean;
  upgrade?: Upgrade;
  error?: string;
}

/**
 * Comprar un upgrade desde el inventario del jugador
 */
export class PurchaseUpgradeUseCase {
  constructor(
    private playerRepo: PlayerRepository,
    private upgradeConfigRepo: UpgradeConfigRepository
  ) {}

  async execute(playerId: string, upgradeId: string): Promise<PurchaseUpgradeResult> {
    // 1. Obtener jugador
    const player = await this.playerRepo.findById(playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    // 2. Buscar el upgrade en el inventario
    const upgrade = player.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) {
      return { success: false, error: 'Upgrade not found' };
    }

    // 3. Obtener la configuración del upgrade
    const config = await this.upgradeConfigRepo.findById(upgradeId);
    if (!config) {
      return { success: false, error: 'Upgrade config not found' };
    }

    // 4. Validar compra
    const validation = GameCalculator.validatePurchase(player, upgrade, config);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // 5. Calcular nuevos valores
    const newPurchased = upgrade.purchased + 1;
    const newCostMultiplier = Math.pow(config.costMultiplier, newPurchased);
    const newCost = GameCalculator.calculateUpgradeCost(
      config.baseCost,
      config.costMultiplier,
      newPurchased
    );

    // 6. Actualizar el upgrade
    const updatedUpgrades = player.upgrades.map(u => {
      if (u.id === upgradeId) {
        return {
          ...u,
          purchased: newPurchased,
          costMultiplier: newCostMultiplier,
          cost: newCost,
        };
      }
      return u;
    });

    // 7. Calcular nuevos stats
    const newCoinsPerClick = config.type === 'click'
      ? player.coinsPerClick + config.effect
      : player.coinsPerClick;

    const newCoinsPerSecond = config.type === 'passive'
      ? player.coinsPerSecond + config.effect
      : player.coinsPerSecond;

    // 8. Guardar jugador actualizado
    const updatedPlayer = {
      ...player,
      coins: player.coins - upgrade.cost,
      upgrades: updatedUpgrades,
      coinsPerClick: newCoinsPerClick,
      coinsPerSecond: newCoinsPerSecond,
      lastUpdate: Date.now(),
    };

    await this.playerRepo.update(updatedPlayer);

    return {
      success: true,
      upgrade: updatedUpgrades.find(u => u.id === upgradeId),
    };
  }
}
