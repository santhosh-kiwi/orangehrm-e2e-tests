import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AdminUsersPage } from '../pages/AdminUsersPage';
import { RecruitmentPage } from '../pages/RecruitmentPage';
import { loginAsAdmin } from '../utils/auth';
import { CandidateData, generateCandidate, generatePassword, generateUsername } from '../utils/testData';

/** Registers a step that runs after the test, whether it passed or failed. */
export type Cleanup = (description: string, step: () => Promise<void>) => void;

export interface TestSystemUser {
  username: string;
  password: string;
}

type Fixtures = {
  /** Login page, already opened. */
  loginPage: LoginPage;
  /** Dashboard page, already opened. Pair with `test.use({ storageState })` for a logged-in session. */
  dashboardPage: DashboardPage;
  /** Logged in as Admin, on Admin > User Management. */
  adminUsersPage: AdminUsersPage;
  /** Logged in as Admin. */
  recruitmentPage: RecruitmentPage;
  cleanup: Cleanup;
  /** A system user created before the test and always deleted after it. */
  systemUser: TestSystemUser;
  /** A recruitment candidate created before the test and always deleted after it. */
  candidate: CandidateData;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.open();
    await use(dashboardPage);
  },

  adminUsersPage: async ({ page }, use) => {
    await loginAsAdmin(page);
    const adminUsersPage = new AdminUsersPage(page);
    await adminUsersPage.open();
    await use(adminUsersPage);
  },

  recruitmentPage: async ({ page }, use) => {
    await loginAsAdmin(page);
    await use(new RecruitmentPage(page));
  },

  // Depends on `page` so its teardown runs while the page is still open.
  // Steps run in reverse order, and one failing step doesn't stop the others:
  // the failure is recorded on the test as a "cleanup-failed" annotation.
  cleanup: async ({ page: _page }, use, testInfo) => {
    const steps: { description: string; step: () => Promise<void> }[] = [];
    await use((description, step) => {
      steps.push({ description, step });
    });
    for (const { description, step } of steps.reverse()) {
      try {
        await step();
      } catch (error) {
        const message = `${description}: ${(error as Error).message.split('\n')[0]}`;
        testInfo.annotations.push({ type: 'cleanup-failed', description: message });
        console.warn(`[cleanup] ${message}`);
      }
    }
  },

  systemUser: async ({ adminUsersPage, cleanup }, use) => {
    const user: TestSystemUser = { username: generateUsername('e2e_admin'), password: generatePassword() };
    // Registered before creating, so a half-finished create is still cleaned up.
    cleanup(`delete system user ${user.username}`, () => adminUsersPage.deleteUserIfExists(user.username));
    await adminUsersPage.addUser({ userRole: 'Admin', employeeName: 'a', status: 'Enabled', ...user });
    await adminUsersPage.expectToastMessage('Successfully Saved');
    await adminUsersPage.waitForUserList();
    await use(user);
  },

  candidate: async ({ recruitmentPage, cleanup }, use) => {
    const candidate = generateCandidate();
    cleanup(`delete candidate ${candidate.fullName}`, () => recruitmentPage.deleteCandidateIfExists(candidate));
    await recruitmentPage.addCandidate(candidate);
    await use(candidate);
  },
});

export { expect };
