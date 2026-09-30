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

  const nameInput = page.locator('.oxd-autocomplete-text-input input');
  await nameInput.fill('E2EProbe');
  await page.waitForTimeout(2500);
  const options = await page.getByRole('option').allInnerTexts();
  console.log('Options:', options);

  await browser.close();
})();
