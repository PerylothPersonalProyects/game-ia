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

  // ============================================
  // BUG FIX: Passive Income on Click
  // ============================================
  describe('Bug Fix: Passive income accumulated on click', () => {
    it('debería agregar tanto earnings pasivos como de click cuando CPS > 0', async () => {
      const playerId = 'player-with-passive';
      
      // Crear jugador
      await getPlayerUseCase.execute(playerId);
      
      // Agregar upgrade pasivo (1 coin/second)
      const player = await playerRepo.findById(playerId);
      player!.upgrades.push({
        id: 'passive_1',
        name: 'Inversor Novato',
        description: 'Gana dinero automáticamente',
        cost: 50,
        costMultiplier: 1.5,
        effect: 1,
        maxLevel: 100,
        purchased: 1,
      });
      player!.coinsPerSecond = 1; // 1 coin/second
      await playerRepo.update(player!);
      
      // Simular 5 segundos transcurridos - actualizar lastUpdate
      const fiveSecondsAgo = Date.now() - 5000;
      await playerRepo.updateLastUpdate(playerId, fiveSecondsAgo);
      
      // Act: Click
      const result = await useCase.execute(playerId);
      
      // Assert: Debe tener 5 pasivos + 1 click = 6 total
      // El earned incluye tanto passiveEarned como clickEarned
      expect(result.earned).toBe(6);
      expect(result.passiveEarned).toBe(5); // 5 segundos * 1 CPS
      expect(result.clickEarned).toBe(1);    // 1 CPC
    });

    it('debería retornar solo earnings de click cuando CPS = 0', async () => {
      const playerId = 'player-no-passive';
      
      // Crear jugador sin upgrades pasivos
      await getPlayerUseCase.execute(playerId);
      
      // El jugador tiene coinsPerSecond = 0 por defecto
      
      const result = await useCase.execute(playerId);
      
      // Debe tener solo 1 coin de click, 0 de pasivo
      expect(result.earned).toBe(1);
      expect(result.passiveEarned).toBe(0);
      expect(result.clickEarned).toBe(1);
    });

    it('debería manejar 0 segundos transcurridos (click inmediato)', async () => {
      const playerId = 'player-immediate-click';
      
      // Crear jugador con CPS > 0
      await getPlayerUseCase.execute(playerId);
      
      const player = await playerRepo.findById(playerId);
      player!.upgrades.push({
        id: 'passive_1',
        name: 'Inversor Novato',
        description: 'Gana dinero automáticamente',
        cost: 50,
        costMultiplier: 1.5,
        effect: 1,
        maxLevel: 100,
        purchased: 1,
      });
      player!.coinsPerSecond = 5; // 5 coins/second
      await playerRepo.update(player!);
      
      // Establecer lastUpdate a ahora mismo
      const now = Date.now();
      await playerRepo.updateLastUpdate(playerId, now);
      
      const result = await useCase.execute(playerId);
      
      // Debe tener 0 pasivo (0 segundos), solo click
      expect(result.passiveEarned).toBe(0);
      expect(result.clickEarned).toBe(1);
      expect(result.earned).toBe(1);
    });

    it('debería acumular correctamente con múltiples segundos', async () => {
      const playerId = 'player-multi-seconds';
      
      // Crear jugador con CPS alta
      await getPlayerUseCase.execute(playerId);
      
      const player = await playerRepo.findById(playerId);
      player!.upgrades.push({
        id: 'passive_2',
        name: 'Emprendedor',
        description: 'Tus inversiones generan más ganancias',
        cost: 500,
        costMultiplier: 1.6,
        effect: 5,
        maxLevel: 50,
        purchased: 2,
      });
      player!.coinsPerSecond = 10; // 5 CPS * 2 niveles = 10 CPS
      await playerRepo.update(player!);
      
      // Simular 10 segundos transcurridos
      const tenSecondsAgo = Date.now() - 10000;
      await playerRepo.updateLastUpdate(playerId, tenSecondsAgo);
      
      const result = await useCase.execute(playerId);
      
      // 10 segundos * 10 CPS = 100 passive + 1 click = 101 total
      expect(result.passiveEarned).toBe(100);
      expect(result.clickEarned).toBe(1);
      expect(result.earned).toBe(101);
    });

    it('debería actualizar lastUpdate después del click', async () => {
      const playerId = 'player-update-time';
      
      await getPlayerUseCase.execute(playerId);
      
      const player = await playerRepo.findById(playerId);
      player!.upgrades.push({
        id: 'passive_1',
        name: 'Inversor Novato',
        description: 'Gana dinero automáticamente',
        cost: 50,
        costMultiplier: 1.5,
        effect: 1,
        maxLevel: 100,
        purchased: 1,
      });
      player!.coinsPerSecond = 1;
      await playerRepo.update(player!);
      
      // Establecer lastUpdate a 3 segundos atrás
      const threeSecondsAgo = Date.now() - 3000;
      await playerRepo.updateLastUpdate(playerId, threeSecondsAgo);
      
      // Click
      await useCase.execute(playerId);
      
      // Verificar que lastUpdate se actualizó
      const updatedPlayer = await playerRepo.findById(playerId);
      const timeDiff = Date.now() - (updatedPlayer?.lastUpdate || 0);
      
      // lastUpdate debería ser muy cercano a ahora (dentro de 1 segundo)
      expect(timeDiff).toBeLessThan(1000);
    });
  });

  describe('Errores', () => {
    it('debería lanzar error si el jugador no existe', async () => {
      await expect(useCase.execute('no-existe')).rejects.toThrow('Player not found');
    });
  });
});
