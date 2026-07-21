import { test as baseTest, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

// Define the type for our custom fixture
type AuthFixtures = {
  loggedInPage: Page;
};

/**
 * Custom Playwright test fixture that automatically logs into the application.
 * Tests using `loggedInPage` will receive a browser page that is already authenticated.
 */
export const test = baseTest.extend<AuthFixtures>({
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    const username = process.env.AA_USERNAME;
    const password = process.env.AA_PASSWORD;

    if (!username || !password) {
      throw new Error('Missing AA_USERNAME or AA_PASSWORD in environment variables');
    }

    // Perform the login
    await loginPage.login(username, password);

    // Ensure login is successful before passing the page to the test
    await loginPage.assertLoginSuccess();

    // Yield the authenticated page to the test
    await use(page);

    // Any teardown or cleanup could go here after `use()`
  }
});

export { expect } from '@playwright/test';
