// ============================================
// CASO DE USO: UC-001 - Iniciar Sesión del Jugador
// ============================================

import type { Player, GameState, Upgrade } from '../domain/entities/index.js';
import type { PlayerRepository, UpgradeConfigRepository } from '../ports/index.js';
import { GameCalculator } from '../domain/services/GameCalculator.js';

/**
 * Obtener o crear un jugador y retornar su estado de juego
 */
export class GetOrCreatePlayerUseCase {
  constructor(
    private playerRepo: PlayerRepository,
    private upgradeConfigRepo: UpgradeConfigRepository
  ) {}

  async execute(playerId: string): Promise<GameState> {
    // 1. Buscar jugador existente
    let player = await this.playerRepo.findById(playerId);
    
    if (!player) {
      // 2. Crear nuevo jugador
      const configs = await this.upgradeConfigRepo.findAllEnabled();
      
      // Obtener upgrades aleatorios para el shop (garantizando Tier 1)
      const shopUpgrades = this.getRandomShopUpgrades(configs, 4);
      
      player = GameCalculator.createNewPlayer(playerId, shopUpgrades);
      await this.playerRepo.save(player);
    }
    
    // 3. Retornar estado del juego
    return GameCalculator.toGameState(player);
  }

  /**
   * Obtener upgrades aleatorios para el shop
   * Garantiza al menos 1 Tier 1 para nuevos jugadores
   */
  private getRandomShopUpgrades(configs: { id: string; baseCost: number; costMultiplier: number; effect: number; maxLevel: number; name: string; description: string; type: 'click' | 'passive' }[], count: number): Upgrade[] {
    // Filtrar Tier 1
    const tier1 = configs.filter(c => c.id.includes('_1_') || c.id === 'click_1' || c.id === 'passive_1');
    const others = configs.filter(c => !c.id.includes('_1_') && c.id !== 'click_1' && c.id !== 'passive_1');
    
    // Mezclar
    const shuffledTier1 = this.shuffleArray([...tier1]);
    const shuffledOthers = this.shuffleArray([...others]);
    
    // Seleccionar al menos 1 de Tier 1
    const selected: Upgrade[] = [];
    
    if (shuffledTier1.length > 0) {
      selected.push({
        id: shuffledTier1[0].id,
        name: shuffledTier1[0].name,
        description: shuffledTier1[0].description,
        cost: shuffledTier1[0].baseCost,
        costMultiplier: 1,
        effect: shuffledTier1[0].effect,
        maxLevel: shuffledTier1[0].maxLevel,
        purchased: 0,
      });
    }
    
    // Llenar el resto
    const remaining = count - selected.length;
    for (let i = 0; i < remaining && i < shuffledOthers.length; i++) {
      selected.push({
        id: shuffledOthers[i].id,
        name: shuffledOthers[i].name,
        description: shuffledOthers[i].description,
        cost: shuffledOthers[i].baseCost,
        costMultiplier: 1,
        effect: shuffledOthers[i].effect,
        maxLevel: shuffledOthers[i].maxLevel,
        purchased: 0,
      });
    }
    
    return this.shuffleArray(selected);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
