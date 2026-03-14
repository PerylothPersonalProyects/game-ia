import { PlayerModel, UpgradeConfigModel, IPlayer, IUpgrade, IUpgradeConfig } from '../database/models/Player.js';
import type { 
  GameState, 
  Upgrade, 
  UpgradeConfig,
  SyncResponse,
  ClickResponse,
  UpgradeResponse
} from '../types/idle-game.js';

class IdleGameService {
  // Obtener configuraciones de mejoras desde la DB
  async getUpgradeConfigs(): Promise<UpgradeConfig[]> {
    const configs = await UpgradeConfigModel.find({ enabled: true }).lean();
    return configs.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      baseCost: c.baseCost,
      costMultiplier: c.costMultiplier,
      effect: c.effect,
      maxLevel: c.maxLevel,
      type: c.type,
    }));
  }

  // Inicializar upgrades para un jugador basados en la config de la DB
  private async getDefaultUpgrades(): Promise<IUpgrade[]> {
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

  // Obtener o crear jugador desde MongoDB
  async getOrCreatePlayer(playerId: string): Promise<IPlayer> {
    let player = await PlayerModel.findOne({ playerId });
    
    if (!player) {
      // Crear jugador con upgrades de la DB
      player = await PlayerModel.create({
        playerId,
        coins: 0,
        coinsPerClick: 1,
        coinsPerSecond: 0,
        upgrades: await this.getDefaultUpgrades(),
        lastUpdate: Date.now(),
      });
    } else {
      // Verificar si las mejoras del jugador coinciden con la config de la DB
      const dbConfigs = await this.getUpgradeConfigs();
      const playerUpgradeIds = player.upgrades.map(u => u.id);
      const dbConfigIds = dbConfigs.map(c => c.id);
      
      // Si hay nuevas mejoras en la DB, agregarlas
      for (const config of dbConfigs) {
        if (!playerUpgradeIds.includes(config.id)) {
          player.upgrades.push({
            id: config.id,
            name: config.name,
            description: config.description,
            cost: config.baseCost,
            costMultiplier: 1,
            effect: config.effect,
            maxLevel: config.maxLevel,
            purchased: 0,
          });
        }
      }
      
      // Si hay mejoras en el jugador que ya no existen en la DB, marcarlas
      for (const upgrade of player.upgrades) {
        if (!dbConfigIds.includes(upgrade.id)) {
          upgrade.purchased = -1; // Marcador de mejora eliminada
        }
      }
      
      await player.save();
    }
    
    return player;
  }

  // Obtener estado completo del juego (formato cliente)
  async getGameState(playerId: string): Promise<GameState> {
    const player = await this.getOrCreatePlayer(playerId);
    
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
    
    return {
      coins: player.coins,
      coinsPerClick: player.coinsPerClick,
      coinsPerSecond: player.coinsPerSecond,
      upgrades: validUpgrades,
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

  // Procesar click
  async processClick(playerId: string): Promise<{ player: IPlayer; earned: number }> {
    const player = await this.getOrCreatePlayer(playerId);
    const earned = player.coinsPerClick;
    
    player.coins += earned;
    player.lastUpdate = Date.now();
    
    await player.save();
    
    return { player, earned };
  }

  // Calcular ingresos pasivos basados en tiempo
  async calculateOfflineProgress(playerId: string): Promise<{ earned: number; newCoins: number }> {
    const player = await this.getOrCreatePlayer(playerId);
    
    if (player.coinsPerSecond === 0) {
      return { earned: 0, newCoins: player.coins };
    }

    const now = Date.now();
    const deltaSeconds = Math.floor((now - player.lastUpdate) / 1000);
    // Máximo 8 horas de progreso offline
    const maxOfflineSeconds = 8 * 60 * 60;
    const offlineSeconds = Math.min(deltaSeconds, maxOfflineSeconds);
    
    const earned = Math.floor(player.coinsPerSecond * offlineSeconds);
    const newCoins = player.coins + earned;
    
    player.coins = newCoins;
    player.lastUpdate = now;
    
    await player.save();

    return { earned, newCoins };
  }

  // Comprar upgrade
  async buyUpgrade(playerId: string, upgradeId: string): Promise<{ 
    success: boolean; 
    player?: IPlayer; 
    upgrade?: Upgrade; 
    error?: string 
  }> {
    const player = await this.getOrCreatePlayer(playerId);
    
    const upgrade = player.upgrades.find(u => u.id === upgradeId && u.purchased >= 0);
    if (!upgrade) {
      return { success: false, error: 'Upgrade not found' };
    }

    const config = await UpgradeConfigModel.findOne({ id: upgradeId });
    if (!config) {
      return { success: false, error: 'Upgrade config not found' };
    }

    if (player.coins < upgrade.cost) {
      return { success: false, error: 'Insufficient coins' };
    }

    if (upgrade.purchased >= config.maxLevel) {
      return { success: false, error: 'Max level reached' };
    }

    // Deducir costo
    player.coins -= upgrade.cost;

    // Subir nivel
    upgrade.purchased += 1;
    upgrade.costMultiplier = Math.pow(config.costMultiplier, upgrade.purchased);
    upgrade.cost = Math.floor(config.baseCost * upgrade.costMultiplier);

    // Aplicar efecto
    if (config.type === 'click') {
      player.coinsPerClick += config.effect;
    } else if (config.type === 'passive') {
      player.coinsPerSecond += config.effect;
    }

    player.lastUpdate = Date.now();
    await player.save();

    return { 
      success: true, 
      player, 
      upgrade: {
        id: upgrade.id,
        name: upgrade.name,
        description: upgrade.description,
        cost: upgrade.cost,
        costMultiplier: upgrade.costMultiplier,
        effect: upgrade.effect,
        maxLevel: upgrade.maxLevel,
        purchased: upgrade.purchased,
      }
    };
  }

  // Guardar estado del jugador
  async saveGame(playerId: string, state: GameState): Promise<{ success: boolean }> {
    const player = await this.getOrCreatePlayer(playerId);
    
    player.coins = state.coins;
    player.coinsPerClick = state.coinsPerClick;
    player.coinsPerSecond = state.coinsPerSecond;
    
    // Actualizar upgrades
    for (const upgradeState of state.upgrades) {
      const playerUpgrade = player.upgrades.find(u => u.id === upgradeState.id);
      if (playerUpgrade && playerUpgrade.purchased >= 0) {
        playerUpgrade.purchased = upgradeState.purchased;
        playerUpgrade.cost = upgradeState.cost;
        playerUpgrade.costMultiplier = upgradeState.costMultiplier;
      }
    }
    
    player.lastUpdate = Date.now();
    await player.save();

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
    await PlayerModel.deleteOne({ playerId });
    return { success: true };
  }
}

export const idleGameService = new IdleGameService();
