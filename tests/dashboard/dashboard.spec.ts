import { test, expect } from '../../src/fixtures';
import { DashboardPage } from '../../src/pages/DashboardPage';
import { ADMIN_STORAGE_STATE } from '../../src/utils/constants';
import { env } from '../../src/config/env';

test.describe('Dashboard', () => {
  test.describe('using the shared authenticated session', () => {
    test.use({ storageState: ADMIN_STORAGE_STATE });

    test('loads with the Dashboard header and navigation sidebar', { tag: '@smoke' }, async ({ dashboardPage }) => {
      await dashboardPage.expectLoaded();
      await dashboardPage.sidebar.expectVisible('Admin');
      await dashboardPage.sidebar.expectVisible('PIM');
      await dashboardPage.sidebar.expectVisible('Leave');
    });

    test('shows the logged-in admin user in the top bar', async ({ dashboardPage }) => {
      await dashboardPage.topbar.expectLoggedInAs();
    });

    test('navigating to Admin module updates the URL and breadcrumb', async ({ dashboardPage, page }) => {
      await dashboardPage.sidebar.navigateTo('Admin');
      await expect(page).toHaveURL(/admin/);
    });
  });

  // Logout terminates the server-side session for the account, which would
  // break any other test concurrently using the shared ADMIN_STORAGE_STATE.
  // It gets its own freshly-logged-in, unshared session instead.
  test('logout returns the user to the login page', { tag: '@smoke' }, async ({ loginPage, page }) => {
    await loginPage.login(env.adminUsername, env.adminPassword);
    await page.waitForURL(/dashboard/);

    await new DashboardPage(page).topbar.logout();
    await expect(page).toHaveURL(/auth\/login/);
  });
});
