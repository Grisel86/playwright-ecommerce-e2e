import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderComponent } from './components/HeaderComponent';

/**
 * CartPage represents the shopping cart view.
 *
 * A subtle senior-level detail here: methods that query the cart return typed
 * domain objects (CartItem), not raw strings. This makes tests more expressive
 * and catches bugs at compile time when fields change.
 */
export interface CartItem {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export class CartPage extends BasePage {
  protected readonly url = '/cart.html';

  readonly header: HeaderComponent;

  private readonly cartItems: Locator;
  private readonly checkoutButton: Locator;
  private readonly continueShoppingButton: Locator;
  private readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.pageTitle = page.locator('.title');
  }

  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  /**
   * Return every item in the cart as a typed list. This is the kind of method
   * senior automation engineers build to enable richer assertions in tests:
   * instead of asserting on individual DOM elements, you assert on the domain
   * model of what the cart contains.
   */
  async getAllItems(): Promise<CartItem[]> {
    const count = await this.cartItems.count();
    const items: CartItem[] = [];

    for (let i = 0; i < count; i++) {
      const itemLocator = this.cartItems.nth(i);
      const name = (await itemLocator.locator('.inventory_item_name').textContent()) ?? '';
      const description = (await itemLocator.locator('.inventory_item_desc').textContent()) ?? '';
      const priceText = (await itemLocator.locator('.inventory_item_price').textContent()) ?? '0';
      const quantityText = (await itemLocator.locator('.cart_quantity').textContent()) ?? '0';

      items.push({
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(priceText.replace('$', '')),
        quantity: parseInt(quantityText, 10),
      });
    }

    return items;
  }

  async removeItem(productName: string): Promise<void> {
    const item = this.cartItems.filter({ hasText: productName });
    await item.getByRole('button', { name: /remove/i }).click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async expectCartContains(productName: string): Promise<void> {
    await expect(this.cartItems.filter({ hasText: productName })).toBeVisible();
  }

  async expectCartDoesNotContain(productName: string): Promise<void> {
    await expect(this.cartItems.filter({ hasText: productName })).toHaveCount(0);
  }

  async expectCartIsEmpty(): Promise<void> {
    await expect(this.cartItems).toHaveCount(0);
  }

  async expectItemCount(expected: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(expected);
  }
}
