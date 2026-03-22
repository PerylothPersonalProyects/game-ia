import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Server } from 'socket.io';
import { setupSocketHandlers } from './socket/handlers.js';
import { setupIdleGameHandlers } from './socket/idleGameHandler.js';
import { swaggerOptions } from './swagger.js';
import gameRoutes from './api/routes/gameRoutes.js';
import healthRoutes from './api/routes/health.js';
import statsRoutes from './api/routes/stats.js';
import leaderboardRoutes from './api/routes/leaderboard.js';
import { rateLimitMiddleware } from './api/middleware/rateLimiter.js';
import { db } from './database/index.js';

// ============================================
// SEED DEFAULT UPGRADES (KNEX)
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
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  for (const upgrade of DEFAULT_UPGRADES) {
    const existing = await db('upgrade_configs').where('id', upgrade.id).first();
    
    if (existing) {
      // Update existing
      await db('upgrade_configs').where('id', upgrade.id).update({
        name: upgrade.name,
        description: upgrade.description,
        base_cost: upgrade.baseCost,
        cost_multiplier: upgrade.costMultiplier,
        effect: upgrade.effect,
        max_level: upgrade.maxLevel,
        type: upgrade.type,
        tier: upgrade.tier,
        enabled: upgrade.enabled,
        updated_at: now,
      });
    } else {
      // Insert new
      await db('upgrade_configs').insert({
        id: upgrade.id,
        name: upgrade.name,
        description: upgrade.description,
        base_cost: upgrade.baseCost,
        cost_multiplier: upgrade.costMultiplier,
        effect: upgrade.effect,
        max_level: upgrade.maxLevel,
        type: upgrade.type,
        tier: upgrade.tier,
        enabled: upgrade.enabled,
        created_at: now,
        updated_at: now,
      });
    }
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

  // Test Knex MySQL connection
  try {
    await db.raw('SELECT 1');
    console.log('Knex MySQL connected');
  } catch (error) {
    console.error('Failed to connect to MySQL via Knex:', error);
  }

  // Seed de upgrades por defecto (usando Knex)
  try {
    await seedDefaultUpgrades();
  } catch (error) {
    console.error('Failed to seed default upgrades:', error);
  }

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

  // Setup Socket.io handlers
  // Multiplayer room handlers (existing)
  io.on('connection', (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);
    setupSocketHandlers(socket);
  });
  
  // Idle game handlers (new - for single player clicker)
  setupIdleGameHandlers(io);

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
    console.log(`OpenAPI spec: http://localhost:${PORT}/openapi.json`);
  });

  // Graceful shutdown
  const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...');
    await db.destroy();
    console.log('Knex disconnected');
    process.exit(0);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

main().catch(console.error);
