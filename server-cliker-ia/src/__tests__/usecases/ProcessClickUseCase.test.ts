import { describe, it, expect, beforeEach } from 'vitest';
import { ProcessClickUseCase } from '../../usecases/ProcessClickUseCase.js';
import { 
  InMemoryPlayerRepository, 
  InMemoryUpgradeConfigRepository,
  createDefaultUpgradeConfigRepository 
} from '../../adapters/in-memory/index.js';
import { GetOrCreatePlayerUseCase } from '../../usecases/GetOrCreatePlayerUseCase.js';

describe('UC-002: Hacer Click para Obtener Coins', () => {
  let playerRepo: InMemoryPlayerRepository;
  let upgradeConfigRepo: InMemoryUpgradeConfigRepository;
  let getPlayerUseCase: GetOrCreatePlayerUseCase;
  let useCase: ProcessClickUseCase;

  beforeEach(() => {
    playerRepo = new InMemoryPlayerRepository();
    upgradeConfigRepo = createDefaultUpgradeConfigRepository();
    getPlayerUseCase = new GetOrCreatePlayerUseCase(playerRepo, upgradeConfigRepo);
    useCase = new ProcessClickUseCase(playerRepo);
  });

  describe('Click básico', () => {
    it('debería ganar 1 coin por click cuando no hay upgrades', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      const result = await useCase.execute(playerId);
      
      expect(result.earned).toBe(1);
      expect(result.coinsPerClick).toBe(1);
    });

    it('debería incrementar los coins del jugador', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      const result = await useCase.execute(playerId);
      
      expect(result.newCoins).toBe(1);
    });
  });

  describe('Click con upgrades de click', () => {
    it('debería ganar más coins con upgrades de click comprados', async () => {
      const playerId = 'player-123';
      
      // Crear jugador
      await getPlayerUseCase.execute(playerId);
      
      // Agregar upgrade de click
      const player = await playerRepo.findById(playerId);
      player!.upgrades.push({
        id: 'click_1',
        name: 'Dedo Rápido',
        description: 'Mejora tu dedo',
        cost: 10,
        costMultiplier: 1.5,
        effect: 1,
        maxLevel: 100,
        purchased: 5,
      });
      player!.coinsPerClick = 6; // 1 base + 5
      await playerRepo.update(player!);
      
      const result = await useCase.execute(playerId);
      
      expect(result.earned).toBe(6);
      expect(result.coinsPerClick).toBe(6);
    });
  });

  describe('Errores', () => {
    it('debería lanzar error si el jugador no existe', async () => {
      await expect(useCase.execute('no-existe')).rejects.toThrow('Player not found');
    });
  });
});
