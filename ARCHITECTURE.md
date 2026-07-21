# Framework Architecture

This repository follows a multi-layered testing architecture to ensure stability, scalability, and speed.

## 1. Playwright (Core Engine)

Playwright is used as the core browser automation and API request engine. It provides out-of-the-box support for cross-browser testing, auto-waiting, network interception, and parallel execution.

## 2. Page Object Model (POM)

UI interaction logic is strictly decoupled from the test specifications. The `/pages` directory contains classes (e.g., `LoginPage`, `FormBuilderPage`) that encapsulate Playwright locators and actions. Test files only call high-level business methods (e.g., `login()`, `createNewForm()`).

## 3. API Client

The `/utils/apiClient.ts` class wraps Playwright's `APIRequestContext`. It centrally manages authentication tokens, common headers, and error handling for all backend API requests, keeping the API test specs clean and declarative.

## 4. Mock Server

To ensure test logic can be validated independently of external service availability, an Express server (`/mock-server`) acts as a local stub. When `USE_MOCK_API=true`, the API client automatically routes requests locally and bypasses live authentication.

## 5. Configuration

Environment variables drive the execution context. Playwright's configuration (`playwright.config.ts`) dynamically reads `.env` to determine execution variables like `baseURL`, browser headless mode, and CI parallelization strategies.

## 6. Test Layers

The framework explicitly segments tests into three distinct layers:

1. **Unit (`/tests/unit`)**: Vitest executes rapid assertions against pure functions and payload builders.
2. **API (`/tests/api`)**: Playwright's API context validates headless HTTP workflows and integrations.
3. **UI (`/tests/ui`)**: Playwright launches a browser to validate end-to-end user journeys through the DOM.
