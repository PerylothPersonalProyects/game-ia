/**
 * Adapters - Implementaciones de los puertos
 * 
 * Arquitectura Hexagonal:
 * - Input Adapters: Implementan los puertos de entrada (驱动)
 * - Output Adapters: Implementan los puertos de salida (驱动)
 */

// Output Adapters
export { RestApiAdapter, restApiAdapter } from './output/RestApiAdapter';
export { LocalStorageAdapter, localStorageAdapter } from './output/LocalStorageAdapter';
