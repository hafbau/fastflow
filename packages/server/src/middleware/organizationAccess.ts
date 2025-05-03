import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import organizationMembersService from '../services/organization-members'
import { InternalFastflowError } from '../errors/InternalFastflowError'
import logger from '../utils/logger'

/**
 * Middleware to check if the user has access to the organization
 */
export const checkOrganizationAccess = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.params.id
        const userId = (req as any).user?.id
        
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' })
        }
        
        try {
            // Check if user is a member of the organization
            await organizationMembersService.getOrganizationMember(organizationId, userId)
            next()
        } catch (error) {
            if (error instanceof InternalFastflowError && error.statusCode === StatusCodes.NOT_FOUND) {
                return res.status(StatusCodes.FORBIDDEN).json({ error: 'User does not have access to this organization' })
            }
            throw error
        }
    } catch (error) {
        logger.error(`Organization access check error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' })
    }
}

/**
 * Middleware to check if the user has admin access to the organization
 */
export const checkOrganizationAdminAccess = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.params.id
        const userId = (req as any).user?.id
        
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' })
        }
        
        try {
            // Check if user is a member of the organization with admin role
            const member = await organizationMembersService.getOrganizationMember(organizationId, userId)
            
            if (member.role !== 'admin' && member.role !== 'owner') {
                return res.status(StatusCodes.FORBIDDEN).json({ error: 'User does not have admin access to this organization' })
            }
            
            next()
        } catch (error) {
            if (error instanceof InternalFastflowError && error.statusCode === StatusCodes.NOT_FOUND) {
                return res.status(StatusCodes.FORBIDDEN).json({ error: 'User does not have access to this organization' })
            }
            throw error
        }
    } catch (error) {
        logger.error(`Organization admin access check error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' })
    }
}