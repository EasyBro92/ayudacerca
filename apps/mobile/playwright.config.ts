import { defineConfig, devices } from '@playwright/test';

/**
 * Pruebas de la app sobre su exportación web (`pnpm export:web` + servidor estático).
 * Cubren la lógica y las pantallas; las particularidades nativas se prueban en dispositivo (ver docs/MOBILE_STORES.md).
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    ...devices['iPhone 13'],
    browserName: 'chromium',
    baseURL: process.env.APP_BASE_URL ?? 'http://localhost:8081',
    locale: 'es-ES',
    trace: 'retain-on-failure',
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
});
