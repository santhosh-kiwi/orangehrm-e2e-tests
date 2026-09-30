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
  await page.waitForTimeout(1200);

  // dump any visible ul/li near autocomplete
  const html = await page.locator('.oxd-autocomplete-wrapper').first().innerHTML();
  console.log(html.slice(0, 3000));

  console.log('=== Search/Reset buttons ===');
  const btns = await page.locator('button[type="submit"], button.oxd-button--secondary, button.oxd-button--ghost').allInnerTexts();
  console.log(btns);

  await browser.close();
})();
