import { test } from '@playwright/test';
import { loginAsAdmin } from '../../src/utils/auth';

test('explore performance module', async ({ page }) => {
  await loginAsAdmin(page);

  // Click Performance in sidebar
  await page.locator('.oxd-main-menu-item').filter({ hasText: 'Performance' }).first().click();
  await page.waitForLoadState('domcontentloaded');
  console.log('LANDING URL:', page.url());
  console.log('LANDING HEADER:', await page.locator('.oxd-topbar-header-breadcrumb').innerText().catch(() => 'N/A'));

  // List submenu items
  const submenuItems = page.locator('.oxd-topbar-body-nav-tab, .oxd-main-menu-item');
  const count = await submenuItems.count();
  console.log('possible nav items count', count);

  // Try the submenu tabs under breadcrumb (OrangeHRM usually shows sub-nav tabs)
  const navTabs = page.locator('.oxd-topbar-body-nav-tab a, .orangehrm-tabs a, nav a');
  const navCount = await navTabs.count();
  for (let i = 0; i < navCount; i++) {
    const text = await navTabs.nth(i).innerText().catch(() => '');
    const href = await navTabs.nth(i).getAttribute('href').catch(() => '');
    if (text.trim()) console.log('NAV TAB:', text.trim(), href);
  }

  await page.screenshot({ path: 'test-results/performance-landing.png', fullPage: true });
});
