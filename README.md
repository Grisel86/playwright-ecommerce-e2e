# Playwright E-Commerce E2E Test Suite

End-to-end test automation for an e-commerce web application (SauceDemo), built with **Playwright** and **TypeScript** using a mature **Page Object Model** architecture with Component Objects, custom fixtures, and CI-driven cross-browser execution.

This repository is a production-style reference for what senior-level Playwright automation looks like in practice: strict typing, clear separation between domain intent and DOM plumbing, and a test lifecycle designed for speed on local runs and reliability on CI.

## What this project demonstrates

The suite covers authentication, product listing and sorting, cart operations, and the complete three-step checkout flow, across Chromium, Firefox, WebKit, and two mobile viewports. Every test is tagged (`@smoke`, `@regression`, `@negative`) so the CI pipeline can run a fast subset on every commit and the full regression nightly.

Architecturally, the code separates concerns into Page Objects (one class per page), a reusable Component Object for the shared header, custom Playwright fixtures that inject POMs into tests, and a typed data layer for users and products. Tests read like business scenarios, not DOM clicks — which is the whole point of maturing beyond "Selenium-style" automation.

## Tech stack

- **Playwright** — test runner, browser automation, trace viewer, built-in reporters
- **TypeScript** — strict mode, path aliases, typed domain objects
- **ESLint + Prettier** — code quality and consistent formatting
- **GitHub Actions** — CI with browser matrix, scheduled nightly runs, and artifact upload
- **dotenv** — environment-driven configuration for dev / staging / prod

## Project structure

```
playwright-ecommerce-e2e/
├── src/
│   ├── pages/              # Page Object classes
│   │   ├── BasePage.ts     # Abstract parent — shared navigation/waits/screenshots
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutPage.ts
│   │   └── components/
│   │       └── HeaderComponent.ts   # Shared header — Component Object pattern
│   ├── fixtures/
│   │   ├── pages.fixture.ts         # Injects POMs into the test context
│   │   └── auth.fixture.ts          # Auto-logs-in a standard user
│   ├── data/
│   │   ├── users.ts                 # Typed test user catalog
│   │   └── products.ts              # Product catalog + business constants
│   └── utils/
│       └── logger.ts
├── tests/
│   ├── auth/login.spec.ts
│   ├── inventory/product-listing.spec.ts
│   ├── cart/cart-operations.spec.ts
│   └── checkout/checkout-flow.spec.ts
├── .github/workflows/playwright.yml
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

## Getting started

Clone the repository and install dependencies:

```bash
npm ci
npx playwright install --with-deps
```

Copy `.env.example` to `.env` to configure the target environment:

```bash
cp .env.example .env
```

Run the full suite:

```bash
npm test
```

Run only smoke tests (fast feedback loop):

```bash
npm run test:smoke
```

Run a single browser in headed mode for debugging:

```bash
npm run test:headed -- --project=chromium
```

Open the Playwright UI mode — the best way to debug a single test:

```bash
npm run test:ui
```

After a run, open the HTML report:

```bash
npm run report
```

## Key patterns worth studying

**BasePage abstraction.** Every page inherits from `BasePage`, which owns navigation, page-load waits, and screenshotting. Subclasses only add what's unique to them, keeping individual POM files focused and small.

**Component Object Pattern.** The navigation header appears on every authenticated page. Instead of copy-pasting its locators into each page class, `HeaderComponent` encapsulates them once and each page exposes it as a public property: `inventoryPage.header.openCart()`.

**Custom fixtures.** Tests don't instantiate POMs manually. The `pages.fixture.ts` file extends Playwright's `test` to inject every POM into the test context, so tests start with everything they need already wired up. The `auth.fixture.ts` goes one step further — it pre-logs-in a user before each test runs.

**Typed domain objects.** Methods like `cartPage.getAllItems()` return `CartItem[]`, not arrays of DOM elements. Tests assert on the domain model, which makes them easier to read and more robust to UI changes.

**Business-logic assertions.** The checkout test verifies `tax ≈ subtotal × 0.08` instead of hardcoding "$2.40". That way, a price change doesn't break the test unless it breaks the actual tax calculation.

**Tag-based filtering.** Every test carries one or more tags (`@smoke`, `@regression`, `@negative`). CI runs `@smoke` on every PR for fast feedback and the full suite nightly.

## CI/CD pipeline

The workflow under `.github/workflows/playwright.yml` runs on every push and pull request to `main` / `develop`, plus a nightly scheduled run at 06:00 UTC. It uses a matrix strategy to run the suite in parallel across three browsers, type-checks the TypeScript before running tests, and uploads the HTML report and raw results as artifacts regardless of outcome — so failures are always debuggable from the Actions UI.

## Available npm scripts

- `npm test` — full suite, all browsers
- `npm run test:smoke` — fast smoke subset
- `npm run test:regression` — full regression
- `npm run test:chromium` / `test:firefox` / `test:webkit` — single browser
- `npm run test:headed` — run with browser visible
- `npm run test:debug` — Playwright inspector
- `npm run test:ui` — Playwright UI mode
- `npm run report` — open the last HTML report
- `npm run typecheck` — TypeScript compile check
- `npm run lint` / `lint:fix` — ESLint
- `npm run format` — Prettier

## Author

**Fabiana Grisel González** — QA Automation Engineer
[LinkedIn](https://www.linkedin.com/in/fabiana-grisel-gonzalez) · [GitHub](https://github.com/Grisel86)
