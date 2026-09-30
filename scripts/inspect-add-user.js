const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/dashboard/);
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers');
  await page.getByRole('button', { name: 'Add' }).click();
  await page.waitForURL(/saveSystemUser/);
  await page.waitForTimeout(1000);

  const selectCount = await page.locator('.oxd-select-text').count();
  console.log('select count:', selectCount);
  for (let i = 0; i < selectCount; i++) {
    const el = page.locator('.oxd-select-text').nth(i);
    const box = await el.boundingBox();
    console.log(i, await el.textContent(), box);
  }

  const labels = await page.locator('.oxd-label').allTextContents();
  console.log('labels:', labels);

  const formRowCount = await page.locator('.oxd-form-row').count();
  console.log('form row count:', formRowCount);
  for (let i = 0; i < formRowCount; i++) {
    const txt = await page.locator('.oxd-form-row').nth(i).innerText();
    console.log('--- row', i, JSON.stringify(txt.slice(0, 150)));
  }

  await browser.close();
})();
