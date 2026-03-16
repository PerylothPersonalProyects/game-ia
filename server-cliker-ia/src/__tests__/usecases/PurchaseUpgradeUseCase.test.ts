import { describe, it, expect, beforeEach } from 'vitest';
import { PurchaseUpgradeUseCase } from '../../usecases/PurchaseUpgradeUseCase.js';
import { 
  InMemoryPlayerRepository, 
  InMemoryUpgradeConfigRepository,
  createDefaultUpgradeConfigRepository 
} from '../../adapters/in-memory/index.js';
import { GetOrCreatePlayerUseCase } from '../../usecases/GetOrCreatePlayerUseCase.js';

describe('UC-003: Comprar Upgrade (Inventario)', () => {
  let playerRepo: InMemoryPlayerRepository;
  let upgradeConfigRepo: InMemoryUpgradeConfigRepository;
  let getPlayerUseCase: GetOrCreatePlayerUseCase;
  let useCase: PurchaseUpgradeUseCase;

  beforeEach(() => {
    playerRepo = new InMemoryPlayerRepository();
    upgradeConfigRepo = createDefaultUpgradeConfigRepository();
    getPlayerUseCase = new GetOrCreatePlayerUseCase(playerRepo, upgradeConfigRepo);
    useCase = new PurchaseUpgradeUseCase(playerRepo, upgradeConfigRepo);
  });

  describe('Compra exitosa', () => {
    it('debería comprar un upgrade cuando el jugador tiene suficientes coins', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      // Agregar coins al jugador
      const player = await playerRepo.findById(playerId);
      player!.coins = 100;
      // Agregar upgrade al inventario
      player!.upgrades.push({
        id: 'click_1',
        name: 'Dedo Rápido',
        description: 'Mejora tu dedo',
        cost: 10,
        costMultiplier: 1,
        effect: 1,
        maxLevel: 100,
        purchased: 0,
      });
      await playerRepo.update(player!);
      
      const result = await useCase.execute(playerId, 'click_1');
      
      expect(result.success).toBe(true);
      expect(result.upgrade!.purchased).toBe(1);
    });

    it('debería deducir los coins del jugador', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      const player = await playerRepo.findById(playerId);
      player!.coins = 100;
      player!.upgrades.push({
        id: 'click_1',
        name: 'Dedo Rápido',
        description: 'Mejora tu dedo',
        cost: 10,
        costMultiplier: 1,
        effect: 1,
        maxLevel: 100,
        purchased: 0,
      });
      await playerRepo.update(player!);
      
      await useCase.execute(playerId, 'click_1');
      
      const updatedPlayer = await playerRepo.findById(playerId);
      expect(updatedPlayer!.coins).toBe(90); // 100 - 10
    });

    it('debería aumentar coinsPerClick para upgrades de tipo click', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      const player = await playerRepo.findById(playerId);
      player!.coins = 100;
      player!.upgrades.push({
        id: 'click_1',
        name: 'Dedo Rápido',
        description: 'Mejora tu dedo',
        cost: 10,
        costMultiplier: 1,
        effect: 1,
        maxLevel: 100,
        purchased: 0,
      });
      await playerRepo.update(player!);
      
      await useCase.execute(playerId, 'click_1');
      
      const updatedPlayer = await playerRepo.findById(playerId);
      expect(updatedPlayer!.coinsPerClick).toBe(2); // 1 base + 1
    });

    it('debería aumentar coinsPerSecond para upgrades de tipo passive', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      const player = await playerRepo.findById(playerId);
      player!.coins = 100;
      player!.upgrades.push({
        id: 'passive_1',
        name: 'Inversor Novato',
        description: 'Gana dinero automáticamente',
        cost: 50,
        costMultiplier: 1,
        effect: 1,
        maxLevel: 100,
        purchased: 0,
      });
      await playerRepo.update(player!);
      
      await useCase.execute(playerId, 'passive_1');
      
      const updatedPlayer = await playerRepo.findById(playerId);
      expect(updatedPlayer!.coinsPerSecond).toBe(1);
    });
  });

  describe('Errores de validación', () => {
    it('debería retornar error si el jugador no tiene suficientes coins', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      const player = await playerRepo.findById(playerId);
      player!.coins = 5; // Menos que el costo
      player!.upgrades.push({
        id: 'click_1',
        name: 'Dedo Rápido',
        description: 'Mejora tu dedo',
        cost: 10,
        costMultiplier: 1,
        effect: 1,
        maxLevel: 100,
        purchased: 0,
      });
      await playerRepo.update(player!);
      
      const result = await useCase.execute(playerId, 'click_1');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient coins');
    });

    it('debería retornar error si el upgrade no existe en el inventario', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      const result = await useCase.execute(playerId, 'click_1');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Upgrade not found');
    });

    it('debería retornar error si el upgrade alcanzó el nivel máximo', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      const player = await playerRepo.findById(playerId);
      player!.coins = 10000;
      player!.upgrades.push({
        id: 'click_1',
        name: 'Dedo Rápido',
        description: 'Mejora tu dedo',
        cost: 10,
        costMultiplier: 1,
        effect: 1,
        maxLevel: 100,
        purchased: 100, // Ya alcanzó el máximo
      });
      await playerRepo.update(player!);
      
      const result = await useCase.execute(playerId, 'click_1');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Max level reached');
    });
  });

  describe('Escalado de costo', () => {
    it('debería aumentar el costo para el siguiente nivel', async () => {
      const playerId = 'player-123';
      await getPlayerUseCase.execute(playerId);
      
      const player = await playerRepo.findById(playerId);
      player!.coins = 1000;
      player!.upgrades.push({
        id: 'click_1',
        name: 'Dedo Rápido',
        description: 'Mejora tu dedo',
        cost: 10,
        costMultiplier: 1.5,
        effect: 1,
        maxLevel: 100,
        purchased: 0,
      });
      await playerRepo.update(player!);
      
      // Primera compra
      await useCase.execute(playerId, 'click_1');
      
      // Verificar nuevo costo
      const updatedPlayer = await playerRepo.findById(playerId);
      const upgrade = updatedPlayer!.upgrades.find(u => u.id === 'click_1');
      
      // Costo nivel 1: 10 * 1.5^1 = 15
      expect(upgrade!.cost).toBe(15);
    });
  });
});
