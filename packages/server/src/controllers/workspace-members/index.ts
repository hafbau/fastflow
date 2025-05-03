import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import workspaceMembersService from '../../services/workspace-members'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'

/**
 * Get all members of a workspace
 */
const getWorkspaceMembers = async (req: Request, res: Response) => {
    try {
        const workspaceId = req.params.id
        const members = await workspaceMembersService.getWorkspaceMembers(workspaceId)
        return res.json(members)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Get a specific workspace member
 */
const getWorkspaceMember = async (req: Request, res: Response) => {
    try {
        const workspaceId = req.params.id
        const userId = req.params.userId
        const member = await workspaceMembersService.getWorkspaceMember(workspaceId, userId)
        return res.json(member)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Add a member to a workspace
 */
const addWorkspaceMember = async (req: Request, res: Response) => {
    try {
        const workspaceId = req.params.id
        const memberData = req.body
        
        // Ensure workspaceId is set
        memberData.workspaceId = workspaceId
        
        const member = await workspaceMembersService.addWorkspaceMember(memberData)
        return res.status(StatusCodes.CREATED).json(member)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Update a member's role in a workspace
 */
const updateWorkspaceMember = async (req: Request, res: Response) => {
    try {
        const workspaceId = req.params.id
        const userId = req.params.userId
        const updateData = req.body
        
        const member = await workspaceMembersService.updateWorkspaceMember(workspaceId, userId, updateData)
        return res.json(member)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Remove a member from a workspace
 */
const removeWorkspaceMember = async (req: Request, res: Response) => {
    try {
        const workspaceId = req.params.id
        const userId = req.params.userId
        
        await workspaceMembersService.removeWorkspaceMember(workspaceId, userId)
        return res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

export default {
    getWorkspaceMembers,
    getWorkspaceMember,
    addWorkspaceMember,
    updateWorkspaceMember,
    removeWorkspaceMember
}