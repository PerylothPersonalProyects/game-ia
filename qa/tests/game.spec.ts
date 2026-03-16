import { test, expect } from '@playwright/test';

/**
 * Test funcional para el Idle Clicker Game
 */

test.describe('Idle Clicker Game', () => {
  
  test('debería cargar la página principal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar que la página carga
    await expect(page).toHaveTitle(/.*/);
  });

  test('debería tener contenido en la página', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar que hay contenido
    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });
});
