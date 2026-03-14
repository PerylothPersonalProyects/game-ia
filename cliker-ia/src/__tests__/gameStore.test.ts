import { describe, it, expect } from 'vitest';
import type { GameState } from '../types';
import { initialState, clickCoins, passiveIncome, purchaseUpgrade, canAfford, calculateCost, INITIAL_UPGRADES } from '../store/gameStore';

describe('Game Store - Sistema de Recursos', () => {
  describe('clickCoins', () => {
    it('debe agregar 1 moneda por click inicial', () => {
      const newState = clickCoins(initialState);
      expect(newState.coins).toBe(1);
    });

    it('debe agregar monedas segun coinsPerClick', () => {
      const state: GameState = { ...initialState, coinsPerClick: 5 };
      const newState = clickCoins(state);
      expect(newState.coins).toBe(5);
    });

    it('no debe modificar el estado original', () => {
      clickCoins(initialState);
      expect(initialState.coins).toBe(0);
    });
  });

  describe('passiveIncome', () => {
    it('debe agregar 1 moneda por segundo inicial', () => {
      const newState = passiveIncome(initialState);
      expect(newState.coins).toBe(0);
    });

    it('debe agregar monedas segun coinsPerSecond', () => {
      const state: GameState = { ...initialState, coinsPerSecond: 10 };
      const newState = passiveIncome(state);
      expect(newState.coins).toBe(10);
    });
  });

  describe('calculateCost', () => {
    it('debe calcular costo base correctamente', () => {
      const upgrade = INITIAL_UPGRADES[0];
      expect(calculateCost(upgrade)).toBe(10);
    });

    it('debe incrementar costo con multiplicador', () => {
      const upgrade = { ...INITIAL_UPGRADES[0], purchased: 1 };
      expect(calculateCost(upgrade)).toBe(15);
    });

    it('debe incrementar costo exponencialmente', () => {
      const upgrade = { ...INITIAL_UPGRADES[0], purchased: 2 };
      expect(calculateCost(upgrade)).toBe(22);
    });
  });

  describe('purchaseUpgrade', () => {
    it('no debe comprar si no hay suficientes monedas', () => {
      const newState = purchaseUpgrade(initialState, 'cursor');
      expect(newState).toBe(initialState);
    });

    it('debe comprar upgrade con suficientes monedas', () => {
      const state: GameState = { ...initialState, coins: 100 };
      const newState = purchaseUpgrade(state, 'cursor');
      expect(newState.upgrades[0].purchased).toBe(1);
      expect(newState.coinsPerClick).toBe(2);
    });

    it('debe decrementar monedas al comprar', () => {
      const state: GameState = { ...initialState, coins: 100 };
      const newState = purchaseUpgrade(state, 'cursor');
      expect(newState.coins).toBe(90);
    });

    it('no debe exceder maxLevel', () => {
      const state: GameState = {
        ...initialState,
        coins: 10000,
        upgrades: [{ ...INITIAL_UPGRADES[0], purchased: 100 }],
      };
      const newState = purchaseUpgrade(state, 'cursor');
      expect(newState.upgrades[0].purchased).toBe(100);
    });

    it('debe aumentar coinsPerSecond para upgrades pasivos', () => {
      const state: GameState = { ...initialState, coins: 100 };
      const newState = purchaseUpgrade(state, 'grandma');
      expect(newState.coinsPerSecond).toBe(1);
    });
  });

  describe('canAfford', () => {
    it('debe retornar false sin suficientes monedas', () => {
      expect(canAfford(initialState, 'cursor')).toBe(false);
    });

    it('debe retornar true con suficientes monedas', () => {
      const state: GameState = { ...initialState, coins: 100 };
      expect(canAfford(state, 'cursor')).toBe(true);
    });

    it('debe retornar false cuando maxLevel alcanzado', () => {
      const state: GameState = {
        ...initialState,
        coins: 10000,
        upgrades: [{ ...INITIAL_UPGRADES[0], purchased: 100 }],
      };
      expect(canAfford(state, 'cursor')).toBe(false);
    });
  });
});
