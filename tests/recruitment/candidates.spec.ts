import { test, expect } from '@playwright/test';
import { RecruitmentPage } from '../../src/pages/RecruitmentPage';
import { generateCandidate } from '../../src/utils/testData';
import { loginAsAdmin } from '../../src/utils/auth';

test.describe('Recruitment - Candidates', () => {
  let recruitmentPage: RecruitmentPage;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    recruitmentPage = new RecruitmentPage(page);
  });

  test('adding a candidate with required fields succeeds and the candidate appears in the list', async () => {
    const candidate = generateCandidate();
    const fullName = `${candidate.firstName} ${candidate.lastName}`;

    await recruitmentPage.addCandidate(candidate);

    await recruitmentPage.openCandidateList();
    await recruitmentPage.searchByName(candidate.lastName);
    await recruitmentPage.expectCandidateVisible(fullName);

    // cleanup: remove the candidate this test created
    await recruitmentPage.deleteCandidateByName(fullName);
  });

  test('searching by candidate name filters the list to matching records only', async () => {
    const candidate = generateCandidate();
    const fullName = `${candidate.firstName} ${candidate.lastName}`;
    await recruitmentPage.addCandidate(candidate);

    await recruitmentPage.openCandidateList();
    await recruitmentPage.searchByName(candidate.lastName);

    await expect(recruitmentPage.tableRows).toHaveCount(1);
    await recruitmentPage.expectCandidateVisible(fullName);

    await recruitmentPage.deleteCandidateByName(fullName);
  });

  test('viewing a candidate shows its Application Stage and Candidate Profile details', async ({ page }) => {
    const candidate = generateCandidate();
    const fullName = `${candidate.firstName} ${candidate.lastName}`;
    await recruitmentPage.addCandidate(candidate);

    await recruitmentPage.openCandidateList();
    await recruitmentPage.searchByName(candidate.lastName);
    await recruitmentPage.openCandidateByName(fullName);

    await expect(page).toHaveURL(/recruitment\/addCandidate\/\d+/);
    await page.waitForLoadState('networkidle').catch(() => undefined);
    // exact: true avoids matching the Candidate History log entry, which
    // contains this same name as a substring of a longer activity message.
    await expect(page.getByText(fullName, { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(recruitmentPage.candidateHistory).toBeVisible();

    await recruitmentPage.openCandidateList();
    await recruitmentPage.searchByName(candidate.lastName);
    await recruitmentPage.deleteCandidateByName(fullName);
  });

  test('deleting a candidate removes it from the list', async () => {
    const candidate = generateCandidate();
    const fullName = `${candidate.firstName} ${candidate.lastName}`;
    await recruitmentPage.addCandidate(candidate);

    await recruitmentPage.openCandidateList();
    await recruitmentPage.searchByName(candidate.lastName);
    await recruitmentPage.expectCandidateVisible(fullName);

    await recruitmentPage.deleteCandidateByName(fullName);

    await recruitmentPage.openCandidateList();
    await recruitmentPage.searchByName(candidate.lastName);
    await recruitmentPage.expectCandidateNotVisible(fullName);
  });

  test('the delete confirmation dialog can be cancelled, leaving the candidate intact', async () => {
    const candidate = generateCandidate();
    const fullName = `${candidate.firstName} ${candidate.lastName}`;
    await recruitmentPage.addCandidate(candidate);

    await recruitmentPage.openCandidateList();
    await recruitmentPage.searchByName(candidate.lastName);
    await recruitmentPage.row(fullName).locator('.bi-trash').click();
    await expect(recruitmentPage.cancelDeleteButton).toBeVisible();
    await recruitmentPage.cancelDeleteButton.click();
    await recruitmentPage.expectCandidateVisible(fullName);

    // real cleanup
    await recruitmentPage.deleteCandidateByName(fullName);
  });

  test('submitting the Add Candidate form without required fields shows validation errors', async () => {
    await recruitmentPage.openAddCandidate();
    await recruitmentPage.saveButton.click();
    await expect(recruitmentPage.requiredFieldErrors.first()).toBeVisible();
  });

  test('candidate list search can be cleared with Reset', async () => {
    // Reset only clears a *committed* search (one made via searchByName,
    // which selects a real autocomplete suggestion) — raw typed-but-never-
    // selected text isn't tracked by the underlying model, so Reset can't
    // clear that case. This test exercises the real, supported behavior.
    const candidate = generateCandidate();
    const fullName = `${candidate.firstName} ${candidate.lastName}`;
    await recruitmentPage.addCandidate(candidate);

    await recruitmentPage.openCandidateList();
    await recruitmentPage.searchByName(candidate.lastName);
    await expect(recruitmentPage.candidateNameAutocomplete).not.toHaveValue('');

    await recruitmentPage.resetButton.click();
    await expect(recruitmentPage.candidateNameAutocomplete).toHaveValue('');

    await recruitmentPage.searchByName(candidate.lastName);
    await recruitmentPage.deleteCandidateByName(fullName);
  });
});
