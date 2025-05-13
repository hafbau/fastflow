import apiClient from './client';

/**
 * Register a new user
 * This will call the backend endpoint which handles Supabase auth signup
 * and local profile creation.
 * @param {Object} userData - { email, password, fullName }
 * @returns {Promise<Object>} Backend response
 */
export const registerUser = async (userData) => {
  try {
    // The backend route is POST /register as per packages/server/src/routes/userRoutes.ts
    // apiClient has baseURL: `${baseURL}/api/v1`
    // So, if userRoutes are mounted at /users, it would be /users/register
    // But userRoutes.ts shows router.post('/register', ...), suggesting it's at the root of where this router is mounted.
    // Assuming the userRoutes router is mounted at /api/v1 (needs verification if this call fails)
    // For now, let's assume /auth/register is the intended path if there's an /auth prefix for these routes.
    // Given the existing structure, it's more likely the full path is expected to be handled by how Express routes are set up.
    // The existing client.js prepends /api/v1. So if userRoutes.ts is the root for user auth, then /register is correct.
    // Let's assume the backend /register endpoint is directly under /api/v1 for now.
    // If Express mounts userRoutes at '/users', then it should be '/users/register'.
    // Based on other api files, they don't add a prefix like '/users' here.
    const response = await apiClient.post('/users/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error during user registration API call:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// We might need loginUser, logoutUser (if not fully handled by Supabase client) later.
// For now, just registerUser.

export default {
  registerUser,
};
