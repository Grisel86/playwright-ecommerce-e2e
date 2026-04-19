import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage is the abstract parent of every Page Object in the suite.
 *
 * The reason this class exists — and why senior-level frameworks always have one —
 * is that every page shares a handful of concerns: navigation, waiting for load,
 * taking context-aware screenshots, and exposing the underlying `page` for
 * advanced scenarios. Putting these in a base class keeps individual POMs small
 * and focused on what makes them unique (their locators and domain actions).
 *
 * Each subclass should:
 *   1. Receive the Playwright `page` via its constructor and pass it up with `super(page)`.
 *   2. Declare its own locators as `readonly` properties in the constructor.
 *   3. Expose domain-level methods (e.g. `login`, `addProductToCart`) rather than
 *      low-level click/type methods — tests should read like business scenarios,
 *      not DOM interactions.
 */
export abstract class BasePage {
  protected readonly page: Page;

  // The URL path (relative to baseURL) that this page lives at.
  // Subclasses override this so `goto()` knows where to navigate.
  protected abstract readonly url: string;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to this page. Uses the baseURL from playwright.config.ts so the
   * same POM works against dev, staging, and prod without code changes.
   */
  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for the page to be fully loaded.
   * `domcontentloaded` is often enough and avoids the long tail of network requests
   * (analytics, tracking pixels) that never settle. Override in subclasses if the
   * page needs a more specific readiness signal.
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Take a screenshot tagged with the current page name.
   * Useful for visual debugging and for adding evidence to test reports.
   */
  async takeScreenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({
      path: `test-results/screenshots/${this.constructor.name}-${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /**
   * Assert the current URL matches an expected fragment.
   * Wrapping this in the base class means every page can verify "am I really here?"
   * without repeating the pattern in every test.
   */
  async assertUrlContains(fragment: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(fragment));
  }

  /**
   * Expose the underlying page for advanced scenarios (network interception,
   * evaluating JS in the browser, etc.). We deliberately keep this protected
   * so tests access it only through the POM — preserving encapsulation.
   */
  protected getPage(): Page {
    return this.page;
  }

  /**
   * Helper: wait for an element and return the locator.
   * Used by subclasses when they need to defer the locator creation.
   */
  protected async getVisibleLocator(selector: string): Promise<Locator> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: 'visible' });
    return locator;
  }
}
