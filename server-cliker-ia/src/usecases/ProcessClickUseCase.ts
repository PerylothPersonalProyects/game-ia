// ============================================
// CASO DE USO: UC-002 - Hacer Click para Obtener Coins
// ============================================

import type { PlayerRepository, UpgradeConfigRepository } from '../ports/index.js';
import { GameCalculator } from '../domain/services/GameCalculator.js';
import type { ClickResult } from '../domain/entities/index.js';

/**
 * Procesar un click del jugador
 */
export class ProcessClickUseCase {
  constructor(
    private playerRepo: PlayerRepository,
  ) {}

  async execute(playerId: string): Promise<ClickResult> {
    // 1. Obtener jugador
    const player = await this.playerRepo.findById(playerId);
    if (!player) {
      throw new Error(`Player not found: ${playerId}`);
    }

    // 2. Calcular resultado del click (incluye passive + click earnings)
    const result = GameCalculator.processClick(player);

    // 3. Actualizar coins en la base de datos
    const updatedPlayer = await this.playerRepo.updateCoins(playerId, result.earned);

    // 4. Retornar resultado con breakdown completo
    return {
      earned: result.earned,
      newCoins: updatedPlayer!.coins,
      coinsPerClick: result.coinsPerClick,
      passiveEarned: result.passiveEarned,
      clickEarned: result.clickEarned,
    };
  }
}
