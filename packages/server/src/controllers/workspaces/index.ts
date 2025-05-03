import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import workspacesService from '../../services/workspaces'
import workspaceMembersService from '../../services/workspace-members'
import workspaceSettingsService from '../../services/workspace-settings'
import { Workspace } from '../../database/entities/Workspace'
import { WorkspaceMember } from '../../database/entities/WorkspaceMember'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import logger from '../../utils/logger'

// Use the globally extended Request type that includes the UserProfile
import { UserProfile } from '../../database/entities/UserProfile'

interface AuthenticatedRequest extends Request {
    user?: UserProfile
}

/**
 * Get all workspaces
 */
const getAllWorkspaces = async (req: Request, res: Response) => {
    try {
        const workspaces = await workspacesService.getAllWorkspaces()
        return res.status(StatusCodes.OK).json(workspaces)
    } catch (error) {
        logger.error(`[WorkspacesController] getAllWorkspaces error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get workspaces' })
    }
}

/**
 * Get workspaces by organization ID
 */
const getWorkspacesByOrganizationId = async (req: Request, res: Response) => {
    try {
        const { organizationId } = req.params
        const workspaces = await workspacesService.getWorkspacesByOrganizationId(organizationId)
        return res.status(StatusCodes.OK).json(workspaces)
    } catch (error) {
        logger.error(`[WorkspacesController] getWorkspacesByOrganizationId error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get workspaces' })
    }
}

/**
 * Get workspace by ID
 */
const getWorkspaceById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const workspace = await workspacesService.getWorkspaceById(id)
        return res.status(StatusCodes.OK).json(workspace)
    } catch (error) {
        logger.error(`[WorkspacesController] getWorkspaceById error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get workspace' })
    }
}

/**
 * Get workspace by slug and organization ID
 */
const getWorkspaceBySlug = async (req: Request, res: Response) => {
    try {
        const { organizationId, slug } = req.params
        const workspace = await workspacesService.getWorkspaceBySlug(organizationId, slug)
        return res.status(StatusCodes.OK).json(workspace)
    } catch (error) {
        logger.error(`[WorkspacesController] getWorkspaceBySlug error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get workspace' })
    }
}

/**
 * Create a new workspace
 */
const createWorkspace = async (req: Request, res: Response) => {
    try {
        const workspaceData: Partial<Workspace> = req.body
        
        // Set createdBy if user is authenticated
        const authReq = req as AuthenticatedRequest
        if (authReq.user && authReq.user.id) {
            workspaceData.createdBy = authReq.user.id
        }
        
        const workspace = await workspacesService.createWorkspace(workspaceData)
        
        // Add the creator as an admin member
        if (authReq.user && authReq.user.id) {
            await workspaceMembersService.addWorkspaceMember({
                workspaceId: workspace.id,
                userId: authReq.user.id,
                role: 'admin'
            })
        }
        
        return res.status(StatusCodes.CREATED).json(workspace)
    } catch (error) {
        logger.error(`[WorkspacesController] createWorkspace error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create workspace' })
    }
}

/**
 * Update a workspace
 */
const updateWorkspace = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const updateData: Partial<Workspace> = req.body
        
        // Prevent updating critical fields
        delete updateData.id
        delete updateData.createdBy
        delete updateData.createdAt
        
        const workspace = await workspacesService.updateWorkspace(id, updateData)
        return res.status(StatusCodes.OK).json(workspace)
    } catch (error) {
        logger.error(`[WorkspacesController] updateWorkspace error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update workspace' })
    }
}

/**
 * Delete a workspace
 */
const deleteWorkspace = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        await workspacesService.deleteWorkspace(id)
        return res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
        logger.error(`[WorkspacesController] deleteWorkspace error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete workspace' })
    }
}

/**
 * Get workspace members
 */
const getWorkspaceMembers = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const members = await workspaceMembersService.getWorkspaceMembers(id)
        return res.status(StatusCodes.OK).json(members)
    } catch (error) {
        logger.error(`[WorkspacesController] getWorkspaceMembers error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get workspace members' })
    }
}

/**
 * Add a member to a workspace
 */
const addWorkspaceMember = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const memberData: Partial<WorkspaceMember> = req.body
        
        // Ensure workspaceId is set correctly
        memberData.workspaceId = id
        
        const member = await workspaceMembersService.addWorkspaceMember(memberData)
        return res.status(StatusCodes.CREATED).json(member)
    } catch (error) {
        logger.error(`[WorkspacesController] addWorkspaceMember error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to add workspace member' })
    }
}

/**
 * Update a workspace member
 */
const updateWorkspaceMember = async (req: Request, res: Response) => {
    try {
        const { id, userId } = req.params
        const updateData: Partial<WorkspaceMember> = req.body
        
        // Prevent updating critical fields
        delete updateData.id
        delete updateData.workspaceId
        delete updateData.userId
        
        const member = await workspaceMembersService.updateWorkspaceMember(id, userId, updateData)
        return res.status(StatusCodes.OK).json(member)
    } catch (error) {
        logger.error(`[WorkspacesController] updateWorkspaceMember error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update workspace member' })
    }
}

/**
 * Remove a member from a workspace
 */
const removeWorkspaceMember = async (req: Request, res: Response) => {
    try {
        const { id, userId } = req.params
        await workspaceMembersService.removeWorkspaceMember(id, userId)
        return res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
        logger.error(`[WorkspacesController] removeWorkspaceMember error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to remove workspace member' })
    }
}

/**
 * Get workspace settings
 */
const getWorkspaceSettings = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const settings = await workspaceSettingsService.getWorkspaceSettings(id)
        return res.status(StatusCodes.OK).json(settings)
    } catch (error) {
        logger.error(`[WorkspacesController] getWorkspaceSettings error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get workspace settings' })
    }
}

/**
 * Update workspace settings
 */
const updateWorkspaceSettings = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const settingsData = req.body
        
        const settings = await workspaceSettingsService.updateWorkspaceSettings(id, settingsData)
        return res.status(StatusCodes.OK).json(settings)
    } catch (error) {
        logger.error(`[WorkspacesController] updateWorkspaceSettings error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update workspace settings' })
    }
}

export default {
    getAllWorkspaces,
    getWorkspacesByOrganizationId,
    getWorkspaceById,
    getWorkspaceBySlug,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    getWorkspaceMembers,
    addWorkspaceMember,
    updateWorkspaceMember,
    removeWorkspaceMember,
    getWorkspaceSettings,
    updateWorkspaceSettings
}