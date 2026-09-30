import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorAlert: Locator;
  readonly requiredFieldErrors: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.forgotPasswordLink = page.getByText('Forgot your password?');
    this.errorAlert = page.locator('.oxd-alert-content--error');
    this.requiredFieldErrors = page.locator('.oxd-input-group__message');
  }

  async open(): Promise<void> {
    await this.goto('/web/index.php/auth/login');
    await expect(this.usernameInput).toBeVisible();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectLoginError(message: string | RegExp = /Invalid credentials/i): Promise<void> {
    await expect(this.errorAlert).toBeVisible({ timeout: 10_000 });
    await expect(this.errorAlert).toContainText(message);
  }

  async expectRequiredFieldError(): Promise<void> {
    await expect(this.requiredFieldErrors.first()).toBeVisible();
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }
}
