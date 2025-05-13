import client from '../client';
import {
  fetchWorkspaceResources,
  fetchWorkspaceResource,
  createWorkspaceResource,
  updateWorkspaceResource,
  deleteWorkspaceResource,
  performWorkspaceResourceAction
} from './index';

/**
 * Fetches all chatflows for a specific workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to an array of chatflows
 */
export const fetchWorkspaceChatflows = (workspaceId, options = {}) => 
  fetchWorkspaceResources(workspaceId, 'chatflows', options);

/**
 * Fetches a single chatflow by ID within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} chatflowId - The ID of the chatflow to fetch
 * @returns {Promise<Object>} Promise resolving to the chatflow object
 */
export const fetchWorkspaceChatflow = (workspaceId, chatflowId) => 
  fetchWorkspaceResource(workspaceId, 'chatflows', chatflowId);

/**
 * Creates a new chatflow within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} chatflowData - The chatflow data to create
 * @returns {Promise<Object>} Promise resolving to the created chatflow
 */
export const createWorkspaceChatflow = (workspaceId, chatflowData) => 
  createWorkspaceResource(workspaceId, 'chatflows', chatflowData);

/**
 * Updates an existing chatflow within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} chatflowId - The ID of the chatflow to update
 * @param {Object} chatflowData - The updated chatflow data
 * @returns {Promise<Object>} Promise resolving to the updated chatflow
 */
export const updateWorkspaceChatflow = (workspaceId, chatflowId, chatflowData) => 
  updateWorkspaceResource(workspaceId, 'chatflows', chatflowId, chatflowData);

/**
 * Deletes a chatflow from a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} chatflowId - The ID of the chatflow to delete
 * @returns {Promise<Object>} Promise resolving to the response data
 */
export const deleteWorkspaceChatflow = (workspaceId, chatflowId) => 
  deleteWorkspaceResource(workspaceId, 'chatflows', chatflowId);

/**
 * Runs a chatflow within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} chatflowId - The ID of the chatflow to run
 * @param {Object} inputs - The inputs for the chatflow
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Object>} Promise resolving to the chatflow run result
 */
export const runWorkspaceChatflow = (workspaceId, chatflowId, inputs, options = {}) => 
  performWorkspaceResourceAction(workspaceId, 'chatflows', chatflowId, 'run', { inputs }, options);

/**
 * Exports a chatflow from a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} chatflowId - The ID of the chatflow to export
 * @returns {Promise<Object>} Promise resolving to the exported chatflow data
 */
export const exportWorkspaceChatflow = async (workspaceId, chatflowId) => {
  try {
    const response = await client.get(`/workspaces/${workspaceId}/chatflows/${chatflowId}/export`);
    return response.data;
  } catch (error) {
    console.error('Error exporting workspace chatflow:', error);
    throw error;
  }
};

/**
 * Imports a chatflow into a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} importData - The chatflow data to import
 * @returns {Promise<Object>} Promise resolving to the imported chatflow
 */
export const importWorkspaceChatflow = async (workspaceId, importData) => {
  try {
    const response = await client.post(`/workspaces/${workspaceId}/chatflows/import`, importData);
    return response.data;
  } catch (error) {
    console.error('Error importing workspace chatflow:', error);
    throw error;
  }
};

/**
 * Checks if a chatflow supports streaming in a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} chatflowId - The ID of the chatflow to check
 * @returns {Promise<Object>} Promise resolving to the streaming status
 */
export const getIsWorkspaceChatflowStreaming = async (workspaceId, chatflowId) => {
  try {
    const response = await client.get(`/workspaces/${workspaceId}/chatflows-streaming/${chatflowId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking workspace chatflow streaming:', error);
    throw error;
  }
};

/**
 * Checks if a chatflow allows file uploads in a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} chatflowId - The ID of the chatflow to check
 * @returns {Promise<Object>} Promise resolving to the uploads status
 */
export const getAllowWorkspaceChatflowUploads = async (workspaceId, chatflowId) => {
  try {
    const response = await client.get(`/workspaces/${workspaceId}/chatflows-uploads/${chatflowId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking workspace chatflow uploads:', error);
    throw error;
  }
};

// Export all functions as default export
export default {
  fetchWorkspaceChatflows,
  fetchWorkspaceChatflow,
  createWorkspaceChatflow,
  updateWorkspaceChatflow,
  deleteWorkspaceChatflow,
  runWorkspaceChatflow,
  exportWorkspaceChatflow,
  importWorkspaceChatflow,
  getIsWorkspaceChatflowStreaming,
  getAllowWorkspaceChatflowUploads
};