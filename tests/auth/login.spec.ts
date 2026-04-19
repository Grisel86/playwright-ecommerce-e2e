import { test, expect } from '../../src/fixtures/pages.fixture';
import { users } from '../../src/data/users';

/**
 * Authentication tests.
 *
 * The tag system (@smoke, @regression, @negative) lets the CI pipeline run
 * a fast subset of tests on every commit and the full suite nightly.
 * Running `npx playwright test --grep @smoke` will filter by tag.
 */
test.describe('Authentication', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectLoginFormVisible();
  });

  test('a valid user can log in and reach the inventory @smoke', async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.loginAs(users.standard.username, users.standard.password);
    await inventoryPage.expectInventoryVisible();
    await inventoryPage.assertUrlContains('inventory.html');
  });

  test('a locked-out user sees a blocking error message @regression @negative', async ({
    loginPage,
  }) => {
    await loginPage.attemptLoginExpectingError(users.lockedOut.username, users.lockedOut.password);
    await loginPage.expectErrorMessage(/locked out/i);
  });

  test('empty credentials surface a field-level error @regression @negative', async ({
    loginPage,
  }) => {
    await loginPage.attemptLoginExpectingError('', '');
    await loginPage.expectErrorMessage(/username is required/i);
  });

  test('missing password surfaces a specific error @regression @negative', async ({
    loginPage,
  }) => {
    await loginPage.attemptLoginExpectingError(users.standard.username, '');
    await loginPage.expectErrorMessage(/password is required/i);
  });

  test('an incorrect password is rejected @regression @negative', async ({ loginPage }) => {
    await loginPage.attemptLoginExpectingError(users.standard.username, 'wrong-password');
    await loginPage.expectErrorMessage(/username and password do not match/i);
  });

  /**
   * Data-driven testing: one scenario, many inputs. Parameterized tests are
   * a senior-level pattern — they document the boundary cases clearly and
   * keep the suite DRY.
   */
  const invalidCredentialsMatrix = [
    { username: 'unknown_user', password: 'secret_sauce', label: 'unknown username' },
    { username: 'STANDARD_USER', password: 'secret_sauce', label: 'username is case-sensitive' },
    { username: 'standard_user', password: 'SECRET_SAUCE', label: 'password is case-sensitive' },
    { username: ' standard_user ', password: 'secret_sauce', label: 'whitespace is not trimmed' },
  ];

  for (const { username, password, label } of invalidCredentialsMatrix) {
    test(`rejects invalid credentials — ${label} @regression @negative`, async ({ loginPage }) => {
      await loginPage.attemptLoginExpectingError(username, password);
      await expect(loginPage['errorMessage' as keyof typeof loginPage]).toBeDefined();
    });
  }
});
