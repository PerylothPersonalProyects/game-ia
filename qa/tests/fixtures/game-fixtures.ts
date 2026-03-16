import { test as base, Page } from '@playwright/test';

export interface GameState {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  upgrades?: UpgradeInfo[];
}

export interface UpgradeInfo {
  id: string;
  name: string;
  level: number;
  cost: number;
}

export interface AuthenticatedUser {
  userId: string;
  username: string;
}

export interface TestFixtures {
  gamePage: GamePage;
  gameState: GameState;
  authenticatedUser: AuthenticatedUser;
}

/**
 * Interfaz para GamePage (Page Object)
 */
export interface GamePage {
  goto(): Promise<void>;
  getCoins(): Promise<number>;
  clickGame(): Promise<void>;
  waitForCoins(amount: number, timeout?: number): Promise<void>;
  buyUpgrade(upgradeId: string): Promise<boolean>;
  getUpgradeLevel(upgradeId: string): Promise<number>;
  waitForPassiveGeneration(seconds: number): Promise<void>;
  getGameState(): Promise<GameState>;
}

// Import dinâmico para evitar dependencias circulares
let GamePageClass: any;

/**
 * Fixture: Proporciona una instancia de GamePage
 */
async function gamePageFixture({ page }: { page: Page }) {
  if (!GamePageClass) {
    const module = await import('./page-objects/GamePage');
    GamePageClass = module.GamePage;
  }
  return new GamePageClass(page);
}

/**
 * Fixture: Proporciona un estado de juego inicial
 */
async function gameStateFixture({ page }: { page: Page }) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Extraer estado del DOM o de window si está disponible
  const gameState = await page.evaluate(() => {
    // Intentar obtener estado del objeto global del juego
    const game = (window as any).game || (window as any).gameState;
    if (game) {
      return {
        coins: game.coins ?? 0,
        coinsPerClick: game.coinsPerClick ?? 1,
        coinsPerSecond: game.coinsPerSecond ?? 0,
        upgrades: game.upgrades ?? [],
      };
    }
    return null;
  });
  
  if (gameState) {
    return gameState;
  }
  
  // Fallback: crear estado por defecto basado en el DOM
  const coinsText = await page.locator('[class*="coin"], [id*="coin"]').first().textContent();
  return {
    coins: parseInt(coinsText?.replace(/\D/g, '') || '0'),
    coinsPerClick: 1,
    coinsPerSecond: 0,
    upgrades: [],
  };
}

/**
 * Fixture: Proporciona un usuario autenticado para tests
 */
async function authenticatedUserFixture(): Promise<AuthenticatedUser> {
  // En un caso real, esto vendría de un sistema de auth
  return {
    userId: `test-user-${Date.now()}`,
    username: 'testuser',
  };
}

export { gamePageFixture, gameStateFixture, authenticatedUserFixture };
