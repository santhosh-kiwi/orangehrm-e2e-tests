import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface SystemUserFormData {
  userRole: string;
  /** A search query for the Employee Name autocomplete, not an exact name
   * to match — see fillUserForm for why. A single common letter (e.g. "a")
   * works well since it matches virtually any employee. */
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
    // The search filter's Username field has a label, not a placeholder;
    // scope by label the same way the other fields on this page do.
    this.usernameSearchInput = page.locator('.oxd-input-group').filter({ hasText: 'Username' }).locator('input');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.table = page.locator('.oxd-table');
    this.tableRows = page.locator('.oxd-table-card');
    this.recordsFoundText = page.locator('.orangehrm-horizontal-padding.orangehrm-top-buttons + .oxd-table span, .oxd-table-header .orangehrm-vertical-padding');

    // Note: User Role, Employee Name, Status and Username all live inside a
    // *single shared* .oxd-form-row on this form, so scoping by
    // .oxd-form-row is too broad (it matches multiple selects/inputs at
    // once). Each field does have its own .oxd-input-group though, so scope
    // to that instead.
    this.userRoleDropdown = page.locator('.oxd-input-group').filter({ hasText: 'User Role' }).locator('.oxd-select-text');
    this.employeeNameInput = page.getByPlaceholder('Type for hints...');
    this.statusDropdown = page.locator('.oxd-input-group').filter({ hasText: 'Status' }).locator('.oxd-select-text');
    this.usernameInput = page.locator('.oxd-input-group').filter({ hasText: 'Username' }).getByRole('textbox');
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

    // The employee autocomplete is a Vue-driven debounced lookup keyed off
    // real keystrokes: a single .fill() call sets the value in one shot and
    // doesn't reliably trigger the search, leaving the field marked
    // "Invalid" even though it visually shows the right text. Typing it out
    // and waiting for a suggestion (retrying once) is reliable.
    //
    // `data.employeeName` is treated as a search query, not an exact name to
    // match: this suite runs against a shared public demo where anyone in
    // the world can be logged in as the same well-known "Admin" account at
    // the same time, so any specific employee's name (including the one
    // linked to this very login) is volatile shared state that can change
    // between one moment and the next. Whichever employee comes back first
    // for a broad, near-universally-matching query is picked, rather than
    // requiring a specific name to still exist.
    // While the lookup is in flight the dropdown shows a single "Searching...."
    // placeholder row, also an .oxd-autocomplete-option. Clicking it selects
    // nothing, so wait for a real result row instead.
    const suggestion = this.page
      .locator('.oxd-autocomplete-option')
      .filter({ hasNotText: /Searching|No Records Found/ })
      .first();
    const invalidMessage = this.employeeNameInput.locator('xpath=following-sibling::span[contains(@class,"input-group__message")]');

    let selected = false;
    for (let attempt = 0; attempt < 3 && !selected; attempt++) {
      await this.employeeNameInput.click();
      await this.employeeNameInput.fill('');
      await this.employeeNameInput.pressSequentially(data.employeeName, { delay: 200 + attempt * 100 });
      try {
        await expect(suggestion).toBeVisible({ timeout: 10_000 });
        await suggestion.click();
        // A real selection replaces the raw typed query with a full name and
        // clears the "Invalid" state; a missed click leaves the query as-is.
        await expect(this.employeeNameInput).not.toHaveValue(data.employeeName);
        await expect(invalidMessage).toBeHidden({ timeout: 2_000 }).catch(() => Promise.resolve());
        selected = true;
      } catch {
        // fall through to retry
      }
    }
    if (!selected) {
      throw new Error(`Employee Name autocomplete never resolved to a real selection for query "${data.employeeName}"`);
    }

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
    // A "No Records Found" toast can transiently appear alongside the
    // table's own empty-state text; scope to the table span specifically
    // to avoid a strict-mode violation matching both.
    await expect(this.page.locator('span.oxd-text--span').getByText('No Records Found')).toBeVisible();
  }

  async openEditFor(username: string): Promise<void> {
    // The trash (delete) icon precedes the pencil (edit) icon in DOM order
    // for this table, so this must target .bi-pencil-fill specifically —
    // a plain "first icon button" match opens the delete confirmation instead.
    const row = this.rowForUsername(username);
    await row.locator('.bi-pencil-fill').click();
    await expect(this.page.getByText('Edit User')).toBeVisible();
  }

  async editStatus(status: 'Enabled' | 'Disabled'): Promise<void> {
    await this.selectDropdownOption(this.statusDropdown, status);
    await this.saveButton.click();
  }

  async deleteUser(username: string): Promise<void> {
    const row = this.rowForUsername(username);
    await row.locator('.bi-trash').click();
    const confirmButton = this.page.getByRole('button', { name: 'Yes, Delete' });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
  }

  /** After saving a new user the app redirects back to the user list; wait for it. */
  async waitForUserList(): Promise<void> {
    await this.page.waitForURL(/viewSystemUsers/);
    await expect(this.addButton).toBeVisible();
  }

  /**
   * Cleanup helper: deletes the user if it still exists. Safe to call when a
   * test already deleted it, or when creating it failed halfway.
   */
  async deleteUserIfExists(username: string): Promise<void> {
    await this.open();
    await this.searchByUsername(username);
    // A one-off count() is intended here: this is a branch, not an assertion.
    if ((await this.rowForUsername(username).count()) > 0) {
      await this.deleteUser(username);
      await this.expectToastMessage('Successfully Deleted');
    }
  }
}
