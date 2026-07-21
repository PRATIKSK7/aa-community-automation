import { test, expect } from '@playwright/test';
import { ApiClient } from '../../utils/apiClient';
import { ENDPOINTS } from '../../config/endpoints';
import {
  buildFormContentPayload,
  buildProcessWorkflowPayload,
  buildDependencyPayload
} from '../../utils/payloads';

/*
 * ============================================================================
 * TODO: ENDPOINTS TO VERIFY VIA DEVTOOLS NETWORK TAB
 *
 * As internal endpoints aren't publicly documented, the following endpoints
 * defined in /config/endpoints.ts need to be verified against the live app:
 *
 * 1. AUTH_LOGIN: Endpoint for obtaining auth token
 * 2. GET_MY_FOLDER: Endpoint for retrieving private workspace folder ID
 * 3. CREATE_FILE: Endpoint for creating Form and Process shells
 * 4. SAVE_FILE_CONTENT: Endpoint for saving content graph payload
 * 5. SAVE_FILE_DEPENDENCIES: Endpoint for linking dependencies
 * ============================================================================
 */

test.describe('Use Case 2: Create a Process with a Form via API', () => {
  let apiClient: ApiClient;

  // Variables to pass state between steps
  let workspaceFolderId: string;
  let formFileId: string;
  let processFileId: string;

  test('Process Creation Flow via API', { tag: '@usecase2' }, async ({ request }) => {
    apiClient = new ApiClient(request);
    const timeStamp = Date.now();
    const formName = `API_Form_${timeStamp}`;
    const processName = `API_Process_${timeStamp}`;

    await test.step('1. Authenticate via API, capture auth token', async () => {
      const token = await apiClient.authenticate();
      expect(typeof token, 'Auth token should be a string').toBe('string');
      expect(token.length, 'Auth token should not be empty').toBeGreaterThan(0);
    });

    await test.step('2. Retrieve private workspace folder ID for authenticated user', async () => {
      const response = await apiClient.get(ENDPOINTS.GET_MY_FOLDER);
      expect(response.status(), 'GET folder should return 200').toBe(200);

      const body = await response.json();
      // TODO: Update body property based on actual response payload structure
      workspaceFolderId = body.id || body.list?.[0]?.id;
      expect(workspaceFolderId, 'Workspace folder ID should be retrieved').toBeTruthy();
    });

    await test.step('3. Create a Form file in private workspace', async () => {
      const response = await apiClient.post(ENDPOINTS.CREATE_FILE, {
        name: formName,
        parentId: workspaceFolderId,
        contentType: 'application/vnd.aa.form'
      });

      expect(response.status(), 'CREATE Form file should return 200 or 201').toBeGreaterThanOrEqual(
        200
      );
      expect(response.status(), 'CREATE Form file should return 200 or 201').toBeLessThan(300);

      const body = await response.json();
      formFileId = body.id;

      expect(typeof formFileId, 'Form File ID should be a string').toBe('string');
      expect(formFileId, 'Form File ID should be valid').toBeTruthy();
    });

    await test.step('4. Save form content with 3 fields: TextBox, TextArea, Number', async () => {
      const formContent = buildFormContentPayload(formName);
      const url = ENDPOINTS.SAVE_FILE_CONTENT.replace('{fileId}', formFileId);

      const response = await apiClient.put(url, formContent);
      expect(
        response.status(),
        'SAVE Form content should return 200 or 201'
      ).toBeGreaterThanOrEqual(200);
      expect(response.status(), 'SAVE Form content should return 200 or 201').toBeLessThan(300);

      const body = await response.json();
      expect(body, 'Save form content response should indicate success').toBeDefined();
    });

    await test.step("5. Save form's file dependencies", async () => {
      const formDependencies = buildDependencyPayload([]); // Form may have no dependencies of its own
      const url = ENDPOINTS.SAVE_FILE_DEPENDENCIES.replace('{fileId}', formFileId);

      const response = await apiClient.put(url, formDependencies);
      expect(
        response.status(),
        'SAVE Form dependencies should return 200 or 201'
      ).toBeGreaterThanOrEqual(200);
      expect(response.status(), 'SAVE Form dependencies should return 200 or 201').toBeLessThan(
        300
      );
    });

    await test.step('6. Create a Process file in private workspace', async () => {
      const response = await apiClient.post(ENDPOINTS.CREATE_FILE, {
        name: processName,
        parentId: workspaceFolderId,
        contentType: 'application/vnd.aa.workflow'
      });

      expect(
        response.status(),
        'CREATE Process file should return 200 or 201'
      ).toBeGreaterThanOrEqual(200);
      expect(response.status(), 'CREATE Process file should return 200 or 201').toBeLessThan(300);

      const body = await response.json();
      processFileId = body.id;

      expect(typeof processFileId, 'Process File ID should be a string').toBe('string');
      expect(processFileId, 'Process File ID should be valid').toBeTruthy();
    });

    await test.step('7. Save process content (InitialStep -> FormStep -> exit)', async () => {
      const processContent = buildProcessWorkflowPayload(formFileId);

      // Explicit assertion verifying the payload sent actually referenced the formFileId
      expect(
        processContent.nodes[0].formId,
        'InitialStep should reference the correct formFileId'
      ).toBe(formFileId);
      expect(
        processContent.nodes[1].formId,
        'FormStep should reference the correct formFileId'
      ).toBe(formFileId);

      const url = ENDPOINTS.SAVE_FILE_CONTENT.replace('{fileId}', processFileId);
      const response = await apiClient.put(url, processContent);

      expect(
        response.status(),
        'SAVE Process content should return 200 or 201'
      ).toBeGreaterThanOrEqual(200);
      expect(response.status(), 'SAVE Process content should return 200 or 201').toBeLessThan(300);

      const body = await response.json();
      expect(body, 'Save process content response should indicate success').toBeDefined();
    });

    await test.step("8. Save process's file dependencies, linking the form", async () => {
      const processDependencies = buildDependencyPayload([formFileId]);

      // Explicit assertion that dependency list includes form file id
      expect(
        processDependencies.dependencies,
        'Process dependencies must include the form file ID'
      ).toContain(formFileId);

      const url = ENDPOINTS.SAVE_FILE_DEPENDENCIES.replace('{fileId}', processFileId);
      const response = await apiClient.put(url, processDependencies);

      expect(
        response.status(),
        'SAVE Process dependencies should return 200 or 201'
      ).toBeGreaterThanOrEqual(200);
      expect(response.status(), 'SAVE Process dependencies should return 200 or 201').toBeLessThan(
        300
      );
    });
  });
});
