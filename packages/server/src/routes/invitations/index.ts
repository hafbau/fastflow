import express from 'express'
import invitationsController from '../../controllers/invitations'
import { authenticateUser } from '../../middleware/auth'
import { checkPermission } from '../../middleware/auth/permissionCheck'

const router = express.Router()

// Invitations by ID or token
router.get('/invitations/:invitationId', authenticateUser, invitationsController.getInvitationById)
router.get('/invitations/token/:token', authenticateUser, invitationsController.getInvitationByToken)
router.post('/invitations/:token/accept', authenticateUser, invitationsController.acceptInvitation)
router.delete('/invitations/:invitationId', 
    authenticateUser, 
    checkPermission({
        resourceType: 'invitation',
        action: 'manage',
        scopeType: 'resource'
    }), 
    invitationsController.cancelInvitation
)
router.post('/invitations/:invitationId/resend', 
    authenticateUser, 
    checkPermission({
        resourceType: 'invitation',
        action: 'manage',
        scopeType: 'resource'
    }), 
    invitationsController.resendInvitation
)

// Organization invitations
router.get('/organizations/:id/invitations', 
    authenticateUser, 
    checkPermission({
        resourceType: 'organization',
        action: 'read',
        scopeType: 'organization'
    }), 
    invitationsController.getOrganizationInvitations
)
router.post('/organizations/:id/invitations', 
    authenticateUser, 
    checkPermission({
        resourceType: 'organization',
        action: 'invite',
        scopeType: 'organization'
    }), 
    invitationsController.createOrganizationInvitation
)

// Workspace invitations
router.get('/workspaces/:id/invitations', 
    authenticateUser, 
    checkPermission({
        resourceType: 'workspace',
        action: 'read',
        scopeType: 'workspace'
    }), 
    invitationsController.getWorkspaceInvitations
)
router.post('/workspaces/:id/invitations', 
    authenticateUser, 
    checkPermission({
        resourceType: 'workspace',
        action: 'invite',
        scopeType: 'workspace'
    }), 
    invitationsController.createWorkspaceInvitation
)

export default router