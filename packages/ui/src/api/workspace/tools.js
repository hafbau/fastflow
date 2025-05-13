import api from '../api';

/**
 * Fetches all tools for a specific workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to an array of tools
 */
export const fetchWorkspaceTools = async (workspaceId, options = {}) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/tools`, { params: options });
    return response.data;
  } catch (error) {
    console.error('Error fetching workspace tools:', error);
    throw error;
  }
};

/**
 * Fetches a single tool by ID within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} toolId - The ID of the tool to fetch
 * @returns {Promise<Object>} Promise resolving to the tool object
 */
export const fetchWorkspaceTool = async (workspaceId, toolId) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/tools/${toolId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workspace tool:', error);
    throw error;
  }
};

/**
 * Creates a new tool within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} toolData - The tool data to create
 * @returns {Promise<Object>} Promise resolving to the created tool
 */
export const createWorkspaceTool = async (workspaceId, toolData) => {
  try {
    const response = await api.post(`/api/v1/workspaces/${workspaceId}/tools`, toolData);
    return response.data;
  } catch (error) {
    console.error('Error creating workspace tool:', error);
    throw error;
  }
};

/**
 * Updates an existing tool within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} toolId - The ID of the tool to update
 * @param {Object} toolData - The updated tool data
 * @returns {Promise<Object>} Promise resolving to the updated tool
 */
export const updateWorkspaceTool = async (workspaceId, toolId, toolData) => {
  try {
    const response = await api.put(`/api/v1/workspaces/${workspaceId}/tools/${toolId}`, toolData);
    return response.data;
  } catch (error) {
    console.error('Error updating workspace tool:', error);
    throw error;
  }
};

/**
 * Deletes a tool from a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} toolId - The ID of the tool to delete
 * @returns {Promise<Object>} Promise resolving to the response data
 */
export const deleteWorkspaceTool = async (workspaceId, toolId) => {
  try {
    const response = await api.delete(`/api/v1/workspaces/${workspaceId}/tools/${toolId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting workspace tool:', error);
    throw error;
  }
};

/**
 * Tests a tool within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} toolId - The ID of the tool to test
 * @param {Object} testData - The test inputs and parameters
 * @returns {Promise<Object>} Promise resolving to the test result
 */
export const testWorkspaceTool = async (workspaceId, toolId, testData) => {
  try {
    const response = await api.post(`/api/v1/workspaces/${workspaceId}/tools/${toolId}/test`, testData);
    return response.data;
  } catch (error) {
    console.error('Error testing workspace tool:', error);
    throw error;
  }
};

/**
 * Gets execution history for a specific tool
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} toolId - The ID of the tool
 * @param {Object} options - Additional options for the request (pagination, filtering)
 * @returns {Promise<Array>} Promise resolving to array of executions
 */
export const getToolExecutionHistory = async (workspaceId, toolId, options = {}) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/tools/${toolId}/executions`,
      { params: options }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting tool execution history:', error);
    throw error;
  }
};

/**
 * Gets tool execution details by execution ID
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} toolId - The ID of the tool
 * @param {string} executionId - The ID of the execution
 * @returns {Promise<Object>} Promise resolving to execution details
 */
export const getToolExecutionDetails = async (workspaceId, toolId, executionId) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/tools/${toolId}/executions/${executionId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting tool execution details:', error);
    throw error;
  }
};

/**
 * Gets available tool templates within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to array of templates
 */
export const getWorkspaceToolTemplates = async (workspaceId, options = {}) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/tool-templates`, { params: options });
    return response.data;
  } catch (error) {
    console.error('Error getting workspace tool templates:', error);
    throw error;
  }
};

/**
 * Creates a tool from a template
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} templateId - The ID of the template to use
 * @param {Object} customizationData - Custom properties to override template defaults
 * @returns {Promise<Object>} Promise resolving to the created tool
 */
export const createToolFromTemplate = async (workspaceId, templateId, customizationData = {}) => {
  try {
    const response = await api.post(
      `/api/v1/workspaces/${workspaceId}/tool-templates/${templateId}/create`, 
      customizationData
    );
    return response.data;
  } catch (error) {
    console.error('Error creating tool from template:', error);
    throw error;
  }
};

/**
 * Gets tool usage statistics
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} toolId - The ID of the tool
 * @param {Object} options - Options for date range, etc.
 * @returns {Promise<Object>} Promise resolving to usage statistics
 */
export const getToolUsageStats = async (workspaceId, toolId, options = {}) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/tools/${toolId}/usage`,
      { params: options }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting tool usage statistics:', error);
    throw error;
  }
};

// Export all functions as default export
export default {
  fetchWorkspaceTools,
  fetchWorkspaceTool,
  createWorkspaceTool,
  updateWorkspaceTool,
  deleteWorkspaceTool,
  testWorkspaceTool,
  getToolExecutionHistory,
  getToolExecutionDetails,
  getWorkspaceToolTemplates,
  createToolFromTemplate,
  getToolUsageStats
};
