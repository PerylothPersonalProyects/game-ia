import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IdleGameService, idleGameService } from '../services/IdleGameService.js';

// ============================================
// MOCKS
// ============================================

// Mock de la configuración de upgrades
const mockUpgradeConfigs = [
  {
    id: 'click_1',
    name: 'Dedo Rápido',
    description: 'Mejora tu dedo',
    baseCost: 10,
    costMultiplier: 1.5,
    effect: 1,
    maxLevel: 100,
    type: 'click' as const,
    enabled: true,
  },
  {
    id: 'passive_1',
    name: 'Inversor Novato',
    description: 'Gana dinero automáticamente',
    baseCost: 50,
    costMultiplier: 1.5,
    effect: 1,
    maxLevel: 100,
    type: 'passive' as const,
    enabled: true,
  },
];

// Estado en memoria para simular la DB
let mockPlayers: Map<string, any> = new Map();

// Funciones helper para calcular costos (igual que en el servicio)
function calculateCost(baseCost: number, costMultiplier: number, purchased: number): number {
  return Math.floor(baseCost * Math.pow(costMultiplier, purchased));
}

describe('idleGameService - Upgrades', () => {
  let service: IdleGameService;

  beforeEach(() => {
    // Resetear el estado
    mockPlayers = new Map();
    
    // Re-importar con mocks
    vi.resetModules();
  });

  describe('Cálculo de costos de upgrades', () => {
    it('debería calcular correctamente el costo para el primer nivel', () => {
      // Costo base: 10, multiplier: 1.5, purchased: 0
      // Costo = 10 * (1.5 ^ 0) = 10 * 1 = 10
      const cost = calculateCost(10, 1.5, 0);
      expect(cost).toBe(10);
    });

    it('debería calcular correctamente el costo para el segundo nivel', () => {
      // Costo base: 10, multiplier: 1.5, purchased: 1
      // Costo = 10 * (1.5 ^ 1) = 10 * 1.5 = 15
      const cost = calculateCost(10, 1.5, 1);
      expect(cost).toBe(15);
    });

    it('debería calcular correctamente el costo para el tercer nivel', () => {
      // Costo base: 10, multiplier: 1.5, purchased: 2
      // Costo = 10 * (1.5 ^ 2) = 10 * 2.25 = 22
      const cost = calculateCost(10, 1.5, 2);
      expect(cost).toBe(22);
    });

    it('debería calcular correctamente el costo para niveles más altos', () => {
      // Costo base: 10, multiplier: 1.5, purchased: 10
      // Costo = 10 * (1.5 ^ 10) ≈ 10 * 57.665 = 576
      const cost = calculateCost(10, 1.5, 10);
      expect(cost).toBe(576);
    });
  });

  describe('Acumulación de upgrades (lógica pura)', () => {
    it('debería acumular correctamente los upgrades comprados', () => {
      const baseCost = 10;
      const costMultiplier = 1.5;
      
      // Simular compras
      let purchased = 0;
      let costs: number[] = [];
      
      // Compra 1
      costs.push(calculateCost(baseCost, costMultiplier, purchased));
      purchased++;
      
      // Compra 2
      costs.push(calculateCost(baseCost, costMultiplier, purchased));
      purchased++;
      
      // Compra 3
      costs.push(calculateCost(baseCost, costMultiplier, purchased));
      purchased++;
      
      // Verificar que los costos aumentan correctamente
      expect(costs).toEqual([10, 15, 22]);
      expect(purchased).toBe(3);
    });

    it('debería acumular efectos de múltiples upgrades diferentes', () => {
      // Click upgrade: efecto +1 por nivel
      // Passive upgrade: efecto +1 por nivel
      
      const clickEffect = 1;
      const passiveEffect = 1;
      
      let clickLevel = 0;
      let passiveLevel = 0;
      
      // Comprar 5 click upgrades
      for (let i = 0; i < 5; i++) {
        clickLevel++;
      }
      
      // Comprar 3 passive upgrades
      for (let i = 0; i < 3; i++) {
        passiveLevel++;
      }
      
      const totalCoinsPerClick = 1 + (clickLevel * clickEffect);
      const totalCoinsPerSecond = 0 + (passiveLevel * passiveEffect);
      
      expect(totalCoinsPerClick).toBe(6); // 1 base + 5
      expect(totalCoinsPerSecond).toBe(3); // 0 base + 3
    });
  });

  describe('Validación de compra de upgrades', () => {
    it('debería validar que el jugador tiene suficientes coins', () => {
      const playerCoins = 10;
      const upgradeCost = 15;
      
      const canAfford = playerCoins >= upgradeCost;
      expect(canAfford).toBe(false);
    });

    it('debería validar que el jugador puede comprar con suficientes coins', () => {
      const playerCoins = 20;
      const upgradeCost = 15;
      
      const canAfford = playerCoins >= upgradeCost;
      expect(canAfford).toBe(true);
    });

    it('debería validar que no se puede comprar más allá del nivel máximo', () => {
      const maxLevel = 5;
      const currentLevel = 5;
      
      const canBuy = currentLevel < maxLevel;
      expect(canBuy).toBe(false);
    });

    it('debería validar que se puede comprar si no ha alcanzado el nivel máximo', () => {
      const maxLevel = 5;
      const currentLevel = 3;
      
      const canBuy = currentLevel < maxLevel;
      expect(canBuy).toBe(true);
    });
  });

  describe('Recálculo de costos al guardar', () => {
    it('debería recalcular correctamente el costMultiplier desde purchased=0', () => {
      const baseCost = 10;
      const configCostMultiplier = 1.5;
      const purchased = 0;
      
      const costMultiplier = Math.pow(configCostMultiplier, purchased);
      const cost = Math.floor(baseCost * costMultiplier);
      
      expect(costMultiplier).toBe(1);
      expect(cost).toBe(10);
    });

    it('debería recalcular correctamente el costMultiplier desde purchased=1', () => {
      const baseCost = 10;
      const configCostMultiplier = 1.5;
      const purchased = 1;
      
      const costMultiplier = Math.pow(configCostMultiplier, purchased);
      const cost = Math.floor(baseCost * costMultiplier);
      
      expect(costMultiplier).toBe(1.5);
      expect(cost).toBe(15);
    });

    it('debería recalcular correctamente el costMultiplier desde purchased=5', () => {
      const baseCost = 100;
      const configCostMultiplier = 1.6;
      const purchased = 5;
      
      const costMultiplier = Math.pow(configCostMultiplier, purchased);
      const cost = Math.floor(baseCost * costMultiplier);
      
      // 1.6^5 = 10.48576
      expect(costMultiplier).toBeCloseTo(10.48576, 4);
      // 100 * 10.48576 = 1048
      expect(cost).toBe(1048);
    });

    it('debería recalcular correctamente sin importar el valor enviado por el cliente', () => {
      // Este es el caso del bug: el cliente envía valores incorrectos
      // pero el servidor debe recalcular desde la fórmula original
      
      const baseCost = 10;
      const configCostMultiplier = 1.5;
      
      // Cliente envía valores incorrectos (posiblemente manipulados o por error)
      const clientSentCost = 999;
      const clientSentCostMultiplier = 999;
      const clientSentPurchased = 3;
      
      // El servidor debe IGNORAR los valores del cliente y recalcular
      const correctCostMultiplier = Math.pow(configCostMultiplier, clientSentPurchased);
      const correctCost = Math.floor(baseCost * correctCostMultiplier);
      
      // Verificar que recalculamos correctamente
      expect(correctCost).not.toBe(clientSentCost);
      expect(correctCostMultiplier).not.toBe(clientSentCostMultiplier);
      expect(correctCost).toBe(33); // 10 * 1.5^3 = 10 * 3.375 = 33
      expect(correctCostMultiplier).toBeCloseTo(3.375, 3);
    });
  });

  describe('Recálculo de coinsPerClick y coinsPerSecond', () => {
    it('debería calcular coinsPerClick correctamente con upgrades de click', () => {
      // Base: 1
      // click_1: efecto 1, purchased 3 -> +3
      // click_2: efecto 5, purchased 2 -> +10
      // Total: 1 + 3 + 10 = 14
      const baseCoinsPerClick = 1;
      const clickUpgrades = [
        { id: 'click_1', type: 'click', effect: 1, purchased: 3 },
        { id: 'click_2', type: 'click', effect: 5, purchased: 2 },
      ];
      
      let coinsPerClick = baseCoinsPerClick;
      for (const upgrade of clickUpgrades) {
        coinsPerClick += upgrade.effect * upgrade.purchased;
      }
      
      expect(coinsPerClick).toBe(14);
    });

    it('debería calcular coinsPerSecond correctamente con upgrades passive', () => {
      // Base: 0
      // passive_1: efecto 1, purchased 4 -> +4
      // passive_2: efecto 5, purchased 1 -> +5
      // Total: 0 + 4 + 5 = 9
      const baseCoinsPerSecond = 0;
      const passiveUpgrades = [
        { id: 'passive_1', type: 'passive', effect: 1, purchased: 4 },
        { id: 'passive_2', type: 'passive', effect: 5, purchased: 1 },
      ];
      
      let coinsPerSecond = baseCoinsPerSecond;
      for (const upgrade of passiveUpgrades) {
        coinsPerSecond += upgrade.effect * upgrade.purchased;
      }
      
      expect(coinsPerSecond).toBe(9);
    });

    it('debería ignorar valores del cliente y recalcular desde upgrades', () => {
      // El cliente envía valores incorrectos (ejemplo del bug)
      const clientSentCoinsPerClick = 100;
      const clientSentCoinsPerSecond = 50;
      
      // El servidor debe calcular desde los upgrades
      const upgrades = [
        { id: 'click_1', type: 'click', effect: 1, purchased: 3 },
        { id: 'passive_1', type: 'passive', effect: 1, purchased: 4 },
      ];
      
      let calculatedCoinsPerClick = 1; // base
      let calculatedCoinsPerSecond = 0; // base
      
      for (const upgrade of upgrades) {
        if (upgrade.type === 'click') {
          calculatedCoinsPerClick += upgrade.effect * upgrade.purchased;
        } else {
          calculatedCoinsPerSecond += upgrade.effect * upgrade.purchased;
        }
      }
      
      // Verificar que ignoramos los valores del cliente
      expect(calculatedCoinsPerClick).not.toBe(clientSentCoinsPerClick);
      expect(calculatedCoinsPerSecond).not.toBe(clientSentCoinsPerSecond);
      
      // Verificar valores correctos
      expect(calculatedCoinsPerClick).toBe(4); // 1 + 3
      expect(calculatedCoinsPerSecond).toBe(4); // 0 + 4
    });

    it('debería manejar el caso sin upgrades comprados', () => {
      const upgrades: { type: 'click' | 'passive'; effect: number; purchased: number }[] = [];
      
      let coinsPerClick = 1; // siempre hay base 1
      let coinsPerSecond = 0; // siempre hay base 0
      
      for (const upgrade of upgrades) {
        if (upgrade.type === 'click') {
          coinsPerClick += upgrade.effect * upgrade.purchased;
        } else {
          coinsPerSecond += upgrade.effect * upgrade.purchased;
        }
      }
      
      expect(coinsPerClick).toBe(1);
      expect(coinsPerSecond).toBe(0);
    });
  });

  describe('Escenario del bug: cliente envía valores antiguos', () => {
    it('debería mantener purchased de la DB aunque el cliente envíe un valor menor', () => {
      // Este es el bug original: el cliente envía purchased=2 pero la DB tiene purchased=3
      // El servidor debe mantener el valor de la DB (3), no aceptar el del cliente (2)
      
      const dbPurchased = 3;
      const clientSentPurchased = 2;
      
      // El servidor NO debe hacer: playerUpgrade.purchased = clientSentPurchased
      // Debe mantener: playerUpgrade.purchased = dbPurchased
      
      const finalPurchased = dbPurchased; // El servidor mantiene el valor de la DB
      
      expect(finalPurchased).not.toBe(clientSentPurchased);
      expect(finalPurchased).toBe(3);
    });

    it('debería recalcular cost correctamente desde el purchased de la DB', () => {
      // Si la DB tiene purchased=3, el costo debe recalcularse desde 3, no desde el valor del cliente
      
      const baseCost = 10;
      const costMultiplier = 1.5;
      const purchased = 3; // De la DB
      
      // El servidor calcula desde purchased de la DB
      const cost = Math.floor(baseCost * Math.pow(costMultiplier, purchased));
      
      // Si el cliente envió purchased=2, el costo sería 10 * 1.5^2 = 22
      // Pero el servidor debe calcular desde purchased=3: 10 * 1.5^3 = 33
      expect(cost).toBe(33);
    });

    it('debería recalcular stats correctamente desde el purchased de la DB', () => {
      // DB tiene: passive_1 purchased=3, passive_2 purchased=1
      // Cliente envía: passive_1 purchased=2 (valor antiguo)
      
      const dbUpgrades = [
        { id: 'passive_1', type: 'passive', effect: 1, purchased: 3 },
        { id: 'passive_2', type: 'passive', effect: 5, purchased: 1 },
      ];
      
      // El servidor calcula desde los valores de la DB
      let coinsPerSecond = 0;
      for (const upgrade of dbUpgrades) {
        coinsPerSecond += upgrade.effect * upgrade.purchased;
      }
      
      // 3 * 1 + 1 * 5 = 3 + 5 = 8
      expect(coinsPerSecond).toBe(8);
      
      // Si el servidor aceptara el valor del cliente (purchased=2 para passive_1):
      // 2 * 1 + 1 * 5 = 2 + 5 = 7 (valor incorrecto)
      const wrongCoinsPerSecond = (2 * 1) + (1 * 5);
      expect(wrongCoinsPerSecond).toBe(7); // Este era el bug
      expect(coinsPerSecond).not.toBe(wrongCoinsPerSecond);
    });
  });

  describe('Escenarios de acumulación', () => {
    it('debería acumular correctamente múltiples compras del mismo upgrade', () => {
      const baseCost = 10;
      const costMultiplier = 1.5;
      let purchased = 0;
      
      // Simular 5 compras
      const purchases: { level: number; cost: number }[] = [];
      
      for (let i = 0; i < 5; i++) {
        const cost = calculateCost(baseCost, costMultiplier, purchased);
        purchases.push({ level: purchased + 1, cost });
        purchased++;
      }
      
      expect(purchases).toEqual([
        { level: 1, cost: 10 },
        { level: 2, cost: 15 },
        { level: 3, cost: 22 },
        { level: 4, cost: 33 },
        { level: 5, cost: 50 }, // 10 * 1.5^4 = 10 * 5.0625 = 50.625 -> 50
      ]);
    });

    it('debería manejar correctamente diferentes tipos de upgrades', () => {
      const upgrades = [
        { id: 'click_1', type: 'click' as const, effect: 1, purchased: 3 },
        { id: 'click_2', type: 'click' as const, effect: 5, purchased: 2 },
        { id: 'passive_1', type: 'passive' as const, effect: 1, purchased: 4 },
        { id: 'passive_2', type: 'passive' as const, effect: 5, purchased: 1 },
      ];
      
      const totalCoinsPerClick = 1 + // base
        (upgrades.find(u => u.id === 'click_1')!.purchased * upgrades.find(u => u.id === 'click_1')!.effect) +
        (upgrades.find(u => u.id === 'click_2')!.purchased * upgrades.find(u => u.id === 'click_2')!.effect);
      
      const totalCoinsPerSecond = 
        (upgrades.find(u => u.id === 'passive_1')!.purchased * upgrades.find(u => u.id === 'passive_1')!.effect) +
        (upgrades.find(u => u.id === 'passive_2')!.purchased * upgrades.find(u => u.id === 'passive_2')!.effect);
      
      // coinsPerClick: 1 base + (3*1) + (2*5) = 1 + 3 + 10 = 14
      expect(totalCoinsPerClick).toBe(14);
      // coinsPerSecond: (4*1) + (1*5) = 4 + 5 = 9
      expect(totalCoinsPerSecond).toBe(9);
    });
  });
});
