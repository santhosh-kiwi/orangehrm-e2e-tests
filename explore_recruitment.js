const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/dashboard/);

  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/recruitment/viewCandidates');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  console.log('=== URL ===', page.url());
  console.log('=== Header ===', await page.locator('.oxd-topbar-header-breadcrumb').innerText().catch(() => 'N/A'));

  // Find Add button
  const addBtn = page.getByRole('button', { name: /add/i });
  console.log('Add button count:', await addBtn.count());

  await addBtn.first().click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  console.log('=== Add Candidate URL ===', page.url());

  const formHtml = await page.locator('form').first().innerHTML().catch(() => 'NO FORM');
  console.log('=== FORM HTML (first 6000 chars) ===');
  console.log(formHtml.slice(0, 6000));

  await browser.close();
})();
