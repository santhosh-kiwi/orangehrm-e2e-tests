import { test, expect } from '../../src/fixtures';
import { generateCandidate } from '../../src/utils/testData';

test.describe('Recruitment - Candidates', () => {
  // These tests add a candidate (save, toast, redirect) and then load the list
  // and search, often 4+ page loads on the slow shared demo site. That doesn't
  // reliably fit in the default 45s on WebKit.
  test.describe.configure({ timeout: 120_000 });

  test('adding a candidate with required fields succeeds and the candidate appears in the list', { tag: '@smoke' }, async ({ recruitmentPage, cleanup }) => {
    const candidate = generateCandidate();
    cleanup(`delete candidate ${candidate.fullName}`, () => recruitmentPage.deleteCandidateIfExists(candidate));

    await recruitmentPage.addCandidate(candidate);

    await recruitmentPage.openCandidateList();
    await recruitmentPage.searchByName(candidate.lastName);
    await recruitmentPage.expectCandidateVisible(candidate.fullName);
  });

  test('searching by candidate name filters the list to matching records only', async ({ recruitmentPage, candidate }) => {
    await recruitmentPage.openCandidateList();
    await recruitmentPage.searchByName(candidate.lastName);

    await expect(recruitmentPage.tableRows).toHaveCount(1);
    await recruitmentPage.expectCandidateVisible(candidate.fullName);
  });

  test('viewing a candidate shows its Application Stage and Candidate Profile details', async ({ recruitmentPage, candidate, page }) => {
    await recruitmentPage.openCandidateList();
    await recruitmentPage.searchByName(candidate.lastName);
    await recruitmentPage.openCandidateByName(candidate.fullName);

    await expect(page).toHaveURL(/recruitment\/addCandidate\/\d+/);
    // exact: true avoids matching the Candidate History log entry, which
    // contains this same name as a substring of a longer activity message.
    await expect(page.getByText(candidate.fullName, { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(recruitmentPage.candidateHistory).toBeVisible();
  });

  test('deleting a candidate removes it from the list', async ({ recruitmentPage, candidate }) => {
    await recruitmentPage.openCandidateList();
    await recruitmentPage.searchByName(candidate.lastName);
    await recruitmentPage.expectCandidateVisible(candidate.fullName);

    await recruitmentPage.deleteCandidateByName(candidate.fullName);

    await recruitmentPage.openCandidateList();
    await recruitmentPage.searchByName(candidate.lastName);
    await recruitmentPage.expectCandidateNotVisible(candidate.fullName);
  });

  test('the delete confirmation dialog can be cancelled, leaving the candidate intact', async ({ recruitmentPage, candidate }) => {
    await recruitmentPage.openCandidateList();
    await recruitmentPage.searchByName(candidate.lastName);
    await recruitmentPage.row(candidate.fullName).locator('.bi-trash').click();
    await expect(recruitmentPage.cancelDeleteButton).toBeVisible();
    await recruitmentPage.cancelDeleteButton.click();
    await recruitmentPage.expectCandidateVisible(candidate.fullName);
  });

  test('submitting the Add Candidate form without required fields shows validation errors', async ({ recruitmentPage }) => {
    await recruitmentPage.openAddCandidate();
    await recruitmentPage.saveButton.click();
    await expect(recruitmentPage.requiredFieldErrors.first()).toBeVisible();
  });

  test('candidate list search can be cleared with Reset', async ({ recruitmentPage, candidate }) => {
    // Reset only clears a *committed* search (one made via searchByName,
    // which selects a real autocomplete suggestion) — raw typed-but-never-
    // selected text isn't tracked by the underlying model, so Reset can't
    // clear that case. This test exercises the real, supported behavior.
    await recruitmentPage.openCandidateList();
    await recruitmentPage.searchByName(candidate.lastName);
    await expect(recruitmentPage.candidateNameAutocomplete).not.toHaveValue('');

    await recruitmentPage.resetButton.click();
    await expect(recruitmentPage.candidateNameAutocomplete).toHaveValue('');
  });
});
