import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

/**
 * Custom test fixture that injects every Page Object into the test context.
 *
 * This pattern is one of the clearest markers of senior-level Playwright usage.
 * Instead of writing `const loginPage = new LoginPage(page)` at the top of
 * every test file, we declare the POMs as fixtures. Playwright instantiates them
 * lazily (only if the test actually uses them) and disposes of them automatically.
 *
 * Tests can then do:
 *
 *     test('login works', async ({ loginPage, inventoryPage }) => {
 *       await loginPage.goto();
 *       await loginPage.loginAs('standard_user', 'secret_sauce');
 *       await inventoryPage.expectInventoryVisible();
 *     });
 *
 * The `page` fixture is still available if a test needs raw access — we don't
 * hide it, we just make the POM-based interface more ergonomic.
 */
type PageObjects = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<PageObjects>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});

// Re-export expect so tests can import both `test` and `expect` from one place.
export { expect } from '@playwright/test';
