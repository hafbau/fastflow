/**
 * Multi-Tenant Permission Middleware
 * 
 * This middleware checks permissions for multi-tenant API endpoints.
 * It verifies both organization/workspace-level permissions and resource-level permissions.
 */

import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { permissionService } from '../../services/roles-permissions/PermissionService'
import { InternalFastflowError } from '../../errors/InternalFastflowError'

interface MultiTenantPermissionOptions {
  // Organization or workspace
  tenantType: 'organization' | 'workspace'
  // The param name for the tenant ID (e.g., 'organizationId', 'workspaceId')
  tenantIdParam: string
  // The resource type (e.g., 'chatflow', 'credential')
  resourceType: string
  // The action to perform (e.g., 'create', 'read', 'update', 'delete')
  action: string
  // Optional function to extract the resource ID from the request
  resourceId?: (req: Request) => string
}
/**
 * Check multi-tenant permissions middleware
 * 
 * This middleware checks both tenant-level permissions and resource-level permissions.
 * 
 * @param options - Permission check options
 * @returns Express middleware function
 */
export const checkMultiTenantPermission = (options: MultiTenantPermissionOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: 'Authentication required'
        })
      }

      const userId = req.user.id
      const tenantId = req.params[options.tenantIdParam]

      if (!tenantId) {
        throw new InternalFastflowError(
          StatusCodes.BAD_REQUEST,
          `${options.tenantIdParam} parameter is required`
        )
      }

      // 1. Check tenant-level permission
      const hasTenantPermission = await permissionService.hasPermission(
        userId,
        options.tenantType,
        tenantId,
        options.action === 'read' ? 'read' : 'update'
      )

      if (!hasTenantPermission) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: `You do not have permission to ${options.action} resources in this ${options.tenantType}`
        })
      }

      // 2. Check resource-level permission
      const resourceId = options.resourceId ? options.resourceId(req) : '*'
      
      const hasResourcePermission = await permissionService.hasPermission(
        userId,
        options.resourceType,
        resourceId,
        options.action
      )

      if (!hasResourcePermission) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: `You do not have permission to ${options.action} this ${options.resourceType}`
        })
      }

      // Both permissions granted, proceed
      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Create multi-tenant authorization middleware
 * 
 * This function creates middleware that checks both tenant-level and resource-level permissions.
 * 
 * @param options - Permission check options
 * @returns Express middleware function array
 */
export const authorizeMultiTenant = (options: MultiTenantPermissionOptions) => {
  return [
    checkMultiTenantPermission(options)
  ]
}