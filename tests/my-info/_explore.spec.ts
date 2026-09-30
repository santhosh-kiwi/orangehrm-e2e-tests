import { test } from '@playwright/test';
import { loginAsAdmin } from '../../src/utils/auth';

test('explore my info', async ({ page }) => {
  await loginAsAdmin(page);
  await page.locator('.oxd-main-menu-item').filter({ hasText: 'My Info' }).first().click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  console.log('URL:', page.url());
  const tabs = await page.locator('.orangehrm-tabs-item, .oxd-topbar-body-nav-tab-item, a.oxd-main-menu-item').allTextContents();
  console.log('TABS/NAV:', JSON.stringify(tabs));
  const headers = await page.locator('h6, .oxd-text--h6').allTextContents();
  console.log('HEADERS:', JSON.stringify(headers));
  const labels = await page.locator('label').allTextContents();
  console.log('LABELS:', JSON.stringify(labels));

  const nationalityGroup = page.locator('.oxd-input-group').filter({ hasText: 'Nationality' });
  console.log('NATIONALITY HTML:', await nationalityGroup.innerHTML());

  const maritalGroup = page.locator('.oxd-input-group').filter({ hasText: 'Marital Status' });
  console.log('MARITAL HTML:', await maritalGroup.innerHTML());

  const empIdGroup = page.locator('.oxd-input-group').filter({ hasText: 'Employee Id' });
  console.log('EMPID HTML:', await empIdGroup.innerHTML());

  const saveButtons = await page.getByRole('button', { name: /save/i }).count();
  console.log('SAVE BUTTON COUNT:', saveButtons);

  await maritalGroup.locator('.oxd-select-text').click();
  await page.waitForTimeout(500);
  const options = await page.locator('.oxd-select-option').allTextContents();
  console.log('MARITAL OPTIONS:', JSON.stringify(options));
  await page.keyboard.press('Escape');
});
