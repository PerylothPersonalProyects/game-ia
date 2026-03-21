// ============================================
// PRISMA UPGRADE CONFIG REPOSITORY
// ============================================
// Implements UpgradeConfigRepository port using Prisma/MySQL

import type { UpgradeConfig, UpgradeType } from '../../domain/entities/index.js';
import type { UpgradeConfigRepository } from '../../ports/index.js';
import { prisma } from '../prisma.js';

// Type for Prisma UpgradeConfig record
type PrismaUpgradeConfig = Awaited<ReturnType<typeof prisma.upgradeConfig.findFirst>>;

// Helper to convert Prisma UpgradeConfig to domain UpgradeConfig
function toDomainConfig(prismaConfig: NonNullable<PrismaUpgradeConfig>): UpgradeConfig {
  return {
    id: prismaConfig.id,
    name: prismaConfig.name,
    description: prismaConfig.description || '',
    baseCost: prismaConfig.baseCost,
    costMultiplier: prismaConfig.costMultiplier,
    effect: prismaConfig.effect,
    maxLevel: prismaConfig.maxLevel,
    type: prismaConfig.type as UpgradeType,
    enabled: prismaConfig.enabled,
  };
}

/**
 * Prisma implementation of UpgradeConfigRepository
 */
export class PrismaUpgradeConfigRepository implements UpgradeConfigRepository {
  /**
   * Find all enabled upgrade configs
   */
  async findAllEnabled(): Promise<UpgradeConfig[]> {
    const configs = await prisma.upgradeConfig.findMany({
      where: { enabled: true },
      orderBy: [
        { tier: 'asc' },
        { baseCost: 'asc' },
      ],
    });
    
    return configs.map(toDomainConfig);
  }

  /**
   * Find upgrade config by ID
   */
  async findById(upgradeId: string): Promise<UpgradeConfig | null> {
    const config = await prisma.upgradeConfig.findUnique({
      where: { id: upgradeId },
    });
    
    if (!config) return null;
    return toDomainConfig(config);
  }

  /**
   * Find multiple upgrade configs by IDs
   */
  async findByIds(upgradeIds: string[]): Promise<UpgradeConfig[]> {
    if (upgradeIds.length === 0) return [];
    
    const configs = await prisma.upgradeConfig.findMany({
      where: { 
        id: { in: upgradeIds },
        enabled: true,
      },
    });
    
    return configs.map(toDomainConfig);
  }

  /**
   * Find all configs (including disabled) - helper for admin
   */
  async findAll(): Promise<UpgradeConfig[]> {
    const configs = await prisma.upgradeConfig.findMany({
      orderBy: [
        { tier: 'asc' },
        { baseCost: 'asc' },
      ],
    });
    
    return configs.map(toDomainConfig);
  }

  /**
   * Find configs by type
   */
  async findByType(type: UpgradeType): Promise<UpgradeConfig[]> {
    const configs = await prisma.upgradeConfig.findMany({
      where: { 
        type,
        enabled: true,
      },
      orderBy: { baseCost: 'asc' },
    });
    
    return configs.map(toDomainConfig);
  }

  /**
   * Find configs by tier
   */
  async findByTier(tier: number): Promise<UpgradeConfig[]> {
    const configs = await prisma.upgradeConfig.findMany({
      where: { tier },
      orderBy: { baseCost: 'asc' },
    });
    
    return configs.map(toDomainConfig);
  }
}

// Singleton instance for dependency injection
export const prismaUpgradeConfigRepository = new PrismaUpgradeConfigRepository();
