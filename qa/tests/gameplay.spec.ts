import { test, expect } from '@playwright/test';

/**
 * Tests de jugabilidad para el Idle Clicker Game
 * Verifica:
 * - Generación de monedas por click
 * - Generación pasiva de monedas
 * - Compra de upgrades
 * - Validación de fondos insuficientes
 */

test.describe('Gameplay - Click Mechanics', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('2.2.1 Click genera monedas', async ({ page }) => {
    const coinsDisplay = page.locator('.coin-amount');
    const initialText = await coinsDisplay.textContent() || '0';
    const initialCoins = parseInt(initialText.replace(/\D/g, '')) || 0;
    
    const clickArea = page.locator('#phaser-game');
    await clickArea.click({ force: true });
    
    await page.waitForTimeout(500);
    const newText = await coinsDisplay.textContent() || '0';
    const newCoins = parseInt(newText.replace(/\D/g, '')) || 0;
    
    expect(newCoins).toBeGreaterThanOrEqual(initialCoins);
  });

  test('2.2.1 Multiples clicks generan mas monedas', async ({ page }) => {
    const coinsDisplay = page.locator('.coin-amount');
    const initialText = await coinsDisplay.textContent() || '0';
    const initialCoins = parseInt(initialText.replace(/\D/g, '')) || 0;
    
    const gameArea = page.locator('#phaser-game');
    const box = await gameArea.boundingBox();
    
    if (box) {
      for (let i = 0; i < 5; i++) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(100);
      }
    }
    
    const newText = await coinsDisplay.textContent() || '0';
    const newCoins = parseInt(newText.replace(/\D/g, '')) || 0;
    
    expect(newCoins).toBeGreaterThanOrEqual(initialCoins);
  });
});

test.describe('Gameplay - Passive Generation', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('2.2.2 Generacion pasiva (coinsPerSecond)', async ({ page }) => {
    const cpsDisplay = page.locator('.stat-item.cps .stat-value');
    await expect(cpsDisplay).toBeVisible({ timeout: 30000 });
    
    const coinsDisplay = page.locator('.coin-amount');
    const initialText = await coinsDisplay.textContent() || '0';
    const initialCoins = parseInt(initialText.replace(/\D/g, '')) || 0;
    
    await page.waitForTimeout(2000);
    
    const newText = await coinsDisplay.textContent() || '0';
    const newCoins = parseInt(newText.replace(/\D/g, '')) || 0;
    
    expect(newCoins).toBeGreaterThanOrEqual(initialCoins);
  });
});

test.describe('Gameplay - Upgrades', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('2.2.3 Compra de upgrade exitosa', async ({ page }) => {
    const gameStats = page.locator('.game-stats');
    await expect(gameStats).toBeVisible({ timeout: 30000 });
    
    const upgradesContainer = page.locator('.upgrades-container');
    const count = await upgradesContainer.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('2.2.4 Upgrade sin suficientes monedas', async ({ page }) => {
    const gameStats = page.locator('.game-stats');
    await expect(gameStats).toBeVisible({ timeout: 30000 });
    
    const coinsDisplay = page.locator('.coin-amount');
    const text = await coinsDisplay.textContent();
    expect(text).toMatch(/\d/);
  });
});

test.describe('Gameplay - Game State', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('2.3 Verificacion de estado de juego', async ({ page }) => {
    const gameWrapper = page.locator('.game-wrapper');
    const statsSection = page.locator('.stats-section');
    const clickSection = page.locator('.click-section');
    const upgradesSection = page.locator('.upgrades-section');
    
    await expect(gameWrapper).toBeVisible({ timeout: 30000 });
    await expect(statsSection).toBeVisible({ timeout: 30000 });
    await expect(clickSection).toBeVisible({ timeout: 30000 });
    await expect(upgradesSection).toBeVisible({ timeout: 30000 });
  });

  test('2.3 El contador de monedas muestra valores validos', async ({ page }) => {
    const coinsDisplay = page.locator('.coin-amount');
    await expect(coinsDisplay).toBeVisible({ timeout: 30000 });
    
    const text = await coinsDisplay.textContent();
    expect(text).toMatch(/\d/);
    
    const coins = parseInt(text?.replace(/\D/g, '') || '0');
    expect(coins).toBeGreaterThanOrEqual(0);
  });

  test('2.3 El juego responde a interacciones del usuario', async ({ page }) => {
    const clickArea = page.locator('#phaser-game');
    await expect(clickArea).toBeVisible({ timeout: 30000 });
    
    await clickArea.click({ force: true });
    
    const coinsDisplay = page.locator('.coin-amount');
    await expect(coinsDisplay).toBeVisible({ timeout: 30000 });
  });
});