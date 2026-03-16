import { test, expect } from '@playwright/test';

/**
 * Tests de regresión visual para el Idle Clicker Game
 * Usa Playwright screenshot comparison para detectar cambios visuales
 */

test.describe('Visual Regression - Main UI', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('3.3 Screenshot del UI principal', async ({ page }) => {
    // Capturar screenshot del UI principal
    await expect(page).toHaveScreenshot('main-ui.png', {
      maxDiffPixelRatio: 0.1, // Allow 10% difference
    });
  });

  test('3.3 Screenshot del área de juego', async ({ page }) => {
    // Capturar solo el área de juego
    const gameArea = page.locator('main, #game, [class*="game"]').first();
    await expect(gameArea).toHaveScreenshot('game-area.png', {
      maxDiffPixelRatio: 0.1,
    });
  });

  test('3.3 Screenshot de la sección de upgrades', async ({ page }) => {
    // Capturar la sección de upgrades
    const upgradesSection = page.locator('[class*="upgrade"], [id*="upgrade"]');
    
    if (await upgradesSection.count() > 0) {
      await expect(upgradesSection.first()).toHaveScreenshot('upgrades-section.png', {
        maxDiffPixelRatio: 0.15,
      });
    }
  });
});

test.describe('Visual Regression - States', () => {
  
  test('3.3 UI con monedas', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Hacer algunos clicks para generar monedas
    const clickArea = page.locator('[class*="clicker"], button').first();
    for (let i = 0; i < 10; i++) {
      await clickArea.click({ force: true });
    }
    
    await page.waitForTimeout(500);
    
    // Capturar estado con monedas
    await expect(page).toHaveScreenshot('ui-with-coins.png', {
      maxDiffPixelRatio: 0.1,
    });
  });

  test('3.3 UI después de hover en upgrade', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Hacer hover en un upgrade
    const upgradeButton = page.locator('[class*="upgrade"], button').first();
    if (await upgradeButton.isVisible()) {
      await upgradeButton.hover();
      await page.waitForTimeout(200);
      
      await expect(page).toHaveScreenshot('upgrade-hover.png', {
        maxDiffPixelRatio: 0.1,
      });
    }
  });
});

test.describe('Visual Regression - Responsive', () => {
  
  test('3.3 UI en viewport móvil', async ({ page }) => {
    // Cambiar a viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('mobile-view.png', {
      maxDiffPixelRatio: 0.15,
    });
  });

  test('3.3 UI en viewport tablet', async ({ page }) => {
    // Cambiar a viewport tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('tablet-view.png', {
      maxDiffPixelRatio: 0.15,
    });
  });
});
