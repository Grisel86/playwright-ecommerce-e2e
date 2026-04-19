import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file.
// This pattern lets QAs run tests against different environments (dev, staging, prod)
// without changing code — just by swapping the .env file.
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Playwright Test configuration.
 * Senior-level patterns demonstrated here:
 *   - Multi-browser matrix (Chromium, Firefox, WebKit, plus mobile viewports)
 *   - Environment-driven base URL so the same suite targets dev/staging/prod
 *   - Retries and workers tuned differently for CI vs local runs
 *   - Multiple reporters (HTML for humans, JSON for CI dashboards, list for quick console feedback)
 *   - Tracing, screenshots, and video captured only on failure to keep artifacts small
 *   - Global timeout and expect timeout tuned for real-world network latency
 */
export default defineConfig({
  testDir: './tests',
  // Run tests inside a single file in parallel. This speeds up suites significantly.
  fullyParallel: true,
  // Prevent committing `test.only` by failing the build on CI if it's found.
  forbidOnly: !!process.env.CI,
  // Retry on CI only — locally we want failures visible immediately.
  retries: process.env.CI ? 2 : 0,
  // Fewer workers on CI to avoid resource contention; more locally.
  workers: process.env.CI ? 2 : undefined,
  // Multiple reporters: the HTML one is great for humans, the JSON one feeds CI dashboards.
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  // Shared settings for all the projects below.
  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    // Collect trace when retrying the failed test. Traces are a senior-level debugging tool.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Realistic timeouts — avoid the "passes locally, fails on slow CI" classic.
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    // Ignore HTTPS errors for test environments that use self-signed certs.
    ignoreHTTPSErrors: true,
    // Set a locale so assertions on dates/currencies are predictable.
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },
  // Maximum time one test can run for.
  timeout: 60_000,
  // Expect() timeout — for auto-waiting assertions.
  expect: {
    timeout: 10_000,
  },
  // Configure projects for major browsers and devices.
  // Tagging tests with @smoke / @regression lets us filter which projects run them.
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
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],
  // Folder for test artifacts (screenshots, videos, traces).
  outputDir: 'test-results/',
});
