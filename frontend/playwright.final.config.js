import { defineConfig, devices } from '@playwright/test';

// Esta configuración es INDEPENDIENTE de la que ya generó Playwright.
// Incluye auth.spec.js existente y los tests nuevos; ignora example.spec.js.
export default defineConfig({
  testDir: './tests',
  testIgnore: '**/example.spec.js',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  globalSetup: './tests/helpers/global-setup.js',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: process.env.E2E_FRONTEND_URL || 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});
