/**
 * Permission Checking Middleware
 * 
 * This module provides middleware for checking user permissions.
 */

import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { AuthContext, PermissionCheckOptions } from './types'
import { getCurrentOrganizationId, getCurrentWorkspaceId } from './userContext'
import rolesPermissionsService from '../../services/RolesPermissionsService'
import resourcePermissionService from '../../services/ResourcePermissionService'

/**
 * Check if user has permission to perform an action
 * 
 * @param options - Permission check options
 * @returns Express middleware function
 */
export const checkPermission = (options: PermissionCheckOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authContext = (req as any).authContext as AuthContext
      
      // If no auth context, deny access
      if (!authContext) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        })
        return
      }
      
      // If public access is allowed and no user is authenticated, allow access
      if (options.allowPublic && !authContext.user) {
        next()
        return
      }
      
      // If no user is authenticated, deny access
      if (!authContext.user) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        })
        return
      }
      
      // System admins have access to everything
      if (authContext.isSystemAdmin) {
        next()
        return
      }
      
      // Check permission based on scope
      const scopeType = options.scopeType || 'resource'
      
      switch (scopeType) {
        case 'system':
          // System-level permission check
          if (hasSystemPermission(authContext, options.resourceType, options.action)) {
            next()
            return
          }
          break
          
        case 'organization':
          // Organization-level permission check
          const organizationId = getCurrentOrganizationId(req)
          
          if (organizationId && hasOrganizationPermission(authContext, organizationId, options.resourceType, options.action)) {
            next()
            return
          }
          break
          
        case 'workspace':
          // Workspace-level permission check
          const workspaceId = getCurrentWorkspaceId(req)
          
          if (workspaceId && hasWorkspacePermission(authContext, workspaceId, options.resourceType, options.action)) {
            next()
            return
          }
          break
          
        case 'resource':
          // Resource-level permission check
          const rId = typeof options.resourceId === 'function' ? options.resourceId(req) : options.resourceId
          const resourceId = rId || req.params.id
          
          if (resourceId && await hasResourcePermission(authContext, options.resourceType, options.action, resourceId)) {
            next()
            return
          }
          break
      }
      
      // If we get here, the user doesn't have permission
      res.status(StatusCodes.FORBIDDEN).json({
        error: 'Forbidden',
        message: 'You do not have permission to perform this action'
      })
    } catch (error) {
      // If there's an error, deny access
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An error occurred while checking permissions'
      })
    }
  }
}

/**
 * Check if user has system-level permission
 * 
 * @param authContext - Auth context
 * @param resourceType - Resource type
 * @param action - Action
 * @returns Whether the user has permission
 */
export const hasSystemPermission = (
  authContext: AuthContext,
  resourceType: string,
  action: string
): boolean => {
  // Check if user has the permission
  const permissionName = `${resourceType}:${action}`
  return authContext.permissions.includes(permissionName)
}

/**
 * Check if user has organization-level permission
 * 
 * @param authContext - Auth context
 * @param organizationId - Organization ID
 * @param resourceType - Resource type
 * @param action - Action
 * @returns Whether the user has permission
 */
export const hasOrganizationPermission = (
  authContext: AuthContext,
  organizationId: string,
  resourceType: string,
  action: string
): boolean => {
  // Check if user is a member of the organization
  if (!authContext.organizationRoles[organizationId]) {
    return false
  }
  
  // Check if user has the permission
  const permissionName = `${resourceType}:${action}`
  return authContext.permissions.includes(permissionName)
}

/**
 * Check if user has workspace-level permission
 * 
 * @param authContext - Auth context
 * @param workspaceId - Workspace ID
 * @param resourceType - Resource type
 * @param action - Action
 * @returns Whether the user has permission
 */
export const hasWorkspacePermission = (
  authContext: AuthContext,
  workspaceId: string,
  resourceType: string,
  action: string
): boolean => {
  // Check if user is a member of the workspace
  if (!authContext.workspaceRoles[workspaceId]) {
    return false
  }
  
  // Check if user has the permission
  const permissionName = `${resourceType}:${action}`
  return authContext.permissions.includes(permissionName)
}

/**
 * Check if user has resource-level permission
 * 
 * @param authContext - Auth context
 * @param resourceType - Resource type
 * @param action - Action
 * @param resourceId - Resource ID
 * @returns Whether the user has permission
 */
export const hasResourcePermission = async (
  authContext: AuthContext,
  resourceType: string,
  action: string,
  resourceId: string
): Promise<boolean> => {
  // If user has no permissions, deny access
  if (!authContext.user) {
    return false
  }
  
  // Check if user has the permission
  const permissionName = `${resourceType}:${action}`
  
  // First check if user has the permission in their context
  if (authContext.permissions.includes(permissionName)) {
    return true
  }
  
  // If not, check for resource-specific permissions
  try {
    // Check if the user has a direct resource permission
    const hasDirectPermission = await resourcePermissionService.hasResourcePermission(
      authContext.user.id,
      resourceType,
      resourceId,
      action
    )
    
    if (hasDirectPermission) {
      return true
    }
    
    // If no direct resource permission, fall back to role-based permissions
    return await rolesPermissionsService.hasPermission(
      authContext.user.id,
      resourceType,
      action
    )
  } catch (error) {
    // If there's an error, deny access
    return false
  }
}