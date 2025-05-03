import { Request, Response, NextFunction } from 'express'
import auditLogsService from '../services/audit-logs'
import logger from '../utils/logger'

/**
 * Middleware to log authentication events
 * @param {string} action - The authentication action being performed
 */
export const logAuthEvent = (action: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Store the original end function
        const originalEnd = res.end
        
        // Create a new end function that matches the Express Response interface
        const newEnd = function(
            this: Response,
            chunkOrCallback?: any,
            encodingOrCallback?: BufferEncoding | (() => void),
            callback?: () => void
        ): Response {
            // Restore the original end function
            res.end = originalEnd
            
            // Call the original end function with the correct arguments
            let result: Response;
            
            // Determine which overload is being used and call originalEnd accordingly
            // Use a more aggressive type assertion to bypass TypeScript's type checking
            const typedOriginalEnd = originalEnd as any;
            
            if (typeof chunkOrCallback === 'function') {
                // If the first argument is a function, it's a callback
                result = typedOriginalEnd.apply(this, [null, null, chunkOrCallback]);
            } else if (typeof encodingOrCallback === 'function') {
                // If the second argument is a function, it's a callback
                result = typedOriginalEnd.apply(this, [chunkOrCallback, null, encodingOrCallback]);
            } else {
                // Otherwise, use all three arguments
                result = typedOriginalEnd.apply(this, [chunkOrCallback, encodingOrCallback, callback]);
            }
            
            // Log the authentication event
            const userId = (req as any).user?.id
            const metadata: Record<string, any> = {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                ip: req.ip
            }
            
            // Add request body data (excluding sensitive fields)
            if (req.body) {
                const { password, ...safeBody } = req.body
                metadata.requestData = safeBody
            }
            
            // Log the event asynchronously
            setTimeout(async () => {
                try {
                    await auditLogsService.logUserAction(
                        userId || null,
                        action,
                        'auth',
                        undefined,
                        metadata,
                        req.ip
                    )
                } catch (error) {
                    logger.error(`[AuditLogger] Failed to log auth event: ${error}`)
                }
            }, 0)
            
            return result;
        };
        
        // Replace the end function with type assertion to bypass TypeScript's type checking
        res.end = newEnd as any;
        
        next();
    }
}

/**
 * Middleware to log authorization events
 * @param {string} action - The authorization action being performed
 */
export const logAuthorizationEvent = (action: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Store the original end function
        const originalEnd = res.end
        
        // Create a new end function that matches the Express Response interface
        const newEnd = function(
            this: Response,
            chunkOrCallback?: any,
            encodingOrCallback?: BufferEncoding | (() => void),
            callback?: () => void
        ): Response {
            // Restore the original end function
            res.end = originalEnd
            
            // Call the original end function with the correct arguments
            let result: Response;
            
            // Determine which overload is being used and call originalEnd accordingly
            // Use a more aggressive type assertion to bypass TypeScript's type checking
            const typedOriginalEnd = originalEnd as any;
            
            if (typeof chunkOrCallback === 'function') {
                // If the first argument is a function, it's a callback
                result = typedOriginalEnd.apply(this, [null, null, chunkOrCallback]);
            } else if (typeof encodingOrCallback === 'function') {
                // If the second argument is a function, it's a callback
                result = typedOriginalEnd.apply(this, [chunkOrCallback, null, encodingOrCallback]);
            } else {
                // Otherwise, use all three arguments
                result = typedOriginalEnd.apply(this, [chunkOrCallback, encodingOrCallback, callback]);
            }
            
            // Log the authorization event
            const userId = (req as any).user?.id
            const metadata: Record<string, any> = {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                ip: req.ip,
                permission: (req as any).permission
            }
            
            // Log the event asynchronously
            setTimeout(async () => {
                try {
                    await auditLogsService.logUserAction(
                        userId || null,
                        action,
                        'authorization',
                        undefined,
                        metadata,
                        req.ip
                    )
                } catch (error) {
                    logger.error(`[AuditLogger] Failed to log authorization event: ${error}`)
                }
            }, 0)
            
            return result;
        };
        
        // Replace the end function with type assertion to bypass TypeScript's type checking
        res.end = newEnd as any;
        
        next();
    }
}

/**
 * Middleware to log resource events
 * @param {string} resourceType - The type of resource being accessed
 * @param {string} action - The action being performed on the resource
 */
export const logResourceEvent = (resourceType: string, action: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Store the original end function
        const originalEnd = res.end
        
        // Create a new end function that matches the Express Response interface
        const newEnd = function(
            this: Response,
            chunkOrCallback?: any,
            encodingOrCallback?: BufferEncoding | (() => void),
            callback?: () => void
        ): Response {
            // Restore the original end function
            res.end = originalEnd
            
            // Call the original end function with the correct arguments
            let result: Response;
            
            // Determine which overload is being used and call originalEnd accordingly
            // Use a more aggressive type assertion to bypass TypeScript's type checking
            const typedOriginalEnd = originalEnd as any;
            
            if (typeof chunkOrCallback === 'function') {
                // If the first argument is a function, it's a callback
                result = typedOriginalEnd.apply(this, [null, null, chunkOrCallback]);
            } else if (typeof encodingOrCallback === 'function') {
                // If the second argument is a function, it's a callback
                result = typedOriginalEnd.apply(this, [chunkOrCallback, null, encodingOrCallback]);
            } else {
                // Otherwise, use all three arguments
                result = typedOriginalEnd.apply(this, [chunkOrCallback, encodingOrCallback, callback]);
            }
            
            // Only log successful operations
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const userId = (req as any).user?.id
                
                // Determine resource ID from request
                let resourceId: string | undefined
                if (req.params.id) {
                    resourceId = req.params.id
                } else if (req.body?.id) {
                    resourceId = req.body.id
                }
                
                // Prepare metadata
                const metadata: Record<string, any> = {
                    method: req.method,
                    path: req.path,
                    statusCode: res.statusCode
                }
                
                // Include request body data (excluding sensitive fields)
                if (req.body) {
                    const { password, ...safeBody } = req.body
                    metadata.requestData = safeBody
                }
                
                // Include before/after data if available
                if ((req as any).resourceBefore) {
                    metadata.before = (req as any).resourceBefore
                }
                
                if ((req as any).resourceAfter) {
                    metadata.after = (req as any).resourceAfter
                }
                
                // Log the event asynchronously
                setTimeout(async () => {
                    try {
                        await auditLogsService.logUserAction(
                            userId || null,
                            `${resourceType}_${action}`,
                            resourceType,
                            resourceId,
                            metadata,
                            req.ip
                        )
                    } catch (error) {
                        logger.error(`[AuditLogger] Failed to log resource event: ${error}`)
                    }
                }, 0)
            }
            
            return result;
        };
        
        // Replace the end function with type assertion to bypass TypeScript's type checking
        res.end = newEnd as any;
        
        next();
    }
}

/**
 * Middleware to capture resource state before modification
 * @param {Function} getResourceFn - Function to get the resource by ID
 */
export const captureResourceBefore = (getResourceFn: (id: string) => Promise<any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const resourceId = req.params.id || req.body?.id
            
            if (resourceId) {
                try {
                    const resource = await getResourceFn(resourceId)
                    if (resource) {
                        // Store the resource state before modification
                        (req as any).resourceBefore = resource
                    }
                } catch (error) {
                    // If resource doesn't exist, just continue
                    logger.debug(`[AuditLogger] Resource not found for capturing before state: ${error}`)
                }
            }
        } catch (error) {
            logger.error(`[AuditLogger] Error capturing resource before state: ${error}`)
        }
        
        next()
    }
}

/**
 * Middleware to capture resource state after modification
 * @param {Function} getResourceFn - Function to get the resource by ID
 */
export const captureResourceAfter = (getResourceFn: (id: string) => Promise<any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Store the original end function
        const originalEnd = res.end
        
        // Create a new end function that matches the Express Response interface
        const newEnd = function(
            this: Response,
            chunkOrCallback?: any,
            encodingOrCallback?: BufferEncoding | (() => void),
            callback?: () => void
        ): Response {
            // Restore the original end function
            res.end = originalEnd
            
            // Call the original end function with the correct arguments
            let result: Response;
            
            // Determine which overload is being used and call originalEnd accordingly
            // Use a more aggressive type assertion to bypass TypeScript's type checking
            const typedOriginalEnd = originalEnd as any;
            
            if (typeof chunkOrCallback === 'function') {
                // If the first argument is a function, it's a callback
                result = typedOriginalEnd.apply(this, [null, null, chunkOrCallback]);
            } else if (typeof encodingOrCallback === 'function') {
                // If the second argument is a function, it's a callback
                result = typedOriginalEnd.apply(this, [chunkOrCallback, null, encodingOrCallback]);
            } else {
                // Otherwise, use all three arguments
                result = typedOriginalEnd.apply(this, [chunkOrCallback, encodingOrCallback, callback]);
            }
            
            // Only capture for successful operations
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const resourceId = req.params.id || req.body?.id || (res as any).locals?.resourceId
                
                if (resourceId) {
                    // Capture resource state after modification asynchronously
                    setTimeout(async () => {
                        try {
                            const resource = await getResourceFn(resourceId)
                            if (resource) {
                                // Store the resource state after modification
                                (req as any).resourceAfter = resource
                            }
                        } catch (error) {
                            logger.error(`[AuditLogger] Error capturing resource after state: ${error}`)
                        }
                    }, 0)
                }
            }
            
            return result;
        };
        
        // Replace the end function with type assertion to bypass TypeScript's type checking
        res.end = newEnd as any;
        
        next();
    }
}