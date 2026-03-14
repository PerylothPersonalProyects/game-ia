import { Request, Response } from 'express';
import { idleGameService } from '../../services/IdleGameService.js';
import { connectDB } from '../../database/connection.js';
import type { 
  ApiResponse, 
  GameState,
  ClickResponse, 
  UpgradeResponse, 
  SaveResponse,
  Upgrade
} from '../../types/idle-game.js';

// Helper para obtener playerId como string
function getPlayerId(param: string | string[] | undefined): string | null {
  if (!param) return null;
  return Array.isArray(param) ? param[0] : param;
}

// ============================================
// MIDDLEWARE DE CONEXIÓN
// ============================================

export async function ensureDBConnection(req: Request, res: Response, next: Function) {
  try {
    await connectDB();
    next();
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Database connection failed',
    };
    return res.status(500).json(response);
  }
}

// ============================================
// ENDPOINTS
// ============================================

// GET /api/game/:playerId - Obtener estado del juego
export async function getGameState(req: Request, res: Response) {
  const playerId = getPlayerId(req.params.playerId);
  
  if (!playerId) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Player ID is required',
    };
    return res.status(400).json(response);
  }

  try {
    // Calcular progreso offline al obtener el estado
    await idleGameService.calculateOfflineProgress(playerId);
    const state = await idleGameService.getGameState(playerId);

    const response: ApiResponse<GameState> = {
      success: true,
      data: state,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to get game state',
    };
    res.status(500).json(response);
  }
}

// GET /api/game/:playerId/sync - Obtener datos de sincronización
export async function getSyncData(req: Request, res: Response) {
  const playerId = getPlayerId(req.params.playerId);
  
  if (!playerId) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Player ID is required',
    };
    return res.status(400).json(response);
  }

  try {
    // Calcular progreso offline
    const offlineProgress = await idleGameService.calculateOfflineProgress(playerId);
    const syncData = await idleGameService.getSyncData(playerId);

    const response: ApiResponse<typeof syncData & { offlineEarned?: number }> = {
      success: true,
      data: {
        ...syncData,
        coins: offlineProgress.newCoins,
        offlineEarned: offlineProgress.earned,
      },
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to get sync data',
    };
    res.status(500).json(response);
  }
}

// GET /api/game/:playerId/upgrades - Obtener upgrades
export async function getUpgrades(req: Request, res: Response) {
  const playerId = getPlayerId(req.params.playerId);
  
  if (!playerId) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Player ID is required',
    };
    return res.status(400).json(response);
  }

  try {
    const upgrades = await idleGameService.getUpgrades(playerId);

    const response: ApiResponse<Upgrade[]> = {
      success: true,
      data: upgrades,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to get upgrades',
    };
    res.status(500).json(response);
  }
}

// POST /api/game/:playerId/click - Registrar click
export async function processClick(req: Request, res: Response) {
  const playerId = getPlayerId(req.params.playerId);
  
  if (!playerId) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Player ID is required',
    };
    return res.status(400).json(response);
  }

  try {
    const { player, earned } = await idleGameService.processClick(playerId);

    const clickResponse: ClickResponse = {
      coins: player.coins,
      clickPower: player.coinsPerClick,
      coinsPerClick: player.coinsPerClick,
      totalClicks: 0,
    };

    const response: ApiResponse<ClickResponse> = {
      success: true,
      data: clickResponse,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to process click',
    };
    res.status(500).json(response);
  }
}

// POST /api/game/:playerId/upgrade - Comprar upgrade
export async function buyUpgrade(req: Request, res: Response) {
  const playerId = getPlayerId(req.params.playerId);
  const { upgradeId } = req.body;
  
  if (!playerId) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Player ID is required',
    };
    return res.status(400).json(response);
  }

  if (!upgradeId) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Upgrade ID is required',
    };
    return res.status(400).json(response);
  }

  try {
    const result = await idleGameService.buyUpgrade(playerId, String(upgradeId));

    if (!result.success) {
      const response: ApiResponse<null> = {
        success: false,
        error: result.error,
      };
      return res.status(400).json(response);
    }

    const upgradeResponse: UpgradeResponse = {
      upgradeId: result.upgrade!.id,
      newLevel: result.upgrade!.purchased,
      newCost: result.upgrade!.cost,
      coinsPerClick: result.player!.coinsPerClick,
      coinsPerSecond: result.player!.coinsPerSecond,
    };

    const response: ApiResponse<UpgradeResponse> = {
      success: true,
      data: upgradeResponse,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to buy upgrade',
    };
    res.status(500).json(response);
  }
}

// POST /api/game/:playerId/save - Guardar estado
export async function saveGame(req: Request, res: Response) {
  const playerId = getPlayerId(req.params.playerId);
  const { state } = req.body;
  
  if (!playerId) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Player ID is required',
    };
    return res.status(400).json(response);
  }

  if (!state) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Game state is required',
    };
    return res.status(400).json(response);
  }

  try {
    await idleGameService.saveGame(playerId, state);

    const saveResponse: SaveResponse = {
      savedAt: Date.now(),
      coins: state.coins,
    };

    const response: ApiResponse<SaveResponse> = {
      success: true,
      data: saveResponse,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to save game',
    };
    res.status(500).json(response);
  }
}

// DELETE /api/game/:playerId - Eliminar estado
export async function deleteGame(req: Request, res: Response) {
  const playerId = getPlayerId(req.params.playerId);
  
  if (!playerId) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Player ID is required',
    };
    return res.status(400).json(response);
  }

  try {
    await idleGameService.deletePlayer(playerId);

    const response: ApiResponse<{ deleted: boolean }> = {
      success: true,
      data: { deleted: true },
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to delete game',
    };
    res.status(500).json(response);
  }
}
