import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the Automation dashboard and left-hand navigation.
 */
export class AutomationDashboardPage extends BasePage {
  readonly automationNavMenu: Locator;
  readonly createDropdown: Locator;
  readonly createFormOption: Locator;

  constructor(page: Page) {
    super(page);

    // TODO: verify selector for the Automation link in the left nav
    this.automationNavMenu = page.getByRole('link', { name: /automation/i });

    // TODO: verify selector for the Create button/dropdown
    this.createDropdown = page.getByRole('button', { name: /create/i });

    // TODO: verify selector for the Form option inside the Create menu
    this.createFormOption = page.getByRole('menuitem', { name: /form/i });
  }

  /**
   * Navigates to the Automation section from the left-hand menu.
   */
  async navigateToAutomation(): Promise<void> {
    await this.clickAndWait(this.automationNavMenu);
  }

  /**
   * Opens the Create dropdown and selects the Form option.
   */
  async openCreateForm(): Promise<void> {
    await this.clickAndWait(this.createDropdown);
    await this.clickAndWait(this.createFormOption);
  }
}
