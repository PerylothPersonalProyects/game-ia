import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración expandida de Playwright para QA del Idle Clicker Game
 * Incluye múltiples proyectos, fixtures personalizadas, y configuraciones de video/screenshot
 */
export default defineConfig({
  // Directorio donde están los tests
  testDir: './tests',
  
  // Filtrar archivos de test
  testMatch: '**/*.spec.ts',
  
  // Timeout global para tests (en ms) - aumentado para servidores lentos
  timeout: 60000,
  
  // Expect timeout
  expect: {
    timeout: 10000
  },

  // Runs tests in parallel - only in CI, locally use 1 worker to avoid blocking
  workers: process.env.CI ? undefined : 1,
  
  // Fail on CI if there are test retries
  forbidOnly: !!process.env.CI,
  
  // Retry failed tests
  retries: process.env.CI ? 2 : 0,
  
  // Reporter - HTML y list para CI
  reporter: [
    ['html', { 
      open: 'never',
      outputFolder: 'playwright-report' 
    }],
    ['list'],
    ['json', { outputFile: 'playwright-report/results.json' }]
  ],

  // ============================================
  // WEB SERVER CONFIGURATION - Auto-start servers
  // ============================================
  // Only one webServer allowed in Playwright, so we run backend manually or skip E2E if backend needed
  // For full E2E with both backend and frontend, run: 
  // Terminal 1: cd server-cliker-ia && npm run dev
  // Terminal 2: cd qa && npx playwright test

  // Configuración de screenshot y video
  use: {
    // URL base - cambiar según el entorno
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    
    // Capturar screenshots solo en fallos
    screenshot: 'only-on-failure',
    
    // Grabar video solo en fallos
    video: 'retain-on-failure',
    
    // Verificar elementos visibles - aumentado para servidores lentos
    actionTimeout: 30000,
    
    // Trace en retry
    trace: 'on-first-retry',
    
    // Aceptar downloads
    acceptDownloads: true,
    
    // Locale
    locale: 'es-ES',
    
    // Timezone
    timezoneId: 'America/Mexico_City',
  },

  // Configuración de proyectos (navegadores)
  // Ejecutar solo chromium para evitar problemas de permisos en otros navegadores
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-dev-shm-usage']
        }
      },
    },
  ],

  // Output directory for test results
  outputDir: 'playwright-results',
});
