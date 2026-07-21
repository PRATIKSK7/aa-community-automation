import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Read from default ".env" file.
dotenv.config();

export default defineConfig({
  testDir: './tests',
  /* Maximum time one test can run for. Set to 120s for cloud form/file-upload flows */
  timeout: 120 * 1000,
  expect: {
    timeout: 5000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.AA_BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Screenshot only on failure. */
    screenshot: 'only-on-failure',
    /* Video retain on failure. */
    video: 'retain-on-failure'
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'ui',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        headless: process.env.HEADLESS !== 'false'
      }
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {/* No need for a browser when testing API */}
    }
  ]
});
