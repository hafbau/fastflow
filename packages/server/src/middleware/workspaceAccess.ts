import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import workspaceMembersService from '../services/workspace-members'
import workspacesService from '../services/workspaces'
import organizationMembersService from '../services/organization-members'
import { InternalFastflowError } from '../errors/InternalFastflowError'
import logger from '../utils/logger'

/**
 * Middleware to check if the user has access to the workspace
 */
export const checkWorkspaceAccess = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const workspaceId = req.params.id
        const userId = (req as any).user?.id
        
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' })
        }
        
        try {
            // Check if user is a member of the workspace
            await workspaceMembersService.getWorkspaceMember(workspaceId, userId)
            next()
        } catch (error) {
            if (error instanceof InternalFastflowError && error.statusCode === StatusCodes.NOT_FOUND) {
                // If not a direct workspace member, check if user is an admin of the parent organization
                try {
                    const workspace = await workspacesService.getWorkspaceById(workspaceId)
                    const orgMember = await organizationMembersService.getOrganizationMember(workspace.organizationId, userId)
                    
                    // Organization admins and owners have access to all workspaces
                    if (orgMember.role === 'admin' || orgMember.role === 'owner') {
                        return next()
                    }
                } catch (orgError) {
                    // If any error occurs during org check, continue with the original error
                }
                
                return res.status(StatusCodes.FORBIDDEN).json({ error: 'User does not have access to this workspace' })
            }
            throw error
        }
    } catch (error) {
        logger.error(`Workspace access check error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' })
    }
}

/**
 * Middleware to check if the user has admin access to the workspace
 */
export const checkWorkspaceAdminAccess = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const workspaceId = req.params.id
        const userId = (req as any).user?.id
        
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' })
        }
        
        try {
            // Check if user is a member of the workspace with admin role
            const member = await workspaceMembersService.getWorkspaceMember(workspaceId, userId)
            
            if (member.role === 'admin' || member.role === 'owner') {
                return next()
            }
            
            // If not a workspace admin, check if user is an admin of the parent organization
            const workspace = await workspacesService.getWorkspaceById(workspaceId)
            const orgMember = await organizationMembersService.getOrganizationMember(workspace.organizationId, userId)
            
            // Organization admins and owners have admin access to all workspaces
            if (orgMember.role === 'admin' || orgMember.role === 'owner') {
                return next()
            }
            
            return res.status(StatusCodes.FORBIDDEN).json({ error: 'User does not have admin access to this workspace' })
        } catch (error) {
            if (error instanceof InternalFastflowError && error.statusCode === StatusCodes.NOT_FOUND) {
                return res.status(StatusCodes.FORBIDDEN).json({ error: 'User does not have access to this workspace' })
            }
            throw error
        }
    } catch (error) {
        logger.error(`Workspace admin access check error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' })
    }
}