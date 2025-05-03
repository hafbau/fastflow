/**
 * Authorization Middleware
 * 
 * This module provides middleware for authorization and access control.
 */

import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { verifyJWT } from './jwtVerification'
import { createUserContext } from './userContext'
import { checkPermission } from './permissionCheck'
import { PermissionCheckOptions, AuthContext } from './types'

/**
 * Authentication middleware
 * 
 * This middleware verifies the user's authentication and creates the user context.
 */
export const authenticate = [
  verifyJWT,
  createUserContext
]

/**
 * Authorization middleware
 * 
 * This middleware checks if the user has permission to perform an action.
 * 
 * @param options - Permission check options
 * @returns Express middleware function
 */
export const authorize = (options: PermissionCheckOptions) => {
  return [
    ...authenticate,
    checkPermission(options)
  ]
}

/**
 * System admin middleware
 * 
 * This middleware checks if the user is a system administrator.
 */
export const requireSystemAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authContext = (req as any).authContext as AuthContext
  
  if (!authContext || !authContext.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    })
  }
  
  if (!authContext.isSystemAdmin) {
    return res.status(StatusCodes.FORBIDDEN).json({
      error: 'Forbidden',
      message: 'System administrator access required'
    })
  }
  
  next()
}

/**
 * Organization admin middleware
 * 
 * This middleware checks if the user is an organization administrator.
 * 
 * @param organizationIdParam - Name of the parameter containing the organization ID
 */
export const requireOrganizationAdmin = (organizationIdParam: string = 'organizationId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authContext = (req as any).authContext as AuthContext
    
    if (!authContext || !authContext.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      })
    }
    
    // Get organization ID from request parameters or query
    const organizationId = req.params[organizationIdParam] || 
                          (req.query[organizationIdParam] as string)
    
    if (!organizationId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Bad Request',
        message: 'Organization ID is required'
      })
    }
    
    // Check if user is an admin of the organization
    const role = authContext.organizationRoles[organizationId as string]
    
    if (!role || (role !== 'admin' && role !== 'owner')) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: 'Forbidden',
        message: 'Organization administrator access required'
      })
    }
    
    next()
  }
}

/**
 * Workspace admin middleware
 * 
 * This middleware checks if the user is a workspace administrator.
 * 
 * @param workspaceIdParam - Name of the parameter containing the workspace ID
 */
export const requireWorkspaceAdmin = (workspaceIdParam: string = 'workspaceId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authContext = (req as any).authContext as AuthContext
    
    if (!authContext || !authContext.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      })
    }
    
    // Get workspace ID from request parameters or query
    const workspaceId = req.params[workspaceIdParam] || 
                       (req.query[workspaceIdParam] as string)
    
    if (!workspaceId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Bad Request',
        message: 'Workspace ID is required'
      })
    }
    
    // Check if user is an admin of the workspace
    const role = authContext.workspaceRoles[workspaceId as string]
    
    if (!role || (role !== 'admin' && role !== 'owner')) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: 'Forbidden',
        message: 'Workspace administrator access required'
      })
    }
    
    next()
  }
}

/**
 * Resource owner middleware
 * 
 * This middleware checks if the user is the owner of a resource.
 * 
 * @param resourceIdParam - Name of the parameter containing the resource ID
 * @param resourceType - Type of resource
 */
export const requireResourceOwner = (resourceIdParam: string = 'id', resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authContext = (req as any).authContext as AuthContext
    
    if (!authContext || !authContext.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      })
    }
    
    // Get resource ID from request parameters
    const resourceId = req.params[resourceIdParam]
    
    if (!resourceId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Bad Request',
        message: 'Resource ID is required'
      })
    }
    
    // System admins can access any resource
    if (authContext.isSystemAdmin) {
      return next()
    }
    
    // Check if user is the owner of the resource
    try {
      // This would need to be implemented based on your resource ownership model
      // For now, we'll just use the permission check
      const hasPermission = await checkPermission({
        resourceType,
        action: 'owner',
        resourceId,
        scopeType: 'resource'
      })(req, res, () => {})
      
      // If we get here, the user has permission
      next()
    } catch (error) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: 'Forbidden',
        message: 'Resource owner access required'
      })
    }
  }
}

// Export all middleware components
export { verifyJWT } from './jwtVerification'
export { createUserContext, getCurrentOrganizationId, getCurrentWorkspaceId } from './userContext'
export { checkPermission, hasSystemPermission, hasOrganizationPermission, hasWorkspacePermission, hasResourcePermission } from './permissionCheck'
export { AuthContext, PermissionCheckOptions } from './types'