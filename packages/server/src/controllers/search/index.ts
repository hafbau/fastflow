import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import searchService from '../../services/search'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'

/**
 * Search organizations
 */
const searchOrganizations = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id
        
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' })
        }
        
        const query = req.query.q as string || ''
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10
        const offset = req.query.offset ? parseInt(req.query.offset as string) : 0
        
        const result = await searchService.searchOrganizations(userId, query, { limit, offset })
        return res.json(result)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Search workspaces
 */
const searchWorkspaces = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id
        
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' })
        }
        
        const query = req.query.q as string || ''
        const organizationId = req.query.organizationId as string
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10
        const offset = req.query.offset ? parseInt(req.query.offset as string) : 0
        
        const result = await searchService.searchWorkspaces(userId, query, { 
            organizationId, 
            limit, 
            offset 
        })
        return res.json(result)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

export default {
    searchOrganizations,
    searchWorkspaces
}