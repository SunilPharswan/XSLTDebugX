import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration for XSLTDebugX
 * Tests a static site deployed on Cloudflare Pages
 */

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.js',

  /* Run tests in separate processes */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests twice in CI, once locally */
  retries: process.env.CI ? 2 : 1,

  /* Run tests in parallel on CI and locally */
  workers: process.env.CI ? 4 : 4,

  /* Reporter to use */
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ...(process.env.CI ? [] : [['list']])
  ],

  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.BASE_URL || 'http://localhost:8000',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Additional browsers can be added later for broader coverage
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run serve',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* Global test timeout */
  timeout: 30 * 1000,

  /* Global navigation timeout */
  navigationTimeout: 30 * 1000,

  /* Expect timeout (for assertions) */
  expect: {
    timeout: 10 * 1000
  }
});
