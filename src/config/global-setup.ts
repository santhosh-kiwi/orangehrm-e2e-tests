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
  const page = await browser.newPage({ baseURL });

  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(env.adminUsername, env.adminPassword);
  await page.waitForURL(/dashboard/);

  await page.context().storageState({ path: STORAGE_STATE_PATH });
  await browser.close();
}

export { STORAGE_STATE_PATH };
