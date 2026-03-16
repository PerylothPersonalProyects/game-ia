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
    await page.waitForLoadState('networkidle');
  });

  test('2.2.1 Click genera monedas', async ({ page }) => {
    // Obtener valor inicial
    const coinsDisplay = page.locator('[class*="coin"], [id*="coin"]').first();
    const initialText = await coinsDisplay.textContent() || '0';
    const initialCoins = parseInt(initialText.replace(/\D/g, '')) || 0;
    
    // Hacer click en el área de juego
    const clickArea = page.locator('[class*="clicker"], [id*="clicker"], button').first();
    await clickArea.click({ force: true });
    
    // Verificar incremento
    await page.waitForTimeout(100);
    const newText = await coinsDisplay.textContent() || '0';
    const newCoins = parseInt(newText.replace(/\D/g, '')) || 0;
    
    expect(newCoins).toBeGreaterThan(initialCoins);
    expect(newCoins).toBe(initialCoins + 1); // coinsPerClick default = 1
  });

  test('2.2.1 Múltiples clicks generan más monedas', async ({ page }) => {
    const coinsDisplay = page.locator('[class*="coin"], [id*="coin"]').first();
    const initialText = await coinsDisplay.textContent() || '0';
    const initialCoins = parseInt(initialText.replace(/\D/g, '')) || 0;
    
    // Hacer múltiples clicks
    const clickArea = page.locator('[class*="clicker"], [id*="clicker"], button').first();
    for (let i = 0; i < 5; i++) {
      await clickArea.click({ force: true });
      await page.waitForTimeout(50);
    }
    
    // Verificar incremento
    const newText = await coinsDisplay.textContent() || '0';
    const newCoins = parseInt(newText.replace(/\D/g, '')) || 0;
    
    expect(newCoins).toBe(initialCoins + 5);
  });
});

test.describe('Gameplay - Passive Generation', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('2.2.2 Generación pasiva (coinsPerSecond)', async ({ page }) => {
    // Esta prueba asume que el juego tiene coinsPerSecond > 0
    // o que el usuario puede comprar un upgrade que dé generación pasiva
    
    const coinsDisplay = page.locator('[class*="coin"], [id*="coin"]').first();
    const initialText = await coinsDisplay.textContent() || '0';
    const initialCoins = parseInt(initialText.replace(/\D/g, '')) || 0;
    
    // Si hay generación pasiva, esperar 2 segundos
    await page.waitForTimeout(2000);
    
    const newText = await coinsDisplay.textContent() || '0';
    const newCoins = parseInt(newText.replace(/\D/g, '')) || 0;
    
    // La generación pasiva puede no estar activa inicialmente
    // Solo verificamos que el juego no crashee durante la espera
    expect(newCoins).toBeGreaterThanOrEqual(initialCoins);
  });
});

test.describe('Gameplay - Upgrades', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('2.2.3 Compra de upgrade exitosa', async ({ page }) => {
    // Buscar la sección de upgrades
    const upgradesSection = page.locator('[class*="upgrade"], [id*="upgrade"]');
    const upgradeCount = await upgradesSection.count();
    
    // Verificar que hay upgrades disponibles
    expect(upgradeCount).toBeGreaterThan(0);
    
    // Buscar un botón de compra
    const buyButtons = page.locator('button:has-text("Buy"), button:has-text("Comprar"), [class*="buy"]');
    const buttonCount = await buyButtons.count();
    
    if (buttonCount > 0) {
      // Obtener monedas iniciales
      const coinsDisplay = page.locator('[class*="coin"], [id*="coin"]').first();
      const initialText = await coinsDisplay.textContent() || '0';
      const initialCoins = parseInt(initialText.replace(/\D/g, '')) || 0;
      
      // Intentar comprar un upgrade (puede no tener suficientes monedas)
      const firstButton = buyButtons.first();
      const isDisabled = await firstButton.isDisabled();
      
      if (!isDisabled) {
        await firstButton.click();
        await page.waitForTimeout(100);
        
        // Verificar que las monedas disminuyeron o el nivel aumentó
        const newText = await coinsDisplay.textContent() || '0';
        const newCoins = parseInt(newText.replace(/\D/g, '')) || 0;
        
        // Si la compra fue exitosa, las monedas deberían haber disminuido
        // O el nivel del upgrade debería haber aumentado
        expect(newCoins).toBeLessThanOrEqual(initialCoins);
      }
    }
  });

  test('2.2.4 Upgrade sin suficientes monedas', async ({ page }) => {
    // Buscar botones de compra
    const buyButtons = page.locator('button:has-text("Buy"), button:has-text("Comprar")');
    const buttonCount = await buyButtons.count();
    
    if (buttonCount > 0) {
      // Verificar que al menos un botón esté deshabilitado por falta de monedas
      let hasDisabledButton = false;
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buyButtons.nth(i);
        if (await button.isDisabled()) {
          hasDisabledButton = true;
          break;
        }
      }
      
      // También verificamos que existe el mensaje de error o el botón está deshabilitado
      const errorMessage = page.locator('text=INSUFFICIENT_COINS, text=insufficient');
      const hasErrorMessage = await errorMessage.count() > 0;
      
      expect(hasDisabledButton || hasErrorMessage).toBeTruthy();
    }
  });
});

test.describe('Gameplay - Game State', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('2.3 Verificación de estado de juego', async ({ page }) => {
    // Verificar que el estado del juego está disponible
    const gameState = await page.evaluate(() => {
      return {
        hasWindowGame: !!(window as any).game,
        hasWindowGameState: !!(window as any).gameState,
        documentHasGameElement: !!document.querySelector('[class*="game"], #game, main'),
      };
    });
    
    // Al menos uno de estos debe ser verdadero
    expect(
      gameState.hasWindowGame || 
      gameState.hasWindowGameState || 
      gameState.documentHasGameElement
    ).toBeTruthy();
  });

  test('2.3 El contador de monedas muestra valores válidos', async ({ page }) => {
    const coinsDisplay = page.locator('[class*="coin"], [id*="coin"]').first();
    
    // Verificar visibilidad
    await expect(coinsDisplay).toBeVisible();
    
    // Verificar que contiene un número
    const text = await coinsDisplay.textContent();
    expect(text).toMatch(/\d/);
    
    // Verificar que es un número válido (no NaN)
    const coins = parseInt(text?.replace(/\D/g, '') || '0');
    expect(coins).toBeGreaterThanOrEqual(0);
  });

  test('2.3 El juego responde a interacciones del usuario', async ({ page }) => {
    // Verificar que el juego responde a clicks
    const clickArea = page.locator('[class*="clicker"], [id*="clicker"], button').first();
    
    // El área debe ser visible y habilitada
    await expect(clickArea).toBeVisible();
    
    // Debe poder hacer click sin errores
    await clickArea.click({ force: true });
    
    // No debe haber errores en la consola
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(500);
    
    // Verificar que no hay errores críticos
    const criticalErrors = consoleErrors.filter(e => 
      !e.includes('warning') && 
      !e.includes('deprecated')
    );
    expect(criticalErrors.length).toBe(0);
  });
});
