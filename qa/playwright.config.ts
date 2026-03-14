import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Directorio donde están los tests
  testDir: './tests',
  
  // Filtrar archivos de test
  testMatch: '**/*.spec.ts',
  
  // Timeout global
  timeout: 30 * 1000,
  
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
  
  // Reporter
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],

  // Configuración de screenshot y video
  use: {
    // URL base - cambiar según el entorno
    baseURL: 'http://localhost:3000',
    
    // Capturar screenshots solo en fallos
    screenshot: 'only-on-failure',
    
    // Grabar video solo en fallos
    video: 'retain-on-failure',
    
    // Verificar elementos visibles
    actionTimeout: 10 * 1000,
    
    // Trace en retry
    trace: 'on-first-retry',
  },

  // Configuración de proyectos (navegadores)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Servidor web para desarrollo
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
