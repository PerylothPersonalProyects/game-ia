import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Server } from 'socket.io';
import { setupSocketHandlers } from './socket/handlers.js';
import { swaggerOptions } from './swagger.js';
import gameRoutes from './api/routes/gameRoutes.js';
import { connectDB } from './database/connection.js';
import { seedDefaultUpgrades } from './database/models/Player.js';

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
await connectDB();

// Seed de upgrades por defecto
await seedDefaultUpgrades();

// Rutas RESTful para el Idle Game
app.use('/api/game', gameRoutes);

// Swagger
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get('/openapi.json', (req, res) => {
  res.json(swaggerDocs);
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
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
