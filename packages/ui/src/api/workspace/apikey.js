import api from '../api';

/**
 * Fetches all API keys for a specific workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to an array of API keys
 */
export const fetchWorkspaceApiKeys = async (workspaceId, options = {}) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/api-keys`, { params: options });
    return response.data;
  } catch (error) {
    console.error('Error fetching workspace API keys:', error);
    throw error;
  }
};

/**
 * Fetches a single API key by ID within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} keyId - The ID of the API key to fetch
 * @returns {Promise<Object>} Promise resolving to the API key object
 */
export const fetchWorkspaceApiKey = async (workspaceId, keyId) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/api-keys/${keyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workspace API key:', error);
    throw error;
  }
};

/**
 * Creates a new API key within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} keyData - The API key data to create
 * @returns {Promise<Object>} Promise resolving to the created API key
 */
export const createWorkspaceApiKey = async (workspaceId, keyData) => {
  try {
    const response = await api.post(`/api/v1/workspaces/${workspaceId}/api-keys`, keyData);
    return response.data;
  } catch (error) {
    console.error('Error creating workspace API key:', error);
    throw error;
  }
};

/**
 * Updates an existing API key within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} keyId - The ID of the API key to update
 * @param {Object} keyData - The updated API key data
 * @returns {Promise<Object>} Promise resolving to the updated API key
 */
export const updateWorkspaceApiKey = async (workspaceId, keyId, keyData) => {
  try {
    const response = await api.put(`/api/v1/workspaces/${workspaceId}/api-keys/${keyId}`, keyData);
    return response.data;
  } catch (error) {
    console.error('Error updating workspace API key:', error);
    throw error;
  }
};

/**
 * Deletes an API key from a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} keyId - The ID of the API key to delete
 * @returns {Promise<Object>} Promise resolving to the response data
 */
export const deleteWorkspaceApiKey = async (workspaceId, keyId) => {
  try {
    const response = await api.delete(`/api/v1/workspaces/${workspaceId}/api-keys/${keyId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting workspace API key:', error);
    throw error;
  }
};

/**
 * Revokes an API key within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} keyId - The ID of the API key to revoke
 * @returns {Promise<Object>} Promise resolving to the revocation result
 */
export const revokeWorkspaceApiKey = async (workspaceId, keyId) => {
  try {
    const response = await api.post(`/api/v1/workspaces/${workspaceId}/api-keys/${keyId}/revoke`);
    return response.data;
  } catch (error) {
    console.error('Error revoking workspace API key:', error);
    throw error;
  }
};

/**
 * Regenerates an API key within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} keyId - The ID of the API key to regenerate
 * @returns {Promise<Object>} Promise resolving to the regenerated API key
 */
export const regenerateWorkspaceApiKey = async (workspaceId, keyId) => {
  try {
    const response = await api.post(`/api/v1/workspaces/${workspaceId}/api-keys/${keyId}/regenerate`);
    return response.data;
  } catch (error) {
    console.error('Error regenerating workspace API key:', error);
    throw error;
  }
};

/**
 * Gets usage information for an API key
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} keyId - The ID of the API key
 * @param {Object} options - Additional options for the request (date range, etc.)
 * @returns {Promise<Object>} Promise resolving to usage information
 */
export const getApiKeyUsage = async (workspaceId, keyId, options = {}) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/api-keys/${keyId}/usage`,
      { params: options }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting API key usage:', error);
    throw error;
  }
};

/**
 * Gets available API key scopes for a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @returns {Promise<Array>} Promise resolving to array of available scopes
 */
export const getWorkspaceApiKeyScopes = async (workspaceId) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/api-key-scopes`);
    return response.data;
  } catch (error) {
    console.error('Error getting workspace API key scopes:', error);
    throw error;
  }
};

/**
 * Checks if an API key is valid
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} apiKey - The API key to validate
 * @returns {Promise<Object>} Promise resolving to validation result
 */
export const validateWorkspaceApiKey = async (workspaceId, apiKey) => {
  try {
    const response = await api.post(`/api/v1/workspaces/${workspaceId}/api-keys/validate`, { apiKey });
    return response.data;
  } catch (error) {
    console.error('Error validating workspace API key:', error);
    throw error;
  }
};

/**
 * Gets a list of API key events (e.g., creation, revocation, usage)
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} keyId - The ID of the API key
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to array of events
 */
export const getApiKeyEvents = async (workspaceId, keyId, options = {}) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/api-keys/${keyId}/events`,
      { params: options }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting API key events:', error);
    throw error;
  }
};

/**
 * Updates permissions for an API key
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} keyId - The ID of the API key
 * @param {Object} permissionsData - The permissions to update
 * @returns {Promise<Object>} Promise resolving to the updated permissions
 */
export const updateApiKeyPermissions = async (workspaceId, keyId, permissionsData) => {
  try {
    const response = await api.put(
      `/api/v1/workspaces/${workspaceId}/api-keys/${keyId}/permissions`,
      permissionsData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating API key permissions:', error);
    throw error;
  }
};
