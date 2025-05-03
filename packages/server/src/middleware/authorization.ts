import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import logger from '../utils/logger'
import auditLogsService from '../services/audit-logs'

/**
 * Middleware to check if the user has the required permission
 * @param permission Permission to check
 */
export const checkPermission = (permission: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user
            
            // If no user is authenticated, deny access
            if (!user) {
                res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Authentication required' })
                return
            }
            
            // Get organization and workspace context from request
            const organizationId = req.headers['x-organization-id'] as string
            const workspaceId = req.headers['x-workspace-id'] as string
            
            // For now, we'll implement a simple permission check
            // In a real implementation, this would check against the roles and permissions system
            
            // Check if user has admin role (temporary implementation)
            const isAdmin = user.app_metadata?.roles?.includes('admin') || false
            
            // If user is admin, allow access
            if (isAdmin) {
                next()
                return
            }
            
            // For non-admin users, check specific permissions
            // This is a placeholder for the actual permission check
            const hasPermission = await checkUserPermission(user.id, permission, organizationId, workspaceId)
            
            if (hasPermission) {
                next()
            } else {
                // Log access denied
                await auditLogsService.logUserAction(
                    user.id,
                    'access_denied',
                    'authorization',
                    undefined,
                    {
                        permission,
                        organizationId,
                        workspaceId,
                        method: req.method,
                        path: req.path
                    },
                    req.ip
                )
                
                res.status(StatusCodes.FORBIDDEN).json({ 
                    error: 'You do not have permission to perform this action' 
                })
            }
        } catch (error) {
            logger.error(`Authorization error: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                error: 'Authorization error' 
            })
        }
    }
}

/**
 * Check if a user has a specific permission
 * @param userId User ID
 * @param permission Permission to check
 * @param organizationId Organization context
 * @param workspaceId Workspace context
 */
async function checkUserPermission(
    userId: string, 
    permission: string, 
    organizationId?: string, 
    workspaceId?: string
): Promise<boolean> {
    // This is a placeholder for the actual permission check
    // In a real implementation, this would check against the roles and permissions system
    
    // For now, we'll return true for all permission checks
    // This should be replaced with the actual permission check logic
    return true
}