import { describe, it, expect } from 'vitest';
import { stateToRenderData } from '../game/gameApi';
import type { GameState, Upgrade } from '../types';

// Helper para crear estados mock
const createMockUpgrade = (overrides: Partial<Upgrade> = {}): Upgrade => ({
  id: 'cursor',
  name: 'Cursor',
  description: 'Click extra',
  cost: 10,
  costMultiplier: 1.5,
  effect: 1,
  maxLevel: 10,
  purchased: 0,
  type: 'click',
  ...overrides,
});

const createMockState = (overrides: Partial<GameState> = {}): GameState => ({
  coins: 0,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  upgrades: [],
  shopUpgrades: [],
  ...overrides,
});

describe('gameApi - stateToRenderData', () => {
  describe('conversión de stats básicos', () => {
    it('debe convertir estado vacío a datos de renderizado', () => {
      const state = createMockState();
      const result = stateToRenderData(state);

      expect(result.stats).toEqual({
        coins: 0,
        coinsPerClick: 1,
        coinsPerSecond: 0,
      });
    });

    it('debe convertir estado con valores básicos', () => {
      const state = createMockState({
        coins: 150,
        coinsPerClick: 5,
        coinsPerSecond: 10,
      });

      const result = stateToRenderData(state);

      expect(result.stats).toEqual({
        coins: 150,
        coinsPerClick: 5,
        coinsPerSecond: 10,
      });
    });

    it('debe truncar monedas decimales con Math.floor', () => {
      const state = createMockState({
        coins: 100.7,
      });

      const result = stateToRenderData(state);

      expect(result.stats.coins).toBe(100);
      expect(typeof result.stats.coins).toBe('number');
    });

    it('debe mantener coins como número entero cuando ya es entero', () => {
      const state = createMockState({
        coins: 100,
      });

      const result = stateToRenderData(state);

      expect(result.stats.coins).toBe(100);
    });
  });

  describe('conversión de upgrades', () => {
    it('debe retornar array vacío cuando no hay upgrades', () => {
      const state = createMockState();
      const result = stateToRenderData(state);

      expect(result.upgrades).toEqual([]);
    });

    it('debe convertir un upgrade correctamente', () => {
      const upgrade = createMockUpgrade({
        id: 'cursor',
        name: 'Cursor',
        cost: 15,
        purchased: 2,
        maxLevel: 10,
        type: 'click',
      });

      const state = createMockState({
        coins: 100,
        upgrades: [upgrade],
      });

      const result = stateToRenderData(state);

      expect(result.upgrades).toHaveLength(1);
      expect(result.upgrades[0]).toEqual({
        id: 'cursor',
        name: 'Cursor',
        description: 'Click extra',
        level: 2,
        maxLevel: 10,
        cost: 15,
        canAfford: true,
        type: 'click',
      });
    });

    it('debe convertir múltiples upgrades', () => {
      const upgrades = [
        createMockUpgrade({ id: 'cursor', name: 'Cursor', cost: 10 }),
        createMockUpgrade({ id: 'grandma', name: 'Grandma', cost: 50, type: 'passive' }),
        createMockUpgrade({ id: 'farm', name: 'Farm', cost: 100, type: 'passive' }),
      ];

      const state = createMockState({
        upgrades,
      });

      const result = stateToRenderData(state);

      expect(result.upgrades).toHaveLength(3);
      expect(result.upgrades.map(u => u.id)).toEqual(['cursor', 'grandma', 'farm']);
    });
  });

  describe('priorización de shopUpgrades', () => {
    it('debe usar shopUpgrades cuando están disponibles', () => {
      const shopUpgrade = createMockUpgrade({ id: 'shop-cursor', name: 'Shop Cursor', cost: 20 });
      const oldUpgrade = createMockUpgrade({ id: 'old-cursor', name: 'Old Cursor', cost: 5 });

      const state = createMockState({
        upgrades: [oldUpgrade],
        shopUpgrades: [shopUpgrade],
      });

      const result = stateToRenderData(state);

      expect(result.upgrades).toHaveLength(1);
      expect(result.upgrades[0].id).toBe('shop-cursor');
    });

    it('debe usar upgrades como fallback cuando shopUpgrades está vacío', () => {
      const oldUpgrade = createMockUpgrade({ id: 'old-cursor', name: 'Old Cursor' });

      const state = createMockState({
        upgrades: [oldUpgrade],
        shopUpgrades: [],
      });

      const result = stateToRenderData(state);

      expect(result.upgrades).toHaveLength(1);
      expect(result.upgrades[0].id).toBe('old-cursor');
    });

    it('debe usar upgrades como fallback cuando shopUpgrades es undefined', () => {
      const oldUpgrade = createMockUpgrade({ id: 'old-cursor', name: 'Old Cursor' });

      const state: GameState = {
        coins: 0,
        coinsPerClick: 1,
        coinsPerSecond: 0,
        upgrades: [oldUpgrade],
      };

      const result = stateToRenderData(state);

      expect(result.upgrades).toHaveLength(1);
      expect(result.upgrades[0].id).toBe('old-cursor');
    });
  });

  describe('cálculo de canAfford', () => {
    it('debe retornar true cuando el jugador tiene suficientes monedas', () => {
      const upgrade = createMockUpgrade({ cost: 50 });
      const state = createMockState({
        coins: 100,
        shopUpgrades: [upgrade],
      });

      const result = stateToRenderData(state);

      expect(result.upgrades[0].canAfford).toBe(true);
    });

    it('debe retornar false cuando el jugador no tiene suficientes monedas', () => {
      const upgrade = createMockUpgrade({ cost: 100 });
      const state = createMockState({
        coins: 50,
        shopUpgrades: [upgrade],
      });

      const result = stateToRenderData(state);

      expect(result.upgrades[0].canAfford).toBe(false);
    });

    it('debe retornar false cuando el upgrade está en maxLevel', () => {
      const upgrade = createMockUpgrade({
        cost: 10,
        purchased: 10,
        maxLevel: 10,
      });
      const state = createMockState({
        coins: 10000, // Muchas monedas
        shopUpgrades: [upgrade],
      });

      const result = stateToRenderData(state);

      expect(result.upgrades[0].canAfford).toBe(false);
    });

    it('debe retornar false cuando purchased >= maxLevel', () => {
      const upgrade = createMockUpgrade({
        cost: 10,
        purchased: 5,
        maxLevel: 3, // purchased > maxLevel
      });
      const state = createMockState({
        coins: 10000,
        shopUpgrades: [upgrade],
      });

      const result = stateToRenderData(state);

      expect(result.upgrades[0].canAfford).toBe(false);
    });

    it('debe retornar true en el límite exacto (coins == cost)', () => {
      const upgrade = createMockUpgrade({ cost: 100 });
      const state = createMockState({
        coins: 100,
        shopUpgrades: [upgrade],
      });

      const result = stateToRenderData(state);

      expect(result.upgrades[0].canAfford).toBe(true);
    });
  });

  describe('valores por defecto', () => {
    it('debe usar maxLevel 9999 cuando no está definido', () => {
      const upgrade: Upgrade = {
        id: 'test',
        name: 'Test',
        description: 'Test upgrade',
        cost: 10,
        costMultiplier: 1.5,
        effect: 1,
        maxLevel: undefined as any,
        purchased: 5,
        type: 'click',
      };

      const state = createMockState({
        shopUpgrades: [upgrade],
      });

      const result = stateToRenderData(state);

      expect(result.upgrades[0].maxLevel).toBe(9999);
    });

    it('debe usar type "click" por defecto cuando no está definido', () => {
      const upgrade: Upgrade = {
        id: 'test',
        name: 'Test',
        description: 'Test upgrade',
        cost: 10,
        costMultiplier: 1.5,
        effect: 1,
        maxLevel: 10,
        purchased: 0,
        type: undefined as any,
      };

      const state = createMockState({
        shopUpgrades: [upgrade],
      });

      const result = stateToRenderData(state);

      expect(result.upgrades[0].type).toBe('click');
    });
  });

  describe('tipos de upgrades', () => {
    it('debe manejar upgrades de tipo click', () => {
      const upgrade = createMockUpgrade({ type: 'click' });
      const state = createMockState({
        shopUpgrades: [upgrade],
      });

      const result = stateToRenderData(state);

      expect(result.upgrades[0].type).toBe('click');
    });

    it('debe manejar upgrades de tipo passive', () => {
      const upgrade = createMockUpgrade({ type: 'passive' });
      const state = createMockState({
        shopUpgrades: [upgrade],
      });

      const result = stateToRenderData(state);

      expect(result.upgrades[0].type).toBe('passive');
    });
  });

  describe('integración: flujo completo', () => {
    it('debe renderizar correctamente un estado completo de juego', () => {
      const upgrades = [
        createMockUpgrade({ id: 'cursor', name: 'Cursor', cost: 15, purchased: 3, type: 'click' }),
        createMockUpgrade({ id: 'grandma', name: 'Grandma', cost: 100, purchased: 1, type: 'passive' }),
        createMockUpgrade({ id: 'mine', name: 'Mine', cost: 500, purchased: 0, type: 'passive' }),
      ];

      const state = createMockState({
        coins: 250,
        coinsPerClick: 4,
        coinsPerSecond: 15,
        shopUpgrades: upgrades,
      });

      const result = stateToRenderData(state);

      // Verificar stats
      expect(result.stats).toEqual({
        coins: 250,
        coinsPerClick: 4,
        coinsPerSecond: 15,
      });

      // Verificar upgrades
      expect(result.upgrades).toHaveLength(3);

      // Cursor: puede comprar (250 >= 15, 3 < 10)
      expect(result.upgrades[0].canAfford).toBe(true);
      expect(result.upgrades[0].level).toBe(3);

      // Grandma: puede comprar (250 >= 100, 1 < 5)
      expect(result.upgrades[1].canAfford).toBe(true);
      expect(result.upgrades[1].level).toBe(1);

      // Mine: no puede comprar (250 < 500)
      expect(result.upgrades[2].canAfford).toBe(false);
      expect(result.upgrades[2].level).toBe(0);
    });

    it('debe manejar estado con many coins correctamente', () => {
      const upgrade = createMockUpgrade({ cost: 1000000 });
      const state = createMockState({
        coins: 999999999,
        shopUpgrades: [upgrade],
      });

      const result = stateToRenderData(state);

      expect(result.stats.coins).toBe(999999999);
      expect(result.upgrades[0].canAfford).toBe(true);
    });

    it('debe manejar valores negativos de coins', () => {
      const upgrade = createMockUpgrade({ cost: 10 });
      const state = createMockState({
        coins: -50,
        shopUpgrades: [upgrade],
      });

      const result = stateToRenderData(state);

      expect(result.stats.coins).toBe(-50);
      expect(result.upgrades[0].canAfford).toBe(false);
    });
  });
});
