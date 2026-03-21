import { Router, Request, Response } from 'express';
import { PlayerModel } from '../../database/models/Player.js';
import { authMiddleware } from '../middleware/auth.js';
import type { ApiResponse } from '../../types/idle-game.js';

const router = Router();

// Cache for leaderboard
interface LeaderboardCache {
  rankings: LeaderboardEntry[];
  total: number;
  timestamp: number;
}

const LEADERBOARD_CACHE_TTL = 30 * 1000; // 30 seconds

const leaderboardCache: Map<string, LeaderboardCache> = new Map();

export interface LeaderboardEntry {
  userId: string;
  coins: number;
  rank: number;
}

export interface LeaderboardResponse {
  rankings: LeaderboardEntry[];
  total: number;
}

export interface PlayerRankResponse {
  userId: string;
  coins: number;
  rank: number;
}

/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     summary: Get leaderboard
 *     description: Returns top players ranked by coins
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of players to return (max 100)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of players to skip
 *     responses:
 *       200:
 *         description: Leaderboard rankings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     rankings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                           coins:
 *                             type: number
 *                           rank:
 *                             type: number
 *                     total:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 100);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);
    
    // Generate cache key
    const cacheKey = `${limit}:${offset}`;
    const now = Date.now();
    
    // Check cache first
    const cached = leaderboardCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < LEADERBOARD_CACHE_TTL) {
      const response: ApiResponse<LeaderboardResponse> = {
        success: true,
        data: {
          rankings: cached.rankings,
          total: cached.total,
        },
      };
      return res.json(response);
    }

    // Get total count
    const total = await PlayerModel.countDocuments();

    // Get top players ranked by coins
    const players = await PlayerModel.find({})
      .sort({ coins: -1 })
      .skip(offset)
      .limit(limit)
      .select('playerId coins')
      .lean();

    const rankings: LeaderboardEntry[] = players.map((player, index) => ({
      userId: player.playerId,
      coins: player.coins,
      rank: offset + index + 1,
    }));

    // Cache results
    leaderboardCache.set(cacheKey, {
      rankings,
      total,
      timestamp: now,
    });

    // Limit cache size
    if (leaderboardCache.size > 10) {
      const oldestKey = leaderboardCache.keys().next().value;
      if (oldestKey) {
        leaderboardCache.delete(oldestKey);
      }
    }

    const response: ApiResponse<LeaderboardResponse> = {
      success: true,
      data: {
        rankings,
        total,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch leaderboard',
    };
    res.status(500).json(response);
  }
});

/**
 * @swagger
 * /api/leaderboard/{userId}/rank:
 *   get:
 *     summary: Get player rank
 *     description: Returns the rank of a specific player
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Player ID
 *     responses:
 *       200:
 *         description: Player rank information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     coins:
 *                       type: number
 *                     rank:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Player not found
 */
router.get('/:userId/rank', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Get the player
    const player = await PlayerModel.findOne({ playerId: userId });

    if (!player) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Player not found',
      };
      return res.status(404).json(response);
    }

    // Count players with more coins than this player
    const rank = await PlayerModel.countDocuments({
      coins: { $gt: player.coins },
    }) + 1;

    const rankResponse: PlayerRankResponse = {
      userId: player.playerId,
      coins: player.coins,
      rank,
    };

    const response: ApiResponse<PlayerRankResponse> = {
      success: true,
      data: rankResponse,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching player rank:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch player rank',
    };
    res.status(500).json(response);
  }
});

/**
 * Clear leaderboard cache (useful for testing)
 */
export function clearLeaderboardCache(): void {
  leaderboardCache.clear();
}

export default router;
