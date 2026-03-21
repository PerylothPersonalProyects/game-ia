import { Router, Request, Response } from 'express';
import { db } from '../../database/index.js';
import { authMiddleware } from '../middleware/auth.js';
import type { ApiResponse } from '../../types/idle-game.js';

const router = Router();

// Cache for stats
interface StatsCache {
  data: GlobalStats | null;
  timestamp: number;
}

const STATS_CACHE_TTL = 60 * 1000; // 60 seconds
const statsCache: StatsCache = {
  data: null,
  timestamp: 0,
};

export interface GlobalStats {
  totalPlayers: number;
  activePlayers: number;
  totalCoins: number;
}

export interface PlayerStats {
  playerId: string;
  totalClicks: number;
  totalCoinsEarned: number;
  upgradesPurchased: number;
  playTime: number;
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
}

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
 * /api/stats:
 *   get:
 *     summary: Get global game statistics
 *     description: Returns aggregated statistics about all players
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Global statistics
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
 *                     totalPlayers:
 *                       type: number
 *                     activePlayers:
 *                       type: number
 *                     totalCoins:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Check cache first
    const now = Date.now();
    if (statsCache.data && (now - statsCache.timestamp) < STATS_CACHE_TTL) {
      const response: ApiResponse<GlobalStats> = {
        success: true,
        data: statsCache.data,
      };
      return res.json(response);
    }

    // Calculate stats from database
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    
    const [totalPlayersResult, activePlayersResult, coinsAggregationResult] = await Promise.all([
      db('players').count('* as count').first(),
      db('players').where('updated_at', '>=', oneDayAgo).count('* as count').first(),
      db('players').sum('coins as total').first(),
    ]);

    const stats: GlobalStats = {
      totalPlayers: Number(totalPlayersResult?.count) || 0,
      activePlayers: Number(activePlayersResult?.count) || 0,
      totalCoins: Number(coinsAggregationResult?.total) || 0,
    };

    // Update cache
    statsCache.data = stats;
    statsCache.timestamp = now;

    const response: ApiResponse<GlobalStats> = {
      success: true,
      data: stats,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching global stats:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch statistics',
    };
    res.status(500).json(response);
  }
});

/**
 * @swagger
 * /api/game/{userId}/stats:
 *   get:
 *     summary: Get player statistics
 *     description: Returns detailed statistics for a specific player
 *     tags: [Stats]
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
 *         description: Player statistics
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
 *                     playerId:
 *                       type: string
 *                     totalClicks:
 *                       type: number
 *                     totalCoinsEarned:
 *                       type: number
 *                     upgradesPurchased:
 *                       type: number
 *                     playTime:
 *                       type: number
 *                     coins:
 *                       type: number
 *                     coinsPerClick:
 *                       type: number
 *                     coinsPerSecond:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Player not found
 */
router.get('/game/:userId/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

    const player = await db('players').where('player_id', userId).first();

    if (!player) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Player not found',
      };
      return res.status(404).json(response);
    }

    // Parse upgrades if stored as JSON string
    const upgrades = typeof player.upgrades === 'string' 
      ? JSON.parse(player.upgrades) 
      : player.upgrades;

    // Calculate stats
    const upgradesPurchased = upgrades.reduce((sum: number, u: any) => sum + u.purchased, 0);
    
    // Calculate play time in seconds (from createdAt to updatedAt)
    const playTimeMs = new Date(player.updated_at).getTime() - new Date(player.created_at).getTime();
    const playTimeSeconds = Math.floor(playTimeMs / 1000);
    
    // Estimate total coins earned (current + spent on upgrades)
    // This is an approximation since we don't track total earned
    const upgradeCosts = upgrades.reduce((sum: number, u: any) => {
      // Rough approximation: cost * purchased
      return sum + (u.cost / u.costMultiplier || 0) * u.purchased;
    }, 0);

    const playerStats: PlayerStats = {
      playerId: player.player_id,
      totalClicks: 0, // Not tracked directly, would need separate field
      totalCoinsEarned: Number(player.coins) + Math.floor(upgradeCosts),
      upgradesPurchased,
      playTime: playTimeSeconds,
      coins: Number(player.coins),
      coinsPerClick: Number(player.coins_per_click),
      coinsPerSecond: Number(player.coins_per_second),
    };

    const response: ApiResponse<PlayerStats> = {
      success: true,
      data: playerStats,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch player statistics',
    };
    res.status(500).json(response);
  }
});

/**
 * Clear stats cache (useful for testing)
 */
export function clearStatsCache(): void {
  statsCache.data = null;
  statsCache.timestamp = 0;
}

export default router;
