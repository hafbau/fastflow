import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import { getRunningExpressApp } from '../utils/getRunningExpressApp'
import { UserProfile } from '../database/entities/UserProfile'

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: UserProfile
        }
    }
}

/**
 * Middleware to authenticate user based on JWT token
 */
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: 'Authentication required'
            })
        }

        const token = authHeader.split(' ')[1]
        
        // Verify token
        const secret = process.env.JWT_SECRET || 'default_jwt_secret'
        const decoded = jwt.verify(token, secret) as { id: string }
        
        if (!decoded || !decoded.id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: 'Invalid token'
            })
        }
        
        // Get user from database
        const appServer = getRunningExpressApp()
        const user = await appServer.AppDataSource.getRepository(UserProfile).findOne({
            where: { id: decoded.id }
        })
        
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: 'User not found'
            })
        }
        
        // Attach user to request
        req.user = user
        
        next()
    } catch (error) {
        console.error('Authentication error:', error)
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'Authentication failed'
        })
    }
}