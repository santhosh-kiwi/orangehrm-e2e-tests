const { chromium } = require('@playwright/test');

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
  await page.waitForTimeout(1000);

  const formHtml = await page.locator('form').first().innerHTML();
  console.log(formHtml.slice(6000, 12000));

  console.log('=== BUTTONS ===');
  const buttons = await page.locator('button').allInnerTexts();
  console.log(buttons);

  console.log('=== CHECKBOXES ===');
  console.log(await page.locator('input[type="checkbox"]').count());

  await browser.close();
})();
