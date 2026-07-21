import * as dotenv from 'dotenv';
dotenv.config();

const isMockMode = process.env.USE_MOCK_API === 'true';

export const API_BASE_URL = isMockMode
  ? 'http://localhost:4000'
  : process.env.AA_BASE_URL || 'https://my-live-control-room.com';

/**
 * API Endpoint Constants
 * TODO: Verify these exact paths by inspecting the Network tab in DevTools when using the live application.
 */
export const ENDPOINTS = {
  AUTH_LOGIN: `${API_BASE_URL}/v1/authentication`,
  GET_MY_FOLDER: `${API_BASE_URL}/v2/repository/workspaces/private`,
  CREATE_FILE: `${API_BASE_URL}/v2/repository/files`,
  SAVE_FILE_CONTENT: `${API_BASE_URL}/v2/repository/files/{fileId}/content`,
  SAVE_FILE_DEPENDENCIES: `${API_BASE_URL}/v2/repository/files/{fileId}/dependencies`
};
