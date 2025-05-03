import { Request, Response, NextFunction } from 'express'
import rateLimitService from '../services/rateLimit'
import logger from '../utils/logger'

/**
 * Middleware for rate limiting authentication endpoints
 * @param subtype Authentication endpoint subtype (register, resetPassword)
 * @returns Rate limiter middleware
 */
export const authRateLimiter = (subtype: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limiter = await rateLimitService.authRateLimiter(subtype)
            return limiter(req, res, next)
        } catch (error) {
            logger.error(`Error applying auth rate limiter: ${error}`)
            next()
        }
    }
}

/**
 * Middleware for rate limiting API key endpoints
 * @param subtype API key endpoint subtype (create, verify)
 * @returns Rate limiter middleware
 */
export const apiKeyRateLimiter = (subtype: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limiter = await rateLimitService.apiKeyRateLimiter(subtype)
            return limiter(req, res, next)
        } catch (error) {
            logger.error(`Error applying API key rate limiter: ${error}`)
            next()
        }
    }
}

/**
 * Middleware for rate limiting API endpoints
 * @param subtype API endpoint subtype (default, read, write)
 * @returns Rate limiter middleware
 */
export const apiRateLimiter = (subtype: string = 'default') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limiter = await rateLimitService.apiRateLimiter(subtype)
            return limiter(req, res, next)
        } catch (error) {
            logger.error(`Error applying API rate limiter: ${error}`)
            next()
        }
    }
}

/**
 * Middleware for dynamic rate limiting based on request properties
 * @returns Rate limiter middleware
 */
export const dynamicRateLimiter = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limiter = rateLimitService.dynamicRateLimiter()
            return limiter(req, res, next)
        } catch (error) {
            logger.error(`Error applying dynamic rate limiter: ${error}`)
            next()
        }
    }
}

/**
 * Apply exponential backoff for repeated failures
 * @param maxAttempts Maximum number of attempts before applying exponential backoff
 * @param baseDelay Base delay in milliseconds
 * @returns Middleware function
 */
export const exponentialBackoff = (maxAttempts: number = 3, baseDelay: number = 1000) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip || 'unknown'
        const endpoint = req.originalUrl
        const key = `${ip}:${endpoint}`

        // Use Redis to track failed attempts
        const redisClient = (rateLimitService as any).redisClient

        // Skip if Redis is not available
        if (!redisClient) {
            return next()
        }

        // Get failed attempts count
        redisClient.get(`backoff:${key}`).then((attemptsStr: string | null) => {
            const attempts = attemptsStr ? parseInt(attemptsStr) : 0

            // If attempts exceed max, apply exponential backoff
            if (attempts >= maxAttempts) {
                const delay = baseDelay * Math.pow(2, attempts - maxAttempts)
                const retryAfter = Math.min(delay, 60 * 60 * 1000) // Cap at 1 hour

                // Set retry-after header
                res.set('Retry-After', Math.ceil(retryAfter / 1000).toString())

                // Return 429 Too Many Requests
                return res.status(429).json({
                    success: false,
                    error: `Too many failed attempts. Please try again after ${Math.ceil(retryAfter / 1000)} seconds.`
                })
            }

            // Store original end function to intercept response
            const originalEnd = res.end
            res.end = function (chunk?: any, encoding?: any) {
                // Restore original end function
                res.end = originalEnd

                // If response is an error (4xx or 5xx), increment failed attempts
                if (res.statusCode >= 400) {
                    redisClient.incr(`backoff:${key}`)
                    // Set expiration to prevent keys from accumulating
                    redisClient.expire(`backoff:${key}`, 60 * 60) // 1 hour
                } else if (attempts > 0) {
                    // If successful after previous failures, reset counter
                    redisClient.del(`backoff:${key}`)
                }

                // Call original end function
                return originalEnd.call(this, chunk, encoding)
            }

            next()
        }).catch((error: any) => {
            logger.error(`Error applying exponential backoff: ${error}`)
            next()
        })
    }
}