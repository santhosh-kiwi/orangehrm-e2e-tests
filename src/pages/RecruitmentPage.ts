import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface NewCandidateInput {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber?: string;
  keywords?: string;
}

/**
 * Covers the Recruitment > Candidates list, the Add/Edit Candidate form, and
 * the Candidate detail page (view page reuses the "addCandidate" route with
 * an id suffix in this version of OrangeHRM).
 */
export class RecruitmentPage extends BasePage {
  // --- Candidate list ---
  readonly addButton: Locator;
  readonly candidateNameAutocomplete: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly tableRows: Locator;
  readonly noRecordsFound: Locator;

  // --- Add/Edit candidate form ---
  readonly firstNameInput: Locator;
  readonly middleNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly requiredFieldErrors: Locator;

  // --- Candidate detail page ---
  // Note: this OrangeHRM version only exposes status-transition actions
  // (Shortlist/Reject/etc.) once a candidate is linked to a Vacancy; with no
  // vacancy assigned (the common case for a freshly-added candidate) the
  // detail page shows no such buttons at all, so this page object doesn't
  // model that flow.
  readonly editButton: Locator;
  readonly candidateHistory: Locator;

  // --- Delete confirmation dialog ---
  readonly confirmDeleteButton: Locator;
  readonly cancelDeleteButton: Locator;

  constructor(page: Page) {
    super(page);

    this.addButton = page.getByRole('button', { name: 'Add' });
    this.candidateNameAutocomplete = page.locator('.oxd-autocomplete-text-input input');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.tableRows = page.locator('.oxd-table-card');
    this.noRecordsFound = page.getByText('No Records Found');

    this.firstNameInput = page.locator('input[name="firstName"]');
    this.middleNameInput = page.locator('input[name="middleName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.requiredFieldErrors = page.locator('.oxd-input-group__message');

    this.editButton = page.getByRole('button', { name: 'Edit' });
    this.candidateHistory = page.getByText('Candidate History');

    this.confirmDeleteButton = page.getByRole('button', { name: /Yes, Delete/i });
    this.cancelDeleteButton = page.getByRole('button', { name: /No, Cancel/i });
  }

  async openCandidateList(): Promise<void> {
    await this.goto('/web/index.php/recruitment/viewCandidates');
  }

  async openAddCandidate(): Promise<void> {
    await this.goto('/web/index.php/recruitment/addCandidate');
  }

  /** Fields whose placeholder is generic ("Type here"), scoped by their label text. */
  private fieldByLabel(label: string): Locator {
    return this.page.locator('.oxd-input-group').filter({ hasText: label }).locator('input');
  }

  async fillCandidateForm(candidate: NewCandidateInput): Promise<void> {
    await this.firstNameInput.fill(candidate.firstName);
    await this.lastNameInput.fill(candidate.lastName);
    await this.fieldByLabel('Email').fill(candidate.email);
    if (candidate.contactNumber) {
      await this.fieldByLabel('Contact Number').fill(candidate.contactNumber);
    }
    if (candidate.keywords) {
      await this.fieldByLabel('Keywords').fill(candidate.keywords);
    }
  }

  async addCandidate(candidate: NewCandidateInput): Promise<void> {
    await this.openAddCandidate();
    await this.fillCandidateForm(candidate);
    await this.saveButton.click();
    await this.expectToastMessage(/Successfully Saved/i);
    // The app redirects to the new candidate's page (addCandidate/<id>) a few
    // seconds after the toast. Wait for it, or the caller's next goto races
    // the redirect and fails with "interrupted by another navigation".
    await this.page.waitForURL(/\/recruitment\/addCandidate\/\d+/);
  }

  async searchByName(name: string): Promise<void> {
    await this.candidateNameAutocomplete.fill(name);
    const option = this.page.getByRole('option').filter({ hasText: name }).first();
    // Falls back to plain Enter/blur if the async autocomplete lookup finds nothing
    // (e.g. very recent record not yet indexed) so the literal text search still runs.
    await option.waitFor({ state: 'visible', timeout: 5_000 }).then(() => option.click()).catch(() => undefined);
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  row(name: string): Locator {
    return this.tableRows.filter({ hasText: name });
  }

  async openCandidateByName(name: string): Promise<void> {
    await this.row(name).locator('.bi-eye-fill').click();
    await this.waitForPageLoad();
  }

  async deleteCandidateByName(name: string): Promise<void> {
    await this.row(name).locator('.bi-trash').click();
    await expect(this.page.getByText('Are you Sure?')).toBeVisible();
    await this.confirmDeleteButton.click();
    await this.expectToastMessage(/Successfully Deleted/i);
  }

  async expectCandidateVisible(name: string): Promise<void> {
    await expect(this.row(name)).toBeVisible();
  }

  async expectCandidateNotVisible(name: string): Promise<void> {
    // Web-first assertion: retries until the row is gone, unlike a one-off count().
    await expect(this.row(name)).toHaveCount(0);
  }

  /**
   * Cleanup helper: deletes the candidate if it still exists. Safe to call when
   * a test already deleted it, or when creating it failed halfway.
   */
  async deleteCandidateIfExists(candidate: { lastName: string; fullName: string }): Promise<void> {
    await this.openCandidateList();
    await this.searchByName(candidate.lastName);
    // A one-off count() is intended here: this is a branch, not an assertion.
    if ((await this.row(candidate.fullName).count()) > 0) {
      await this.deleteCandidateByName(candidate.fullName);
    }
  }
}
