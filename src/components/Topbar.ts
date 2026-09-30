import { Page, Locator, expect } from '@playwright/test';

export class Topbar {
  private readonly page: Page;
  readonly userDropdown: Locator;
  readonly logoutLink: Locator;
  readonly aboutLink: Locator;
  readonly changePasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userDropdown = page.locator('.oxd-userdropdown-tab');
    this.logoutLink = page.getByRole('menuitem', { name: 'Logout' });
    this.aboutLink = page.getByRole('menuitem', { name: 'About' });
    this.changePasswordLink = page.getByRole('menuitem', { name: 'Change Password' });
  }

  async logout(): Promise<void> {
    await this.userDropdown.click();
    await this.logoutLink.click();
  }

  async expectLoggedInAs(fullName?: string): Promise<void> {
    await expect(this.userDropdown).toBeVisible();
    if (fullName) {
      await expect(this.userDropdown).toContainText(fullName);
    }
  }
}
