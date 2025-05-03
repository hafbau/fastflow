import { StatusCodes } from 'http-status-codes'
import { WorkspaceMember } from '../../database/entities/WorkspaceMember'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import workspacesService from '../workspaces'
import organizationMembersService from '../organization-members'

/**
 * Get all members of a workspace
 */
const getWorkspaceMembers = async (workspaceId: string): Promise<WorkspaceMember[]> => {
    try {
        // Verify workspace exists
        const workspace = await workspacesService.getWorkspaceById(workspaceId)
        
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(WorkspaceMember).find({
            where: {
                workspaceId: workspaceId
            },
            relations: ['workspace']
        })
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspaceMembersService.getWorkspaceMembers - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get workspaces for a user
 */
const getUserWorkspaces = async (userId: string): Promise<WorkspaceMember[]> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(WorkspaceMember).find({
            where: {
                userId: userId
            },
            relations: ['workspace', 'workspace.organization']
        })
        return dbResponse
    } catch (error) {
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspaceMembersService.getUserWorkspaces - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get a specific workspace member
 */
const getWorkspaceMember = async (workspaceId: string, userId: string): Promise<WorkspaceMember> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(WorkspaceMember).findOne({
            where: {
                workspaceId: workspaceId,
                userId: userId
            },
            relations: ['workspace', 'workspace.organization']
        })
        if (!dbResponse) {
            throw new InternalFastflowError(StatusCodes.NOT_FOUND, `User ${userId} is not a member of workspace ${workspaceId}`)
        }
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspaceMembersService.getWorkspaceMember - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get workspace member by email
 */
const getWorkspaceMemberByEmail = async (workspaceId: string, email: string): Promise<WorkspaceMember> => {
    try {
        const appServer = getRunningExpressApp()
        
        // First, find the user with the given email
        const userRepository = appServer.AppDataSource.getRepository('user')
        const user = await userRepository.findOne({ where: { email } })
        
        if (!user) {
            throw new InternalFastflowError(StatusCodes.NOT_FOUND, `User with email ${email} not found`)
        }
        
        // Then find the workspace member
        return getWorkspaceMember(workspaceId, user.id)
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspaceMembersService.getWorkspaceMemberByEmail - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Add a member to a workspace
 */
const addWorkspaceMember = async (member: Partial<WorkspaceMember>): Promise<WorkspaceMember> => {
    try {
        const appServer = getRunningExpressApp()
        
        // Verify workspace exists and get organization ID
        const workspace = await workspacesService.getWorkspaceById(member.workspaceId!)
        
        // Verify user is a member of the organization
        try {
            await organizationMembersService.getOrganizationMember(workspace.organizationId, member.userId!)
        } catch (error) {
            if (error instanceof InternalFastflowError && error.statusCode === StatusCodes.NOT_FOUND) {
                throw new InternalFastflowError(
                    StatusCodes.FORBIDDEN,
                    `User ${member.userId} must be a member of the organization before being added to workspace ${member.workspaceId}`
                )
            }
            throw error
        }
        
        // Check if member already exists
        try {
            const existingMember = await getWorkspaceMember(member.workspaceId!, member.userId!)
            if (existingMember) {
                throw new InternalFastflowError(
                    StatusCodes.CONFLICT,
                    `User ${member.userId} is already a member of workspace ${member.workspaceId}`
                )
            }
        } catch (error) {
            // If error is NOT_FOUND, that's good - we can proceed
            if (!(error instanceof InternalFastflowError && error.statusCode === StatusCodes.NOT_FOUND)) {
                throw error
            }
        }
        
        const newMember = appServer.AppDataSource.getRepository(WorkspaceMember).create(member)
        const dbResponse = await appServer.AppDataSource.getRepository(WorkspaceMember).save(newMember)
        
        // Fetch the complete member with relations
        return getWorkspaceMember(dbResponse.workspaceId, dbResponse.userId)
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspaceMembersService.addWorkspaceMember - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Update a member's role in a workspace
 */
const updateWorkspaceMember = async (
    workspaceId: string,
    userId: string,
    updateData: Partial<WorkspaceMember>
): Promise<WorkspaceMember> => {
    try {
        const appServer = getRunningExpressApp()
        const member = await getWorkspaceMember(workspaceId, userId)
        
        // Only allow updating role
        if (updateData.role) {
            member.role = updateData.role
        }
        
        await appServer.AppDataSource.getRepository(WorkspaceMember).save(member)
        
        // Fetch the updated member with relations
        return getWorkspaceMember(workspaceId, userId)
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspaceMembersService.updateWorkspaceMember - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Remove a member from a workspace
 */
const removeWorkspaceMember = async (workspaceId: string, userId: string): Promise<void> => {
    try {
        const appServer = getRunningExpressApp()
        await getWorkspaceMember(workspaceId, userId) // Check if member exists
        await appServer.AppDataSource.getRepository(WorkspaceMember).delete({
            workspaceId: workspaceId,
            userId: userId
        })
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspaceMembersService.removeWorkspaceMember - ${getErrorMessage(error)}`
        )
    }
}

export default {
    getWorkspaceMembers,
    getUserWorkspaces,
    getWorkspaceMember,
    getWorkspaceMemberByEmail,
    addWorkspaceMember,
    updateWorkspaceMember,
    removeWorkspaceMember
}