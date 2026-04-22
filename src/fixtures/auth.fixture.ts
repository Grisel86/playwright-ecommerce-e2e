import { test as base } from './pages.fixture';
import { users } from '../data/users';

type AuthFixtures = {
  authenticated: void;
};

export const authenticatedTest = base.extend<AuthFixtures>({
  authenticated: [
    async ({ loginPage, inventoryPage }, use) => {
      await loginPage.goto();
      await loginPage.loginAs(users.standard.username, users.standard.password);
      // Wait for the inventory page to be fully ready before handing
      // control to the test — prevents the timeout on addProductToCart.
      await inventoryPage.expectInventoryVisible();
      await use();
    },
    { auto: true }, // fix #1: runs for every test without explicit destructuring
  ],
});

export { expect } from '@playwright/test';