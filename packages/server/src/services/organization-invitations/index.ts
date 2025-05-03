import { StatusCodes } from 'http-status-codes'
import { OrganizationInvitation } from '../../database/entities/OrganizationInvitation'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import organizationsService from '../organizations'

/**
 * Get all invitations for an organization
 */
const getOrganizationInvitations = async (organizationId: string): Promise<OrganizationInvitation[]> => {
    try {
        // Verify organization exists
        await organizationsService.getOrganizationById(organizationId)
        
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(OrganizationInvitation).find({
            where: {
                organizationId: organizationId
            },
            relations: ['organization']
        })
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationInvitationsService.getOrganizationInvitations - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get invitation by ID
 */
const getInvitationById = async (invitationId: string): Promise<OrganizationInvitation> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(OrganizationInvitation).findOne({
            where: {
                id: invitationId
            },
            relations: ['organization']
        })
        if (!dbResponse) {
            throw new InternalFastflowError(StatusCodes.NOT_FOUND, `Invitation with ID ${invitationId} not found`)
        }
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationInvitationsService.getInvitationById - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get invitation by token
 */
const getInvitationByToken = async (token: string): Promise<OrganizationInvitation> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(OrganizationInvitation).findOne({
            where: {
                token: token
            },
            relations: ['organization']
        })
        if (!dbResponse) {
            throw new InternalFastflowError(StatusCodes.NOT_FOUND, `Invitation with token ${token} not found`)
        }
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationInvitationsService.getInvitationByToken - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get invitation by email for an organization
 */
const getInvitationByEmail = async (organizationId: string, email: string): Promise<OrganizationInvitation> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(OrganizationInvitation).findOne({
            where: {
                organizationId: organizationId,
                email: email
            },
            relations: ['organization']
        })
        if (!dbResponse) {
            throw new InternalFastflowError(
                StatusCodes.NOT_FOUND, 
                `Invitation for email ${email} in organization ${organizationId} not found`
            )
        }
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationInvitationsService.getInvitationByEmail - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Create a new invitation
 */
const createInvitation = async (invitationData: Partial<OrganizationInvitation>): Promise<OrganizationInvitation> => {
    try {
        const appServer = getRunningExpressApp()
        
        // Verify organization exists
        if (invitationData.organizationId) {
            await organizationsService.getOrganizationById(invitationData.organizationId)
        }
        
        const newInvitation = appServer.AppDataSource.getRepository(OrganizationInvitation).create(invitationData)
        const dbResponse = await appServer.AppDataSource.getRepository(OrganizationInvitation).save(newInvitation)
        
        // Fetch the complete invitation with relations
        return getInvitationById(dbResponse.id)
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationInvitationsService.createInvitation - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Update an invitation
 */
const updateInvitation = async (
    invitationId: string,
    updateData: Partial<OrganizationInvitation>
): Promise<OrganizationInvitation> => {
    try {
        const appServer = getRunningExpressApp()
        const invitation = await getInvitationById(invitationId)
        
        // Update fields
        Object.assign(invitation, updateData)
        
        await appServer.AppDataSource.getRepository(OrganizationInvitation).save(invitation)
        
        // Fetch the updated invitation with relations
        return getInvitationById(invitationId)
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationInvitationsService.updateInvitation - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Cancel an invitation
 */
const cancelInvitation = async (invitationId: string): Promise<void> => {
    try {
        const appServer = getRunningExpressApp()
        await getInvitationById(invitationId) // Check if invitation exists
        await appServer.AppDataSource.getRepository(OrganizationInvitation).update(
            { id: invitationId },
            { status: 'canceled' }
        )
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationInvitationsService.cancelInvitation - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Resend an invitation
 */
const resendInvitation = async (invitationId: string): Promise<OrganizationInvitation> => {
    try {
        // Get the invitation
        const invitation = await getInvitationById(invitationId)
        
        if (invitation.status !== 'pending') {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'Can only resend pending invitations'
            )
        }
        
        // Reset expiration date
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // Expire in 7 days
        
        return updateInvitation(invitationId, { expiresAt })
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationInvitationsService.resendInvitation - ${getErrorMessage(error)}`
        )
    }
}

export default {
    getOrganizationInvitations,
    getInvitationById,
    getInvitationByToken,
    getInvitationByEmail,
    createInvitation,
    updateInvitation,
    cancelInvitation,
    resendInvitation
}