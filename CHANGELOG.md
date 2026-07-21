# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - Foundation Built

### Added

- **Initial framework**: Configured Playwright with TypeScript.
- **POM**: Established Page Object Model architecture for the UI components.
- **Fixtures**: Implemented Playwright custom fixtures for authenticated session injection.
- **API Client**: Built a thin wrapper over Playwright's `APIRequestContext` for direct backend requests.
- **Mock Server**: Engineered an Express-based mock server to validate API payload generation offline.
- **Payload Builder**: Created strongly typed, pure-function payload generators for Forms and Processes.
- **README**: Created comprehensive project documentation.
- **Lint Fixes**: Integrated strict ESLint, Prettier, and Husky pre-commit checks.
- **Vitest Integration**: Integrated Vitest for rapid, isolated unit testing of the payload builders.
