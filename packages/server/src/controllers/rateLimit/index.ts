import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import rateLimitService from '../../services/rateLimit'
import logger from '../../utils/logger'

/**
 * Get rate limiting statistics
 * @param req Express request
 * @param res Express response
 */
export const getRateLimitStats = async (req: Request, res: Response) => {
    try {
        const stats = await (rateLimitService as any).getRateLimitStats()
        return res.json({
            success: true,
            data: stats
        })
    } catch (error) {
        logger.error(`Error getting rate limit stats: ${error}`)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Failed to retrieve rate limit statistics'
        })
    }
}

/**
 * Get rate limiting events
 * @param req Express request
 * @param res Express response
 */
export const getRateLimitEvents = async (req: Request, res: Response) => {
    try {
        const events = await (rateLimitService as any).getRateLimitEvents()
        return res.json({
            success: true,
            data: events
        })
    } catch (error) {
        logger.error(`Error getting rate limit events: ${error}`)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Failed to retrieve rate limit events'
        })
    }
}

/**
 * Clear rate limiting events
 * @param req Express request
 * @param res Express response
 */
export const clearRateLimitEvents = async (req: Request, res: Response) => {
    try {
        await (rateLimitService as any).clearRateLimitEvents()
        return res.json({
            success: true,
            message: 'Rate limit events cleared successfully'
        })
    } catch (error) {
        logger.error(`Error clearing rate limit events: ${error}`)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Failed to clear rate limit events'
        })
    }
}

export default {
    getRateLimitStats,
    getRateLimitEvents,
    clearRateLimitEvents
}