import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface SystemUserFormData {
  userRole: string;
  employeeName: string;
  status: 'Enabled' | 'Disabled';
  username: string;
  password: string;
}

export class AdminUsersPage extends BasePage {
  readonly addButton: Locator;
  readonly usernameSearchInput: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly recordsFoundText: Locator;

  // Add/Edit User form locators
  readonly userRoleDropdown: Locator;
  readonly employeeNameInput: Locator;
  readonly statusDropdown: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly requiredFieldErrors: Locator;

  constructor(page: Page) {
    super(page);
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.usernameSearchInput = page.locator('.oxd-table-filter-area').getByPlaceholder('Username');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.table = page.locator('.oxd-table');
    this.tableRows = page.locator('.oxd-table-card');
    this.recordsFoundText = page.locator('.orangehrm-horizontal-padding.orangehrm-top-buttons + .oxd-table span, .oxd-table-header .orangehrm-vertical-padding');

    this.userRoleDropdown = page.locator('.oxd-form-row').filter({ hasText: 'User Role' }).locator('.oxd-select-text');
    this.employeeNameInput = page.getByPlaceholder('Type for hints...');
    this.statusDropdown = page.locator('.oxd-form-row').filter({ hasText: 'Status' }).locator('.oxd-select-text');
    this.usernameInput = page.locator('.oxd-form-row').filter({ hasText: 'Username' }).getByRole('textbox');
    this.passwordInput = page.locator('input[type="password"]').first();
    this.confirmPasswordInput = page.locator('input[type="password"]').last();
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.requiredFieldErrors = page.locator('.oxd-input-group__message, .oxd-text--span');
  }

  async open(): Promise<void> {
    await this.goto('/web/index.php/admin/viewSystemUsers');
    await expect(this.addButton).toBeVisible();
  }

  private async selectDropdownOption(dropdown: Locator, optionText: string): Promise<void> {
    await dropdown.click();
    const option = this.page.locator('.oxd-select-option').filter({ hasText: optionText }).first();
    await option.click();
  }

  async fillUserForm(data: SystemUserFormData): Promise<void> {
    await this.selectDropdownOption(this.userRoleDropdown, data.userRole);

    await this.employeeNameInput.fill(data.employeeName);
    const suggestion = this.page.locator('.oxd-autocomplete-option').first();
    await expect(suggestion).toBeVisible({ timeout: 10_000 });
    await suggestion.click();

    await this.selectDropdownOption(this.statusDropdown, data.status);

    await this.usernameInput.fill(data.username);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.password);
  }

  async addUser(data: SystemUserFormData): Promise<void> {
    await this.addButton.click();
    await expect(this.page.getByText('Add User')).toBeVisible();
    await this.fillUserForm(data);
    await this.saveButton.click();
  }

  async searchByUsername(username: string): Promise<void> {
    await this.usernameSearchInput.fill(username);
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  async resetSearch(): Promise<void> {
    await this.resetButton.click();
  }

  rowForUsername(username: string): Locator {
    return this.tableRows.filter({ hasText: username });
  }

  async expectNoRecordsFound(): Promise<void> {
    await expect(this.page.getByText('No Records Found')).toBeVisible();
  }

  async openEditFor(username: string): Promise<void> {
    const row = this.rowForUsername(username);
    await row.locator('.oxd-icon-button, .bi-pencil-fill, [class*="pencil"]').first().click();
    await expect(this.page.getByText('Edit User')).toBeVisible();
  }

  async editStatus(status: 'Enabled' | 'Disabled'): Promise<void> {
    await this.selectDropdownOption(this.statusDropdown, status);
    await this.saveButton.click();
  }

  async deleteUser(username: string): Promise<void> {
    const row = this.rowForUsername(username);
    await row.locator('.oxd-icon-button, [class*="trash"]').first().click();
    const confirmButton = this.page.getByRole('button', { name: 'Yes, Delete' });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
  }
}
