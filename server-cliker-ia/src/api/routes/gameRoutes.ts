import { Router } from 'express';
import { 
  getGameState, 
  getSyncData,
  getUpgrades,
  processClick, 
  buyUpgrade, 
  saveGame,
  deleteGame 
} from '../../api/controllers/gameController.js';

const router = Router();

// GET /api/game/:playerId - Obtener estado del juego
router.get('/:playerId', getGameState);

// GET /api/game/:playerId/sync - Sincronización rápida
router.get('/:playerId/sync', getSyncData);

// GET /api/game/:playerId/upgrades - Obtener upgrades
router.get('/:playerId/upgrades', getUpgrades);

// POST /api/game/:playerId/click - Registrar click
router.post('/:playerId/click', processClick);

// POST /api/game/:playerId/upgrade - Comprar upgrade
router.post('/:playerId/upgrade', buyUpgrade);

// POST /api/game/:playerId/save - Guardar estado
router.post('/:playerId/save', saveGame);

// DELETE /api/game/:playerId - Eliminar estado
router.delete('/:playerId', deleteGame);

export default router;
