import api from '../api';

/**
 * Fetches all credentials for a specific workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to an array of credentials
 */
export const fetchWorkspaceCredentials = async (workspaceId, options = {}) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/credentials`, { params: options });
    return response.data;
  } catch (error) {
    console.error('Error fetching workspace credentials:', error);
    throw error;
  }
};

/**
 * Fetches a single credential by ID within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} credentialId - The ID of the credential to fetch
 * @returns {Promise<Object>} Promise resolving to the credential object
 */
export const fetchWorkspaceCredential = async (workspaceId, credentialId) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/credentials/${credentialId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workspace credential:', error);
    throw error;
  }
};

/**
 * Creates a new credential within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} credentialData - The credential data to create
 * @returns {Promise<Object>} Promise resolving to the created credential
 */
export const createWorkspaceCredential = async (workspaceId, credentialData) => {
  try {
    const response = await api.post(`/api/v1/workspaces/${workspaceId}/credentials`, credentialData);
    return response.data;
  } catch (error) {
    console.error('Error creating workspace credential:', error);
    throw error;
  }
};

/**
 * Updates an existing credential within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} credentialId - The ID of the credential to update
 * @param {Object} credentialData - The updated credential data
 * @returns {Promise<Object>} Promise resolving to the updated credential
 */
export const updateWorkspaceCredential = async (workspaceId, credentialId, credentialData) => {
  try {
    const response = await api.put(`/api/v1/workspaces/${workspaceId}/credentials/${credentialId}`, credentialData);
    return response.data;
  } catch (error) {
    console.error('Error updating workspace credential:', error);
    throw error;
  }
};

/**
 * Deletes a credential from a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} credentialId - The ID of the credential to delete
 * @returns {Promise<Object>} Promise resolving to the response data
 */
export const deleteWorkspaceCredential = async (workspaceId, credentialId) => {
  try {
    const response = await api.delete(`/api/v1/workspaces/${workspaceId}/credentials/${credentialId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting workspace credential:', error);
    throw error;
  }
};

/**
 * Tests a credential within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} credentialId - The ID of the credential to test
 * @returns {Promise<Object>} Promise resolving to the test result
 */
export const testWorkspaceCredential = async (workspaceId, credentialId) => {
  try {
    const response = await api.post(`/api/v1/workspaces/${workspaceId}/credentials/${credentialId}/test`);
    return response.data;
  } catch (error) {
    console.error('Error testing workspace credential:', error);
    throw error;
  }
};

/**
 * Gets all available credential types for a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @returns {Promise<Array>} Promise resolving to array of credential types
 */
export const getWorkspaceCredentialTypes = async (workspaceId) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/credential-types`);
    return response.data;
  } catch (error) {
    console.error('Error getting workspace credential types:', error);
    throw error;
  }
};

/**
 * Gets credential type schema
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} credentialType - The type of credential
 * @returns {Promise<Object>} Promise resolving to schema for the credential type
 */
export const getCredentialTypeSchema = async (workspaceId, credentialType) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/credential-types/${credentialType}/schema`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting credential type schema:', error);
    throw error;
  }
};

/**
 * Revokes a credential within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} credentialId - The ID of the credential to revoke
 * @returns {Promise<Object>} Promise resolving to the success response
 */
export const revokeWorkspaceCredential = async (workspaceId, credentialId) => {
  try {
    const response = await api.post(`/api/v1/workspaces/${workspaceId}/credentials/${credentialId}/revoke`);
    return response.data;
  } catch (error) {
    console.error('Error revoking workspace credential:', error);
    throw error;
  }
};

/**
 * Gets usage information for a credential
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} credentialId - The ID of the credential
 * @returns {Promise<Object>} Promise resolving to usage information
 */
export const getCredentialUsage = async (workspaceId, credentialId) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/credentials/${credentialId}/usage`);
    return response.data;
  } catch (error) {
    console.error('Error getting credential usage:', error);
    throw error;
  }
};

/**
 * Gets secret verification status for a credential
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} credentialId - The ID of the credential
 * @returns {Promise<Object>} Promise resolving to verification status
 */
export const verifyCredentialSecrets = async (workspaceId, credentialId) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/credentials/${credentialId}/verify`);
    return response.data;
  } catch (error) {
    console.error('Error verifying credential secrets:', error);
    throw error;
  }
};

/**
 * Rotates credential secrets for a credential
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} credentialId - The ID of the credential
 * @param {Object} rotationData - Data required for rotation
 * @returns {Promise<Object>} Promise resolving to the rotated credential
 */
export const rotateCredentialSecrets = async (workspaceId, credentialId, rotationData) => {
  try {
    const response = await api.post(
      `/api/v1/workspaces/${workspaceId}/credentials/${credentialId}/rotate`,
      rotationData
    );
    return response.data;
  } catch (error) {
    console.error('Error rotating credential secrets:', error);
    throw error;
  }
};

// Export all functions as default export
export default {
  fetchWorkspaceCredentials,
  fetchWorkspaceCredential,
  createWorkspaceCredential,
  updateWorkspaceCredential,
  deleteWorkspaceCredential,
  testWorkspaceCredential,
  getWorkspaceCredentialTypes,
  getCredentialTypeSchema,
  revokeWorkspaceCredential,
  getCredentialUsage,
  verifyCredentialSecrets,
  rotateCredentialSecrets
};
