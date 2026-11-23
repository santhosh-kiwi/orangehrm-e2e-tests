# OrangeHRM E2E Test Suite

End-to-end test automation for the [OrangeHRM public demo site](https://opensource-demo.orangehrmlive.com), built with [Playwright](https://playwright.dev/) + TypeScript.

## Status

| Module | Page Object(s) | Spec | Tests | Verified against live site |
|---|---|---|---|---|
| Auth (Login) | `LoginPage` | `tests/auth/login.spec.ts` | 9 | ✅ |
| Dashboard | `DashboardPage`, `Sidebar`, `Topbar` | `tests/dashboard/dashboard.spec.ts` | 4 | ✅ |
| Admin (User Management) | `AdminUsersPage` | `tests/admin/user-management.spec.ts` | 8 | ✅ |
| Recruitment (Candidates) | `RecruitmentPage` | `tests/recruitment/candidates.spec.ts` | 8 | ✅ |
| PIM | — | — | — | not started |
| Leave | — | — | — | not started |
| Time | `AttendancePage`, `TimesheetPage` (untested) | — | — | not started |
| My Info | — | — | — | not started |
| Performance | — | — | — | not started |

**29 tests, all passing**, run repeatedly against the live site (not just written and assumed to work). `src/pages/AttendancePage.ts` and `src/pages/TimesheetPage.ts` exist from earlier exploratory work but have no spec exercising them yet — treat them as a draft, not verified.

## Stack

- **Playwright Test** — test runner, browser automation, tracing/video/screenshot capture
- **TypeScript** — type-safe Page Objects
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
  auth/          Login flows (done)
  dashboard/     Dashboard + navigation + logout (done)
  admin/         Admin > User Management (done)
  recruitment/   Recruitment > Candidates (done)
  pim/           PIM > Employee List / Add / Edit / Delete (empty — not started)
  leave/         Leave > Apply / My Leave / Leave List (empty — not started)
  time/          Time > Timesheets / Attendance (empty — not started)
  my-info/       My Info > Personal Details and related tabs (empty — not started)
  performance/   Performance > Reviews / Trackers / KPIs (empty — not started)
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

This suite targets a **shared public demo instance** used by many people concurrently — not a private, disposable test environment. That constraint shaped several deliberate design choices, some learned the hard way during development:

- **Unique test data everywhere.** `src/utils/testData.ts` generates usernames/emails/names with a timestamp+random suffix so concurrent runs never collide on the same record.
- **Clean up what you create.** Tests that create a user, employee, or candidate delete it again at the end of the test.
- **Never touch data you didn't create.** No test deletes/modifies a pre-existing record it can't positively identify as its own.
- **Never hardcode a specific pre-existing employee's name.** The `Admin` login is the exact well-known credential this entire public demo publishes for practice — meaning many unrelated people (and their automation) are logged into the *same account* at any given moment, and its linked employee record is volatile shared state that can change between one moment and the next (we watched it change out from under us during development, from "Amanda User" to arbitrary other values). `AdminUsersPage.fillUserForm`'s Employee Name field treats its input as a broad search *query* (e.g. `"a"`) and selects whichever real employee comes back first, rather than asserting a specific name still exists.
- **Session isolation over shared storage state.** Most module tests log in fresh per test via `loginAsAdmin(page)` (`src/utils/auth.ts`) rather than reusing a shared `storageState` file, to stay safe under concurrent test development. The Dashboard spec demonstrates the faster shared-`storageState` pattern (via Playwright's `globalSetup` writing `storage-state/admin.json`) for read-only navigation tests — but explicitly *not* for anything that logs out or otherwise invalidates the session (a logout test sharing that session cookie with other parallel tests was found killing their sessions mid-run).
- **Resilient locators.** Locators prefer `getByRole` / `getByLabel` / `getByPlaceholder` / `getByText` over brittle CSS/XPath. Where OrangeHRM's table row actions don't expose accessible names (e.g. icon-only edit/delete buttons), locators target the specific icon class (`.bi-pencil-fill` vs `.bi-trash`) rather than "first icon button" — the two are adjacent in the DOM and grabbing the wrong one by position previously opened a delete confirmation instead of an edit form.
- **`waitForPageLoad` waits for network idle**, not just a loading-spinner's presence — checking `spinner.count()` immediately after triggering an AJAX action (e.g. a table search) can race the spinner actually mounting, causing the wait to be skipped entirely.
- **Page Object Model**, direct instantiation (`new LoginPage(page)`) rather than a fixtures-DI layer — kept intentionally simple given the suite's size.

## Credentials

The demo site publishes standard credentials for this exact purpose: `Admin` / `admin123` (see `.env.example`). No real user data is involved.
