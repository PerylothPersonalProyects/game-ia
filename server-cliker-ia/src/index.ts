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
import { connectDB } from './database/connection.js';
import { seedDefaultUpgrades } from './database/models/Player.js';

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const app = express();
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());

// Apply rate limiting to all requests (excludes /api/health by default)
app.use(rateLimitMiddleware);

// Conexión a MongoDB
await connectDB();

// Seed de upgrades por defecto
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
