// ============================================
// ADAPTADORES IN-MEMORY (PARA TESTS)
// ============================================

import type { Player, UpgradeConfig } from '../../domain/entities/index.js';
import type { PlayerRepository, UpgradeConfigRepository } from '../../ports/index.js';

/**
 * Implementación en memoria de PlayerRepository
 * Útil para tests y desarrollo
 */
export class InMemoryPlayerRepository implements PlayerRepository {
  private players: Map<string, Player> = new Map();

  async findById(playerId: string): Promise<Player | null> {
    return this.players.get(playerId) || null;
  }

  async save(player: Player): Promise<Player> {
    this.players.set(player.id, { ...player });
    return { ...player };
  }

  async updateCoins(playerId: string, coinsDelta: number): Promise<Player | null> {
    const player = this.players.get(playerId);
    if (!player) return null;
    
    const updated = {
      ...player,
      coins: player.coins + coinsDelta,
      lastUpdate: Date.now(), // Actualizar timestamp para calcular next passive earnings
    };
    this.players.set(playerId, updated);
    return { ...updated };
  }

  async update(player: Player): Promise<Player> {
    this.players.set(player.id, { ...player });
    return { ...player };
  }

  async delete(playerId: string): Promise<boolean> {
    return this.players.delete(playerId);
  }

  // Métodos helpers para tests
  clear(): void {
    this.players.clear();
  }

  setPlayer(player: Player): void {
    this.players.set(player.id, { ...player });
  }

  getAll(): Player[] {
    return Array.from(this.players.values());
  }

  // Helper para actualizar lastUpdate (necesario para tests de ingresos pasivos)
  async updateLastUpdate(playerId: string, lastUpdate: number): Promise<Player | null> {
    const player = this.players.get(playerId);
    if (!player) return null;
    
    const updated = {
      ...player,
      lastUpdate,
    };
    this.players.set(playerId, updated);
    return { ...updated };
  }
}

/**
 * Implementación en memoria de UpgradeConfigRepository
 */
export class InMemoryUpgradeConfigRepository implements UpgradeConfigRepository {
  private configs: Map<string, UpgradeConfig> = new Map();

  async findAllEnabled(): Promise<UpgradeConfig[]> {
    return Array.from(this.configs.values()).filter(c => c.enabled !== false);
  }

  async findById(upgradeId: string): Promise<UpgradeConfig | null> {
    return this.configs.get(upgradeId) || null;
  }

  async findByIds(upgradeIds: string[]): Promise<UpgradeConfig[]> {
    return Array.from(this.configs.values())
      .filter(c => upgradeIds.includes(c.id));
  }

  // Métodos helpers para tests
  clear(): void {
    this.configs.clear();
  }

  addConfig(config: UpgradeConfig): void {
    this.configs.set(config.id, { ...config });
  }

  addConfigs(configs: UpgradeConfig[]): void {
    configs.forEach(c => this.configs.set(c.id, { ...c }));
  }

  getAll(): UpgradeConfig[] {
    return Array.from(this.configs.values());
  }
}

// ============================================
// FACTORY PARA CREAR INSTANCIAS CON DATOS DE EJEMPLO
// ============================================

/**
 * Crear un repositorio de upgrades con datos por defecto
 */
export function createDefaultUpgradeConfigRepository(): InMemoryUpgradeConfigRepository {
  const repo = new InMemoryUpgradeConfigRepository();
  
  repo.addConfigs([
    // Click upgrades
    {
      id: 'click_1',
      name: 'Dedo Rápido',
      description: 'Mejora tu dedo para hacer clicks más rápidos',
      baseCost: 10,
      costMultiplier: 1.5,
      effect: 1,
      maxLevel: 100,
      type: 'click',
      enabled: true,
    },
    {
      id: 'click_2',
      name: 'Mano Firme',
      description: 'Tu mano es más precisa y fuerte',
      baseCost: 100,
      costMultiplier: 1.6,
      effect: 5,
      maxLevel: 50,
      type: 'click',
      enabled: true,
    },
    {
      id: 'click_3',
      name: 'Poder Digital',
      description: 'Tus dedos tienen poder sobrenatural',
      baseCost: 1000,
      costMultiplier: 1.7,
      effect: 25,
      maxLevel: 25,
      type: 'click',
      enabled: true,
    },
    // Passive upgrades
    {
      id: 'passive_1',
      name: 'Inversor Novato',
      description: 'Empieza a ganar dinero automáticamente',
      baseCost: 50,
      costMultiplier: 1.5,
      effect: 1,
      maxLevel: 100,
      type: 'passive',
      enabled: true,
    },
    {
      id: 'passive_2',
      name: 'Emprendedor',
      description: 'Tus inversiones generan más ganancias',
      baseCost: 500,
      costMultiplier: 1.6,
      effect: 5,
      maxLevel: 50,
      type: 'passive',
      enabled: true,
    },
    {
      id: 'passive_3',
      name: 'Magnate',
      description: 'Construye un imperio financiero',
      baseCost: 5000,
      costMultiplier: 1.7,
      effect: 25,
      maxLevel: 25,
      type: 'passive',
      enabled: true,
    },
  ]);

  return repo;
}
