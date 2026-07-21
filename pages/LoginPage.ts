import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage encapsulates locators and actions for the Automation Anywhere Community Edition login screen.
 */
export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  /**
   * Initializes the LoginPage locators.
   * @param page Playwright Page object.
   */
  constructor(page: Page) {
    super(page);

    this.emailInput = page.locator('input[name="username"]');

    this.passwordInput = page.locator('input[name="password"]');

    // TODO: verify selector for the login button
    this.loginButton = page.getByRole('button', { name: /log in|login|sign in/i });

    // TODO: verify selector for the error message
    this.errorMessage = page.getByRole('alert');
  }

  /**
   * Navigates to the login page and performs the login action using the provided credentials.
   * @param email The user's email address or username.
   * @param password The user's password.
   */
  async login(email: string, password: string): Promise<void> {
    // TODO: verify the exact path or relative URL for the login page
    await this.page.goto('/');

    await this.fillField(this.emailInput, email);
    await this.fillField(this.passwordInput, password);
    await this.clickAndWait(this.loginButton);
  }

  /**
   * Asserts that the login was successful by verifying a redirect to the dashboard or control room home.
   */
  async assertLoginSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/.*#\/(home|index)|.*dashboard|.*control-room/i, {
      timeout: 20000
    });
  }

  /**
   * Asserts that an error message is displayed on the login page.
   * @param expectedMessage The expected text of the error message.
   */
  async assertLoginError(expectedMessage: string): Promise<void> {
    await expect(this.errorMessage).toContainText(expectedMessage);
    await expect(this.errorMessage).toBeVisible();
  }
}
