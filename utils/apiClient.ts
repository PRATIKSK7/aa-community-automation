import { APIRequestContext, APIResponse } from '@playwright/test';
import { BASE_URL, AUTH_ENDPOINT, ENDPOINTS } from '../config/endpoints';

/**
 * Reusable options interface for HTTP requests
 */
export interface RequestOptions {
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

export class ApiClient {
  private request: APIRequestContext;
  private token: string | null = null;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  /**
   * Validates required environment variables prior to making API calls.
   */
  private validateEnvironment(): void {
    const isMock = process.env.USE_MOCK_API === 'true';

    if (!BASE_URL || BASE_URL.includes('undefined')) {
      throw new Error('❌ BASE_URL is undefined. Please verify AA_BASE_URL in your .env file.');
    }

    if (!isMock) {
      if (!process.env.AA_USERNAME) {
        throw new Error('❌ AA_USERNAME is undefined. Please set AA_USERNAME in your .env file.');
      }
      if (!process.env.AA_PASSWORD) {
        throw new Error('❌ AA_PASSWORD is undefined. Please set AA_PASSWORD in your .env file.');
      }
    }
  }

  /**
   * Performs a lightweight pre-validation check against the auth endpoint before attempting login.
   */
  async validateEndpointHealth(): Promise<boolean> {
    try {
      const response = await this.request.get(AUTH_ENDPOINT, {
        headers: { Accept: 'application/json' }
      });

      if (response.status() === 404) {
        console.error(`\n❌ Endpoint Pre-validation Failed:
Expected: Authentication endpoint to respond with standard HTTP status (200, 400, 401, or 405)
Actual: HTTP 404 Not Found at ${AUTH_ENDPOINT}
Possible Fix: Verify AA_BASE_URL and update AUTH_ENDPOINT from deprecated v1 (/v1/authentication) to v2 (/v2/authentication).\n`);
        return false;
      }
      return true;
    } catch (err) {
      console.error(`\n❌ Endpoint Reachability Error:
Expected: Server at ${BASE_URL} to be reachable
Actual: Connection Failure - ${(err as Error).message}
Possible Fix: Ensure Control Room backend service is running and reachable.\n`);
      return false;
    }
  }

  /**
   * Returns standard headers, injecting authentication token when available.
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
    if (this.token) {
      headers['X-Authorization'] = this.token;
    }
    return headers;
  }

  /**
   * Structured logging for all outgoing API requests & incoming responses.
   */
  private async logInteraction(
    method: string,
    url: string,
    headers: Record<string, string>,
    body: unknown,
    response: APIResponse
  ): Promise<string> {
    const sanitizedHeaders = { ...headers };
    if (sanitizedHeaders['X-Authorization']) {
      sanitizedHeaders['X-Authorization'] = '[REDACTED_TOKEN]';
    }

    let sanitizedBody = body;
    if (body && typeof body === 'object' && 'password' in (body as Record<string, unknown>)) {
      sanitizedBody = { ...(body as Record<string, unknown>), password: '[REDACTED]' };
    }

    let resBodyText = '';
    try {
      resBodyText = await response.text();
    } catch {
      resBodyText = '[UNREADABLE_BODY]';
    }

    let formattedResBody = resBodyText;
    try {
      formattedResBody = JSON.stringify(JSON.parse(resBodyText), null, 2);
    } catch {
      // Keep raw string if non-JSON
    }

    console.log('\n==================================================');
    console.log('REQUEST');
    console.log('==================================================');
    console.log(`URL: ${url}`);
    console.log(`METHOD: ${method}`);
    console.log(`HEADERS: ${JSON.stringify(sanitizedHeaders, null, 2)}`);
    console.log(`BODY: ${sanitizedBody ? JSON.stringify(sanitizedBody, null, 2) : 'N/A'}`);
    console.log('==================================================');
    console.log('RESPONSE');
    console.log('==================================================');
    console.log(`STATUS: ${response.status()} ${response.statusText()}`);
    console.log(`HEADERS: ${JSON.stringify(response.headers(), null, 2)}`);
    console.log(`BODY: ${formattedResBody}`);
    console.log('==================================================\n');

    return resBodyText;
  }

  /**
   * Generic HTTP GET Request
   */
  async get(url: string, options?: RequestOptions): Promise<APIResponse> {
    const headers = { ...this.getHeaders(), ...(options?.headers || {}) };
    const response = await this.request.get(url, { headers, params: options?.params });
    await this.logInteraction('GET', url, headers, null, response);
    return response;
  }

  /**
   * Generic HTTP POST Request
   */
  async post(url: string, data: unknown, options?: RequestOptions): Promise<APIResponse> {
    const headers = { ...this.getHeaders(), ...(options?.headers || {}) };
    const response = await this.request.post(url, { headers, data, params: options?.params });
    await this.logInteraction('POST', url, headers, data, response);
    return response;
  }

  /**
   * Generic HTTP PUT Request
   */
  async put(url: string, data: unknown, options?: RequestOptions): Promise<APIResponse> {
    const headers = { ...this.getHeaders(), ...(options?.headers || {}) };
    const response = await this.request.put(url, { headers, data, params: options?.params });
    await this.logInteraction('PUT', url, headers, data, response);
    return response;
  }

  /**
   * Generic HTTP DELETE Request
   */
  async delete(url: string, options?: RequestOptions): Promise<APIResponse> {
    const headers = { ...this.getHeaders(), ...(options?.headers || {}) };
    const response = await this.request.delete(url, { headers, params: options?.params });
    await this.logInteraction('DELETE', url, headers, null, response);
    return response;
  }

  /*
   * ============================================================================
   * REUSABLE DOMAIN METHODS (TASK 6)
   * ============================================================================
   */

  /**
   * Authenticates the user and caches the auth token.
   */
  async authenticate(username?: string, password?: string): Promise<string> {
    this.validateEnvironment();

    console.log('--- Authentication Diagnostics ---');
    console.log(`AA_BASE_URL = ${process.env.AA_BASE_URL ? 'SET' : 'NOT SET'}`);
    console.log(`AA_API_URL = ${process.env.AA_API_URL ? 'SET' : 'NOT SET'}`);
    console.log(`AA_USERNAME = ${process.env.AA_USERNAME ? 'SET' : 'NOT SET'}`);
    console.log(`AA_PASSWORD = ${process.env.AA_PASSWORD ? 'SET' : 'NOT SET'}`);
    console.log('----------------------------------');

    if (process.env.USE_MOCK_API === 'true') {
      this.token = 'mock-jwt-token-123456789';
      return this.token;
    }

    const user = (username || process.env.AA_USERNAME || '').trim();
    const pass = (password || process.env.AA_PASSWORD || '').trim();

    if (!user || !pass) {
      throw new Error('❌ Username or password not provided for API auth.');
    }

    await this.validateEndpointHealth();

    // Strategy 1: Attempt standard local login (Password)
    let response = await this.post(AUTH_ENDPOINT, { username: user, password: pass });

    // Strategy 2: If SSO is enabled or an API Key was provided in the password field
    if (!response.ok()) {
      console.log('⚠️ Password Auth Failed. Attempting API Key Auth for SSO compatibility...');
      const apiKeyResponse = await this.post(AUTH_ENDPOINT, { username: user, apiKey: pass });
      if (apiKeyResponse.ok()) {
        response = apiKeyResponse;
      }
    }

    if (!response.ok()) {
      const resText = await response.text().catch(() => '');
      console.error('--- Authentication Failure Diagnostics ---');
      console.error(`Endpoint: ${AUTH_ENDPOINT}`);
      console.error(`Status: ${response.status()}`);
      console.error(`Status Text: ${response.statusText()}`);
      console.error(`Headers: ${JSON.stringify(response.headers(), null, 2)}`);
      console.error(`Response Body: ${resText}`);
      console.error('------------------------------------------');
      throw new Error(
        `❌ Authentication Failed\nSuggested Cause: Check credentials (ensure API Key is used if SSO is enabled) or Control Room identity provider status.`
      );
    }

    const resJson = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const token =
      (resJson.token as string) || (resJson.auth_token as string) || (resJson.jwt as string);

    if (!token) {
      throw new Error(
        `❌ Token not found in auth response payload. Received body: ${JSON.stringify(resJson)}`
      );
    }

    this.token = token;
    return this.token;
  }

  /**
   * Lists all items in the authenticated user's private workspace.
   */
  async listPrivateWorkspace(): Promise<Array<Record<string, unknown>>> {
    const response = await this.post(ENDPOINTS.GET_MY_FOLDER, {
      filter: {},
      sort: [{ field: 'name', direction: 'asc' }]
    });

    if (!response.ok()) {
      const resText = await response.text().catch(() => '');
      throw new Error(
        `❌ Private Workspace Retrieval Failed\nURL: ${ENDPOINTS.GET_MY_FOLDER}\nMETHOD: POST\nExpected: 200 OK\nReceived: ${response.status()} ${response.statusText()}\nResponse Body: ${resText}\nSuggested Cause: Ensure user has repository view permissions.`
      );
    }

    const body = (await response.json()) as Record<string, unknown>;
    const list = (body.list as Array<Record<string, unknown>>) || [];
    return list;
  }

  /**
   * Discovers the private workspace folder ID dynamically.
   */
  async getWorkspaceFolder(): Promise<string> {
    if (process.env.USE_MOCK_API === 'true') {
      return 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6';
    }

    const items = await this.listPrivateWorkspace();
    const folderItem =
      items.find((item) => item.folder === true && item.name === 'Bots') ||
      items.find((item) => item.folder === true) ||
      items[0];

    const folderId = (folderItem?.id as string) || (folderItem?.parentId as string);

    if (!folderId) {
      throw new Error(
        '❌ Unable to discover private workspace folder ID dynamically from workspace list.'
      );
    }

    return folderId;
  }

  /**
   * Creates a Form file shell in the target workspace folder.
   */
  async createForm(folderId: string, formName: string): Promise<string> {
    if (!folderId) throw new Error('❌ createForm failed: folderId parameter is required.');
    if (!formName) throw new Error('❌ createForm failed: formName parameter is required.');

    const response = await this.uploadFile(folderId, formName, 'application/vnd.aa.form');
    const body = (await response.json()) as Record<string, unknown>;
    const formId = body.id as string;

    if (!formId) {
      throw new Error(
        `❌ Form creation failed to return a valid file ID. Response: ${JSON.stringify(body)}`
      );
    }

    return formId;
  }

  /**
   * Creates a Process/Workflow file shell in the target workspace folder.
   */
  async createProcess(folderId: string, processName: string): Promise<string> {
    if (!folderId) throw new Error('❌ createProcess failed: folderId parameter is required.');
    if (!processName)
      throw new Error('❌ createProcess failed: processName parameter is required.');

    const response = await this.uploadFile(folderId, processName, 'application/vnd.aa.workflow');
    const body = (await response.json()) as Record<string, unknown>;
    const processId = body.id as string;

    if (!processId) {
      throw new Error(
        `❌ Process creation failed to return a valid file ID. Response: ${JSON.stringify(body)}`
      );
    }

    return processId;
  }

  /**
   * General file shell creation (Form, Process, Taskbot) supporting parentId query params & body parameters.
   */
  async uploadFile(folderId: string, name: string, contentType: string): Promise<APIResponse> {
    if (!folderId) throw new Error('❌ uploadFile failed: folderId parameter is required.');
    if (!name) throw new Error('❌ uploadFile failed: name parameter is required.');
    if (!contentType) throw new Error('❌ uploadFile failed: contentType parameter is required.');

    const folderIdNum = Number(folderId);
    const validParentId = isNaN(folderIdNum) ? folderId : folderIdNum;

    const payload = {
      name,
      contentType,
      parentFolderId: validParentId
    };

    console.log(`[ApiClient] Creating file '${name}' with contentType: ${contentType}`);

    // Create the file using the correct parentFolderId field
    const response = await this.post(ENDPOINTS.CREATE_FILE, payload);

    if (!response.ok()) {
      const resText = await response.text().catch(() => '');
      throw new Error(
        `❌ File Upload/Creation Failed\nURL: ${ENDPOINTS.CREATE_FILE}\nMETHOD: POST\nExpected: 200 or 201 Created\nReceived: ${response.status()} ${response.statusText()}\nResponse Body: ${resText}\nSuggested Cause: Verify parentFolderId parameter, folder permissions, or file name collisions.`
      );
    }

    return response;
  }

  /**
   * Saves graph content payload for a target file ID.
   */
  async saveFileContent(fileId: string, contentPayload: unknown): Promise<APIResponse> {
    if (!fileId) throw new Error('❌ saveFileContent failed: fileId parameter is required.');
    if (!contentPayload)
      throw new Error('❌ saveFileContent failed: contentPayload parameter is required.');

    const url = ENDPOINTS.SAVE_FILE_CONTENT.replace('{fileId}', fileId);
    const response = await this.put(url, contentPayload);

    if (!response.ok()) {
      const resText = await response.text().catch(() => '');
      throw new Error(
        `❌ Save File Content Failed\nURL: ${url}\nMETHOD: PUT\nExpected: 200 OK\nReceived: ${response.status()} ${response.statusText()}\nResponse Body: ${resText}\nSuggested Cause: Check content JSON schema integrity for file ID ${fileId}.`
      );
    }

    return response;
  }

  /**
   * Saves dependency links for a target file ID.
   */
  async saveFileDependencies(fileId: string, dependencyPayload: unknown): Promise<APIResponse> {
    if (!fileId) throw new Error('❌ saveFileDependencies failed: fileId parameter is required.');
    if (!dependencyPayload)
      throw new Error('❌ saveFileDependencies failed: dependencyPayload parameter is required.');

    const url = ENDPOINTS.SAVE_FILE_DEPENDENCIES.replace('{fileId}', fileId);
    const response = await this.put(url, dependencyPayload);

    if (!response.ok()) {
      const resText = await response.text().catch(() => '');
      throw new Error(
        `❌ Save File Dependencies Failed\nURL: ${url}\nMETHOD: PUT\nExpected: 200 OK\nReceived: ${response.status()} ${response.statusText()}\nResponse Body: ${resText}\nSuggested Cause: Check dependency file IDs or relationship schema for file ID ${fileId}.`
      );
    }

    return response;
  }

  /**
   * Deletes a file or directory resource by file ID.
   */
  async deleteResource(fileId: string): Promise<APIResponse> {
    if (!fileId) throw new Error('❌ deleteResource failed: fileId parameter is required.');

    const url = ENDPOINTS.DELETE_FILE.replace('{fileId}', fileId);
    const response = await this.delete(url);

    if (!response.ok()) {
      const resText = await response.text().catch(() => '');
      console.warn(
        `⚠️ Resource Deletion Non-Critical Warning\nURL: ${url}\nStatus: ${response.status()}\nMessage: ${resText}`
      );
    }

    return response;
  }
}
