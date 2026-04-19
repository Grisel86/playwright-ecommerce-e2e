import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * CheckoutPage handles the three-step checkout flow: information, overview, complete.
 *
 * This is one of those pages where senior QA engineers earn their money. The checkout
 * is split across multiple URLs (/checkout-step-one.html, /checkout-step-two.html,
 * /checkout-complete.html), so we model each step with its own methods and let the
 * POM own the state transitions. Tests just call `fillCustomerInformation` and
 * `completePurchase` — they don't need to know about the URLs at all.
 */
export interface CustomerInformation {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export interface OrderSummary {
  itemsTotal: number;
  tax: number;
  total: number;
}

export class CheckoutPage extends BasePage {
  protected readonly url = '/checkout-step-one.html';

  // Step 1: customer information form
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;
  private readonly errorMessage: Locator;

  // Step 2: order review
  private readonly finishButton: Locator;
  private readonly itemsTotalLabel: Locator;
  private readonly taxLabel: Locator;
  private readonly totalLabel: Locator;

  // Step 3: completion
  private readonly completeHeader: Locator;
  private readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.errorMessage = page.locator('[data-test="error"]');

    this.finishButton = page.locator('[data-test="finish"]');
    this.itemsTotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.totalLabel = page.locator('.summary_total_label');

    this.completeHeader = page.locator('.complete-header');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  async fillCustomerInformation(info: CustomerInformation): Promise<void> {
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.postalCodeInput.fill(info.postalCode);
    await this.continueButton.click();
  }

  async expectInformationError(message: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  /**
   * Parse the order summary from the step-2 review screen.
   * Returning structured data lets tests make richer assertions — for example,
   * verifying that tax is 8% of the subtotal regardless of specific amounts.
   */
  async getOrderSummary(): Promise<OrderSummary> {
    const itemsText = (await this.itemsTotalLabel.textContent()) ?? '';
    const taxText = (await this.taxLabel.textContent()) ?? '';
    const totalText = (await this.totalLabel.textContent()) ?? '';

    return {
      itemsTotal: this.extractAmount(itemsText),
      tax: this.extractAmount(taxText),
      total: this.extractAmount(totalText),
    };
  }

  private extractAmount(text: string): number {
    // Text looks like "Item total: $29.99" — grab the number after the dollar sign.
    const match = text.match(/\$(\d+\.\d{2})/);
    if (!match) {
      throw new Error(`Could not extract amount from label: "${text}"`);
    }
    return parseFloat(match[1]);
  }

  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }

  async expectOrderComplete(): Promise<void> {
    await expect(this.completeHeader).toBeVisible();
    await expect(this.completeHeader).toContainText(/thank you/i);
  }

  async backToProducts(): Promise<void> {
    await this.backHomeButton.click();
  }
}
