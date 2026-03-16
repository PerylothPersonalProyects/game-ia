// ============================================
// PUERTOS - INTERFACES DE REPOSITORIO
// ============================================

import type { Player, Upgrade, UpgradeConfig, GameState, SyncData } from '../domain/entities/index.js';

/**
 * Puerto para acceder a datos de Jugadores
 */
export interface PlayerRepository {
  /**
   * Obtener un jugador por su ID
   */
  findById(playerId: string): Promise<Player | null>;
  
  /**
   * Guardar un jugador
   */
  save(player: Player): Promise<Player>;
  
  /**
   * Actualizar solo los coins (operación atómica)
   */
  updateCoins(playerId: string, coinsDelta: number): Promise<Player | null>;
  
  /**
   * Actualizar jugador completo
   */
  update(player: Player): Promise<Player>;
  
  /**
   * Eliminar un jugador
   */
  delete(playerId: string): Promise<boolean>;
}

/**
 * Puerto para acceder a configuraciones de upgrades
 */
export interface UpgradeConfigRepository {
  /**
   * Obtener todas las configuraciones de upgrades habilitadas
   */
  findAllEnabled(): Promise<UpgradeConfig[]>;
  
  /**
   * Obtener una configuración por ID
   */
  findById(upgradeId: string): Promise<UpgradeConfig | null>;
  
  /**
   * Obtener configuraciones por IDs
   */
  findByIds(upgradeIds: string[]): Promise<UpgradeConfig[]>;
}

// ============================================
// EXCEPCIONES DEL DOMINIO
// ============================================

export class PlayerNotFoundError extends Error {
  constructor(playerId: string) {
    super(`Player not found: ${playerId}`);
    this.name = 'PlayerNotFoundError';
  }
}

export class UpgradeNotFoundError extends Error {
  constructor(upgradeId: string) {
    super(`Upgrade not found: ${upgradeId}`);
    this.name = 'UpgradeNotFoundError';
  }
}

export class InsufficientCoinsError extends Error {
  constructor() {
    super('Insufficient coins');
    this.name = 'InsufficientCoinsError';
  }
}

export class MaxLevelReachedError extends Error {
  constructor(upgradeId: string) {
    super(`Max level reached for upgrade: ${upgradeId}`);
    this.name = 'MaxLevelReachedError';
  }
}
