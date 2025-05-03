import express from 'express'
import organizationInvitationsController from '../../controllers/organization-invitations'
import { verifyJWT } from '../../utils/supabase'

const router = express.Router()

// Apply JWT verification middleware to all routes
router.use(verifyJWT)

// Public invitation routes (no organization access check needed)
router.get('/:token', organizationInvitationsController.getInvitationByToken)
router.post('/:token/accept', organizationInvitationsController.acceptInvitation)
router.post('/:invitationId/resend', organizationInvitationsController.resendInvitation)

export default router