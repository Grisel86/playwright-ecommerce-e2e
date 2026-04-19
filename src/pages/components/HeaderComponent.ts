import { Page, Locator, expect } from '@playwright/test';

/**
 * HeaderComponent represents the shared navigation header that appears on every
 * authenticated page (inventory, cart, checkout, etc.).
 *
 * Component Object Pattern is a senior-level evolution of POM. Instead of
 * copy-pasting the header's locators and actions into every page class, we
 * extract them into a dedicated Component. Each page that contains the header
 * exposes it as a public property, so tests can do:
 *
 *     await inventoryPage.header.openCart();
 *
 * This keeps page classes small and mirrors how real frontend teams build UIs —
 * shared components are shared in tests too.
 */
export class HeaderComponent {
  private readonly cartBadge: Locator;
  private readonly cartLink: Locator;
  private readonly burgerMenuButton: Locator;
  private readonly logoutLink: Locator;
  private readonly appLogo: Locator;

  constructor(private readonly page: Page) {
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.appLogo = page.locator('.app_logo');
  }

  /**
   * Return the number of items currently in the cart, or 0 if the badge is absent.
   * A common bug in naive implementations is throwing when the badge doesn't exist;
   * treating "no badge" as "zero items" matches the user's mental model.
   */
  async getCartItemCount(): Promise<number> {
    const isVisible = await this.cartBadge.isVisible();
    if (!isVisible) {
      return 0;
    }
    const text = await this.cartBadge.textContent();
    return text ? parseInt(text, 10) : 0;
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.burgerMenuButton.click();
    // Wait for the menu animation to finish — senior POMs handle timing explicitly
    // rather than relying on implicit waits.
    await this.logoutLink.waitFor({ state: 'visible' });
    await this.logoutLink.click();
  }

  async expectLogoVisible(): Promise<void> {
    await expect(this.appLogo).toBeVisible();
  }

  async expectCartCount(expected: number): Promise<void> {
    if (expected === 0) {
      await expect(this.cartBadge).not.toBeVisible();
    } else {
      await expect(this.cartBadge).toHaveText(String(expected));
    }
  }
}
