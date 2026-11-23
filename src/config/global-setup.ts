import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { LoginPage } from '../pages/LoginPage';
import { env } from './env';

const STORAGE_STATE_PATH = path.join(__dirname, '..', '..', 'storage-state', 'admin.json');

export default async function globalSetup(config: FullConfig): Promise<void> {
  fs.mkdirSync(path.dirname(STORAGE_STATE_PATH), { recursive: true });
  const baseURL = config.projects[0]?.use?.baseURL ?? env.baseUrl;
  const browser = await chromium.launch();

  // Global setup runs once with no test retries, so a single slow response
  // from the shared public demo site would fail the whole run. Retry the login.
  const maxAttempts = 3;
  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const page = await browser.newPage({ baseURL });
      try {
        const loginPage = new LoginPage(page);
        await loginPage.open();
        await loginPage.login(env.adminUsername, env.adminPassword);
        await page.waitForURL(/dashboard/);
        await page.context().storageState({ path: STORAGE_STATE_PATH });
        return;
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        console.warn(`global-setup: login attempt ${attempt} failed, retrying...`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}

export { STORAGE_STATE_PATH };
