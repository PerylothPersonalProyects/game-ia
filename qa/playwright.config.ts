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
  
  // Timeout global para tests (en ms)
  timeout: 30000,
  
  // Expect timeout
  expect: {
    timeout: 5000
  },

  // Runs tests in parallel
  fullyParallel: true,
  
  // Fail on CI if there are test retries
  forbidOnly: !!process.env.CI,
  
  // Retry failed tests
  retries: process.env.CI ? 2 : 0,
  
  // Workers (procesos paralelos)
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter - HTML y list para CI
  reporter: [
    ['html', { 
      open: 'never',
      outputFolder: 'playwright-report' 
    }],
    ['list'],
    ['json', { outputFile: 'playwright-report/results.json' }]
  ],

  // Configuración de screenshot y video
  use: {
  // URL base - cambiar según el entorno
  // IMPORTANTE: Asegúrate de que el servidor del juego esté corriendo
  // Para iniciar el juego: cd ../cliker-ia && npm run dev
  baseURL: process.env.BASE_URL || 'http://localhost:5173',
    
    // Capturar screenshots solo en fallos
    screenshot: 'only-on-failure',
    
    // Grabar video solo en fallos
    video: 'retain-on-failure',
    
    // Verificar elementos visibles
    actionTimeout: 10 * 1000,
    
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
