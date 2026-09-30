import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    const spinner = this.page.locator('.oxd-loading-spinner');
    if (await spinner.count()) {
      await spinner.first().waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => undefined);
    }
  }

  async expectToastMessage(text: string | RegExp): Promise<void> {
    const toast = this.page.locator('.oxd-toast').filter({ hasText: text });
    await expect(toast).toBeVisible({ timeout: 10_000 });
  }

  get currentUrl(): string {
    return this.page.url();
  }

  protected recordLocator(record: Locator, name: string | RegExp): Locator {
    return record.filter({ hasText: name });
  }
}
