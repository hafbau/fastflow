import { StatusCodes } from 'http-status-codes'
import { Workspace } from '../../database/entities/Workspace'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import organizationsService from '../organizations'

/**
 * Get all workspaces
 */
const getAllWorkspaces = async (): Promise<Workspace[]> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(Workspace).find({
            order: {
                name: 'ASC'
            },
            relations: ['organization']
        })
        return dbResponse
    } catch (error) {
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspacesService.getAllWorkspaces - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get workspaces by organization ID
 */
const getWorkspacesByOrganizationId = async (organizationId: string): Promise<Workspace[]> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(Workspace).find({
            where: {
                organizationId: organizationId
            },
            order: {
                name: 'ASC'
            },
            relations: ['organization']
        })
        return dbResponse
    } catch (error) {
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspacesService.getWorkspacesByOrganizationId - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get workspace by ID
 */
const getWorkspaceById = async (workspaceId: string): Promise<Workspace> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(Workspace).findOne({
            where: {
                id: workspaceId
            },
            relations: ['organization']
        })
        if (!dbResponse) {
            throw new InternalFastflowError(StatusCodes.NOT_FOUND, `Workspace ${workspaceId} not found`)
        }
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspacesService.getWorkspaceById - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get workspace by slug and organization ID
 */
const getWorkspaceBySlug = async (organizationId: string, slug: string): Promise<Workspace> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(Workspace).findOne({
            where: {
                organizationId: organizationId,
                slug: slug
            },
            relations: ['organization']
        })
        if (!dbResponse) {
            throw new InternalFastflowError(StatusCodes.NOT_FOUND, `Workspace with slug ${slug} not found in organization ${organizationId}`)
        }
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspacesService.getWorkspaceBySlug - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Create a new workspace
 */
const createWorkspace = async (workspace: Partial<Workspace>): Promise<Workspace> => {
    try {
        const appServer = getRunningExpressApp()
        
        // Verify organization exists
        if (workspace.organizationId) {
            await organizationsService.getOrganizationById(workspace.organizationId)
        }
        
        const newWorkspace = appServer.AppDataSource.getRepository(Workspace).create(workspace)
        const dbResponse = await appServer.AppDataSource.getRepository(Workspace).save(newWorkspace)
        
        // Fetch the complete workspace with relations
        return getWorkspaceById(dbResponse.id)
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspacesService.createWorkspace - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Update a workspace
 */
const updateWorkspace = async (workspaceId: string, updateData: Partial<Workspace>): Promise<Workspace> => {
    try {
        const appServer = getRunningExpressApp()
        const workspace = await getWorkspaceById(workspaceId)
        
        // Verify organization exists if changing organization
        if (updateData.organizationId && updateData.organizationId !== workspace.organizationId) {
            await organizationsService.getOrganizationById(updateData.organizationId)
        }
        
        const updatedWorkspace = appServer.AppDataSource.getRepository(Workspace).merge(workspace, updateData)
        await appServer.AppDataSource.getRepository(Workspace).save(updatedWorkspace)
        
        // Fetch the complete updated workspace with relations
        return getWorkspaceById(workspaceId)
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspacesService.updateWorkspace - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Delete a workspace
 */
const deleteWorkspace = async (workspaceId: string): Promise<void> => {
    try {
        const appServer = getRunningExpressApp()
        await getWorkspaceById(workspaceId) // Check if workspace exists
        await appServer.AppDataSource.getRepository(Workspace).delete({ id: workspaceId })
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspacesService.deleteWorkspace - ${getErrorMessage(error)}`
        )
    }
}

export default {
    getAllWorkspaces,
    getWorkspacesByOrganizationId,
    getWorkspaceById,
    getWorkspaceBySlug,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
}