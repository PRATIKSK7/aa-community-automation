import * as dotenv from 'dotenv';
dotenv.config();

const isMockMode = process.env.USE_MOCK_API === 'true';

/**
 * Centralized API Configuration & Base URL
 * Cleans trailing slashes to prevent fragile URL concatenation errors.
 */
export const BASE_URL = (
  isMockMode
    ? 'http://localhost:4000'
    : process.env.AA_BASE_URL || 'https://community.cloud.automationanywhere.digital'
).replace(/\/+$/, '');

export const API_VERSION_V1 = 'v1';
export const API_VERSION_V2 = 'v2';

/**
 * Automation Anywhere A360 Authentication Endpoint (v2)
 */
export const AUTH_ENDPOINT = `${BASE_URL}/${API_VERSION_V2}/authentication`;

/**
 * Centralized API Endpoint Registry
 */
export const ENDPOINTS = {
  AUTH_LOGIN: AUTH_ENDPOINT,
  GET_MY_FOLDER: `${BASE_URL}/${API_VERSION_V2}/repository/workspaces/private/files/list`,
  CREATE_FILE: `${BASE_URL}/${API_VERSION_V2}/repository/files`,
  SAVE_FILE_CONTENT: `${BASE_URL}/${API_VERSION_V2}/repository/files/{fileId}/content`,
  SAVE_FILE_DEPENDENCIES: `${BASE_URL}/${API_VERSION_V2}/repository/files/{fileId}/dependencies`,
  DELETE_FILE: `${BASE_URL}/${API_VERSION_V2}/repository/files/{fileId}`
} as const;
