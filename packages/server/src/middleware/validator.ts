import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'

/**
 * Middleware to validate request body
 * @param {string[]} requiredFields - Array of required field names
 * @returns {Function} Express middleware
 */
export const validateRequestBody = (requiredFields: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const missingFields = requiredFields.filter(field => !req.body[field])
        
        if (missingFields.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            })
        }
        
        next()
    }
}

/**
 * Middleware to validate request query parameters
 * @param {string[]} requiredParams - Array of required query parameter names
 * @returns {Function} Express middleware
 */
export const validateQueryParams = (requiredParams: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const missingParams = requiredParams.filter(param => !req.query[param])
        
        if (missingParams.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: `Missing required query parameters: ${missingParams.join(', ')}`
            })
        }
        
        next()
    }
}

/**
 * Middleware to validate request path parameters
 * @param {string[]} requiredParams - Array of required path parameter names
 * @returns {Function} Express middleware
 */
export const validatePathParams = (requiredParams: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const missingParams = requiredParams.filter(param => !req.params[param])
        
        if (missingParams.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: `Missing required path parameters: ${missingParams.join(', ')}`
            })
        }
        
        next()
    }
}