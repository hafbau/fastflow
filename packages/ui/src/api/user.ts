import client from './client'

/**
 * User API client
 * Maps to endpoints in packages/server/src/routes/userRoutes.ts
 */

// Public routes
export const registerUser = (data: { email: string; password: string; fullName?: string }) =>
  client.post('/users/register', data)

export const resetPassword = (data: { email: string }) =>
  client.post('/users/reset-password', data)

// Authenticated user routes
export const getCurrentUser = () => client.get('/users/me')
export const updateCurrentUser = (data: any) => client.put('/users/me', data)
// TODO: This is redundant with the getAllOrganizations function, since backend is scoping all organizations to user any ways. Consider removing it.
export const getCurrentUserOrganizations = () => client.get('/users/me/organizations')

// Admin routes
export const inviteUser = (data: any) => client.post('/users/invite', data)
export const getUserById = (id: string) => client.get(`/users/${id}`)
export const updateUser = (id: string, data: any) => client.put(`/users/${id}`, data)
export const updateUserStatus = (id: string, data: any) => client.patch(`/users/${id}/status`, data)
export const deleteUser = (id: string) => client.delete(`/users/${id}`)
export const resetUserPasswordByAdmin = (id: string, data: any) => client.post(`/users/${id}/reset-password`, data)
export const searchUsers = (params: Record<string, any> = {}) => client.get('/users', { params })

export default {
  registerUser,
  resetPassword,
  getCurrentUser,
  updateCurrentUser,
  getCurrentUserOrganizations,
  inviteUser,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  resetUserPasswordByAdmin,
  searchUsers,
}
