// ============================================
// PRISMA CLIENT - SINGLETON PATTERN
// ============================================

// Cliente Prisma generado en src/database/generated/prisma
import { PrismaClient } from './generated/prisma';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances during hot-reload in development
const prisma = globalThis.__prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export { prisma };
