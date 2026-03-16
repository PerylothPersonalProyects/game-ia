/**
 * Ports - Exportaciones centrales
 * 
 * Arquitectura Hexagonal:
 * - Input Ports: Contratos para acciones del juego (commands/queries)
 * - Output Ports: Contratos para servicios externos (repository, sync)
 */

// Input Ports
export type { IGameCommands, IGameQuery, IGamePresenter } from './input/IGameCommands';
export type { ClickResult, PurchaseResult, SyncResult } from './input/IGameCommands';

// Output Ports
export type { 
  IGameRepository, 
  ISyncService, 
  INotificationPort 
} from './output/IGameRepository';
export type {
  ClickServerResponse,
  PurchaseServerResponse,
  SyncServerResponse,
  GameStateResponse
} from './output/IGameRepository';
