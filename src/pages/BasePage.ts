import { Page, Locator, expect } from '@playwright/test';


export abstract class BasePage {
  protected abstract readonly url: string;

  constructor(protected readonly page: Page) {}

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
  protected async waitForPageLoad(): Promise<void> {
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
