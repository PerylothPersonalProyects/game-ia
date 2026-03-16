import { test as base, Page, Locator } from '@playwright/test';
import type { TestFixtures, GameState } from './game-fixtures';

/**
 * Custom fixtures para el Idle Clicker Game
 * Proporcionan utilities y estado preconfigurado para los tests
 */
export const test = base.extend<TestFixtures>;

/**
 * GamePage - Page Object Model para el juego
 * Abstrae la interacción con los elementos del DOM
 */
export class GamePage {
  readonly page: Page;
  
  // Selectores
  readonly coinsDisplay: Locator;
  readonly gameArea: Locator;
  readonly clickButton: Locator;
  readonly upgradesSection: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    // Inicializar locators con selectores flexibles
    this.coinsDisplay = page.locator('[class*="coin"], [id*="coin"], [data-testid="coins"]').first();
    this.gameArea = page.locator('main, #game, [class*="game"]').first();
    this.clickButton = page.locator('[class*="clicker"], [id*="clicker"], button').first();
    this.upgradesSection = page.locator('[class*="upgrade"], [id*="upgrade"]');
  }
  
  /**
   * Navega a la página del juego
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }
  
  /**
   * Obtiene el valor actual de monedas
   */
  async getCoins(): Promise<number> {
    const text = await this.coinsDisplay.textContent() || '0';
    return parseInt(text.replace(/\D/g, '')) || 0;
  }
  
  /**
   * Hace click en el área de juego
   */
  async clickGame(): Promise<void> {
    await this.clickButton.click({ force: true });
  }
  
  /**
   * Espera hasta que las monedas lleguen a un valor específico
   */
  async waitForCoins(amount: number, timeout: number = 5000): Promise<void> {
    await this.coinsDisplay.waitFor({ state: 'visible' });
    
    const startTime = Date.now();
    while (await this.getCoins() < amount) {
      if (Date.now() - startTime > timeout) {
        throw new Error(`Timeout esperando ${amount} monedas`);
      }
      await this.page.waitForTimeout(100);
    }
  }
  
  /**
   * Intenta comprar un upgrade
   * @returns true si la compra fue exitosa, false si no había suficientes monedas
   */
  async buyUpgrade(upgradeId: string): Promise<boolean> {
    const upgradeButton = this.page.locator(`[data-testid="upgrade-${upgradeId}"], [id*="${upgradeId}"], [class*="${upgradeId}"]`).first();
    
    if (!await upgradeButton.isVisible()) {
      return false;
    }
    
    const isDisabled = await upgradeButton.isDisabled();
    if (isDisabled) {
      return false;
    }
    
    await upgradeButton.click();
    return true;
  }
  
  /**
   * Obtiene el nivel de un upgrade específico
   */
  async getUpgradeLevel(upgradeId: string): Promise<number> {
    const upgradeElement = this.page.locator(`[data-testid="upgrade-${upgradeId}"], [id*="${upgradeId}"], [class*="${upgradeId}"]`).first();
    
    if (!await upgradeElement.isVisible()) {
      return 0;
    }
    
    const text = await upgradeElement.textContent() || '';
    const levelMatch = text.match(/level\s*[:\-]?\s*(\d+)/i);
    return levelMatch ? parseInt(levelMatch[1]) : 0;
  }
  
  /**
   * Espera tiempo para que pase la generación pasiva de monedas
   */
  async waitForPassiveGeneration(seconds: number): Promise<void> {
    await this.page.waitForTimeout(seconds * 1000);
  }
  
  /**
   * Obtiene el estado completo del juego
   */
  async getGameState(): Promise<GameState> {
    return {
      coins: await this.getCoins(),
      // Estos valores podrían extraerse del DOM o de una API interna
      coinsPerClick: 1, //默认值
      coinsPerSecond: 0, //默认值
    };
  }
}

/**
 * Fixture que proporciona una instancia de GamePage
 */
export const gamePage = async ({ page }: { page: Page }) => {
  return new GamePage(page);
};

// Re-exportar tipos para uso en tests
export type { GameState, TestFixtures } from './game-fixtures';
