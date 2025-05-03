import express from 'express'
import workspacesController from '../../controllers/workspaces'
import workspaceMembersController from '../../controllers/workspace-members'
import workspaceInvitationsController from '../../controllers/workspace-invitations'
import workspaceSettingsController from '../../controllers/workspace-settings'
import { verifyJWT } from '../../utils/supabase'
import { checkWorkspaceAccess, checkWorkspaceAdminAccess } from '../../middleware/workspaceAccess'

const router = express.Router()

// Apply JWT verification middleware to all routes
router.use(verifyJWT)

// Workspace CRUD operations
router.get('/', workspacesController.getAllWorkspaces)
router.post('/', workspacesController.createWorkspace)
router.get('/:id', checkWorkspaceAccess, workspacesController.getWorkspaceById)
router.put('/:id', checkWorkspaceAdminAccess, workspacesController.updateWorkspace)
router.delete('/:id', checkWorkspaceAdminAccess, workspacesController.deleteWorkspace)

// Workspace members
router.get('/:id/members', checkWorkspaceAccess, workspaceMembersController.getWorkspaceMembers)
router.post('/:id/members', checkWorkspaceAdminAccess, workspaceMembersController.addWorkspaceMember)
router.get('/:id/members/:userId', checkWorkspaceAccess, workspaceMembersController.getWorkspaceMember)
router.put('/:id/members/:userId', checkWorkspaceAdminAccess, workspaceMembersController.updateWorkspaceMember)
router.delete('/:id/members/:userId', checkWorkspaceAdminAccess, workspaceMembersController.removeWorkspaceMember)

// Workspace invitations
router.get('/:id/invitations', checkWorkspaceAccess, workspaceInvitationsController.getWorkspaceInvitations)
router.post('/:id/invitations', checkWorkspaceAdminAccess, workspaceInvitationsController.createInvitation)
router.get('/:id/invitations/:invitationId', checkWorkspaceAccess, workspaceInvitationsController.getInvitationById)
router.delete('/:id/invitations/:invitationId', checkWorkspaceAdminAccess, workspaceInvitationsController.cancelInvitation)
router.post('/:id/invitations/:invitationId/resend', checkWorkspaceAdminAccess, workspaceInvitationsController.resendInvitation)

// Workspace settings
router.get('/:id/settings', checkWorkspaceAccess, workspaceSettingsController.getWorkspaceSettings)
router.put('/:id/settings', checkWorkspaceAdminAccess, workspaceSettingsController.updateWorkspaceSettings)

// Public invitation routes (no workspace access check needed)
router.get('/invitations/:token', workspaceInvitationsController.getInvitationByToken)
router.post('/invitations/:token/accept', workspaceInvitationsController.acceptInvitation)

export default router