import { test } from '@playwright/test';
import { loginAsAdmin } from '../../src/utils/auth';

test('explore recruitment candidates', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/web/index.php/recruitment/viewCandidates');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  console.log('URL:', page.url());

  const addBtn = page.getByRole('button', { name: 'Add' });
  console.log('ADD BTN visible:', await addBtn.isVisible().catch(() => false));
  await addBtn.click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  console.log('ADD URL:', page.url());

  const labels = await page.locator('label').allTextContents();
  console.log('LABELS:', JSON.stringify(labels));

  const formHtml = await page.locator('form, .oxd-form').first().innerHTML();
  console.log('--- FORM HTML LENGTH ---', formHtml.length);
  console.log(formHtml);
});
