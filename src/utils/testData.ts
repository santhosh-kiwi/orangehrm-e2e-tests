import { faker } from '@faker-js/faker';

/**
 * This suite runs against a shared public demo instance, so every piece of
 * generated data must be unique per run to avoid colliding with other
 * concurrent test runs (other people/CI jobs use the same sandbox).
 */
function uniqueSuffix(): string {
  return `${Date.now()}${faker.number.int({ min: 100, max: 999 })}`;
}

export function generateUsername(prefix = 'e2e'): string {
  return `${prefix}_${uniqueSuffix()}`;
}

export function generatePassword(): string {
  return `Aut0!${faker.string.alphanumeric(6)}`;
}

export interface CandidateData {
  firstName: string;
  lastName: string;
  /** "First Last", as the candidate list displays it. */
  fullName: string;
  email: string;
  contactNumber: string;
  keywords: string;
}

export function generateCandidate(): CandidateData {
  const suffix = uniqueSuffix();
  const firstName = faker.person.firstName();
  const lastName = `${faker.person.lastName()}_${suffix}`;
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email: `e2e.candidate.${suffix}@example.com`,
    contactNumber: faker.string.numeric(10),
    keywords: 'Playwright, Automation',
  };
}
