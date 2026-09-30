import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';

test('explore nationality dropdown + delete confirm dialog', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login('Admin', 'admin123');
  await page.waitForURL(/dashboard/);

  const uniqueLast = `ZzTest_${Date.now()}`;
  await page.goto('/web/index.php/pim/addEmployee');
  await page.waitForLoadState('domcontentloaded');
  await page.getByPlaceholder('First Name').fill('ZzExplore5');
  await page.getByPlaceholder('Last Name').fill(uniqueLast);
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForURL(/viewPersonalDetails/, { timeout: 15000 });
  await page.waitForTimeout(1000);

  const nationalityWrapper = page.locator('.oxd-input-group').filter({ hasText: 'Nationality' }).locator('.oxd-select-text');
  await nationalityWrapper.click();
  await page.waitForTimeout(500);
  console.log('--- DROPDOWN OPTIONS ---');
  console.log(await page.locator('.oxd-select-dropdown').innerHTML().catch((e) => 'err: ' + e));

  // pick first real option
  const options = page.locator('.oxd-select-dropdown .oxd-select-option');
  console.log('option count', await options.count());
  await options.nth(1).click();

  const saveBtn = page.getByRole('button', { name: 'Save' });
  await saveBtn.click();
  await page.waitForTimeout(1500);
  console.log('toast after personal details save:', await page.locator('.oxd-toast').count());

  // Delete flow
  await page.goto('/web/index.php/pim/viewEmployeeList');
  await page.waitForLoadState('domcontentloaded');
  const nameInput = page.getByPlaceholder('Type for hints...').first();
  await nameInput.fill(uniqueLast);
  await page.waitForTimeout(2000);
  await page.locator('.oxd-autocomplete-option').first().click();
  await page.getByRole('button', { name: 'Search' }).click();
  await page.waitForTimeout(1500);
  const deleteBtn = page.locator('.oxd-table-row').first().locator('button').filter({ has: page.locator('.bi-trash') });
  await deleteBtn.click();
  await page.waitForTimeout(500);
  console.log('--- DELETE CONFIRM DIALOG ---');
  console.log(await page.locator('.oxd-dialog-content, [role="document"]').innerHTML().catch((e) => 'err ' + e));
})
