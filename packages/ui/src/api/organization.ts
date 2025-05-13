import client from './client'

/**
 * Organization API client
 * Maps to endpoints in packages/server/src/routes/organizations/index.ts
 */

// Organization CRUD
export const getAllOrganizations = () => client.get('/organizations')
export const getOrganizationById = (id: string) => client.get(`/organizations/${id}`)
export const getOrganizationBySlug = (slug: string) => client.get(`/organizations/slug/${slug}`)
export const createOrganization = (data: any) => client.post('/organizations', data)
export const updateOrganization = (id: string, data: any) => client.put(`/organizations/${id}`, data)
export const deleteOrganization = (id: string) => client.delete(`/organizations/${id}`)

// Members
export const getOrganizationMembers = (id: string) => client.get(`/organizations/${id}/members`)
export const addOrganizationMember = (id: string, data: any) => client.post(`/organizations/${id}/members`, data)
export const updateOrganizationMember = (id: string, userId: string, data: any) =>
  client.put(`/organizations/${id}/members/${userId}`, data)
export const removeOrganizationMember = (id: string, userId: string) =>
  client.delete(`/organizations/${id}/members/${userId}`)

// Invitations
export const getOrganizationInvitations = (id: string) => client.get(`/organizations/${id}/invitations`)
export const createInvitation = (id: string, data: any) => client.post(`/organizations/${id}/invitations`, data)
export const getInvitationById = (invitationId: string) => client.get(`/organizations/invitations/${invitationId}`)
export const getInvitationByToken = (token: string) => client.get(`/organizations/invitations/token/${token}`)
export const acceptInvitation = (token: string, data: any) =>
  client.post(`/organizations/invitations/token/${token}/accept`, data)
export const resendInvitation = (invitationId: string, data: any) =>
  client.post(`/organizations/invitations/${invitationId}/resend`, data)
export const cancelInvitation = (invitationId: string) =>
  client.delete(`/organizations/invitations/${invitationId}`)

// Settings
export const getOrganizationSettings = (id: string) => client.get(`/organizations/${id}/settings`)
export const updateOrganizationSettings = (id: string, data: any) =>
  client.put(`/organizations/${id}/settings`, data)

export default {
  getAllOrganizations,
  getOrganizationById,
  getOrganizationBySlug,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMember,
  removeOrganizationMember,
  getOrganizationInvitations,
  createInvitation,
  getInvitationById,
  getInvitationByToken,
  acceptInvitation,
  resendInvitation,
  cancelInvitation,
  getOrganizationSettings,
  updateOrganizationSettings,
}
