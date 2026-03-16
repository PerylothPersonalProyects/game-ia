import { describe, it, expect, beforeEach } from 'vitest';
import { GetOrCreatePlayerUseCase } from '../../usecases/GetOrCreatePlayerUseCase.js';
import { 
  InMemoryPlayerRepository, 
  InMemoryUpgradeConfigRepository,
  createDefaultUpgradeConfigRepository 
} from '../../adapters/in-memory/index.js';

describe('UC-001: Iniciar Sesión del Jugador', () => {
  let playerRepo: InMemoryPlayerRepository;
  let upgradeConfigRepo: InMemoryUpgradeConfigRepository;
  let useCase: GetOrCreatePlayerUseCase;

  beforeEach(() => {
    playerRepo = new InMemoryPlayerRepository();
    upgradeConfigRepo = createDefaultUpgradeConfigRepository();
    useCase = new GetOrCreatePlayerUseCase(playerRepo, upgradeConfigRepo);
  });

  describe('Jugador nuevo', () => {
    it('debería crear un nuevo jugador si no existe', async () => {
      const playerId = 'player-123';
      
      const gameState = await useCase.execute(playerId);
      
      expect(gameState.coins).toBe(0);
      expect(gameState.coinsPerClick).toBe(1);
      expect(gameState.coinsPerSecond).toBe(0);
    });

    it('debería inicializar con upgrades vacíos', async () => {
      const playerId = 'player-123';
      
      const gameState = await useCase.execute(playerId);
      
      expect(gameState.upgrades).toEqual([]);
    });

    it('debería tener upgrades en el shop', async () => {
      const playerId = 'player-123';
      
      const gameState = await useCase.execute(playerId);
      
      expect(gameState.shopUpgrades).toBeDefined();
      expect(gameState.shopUpgrades!.length).toBeGreaterThan(0);
    });

    it('debería garantizar al menos 1 upgrade de Tier 1 en el shop', async () => {
      const playerId = 'player-123';
      
      const gameState = await useCase.execute(playerId);
      
      const hasTier1 = gameState.shopUpgrades!.some(u => 
        u.id.includes('_1_') || u.id === 'click_1' || u.id === 'passive_1'
      );
      expect(hasTier1).toBe(true);
    });
  });

  describe('Jugador existente', () => {
    it('debería retornar el jugador existente si ya existe', async () => {
      const playerId = 'player-123';
      
      // Crear primeramente el jugador
      await useCase.execute(playerId);
      
      // Llamar nuevamente
      const gameState = await useCase.execute(playerId);
      
      // El jugador sigue siendo el mismo (no se crea otro)
      const players = playerRepo.getAll();
      expect(players.length).toBe(1);
    });

    it('debería preservar los coins del jugador existente', async () => {
      const playerId = 'player-123';
      
      // Crear jugador
      await useCase.execute(playerId);
      
      // Simular que el jugador tiene coins (directo en repo)
      const player = await playerRepo.findById(playerId);
      player!.coins = 100;
      await playerRepo.update(player!);
      
      // Obtener estado
      const gameState = await useCase.execute(playerId);
      
      expect(gameState.coins).toBe(100);
    });

    it('debería preservar los upgrades comprados', async () => {
      const playerId = 'player-123';
      
      // Crear jugador
      await useCase.execute(playerId);
      
      // Agregar un upgrade manualmente
      const player = await playerRepo.findById(playerId);
      player!.upgrades.push({
        id: 'click_1',
        name: 'Dedo Rápido',
        description: 'Mejora tu dedo',
        cost: 10,
        costMultiplier: 1.5,
        effect: 1,
        maxLevel: 100,
        purchased: 3,
      });
      player!.coinsPerClick = 4; // 1 base + 3
      await playerRepo.update(player!);
      
      // Obtener estado
      const gameState = await useCase.execute(playerId);
      
      expect(gameState.upgrades.length).toBe(1);
      expect(gameState.upgrades[0].purchased).toBe(3);
      expect(gameState.coinsPerClick).toBe(4);
    });
  });

  describe('Validaciones', () => {
    it('debería crear un jugador con cualquier playerId válido', async () => {
      // El caso de uso permite cualquier string como ID
      const gameState = await useCase.execute('');
      
      expect(gameState.coins).toBe(0);
      expect(gameState.shopUpgrades!.length).toBeGreaterThan(0);
    });
  });
});
