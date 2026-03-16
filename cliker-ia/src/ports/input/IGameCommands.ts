/**
 * Input Ports - Contratos para comandos del juego
 * 
 * Estos puertos definen las acciones que pueden ejecutarse en el juego.
 * Son la interfaz que los adaptadores (React hooks, etc.) implementan.
 */

import type { GameState, Upgrade } from '../../types';

/**
 * Resultado de un click
 */
export interface ClickResult {
  newCoins: number;
  totalCoins: number;
  coinsPerClick: number;
}

/**
 * Resultado de comprar un upgrade
 */
export interface PurchaseResult {
  success: boolean;
  upgradeId: string;
  newLevel: number;
  newCost: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  remainingCoins: number;
}

/**
 * Resultado de sincronización
 */
export interface SyncResult {
  success: boolean;
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  offlineEarned?: number;
  lastSync: number;
}

/**
 * Puerto de comandos del juego
 * Define las acciones que pueden ejecutarse
 */
export interface IGameCommands {
  /**
   * Efectúa un click del jugador
   */
  click(): Promise<ClickResult>;
  
  /**
   * Compra un upgrade
   * @param upgradeId - ID del upgrade a comprar
   */
  purchaseUpgrade(upgradeId: string): Promise<PurchaseResult>;
  
  /**
   * Reinicia el juego
   */
  resetGame(): Promise<void>;
  
  /**
   * Sincroniza el estado con el servidor
   */
  sync(): Promise<SyncResult>;
  
  /**
   * Guarda el estado actual
   */
  save(): Promise<void>;
}

/**
 * Puerto de queries del juego
 * Define las consultas que pueden hacerse
 */
export interface IGameQuery {
  /**
   * Obtiene el estado actual del juego
   */
  getState(): GameState;
  
  /**
   * Obtiene las monedas actuales
   */
  getCoins(): number;
  
  /**
   * Obtiene las monedas por click
   */
  getCoinsPerClick(): number;
  
  /**
   * Obtiene las monedas por segundo
   */
  getCoinsPerSecond(): number;
  
  /**
   * Obtiene los upgrades comprados
   */
  getUpgrades(): Upgrade[];
  
  /**
   * Obtiene los upgrades disponibles en la tienda
   */
  getShopUpgrades(): Upgrade[];
  
  /**
   * Verifica si el jugador puede comprar un upgrade
   */
  canAfford(upgradeId: string): boolean;
  
  /**
   * Obtiene el ID del jugador
   */
  getPlayerId(): string;
  
  /**
   * Verifica si el juego está cargado
   */
  isLoaded(): boolean;
}

/**
 * Puerto presenter - para renderizar el estado en UI
 */
export interface IGamePresenter {
  /**
   * Prepara los datos para renderizar en Phaser/React
   */
  prepareRenderData(state: GameState): {
    stats: {
      coins: number;
      coinsPerClick: number;
      coinsPerSecond: number;
    };
    upgrades: Array<{
      id: string;
      name: string;
      description: string;
      level: number;
      maxLevel: number;
      cost: number;
      canAfford: boolean;
      type: 'click' | 'passive';
    }>;
  };
}
