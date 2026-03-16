import { describe, it, expect, beforeEach } from 'vitest';
import { CalculateOfflineProgressUseCase } from '../../usecases/CalculateOfflineProgressUseCase.js';
import { 
  InMemoryPlayerRepository, 
  InMemoryUpgradeConfigRepository,
  createDefaultUpgradeConfigRepository 
} from '../../adapters/in-memory/index.js';
import { GetOrCreatePlayerUseCase } from '../../usecases/GetOrCreatePlayerUseCase.js';

describe('UC-004: Generar Ingresos Pasivos (Idle)', () => {
  let playerRepo: InMemoryPlayerRepository;
  let upgradeConfigRepo: InMemoryUpgradeConfigRepository;
  let getPlayerUseCase: GetOrCreatePlayerUseCase;
  let useCase: CalculateOfflineProgressUseCase;

  beforeEach(() => {
    playerRepo = new InMemoryPlayerRepository();
    upgradeConfigRepo = createDefaultUpgradeConfigRepository();
    getPlayerUseCase = new GetOrCreatePlayerUseCase(playerRepo, upgradeConfigRepo);
    useCase = new CalculateOfflineProgressUseCase(playerRepo);
  });

  describe('Sin ingresos pasivos', () => {
    it('debería retornar 0 si el jugador no tiene coinsPerSecond', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      const result = await useCase.execute(playerId);
      
      expect(result.earned).toBe(0);
      expect(result.newCoins).toBe(0);
    });
  });

  describe('Con ingresos pasivos', () => {
    it('debería generar coins basados en coinsPerSecond y tiempo', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      // Configurar jugador con income pasivo
      const player = await playerRepo.findById(playerId);
      player!.coinsPerSecond = 10;
      // lastUpdate hace 10 segundos
      player!.lastUpdate = Date.now() - 10000;
      await playerRepo.update(player!);
      
      const result = await useCase.execute(playerId);
      
      // 10 segundos * 10 coins/segundo = 100 coins
      expect(result.earned).toBe(100);
    });

    it('debería actualizar los coins del jugador', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      const player = await playerRepo.findById(playerId);
      player!.coins = 50;
      player!.coinsPerSecond = 5;
      player!.lastUpdate = Date.now() - 10000; // 10 segundos
      await playerRepo.update(player!);
      
      await useCase.execute(playerId);
      
      const updatedPlayer = await playerRepo.findById(playerId);
      expect(updatedPlayer!.coins).toBe(100); // 50 + 50
    });
  });

  describe('Límite offline', () => {
    it('debería limitar a máximo 8 horas de ingresos offline', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      const player = await playerRepo.findById(playerId);
      player!.coinsPerSecond = 10;
      // Simular 10 horas offline (más de 8)
      player!.lastUpdate = Date.now() - (10 * 60 * 60 * 1000);
      await playerRepo.update(player!);
      
      const result = await useCase.execute(playerId);
      
      // Máximo: 8 horas * 60 min * 60 seg * 10 = 288000
      const maxSeconds = 8 * 60 * 60;
      const expected = maxSeconds * 10;
      expect(result.earned).toBe(expected);
    });
  });

  describe('Errores', () => {
    it('debería lanzar error si el jugador no existe', async () => {
      await expect(useCase.execute('no-existe')).rejects.toThrow('Player not found');
    });
  });
});
