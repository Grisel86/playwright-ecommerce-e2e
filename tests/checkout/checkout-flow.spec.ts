import { authenticatedTest as test, expect } from '../../src/fixtures/auth.fixture';
import { products, validCustomer, SAUCE_TAX_RATE } from '../../src/data/products';

test.describe('Checkout flow', () => {
  test('happy path: full purchase of a single product @smoke', async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    // Arrange: put one product in the cart.
    await inventoryPage.addProductToCart(products.backpack.name);
    await inventoryPage.header.openCart();
    await cartPage.expectItemCount(1);

    // Act: walk through the checkout flow.
    await cartPage.proceedToCheckout();
    await checkoutPage.fillCustomerInformation(validCustomer);

    // Assert: the summary reflects what we ordered, and the math is correct.
    const summary = await checkoutPage.getOrderSummary();
    expect(summary.itemsTotal).toBe(products.backpack.price);
    // Senior-level touch: verify the relationship (tax = itemsTotal * rate),
    // not a hardcoded magic number. This way, price or tax rate updates don't
    // break the test unless they break the actual business logic.
    const expectedTax = Number((summary.itemsTotal * SAUCE_TAX_RATE).toFixed(2));
    expect(summary.tax).toBeCloseTo(expectedTax, 2);
    expect(summary.total).toBeCloseTo(summary.itemsTotal + summary.tax, 2);

    await checkoutPage.finishOrder();
    await checkoutPage.expectOrderComplete();
  });

  test('happy path: purchase of multiple products aggregates pricing correctly @regression', async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    const cartProducts = [products.backpack, products.fleeceJacket, products.bikeLight];
    await inventoryPage.addMultipleProductsToCart(cartProducts.map((p) => p.name));

    await inventoryPage.header.openCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillCustomerInformation(validCustomer);

    const summary = await checkoutPage.getOrderSummary();
    const expectedSubtotal = cartProducts.reduce((sum, p) => sum + p.price, 0);
    expect(summary.itemsTotal).toBeCloseTo(expectedSubtotal, 2);

    await checkoutPage.finishOrder();
    await checkoutPage.expectOrderComplete();
  });

  // eslint-disable-next-line playwright/expect-expect
  test('blocks submission when first name is missing @regression @negative', async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await inventoryPage.addProductToCart(products.backpack.name);
    await inventoryPage.header.openCart();
    await cartPage.proceedToCheckout();

    await checkoutPage.fillCustomerInformation({ ...validCustomer, firstName: '' });
    await checkoutPage.expectInformationError(/first name is required/i);
  });

  // eslint-disable-next-line playwright/expect-expect
  test('blocks submission when postal code is missing @regression @negative', async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await inventoryPage.addProductToCart(products.backpack.name);
    await inventoryPage.header.openCart();
    await cartPage.proceedToCheckout();

    await checkoutPage.fillCustomerInformation({ ...validCustomer, postalCode: '' });
    await checkoutPage.expectInformationError(/postal code is required/i);
  });
});
