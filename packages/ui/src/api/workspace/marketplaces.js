import api from '../api';

/**
 * Fetches all marketplace items for a specific workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to an array of marketplace items
 */
export const fetchWorkspaceMarketplaceItems = async (workspaceId, options = {}) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/marketplace/items`, { params: options });
    return response.data;
  } catch (error) {
    console.error('Error fetching workspace marketplace items:', error);
    throw error;
  }
};

/**
 * Fetches a single marketplace item by ID within a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} itemId - The ID of the marketplace item to fetch
 * @returns {Promise<Object>} Promise resolving to the marketplace item object
 */
export const fetchWorkspaceMarketplaceItem = async (workspaceId, itemId) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/marketplace/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workspace marketplace item:', error);
    throw error;
  }
};

/**
 * Purchases a marketplace item for a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} itemId - The ID of the marketplace item to purchase
 * @param {Object} purchaseData - Additional purchase data (e.g., payment info)
 * @returns {Promise<Object>} Promise resolving to the purchase result
 */
export const purchaseMarketplaceItem = async (workspaceId, itemId, purchaseData = {}) => {
  try {
    const response = await api.post(
      `/api/v1/workspaces/${workspaceId}/marketplace/items/${itemId}/purchase`,
      purchaseData
    );
    return response.data;
  } catch (error) {
    console.error('Error purchasing marketplace item:', error);
    throw error;
  }
};

/**
 * Installs a marketplace item in a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} itemId - The ID of the marketplace item to install
 * @param {Object} installOptions - Installation options
 * @returns {Promise<Object>} Promise resolving to the installation result
 */
export const installMarketplaceItem = async (workspaceId, itemId, installOptions = {}) => {
  try {
    const response = await api.post(
      `/api/v1/workspaces/${workspaceId}/marketplace/items/${itemId}/install`,
      installOptions
    );
    return response.data;
  } catch (error) {
    console.error('Error installing marketplace item:', error);
    throw error;
  }
};

/**
 * Uninstalls a marketplace item from a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} itemId - The ID of the marketplace item to uninstall
 * @returns {Promise<Object>} Promise resolving to the uninstallation result
 */
export const uninstallMarketplaceItem = async (workspaceId, itemId) => {
  try {
    const response = await api.post(`/api/v1/workspaces/${workspaceId}/marketplace/items/${itemId}/uninstall`);
    return response.data;
  } catch (error) {
    console.error('Error uninstalling marketplace item:', error);
    throw error;
  }
};

/**
 * Gets all categories in the marketplace
 * @param {string} workspaceId - The ID of the workspace
 * @returns {Promise<Array>} Promise resolving to array of categories
 */
export const getMarketplaceCategories = async (workspaceId) => {
  try {
    const response = await api.get(`/api/v1/workspaces/${workspaceId}/marketplace/categories`);
    return response.data;
  } catch (error) {
    console.error('Error getting marketplace categories:', error);
    throw error;
  }
};

/**
 * Gets marketplace items by category
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} categoryId - The ID of the category
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to array of items in the category
 */
export const getMarketplaceItemsByCategory = async (workspaceId, categoryId, options = {}) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/marketplace/categories/${categoryId}/items`,
      { params: options }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting marketplace items by category:', error);
    throw error;
  }
};

/**
 * Searches marketplace items
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} searchParams - Search parameters (query, filters, etc.)
 * @returns {Promise<Object>} Promise resolving to search results
 */
export const searchMarketplaceItems = async (workspaceId, searchParams) => {
  try {
    const response = await api.post(
      `/api/v1/workspaces/${workspaceId}/marketplace/search`,
      searchParams
    );
    return response.data;
  } catch (error) {
    console.error('Error searching marketplace items:', error);
    throw error;
  }
};

/**
 * Gets installed marketplace items in a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to array of installed items
 */
export const getInstalledMarketplaceItems = async (workspaceId, options = {}) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/marketplace/installed`,
      { params: options }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting installed marketplace items:', error);
    throw error;
  }
};

/**
 * Gets purchase history for a workspace
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to array of purchases
 */
export const getMarketplacePurchaseHistory = async (workspaceId, options = {}) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/marketplace/purchases`,
      { params: options }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting marketplace purchase history:', error);
    throw error;
  }
};

/**
 * Gets featured marketplace items
 * @param {string} workspaceId - The ID of the workspace
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Array>} Promise resolving to array of featured items
 */
export const getFeaturedMarketplaceItems = async (workspaceId, options = {}) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/marketplace/featured`,
      { params: options }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting featured marketplace items:', error);
    throw error;
  }
};

/**
 * Rates a marketplace item
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} itemId - The ID of the marketplace item
 * @param {Object} ratingData - Rating data (rating, review text)
 * @returns {Promise<Object>} Promise resolving to the rating result
 */
export const rateMarketplaceItem = async (workspaceId, itemId, ratingData) => {
  try {
    const response = await api.post(
      `/api/v1/workspaces/${workspaceId}/marketplace/items/${itemId}/rate`,
      ratingData
    );
    return response.data;
  } catch (error) {
    console.error('Error rating marketplace item:', error);
    throw error;
  }
};

/**
 * Gets ratings for a marketplace item
 * @param {string} workspaceId - The ID of the workspace
 * @param {string} itemId - The ID of the marketplace item
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Object>} Promise resolving to ratings data
 */
export const getMarketplaceItemRatings = async (workspaceId, itemId, options = {}) => {
  try {
    const response = await api.get(
      `/api/v1/workspaces/${workspaceId}/marketplace/items/${itemId}/ratings`,
      { params: options }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting marketplace item ratings:', error);
    throw error;
  }
};
