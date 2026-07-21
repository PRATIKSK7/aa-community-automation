# AA Community Automation

[![Build Status](https://img.shields.io/github/actions/workflow/status/YOUR_GITHUB_USERNAME/aa-community-automation/tests.yml?branch=main&style=for-the-badge)](https://github.com/YOUR_GITHUB_USERNAME/aa-community-automation/actions/workflows/tests.yml)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=Playwright&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)

A robust, full-stack test automation framework for Automation Anywhere Community Edition.

## Overview

This repository demonstrates advanced automated testing techniques using Playwright. It covers two distinct flows:

- **Use Case 1 (UI Testing):** Simulates an end-to-end user journey navigating the Automation dashboard, creating a new Form, dragging elements onto the builder canvas, verifying properties, interacting with elements, and saving the form.
- **Use Case 2 (API Testing):** Bypasses the UI to directly interact with internal APIs. It authenticates, retrieves workspace details, creates a Form and a Process (Workflow), populates them with a payload graph, and logically links the files via dependency APIs.

## Tech Stack

- **Framework:** [Playwright](https://playwright.dev/)
- **Language:** TypeScript
- **Design Pattern:** Page Object Model (POM)
- **Environment:** Node.js (v18+)

## Prerequisites

Before getting started, ensure you have the following installed:

- Node.js (version 18 or higher)
- npm (Node Package Manager)
- An active Automation Anywhere Community Edition account

## Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd aa-community-automation
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Install Playwright browsers:**

   ```bash
   npx playwright install
   ```

4. **Configure environment variables:**
   - Copy the `.env.example` file to a new file named `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and fill in your credentials (`AA_USERNAME`, `AA_PASSWORD`, `AA_BASE_URL`). _Note: The API token for Use Case 2 is fetched dynamically during the test execution, so an explicit API token variable can be left blank unless otherwise needed._

## Running the Tests

Use the following npm scripts to execute the suites:

- **Run all tests (UI & API):**
  ```bash
  npm run test
  ```
- **Run only UI tests (Use Case 1):**
  ```bash
  npm run test:ui
  ```
- **Run only API tests (Use Case 2):**
  ```bash
  npm run test:api
  ```
- **Run UI tests in headed mode (visible browser):**
  ```bash
  npm run test:headed
  ```
- **View HTML Test Report:**
  ```bash
  npm run report
  ```

## Project Structure

```text
.
├── config/                     # Environment configuration and API endpoint mappings
│   └── endpoints.ts
├── fixtures/                   # Custom Playwright fixtures
│   └── authFixture.ts          # Provides an auto-authenticated loggedInPage object
├── pages/                      # Page Object Model (POM) classes
│   ├── BasePage.ts
│   ├── AutomationDashboardPage.ts
│   └── FormBuilderPage.ts
├── test-data/                  # Static test files (e.g., uploads, JSON payloads)
│   └── sample-upload.txt
├── tests/
│   ├── api/                    # API test specifications
│   │   └── processCreationFlow.spec.ts
│   └── ui/                     # UI test specifications
│       └── formUploadFlow.spec.ts
├── utils/                      # Helper utilities and API wrappers
│   ├── apiClient.ts
│   └── payloads.ts
├── .env.example                # Environment variables template
├── .gitignore
├── package.json
├── playwright.config.ts        # Global Playwright configuration (projects, retries, reporters)
└── README.md
```

## Design Decisions

- **Playwright over Cypress:** Playwright provides native multi-tab, multi-origin support, automatic waiting mechanisms, and deep network interception out of the box. Its seamless context-based API testing is vastly superior for a use case requiring parallel UI and API execution flows without brittle architectural workarounds.
- **Page Object Model (POM):** UI selectors and actions are centralized in the `/pages` directory. This makes the test files cleaner, focuses on test intent rather than implementation details, and drastically reduces maintenance overhead when the application UI changes.
- **Fixtures (`loggedInPage`):** Playwright fixtures completely abstract away repetitive setup. Rather than wrapping every test in `beforeEach` hooks or repeatedly typing `await loginPage.login()`, the fixture ensures that any test requesting `loggedInPage` is handed a fully authenticated browser state automatically.

## Environment & Configuration Notes

Since Automation Anywhere does not explicitly expose internal API documentation for the Form and Process builders, **the API endpoints utilized in Use Case 2 were reverse-engineered**.
This involved actively inspecting the browser DevTools "Network" tab during manual interaction with the live application, intercepting the request URLs, capturing the custom HTTP headers (like `X-Authorization`), and determining the exact JSON schema payloads required to simulate the frontend graph via backend requests.

## Known Limitations / Assumptions

- **Selector/Endpoint Fragility:** The DOM selectors and network endpoints mapped in this framework are based on the structure of the Automation Anywhere Community Edition at the time of authoring. Because Community Edition continuously updates, selectors and endpoints may need adjustment. Check the `TODO` comments throughout the codebase for markers on what to verify against the live DOM.
- **Canvas Drag-and-Drop:** Canvas interactions can occasionally be flaky depending on browser rendering speeds and implementation. The `dragElementToCanvas()` method deliberately uses explicit manual mouse movements (`mouse.down`, `mouse.move`) to maximize reliability over native drag-and-drop APIs.
