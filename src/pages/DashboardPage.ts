import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';

export class DashboardPage extends BasePage {
  readonly sidebar: Sidebar;
  readonly topbar: Topbar;
  readonly pageHeaderTitle: Locator;
  readonly widgets: Locator;

  constructor(page: Page) {
    super(page);
    this.sidebar = new Sidebar(page);
    this.topbar = new Topbar(page);
    this.pageHeaderTitle = page.locator('.oxd-topbar-header-breadcrumb-module');
    this.widgets = page.locator('.oxd-grid-item');
  }

  async open(): Promise<void> {
    await this.goto('/web/index.php/dashboard/index');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard/);
    await expect(this.pageHeaderTitle).toContainText('Dashboard');
  }
}
