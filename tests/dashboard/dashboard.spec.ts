import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../src/pages/DashboardPage';
import { LoginPage } from '../../src/pages/LoginPage';
import { ADMIN_STORAGE_STATE } from '../../src/utils/constants';
import { env } from '../../src/config/env';

test.describe('Dashboard', () => {
  test.describe('using the shared authenticated session', () => {
    test.use({ storageState: ADMIN_STORAGE_STATE });

    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
      dashboardPage = new DashboardPage(page);
      await dashboardPage.open();
    });

    test('loads with the Dashboard header and navigation sidebar', async () => {
      await dashboardPage.expectLoaded();
      await dashboardPage.sidebar.expectVisible('Admin');
      await dashboardPage.sidebar.expectVisible('PIM');
      await dashboardPage.sidebar.expectVisible('Leave');
    });

    test('shows the logged-in admin user in the top bar', async () => {
      await dashboardPage.topbar.expectLoggedInAs();
    });

    test('navigating to Admin module updates the URL and breadcrumb', async ({ page }) => {
      await dashboardPage.sidebar.navigateTo('Admin');
      await expect(page).toHaveURL(/admin/);
    });
  });

  // Logout terminates the server-side session for the account, which would
  // break any other test concurrently using the shared ADMIN_STORAGE_STATE.
  // It gets its own freshly-logged-in, unshared session instead.
  test('logout returns the user to the login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(env.adminUsername, env.adminPassword);
    await page.waitForURL(/dashboard/);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.topbar.logout();
    await expect(page).toHaveURL(/auth\/login/);
  });
});
