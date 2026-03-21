import { prisma } from '../database/prisma.js';
import type { 
  GameState, 
  Upgrade, 
  UpgradeConfig,
  SyncResponse,
  ClickResponse,
  UpgradeResponse
} from '../types/idle-game.js';

// Type for Prisma Player record
type PrismaPlayer = Awaited<ReturnType<typeof prisma.player.findUnique>>;

// Type for player upgrades array item
interface PlayerUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  costMultiplier: number;
  effect: number;
  maxLevel: number;
  purchased: number;
}

// Convert Prisma player to IPlayer-like object
function toPlayerData(prismaPlayer: NonNullable<PrismaPlayer>) {
  const upgrades = typeof prismaPlayer.upgrades === 'string' 
    ? JSON.parse(prismaPlayer.upgrades) 
    : prismaPlayer.upgrades;
  const shopUpgrades = typeof prismaPlayer.shopUpgrades === 'string' 
    ? JSON.parse(prismaPlayer.shopUpgrades) 
    : prismaPlayer.shopUpgrades;
  
  return {
    playerId: prismaPlayer.playerId,
    coins: prismaPlayer.coins,
    coinsPerClick: prismaPlayer.coinsPerClick,
    coinsPerSecond: prismaPlayer.coinsPerSecond,
    upgrades: upgrades as PlayerUpgrade[],
    shopUpgrades: shopUpgrades as PlayerUpgrade[],
    lastUpdate: Number(prismaPlayer.lastUpdate),
  };
}

export class IdleGameService {
  // Obtener configuraciones de mejoras desde la DB
  async getUpgradeConfigs(): Promise<UpgradeConfig[]> {
    const configs = await prisma.upgradeConfig.findMany({ 
      where: { enabled: true } 
    });
    return configs.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description || '',
      baseCost: c.baseCost,
      costMultiplier: c.costMultiplier,
      effect: c.effect,
      maxLevel: c.maxLevel,
      type: c.type as 'click' | 'passive',
    }));
  }

  // Inicializar upgrades para un jugador basados en la config de la DB
  private async getDefaultUpgrades(): Promise<PlayerUpgrade[]> {
    const configs = await this.getUpgradeConfigs();
    
    return configs.map(config => ({
      id: config.id,
      name: config.name,
      description: config.description,
      cost: config.baseCost,
      costMultiplier: 1,
      effect: config.effect,
      maxLevel: config.maxLevel,
      purchased: 0,
    }));
  }

  // Obtener o crear jugador desde MySQL (Prisma)
  async getOrCreatePlayer(playerId: string): Promise<ReturnType<typeof toPlayerData>> {
    console.log('[getOrCreatePlayer] Buscando jugador:', playerId);
    let player = await prisma.player.findUnique({ where: { playerId } });
    console.log('[getOrCreatePlayer] Encontrado:', player ? 'SI' : 'NO', player ? `coins: ${player.coins}, coinsPerClick: ${player.coinsPerClick}` : 'N/A');
    
    if (!player) {
      // Crear jugador nuevo con upgrades en el shop
      // GARANTIZAR al menos 1 Tier 1 upgrade
      const shopUpgrades = await this.getRandomUpgradesWithTier1Guaranteed(4);
      
      const newPlayer = await prisma.player.create({
        data: {
          playerId,
          coins: 0,
          coinsPerClick: 1,
          coinsPerSecond: 0,
          upgrades: [],
          shopUpgrades: shopUpgrades.map(u => ({
            id: u.id,
            name: u.name,
            description: u.description,
            cost: u.baseCost,
            costMultiplier: 1,
            effect: u.effect,
            maxLevel: u.maxLevel,
            purchased: 0,
          })),
          lastUpdate: BigInt(Date.now()),
        },
      });
      
      return toPlayerData(newPlayer);
    } else {
      const playerData = toPlayerData(player);
      
      // Verificar si el jugador tiene shopUpgrades (jugadores antiguos)
      if (!playerData.shopUpgrades || playerData.shopUpgrades.length === 0) {
        // Regenerar shop si no tiene
        const purchasedIds = playerData.upgrades.map(u => u.id);
        const shopUpgrades = await this.getRandomUpgrades(4, purchasedIds);
        
        const newShopUpgrades = shopUpgrades.map(u => ({
          id: u.id,
          name: u.name,
          description: u.description,
          cost: u.baseCost,
          costMultiplier: 1,
          effect: u.effect,
          maxLevel: u.maxLevel,
          purchased: 0,
        }));
        
        await prisma.player.update({
          where: { playerId },
          data: { shopUpgrades: JSON.parse(JSON.stringify(newShopUpgrades)) },
        });
        
        playerData.shopUpgrades = newShopUpgrades;
      }
      
      // Verificar si las mejoras del jugador coinciden con la config de la DB
      const dbConfigs = await this.getUpgradeConfigs();
      const playerUpgradeIds = playerData.upgrades.map(u => u.id);
      const dbConfigIds = dbConfigs.map(c => c.id);
      
      // Si hay nuevas mejoras en la DB, agregarlas al inventario (no al shop)
      let needsUpdate = false;
      for (const config of dbConfigs) {
        if (!playerUpgradeIds.includes(config.id)) {
          playerData.upgrades.push({
            id: config.id,
            name: config.name,
            description: config.description,
            cost: config.baseCost,
            costMultiplier: 1,
            effect: config.effect,
            maxLevel: config.maxLevel,
            purchased: 0,
          });
          needsUpdate = true;
        }
      }
      
      // Si hay mejoras en el jugador que ya no existen en la DB, marcarlas
      for (const upgrade of playerData.upgrades) {
        if (!dbConfigIds.includes(upgrade.id)) {
          upgrade.purchased = -1; // Marcador de mejora eliminada
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await prisma.player.update({
          where: { playerId },
          data: { upgrades: JSON.parse(JSON.stringify(playerData.upgrades)) },
        });
      }
      
      return playerData;
    }
  }

  // Obtener estado completo del juego (formato cliente)
  async getGameState(playerId: string): Promise<GameState> {
    console.log('[getGameState] === INICIO ===');
    console.log('[getGameState] playerId:', playerId);
    
    const player = await this.getOrCreatePlayer(playerId);
    console.log('[getGameState] player.coins desde DB:', player.coins, 'coinsPerClick:', player.coinsPerClick);
    
    // Filtrar upgrades válidos (no eliminados)
    const validUpgrades = player.upgrades
      .filter(u => u.purchased >= 0)
      .map(u => ({
        id: u.id,
        name: u.name,
        description: u.description,
        cost: u.cost,
        costMultiplier: u.costMultiplier,
        effect: u.effect,
        maxLevel: u.maxLevel,
        purchased: u.purchased,
      }));
    
    // Obtener shop upgrades
    const shopUpgradesList = player.shopUpgrades || [];
    const validShopUpgrades = shopUpgradesList
      .filter(u => u.purchased >= 0)
      .map(u => ({
        id: u.id,
        name: u.name,
        description: u.description,
        cost: u.cost,
        costMultiplier: u.costMultiplier,
        effect: u.effect,
        maxLevel: u.maxLevel,
        purchased: u.purchased,
      }));
    
    return {
      coins: player.coins,
      coinsPerClick: player.coinsPerClick,
      coinsPerSecond: player.coinsPerSecond,
      upgrades: validUpgrades,
      shopUpgrades: validShopUpgrades,
    };
  }

  // Obtener solo upgrades
  async getUpgrades(playerId: string): Promise<Upgrade[]> {
    const player = await this.getOrCreatePlayer(playerId);
    return player.upgrades
      .filter(u => u.purchased >= 0)
      .map(u => ({
        id: u.id,
        name: u.name,
        description: u.description,
        cost: u.cost,
        costMultiplier: u.costMultiplier,
        effect: u.effect,
        maxLevel: u.maxLevel,
        purchased: u.purchased,
      }));
  }

  // Obtener solo las configuraciones de mejoras (para el admin)
  async getAllUpgradeConfigs(): Promise<UpgradeConfig[]> {
    return this.getUpgradeConfigs();
  }

  // Procesar click - USAR operación atómica para evitar race conditions
  async processClick(playerId: string): Promise<{ player: ReturnType<typeof toPlayerData>; earned: number; passiveEarned: number; clickEarned: number }> {
    console.log('[processClick] === INICIO ===');
    console.log('[processClick] playerId:', playerId);
    
    // Primero obtener el valor actual para saber cuánto ganó
    const player = await this.getOrCreatePlayer(playerId);
    const now = Date.now();
    
    // Calcular ingresos pasivos acumulados desde la última acción
    const secondsSinceLastAction = Math.max(0, Math.floor((now - player.lastUpdate) / 1000));
    const passiveEarned = player.coinsPerSecond * secondsSinceLastAction;
    const clickEarned = player.coinsPerClick;
    const earned = clickEarned + passiveEarned;
    
    console.log('[processClick] player.coins LEIDO de DB:', player.coins, 
      'coinsPerClick:', player.coinsPerClick, 
      'coinsPerSecond:', player.coinsPerSecond,
      'secondsSinceLastAction:', secondsSinceLastAction,
      'passiveEarned:', passiveEarned,
      'clickEarned:', clickEarned,
      'total earned:', earned);
    
    // Usar operación atómica para evitar race conditions
    const updatedPlayer = await prisma.player.update({
      where: { playerId },
      data: {
        coins: { increment: earned },
        lastUpdate: BigInt(now),
      },
    });
    
    console.log('[processClick] player.coins DESPUÉS de increment:', updatedPlayer.coins);
    
    return { player: toPlayerData(updatedPlayer), earned, passiveEarned, clickEarned };
  }

  // Calcular ingresos pasivos basados en tiempo
  async calculateOfflineProgress(playerId: string): Promise<{ earned: number; newCoins: number }> {
    // Primero obtener el valor actual
    const player = await this.getOrCreatePlayer(playerId);
    
    if (player.coinsPerSecond === 0) {
      return { earned: 0, newCoins: player.coins };
    }

    const now = Date.now();
    const deltaSeconds = Math.floor((now - player.lastUpdate) / 1000);
    const maxOfflineSeconds = 8 * 60 * 60;
    const offlineSeconds = Math.min(deltaSeconds, maxOfflineSeconds);
    
    const earned = Math.floor(player.coinsPerSecond * offlineSeconds);
    
    if (earned <= 0) {
      return { earned: 0, newCoins: player.coins };
    }
    
    // Usar operación atómica para evitar race conditions
    const updatedPlayer = await prisma.player.update({
      where: { playerId },
      data: {
        coins: { increment: earned },
        lastUpdate: BigInt(now),
      },
    });
    
    return { earned, newCoins: updatedPlayer.coins };
  }

  // Comprar upgrade - USAR operaciones atómicas para evitar race conditions
  async buyUpgrade(playerId: string, upgradeId: string): Promise<{ 
    success: boolean; 
    player?: ReturnType<typeof toPlayerData>; 
    upgrade?: Upgrade; 
    error?: string 
  }> {
    console.log('[buyUpgrade] === INICIO ===');
    console.log('[buyUpgrade] playerId:', playerId, 'upgradeId:', upgradeId);
    
    // Primero obtener la configuración del upgrade
    const config = await prisma.upgradeConfig.findUnique({ where: { id: upgradeId } });
    if (!config) {
      return { success: false, error: 'Upgrade config not found' };
    }
    
    // Obtener el jugador actual para saber el costo y nivel actual
    const player = await this.getOrCreatePlayer(playerId);
    console.log('[buyUpgrade] player coins ANTES:', player.coins, 'coinsPerClick:', player.coinsPerClick);
    
    const upgrade = player.upgrades.find(u => u.id === upgradeId && u.purchased >= 0);
    if (!upgrade) {
      return { success: false, error: 'Upgrade not found' };
    }

    if (player.coins < upgrade.cost) {
      return { success: false, error: 'Insufficient coins' };
    }

    if (upgrade.purchased >= config.maxLevel) {
      return { success: false, error: 'Max level reached' };
    }

    // Calcular nuevos valores
    const newPurchased = upgrade.purchased + 1;
    const newCostMultiplier = Math.pow(config.costMultiplier, newPurchased);
    const newCost = Math.floor(config.baseCost * newCostMultiplier);
    
    // Construir la actualización
    let data: any = {
      coins: { decrement: upgrade.cost },
      lastUpdate: BigInt(Date.now()),
    };
    
    // Agregar el efecto del upgrade
    if (config.type === 'click') {
      data.coinsPerClick = { increment: config.effect };
    } else if (config.type === 'passive') {
      data.coinsPerSecond = { increment: config.effect };
    }
    
    // Actualizar el upgrade en el array
    const updatedUpgrades = player.upgrades.map(u => {
      if (u.id === upgradeId) {
        return {
          ...u,
          purchased: newPurchased,
          costMultiplier: newCostMultiplier,
          cost: newCost,
        };
      }
      return u;
    });
    data.upgrades = JSON.parse(JSON.stringify(updatedUpgrades));
    
    // Usar transacción para asegurar consistencia
    try {
      const updatedPlayer = await prisma.player.update({
        where: { playerId },
        data,
      });
      
      console.log('[buyUpgrade] player.coins GUARDADO:', updatedPlayer.coins, 'coinsPerClick:', updatedPlayer.coinsPerClick);

      // Obtener el upgrade actualizado del jugador
      const playerUpgrades = typeof updatedPlayer.upgrades === 'string' 
        ? JSON.parse(updatedPlayer.upgrades) 
        : updatedPlayer.upgrades;
      const updatedUpgrade = playerUpgrades?.find((u: any) => u.id === upgradeId);
      const playerData = toPlayerData(updatedPlayer);
      
      return { 
        success: true, 
        player: playerData,
        upgrade: updatedUpgrade ? {
          id: updatedUpgrade.id,
          name: updatedUpgrade.name,
          description: updatedUpgrade.description,
          cost: updatedUpgrade.cost,
          costMultiplier: updatedUpgrade.costMultiplier,
          effect: updatedUpgrade.effect,
          maxLevel: updatedUpgrade.maxLevel,
          purchased: updatedUpgrade.purchased,
        } : undefined
      };
    } catch (error) {
      console.error('[buyUpgrade] Error:', error);
      // Verificar qué falló
      const currentPlayer = await prisma.player.findUnique({ where: { playerId } });
      if (currentPlayer && currentPlayer.coins < upgrade.cost) {
        return { success: false, error: 'Insufficient coins' };
      }
      return { success: false, error: 'Upgrade purchase failed' };
    }
  }

  // Guardar estado del jugador
  async saveGame(playerId: string, state: GameState): Promise<{ success: boolean }> {
    console.log('[saveGame] === INICIO ===');
    console.log('[saveGame] playerId: ' + playerId);
    console.log('[saveGame] state.received: ' + JSON.stringify(state));
    
    const player = await this.getOrCreatePlayer(playerId);
    
    console.log('[saveGame] player.upgrades BEFORE: ' + JSON.stringify(player.upgrades.map(u => ({ id: u.id, purchased: u.purchased }))));
    
    // SECURE: Calculate coins server-side from DB + offline progress
    // DO NOT trust client-provided coins (anti-cheat)
    const offlineProgress = await this.calculateOfflineProgress(playerId);
    console.log('[saveGame] Server calculated offline progress:', offlineProgress);
    // Keep current server coins (with offline earnings added)
    // NEVER trust state.coins from client
    
    // Only accept non-monetary state from client (upgrades, settings, etc.)
    // Do NOT accept: coins, coinsPerClick, coinsPerSecond from client
    // coinsPerClick and coinsPerSecond are already recalculated below
    
    // Actualizar upgrades - NO aceptamos purchased del cliente
    // Mantenemos los valores de purchased que ya tenemos en la DB
    // Solo recalculamos cost y costMultiplier desde la fórmula original
    const updatedUpgrades = [...player.upgrades];
    for (const upgradeState of state.upgrades) {
      const playerUpgrade = updatedUpgrades.find(u => u.id === upgradeState.id);
      if (playerUpgrade && playerUpgrade.purchased >= 0) {
        // NO hacemos: playerUpgrade.purchased = upgradeState.purchased;
        // Mantenemos el valor de la DB
        
        // Recalcular costMultiplier y cost desde la configuración original
        const config = await prisma.upgradeConfig.findUnique({ where: { id: upgradeState.id } });
        if (config) {
          playerUpgrade.costMultiplier = Math.pow(config.costMultiplier, playerUpgrade.purchased);
          playerUpgrade.cost = Math.floor(config.baseCost * playerUpgrade.costMultiplier);
        }
      }
    }
    
    // Recalcular coinsPerClick y coinsPerSecond desde los upgrades comprados
    // No aceptamos los valores del cliente
    let newCoinsPerClick = 1; // Base
    let newCoinsPerSecond = 0; // Base
    
    for (const upgrade of updatedUpgrades) {
      if (upgrade.purchased > 0) {
        const config = await prisma.upgradeConfig.findUnique({ where: { id: upgrade.id } });
        if (config) {
          if (config.type === 'click') {
            newCoinsPerClick += config.effect * upgrade.purchased;
          } else if (config.type === 'passive') {
            newCoinsPerSecond += config.effect * upgrade.purchased;
          }
        }
      }
    }
    
    // Guardar con Prisma
    await prisma.player.update({
      where: { playerId },
      data: {
        coinsPerClick: newCoinsPerClick,
        coinsPerSecond: newCoinsPerSecond,
        upgrades: JSON.parse(JSON.stringify(updatedUpgrades)),
        lastUpdate: BigInt(Date.now()),
      },
    });

    return { success: true };
  }

  // Obtener estado para sincronización
  async getSyncData(playerId: string): Promise<SyncResponse> {
    const player = await this.getOrCreatePlayer(playerId);
    return {
      coins: player.coins,
      coinsPerClick: player.coinsPerClick,
      coinsPerSecond: player.coinsPerSecond,
      lastSync: Date.now(),
    };
  }

  // Eliminar jugador
  async deletePlayer(playerId: string): Promise<{ success: boolean }> {
    await prisma.player.delete({ where: { playerId } });
    return { success: true };
  }

  // ============================================
  // SISTEMA DE UPGRADES ALEATORIOS (SHOP)
  // ============================================

  /**
   * Obtener upgrades aleatorios de la DB
   * @param count Cantidad de upgrades a obtener (default 4)
   * @param excludeIds IDs a excluir (upgrades ya comprados o en el shop)
   */
  async getRandomUpgrades(count: number = 4, excludeIds: string[] = []): Promise<UpgradeConfig[]> {
    const configs = await this.getUpgradeConfigs();
    
    // Filtrar upgrades disponibles
    const available = configs.filter(c => !excludeIds.includes(c.id));
    
    // Si hay menos disponibles que los solicitados, retornar todos los disponibles
    if (available.length <= count) {
      return this.shuffleArray(available);
    }
    
    // Mezclar y tomar los primeros 'count'
    const shuffled = this.shuffleArray(available);
    return shuffled.slice(0, count);
  }

  /**
   * Helper: Mezclar array aleatoriamente (Fisher-Yates)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Obtener upgrades aleatorios GARANTIZANDO al menos 1 Tier 1
   * Para nuevos jugadores
   */
  async getRandomUpgradesWithTier1Guaranteed(count: number = 4): Promise<UpgradeConfig[]> {
    const configs = await this.getUpgradeConfigs();
    
    // Filtrar upgrades Tier 1 (ID contiene _1_ pero no _1_1_ para evitar conflictos)
    // Tier 1 son: click_1_*, passive_1_*
    const tier1Upgrades = configs.filter(c => {
      const parts = c.id.split('_');
      return parts[1] === '1' && parts.length >= 2;
    });
    
    // Filtrar upgrades disponibles (no Tier 1)
    const otherUpgrades = configs.filter(c => {
      const parts = c.id.split('_');
      return parts[1] !== '1' || parts.length < 2;
    });
    
    // Obtener 1-2 upgrades de Tier 1
    const tier1Count = Math.min(2, tier1Upgrades.length);
    const selectedTier1 = this.shuffleArray(tier1Upgrades).slice(0, tier1Count);
    
    // Llenar el resto con otros upgrades
    const remaining = count - selectedTier1.length;
    const selectedOthers = this.shuffleArray(otherUpgrades).slice(0, remaining);
    
    // Combinar y mezlr
    const result = [...selectedTier1, ...selectedOthers];
    return this.shuffleArray(result);
  }

  /**
   * Obtener upgrades del shop para un jugador
   * Si no existen, los genera aleatoriamente
   */
  async getShopUpgrades(playerId: string): Promise<UpgradeConfig[]> {
    const player = await this.getOrCreatePlayer(playerId);
    
    // Si ya tiene shop upgrades, retornarlos
    if (player.shopUpgrades && player.shopUpgrades.length > 0) {
      // Convertir a UpgradeConfig formato
      return player.shopUpgrades.map(u => ({
        id: u.id,
        name: u.name,
        description: u.description,
        baseCost: u.cost, // Usamos el cost actual como baseCost para el shop
        costMultiplier: u.costMultiplier,
        effect: u.effect,
        maxLevel: u.maxLevel,
        type: u.id.startsWith('click_') ? 'click' : 'passive',
      }));
    }
    
    // Generar nuevos upgrades aleatorios
    const purchasedIds = player.upgrades.map(u => u.id);
    const newShopUpgrades = await this.getRandomUpgrades(4, purchasedIds);
    
    // Guardar en el jugador
    const shopUpgradesData = newShopUpgrades.map(u => ({
      id: u.id,
      name: u.name,
      description: u.description,
      cost: u.baseCost,
      costMultiplier: 1,
      effect: u.effect,
      maxLevel: u.maxLevel,
      purchased: 0,
    }));
    
    await prisma.player.update({
      where: { playerId },
      data: { shopUpgrades: JSON.parse(JSON.stringify(shopUpgradesData)) },
    });
    
    return newShopUpgrades;
  }

  /**
   * Regenerar los upgrades del shop (shuffle)
   * Costo: configurable (por defecto gratis o con costo)
   */
  async refreshShopUpgrades(playerId: string, cost: number = 0): Promise<{
    success: boolean;
    upgrades?: UpgradeConfig[];
    error?: string;
  }> {
    const player = await this.getOrCreatePlayer(playerId);
    
    // Verificar costo si tiene costo de refresh
    if (cost > 0 && player.coins < cost) {
      return { success: false, error: 'Insufficient coins for refresh' };
    }
    
    // Deducir costo si aplica
    const data: any = {};
    if (cost > 0) {
      data.coins = { decrement: cost };
    }
    
    // Obtener IDs de upgrades ya comprados
    const purchasedIds = player.upgrades.map(u => u.id);
    
    // Generar nuevos upgrades aleatorios
    const newShopUpgrades = await this.getRandomUpgrades(4, purchasedIds);
    
    // Guardar en el jugador
    data.shopUpgrades = JSON.parse(JSON.stringify(newShopUpgrades.map(u => ({
      id: u.id,
      name: u.name,
      description: u.description,
      cost: u.baseCost,
      costMultiplier: 1,
      effect: u.effect,
      maxLevel: u.maxLevel,
      purchased: 0,
    }))));
    
    await prisma.player.update({
      where: { playerId },
      data,
    });
    
    return { success: true, upgrades: newShopUpgrades };
  }

  /**
   * Intercambiar un upgrade del shop por otro
   * El upgrade seleccionado se reemplaza por uno nuevo aleatorio
   */
  async swapShopUpgrade(playerId: string, upgradeIdToSwap: string): Promise<{
    success: boolean;
    newUpgrade?: UpgradeConfig;
    error?: string;
  }> {
    const player = await this.getOrCreatePlayer(playerId);
    
    // Verificar que el upgrade existe en el shop
    const shopIndex = player.shopUpgrades?.findIndex(u => u.id === upgradeIdToSwap);
    if (shopIndex === undefined || shopIndex === -1) {
      return { success: false, error: 'Upgrade not found in shop' };
    }
    
    // Obtener IDs de upgrades ya comprados + los del shop actuales
    const excludeIds = [
      ...player.upgrades.map(u => u.id),
      ...player.shopUpgrades!.map(u => u.id),
    ];
    
    // Generar nuevo upgrade
    const newUpgrades = await this.getRandomUpgrades(1, excludeIds);
    if (newUpgrades.length === 0) {
      return { success: false, error: 'No more upgrades available' };
    }
    
    const newUpgrade = newUpgrades[0];
    
    // Reemplazar en el shop
    const newShopUpgrades = [...player.shopUpgrades!];
    newShopUpgrades[shopIndex] = {
      id: newUpgrade.id,
      name: newUpgrade.name,
      description: newUpgrade.description,
      cost: newUpgrade.baseCost,
      costMultiplier: 1,
      effect: newUpgrade.effect,
      maxLevel: newUpgrade.maxLevel,
      purchased: 0,
    };
    
    await prisma.player.update({
      where: { playerId },
      data: { shopUpgrades: JSON.parse(JSON.stringify(newShopUpgrades)) },
    });
    
    return { success: true, newUpgrade };
  }

  /**
   * Comprar un upgrade del shop
   * El upgrade se mueve del shop al inventario del jugador
   */
  async buyShopUpgrade(playerId: string, upgradeId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const player = await this.getOrCreatePlayer(playerId);
    
    // Verificar que el upgrade existe en el shop
    const shopUpgrade = player.shopUpgrades?.find(u => u.id === upgradeId);
    if (!shopUpgrade) {
      return { success: false, error: 'Upgrade not found in shop' };
    }
    
    // Verificar coins
    if (player.coins < shopUpgrade.cost) {
      return { success: false, error: 'Insufficient coins' };
    }
    
    // Verificar si ya tiene este upgrade en el inventario
    const existingUpgrade = player.upgrades.find(u => u.id === upgradeId);
    
    // Obtener la config del upgrade
    const config = await prisma.upgradeConfig.findUnique({ where: { id: upgradeId } });
    if (!config) {
      return { success: false, error: 'Upgrade config not found' };
    }
    
    // Preparar datos de actualización
    const data: any = {
      coins: { decrement: shopUpgrade.cost },
      lastUpdate: BigInt(Date.now()),
    };
    
    if (existingUpgrade) {
      // Verificar si puede seguir subiendo de nivel
      if (existingUpgrade.purchased >= config.maxLevel) {
        return { success: false, error: 'Max level reached' };
      }
      
      // Actualizar el upgrade existente (comprar siguiente nivel)
      const newPurchased = existingUpgrade.purchased + 1;
      const newCostMultiplier = Math.pow(config.costMultiplier, newPurchased);
      const newCost = Math.floor(config.baseCost * newCostMultiplier);
      
      const updatedUpgrades = player.upgrades.map(u => {
        if (u.id === upgradeId) {
          return {
            ...u,
            purchased: newPurchased,
            costMultiplier: newCostMultiplier,
            cost: newCost,
          };
        }
        return u;
      });
      data.upgrades = JSON.parse(JSON.stringify(updatedUpgrades));
      
      // Aplicar efecto
      if (config.type === 'click') {
        data.coinsPerClick = { increment: config.effect };
      } else if (config.type === 'passive') {
        data.coinsPerSecond = { increment: config.effect };
      }
    } else {
      // Es un nuevo upgrade - agregarlo al inventario
      const newUpgrades = [...player.upgrades, {
        id: upgradeId,
        name: shopUpgrade.name,
        description: shopUpgrade.description,
        cost: shopUpgrade.cost,
        costMultiplier: config.costMultiplier,
        effect: shopUpgrade.effect,
        maxLevel: shopUpgrade.maxLevel,
        purchased: 1, // Primer nivel
      }];
      data.upgrades = JSON.parse(JSON.stringify(newUpgrades));
      
      // Aplicar efecto
      if (config.type === 'click') {
        data.coinsPerClick = { increment: config.effect };
      } else if (config.type === 'passive') {
        data.coinsPerSecond = { increment: config.effect };
      }
    }
    
    // Remover del shop y agregar nuevo
    const newShopUpgrades = player.shopUpgrades!.filter(u => u.id !== upgradeId);
    
    // Generar un nuevo upgrade para el shop si hay espacio
    const purchasedIds = data.upgrades.map((u: any) => u.id);
    const currentShopIds = newShopUpgrades.map(u => u.id);
    const allExcludeIds = [...purchasedIds, ...currentShopIds];
    
    const newShopOptions = await this.getRandomUpgrades(1, allExcludeIds);
    if (newShopOptions.length > 0) {
      const newU = newShopOptions[0];
      newShopUpgrades.push({
        id: newU.id,
        name: newU.name,
        description: newU.description,
        cost: newU.baseCost,
        costMultiplier: 1,
        effect: newU.effect,
        maxLevel: newU.maxLevel,
        purchased: 0,
      });
    }
    
    data.shopUpgrades = JSON.parse(JSON.stringify(newShopUpgrades));
    
    await prisma.player.update({
      where: { playerId },
      data,
    });
    
    return { success: true };
  }
}

export const idleGameService = new IdleGameService();
