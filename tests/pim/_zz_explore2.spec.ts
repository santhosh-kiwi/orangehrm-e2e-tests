import { test } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';

test('explore employee list filters + add employee login toggle + edit form', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login('Admin', 'admin123');
  await page.waitForURL(/dashboard/);

  // Employee List page
  await page.goto('/web/index.php/pim/viewEmployeeList');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  console.log('=== EMPLOYEE LIST FILTER AREA ===');
  console.log(await page.locator('.oxd-table-filter-area').innerHTML().catch(() => 'none'));
  console.log('=== TABLE HEADER ===');
  console.log(await page.locator('.oxd-table-header').innerHTML().catch(() => 'none'));

  // Add Employee page
  await page.goto('/web/index.php/pim/addEmployee');
  await page.waitForLoadState('domcontentloaded');
  console.log('=== ADD EMPLOYEE FORM ===');
  console.log(await page.locator('form').first().innerHTML());

  // toggle create login details
  const toggle = page.locator('.oxd-switch-input');
  console.log('toggle count', await toggle.count());
  if (await toggle.count()) {
    await toggle.first().click();
    await page.waitForTimeout(500);
    console.log('=== AFTER TOGGLE FORM ===');
    console.log(await page.locator('form').first().innerHTML());
  }
});
