import { APIRequestContext } from '@playwright/test';
import { ENDPOINTS } from '../config/endpoints';

export class ApiClient {
  private request: APIRequestContext;
  private token: string | null = null;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  /**
   * Authenticates the user and caches the auth token.
   */
  async authenticate(username?: string, password?: string): Promise<string> {
    if (process.env.USE_MOCK_API === 'true') {
      this.token = 'mock-jwt-token-123456789';
      return this.token;
    }

    const user = username || process.env.AA_USERNAME;
    const pass = password || process.env.AA_PASSWORD;

    if (!user || !pass) {
      throw new Error('Username or password not provided for API auth');
    }

    const response = await this.request.post(ENDPOINTS.AUTH_LOGIN, {
      data: {
        username: user,
        password: pass
      }
    });

    if (!response.ok()) {
      throw new Error(`Authentication failed: ${response.status()} ${response.statusText()}`);
    }

    const body = await response.json();
    // TODO: Verify exact token field name from auth response (e.g., token, auth_token, jwt)
    this.token = body.token;

    if (!this.token) {
      throw new Error('Token not found in auth response payload');
    }

    return this.token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
    if (this.token) {
      // TODO: Verify auth header format (e.g. 'Authorization': `Bearer ${this.token}` or 'X-Authorization')
      headers['X-Authorization'] = this.token;
    }
    return headers;
  }

  async get(url: string, params?: Record<string, string | number | boolean>) {
    return this.request.get(url, { headers: this.getHeaders(), params });
  }

  async post(url: string, data: unknown) {
    return this.request.post(url, { headers: this.getHeaders(), data });
  }

  async put(url: string, data: unknown) {
    return this.request.put(url, { headers: this.getHeaders(), data });
  }
}
