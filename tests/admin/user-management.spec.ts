import { test, expect } from '../../src/fixtures';
import { generateUsername, generatePassword } from '../../src/utils/testData';

test.describe('Admin - User Management', () => {
  // Creating a user goes through the Employee Name autocomplete, which retries
  // up to 3 times (~20s each worst case) on the shared demo site. That doesn't
  // fit in the default 45s test timeout.
  test.describe.configure({ timeout: 120_000 });

  test('adding a new system user succeeds and it appears in the user list', { tag: '@smoke' }, async ({ adminUsersPage, cleanup, page }) => {
    const username = generateUsername('e2e_admin');
    cleanup(`delete system user ${username}`, () => adminUsersPage.deleteUserIfExists(username));

    await adminUsersPage.addUser({
      userRole: 'Admin',
      employeeName: 'a',
      status: 'Enabled',
      username,
      password: generatePassword(),
    });

    await adminUsersPage.expectToastMessage('Successfully Saved');
    await expect(page).toHaveURL(/viewSystemUsers/);

    await adminUsersPage.searchByUsername(username);
    await expect(adminUsersPage.rowForUsername(username)).toBeVisible();
  });

  test('searching by username filters the list to just that record', async ({ adminUsersPage, systemUser }) => {
    await adminUsersPage.searchByUsername(systemUser.username);
    await expect(adminUsersPage.rowForUsername(systemUser.username)).toBeVisible();
    await expect(adminUsersPage.tableRows).toHaveCount(1);
  });

  test('searching by a username that does not exist shows no records', async ({ adminUsersPage }) => {
    await adminUsersPage.searchByUsername(`nonexistent_${Date.now()}`);
    await adminUsersPage.expectNoRecordsFound();
  });

  test('editing a user\'s status to Disabled persists', async ({ adminUsersPage, systemUser }) => {
    await adminUsersPage.searchByUsername(systemUser.username);
    await adminUsersPage.openEditFor(systemUser.username);
    await adminUsersPage.editStatus('Disabled');
    await adminUsersPage.expectToastMessage('Successfully Updated');

    await adminUsersPage.searchByUsername(systemUser.username);
    await expect(adminUsersPage.rowForUsername(systemUser.username)).toContainText('Disabled');
  });

  test('adding a user with required fields empty shows validation errors', async ({ adminUsersPage }) => {
    await adminUsersPage.addButton.click();
    await expect(adminUsersPage.saveButton).toBeVisible();
    await adminUsersPage.saveButton.click();
    await expect(adminUsersPage.requiredFieldErrors.first()).toBeVisible();
    await adminUsersPage.cancelButton.click();
  });

  test('creating a user with an already-taken username is rejected', async ({ adminUsersPage, systemUser, page }) => {
    // Reuses this test's own user rather than a pre-existing real account, so
    // we never risk touching the real "Admin" user even if the save succeeded.
    await adminUsersPage.addButton.click();
    await adminUsersPage.fillUserForm({
      userRole: 'Admin',
      employeeName: 'a',
      status: 'Enabled',
      username: systemUser.username,
      password: generatePassword(),
    });
    await adminUsersPage.saveButton.click();
    await expect(page.getByText(/already exists/i)).toBeVisible({ timeout: 10_000 });
    await adminUsersPage.cancelButton.click();
  });

  test('adding a user with mismatched password and confirm password shows a validation error', async ({ adminUsersPage, page }) => {
    await adminUsersPage.addButton.click();
    await expect(adminUsersPage.saveButton).toBeVisible();

    await adminUsersPage.usernameInput.fill(generateUsername('e2e_mismatch'));
    await adminUsersPage.passwordInput.fill(generatePassword());
    await adminUsersPage.confirmPasswordInput.fill(generatePassword());
    await adminUsersPage.saveButton.click();

    await expect(page.getByText(/Passwords do not match/i)).toBeVisible({ timeout: 10_000 });
    await adminUsersPage.cancelButton.click();
  });

  test('deleting a user removes it from the list', async ({ adminUsersPage, systemUser }) => {
    await adminUsersPage.searchByUsername(systemUser.username);
    await adminUsersPage.deleteUser(systemUser.username);
    await adminUsersPage.expectToastMessage('Successfully Deleted');

    await adminUsersPage.searchByUsername(systemUser.username);
    await adminUsersPage.expectNoRecordsFound();
  });
});
