import { describe, it, expect } from 'vitest';
import { GameEngine, resolveUpgradeId, isClickUpgrade, isPassiveUpgrade } from '../store/gameStore';
import type { GameState, Upgrade } from '../types';

// Helper para crear estados mock
const createMockUpgrade = (overrides: Partial<Upgrade> = {}): Upgrade => ({
  id: 'click_1',
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

describe('GameEngine - click', () => {
  it('debe agregar coinsPerClick al hacer click', () => {
    const state = createMockState({ coins: 5, coinsPerClick: 3 });
    const result = GameEngine.click(state);
    expect(result.coins).toBe(8);
  });

  it('no debe modificar el estado original', () => {
    const state = createMockState({ coins: 5 });
    GameEngine.click(state);
    expect(state.coins).toBe(5);
  });

  it('debe funcionar con coinsPerClick de 1 (default)', () => {
    const state = createMockState({ coins: 0, coinsPerClick: 1 });
    const result = GameEngine.click(state);
    expect(result.coins).toBe(1);
  });
});

describe('GameEngine - passiveIncome', () => {
  it('debe agregar coinsPerSecond', () => {
    const state = createMockState({ coins: 5, coinsPerSecond: 10 });
    const result = GameEngine.passiveIncome(state);
    expect(result.coins).toBe(15);
  });

  it('debe funcionar con 0 coinsPerSecond', () => {
    const state = createMockState({ coins: 5, coinsPerSecond: 0 });
    const result = GameEngine.passiveIncome(state);
    expect(result.coins).toBe(5);
  });
});

describe('GameEngine - passiveIncomeMultiplied', () => {
  it('debe multiplicar correctamente', () => {
    const state = createMockState({ coins: 0, coinsPerSecond: 5 });
    const result = GameEngine.passiveIncomeMultiplied(state, 3);
    expect(result.coins).toBe(15);
  });

  it('debe manejar segundos decimales', () => {
    const state = createMockState({ coins: 0, coinsPerSecond: 10 });
    const result = GameEngine.passiveIncomeMultiplied(state, 1.5);
    expect(result.coins).toBe(15);
  });
});

describe('GameEngine - purchase', () => {
  it('debe comprar upgrade exitosamente', () => {
    const upgrade = createMockUpgrade({ id: 'click_1', cost: 10 });
    const state = createMockState({ 
      coins: 100, 
      upgrades: [upgrade] 
    });
    
    const result = GameEngine.purchase(state, 'click_1');
    
    expect(result.coins).toBe(90);
    expect(result.coinsPerClick).toBe(2); // 1 + effect
    expect(result.upgrades[0].purchased).toBe(1);
  });

  it('no debe comprar si no hay suficientes monedas', () => {
    const upgrade = createMockUpgrade({ cost: 100 });
    const state = createMockState({ 
      coins: 50, 
      upgrades: [upgrade] 
    });
    
    const result = GameEngine.purchase(state, 'click_1');
    
    expect(result.coins).toBe(50);
    expect(result.upgrades[0].purchased).toBe(0);
  });

  it('no debe comprar si maxLevel alcanzado', () => {
    const upgrade = createMockUpgrade({ 
      cost: 10, 
      maxLevel: 5, 
      purchased: 5 
    });
    const state = createMockState({ 
      coins: 1000, 
      upgrades: [upgrade] 
    });
    
    const result = GameEngine.purchase(state, 'click_1');
    
    expect(result.coins).toBe(1000);
    expect(result.upgrades[0].purchased).toBe(5);
  });

  it('debe aumentar coinsPerSecond para upgrades pasivos', () => {
    const upgrade = createMockUpgrade({ 
      id: 'passive_1', 
      type: 'passive', 
      cost: 50, 
      effect: 1 
    });
    const state = createMockState({ 
      coins: 100, 
      upgrades: [upgrade] 
    });
    
    const result = GameEngine.purchase(state, 'passive_1');
    
    expect(result.coinsPerSecond).toBe(1);
  });

  it('debe crear upgrade si no existe (legacy ID)', () => {
    const state = createMockState({ coins: 100 });
    
    const result = GameEngine.purchase(state, 'cursor');
    
    expect(result.upgrades).toHaveLength(1);
    expect(result.upgrades[0].id).toBe('click_1');
    expect(result.upgrades[0].purchased).toBe(1);
  });

  it('debe incrementar el costo después de comprar', () => {
    const upgrade = createMockUpgrade({ 
      id: 'click_1', 
      cost: 10, 
      costMultiplier: 1.5 
    });
    const state = createMockState({ 
      coins: 100, 
      upgrades: [upgrade] 
    });
    
    const result = GameEngine.purchase(state, 'click_1');
    
    // 10 * 1.5 = 15
    expect(result.upgrades[0].cost).toBe(15);
  });
});

describe('GameEngine - canAfford', () => {
  it('debe retornar true con suficientes monedas', () => {
    const upgrade = createMockUpgrade({ cost: 50 });
    const state = createMockState({ coins: 100, upgrades: [upgrade] });
    
    expect(GameEngine.canAfford(state, 'click_1')).toBe(true);
  });

  it('debe retornar false sin suficientes monedas', () => {
    const upgrade = createMockUpgrade({ cost: 100 });
    const state = createMockState({ coins: 50, upgrades: [upgrade] });
    
    expect(GameEngine.canAfford(state, 'click_1')).toBe(false);
  });

  it('debe retornar false en maxLevel', () => {
    const upgrade = createMockUpgrade({ cost: 10, maxLevel: 5, purchased: 5 });
    const state = createMockState({ coins: 1000, upgrades: [upgrade] });
    
    expect(GameEngine.canAfford(state, 'click_1')).toBe(false);
  });

  it('debe retornar true en el límite exacto', () => {
    const upgrade = createMockUpgrade({ cost: 100 });
    const state = createMockState({ coins: 100, upgrades: [upgrade] });
    
    expect(GameEngine.canAfford(state, 'click_1')).toBe(true);
  });

  it('debe funcionar con legacy IDs', () => {
    const state = createMockState({ coins: 100 });
    
    expect(GameEngine.canAfford(state, 'cursor')).toBe(true);
    expect(GameEngine.canAfford(state, 'grandma')).toBe(true);
  });
});

describe('GameEngine - calculatePurchase', () => {
  it('debe calcular correctamente', () => {
    const upgrade = createMockUpgrade({ cost: 10, costMultiplier: 1.5 });
    const state = createMockState({ coins: 100 });
    
    const result = GameEngine.calculatePurchase(state, upgrade);
    
    expect(result.canAfford).toBe(true);
    expect(result.newCost).toBe(15); // 10 * 1.5
  });

  it('debe retornar false si no puede comprar', () => {
    const upgrade = createMockUpgrade({ cost: 100 });
    const state = createMockState({ coins: 50 });
    
    const result = GameEngine.calculatePurchase(state, upgrade);
    
    expect(result.canAfford).toBe(false);
  });
});

describe('GameEngine - createInitialState', () => {
  it('debe crear estado inicial válido', () => {
    const state = GameEngine.createInitialState();
    
    expect(state.coins).toBe(0);
    expect(state.coinsPerClick).toBe(1);
    expect(state.coinsPerSecond).toBe(0);
    expect(state.upgrades).toEqual([]);
    expect(state.shopUpgrades).toEqual([]);
  });
});

describe('GameEngine - reset', () => {
  it('debe reiniciar al estado inicial', () => {
    const state = createMockState({ 
      coins: 1000, 
      coinsPerClick: 50,
      upgrades: [createMockUpgrade({ purchased: 10 })]
    });
    
    const result = GameEngine.reset(state);
    
    expect(result.coins).toBe(0);
    expect(result.coinsPerClick).toBe(1);
    expect(result.upgrades).toEqual([]);
  });
});

describe('resolveUpgradeId', () => {
  it('debe resolver IDs legacy', () => {
    expect(resolveUpgradeId('cursor')).toBe('click_1');
    expect(resolveUpgradeId('grandma')).toBe('passive_1');
    expect(resolveUpgradeId('farm')).toBe('passive_2');
  });

  it('debe mantener IDs modernos', () => {
    expect(resolveUpgradeId('click_1')).toBe('click_1');
    expect(resolveUpgradeId('passive_3')).toBe('passive_3');
  });

  it('debe retornar ID desconocido tal cual', () => {
    expect(resolveUpgradeId('unknown')).toBe('unknown');
  });
});

describe('isClickUpgrade', () => {
  it('debe detectar upgrades de click', () => {
    expect(isClickUpgrade('cursor')).toBe(true);
    expect(isClickUpgrade('click_1')).toBe(true);
    expect(isClickUpgrade('click_2')).toBe(true);
  });

  it('debe retornar false para upgrades pasivos', () => {
    expect(isClickUpgrade('grandma')).toBe(false);
    expect(isClickUpgrade('passive_1')).toBe(false);
  });
});

describe('isPassiveUpgrade', () => {
  it('debe detectar upgrades pasivos', () => {
    expect(isPassiveUpgrade('grandma')).toBe(true);
    expect(isPassiveUpgrade('farm')).toBe(true);
    expect(isPassiveUpgrade('mine')).toBe(true);
    expect(isPassiveUpgrade('passive_1')).toBe(true);
    expect(isPassiveUpgrade('passive_2')).toBe(true);
  });

  it('debe retornar false para upgrades de click', () => {
    expect(isPassiveUpgrade('cursor')).toBe(false);
    expect(isPassiveUpgrade('click_1')).toBe(false);
  });
});

describe('Integración: flujo completo de compra', () => {
  it('debe manejar múltiples compras secuenciales', () => {
    const upgrade = createMockUpgrade({ cost: 10, costMultiplier: 1.5 });
    let state = createMockState({ coins: 100, upgrades: [upgrade] });
    
    // Primera compra
    state = GameEngine.purchase(state, 'click_1');
    expect(state.coins).toBe(90);
    expect(state.coinsPerClick).toBe(2);
    expect(state.upgrades[0].cost).toBe(15);
    
    // Segunda compra
    state = GameEngine.purchase(state, 'click_1');
    expect(state.coins).toBe(75); // 90 - 15
    expect(state.coinsPerClick).toBe(3);
    expect(state.upgrades[0].cost).toBe(22); // 15 * 1.5 = 22.5 -> 22
  });

  it('debe comprar click y passive upgrades correctamente', () => {
    const clickUpgrade = createMockUpgrade({ id: 'click_1', cost: 10, effect: 1, type: 'click' });
    const passiveUpgrade = createMockUpgrade({ id: 'passive_1', cost: 50, effect: 1, type: 'passive' });
    
    let state = createMockState({ 
      coins: 200, 
      upgrades: [clickUpgrade, passiveUpgrade] 
    });
    
    // Comprar click upgrade
    state = GameEngine.purchase(state, 'click_1');
    expect(state.coinsPerClick).toBe(2);
    expect(state.coinsPerSecond).toBe(0);
    
    // Comprar passive upgrade
    state = GameEngine.purchase(state, 'passive_1');
    expect(state.coinsPerClick).toBe(2);
    expect(state.coinsPerSecond).toBe(1);
  });
});
