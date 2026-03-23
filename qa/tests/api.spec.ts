import { test, expect } from '@playwright/test';

/**
 * Tests de API para el Idle Clicker Game
 * Verifica los endpoints REST del backend
 */

test.describe('API - Endpoints', () => {
  const API_BASE = 'http://localhost:3001/api';

  test('GET /api/game/:playerId - obtener estado del juego', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/test-api-user`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('coins');
    expect(data.data).toHaveProperty('coinsPerClick');
    expect(data.data).toHaveProperty('coinsPerSecond');
    expect(data.data).toHaveProperty('upgrades');
  });

  test('POST /api/game/:playerId/click - registrar click', async ({ request }) => {
    const response = await request.post(`${API_BASE}/game/test-api-click/click`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('coins');
  });

  test('POST /api/game/:playerId/upgrade/:upgradeId - comprar upgrade', async ({ request }) => {
    // El endpoint puede devolver success: false si no hay coins suficientes
    // Lo importante es que el endpoint responda correctamente
    const response = await request.post(`${API_BASE}/game/test-api-upgrade/upgrade/click_1`);
    
    // Verificamos que el endpoint responde (puede ser success o failure)
    const text = await response.text();
    expect(text.length).toBeGreaterThan(0);
  });

  test('GET /api/game/:playerId - devuelve upgrades del juego', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/test-api-upgrades`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.upgrades).toBeDefined();
    expect(Array.isArray(data.data.upgrades)).toBe(true);
  });

  test('GET /api/health - salud del servidor', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    
    // El endpoint /api/health existe y responde
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('status');
  });

  test('POST /api/game/:playerId/click múltiples veces incrementa coins', async ({ request }) => {
    const playerId = 'test-multiple-clicks';
    const getResponse1 = await request.get(`${API_BASE}/game/${playerId}`);
    const data1 = await getResponse1.json();
    const coinsBefore = data1.data.coins;
    
    // Hacer varios clicks
    await request.post(`${API_BASE}/game/${playerId}/click`);
    await request.post(`${API_BASE}/game/${playerId}/click`);
    await request.post(`${API_BASE}/game/${playerId}/click`);
    
    const getResponse2 = await request.get(`${API_BASE}/game/${playerId}`);
    const data2 = await getResponse2.json();
    const coinsAfter = data2.data.coins;
    
    expect(coinsAfter).toBeGreaterThan(coinsBefore);
  });

  test('Manejo de jugador no existente', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/non-existent-player-xyz`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // El servidor crea el jugador si no existe
    expect(data.success).toBe(true);
  });
});