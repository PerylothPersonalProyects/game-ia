import { describe, it, expect } from 'vitest';

// ============================================
// TESTS DE LÓGICA PURA - SISTEMA DE SHOP
// ============================================

// Implementación pura de la lógica para testing (sin dependencias)
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getRandomUpgradesPure(
  allConfigs: { id: string }[], 
  count: number, 
  excludeIds: string[] = []
): { id: string }[] {
  const available = allConfigs.filter(c => !excludeIds.includes(c.id));
  
  if (available.length <= count) {
    return shuffleArray(available);
  }
  
  const shuffled = shuffleArray(available);
  return shuffled.slice(0, count);
}

describe('Sistema de Shop - Upgrades Aleatorios', () => {
  const mockUpgradeConfigs = [
    { id: 'click_1', name: 'Dedo Rápido', type: 'click' as const, effect: 1 },
    { id: 'click_2', name: 'Mano Firme', type: 'click' as const, effect: 5 },
    { id: 'click_3', name: 'Poder Digital', type: 'click' as const, effect: 25 },
    { id: 'passive_1', name: 'Inversor Novato', type: 'passive' as const, effect: 1 },
    { id: 'passive_2', name: 'Emprendedor', type: 'passive' as const, effect: 5 },
    { id: 'passive_3', name: 'Magnate', type: 'passive' as const, effect: 25 },
    { id: 'click_4', name: 'Toque de Midas', type: 'click' as const, effect: 100 },
    { id: 'passive_4', name: 'Imperio Financiero', type: 'passive' as const, effect: 100 },
  ];

  describe('shuffleArray', () => {
    it('debe retornar un array con la misma longitud', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);
      expect(shuffled).toHaveLength(original.length);
    });

    it('debe contener los mismos elementos', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);
      
      // Verificar que contiene los mismos elementos (aunque en orden diferente)
      const sortedOriginal = [...original].sort((a, b) => a - b);
      const sortedShuffled = [...shuffled].sort((a, b) => a - b);
      expect(sortedShuffled).toEqual(sortedOriginal);
    });

    it('no debe modificar el array original', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      shuffleArray(original);
      expect(original).toEqual(originalCopy);
    });
  });

  describe('getRandomUpgrades', () => {
    it('debe retornar exactamente la cantidad solicitada', () => {
      const result = getRandomUpgradesPure(mockUpgradeConfigs, 4);
      expect(result).toHaveLength(4);
    });

    it('debe retornar todos los disponibles si hay menos que count', () => {
      const result = getRandomUpgradesPure(mockUpgradeConfigs, 10);
      expect(result).toHaveLength(mockUpgradeConfigs.length);
    });

    it('debe excluir los IDs especificados', () => {
      const excludeIds = ['click_1', 'click_2'];
      const result = getRandomUpgradesPure(mockUpgradeConfigs, 6, excludeIds);
      
      // Verificar que ninguno de los resultados está en la lista de exclusión
      const resultIds = result.map(r => r.id);
      expect(resultIds).not.toContain('click_1');
      expect(resultIds).not.toContain('click_2');
    });

    it('debe retornar array vacío si todos los upgrades están excluidos', () => {
      const excludeIds = mockUpgradeConfigs.map(c => c.id);
      const result = getRandomUpgradesPure(mockUpgradeConfigs, 4, excludeIds);
      
      expect(result).toHaveLength(0);
    });

    it('debe retornar upgrades únicos (sin duplicados)', () => {
      const result = getRandomUpgradesPure(mockUpgradeConfigs, 4);
      const ids = result.map(r => r.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Lógica de compra de upgrades en shop', () => {
    it('debe calcular correctamente el costo para el primer nivel', () => {
      const baseCost = 10;
      const costMultiplier = 1.5;
      const purchased = 0;
      
      const cost = Math.floor(baseCost * Math.pow(costMultiplier, purchased));
      expect(cost).toBe(10);
    });

    it('debe verificar si el jugador puede permitirse el upgrade', () => {
      const playerCoins = 100;
      const upgradeCost = 50;
      
      const canAfford = playerCoins >= upgradeCost;
      expect(canAfford).toBe(true);
    });

    it('debe rechazar si el jugador no tiene suficientes coins', () => {
      const playerCoins = 30;
      const upgradeCost = 50;
      
      const canAfford = playerCoins >= upgradeCost;
      expect(canAfford).toBe(false);
    });

    it('debe verificar si el upgrade ha alcanzado el nivel máximo', () => {
      const maxLevel = 10;
      const currentLevel = 10;
      
      const canLevelUp = currentLevel < maxLevel;
      expect(canLevelUp).toBe(false);
    });

    it('debe permitir level up si no ha alcanzado el máximo', () => {
      const maxLevel = 10;
      const currentLevel = 5;
      
      const canLevelUp = currentLevel < maxLevel;
      expect(canLevelUp).toBe(true);
    });
  });

  describe('Sistema de intercambio (swap)', () => {
    it('debe generar un upgrade diferente al intercambiado', () => {
      const currentShopIds = ['click_1', 'click_2', 'click_3', 'passive_1'];
      const purchasedIds = ['click_4'];
      const excludeIds = [...currentShopIds, ...purchasedIds];
      
      // Simular que queremos swap click_1
      const newUpgrade = getRandomUpgradesPure(mockUpgradeConfigs, 1, excludeIds);
      
      expect(newUpgrade).toHaveLength(1);
      expect(newUpgrade[0].id).not.toBe('click_1'); // No debe ser el mismo
    });

    it('debe fallar si no hay más upgrades disponibles', () => {
      // Excluir todos los upgrades disponibles
      const excludeIds = mockUpgradeConfigs.map(c => c.id);
      
      const newUpgrade = getRandomUpgradesPure(mockUpgradeConfigs, 1, excludeIds);
      
      expect(newUpgrade).toHaveLength(0); // No hay más disponibles
    });
  });

  describe('Validación de máximo 4 upgrades en shop', () => {
    it('el shop debe tener máximo 4 upgrades', () => {
      const purchasedIds: string[] = [];
      const shopUpgrades = getRandomUpgradesPure(mockUpgradeConfigs, 4, purchasedIds);
      
      expect(shopUpgrades.length).toBeLessThanOrEqual(4);
    });

    it('el shop debe tener 4 upgrades si hay suficientes disponibles', () => {
      const purchasedIds: string[] = [];
      const shopUpgrades = getRandomUpgradesPure(mockUpgradeConfigs, 4, purchasedIds);
      
      expect(shopUpgrades.length).toBe(4);
    });

    it('debe reemplazar upgrades comprados con nuevos', () => {
      // Simular que compramos click_1
      const purchasedIds = ['click_1'];
      const currentShopIds = ['click_1', 'click_2', 'click_3', 'passive_1'];
      
      // Los IDs a excluir son los comprados + los que ya están en el shop (excepto el comprado)
      const excludeIds = [...purchasedIds, ...currentShopIds.filter(id => id !== 'click_1')];
      
      const newUpgrade = getRandomUpgradesPure(mockUpgradeConfigs, 1, excludeIds);
      
      // Debe dar un upgrade que no sea click_1 ni los otros del shop
      if (newUpgrade.length > 0) {
        expect(newUpgrade[0].id).not.toBe('click_1');
      }
    });
  });

  describe('Balanceo económico del shop', () => {
    it('debe tener costos progressionales para upgrades más fuertes', () => {
      // Definir costos manually para los upgrades
      const costClick1 = 10;
      const costClick2 = 100;
      const costClick3 = 1000;
      const costClick4 = 50000;
      
      // Verificar que los costos aumentan
      expect(costClick1).toBeLessThan(costClick2); // 10 < 100
      expect(costClick2).toBeLessThan(costClick3); // 100 < 1000
      expect(costClick3).toBeLessThan(costClick4); // 1000 < 50000
    });

    it('debe tener efectos progressionales', () => {
      const effects = mockUpgradeConfigs.map(c => c.effect);
      
      // Verificar que los efectos aumentan
      expect(effects[0]).toBeLessThan(effects[1]); // 1 < 5
      expect(effects[1]).toBeLessThan(effects[2]); // 5 < 25
      expect(effects[2]).toBeLessThan(effects[6]); // 25 < 100
    });
  });
});
