import { test as base } from './pages.fixture';
import { users } from '../data/users';

type AuthFixtures = {
  authenticated: void;
};

export const authenticatedTest = base.extend<AuthFixtures>({
  authenticated: async ({ loginPage }, use) => {
    await loginPage.goto();
    await loginPage.loginAs(
      users.standard.username,
      users.standard.password
    );
    await use();
  },
});

export { expect } from '@playwright/test';
