import { describe, it, expect, beforeEach } from 'vitest';
import { ProcessClickUseCase } from '../../usecases/ProcessClickUseCase.js';
import { PurchaseUpgradeUseCase } from '../../usecases/PurchaseUpgradeUseCase.js';
import { 
  InMemoryPlayerRepository, 
  InMemoryUpgradeConfigRepository,
  createDefaultUpgradeConfigRepository 
} from '../../adapters/in-memory/index.js';
import { GetOrCreatePlayerUseCase } from '../../usecases/GetOrCreatePlayerUseCase.js';

/**
 * BUG ESPECÍFICO: 
 * El jugador tiene 15 de oro, compra una mejora de 15.
 * Al hacer click, el sistema retorna el oro anterior + lo de los clicks
 * en lugar del oro actual + lo de los clicks
 */
describe('BUG-001: Click después de compra no refleja stats actualizados', () => {
  let playerRepo: InMemoryPlayerRepository;
  let upgradeConfigRepo: InMemoryUpgradeConfigRepository;
  let getPlayerUseCase: GetOrCreatePlayerUseCase;
  let purchaseUpgradeUseCase: PurchaseUpgradeUseCase;
  let processClickUseCase: ProcessClickUseCase;

  beforeEach(() => {
    playerRepo = new InMemoryPlayerRepository();
    upgradeConfigRepo = createDefaultUpgradeConfigRepository();
    getPlayerUseCase = new GetOrCreatePlayerUseCase(playerRepo, upgradeConfigRepo);
    purchaseUpgradeUseCase = new PurchaseUpgradeUseCase(playerRepo, upgradeConfigRepo);
    processClickUseCase = new ProcessClickUseCase(playerRepo);
  });

  it('debería ganar 2 coins por click DESPUÉS de comprar upgrade de click', async () => {
    // 1. Crear jugador (empieza con 0 coins, 1 coinPerClick)
    const playerId = 'player-bug-001';
    await getPlayerUseCase.execute(playerId);
    
    // 2. Darle 15 coins al jugador
    const player = await playerRepo.findById(playerId);
    player!.coins = 15;
    await playerRepo.update(player!);
    
    // 3. Agregar el upgrade click_1 al inventario del jugador
    // (para que pueda comprarlo)
    const config = await upgradeConfigRepo.findById('click_1');
    player!.upgrades.push({
      id: 'click_1',
      name: 'Dedo Rápido',
      description: 'Mejora tu dedo',
      cost: config!.baseCost, // 10
      costMultiplier: 1,
      effect: config!.effect, // 1
      maxLevel: config!.maxLevel,
      purchased: 0,
    });
    await playerRepo.update(player!);
    
    // Verificar estado ANTES de comprar
    let gameState = await getPlayerUseCase.execute(playerId);
    console.log('ANTES de comprar:');
    console.log('  coins:', gameState.coins);
    console.log('  coinsPerClick:', gameState.coinsPerClick);
    
    // 4. Comprar el upgrade (costo: 10)
    // Nota: El upgrade de 15 sería passive_1 (costo 50) o click_2 (costo 100)
    // Usamos click_1 con costo 10 para el test
    const purchaseResult = await purchaseUpgradeUseCase.execute(playerId, 'click_1');
    console.log('Resultado de compra:', purchaseResult);
    
    // Verificar estado DESPUÉS de comprar
    const playerAfterPurchase = await playerRepo.findById(playerId);
    console.log('DESPUÉS de comprar:');
    console.log('  coins:', playerAfterPurchase!.coins); // 15 - 10 = 5
    console.log('  coinsPerClick:', playerAfterPurchase!.coinsPerClick); // Debería ser 2 (1 base + 1 efecto)
    console.log('  upgrade purchased:', playerAfterPurchase!.upgrades.find(u => u.id === 'click_1')?.purchased);
    
    // 5. Hacer click - debería ganar 2 coins (coinsPerClick actualizado)
    const clickResult = await processClickUseCase.execute(playerId);
    
    console.log('Resultado del click:');
    console.log('  earned:', clickResult.earned);
    console.log('  newCoins:', clickResult.newCoins);
    console.log('  coinsPerClick:', clickResult.coinsPerClick);
    
    // BUG: El sistema retorna earned = 1 (el valor anterior)
    // en lugar de earned = 2 (el valor actualizado)
    
    // EXPECTATIVA: Después de comprar upgrade click (+1), coinsPerClick debería ser 2
    expect(clickResult.coinsPerClick).toBe(2); // BUG: probablemente retorna 1
    expect(clickResult.earned).toBe(2); // BUG: probablemente retorna 1
    
    // Los coins deberían ser: 5 (después de compra) + 2 (click) = 7
    expect(clickResult.newCoins).toBe(7);
  });

  it('debería ganar más coins por segundo DESPUÉS de comprar upgrade passive', async () => {
    // Similar al anterior pero para passive
    const playerId = 'player-bug-002';
    await getPlayerUseCase.execute(playerId);
    
    // Dar coins
    const player = await playerRepo.findById(playerId);
    player!.coins = 60; // Enough for passive_1 (50)
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
    
    // Comprar upgrade
    await purchaseUpgradeUseCase.execute(playerId, 'passive_1');
    
    // Verificar que coinsPerSecond aumentó
    const playerAfter = await playerRepo.findById(playerId);
    expect(playerAfter!.coinsPerSecond).toBe(1); // 0 base + 1 effect
    expect(playerAfter!.coins).toBe(10); // 60 - 50
    
    // El bug se manifiesta cuando se calcula el offline progress
    // con los stats desactualizados
  });
});
