import { test, expect } from '@playwright/test';
import { AdminUsersPage } from '../../src/pages/AdminUsersPage';
import { loginAsAdmin } from '../../src/utils/auth';
import { generateUsername, generatePassword } from '../../src/utils/testData';

test.describe('Admin - User Management', () => {
  test.describe.configure({ mode: 'serial' });

  const username = generateUsername('e2e_admin');
  const password = generatePassword();
  let adminUsersPage: AdminUsersPage;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    adminUsersPage = new AdminUsersPage(page);
    await adminUsersPage.open();
  });

  test('adding a new system user succeeds and it appears in the user list', async ({ page }) => {
    await adminUsersPage.addUser({
      userRole: 'Admin',
      employeeName: 'Admin',
      status: 'Enabled',
      username,
      password,
    });

    await adminUsersPage.expectToastMessage('Successfully Saved');
    await expect(page).toHaveURL(/viewSystemUsers/);

    await adminUsersPage.searchByUsername(username);
    await expect(adminUsersPage.rowForUsername(username)).toBeVisible();
  });

  test('searching by the created username filters the list to just that record', async () => {
    await adminUsersPage.searchByUsername(username);
    await expect(adminUsersPage.rowForUsername(username)).toBeVisible();
    await expect(adminUsersPage.tableRows).toHaveCount(1);
  });

  test('searching by a username that does not exist shows no records', async () => {
    await adminUsersPage.searchByUsername(`nonexistent_${Date.now()}`);
    await adminUsersPage.expectNoRecordsFound();
  });

  test('editing the created user\'s status to Disabled persists', async () => {
    await adminUsersPage.searchByUsername(username);
    await adminUsersPage.openEditFor(username);
    await adminUsersPage.editStatus('Disabled');
    await adminUsersPage.expectToastMessage('Successfully Updated');

    await adminUsersPage.searchByUsername(username);
    await expect(adminUsersPage.rowForUsername(username)).toContainText('Disabled');
  });

  test('adding a user with required fields empty shows validation errors', async () => {
    await adminUsersPage.addButton.click();
    await expect(adminUsersPage.saveButton).toBeVisible();
    await adminUsersPage.saveButton.click();
    await expect(adminUsersPage.requiredFieldErrors.first()).toBeVisible();
    await adminUsersPage.cancelButton.click();
  });

  test('creating a user with an already-taken username is rejected', async ({ page }) => {
    // Reuse the username created earlier in this run rather than a
    // pre-existing real account, so we never risk touching the real "Admin"
    // user even if the save unexpectedly succeeded.
    await adminUsersPage.addButton.click();
    await adminUsersPage.fillUserForm({
      userRole: 'Admin',
      employeeName: 'Admin',
      status: 'Enabled',
      username,
      password: generatePassword(),
    });
    await adminUsersPage.saveButton.click();
    await expect(page.getByText(/already exists/i)).toBeVisible({ timeout: 10_000 });
    await adminUsersPage.cancelButton.click();
  });

  test('adding a user with mismatched password and confirm password shows a validation error', async ({ page }) => {
    await adminUsersPage.addButton.click();
    await expect(adminUsersPage.saveButton).toBeVisible();

    await adminUsersPage.usernameInput.fill(generateUsername('e2e_mismatch'));
    await adminUsersPage.passwordInput.fill(generatePassword());
    await adminUsersPage.confirmPasswordInput.fill(generatePassword());
    await adminUsersPage.saveButton.click();

    await expect(page.getByText(/Passwords do not match/i)).toBeVisible({ timeout: 10_000 });
    await adminUsersPage.cancelButton.click();
  });

  test('deleting the created user removes it from the list', async () => {
    await adminUsersPage.searchByUsername(username);
    await adminUsersPage.deleteUser(username);
    await adminUsersPage.expectToastMessage('Successfully Deleted');

    await adminUsersPage.searchByUsername(username);
    await adminUsersPage.expectNoRecordsFound();
  });
});
