import { authenticatedTest as test, expect } from '../../src/fixtures/auth.fixture';
import { products } from '../../src/data/products';

/**
 * Inventory and product sorting tests.
 *
 * These tests use the `authenticatedTest` fixture, so we start each test
 * already logged in. That keeps each test focused on one behavior — the
 * single responsibility principle applied to tests.
 */
test.describe('Inventory listing and sorting', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.expectInventoryVisible();
  });

  test('displays the expected number of products @smoke', async ({ inventoryPage }) => {
    const count = await inventoryPage.getProductCount();
    // SauceDemo ships with exactly six products. If that ever changes, this
    // assertion catches it — either as a real bug or as a signal that the
    // catalog updated and our tests should be updated too.
    expect(count).toBe(6);
  });

  test('sorts products by price ascending @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortProductsBy('lohi');
    const prices = await inventoryPage.getDisplayedPrices();
    // We assert the array is sorted rather than checking exact values.
    // This style of assertion is more robust to catalog updates.
    const sortedPrices = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sortedPrices);
  });

  test('sorts products by price descending @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortProductsBy('hilo');
    const prices = await inventoryPage.getDisplayedPrices();
    const sortedPrices = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sortedPrices);
  });

  test('reflects known product prices @regression', async ({ inventoryPage }) => {
    // A concrete price check for the flagship product.
    const backpackPrice = await inventoryPage.getProductPrice(products.backpack.name);
    expect(backpackPrice).toBe(products.backpack.price);
  });
});
