import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'
import { OrganizationInvitation } from '../../database/entities/OrganizationInvitation'
import organizationInvitationsService from '../../services/organization-invitations'
import organizationsService from '../../services/organizations'
import organizationMembersService from '../../services/organization-members'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'
import { sendInvitationEmail } from '../../utils/emailService'
import logger from '../../utils/logger'

/**
 * Get all invitations for an organization
 */
const getOrganizationInvitations = async (req: Request, res: Response) => {
    try {
        const organizationId = req.params.id
        const invitations = await organizationInvitationsService.getOrganizationInvitations(organizationId)
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
        const invitation = await organizationInvitationsService.getInvitationById(invitationId)
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
        const invitation = await organizationInvitationsService.getInvitationByToken(token)
        return res.json(invitation)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Create a new invitation
 */
const createInvitation = async (req: Request, res: Response) => {
    try {
        const organizationId = req.params.id
        const { email, role } = req.body
        const userId = (req as any).user?.id
        
        // Verify organization exists
        const organization = await organizationsService.getOrganizationById(organizationId)
        
        // Check if user is already a member
        try {
            await organizationMembersService.getOrganizationMemberByEmail(organizationId, email)
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
            const existingInvitation = await organizationInvitationsService.getInvitationByEmail(organizationId, email)
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
        const token = uuidv4()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // Expire in 7 days
        
        const invitationData: Partial<OrganizationInvitation> = {
            organizationId,
            email,
            role: role || 'member',
            token,
            expiresAt,
            status: 'pending',
            invitedBy: userId
        }
        
        const invitation = await organizationInvitationsService.createInvitation(invitationData)
        
        // Send invitation email
        try {
            if (!invitationData.role) {
                throw new InternalFastflowError(StatusCodes.BAD_REQUEST, 'Role is required')
            }
            await sendInvitationEmail({
                email,
                organizationName: organization.name,
                invitationType: 'organization',
                token,
                role: invitationData.role
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
        await organizationInvitationsService.cancelInvitation(invitationId)
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
        const invitation = await organizationInvitationsService.getInvitationById(invitationId)
        
        if (invitation.status !== 'pending') {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Can only resend pending invitations' 
            })
        }
        
        // Get organization details
        const organization = await organizationsService.getOrganizationById(invitation.organizationId)
        
        // Reset expiration date
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // Expire in 7 days
        
        await organizationInvitationsService.updateInvitation(invitationId, { expiresAt })
        
        // Send invitation email
        try {
            await sendInvitationEmail({
                email: invitation.email,
                organizationName: organization.name,
                invitationType: 'organization',
                token: invitation.token,
                role: invitation.role
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
        
        // Get the invitation
        const invitation = await organizationInvitationsService.getInvitationByToken(token)
        
        if (invitation.status !== 'pending') {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Invitation has already been used or canceled' 
            })
        }
        
        // Check if invitation has expired
        if (new Date() > invitation.expiresAt) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invitation has expired' })
        }
        
        // Add user to organization
        await organizationMembersService.addOrganizationMember({
            organizationId: invitation.organizationId,
            userId,
            role: invitation.role
        })
        
        // Update invitation status
        await organizationInvitationsService.updateInvitation(invitation.id, { status: 'accepted' })
        
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
    getInvitationById,
    getInvitationByToken,
    createInvitation,
    cancelInvitation,
    resendInvitation,
    acceptInvitation
}