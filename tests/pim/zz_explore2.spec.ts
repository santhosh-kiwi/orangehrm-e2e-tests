import { test } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';

test('explore add employee form + login details toggle + pagination + delete confirm', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login('Admin', 'admin123');
  await page.waitForURL(/dashboard/);

  await page.goto('/web/index.php/pim/addEmployee');
  await page.waitForLoadState('domcontentloaded');

  console.log('--- ADD EMPLOYEE FORM (first 2500 chars) ---');
  const form = page.locator('form').first();
  console.log((await form.innerHTML()).slice(0, 2500));

  console.log('--- TOGGLE / SWITCH ELEMENTS ---');
  const switches = page.locator('.oxd-switch-input, [class*="switch"]');
  console.log('count:', await switches.count());
  for (let i = 0; i < (await switches.count()); i++) {
    console.log(i, await switches.nth(i).getAttribute('class'));
  }

  console.log('--- TEXT NEAR "Create Login Details" ---');
  const loginDetailsLabel = page.getByText('Create Login Details');
  console.log('visible:', await loginDetailsLabel.isVisible().catch(() => false));

  // click the toggle
  const toggle = page.locator('.oxd-switch-input').first();
  if (await toggle.count()) {
    await toggle.click();
    await page.waitForTimeout(500);
    console.log('--- AFTER TOGGLE: labels ---');
    console.log(JSON.stringify(await page.locator('label').allTextContents()));
  }

  console.log('--- EMPLOYEE LIST PAGE: pagination + records dropdown ---');
  await page.goto('/web/index.php/pim/viewEmployeeList');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  console.log('pagination html:', await page.locator('.oxd-pagination').innerHTML().catch(() => 'none'));
  console.log('records text:', await page.locator('.oxd-table-header').innerText().catch(() => 'none'));

  // search field structure
  console.log('--- SEARCH FORM LABELS ---');
  console.log(JSON.stringify(await page.locator('.oxd-form label, .oxd-label').allTextContents()));
});
