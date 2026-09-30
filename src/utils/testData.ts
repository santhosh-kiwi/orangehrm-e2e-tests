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

export interface EmployeeData {
  firstName: string;
  middleName: string;
  lastName: string;
}

export function generateEmployee(): EmployeeData {
  return {
    firstName: faker.person.firstName(),
    middleName: faker.person.middleName(),
    lastName: `${faker.person.lastName()}_${uniqueSuffix()}`,
  };
}

export interface SystemUserData {
  username: string;
  password: string;
  employeeName: string;
}

export interface CandidateData {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  keywords: string;
}

export function generateCandidate(): CandidateData {
  const suffix = uniqueSuffix();
  return {
    firstName: faker.person.firstName(),
    lastName: `${faker.person.lastName()}_${suffix}`,
    email: `e2e.candidate.${suffix}@example.com`,
    contactNumber: faker.string.numeric(10),
    keywords: 'Playwright, Automation',
  };
}
