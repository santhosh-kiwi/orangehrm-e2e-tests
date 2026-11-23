import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class TimesheetPage extends BasePage {
  readonly moduleHeader: Locator;
  readonly pageHeading: Locator;
  readonly timesheetPeriodLabel: Locator;
  readonly statusLabel: Locator;
  readonly editButton: Locator;
  readonly actionsPerformedTable: Locator;
  readonly topNav: Locator;

  constructor(page: Page) {
    super(page);
    this.moduleHeader = page.locator('.oxd-topbar-header-breadcrumb-module');
    this.pageHeading = page.getByRole('heading', { name: 'My Timesheet' });
    this.timesheetPeriodLabel = page.getByText('Timesheet Period', { exact: false });
    this.statusLabel = page.getByText(/^Status:/);
    this.editButton = page.getByRole('button', { name: 'Edit' });
    this.actionsPerformedTable = page.getByText('Actions Performed on the Timesheet');
    this.topNav = page.locator('.oxd-topbar-body-nav');
  }

  async openMyTimesheet(): Promise<void> {
    await this.goto('/web/index.php/time/viewMyTimesheet');
  }

  async expectMyTimesheetLoaded(): Promise<void> {
    await expect(this.moduleHeader).toContainText('Time');
    await expect(this.pageHeading).toBeVisible();
    await expect(this.timesheetPeriodLabel).toBeVisible();
  }

  async expectTopNavTabs(): Promise<void> {
    await expect(this.topNav).toContainText('Timesheets');
    await expect(this.topNav).toContainText('Attendance');
    await expect(this.topNav).toContainText('Reports');
    await expect(this.topNav).toContainText('Project Info');
  }

  async openReports(): Promise<void> {
    await this.topNav.getByText('Reports', { exact: false }).click();
    await this.waitForPageLoad();
  }

  async openProjectInfo(): Promise<void> {
    await this.topNav.getByText('Project Info', { exact: false }).click();
    await this.waitForPageLoad();
  }
}
