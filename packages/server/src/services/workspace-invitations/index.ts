import { StatusCodes } from 'http-status-codes'
import { WorkspaceInvitation } from '../../database/entities/WorkspaceInvitation'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import workspacesService from '../workspaces'

/**
 * Get all invitations for a workspace
 */
const getWorkspaceInvitations = async (workspaceId: string): Promise<WorkspaceInvitation[]> => {
    try {
        // Verify workspace exists
        await workspacesService.getWorkspaceById(workspaceId)
        
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(WorkspaceInvitation).find({
            where: {
                workspaceId: workspaceId
            },
            relations: ['workspace', 'organization']
        })
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspaceInvitationsService.getWorkspaceInvitations - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get invitation by ID
 */
const getInvitationById = async (invitationId: string): Promise<WorkspaceInvitation> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(WorkspaceInvitation).findOne({
            where: {
                id: invitationId
            },
            relations: ['workspace', 'organization']
        })
        if (!dbResponse) {
            throw new InternalFastflowError(StatusCodes.NOT_FOUND, `Invitation with ID ${invitationId} not found`)
        }
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspaceInvitationsService.getInvitationById - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get invitation by token
 */
const getInvitationByToken = async (token: string): Promise<WorkspaceInvitation> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(WorkspaceInvitation).findOne({
            where: {
                token: token
            },
            relations: ['workspace', 'organization']
        })
        if (!dbResponse) {
            throw new InternalFastflowError(StatusCodes.NOT_FOUND, `Invitation with token ${token} not found`)
        }
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspaceInvitationsService.getInvitationByToken - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get invitation by email for a workspace
 */
const getInvitationByEmail = async (workspaceId: string, email: string): Promise<WorkspaceInvitation> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(WorkspaceInvitation).findOne({
            where: {
                workspaceId: workspaceId,
                email: email
            },
            relations: ['workspace', 'organization']
        })
        if (!dbResponse) {
            throw new InternalFastflowError(
                StatusCodes.NOT_FOUND, 
                `Invitation for email ${email} in workspace ${workspaceId} not found`
            )
        }
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspaceInvitationsService.getInvitationByEmail - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Create a new invitation
 */
const createInvitation = async (invitationData: Partial<WorkspaceInvitation>): Promise<WorkspaceInvitation> => {
    try {
        const appServer = getRunningExpressApp()
        
        // Verify workspace exists
        if (invitationData.workspaceId) {
            await workspacesService.getWorkspaceById(invitationData.workspaceId)
        }
        
        const newInvitation = appServer.AppDataSource.getRepository(WorkspaceInvitation).create(invitationData)
        const dbResponse = await appServer.AppDataSource.getRepository(WorkspaceInvitation).save(newInvitation)
        
        // Fetch the complete invitation with relations
        return getInvitationById(dbResponse.id)
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspaceInvitationsService.createInvitation - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Update an invitation
 */
const updateInvitation = async (
    invitationId: string,
    updateData: Partial<WorkspaceInvitation>
): Promise<WorkspaceInvitation> => {
    try {
        const appServer = getRunningExpressApp()
        const invitation = await getInvitationById(invitationId)
        
        // Update fields
        Object.assign(invitation, updateData)
        
        await appServer.AppDataSource.getRepository(WorkspaceInvitation).save(invitation)
        
        // Fetch the updated invitation with relations
        return getInvitationById(invitationId)
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspaceInvitationsService.updateInvitation - ${getErrorMessage(error)}`
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
        await appServer.AppDataSource.getRepository(WorkspaceInvitation).update(
            { id: invitationId },
            { status: 'canceled' }
        )
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspaceInvitationsService.cancelInvitation - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Resend an invitation
 */
const resendInvitation = async (invitationId: string): Promise<WorkspaceInvitation> => {
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
            `Error: workspaceInvitationsService.resendInvitation - ${getErrorMessage(error)}`
        )
    }
}

export default {
    getWorkspaceInvitations,
    getInvitationById,
    getInvitationByToken,
    getInvitationByEmail,
    createInvitation,
    updateInvitation,
    cancelInvitation,
    resendInvitation
}