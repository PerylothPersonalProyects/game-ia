import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Server } from 'socket.io';
import { setupSocketHandlers } from './socket/handlers.js';
import { swaggerOptions } from './swagger.js';
import gameRoutes from './api/routes/gameRoutes.js';
import healthRoutes from './api/routes/health.js';
import statsRoutes from './api/routes/stats.js';
import leaderboardRoutes from './api/routes/leaderboard.js';
import { rateLimitMiddleware } from './api/middleware/rateLimiter.js';
import { authMiddleware } from './api/middleware/auth.js';
import { prisma } from './database/prisma.js';

// ============================================
// SEED DEFAULT UPGRADES (PRISMA)
// ============================================

const DEFAULT_UPGRADES = [
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
    tier: 1,
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
    tier: 2,
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
    tier: 3,
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
    tier: 1,
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
    tier: 2,
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
    tier: 3,
    enabled: true,
  },
];

async function seedDefaultUpgrades(): Promise<void> {
  for (const upgrade of DEFAULT_UPGRADES) {
    await prisma.upgradeConfig.upsert({
      where: { id: upgrade.id },
      update: upgrade,
      create: upgrade,
    });
  }
  console.log('Default upgrades seeded');
}

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

async function main() {
  const app = express();
  app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }));
  app.use(express.json());

  // Apply rate limiting to all requests (excludes /api/health by default)
  app.use(rateLimitMiddleware);

  // Conexión a Prisma MySQL
  await prisma.$connect();
  console.log('Prisma MySQL connected');

  // Seed de upgrades por defecto (usando Prisma)
  await seedDefaultUpgrades();

  // Rutas RESTful para el Idle Game
  app.use('/api/game', gameRoutes);

  // Health check endpoint (no auth required)
  app.use('/api/health', healthRoutes);

  // Statistics endpoints (auth required)
  app.use('/api/stats', statsRoutes);

  // Leaderboard endpoints (auth required)
  app.use('/api/leaderboard', leaderboardRoutes);

  // Swagger
  const swaggerDocs = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  app.get('/openapi.json', (req, res) => {
    res.json(swaggerDocs);
  });

  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    setupSocketHandlers(socket);
  });

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
    console.log(`OpenAPI spec: http://localhost:${PORT}/openapi.json`);
  });

  // Graceful shutdown
  const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...');
    await prisma.$disconnect();
    console.log('Prisma disconnected');
    process.exit(0);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

main().catch(console.error);
