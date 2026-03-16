// ============================================
// CASO DE USO: UC-004 - Generar Ingresos Pasivos (Idle)
// ============================================

import type { PlayerRepository } from '../ports/index.js';
import { GameCalculator } from '../domain/services/GameCalculator.js';
import type { OfflineProgressResult } from '../domain/entities/index.js';

/**
 * Calcular y aplicar ingresos pasivos (offline progress)
 */
export class CalculateOfflineProgressUseCase {
  constructor(
    private playerRepo: PlayerRepository,
  ) {}

  async execute(playerId: string): Promise<OfflineProgressResult> {
    // 1. Obtener jugador
    const player = await this.playerRepo.findById(playerId);
    if (!player) {
      throw new Error(`Player not found: ${playerId}`);
    }

    // 2. Si no tiene income pasivo, retornar 0
    if (player.coinsPerSecond === 0) {
      return { earned: 0, newCoins: player.coins };
    }

    // 3. Calcular ingresos offline
    const result = GameCalculator.calculateOfflineProgress(player);

    // 4. Si hay ganancias, actualizar los coins
    if (result.earned > 0) {
      await this.playerRepo.updateCoins(playerId, result.earned);
    }

    return result;
  }
}
