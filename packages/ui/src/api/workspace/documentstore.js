import api from '../api';

/**
 * Fetches all document stores for a specific workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to an array of document stores
 */
export const fetchWorkspaceDocumentStores = async (workspaceId, options = {}) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/document-stores`, { params: options });
    return response.data;
  } catch (error) {
    console.error('Error fetching workspace document stores:', error);
    throw error;
  }
};

/**
 * Fetches a single document store by ID within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} storeId - The ID of the document store to fetch
 * @returns {Promise<Object>} Promise resolving to the document store object
 */
export const fetchWorkspaceDocumentStore = async (workspaceId, storeId) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/document-stores/${storeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workspace document store:', error);
    throw error;
  }
};

/**
 * Creates a new document store within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} storeData - The document store data to create
 * @returns {Promise<Object>} Promise resolving to the created document store
 */
export const createWorkspaceDocumentStore = async (workspaceId, storeData) => {
  try {
    const response = await api.post(`/api/v1/workspaces/${workspaceId}/document-stores`, storeData);
    return response.data;
  } catch (error) {
    console.error('Error creating workspace document store:', error);
    throw error;
  }
};

/**
 * Updates an existing document store within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} storeId - The ID of the document store to update
 * @param {Object} storeData - The updated document store data
 * @returns {Promise<Object>} Promise resolving to the updated document store
 */
export const updateWorkspaceDocumentStore = async (workspaceId, storeId, storeData) => {
  try {
    const response = await api.put(`/api/v1/workspaces/${workspaceId}/document-stores/${storeId}`, storeData);
    return response.data;
  } catch (error) {
    console.error('Error updating workspace document store:', error);
    throw error;
  }
};

/**
 * Deletes a document store from a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} storeId - The ID of the document store to delete
 * @returns {Promise<Object>} Promise resolving to the response data
 */
export const deleteWorkspaceDocumentStore = async (workspaceId, storeId) => {
  try {
    const response = await api.delete(`/api/v1/workspaces/${workspaceId}/document-stores/${storeId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting workspace document store:', error);
    throw error;
  }
};

/**
 * Uploads documents to a document store
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} storeId - The ID of the document store
 * @param {FormData} formData - Form data with the files to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Promise resolving to the upload result
 */
export const uploadToDocumentStore = async (workspaceId, storeId, formData, options = {}) => {
  try {
    const response = await api.post(
      `/api/v1/workspaces/${workspaceId}/document-stores/${storeId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        params: options
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading to document store:', error);
    throw error;
  }
};

/**
 * Fetches all documents in a document store
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} storeId - The ID of the document store
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to an array of documents
 */
export const fetchDocumentsInStore = async (workspaceId, storeId, options = {}) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/document-stores/${storeId}/documents`,
      { params: options }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching documents in store:', error);
    throw error;
  }
};

/**
 * Fetches a single document by ID within a document store
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} storeId - The ID of the document store
 * @param {string} documentId - The ID of the document to fetch
 * @returns {Promise<Object>} Promise resolving to the document object
 */
export const fetchDocumentFromStore = async (workspaceId, storeId, documentId) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/document-stores/${storeId}/documents/${documentId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching document from store:', error);
    throw error;
  }
};

/**
 * Deletes a document from a document store
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} storeId - The ID of the document store
 * @param {string} documentId - The ID of the document to delete
 * @returns {Promise<Object>} Promise resolving to the response data
 */
export const deleteDocumentFromStore = async (workspaceId, storeId, documentId) => {
  try {
    const response = await api.delete(
      `/api/v1/workspaces/${workspaceId}/document-stores/${storeId}/documents/${documentId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting document from store:', error);
    throw error;
  }
};

/**
 * Performs a query on a document store
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} storeId - The ID of the document store
 * @param {Object} queryData - The query parameters
 * @returns {Promise<Object>} Promise resolving to the query results
 */
export const queryDocumentStore = async (workspaceId, storeId, queryData) => {
  try {
    const response = await api.post(
      `/api/v1/workspaces/${workspaceId}/document-stores/${storeId}/query`,
      queryData
    );
    return response.data;
  } catch (error) {
    console.error('Error querying document store:', error);
    throw error;
  }
};

/**
 * Downloads a document from a document store
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} storeId - The ID of the document store
 * @param {string} documentId - The ID of the document to download
 * @returns {Promise<Blob>} Promise resolving to the document file as a blob
 */
export const downloadDocumentFromStore = async (workspaceId, storeId, documentId) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/document-stores/${storeId}/documents/${documentId}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    console.error('Error downloading document from store:', error);
    throw error;
  }
};

/**
 * Reprocesses a document in a document store
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} storeId - The ID of the document store
 * @param {string} documentId - The ID of the document to reprocess
 * @param {Object} options - Reprocessing options
 * @returns {Promise<Object>} Promise resolving to the reprocessing result
 */
export const reprocessDocument = async (workspaceId, storeId, documentId, options = {}) => {
  try {
    const response = await api.post(
      `/api/v1/workspaces/${workspaceId}/document-stores/${storeId}/documents/${documentId}/reprocess`,
      options
    );
    return response.data;
  } catch (error) {
    console.error('Error reprocessing document:', error);
    throw error;
  }
};

// Export all functions as default export
export default {
  fetchWorkspaceDocumentStores,
  fetchWorkspaceDocumentStore,
  createWorkspaceDocumentStore,
  updateWorkspaceDocumentStore,
  deleteWorkspaceDocumentStore,
  uploadToDocumentStore,
  fetchDocumentsInStore,
  fetchDocumentFromStore,
  deleteDocumentFromStore,
  queryDocumentStore,
  downloadDocumentFromStore,
  reprocessDocument
};
