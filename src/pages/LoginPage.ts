import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage represents the SauceDemo login screen.
 *
 * A senior-level POM follows a few important rules:
 *   - Locators are declared once, as class members, not inlined inside methods.
 *     This makes them easy to update when the UI changes.
 *   - Methods expose business intent (`loginAs`, `expectLockedOutError`), not
 *     mechanical steps (`typeUsername`, `clickLoginButton`). Tests should read
 *     like the requirements they verify.
 *   - Assertions live inside dedicated `expect*` methods so that tests stay
 *     focused on the scenario, while the POM owns the "what does 'logged in'
 *     mean on this page" knowledge.
 */
export class LoginPage extends BasePage {
  protected readonly url = '/';

  // Prefer data-test attributes when the app provides them — they're stable
  // across UI redesigns. If the app doesn't have them, negotiating their
  // introduction with the dev team is itself a senior QA skill.
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  /**
   * Perform a login. Returns void — if callers want to navigate afterwards,
   * they use the page object returned by the fixture. Keeping POM methods
   * free of cross-page return values keeps the graph of dependencies clean.
   */
  async loginAs(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * A deliberately separate method for the "invalid credentials" scenario.
   * Some teams overload `loginAs` with a boolean flag — that's a code smell
   * known as a "flag argument". Separate methods document intent better.
   */
  async attemptLoginExpectingError(username: string, password: string): Promise<void> {
    await this.loginAs(username, password);
    await expect(this.errorMessage).toBeVisible();
  }

  async expectErrorMessage(expectedText: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedText);
  }

  async expectLoginFormVisible(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }
}
