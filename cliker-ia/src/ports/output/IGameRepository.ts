/**
 * Output Ports - Contratos para servicios externos
 * 
 * Estos puertos definen las interfaces con sistemas externos:
 * - Repositorio (persistencia)
 * - Servicio de sincronización (backend)
 * - Notificaciones (analytics, etc.)
 */

import type { GameState } from '../../types';

/**
 * Puerto para persistencia del juego
 * Implementado por: LocalStorage, IndexedDB, Backend API, etc.
 */
export interface IGameRepository {
  /**
   * Guarda el estado del juego
   */
  save(state: GameState): Promise<void>;
  
  /**
   * Carga el estado del juego
   */
  load(): Promise<GameState | null>;
  
  /**
   * Elimina los datos guardados
   */
  delete(): Promise<void>;
  
  /**
   * Verifica si hay datos guardados
   */
  hasData(): Promise<boolean>;
}

/**
 * Respuesta del servidor al procesar un click
 */
export interface ClickServerResponse {
  success: boolean;
  coins: number;
  clickPower: number;
  coinsPerClick: number;
}

/**
 * Respuesta del servidor al comprar un upgrade
 */
export interface PurchaseServerResponse {
  success: boolean;
  upgradeId: string;
  newLevel: number;
  newCost: number;
  coinsPerClick: number;
  coinsPerSecond: number;
}

/**
 * Respuesta del servidor al sincronizar
 */
export interface SyncServerResponse {
  success: boolean;
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  lastSync: number;
  offlineEarned?: number;
}

/**
 * Estado del juego desde el servidor
 */
export interface GameStateResponse {
  success: boolean;
  data?: GameState;
  error?: string;
}

/**
 * Puerto para sincronización con el servidor
 * Implementado por: REST API, WebSocket, etc.
 */
export interface ISyncService {
  /**
   * Carga el estado inicial del juego desde el servidor
   */
  loadGame(playerId: string): Promise<GameState>;
  
  /**
   * Procesa un click en el servidor
   */
  click(playerId: string): Promise<ClickServerResponse>;
  
  /**
   * Compra un upgrade en el servidor
   */
  purchaseUpgrade(playerId: string, upgradeId: string): Promise<PurchaseServerResponse>;
  
  /**
   * Sincroniza el estado con el servidor
   */
  sync(playerId: string): Promise<SyncServerResponse>;
  
  /**
   * Guarda el estado en el servidor
   */
  save(playerId: string, state: GameState): Promise<{ savedAt: number }>;
  
  /**
   * Elimina los datos del servidor
   */
  deleteGame(playerId: string): Promise<void>;
  
  /**
   * Verifica si el servidor está disponible
   */
  ping(): Promise<boolean>;
  
  /**
   * Obtiene la URL base del servidor
   */
  getBaseUrl(): string;
}

/**
 * Puerto para notificaciones externas
 * Implementado por: Analytics, Console, etc.
 */
export interface INotificationPort {
  /**
   * Notifica un evento
   */
  notify(event: string, data?: Record<string, unknown>): void;
  
  /**
   * Notifica un error
   */
  error(message: string, context?: Record<string, unknown>): void;
  
  /**
   * Notifica una métrica
   */
  metric(name: string, value: number): void;
}
