import { authenticatedTest as test, expect } from '../../src/fixtures/auth.fixture';
import { products } from '../../src/data/products';

type InventoryTestArgs = {
  inventoryPage: any;
};

type CartTestArgs = {
  inventoryPage: any;
  cartPage: any;
};

test.describe('Shopping cart operations', () => {
  test('adding a product updates the cart badge @smoke', async ({ inventoryPage }: InventoryTestArgs) => {
    await inventoryPage.header.expectCartCount(0);
    await inventoryPage.addProductToCart(products.backpack.name);
    await inventoryPage.header.expectCartCount(1);
  });

  test('adding multiple products accumulates the count @regression', async ({
    inventoryPage,
  }: InventoryTestArgs) => {
    await inventoryPage.addMultipleProductsToCart([
      products.backpack.name,
      products.bikeLight.name,
      products.boltTShirt.name,
    ]);
    await inventoryPage.header.expectCartCount(3);
  });

  test('removing a product decrements the cart badge @regression', async ({ inventoryPage }) => {
    await inventoryPage.addMultipleProductsToCart([products.backpack.name, products.bikeLight.name]);
    await inventoryPage.header.expectCartCount(2);

    await inventoryPage.removeProductFromCart(products.backpack.name);
    await inventoryPage.header.expectCartCount(1);
  });

  test('the cart page lists every product added with correct metadata @regression', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addMultipleProductsToCart([products.backpack.name, products.fleeceJacket.name]);
    await inventoryPage.header.openCart();

    const items = await cartPage.getAllItems();
    expect(items).toHaveLength(2);

    // Find the backpack in the returned items and assert its full domain shape.
    // This kind of typed assertion is much more expressive than a pile of
    // per-element DOM checks.
    const backpackInCart = items.find((item) => item.name === products.backpack.name);
    expect(backpackInCart).toBeDefined();
    expect(backpackInCart?.price).toBe(products.backpack.price);
    expect(backpackInCart?.quantity).toBe(1);
  });

  test('cart state persists across navigation @regression', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addProductToCart(products.backpack.name);
    await inventoryPage.header.openCart();
    await cartPage.expectCartContains(products.backpack.name);

    await cartPage.continueShopping();
    await inventoryPage.header.expectCartCount(1);
    await inventoryPage.header.openCart();
    await cartPage.expectCartContains(products.backpack.name);
  });
});
