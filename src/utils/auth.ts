import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { env } from '../config/env';

/**
 * Performs a fresh UI login for the given page/context.
 *
 * Module specs that were authored/validated concurrently use this instead of
 * the shared ADMIN_STORAGE_STATE file: the shared file is (re)written by
 * Playwright's globalSetup on every `playwright test` invocation, and having
 * several suites regenerate it at the same time against the shared public
 * demo instance is an avoidable race. A fresh login per test is slightly
 * slower but fully isolated.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(env.adminUsername, env.adminPassword);
  await page.waitForURL(/dashboard/);
}
