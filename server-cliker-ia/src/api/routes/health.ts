import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { isConnectedToDB } from '../../database/connection.js';

const router = Router();

const SERVER_START_TIME = Date.now();
const VERSION = process.env.npm_package_version || '1.0.0';

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: number;
  uptime: number;
  version: string;
  database: {
    connected: boolean;
    host?: string;
    name?: string;
  };
}

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns server health status including database connection
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: number
 *                 uptime:
 *                   type: number
 *                 version:
 *                   type: string
 *                 database:
 *                   type: object
 *       503:
 *         description: Server is unhealthy (database connection failed)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 */
router.get('/', (req: Request, res: Response) => {
  const startTime = Date.now();
  
  const dbConnected = isConnectedToDB();
  const dbState = mongoose.connection.readyState;
  
  // mongoose.readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  
  const response: HealthResponse = {
    status: dbConnected ? 'ok' : 'error',
    timestamp: Date.now(),
    uptime: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
    version: VERSION,
    database: {
      connected: dbConnected,
    },
  };

  // Add database info if connected
  if (dbConnected && mongoose.connection.db) {
    response.database.host = mongoose.connection.host;
    response.database.name = mongoose.connection.db.databaseName;
  }

  // Response time should be < 100ms
  const responseTime = Date.now() - startTime;
  
  if (!dbConnected) {
    return res.status(503).json(response);
  }

  return res.status(200).json(response);
});

export default router;
