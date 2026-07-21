# Contributing

First off, thank you for considering contributing to the Automation Anywhere Community Challenge Playwright framework!

## Development Setup

1. Fork and clone the repository.
2. Run `npm install` to install dependencies.
3. Copy `.env.example` to `.env` and fill in your test credentials.
4. Run `npx playwright install` to ensure browsers are downloaded.

## Branching Strategy

- `main` is the stable release branch.
- Please create feature branches off `main` (e.g., `feature/add-new-test`).

## Pull Request Process

1. Ensure all tests pass (`npm test`).
2. Ensure linting and type checking pass (`npm run lint` and `npm run typecheck`).
3. Update the `README.md` or `CHANGELOG.md` with details of changes if applicable.
4. Submit the PR for review.

## Coding Standards

- Use strict TypeScript typing.
- Follow the Page Object Model (POM) for UI tests.
- Maintain separate logical boundaries for API and UI actions.
- Avoid hardcoded credentials or data (use `.env` or `test-data`).

Thank you for your contributions!
