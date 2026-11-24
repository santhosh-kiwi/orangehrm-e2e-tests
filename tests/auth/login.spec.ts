import { test, expect } from '../../src/fixtures';
import { env } from '../../src/config/env';

test.describe('Authentication - Login', () => {
  test('valid credentials log the user into the dashboard', { tag: '@smoke' }, async ({ loginPage, page }) => {
    await loginPage.login(env.adminUsername, env.adminPassword);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('invalid username and password shows an error and stays on the login page', { tag: '@smoke' }, async ({ loginPage, page }) => {
    await loginPage.login('InvalidUser', 'WrongPassword123');
    await loginPage.expectLoginError(/Invalid credentials/i);
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('valid username with wrong password is rejected', async ({ loginPage, page }) => {
    await loginPage.login(env.adminUsername, 'ThisIsNotThePassword');
    await loginPage.expectLoginError(/Invalid credentials/i);
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('submitting the form with empty username and password shows required field errors', async ({ loginPage }) => {
    await loginPage.loginButton.click();
    await loginPage.expectRequiredFieldError();
    await expect(loginPage.requiredFieldErrors).toHaveCount(2);
  });

  test('submitting with only a username shows a required error for the password field', async ({ loginPage }) => {
    await loginPage.usernameInput.fill(env.adminUsername);
    await loginPage.loginButton.click();
    await expect(loginPage.requiredFieldErrors).toHaveCount(1);
  });

  test('password field hides the typed characters', async ({ loginPage }) => {
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('"Forgot your password?" link navigates to the password reset page', async ({ loginPage, page }) => {
    await loginPage.clickForgotPassword();
    await expect(page).toHaveURL(/requestPasswordResetCode/);
    await expect(page.getByText(/Reset Password/i).first()).toBeVisible();
  });

  test('login is case-sensitive for the password', async ({ loginPage, page }) => {
    await loginPage.login(env.adminUsername, env.adminPassword.toUpperCase());
    await loginPage.expectLoginError(/Invalid credentials/i);
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('SQL-injection-style input in the username field is rejected safely, not executed', async ({ loginPage, page }) => {
    await loginPage.login("' OR '1'='1", "' OR '1'='1");
    await loginPage.expectLoginError(/Invalid credentials/i);
    await expect(page).toHaveURL(/auth\/login/);
  });
});
