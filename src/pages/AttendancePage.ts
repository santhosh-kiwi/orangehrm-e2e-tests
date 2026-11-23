import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * The "Punch In/Out" attendance page. The account is a SHARED public-demo
 * resource, so callers must always leave the punch state as they found it —
 * see AttendancePage.currentState()/togglePunch() usage pattern in
 * tests/time/attendance.spec.ts.
 */
export class AttendancePage extends BasePage {
  readonly moduleHeader: Locator;
  readonly punchInHeading: Locator;
  readonly punchOutHeading: Locator;
  readonly punchButton: Locator;
  readonly dateLabel: Locator;
  readonly noteInput: Locator;

  constructor(page: Page) {
    super(page);
    this.moduleHeader = page.locator('.oxd-topbar-header-breadcrumb-module');
    this.punchInHeading = page.getByText('Punch In', { exact: true });
    this.punchOutHeading = page.getByText('Punch Out', { exact: true });
    this.punchButton = page.getByRole('button', { name: /^(In|Out)$/ });
    this.dateLabel = page.getByText('Date', { exact: true });
    this.noteInput = page.locator('textarea');
  }

  async open(): Promise<void> {
    await this.goto('/web/index.php/attendance/punchIn');
    await this.punchButton.waitFor({ state: 'visible', timeout: 15_000 });
  }

  /** 'In' means the user is currently NOT punched in; 'Out' means they are. */
  async currentState(): Promise<'In' | 'Out'> {
    const text = (await this.punchButton.innerText()).trim();
    if (text !== 'In' && text !== 'Out') {
      throw new Error(`Unexpected punch button state: "${text}"`);
    }
    return text;
  }

  async submitPunch(): Promise<void> {
    await this.punchButton.click();
    await this.expectToastMessage('Successfully Saved');
  }
}
