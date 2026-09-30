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
  const firstName = 'E2EProbe';
  const lastName = 'Probe_' + suffix;
  const email = `e2e.probe.${suffix}@example.com`;

  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/recruitment/addCandidate');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await scoped(page, 'Email').fill(email);
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(2000);
  console.log('URL after save:', page.url());

  // Now search for it
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/recruitment/viewCandidates');
  await page.waitForLoadState('domcontentloaded');
  const nameInput = page.locator('.oxd-autocomplete-text-input input');
  await nameInput.fill(lastName);
  await page.waitForTimeout(1000);
  const dropdownOptions = await page.locator('.oxd-autocomplete-dropdown li').allInnerTexts().catch(()=>[]);
  console.log('Autocomplete options:', dropdownOptions);
  if (dropdownOptions.length) {
    await page.locator('.oxd-autocomplete-dropdown li').first().click();
  }
  await page.getByRole('button', { name: 'Search' }).click();
  await page.waitForTimeout(1500);
  const rowCount = await page.locator('.oxd-table-card').count();
  console.log('Search result rows:', rowCount);

  // click eye icon of first row
  await page.locator('.oxd-table-card').first().locator('.bi-eye-fill').click();
  await page.waitForTimeout(1500);
  console.log('Detail URL:', page.url());

  console.log('=== Detail page body classes/structure snippet ===');
  const bodyText = await page.locator('.orangehrm-background-container, .oxd-layout-context').first().innerText().catch(()=>'N/A');
  console.log(bodyText.slice(0, 2000));

  // Look for status change dropdown / button
  const statusButtons = await page.getByRole('button').allInnerTexts();
  console.log('Buttons on detail page:', statusButtons);

  await browser.close();
})();
