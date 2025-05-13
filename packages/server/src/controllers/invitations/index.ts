import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Invitation } from '../../database/entities/Invitation'
import invitationService from '../../services/invitations'
import organizationsService from '../../services/organizations'
import workspacesService from '../../services/workspaces'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'
import logger from '../../utils/logger'
import { sendInvitationEmail } from '../../utils/emailService'
import { UserProfile } from '../../database/entities/UserProfile'

/**
 * Get all invitations for an organization
 */
const getOrganizationInvitations = async (req: Request, res: Response) => {
    try {
        const organizationId = req.params.id
        const includeWorkspaceInvitations = req.query.includeWorkspaceInvitations === 'true'
        
        const invitations = await invitationService.getOrganizationInvitations(
            organizationId,
            includeWorkspaceInvitations
        )
        
        return res.json(invitations)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Get all invitations for a workspace
 */
const getWorkspaceInvitations = async (req: Request, res: Response) => {
    try {
        const workspaceId = req.params.id
        const invitations = await invitationService.getWorkspaceInvitations(workspaceId)
        return res.json(invitations)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Get invitation by ID
 */
const getInvitationById = async (req: Request, res: Response) => {
    try {
        const invitationId = req.params.invitationId
        const invitation = await invitationService.getInvitationById(invitationId)
        return res.json(invitation)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Get invitation by token
 */
const getInvitationByToken = async (req: Request, res: Response) => {
    try {
        const token = req.params.token
        const invitation = await invitationService.getInvitationByToken(token)
        return res.json(invitation)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Create a new organization invitation
 */
const createOrganizationInvitation = async (req: Request, res: Response) => {
    try {
        const organizationId = req.params.id
        const { email, role } = req.body
        const userId = (req as any).user?.id
        
        // Verify organization exists
        const organization = await organizationsService.getOrganizationById(organizationId)
        
        // Check if user is already a member (use try/catch because getOrganizationMemberByEmail throws if not found)
        try {
            // This will be handled by a different service in production
            // For now, we'll just check if an organization member exists with this email
            // const existingMember = await organizationMembersService.getOrganizationMemberByEmail(organizationId, email)
            // If we get here, the user is already a member
            return res.status(StatusCodes.CONFLICT).json({ 
                error: `User with email ${email} is already a member of this organization` 
            })
        } catch (error) {
            // If error is NOT_FOUND, that's good - we can proceed
            if (!(error instanceof InternalFastflowError && error.statusCode === StatusCodes.NOT_FOUND)) {
                throw error
            }
        }
        
        // Check if there's already a pending invitation
        try {
            const existingInvitation = await invitationService.getOrganizationInvitationByEmail(organizationId, email)
            if (existingInvitation && existingInvitation.status === 'pending') {
                return res.status(StatusCodes.CONFLICT).json({ 
                    error: `There is already a pending invitation for ${email}` 
                })
            }
        } catch (error) {
            // If error is NOT_FOUND, that's good - we can proceed
            if (!(error instanceof InternalFastflowError && error.statusCode === StatusCodes.NOT_FOUND)) {
                throw error
            }
        }
        
        // Create invitation
        const invitationData: Partial<Invitation> = {
            organizationId,
            email,
            role: role || 'member',
            invitedBy: userId
        }
        
        const invitation = await invitationService.createInvitation(invitationData)
        
        // Send invitation email
        try {
            // Get inviter's name if available
            let inviterName = 'An administrator'
            if (userId) {
                // In production, this would use a different service to fetch the user
                // const userProfile = await userService.getUserById(userId)
                // inviterName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'An administrator'
            }
            
            await sendInvitationEmail({
                email,
                organizationName: organization.name,
                invitationType: 'organization',
                token: invitation.token,
                role: invitation.role,
                inviterName
            })
        } catch (emailError) {
            logger.error(`Failed to send invitation email: ${emailError}`)
            // Continue even if email fails
        }
        
        return res.status(StatusCodes.CREATED).json(invitation)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Create a new workspace invitation
 */
const createWorkspaceInvitation = async (req: Request, res: Response) => {
    try {
        const workspaceId = req.params.id
        const { email, role } = req.body
        const userId = (req as any).user?.id
        
        // Verify workspace exists and get organization
        const workspace = await workspacesService.getWorkspaceById(workspaceId)
        const organization = await organizationsService.getOrganizationById(workspace.organizationId)
        
        // Check if user is already a member (use try/catch because getWorkspaceMemberByEmail throws if not found)
        try {
            // This will be handled by a different service in production
            // const existingMember = await workspaceMembersService.getWorkspaceMemberByEmail(workspaceId, email)
            // If we get here, the user is already a member
            return res.status(StatusCodes.CONFLICT).json({ 
                error: `User with email ${email} is already a member of this workspace` 
            })
        } catch (error) {
            // If error is NOT_FOUND, that's good - we can proceed
            if (!(error instanceof InternalFastflowError && error.statusCode === StatusCodes.NOT_FOUND)) {
                throw error
            }
        }
        
        // Check if there's already a pending invitation
        try {
            const existingInvitation = await invitationService.getWorkspaceInvitationByEmail(workspaceId, email)
            if (existingInvitation && existingInvitation.status === 'pending') {
                return res.status(StatusCodes.CONFLICT).json({ 
                    error: `There is already a pending invitation for ${email}` 
                })
            }
        } catch (error) {
            // If error is NOT_FOUND, that's good - we can proceed
            if (!(error instanceof InternalFastflowError && error.statusCode === StatusCodes.NOT_FOUND)) {
                throw error
            }
        }
        
        // Create invitation
        const invitationData: Partial<Invitation> = {
            organizationId: workspace.organizationId,
            workspaceId,
            email,
            role: role || 'member',
            invitedBy: userId
        }
        
        const invitation = await invitationService.createInvitation(invitationData)
        
        // Send invitation email
        try {
            // Get inviter's name if available
            let inviterName = 'An administrator'
            if (userId) {
                // In production, this would use a different service to fetch the user
                // const userProfile = await userService.getUserById(userId)
                // inviterName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'An administrator'
            }
            
            await sendInvitationEmail({
                email,
                organizationName: organization.name,
                workspaceName: workspace.name,
                invitationType: 'workspace',
                token: invitation.token,
                role: invitation.role,
                inviterName
            })
        } catch (emailError) {
            logger.error(`Failed to send invitation email: ${emailError}`)
            // Continue even if email fails
        }
        
        return res.status(StatusCodes.CREATED).json(invitation)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Cancel an invitation
 */
const cancelInvitation = async (req: Request, res: Response) => {
    try {
        const invitationId = req.params.invitationId
        await invitationService.cancelInvitation(invitationId)
        return res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Resend an invitation
 */
const resendInvitation = async (req: Request, res: Response) => {
    try {
        const invitationId = req.params.invitationId
        
        // Get the invitation
        const invitation = await invitationService.getInvitationById(invitationId)
        
        // Check if the invitation is still pending
        if (invitation.status !== 'pending') {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Can only resend pending invitations' 
            })
        }
        
        // Resend the invitation
        await invitationService.resendInvitation(invitationId)
        
        // Send the email
        try {
            // Get organization and workspace info
            const organization = await organizationsService.getOrganizationById(invitation.organizationId)
            let workspace = null
            
            if (invitation.workspaceId) {
                workspace = await workspacesService.getWorkspaceById(invitation.workspaceId)
            }
            
            // Get inviter's name if available
            let inviterName = 'An administrator'
            if (invitation.invitedBy) {
                // In production, this would use a different service to fetch the user
                // const userProfile = await userService.getUserById(invitation.invitedBy)
                // inviterName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'An administrator'
            }
            
            // Send email
            await sendInvitationEmail({
                email: invitation.email,
                organizationName: organization.name,
                workspaceName: workspace?.name,
                invitationType: invitation.invitationType,
                token: invitation.token,
                role: invitation.role,
                inviterName
            })
        } catch (emailError) {
            logger.error(`Failed to send invitation email: ${emailError}`)
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                error: 'Failed to send invitation email' 
            })
        }
        
        return res.status(StatusCodes.OK).json({ message: 'Invitation resent successfully' })
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Accept an invitation
 */
const acceptInvitation = async (req: Request, res: Response) => {
    try {
        const token = req.params.token
        const userId = (req as any).user?.id
        
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' })
        }
        
        // Accept the invitation
        await invitationService.acceptInvitation(token, userId)
        
        return res.status(StatusCodes.OK).json({ message: 'Invitation accepted successfully' })
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

export default {
    getOrganizationInvitations,
    getWorkspaceInvitations,
    getInvitationById,
    getInvitationByToken,
    createOrganizationInvitation,
    createWorkspaceInvitation,
    cancelInvitation,
    resendInvitation,
    acceptInvitation
}