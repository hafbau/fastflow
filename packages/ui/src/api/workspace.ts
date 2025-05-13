import client from './client'

/**
 * Workspace API client
 * Maps to endpoints in packages/server/src/routes/workspaces/index.ts
 */

// Workspace CRUD
export const getAllWorkspaces = () => client.get('/workspaces')
export const getWorkspaceById = (id: string) => client.get(`/workspaces/${id}`)
export const getWorkspaceBySlug = (slug: string) => client.get(`/workspaces/slug/${slug}`)
export const getWorkspacesByOrganizationId = (organizationId: string) =>
  client.get(`/workspaces/organization/${organizationId}`)
export const createWorkspace = (data: any) => client.post('/workspaces', data)
export const updateWorkspace = (id: string, data: any) => client.put(`/workspaces/${id}`, data)
export const deleteWorkspace = (id: string) => client.delete(`/workspaces/${id}`)

// Members
export const getWorkspaceMembers = (id: string) => client.get(`/workspaces/${id}/members`)
export const addWorkspaceMember = (id: string, data: any) => client.post(`/workspaces/${id}/members`, data)
export const updateWorkspaceMember = (id: string, userId: string, data: any) =>
  client.put(`/workspaces/${id}/members/${userId}`, data)
export const removeWorkspaceMember = (id: string, userId: string) =>
  client.delete(`/workspaces/${id}/members/${userId}`)

// Invitations
export const getWorkspaceInvitations = (id: string) => client.get(`/workspaces/${id}/invitations`)
export const createInvitation = (id: string, data: any) => client.post(`/workspaces/${id}/invitations`, data)
export const getInvitationById = (invitationId: string) => client.get(`/workspaces/invitations/${invitationId}`)
export const getInvitationByToken = (token: string) => client.get(`/workspaces/invitations/token/${token}`)
export const acceptInvitation = (token: string, data: any) =>
  client.post(`/workspaces/invitations/token/${token}/accept`, data)
export const resendInvitation = (invitationId: string, data: any) =>
  client.post(`/workspaces/invitations/${invitationId}/resend`, data)
export const cancelInvitation = (invitationId: string) =>
  client.delete(`/workspaces/invitations/${invitationId}`)

// Settings
export const getWorkspaceSettings = (id: string) => client.get(`/workspaces/${id}/settings`)
export const updateWorkspaceSettings = (id: string, data: any) =>
  client.put(`/workspaces/${id}/settings`, data)

export default {
  getAllWorkspaces,
  getWorkspaceById,
  getWorkspaceBySlug,
  getWorkspacesByOrganizationId,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceMembers,
  addWorkspaceMember,
  updateWorkspaceMember,
  removeWorkspaceMember,
  getWorkspaceInvitations,
  createInvitation,
  getInvitationById,
  getInvitationByToken,
  acceptInvitation,
  resendInvitation,
  cancelInvitation,
  getWorkspaceSettings,
  updateWorkspaceSettings,
}
