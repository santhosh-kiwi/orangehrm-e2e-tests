const { chromium } = require('@playwright/test');

function scoped(page, label) {
  return page.locator('.oxd-input-group').filter({ hasText: label }).locator('input');
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/dashboard/);

  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/recruitment/addCandidate');
  await page.waitForLoadState('domcontentloaded');

  const suffix = Date.now();
  const firstName = 'E2EFirst';
  const lastName = 'E2ELast_' + suffix;
  const email = `e2e.candidate.${suffix}@example.com`;

  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await scoped(page, 'Email').fill(email);
  await scoped(page, 'Contact Number').fill('9876543210');
  await scoped(page, 'Keywords').fill('Playwright, Automation');

  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  console.log('=== After Save URL ===', page.url());

  // toast
  const toast = await page.locator('.oxd-toast').allInnerTexts().catch(() => []);
  console.log('=== Toast ===', toast);

  // Go to list and search
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/recruitment/viewCandidates');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  console.log('=== Search form inputs ===');
  const inputs = await page.locator('form input, form .oxd-select-text').count();
  console.log('input-like count', inputs);

  const formHtml = await page.locator('form').first().innerHTML();
  console.log(formHtml.slice(0, 3000));

  await browser.close();
})();
