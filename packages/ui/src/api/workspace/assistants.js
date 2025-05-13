import api from '../api';

/**
 * Fetches all assistants for a specific workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to an array of assistants
 */
export const fetchWorkspaceAssistants = async (workspaceId, options = {}) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/assistants`, { params: options });
    return response.data;
  } catch (error) {
    console.error('Error fetching workspace assistants:', error);
    throw error;
  }
};

/**
 * Fetches a single assistant by ID within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} assistantId - The ID of the assistant to fetch
 * @returns {Promise<Object>} Promise resolving to the assistant object
 */
export const fetchWorkspaceAssistant = async (workspaceId, assistantId) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/assistants/${assistantId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workspace assistant:', error);
    throw error;
  }
};

/**
 * Creates a new assistant within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} assistantData - The assistant data to create
 * @returns {Promise<Object>} Promise resolving to the created assistant
 */
export const createWorkspaceAssistant = async (workspaceId, assistantData) => {
  try {
    const response = await api.post(`/api/v1/workspaces/${workspaceId}/assistants`, assistantData);
    return response.data;
  } catch (error) {
    console.error('Error creating workspace assistant:', error);
    throw error;
  }
};

/**
 * Updates an existing assistant within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} assistantId - The ID of the assistant to update
 * @param {Object} assistantData - The updated assistant data
 * @returns {Promise<Object>} Promise resolving to the updated assistant
 */
export const updateWorkspaceAssistant = async (workspaceId, assistantId, assistantData) => {
  try {
    const response = await api.put(`/api/v1/workspaces/${workspaceId}/assistants/${assistantId}`, assistantData);
    return response.data;
  } catch (error) {
    console.error('Error updating workspace assistant:', error);
    throw error;
  }
};

/**
 * Deletes an assistant from a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} assistantId - The ID of the assistant to delete
 * @returns {Promise<Object>} Promise resolving to the response data
 */
export const deleteWorkspaceAssistant = async (workspaceId, assistantId) => {
  try {
    const response = await api.delete(`/api/v1/workspaces/${workspaceId}/assistants/${assistantId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting workspace assistant:', error);
    throw error;
  }
};

/**
 * Starts a chat session with an assistant
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} assistantId - The ID of the assistant
 * @returns {Promise<Object>} Promise resolving to the chat session data
 */
export const startAssistantChat = async (workspaceId, assistantId) => {
  try {
    const response = await api.post(`/api/v1/workspaces/${workspaceId}/assistants/${assistantId}/chat`);
    return response.data;
  } catch (error) {
    console.error('Error starting assistant chat:', error);
    throw error;
  }
};

/**
 * Sends a message to an assistant in a chat session
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} assistantId - The ID of the assistant
 * @param {string} chatId - The ID of the chat session
 * @param {Object} message - The message to send
 * @returns {Promise<Object>} Promise resolving to the assistant's response
 */
export const sendAssistantMessage = async (workspaceId, assistantId, chatId, message) => {
  try {
    const response = await api.post(
      `/api/v1/workspaces/${workspaceId}/assistants/${assistantId}/chat/${chatId}/messages`, 
      message
    );
    return response.data;
  } catch (error) {
    console.error('Error sending message to assistant:', error);
    throw error;
  }
};

/**
 * Gets chat history for a specific chat session
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} assistantId - The ID of the assistant
 * @param {string} chatId - The ID of the chat session
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to array of chat messages
 */
export const getAssistantChatHistory = async (workspaceId, assistantId, chatId, options = {}) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/assistants/${assistantId}/chat/${chatId}/messages`,
      { params: options }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting assistant chat history:', error);
    throw error;
  }
};

/**
 * Gets all chat sessions for an assistant
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} assistantId - The ID of the assistant
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to array of chat sessions
 */
export const getAssistantChatSessions = async (workspaceId, assistantId, options = {}) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/assistants/${assistantId}/chats`,
      { params: options }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting assistant chat sessions:', error);
    throw error;
  }
};

/**
 * Gets all files associated with an assistant
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} assistantId - The ID of the assistant
 * @returns {Promise<Array>} Promise resolving to array of files
 */
export const getAssistantFiles = async (workspaceId, assistantId) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/assistants/${assistantId}/files`);
    return response.data;
  } catch (error) {
    console.error('Error getting assistant files:', error);
    throw error;
  }
};

/**
 * Uploads a file to an assistant
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} assistantId - The ID of the assistant
 * @param {FormData} formData - Form data with the file to upload
 * @returns {Promise<Object>} Promise resolving to the uploaded file data
 */
export const uploadAssistantFile = async (workspaceId, assistantId, formData) => {
  try {
    const response = await api.post(
      `/api/v1/workspaces/${workspaceId}/assistants/${assistantId}/files`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading assistant file:', error);
    throw error;
  }
};

/**
 * Deletes a file from an assistant
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} assistantId - The ID of the assistant
 * @param {string} fileId - The ID of the file to delete
 * @returns {Promise<Object>} Promise resolving to the response data
 */
export const deleteAssistantFile = async (workspaceId, assistantId, fileId) => {
  try {
    const response = await api.delete(`/api/v1/workspaces/${workspaceId}/assistants/${assistantId}/files/${fileId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting assistant file:', error);
    throw error;
  }
};

// Export all functions as default export
export default {
  fetchWorkspaceAssistants,
  fetchWorkspaceAssistant,
  createWorkspaceAssistant,
  updateWorkspaceAssistant,
  deleteWorkspaceAssistant,
  getAssistantTypes,
  getAssistantTypeSchema,
  testWorkspaceAssistant,
  getAssistantStats,
  exportWorkspaceAssistant,
  importWorkspaceAssistant
};
