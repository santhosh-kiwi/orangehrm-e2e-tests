import * as dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  baseUrl: required('BASE_URL', 'https://opensource-demo.orangehrmlive.com'),
  adminUsername: required('ADMIN_USERNAME', 'Admin'),
  adminPassword: required('ADMIN_PASSWORD', 'admin123'),
};
