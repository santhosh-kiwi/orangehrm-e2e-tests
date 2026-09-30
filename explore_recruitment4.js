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
  await page.waitForTimeout(1000);

  const formHtml = await page.locator('form').first().innerHTML();
  console.log('=== FULL SEARCH FORM (0-6000) ===');
  console.log(formHtml.slice(0,1500));
  console.log('--- 3000-6000 ---');
  console.log(formHtml.slice(3000,6000));

  console.log('=== Table header ===');
  const headerHtml = await page.locator('.oxd-table-header').innerHTML().catch(()=>'NONE');
  console.log(headerHtml);

  console.log('=== First row cells ===');
  const rowCount = await page.locator('.oxd-table-card').count();
  console.log('rows:', rowCount);
  if (rowCount > 0) {
    const rowHtml = await page.locator('.oxd-table-card').first().innerHTML();
    console.log(rowHtml.slice(0, 3000));
  }

  await browser.close();
})();
