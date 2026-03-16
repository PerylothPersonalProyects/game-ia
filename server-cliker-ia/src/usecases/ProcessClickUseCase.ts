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

    // 2. Calcular resultado del click
    const result = GameCalculator.processClick(player);

    // 3. Actualizar coins en la base de datos
    await this.playerRepo.updateCoins(playerId, result.earned);

    // 4. Retornar resultado
    return {
      earned: result.earned,
      newCoins: player.coins + result.earned,
      coinsPerClick: result.coinsPerClick,
    };
  }
}
