import client from '../client';

/**
 * Base API service for workspace-specific endpoints
 * Provides reusable utility functions for workspace-scoped resources
 */

/**
 * Creates a workspace-scoped path for API endpoints
 * @param {string} workspaceId - The workspace ID
 * @param {string} resource - The resource type (e.g., 'chatflows')
 * @param {string} resourceId - Optional resource ID for specific resource operations
 * @param {string} action - Optional action to perform on the resource
 * @returns {string} The formatted API path
 */
export const getWorkspacePath = (workspaceId, resource, resourceId = null, action = null) => {
  let path = `/workspaces/${workspaceId}/${resource}`;
  
  if (resourceId) {
    path += `/${resourceId}`;
  }
  
  if (action) {
    path += `/${action}`;
  }
  
  return path;
};

/**
 * Generic function to fetch all resources of a specific type in a workspace
 * @param {string} workspaceId - The workspace ID
 * @param {string} resource - The resource type (e.g., 'chatflows')
 * @param {Object} params - Optional query parameters
 * @returns {Promise<Array>} Promise resolving to an array of resources
 */
export const fetchWorkspaceResources = async (workspaceId, resource, params = {}) => {
  try {
    const path = getWorkspacePath(workspaceId, resource);
    const response = await client.get(path, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching workspace ${resource}:`, error);
    throw error;
  }
};

/**
 * Generic function to fetch a specific resource in a workspace
 * @param {string} workspaceId - The workspace ID
 * @param {string} resource - The resource type (e.g., 'chatflows')
 * @param {string} resourceId - The resource ID
 * @returns {Promise<Object>} Promise resolving to the resource object
 */
export const fetchWorkspaceResource = async (workspaceId, resource, resourceId) => {
  try {
    const path = getWorkspacePath(workspaceId, resource, resourceId);
    const response = await client.get(path);
    return response.data;
  } catch (error) {
    console.error(`Error fetching workspace ${resource}:`, error);
    throw error;
  }
};

/**
 * Generic function to create a resource in a workspace
 * @param {string} workspaceId - The workspace ID
 * @param {string} resource - The resource type (e.g., 'chatflows')
 * @param {Object} data - The resource data
 * @returns {Promise<Object>} Promise resolving to the created resource
 */
export const createWorkspaceResource = async (workspaceId, resource, data) => {
  try {
    const path = getWorkspacePath(workspaceId, resource);
    const response = await client.post(path, data);
    return response.data;
  } catch (error) {
    console.error(`Error creating workspace ${resource}:`, error);
    throw error;
  }
};

/**
 * Generic function to update a resource in a workspace
 * @param {string} workspaceId - The workspace ID
 * @param {string} resource - The resource type (e.g., 'chatflows')
 * @param {string} resourceId - The resource ID
 * @param {Object} data - The updated resource data
 * @returns {Promise<Object>} Promise resolving to the updated resource
 */
export const updateWorkspaceResource = async (workspaceId, resource, resourceId, data) => {
  try {
    const path = getWorkspacePath(workspaceId, resource, resourceId);
    const response = await client.put(path, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating workspace ${resource}:`, error);
    throw error;
  }
};

/**
 * Generic function to delete a resource in a workspace
 * @param {string} workspaceId - The workspace ID
 * @param {string} resource - The resource type (e.g., 'chatflows')
 * @param {string} resourceId - The resource ID
 * @returns {Promise<Object>} Promise resolving to the response data
 */
export const deleteWorkspaceResource = async (workspaceId, resource, resourceId) => {
  try {
    const path = getWorkspacePath(workspaceId, resource, resourceId);
    const response = await client.delete(path);
    return response.data;
  } catch (error) {
    console.error(`Error deleting workspace ${resource}:`, error);
    throw error;
  }
};

/**
 * Generic function to perform an action on a resource in a workspace
 * @param {string} workspaceId - The workspace ID
 * @param {string} resource - The resource type (e.g., 'chatflows')
 * @param {string} resourceId - The resource ID
 * @param {string} action - The action to perform
 * @param {Object} data - The data for the action
 * @param {Object} params - Optional query parameters
 * @returns {Promise<Object>} Promise resolving to the response data
 */
export const performWorkspaceResourceAction = async (workspaceId, resource, resourceId, action, data = {}, params = {}) => {
  try {
    const path = getWorkspacePath(workspaceId, resource, resourceId, action);
    const response = await client.post(path, data, { params });
    return response.data;
  } catch (error) {
    console.error(`Error performing ${action} on workspace ${resource}:`, error);
    throw error;
  }
};

export default {
  getWorkspacePath,
  fetchWorkspaceResources,
  fetchWorkspaceResource,
  createWorkspaceResource,
  updateWorkspaceResource,
  deleteWorkspaceResource,
  performWorkspaceResourceAction
};