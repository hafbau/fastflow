import express from 'express'
import workspaceInvitationsController from '../../controllers/workspace-invitations'
import { verifyJWT } from '../../utils/supabase'

const router = express.Router()

// Apply JWT verification middleware to all routes
router.use(verifyJWT)

// Public invitation routes (no workspace access check needed)
router.get('/:token', workspaceInvitationsController.getInvitationByToken)
router.post('/:token/accept', workspaceInvitationsController.acceptInvitation)
router.post('/:invitationId/resend', workspaceInvitationsController.resendInvitation)

export default router