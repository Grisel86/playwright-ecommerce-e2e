import { test as base } from './pages.fixture';
import { users } from '../data/users';

/**
 * `authenticatedTest` is a variant of the base test that automatically
 * logs in a standard user before each test runs.
 *
 * Why not use storageState? SauceDemo stores the logged-in flag in
 * sessionStorage, which Playwright's built-in storageState captures but the
 * app doesn't always honor on reload. So we do an explicit programmatic login
 * in a beforeEach-style fixture. For real apps with cookie-based auth,
 * you'd use a global setup file + storageState instead — and the README
 * walks through exactly that pattern.
 */
export const authenticatedTest = base.extend({
  page: async ({ page, loginPage }, use) => {
    await loginPage.goto();
    await loginPage.loginAs(users.standard.username, users.standard.password);
    // Hand the page off to the test. After the test finishes, Playwright
    // tears everything down automatically — no manual cleanup needed.
    await use(page);
  },
});

export { expect } from '@playwright/test';
