# Automation Anywhere Community QA Framework

[![Playwright Tests](https://img.shields.io/github/actions/workflow/status/YOUR_GITHUB_USERNAME/aa-community-automation/tests.yml?branch=main&style=for-the-badge)](https://github.com/YOUR_GITHUB_USERNAME/aa-community-automation/actions/workflows/tests.yml)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=Playwright&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)

## Project Overview

An enterprise-grade, multi-layered automation framework built with Playwright and TypeScript, designed to automate complex UI and API workflows within the Automation Anywhere Community Edition.

## Enterprise Architecture

For an in-depth breakdown of the technical design, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Folder Structure

```text
/config         # Environment and endpoint configurations
/fixtures       # Playwright custom fixtures (e.g., authenticated sessions)
/mock-server    # Express server for offline API validation
/pages          # Page Object Model (POM) classes
/test-data      # Static assets and upload files
/tests
  ├── /api      # Headless API integration tests
  ├── /ui       # End-to-End browser tests
  └── /unit     # Pure function unit tests (Vitest)
/utils          # API clients, payload builders, and helpers
```

## Tech Stack

- **Engine**: Playwright
- **Language**: TypeScript (Strict Mode)
- **Unit Testing**: Vitest
- **Code Quality**: ESLint, Prettier, Husky, lint-staged
- **CI/CD**: GitHub Actions

## Features

- Strict Page Object Model pattern.
- Tri-level testing strategy (Unit, API, UI).
- Robust local Mock Server for offline validation.
- Pre-commit hooks for format and lint enforcement.
- Automated GitHub Actions pipeline.

## Installation

```bash
git clone <repo-url>
cd aa-community-automation
npm ci
npx playwright install --with-deps
```

## Environment Setup

Duplicate the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

_(See `LIVE_INTEGRATION.md` for live configuration details)._

## Execution Modes

### Mock Mode

Validates the API logic offline using a local Express server.

1. Run the server: `npm run mock-server`
2. Run the tests: `USE_MOCK_API=true npm run test:api`

### Live Mode

Interacts with the live Automation Anywhere application. Ensure `USE_MOCK_API=false` in `.env`.

## Running Tests

- **All Tests**: `npm run test`
- **UI Tests**: `npm run test:ui`
- **API Tests**: `npm run test:api`
- **Unit Tests**: `npm run test:unit`
- **UI Headed Mode**: `npm run test:headed`

## Reports

Playwright automatically generates HTML reports on failure. To view them manually:

```bash
npm run report
```

## CI/CD

A GitHub Actions workflow is included at `.github/workflows/tests.yml`. It automatically lints, type-checks, and runs the unit and mock API suites on every push to `main`.

## Documentation

- [Roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
