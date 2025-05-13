import api from '../api';

/**
 * Fetches all agentflows for a specific workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to an array of agentflows
 */
export const fetchWorkspaceAgentflows = async (workspaceId, options = {}) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/agentflows`, { params: options });
    return response.data;
  } catch (error) {
    console.error('Error fetching workspace agentflows:', error);
    throw error;
  }
};

/**
 * Fetches a single agentflow by ID within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} agentflowId - The ID of the agentflow to fetch
 * @returns {Promise<Object>} Promise resolving to the agentflow object
 */
export const fetchWorkspaceAgentflow = async (workspaceId, agentflowId) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/agentflows/${agentflowId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workspace agentflow:', error);
    throw error;
  }
};

/**
 * Creates a new agentflow within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} agentflowData - The agentflow data to create
 * @returns {Promise<Object>} Promise resolving to the created agentflow
 */
export const createWorkspaceAgentflow = async (workspaceId, agentflowData) => {
  try {
    const response = await api.post(`/api/v1/workspaces/${workspaceId}/agentflows`, agentflowData);
    return response.data;
  } catch (error) {
    console.error('Error creating workspace agentflow:', error);
    throw error;
  }
};

/**
 * Updates an existing agentflow within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} agentflowId - The ID of the agentflow to update
 * @param {Object} agentflowData - The updated agentflow data
 * @returns {Promise<Object>} Promise resolving to the updated agentflow
 */
export const updateWorkspaceAgentflow = async (workspaceId, agentflowId, agentflowData) => {
  try {
    const response = await api.put(`/api/v1/workspaces/${workspaceId}/agentflows/${agentflowId}`, agentflowData);
    return response.data;
  } catch (error) {
    console.error('Error updating workspace agentflow:', error);
    throw error;
  }
};

/**
 * Deletes an agentflow from a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} agentflowId - The ID of the agentflow to delete
 * @returns {Promise<Object>} Promise resolving to the response data
 */
export const deleteWorkspaceAgentflow = async (workspaceId, agentflowId) => {
  try {
    const response = await api.delete(`/api/v1/workspaces/${workspaceId}/agentflows/${agentflowId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting workspace agentflow:', error);
    throw error;
  }
};

/**
 * Runs an agentflow within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} agentflowId - The ID of the agentflow to run
 * @param {Object} inputs - The inputs for the agentflow
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Object>} Promise resolving to the agentflow run result
 */
export const runWorkspaceAgentflow = async (workspaceId, agentflowId, inputs, options = {}) => {
  try {
    const response = await api.post(
      `/api/v1/workspaces/${workspaceId}/agentflows/${agentflowId}/run`,
      { inputs },
      { params: options }
    );
    return response.data;
  } catch (error) {
    console.error('Error running workspace agentflow:', error);
    throw error;
  }
};

/**
 * Exports an agentflow from a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} agentflowId - The ID of the agentflow to export
 * @returns {Promise<Object>} Promise resolving to the exported agentflow data
 */
export const exportWorkspaceAgentflow = async (workspaceId, agentflowId) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/agentflows/${agentflowId}/export`);
    return response.data;
  } catch (error) {
    console.error('Error exporting workspace agentflow:', error);
    throw error;
  }
};

/**
 * Imports an agentflow into a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} importData - The agentflow data to import
 * @returns {Promise<Object>} Promise resolving to the imported agentflow
 */
export const importWorkspaceAgentflow = async (workspaceId, importData) => {
  try {
    const response = await api.post(`/api/v1/workspaces/${workspaceId}/agentflows/import`, importData);
    return response.data;
  } catch (error) {
    console.error('Error importing workspace agentflow:', error);
    throw error;
  }
};

/**
 * Gets agent executions for an agentflow within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} agentflowId - The ID of the agentflow
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to array of agent executions
 */
export const getWorkspaceAgentExecutions = async (workspaceId, agentflowId, options = {}) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/agentflows/${agentflowId}/executions`,
      { params: options }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting agent executions:', error);
    throw error;
  }
};

// Export all functions as default export
export default {
  fetchWorkspaceAgentflows,
  fetchWorkspaceAgentflow,
  createWorkspaceAgentflow,
  updateWorkspaceAgentflow,
  deleteWorkspaceAgentflow,
  runWorkspaceAgentflow,
  exportWorkspaceAgentflow,
  importWorkspaceAgentflow,
  getWorkspaceAgentExecutions
};
