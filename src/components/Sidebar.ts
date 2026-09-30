import { Page, Locator, expect } from '@playwright/test';

export type ModuleName =
  | 'Admin'
  | 'PIM'
  | 'Leave'
  | 'Time'
  | 'Recruitment'
  | 'My Info'
  | 'Performance'
  | 'Dashboard'
  | 'Directory'
  | 'Maintenance'
  | 'Claim'
  | 'Buzz';

export class Sidebar {
  private readonly page: Page;
  readonly menu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.menu = page.locator('.oxd-sidepanel, .oxd-main-menu');
  }

  private menuItem(name: ModuleName): Locator {
    return this.page.locator('.oxd-main-menu-item').filter({ hasText: name }).first();
  }

  async navigateTo(name: ModuleName): Promise<void> {
    await this.menuItem(name).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectVisible(name: ModuleName): Promise<void> {
    await expect(this.menuItem(name)).toBeVisible();
  }

  async search(term: string): Promise<void> {
    const searchInput = this.page.getByPlaceholder('Search');
    await searchInput.fill(term);
  }
}
