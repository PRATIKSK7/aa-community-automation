import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage provides common UI interaction methods and wrapped Playwright actions.
 * All other page objects should extend this class.
 */
export class BasePage {
  readonly page: Page;

  /**
   * Initializes the BasePage with a Playwright Page instance.
   * @param page Playwright Page object.
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Waits for a locator to become visible on the page.
   * @param locator The Playwright Locator to wait for.
   */
  async waitForVisible(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
  }

  /**
   * Clicks on the specified locator and optionally waits for navigation or an event.
   * @param locator The Playwright Locator to click.
   */
  async clickAndWait(locator: Locator): Promise<void> {
    await locator.click();
    // In Playwright, waiting for network idle or domcontentloaded is occasionally needed
    // depending on the app's behavior, but click() usually auto-waits for actionability.
    // We add a generic wait here as per the common POM pattern, or expect the user to await specific state.
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Fills an input field with the provided value after ensuring it is visible.
   * @param locator The Playwright Locator for the input field.
   * @param value The text value to fill into the field.
   */
  async fillField(locator: Locator, value: string): Promise<void> {
    await this.waitForVisible(locator);
    await locator.fill(value);
  }

  /**
   * Verifies that a toast notification with the expected message appears.
   * @param message The expected text in the toast notification.
   */
  async verifyToast(message: string): Promise<void> {
    // TODO: verify selector for toast notification. This assumes a generic role="alert" or generic class.
    const toastLocator = this.page.getByRole('alert').filter({ hasText: message });
    await expect(toastLocator).toBeVisible();
  }
}
