import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderComponent } from './components/HeaderComponent';

/**
 * InventoryPage lists the catalog of products available for purchase.
 *
 * This page illustrates a very common real-world challenge: interacting with
 * a list of repeated elements where each item has its own name, price, and
 * "Add to cart" button. The senior-level answer is to write locator-returning
 * helpers that compose Playwright's locator API (filter, nth, getByRole)
 * rather than writing XPath strings like `//div[contains(text(), 'Backpack')]/..`.
 */
export class InventoryPage extends BasePage {
  protected readonly url = '/inventory.html';

  // Composed: the header component is a property of the page.
  readonly header: HeaderComponent;

  private readonly inventoryContainer: Locator;
  private readonly inventoryItems: Locator;
  private readonly sortDropdown: Locator;
  private readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.inventoryContainer = page.locator('.inventory_container');
    this.inventoryItems = page.locator('.inventory_item');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.pageTitle = page.locator('.title');
  }

  /**
   * Add a specific product to the cart by its visible name.
   * We use `.filter({ hasText: productName })` — a composable Playwright pattern
   * that's more readable than building up complex CSS/XPath selectors manually.
   */
  async addProductToCart(productName: string): Promise<void> {
    const productCard = this.inventoryItems.filter({ hasText: productName });
    await productCard.getByRole('button', { name: /add to cart/i }).click();
  }

  /**
   * Add several products in one call. Useful for setup steps in checkout tests.
   * Note we `await` inside a for...of loop rather than Promise.all — clicks on
   * the same page must be serialized to avoid race conditions.
   */
  async addMultipleProductsToCart(productNames: string[]): Promise<void> {
    for (const name of productNames) {
      await this.addProductToCart(name);
    }
  }

  async removeProductFromCart(productName: string): Promise<void> {
    const productCard = this.inventoryItems.filter({ hasText: productName });
    await productCard.getByRole('button', { name: /remove/i }).click();
  }

  async getProductPrice(productName: string): Promise<number> {
    const productCard = this.inventoryItems.filter({ hasText: productName });
    const priceText = await productCard.locator('.inventory_item_price').textContent();
    if (!priceText) {
      throw new Error(`Could not read price for product "${productName}"`);
    }
    // The UI shows "$29.99" — we strip the dollar sign and parse to a number.
    return parseFloat(priceText.replace('$', ''));
  }

  async getProductCount(): Promise<number> {
    return this.inventoryItems.count();
  }

  /**
   * Sort options: "az", "za", "lohi", "hilo".
   * Accepting a typed union gives us compile-time safety — callers can't pass
   * an invalid value and discover the bug at runtime.
   */
  async sortProductsBy(option: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.sortDropdown.selectOption(option);
    // Give the sort a moment to re-render. This is safer than relying on
    // the implicit wait of the next action.
    await this.page.waitForTimeout(300);
  }

  async getDisplayedPrices(): Promise<number[]> {
    const priceTexts = await this.inventoryItems.locator('.inventory_item_price').allTextContents();
    return priceTexts.map((text) => parseFloat(text.replace('$', '')));
  }

  async expectInventoryVisible(): Promise<void> {
    await expect(this.inventoryContainer).toBeVisible();
    await expect(this.pageTitle).toHaveText('Products');
  }
}
