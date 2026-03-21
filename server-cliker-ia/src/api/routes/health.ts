import { Router, Request, Response } from 'express';
import { db } from '../../database/index.js';

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
    type: string;
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
router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  let dbConnected = false;
  try {
    // Try to run a simple query to check connection
    await db.raw('SELECT 1');
    dbConnected = true;
  } catch (error) {
    dbConnected = false;
  }
  
  const response: HealthResponse = {
    status: dbConnected ? 'ok' : 'error',
    timestamp: Date.now(),
    uptime: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
    version: VERSION,
    database: {
      connected: dbConnected,
      type: 'mysql',
    },
  };

  // Response time should be < 100ms
  const responseTime = Date.now() - startTime;
  
  if (!dbConnected) {
    return res.status(503).json(response);
  }

  return res.status(200).json(response);
});

export default router;
