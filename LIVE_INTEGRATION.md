# Live Integration Guide

Currently, this repository operates entirely offline using a local Express mock server to validate logic, HTTP wrappers, and payload builders.

When you receive your Automation Anywhere Community Edition credentials, follow these steps to integrate with the live environment:

1. **Configure Environment Variables**
   Duplicate `.env.example` to `.env` and fill in:

   ```env
   USE_MOCK_API=false
   AA_USERNAME=your_real_email@domain.com
   AA_PASSWORD=your_real_password
   AA_BASE_URL=https://community.cloud.automationanywhere.digital
   ```

2. **Populate DOM Selectors**
   Open the application in a browser, use DevTools, and replace all `TODO: verify selector` comments inside the Page Objects (`/pages/`) with the actual accessibility locators (e.g., `getByRole('button', { name: 'Submit' })`).

3. **Populate API Contracts**
   Use the Network tab in DevTools to inspect the exact endpoints and JSON payloads the frontend sends when creating a form/process. Update `/utils/payloads.ts` and `/config/endpoints.ts` to match these live contracts.

4. **Run Live Tests**
   ```bash
   npm run test
   ```
