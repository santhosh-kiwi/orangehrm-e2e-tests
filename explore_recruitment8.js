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

  const suffix = Date.now();
  const lastName = 'DelProbe_' + suffix;
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/recruitment/addCandidate');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('input[name="firstName"]').fill('E2EDel');
  await page.locator('input[name="lastName"]').fill(lastName);
  await scoped(page, 'Email').fill(`e2e.del.${suffix}@example.com`);
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(2000);

  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/recruitment/viewCandidates');
  await page.waitForLoadState('domcontentloaded');
  const nameInput = page.locator('.oxd-autocomplete-text-input input');
  await nameInput.fill(lastName);
  await page.waitForTimeout(2000);
  await page.getByRole('option').first().click();
  await page.getByRole('button', { name: 'Search' }).click();
  await page.waitForTimeout(1500);

  const rowCount = await page.locator('.oxd-table-card').count();
  console.log('rows after search:', rowCount);

  await page.locator('.oxd-table-card').first().locator('.bi-trash').click();
  await page.waitForTimeout(800);
  const dialogText = await page.locator('.oxd-dialog-container, .orangehrm-modal').first().innerText().catch(()=>'NO DIALOG');
  console.log('Dialog:', dialogText);
  const dialogButtons = await page.locator('.oxd-dialog-container button, .orangehrm-modal button').allInnerTexts().catch(()=>[]);
  console.log('Dialog buttons:', dialogButtons);

  await browser.close();
})();
