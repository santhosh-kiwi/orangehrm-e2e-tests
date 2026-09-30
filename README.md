# OrangeHRM E2E Test Suite

End-to-end test automation for the [OrangeHRM public demo site](https://opensource-demo.orangehrmlive.com), built with [Playwright](https://playwright.dev/) + TypeScript.

## Stack

- **Playwright Test** — test runner, browser automation, tracing/video/screenshot capture
- **TypeScript** — type-safe Page Objects and fixtures
- **@faker-js/faker** — unique, collision-safe test data generation
- **allure-playwright** — rich HTML test reporting (in addition to Playwright's built-in HTML reporter)
- **GitHub Actions** — CI across Chromium, Firefox, and WebKit

## Project structure

```
src/
  pages/         Page Object classes (one per screen/module)
  components/    Shared UI fragments reused across pages (Sidebar, Topbar)
  utils/         Test data generators, auth helper, shared constants
  config/        Environment config, Playwright global setup
tests/
  auth/          Login flows
  dashboard/     Dashboard + navigation + logout
  admin/         Admin > User Management
  pim/           PIM > Employee List / Add / Edit / Delete
  leave/         Leave > Apply / My Leave / Leave List
  time/          Time > Timesheets / Attendance
  recruitment/   Recruitment > Candidates
  my-info/       My Info > Personal Details and related tabs
  performance/   Performance > Reviews / Trackers / KPIs
playwright.config.ts
```

## Getting started

```bash
npm install
npx playwright install --with-deps   # first time only
cp .env.example .env                 # defaults already match the public demo
npm test                             # run the full suite, all browsers
```

Useful variants:

```bash
npm run test:chromium     # single browser, fastest local feedback
npm run test:headed       # watch it run
npm run test:ui           # Playwright's interactive UI mode
npm run test:debug        # step through with the inspector
```

## Reports

```bash
npm run report:html                 # opens Playwright's HTML report
npm run report:allure:generate      # builds allure-report/ from allure-results/
npm run report:allure:open          # serves the Allure report
```

Every run also captures a trace, screenshot, and video **on failure only** (see `playwright.config.ts`), viewable with:

```bash
npx playwright show-trace <path-to-trace.zip>
```

## CI

`.github/workflows/playwright.yml` runs the suite on push/PR to `main`, on a daily schedule (to catch drift on the shared demo site independent of code changes), and on manual dispatch — across Chromium, Firefox, and WebKit in parallel. Reports are uploaded as build artifacts; Allure results are merged and published as a combined report artifact.

## Framework design notes

This suite targets a **shared public demo instance** used by many people/CI jobs concurrently, not a private test environment. That constraint shaped several deliberate design choices:

- **Unique test data everywhere.** `src/utils/testData.ts` generates usernames/emails/names with a timestamp+random suffix so concurrent runs never collide on the same record.
- **Clean up what you create.** Tests that create a user, employee, or candidate delete it again at the end of the test. `My Info` tests (which edit the Admin account's own single shared profile, not a throwaway record) capture the original field value and restore it in a `finally` block.
- **Never touch data you didn't create.** No test deletes/modifies a pre-existing record it can't positively identify as its own.
- **Session isolation over shared storage state.** Most module tests log in fresh per test via `loginAsAdmin(page)` (`src/utils/auth.ts`) rather than reusing a shared `storageState` file. This was a real bug found during development: a `logout` test sharing a session cookie with other parallel tests killed their sessions mid-run. The Dashboard spec still demonstrates the faster shared-`storageState` pattern (via Playwright's `globalSetup` writing `storage-state/admin.json`) for read-only navigation tests, since that pattern is valid and faster when nothing in the file logs out or otherwise invalidates the session.
- **Resilient locators.** Locators prefer `getByRole` / `getByLabel` / `getByPlaceholder` / `getByText` over brittle CSS/XPath, matching Playwright's accessibility-first best practice and reducing breakage from incidental markup/class-name changes in OrangeHRM's `oxd-*` component library.
- **Page Object Model**, direct instantiation (`new LoginPage(page)`) rather than a fixtures-DI layer — kept intentionally simple given the suite's size.

## Credentials

The demo site publishes standard credentials for this exact purpose: `Admin` / `admin123` (see `.env.example`). No real user data is involved.
