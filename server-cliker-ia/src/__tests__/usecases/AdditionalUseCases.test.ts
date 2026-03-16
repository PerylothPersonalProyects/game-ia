import { describe, it, expect, beforeEach } from 'vitest';
import { 
  GetShopUpgradesUseCase,
  BuyShopUpgradeUseCase,
  SaveGameUseCase,
  GetSyncDataUseCase
} from '../../usecases/AdditionalUseCases.js';
import { 
  InMemoryPlayerRepository, 
  InMemoryUpgradeConfigRepository,
  createDefaultUpgradeConfigRepository 
} from '../../adapters/in-memory/index.js';
import { GetOrCreatePlayerUseCase } from '../../usecases/GetOrCreatePlayerUseCase.js';
import type { GameState } from '../../domain/entities/index.js';

describe('UC-005 al UC-010: Casos de Uso Adicionales', () => {
  let playerRepo: InMemoryPlayerRepository;
  let upgradeConfigRepo: InMemoryUpgradeConfigRepository;
  let getPlayerUseCase: GetOrCreatePlayerUseCase;

  beforeEach(() => {
    playerRepo = new InMemoryPlayerRepository();
    upgradeConfigRepo = createDefaultUpgradeConfigRepository();
    getPlayerUseCase = new GetOrCreatePlayerUseCase(playerRepo, upgradeConfigRepo);
  });

  // ============================================
  // UC-005: Obtener Shop Upgrades
  // ============================================
  describe('UC-005: GetShopUpgradesUseCase', () => {
    it('debería retornar los upgrades del shop', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      const useCase = new GetShopUpgradesUseCase(playerRepo, upgradeConfigRepo);
      const shopUpgrades = await useCase.execute(playerId);
      
      expect(shopUpgrades.length).toBeGreaterThan(0);
    });

    it('debería lanzar error si el jugador no existe', async () => {
      const useCase = new GetShopUpgradesUseCase(playerRepo, upgradeConfigRepo);
      await expect(useCase.execute('no-existe')).rejects.toThrow();
    });
  });

  // ============================================
  // UC-006: Comprar Upgrade del Shop
  // ============================================
  describe('UC-006: BuyShopUpgradeUseCase', () => {
    it('debería comprar un upgrade del shop exitosamente', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      // Agregar coins
      const player = await playerRepo.findById(playerId);
      player!.coins = 1000;
      await playerRepo.update(player!);
      
      // Obtener un upgrade del shop
      const shopUseCase = new GetShopUpgradesUseCase(playerRepo, upgradeConfigRepo);
      const shopUpgrades = await shopUseCase.execute(playerId);
      const upgradeToBuy = shopUpgrades[0];
      
      const useCase = new BuyShopUpgradeUseCase(playerRepo, upgradeConfigRepo);
      const result = await useCase.execute(playerId, upgradeToBuy.id);
      
      expect(result.success).toBe(true);
    });

    it('debería fallar si no hay suficientes coins', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      // Sin coins
      const shopUseCase = new GetShopUpgradesUseCase(playerRepo, upgradeConfigRepo);
      const shopUpgrades = await shopUseCase.execute(playerId);
      
      const useCase = new BuyShopUpgradeUseCase(playerRepo, upgradeConfigRepo);
      const result = await useCase.execute(playerId, shopUpgrades[0].id);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient coins');
    });
  });

  // ============================================
  // UC-009: Guardar Estado del Juego
  // ============================================
  describe('UC-009: SaveGameUseCase', () => {
    it('debería guardar el estado del juego', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      const state: GameState = {
        coins: 500,
        coinsPerClick: 10, // El servidor ignorará esto
        coinsPerSecond: 5, // El servidor ignorará esto
        upgrades: [{
          id: 'click_1',
          name: 'Dedo Rápido',
          description: 'Test',
          cost: 10,
          costMultiplier: 1,
          effect: 1,
          maxLevel: 100,
          purchased: 3,
        }],
        shopUpgrades: [],
      };
      
      const useCase = new SaveGameUseCase(playerRepo, upgradeConfigRepo);
      const result = await useCase.execute(playerId, state);
      
      expect(result.success).toBe(true);
      
      // Verificar que los stats se recalcularon
      const player = await playerRepo.findById(playerId);
      expect(player!.coins).toBe(500);
      // coinsPerClick = 1 base + (3 * 1 efecto) = 4
      expect(player!.coinsPerClick).toBe(4);
    });
  });

  // ============================================
  // UC-010: Obtener Datos de Sincronización
  // ============================================
  describe('UC-010: GetSyncDataUseCase', () => {
    it('debería retornar los datos de sincronización', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      const useCase = new GetSyncDataUseCase(playerRepo);
      const syncData = await useCase.execute(playerId);
      
      expect(syncData.coins).toBeDefined();
      expect(syncData.coinsPerClick).toBeDefined();
      expect(syncData.coinsPerSecond).toBeDefined();
      expect(syncData.lastSync).toBeDefined();
    });

    it('debería lanzar error si el jugador no existe', async () => {
      const useCase = new GetSyncDataUseCase(playerRepo);
      await expect(useCase.execute('no-existe')).rejects.toThrow();
    });
  });
});
