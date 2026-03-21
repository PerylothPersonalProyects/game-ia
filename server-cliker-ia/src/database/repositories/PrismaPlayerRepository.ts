// ============================================
// PRISMA PLAYER REPOSITORY
// ============================================
// Implements PlayerRepository port using Prisma/MySQL

import type { Player } from '../../domain/entities/index.js';
import type { PlayerRepository } from '../../ports/index.js';
import { prisma } from '../prisma.js';

// Type for Prisma Player record
type PrismaPlayer = Awaited<ReturnType<typeof prisma.player.findFirst>>;

// Helper to convert Prisma Player to domain Player
function toDomainPlayer(prismaPlayer: NonNullable<PrismaPlayer>): Player {
  return {
    id: prismaPlayer.playerId,
    coins: prismaPlayer.coins,
    coinsPerClick: prismaPlayer.coinsPerClick,
    coinsPerSecond: prismaPlayer.coinsPerSecond,
    upgrades: typeof prismaPlayer.upgrades === 'string' 
      ? JSON.parse(prismaPlayer.upgrades) 
      : prismaPlayer.upgrades,
    shopUpgrades: typeof prismaPlayer.shopUpgrades === 'string' 
      ? JSON.parse(prismaPlayer.shopUpgrades) 
      : prismaPlayer.shopUpgrades,
    lastUpdate: Number(prismaPlayer.lastUpdate),
  };
}

// Helper to convert domain Player to Prisma create/update input
function toPrismaInput(player: Player) {
  return {
    playerId: player.id,
    coins: player.coins,
    coinsPerClick: player.coinsPerClick,
    coinsPerSecond: player.coinsPerSecond,
    upgrades: JSON.stringify(player.upgrades),
    shopUpgrades: JSON.stringify(player.shopUpgrades),
    lastUpdate: BigInt(player.lastUpdate),
  };
}

/**
 * Prisma implementation of PlayerRepository
 */
export class PrismaPlayerRepository implements PlayerRepository {
  /**
   * Find player by playerId
   */
  async findById(playerId: string): Promise<Player | null> {
    const player = await prisma.player.findUnique({
      where: { playerId },
    });
    
    if (!player) return null;
    return toDomainPlayer(player);
  }

  /**
   * Save new player
   */
  async save(player: Player): Promise<Player> {
    const created = await prisma.player.create({
      data: {
        ...toPrismaInput(player),
        lastUpdate: BigInt(player.lastUpdate || Date.now()),
      },
    });
    
    return toDomainPlayer(created);
  }

  /**
   * Update coins atomically
   */
  async updateCoins(playerId: string, coinsDelta: number): Promise<Player | null> {
    // First check if player exists
    const existing = await prisma.player.findUnique({
      where: { playerId },
    });
    
    if (!existing) return null;
    
    // Update with atomic operation
    const updated = await prisma.player.update({
      where: { playerId },
      data: {
        coins: existing.coins + coinsDelta,
        lastUpdate: BigInt(Date.now()),
      },
    });
    
    return toDomainPlayer(updated);
  }

  /**
   * Update player full data
   */
  async update(player: Player): Promise<Player> {
    const updated = await prisma.player.update({
      where: { playerId: player.id },
      data: {
        ...toPrismaInput(player),
        lastUpdate: BigInt(player.lastUpdate || Date.now()),
      },
    });
    
    return toDomainPlayer(updated);
  }

  /**
   * Delete player
   */
  async delete(playerId: string): Promise<boolean> {
    try {
      await prisma.player.delete({
        where: { playerId },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Update lastUpdate timestamp
   */
  async updateLastUpdate(playerId: string, lastUpdate: number): Promise<Player | null> {
    const updated = await prisma.player.update({
      where: { playerId },
      data: {
        lastUpdate: BigInt(lastUpdate),
      },
    });
    
    return toDomainPlayer(updated);
  }
}

// Singleton instance for dependency injection
export const prismaPlayerRepository = new PrismaPlayerRepository();
