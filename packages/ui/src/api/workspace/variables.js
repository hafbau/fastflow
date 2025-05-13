import api from '../api';

/**
 * Fetches all variables for a specific workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to an array of variables
 */
export const fetchWorkspaceVariables = async (workspaceId, options = {}) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/variables`, { params: options });
    return response.data;
  } catch (error) {
    console.error('Error fetching workspace variables:', error);
    throw error;
  }
};

/**
 * Fetches a single variable by ID within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} variableId - The ID of the variable to fetch
 * @returns {Promise<Object>} Promise resolving to the variable object
 */
export const fetchWorkspaceVariable = async (workspaceId, variableId) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/variables/${variableId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workspace variable:', error);
    throw error;
  }
};

/**
 * Fetches a variable by key within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} key - The key of the variable to fetch
 * @returns {Promise<Object>} Promise resolving to the variable object
 */
export const fetchWorkspaceVariableByKey = async (workspaceId, key) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/variables/key/${encodeURIComponent(key)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workspace variable by key:', error);
    throw error;
  }
};

/**
 * Creates a new variable within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} variableData - The variable data to create
 * @returns {Promise<Object>} Promise resolving to the created variable
 */
export const createWorkspaceVariable = async (workspaceId, variableData) => {
  try {
    const response = await api.post(`/api/v1/workspaces/${workspaceId}/variables`, variableData);
    return response.data;
  } catch (error) {
    console.error('Error creating workspace variable:', error);
    throw error;
  }
};

/**
 * Updates an existing variable within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} variableId - The ID of the variable to update
 * @param {Object} variableData - The updated variable data
 * @returns {Promise<Object>} Promise resolving to the updated variable
 */
export const updateWorkspaceVariable = async (workspaceId, variableId, variableData) => {
  try {
    const response = await api.put(`/api/v1/workspaces/${workspaceId}/variables/${variableId}`, variableData);
    return response.data;
  } catch (error) {
    console.error('Error updating workspace variable:', error);
    throw error;
  }
};

/**
 * Deletes a variable from a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} variableId - The ID of the variable to delete
 * @returns {Promise<Object>} Promise resolving to the response data
 */
export const deleteWorkspaceVariable = async (workspaceId, variableId) => {
  try {
    const response = await api.delete(`/api/v1/workspaces/${workspaceId}/variables/${variableId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting workspace variable:', error);
    throw error;
  }
};

/**
 * Bulk creates or updates variables within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Array<Object>} variablesData - Array of variable objects to create/update
 * @returns {Promise<Array>} Promise resolving to the created/updated variables
 */
export const bulkUpsertWorkspaceVariables = async (workspaceId, variablesData) => {
  try {
    const response = await api.post(`/api/v1/workspaces/${workspaceId}/variables/bulk`, variablesData);
    return response.data;
  } catch (error) {
    console.error('Error bulk upserting workspace variables:', error);
    throw error;
  }
};

/**
 * Imports variables into a workspace from a file
 * @param {string} workspaceId - The ID of the workspace
 * @param {FormData} formData - Form data with the file to import
 * @param {Object} options - Import options (e.g., overwrite existing)
 * @returns {Promise<Object>} Promise resolving to the import result
 */
export const importWorkspaceVariables = async (workspaceId, formData, options = {}) => {
  try {
    const response = await api.post(
      `/api/v1/workspaces/${workspaceId}/variables/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: options,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error importing workspace variables:', error);
    throw error;
  }
};

/**
 * Exports variables from a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} options - Export options (e.g., format, includeSecrets)
 * @returns {Promise<Blob>} Promise resolving to the exported data as a blob
 */
export const exportWorkspaceVariables = async (workspaceId, options = {}) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/variables/export`,
      {
        params: options,
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error exporting workspace variables:', error);
    throw error;
  }
};

/**
 * Gets usage information for a variable
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} variableId - The ID of the variable
 * @returns {Promise<Object>} Promise resolving to usage information
 */
export const getWorkspaceVariableUsage = async (workspaceId, variableId) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/variables/${variableId}/usage`);
    return response.data;
  } catch (error) {
    console.error('Error getting variable usage:', error);
    throw error;
  }
};

/**
 * Gets variables by category
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} category - The variable category
 * @returns {Promise<Array>} Promise resolving to array of variables in the category
 */
export const getWorkspaceVariablesByCategory = async (workspaceId, category) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/variables/category/${encodeURIComponent(category)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting variables by category:', error);
    throw error;
  }
};

/**
 * Gets all variable categories in a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @returns {Promise<Array>} Promise resolving to array of category names
 */
export const getWorkspaceVariableCategories = async (workspaceId) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/variable-categories`);
    return response.data;
  } catch (error) {
    console.error('Error getting variable categories:', error);
    throw error;
  }
};

// Export all functions as default export
export default {
  fetchWorkspaceVariables,
  fetchWorkspaceVariable,
  fetchWorkspaceVariableByKey,
  createWorkspaceVariable,
  updateWorkspaceVariable,
  deleteWorkspaceVariable,
  bulkUpsertWorkspaceVariables,
  importWorkspaceVariables,
  exportWorkspaceVariables,
  getWorkspaceVariableUsage,
  getWorkspaceVariablesByCategory,
  getWorkspaceVariableCategories
};
