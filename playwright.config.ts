import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const BASE_URL = process.env.BASE_URL ?? 'https://www.hedgesdirect.co.uk';
const CI = !!process.env.CI;

const STORAGE_REGISTERED = path.resolve('test-assets/storageStates/registered.json');

export default defineConfig({
  testDir: './tests',

  /* Global timeouts */
  timeout: 60_000,                 // per test
  expect: { timeout: 10_000 },

  /* Parallelism */
  fullyParallel: true,
  workers: CI ? 2 : undefined,

  /* Retries */
  retries: CI ? 2 : 0,

  /* Reporters */
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
    ['list']
  ],

  /* Artifacts */
  use: {
    baseURL: BASE_URL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,

    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    locale: 'en-GB',
    timezoneId: 'Europe/London',

    // Helps stabilize tests on dynamic pages
    ignoreHTTPSErrors: true
  },

  /* Output directories */
  outputDir: 'test-results',

  /* Projects (roles) */
  projects: [
    {
      name: 'chromium-guest',
      use: {
        ...devices['Desktop Chrome']
        // Guest uses default context (no storageState)
      }
    },

    {
      name: 'chromium-registered',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_REGISTERED
      }
    }

    // Add more later if needed:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ]
});