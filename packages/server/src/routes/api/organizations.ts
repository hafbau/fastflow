import express from 'express'
import organizationsController from '../../controllers/organizations'
import organizationMembersController from '../../controllers/organization-members'
import organizationInvitationsController from '../../controllers/organization-invitations'
import organizationSettingsController from '../../controllers/organization-settings'
import { verifyJWT } from '../../utils/supabase'
import { checkOrganizationAccess, checkOrganizationAdminAccess } from '../../middleware/organizationAccess'

const router = express.Router()

// Apply JWT verification middleware to all routes
router.use(verifyJWT)

// Organization CRUD operations
router.get('/', organizationsController.getAllOrganizations)
router.post('/', organizationsController.createOrganization)
router.get('/:id', checkOrganizationAccess, organizationsController.getOrganizationById)
router.put('/:id', checkOrganizationAdminAccess, organizationsController.updateOrganization)
router.delete('/:id', checkOrganizationAdminAccess, organizationsController.deleteOrganization)

// Organization members
router.get('/:id/members', checkOrganizationAccess, organizationMembersController.getOrganizationMembers)
router.post('/:id/members', checkOrganizationAdminAccess, organizationMembersController.addOrganizationMember)
router.get('/:id/members/:userId', checkOrganizationAccess, organizationMembersController.getOrganizationMember)
router.put('/:id/members/:userId', checkOrganizationAdminAccess, organizationMembersController.updateOrganizationMember)
router.delete('/:id/members/:userId', checkOrganizationAdminAccess, organizationMembersController.removeOrganizationMember)

// Organization invitations
router.get('/:id/invitations', checkOrganizationAccess, organizationInvitationsController.getOrganizationInvitations)
router.post('/:id/invitations', checkOrganizationAdminAccess, organizationInvitationsController.createInvitation)
router.get('/:id/invitations/:invitationId', checkOrganizationAccess, organizationInvitationsController.getInvitationById)
router.delete('/:id/invitations/:invitationId', checkOrganizationAdminAccess, organizationInvitationsController.cancelInvitation)
router.post('/:id/invitations/:invitationId/resend', checkOrganizationAdminAccess, organizationInvitationsController.resendInvitation)

// Organization settings
router.get('/:id/settings', checkOrganizationAccess, organizationSettingsController.getOrganizationSettings)
router.put('/:id/settings', checkOrganizationAdminAccess, organizationSettingsController.updateOrganizationSettings)

// Public invitation routes (no organization access check needed)
router.get('/invitations/:token', organizationInvitationsController.getInvitationByToken)
router.post('/invitations/:token/accept', organizationInvitationsController.acceptInvitation)

export default router