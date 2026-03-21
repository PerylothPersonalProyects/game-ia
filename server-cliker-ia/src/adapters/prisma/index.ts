// ============================================
// PRISMA ADAPTER
// ============================================
// Exports all Prisma repositories for easy import

import { prismaPlayerRepository } from '../../database/repositories/PrismaPlayerRepository.js';
import { prismaUpgradeConfigRepository } from '../../database/repositories/PrismaUpgradeConfigRepository.js';

export const playerRepository = prismaPlayerRepository;
export const upgradeConfigRepository = prismaUpgradeConfigRepository;
