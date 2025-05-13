/**
 * User Context Middleware
 * 
 * This module provides middleware for creating user context with organization
 * and workspace information.
 */

import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { AuthContext } from './types'
import UserService from '../../services/UserService'
import UserOrganizationService from '../../services/UserOrganizationService'
import WorkspaceMemberService from '../../services/WorkspaceMemberService'
import { RolesPermissionsService } from '../../services/RolesPermissionsService'

// Import the service factory
import { createService } from '../../services-factory'

/**
 * Middleware to create user context with organization and workspace information
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const createUserContext = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get user from request (set by JWT verification middleware)
    const user = (req as any).user
    const authMethod = (req as any).authMethod || 'none'
    
    // Create default auth context
    const authContext: AuthContext = {
      user: user,
      authMethod: authMethod as any,
      // TODO: Set this to false later
      isSystemAdmin: true,
      organizationRoles: {},
      workspaceRoles: {},
      permissions: [],
      workspaces: {},
      organizations: {}
    }
    
    // If no user, set empty context and continue
    if (!user) {
      (req as any).authContext = authContext
      return next()
    }
    
    try {
      // Create service instances using the factory
      const userOrganizationService = await createService(UserOrganizationService)
      const workspaceMemberService = await createService(WorkspaceMemberService)
      const rolesPermissionsService = await createService(RolesPermissionsService)
      
      // Get user's organizations and roles
      const userOrgs = await userOrganizationService.getUserOrganizations(user.id)
      
      // Get user's organization roles
      for (const org of userOrgs) {
        const orgRole = await userOrganizationService.getUserRole(user.id, org.id)
        
        // Add organization to context
        authContext.organizations[org.id] = {
          id: org.id,
          name: org.name
        }
        
        // Add organization role to context
        if (orgRole) {
          authContext.organizationRoles[org.id] = orgRole
          
          // Check if user is system admin (has admin role in any organization)
          if (orgRole === 'admin' || orgRole === 'owner') {
            authContext.isSystemAdmin = true
          }
        }
      }
      
      // Get user's workspaces and roles
      const userWorkspaces = await workspaceMemberService.getUserWorkspaces(user.id)
      
      for (const workspace of userWorkspaces) {
        const workspaceRole = await workspaceMemberService.getUserRole(user.id, workspace.id)
        
        // Add workspace to context
        authContext.workspaces[workspace.id] = {
          id: workspace.id,
          name: workspace.name,
          organizationId: workspace.organizationId
        }
        
        // Add workspace role to context
        if (workspaceRole) {
          authContext.workspaceRoles[workspace.id] = workspaceRole
        }
      }
      
      // Get user's permissions
      const userPermissions = await rolesPermissionsService.getUserPermissions(user.id)
      authContext.permissions = userPermissions.map((p: any) => `${p.resourceType}:${p.action}`)
      
      // Set current organization and workspace context from query parameters or headers
      if (req.query.organizationId) {
        authContext.currentOrganizationId = req.query.organizationId as string
      } else if (req.headers['x-organization-id']) {
        authContext.currentOrganizationId = req.headers['x-organization-id'] as string
      }
      
      if (req.query.workspaceId) {
        authContext.currentWorkspaceId = req.query.workspaceId as string
      } else if (req.headers['x-workspace-id']) {
        authContext.currentWorkspaceId = req.headers['x-workspace-id'] as string
      }
      
      // Validate current organization and workspace context
      if (authContext.currentOrganizationId && !authContext.organizations[authContext.currentOrganizationId]) {
        // Organization not found or user doesn't have access
        authContext.currentOrganizationId = undefined
      }
      
      if (authContext.currentWorkspaceId) {
        const workspace = authContext.workspaces[authContext.currentWorkspaceId]
        
        if (!workspace) {
          // Workspace not found or user doesn't have access
          authContext.currentWorkspaceId = undefined
        } else if (authContext.currentOrganizationId && workspace.organizationId !== authContext.currentOrganizationId) {
          // Workspace doesn't belong to the current organization
          authContext.currentWorkspaceId = undefined
        }
      }
      
      // If API key authentication, add API key info to context
      if (authMethod === 'apiKey') {
        const apiKey = (req as any).apiKey
        if (apiKey) {
          authContext.apiKey = {
            id: apiKey.id,
            keyName: apiKey.keyName,
            supabaseUserId: apiKey.supabaseUserId
          }
        }
      }
      
      // Attach auth context to request
      (req as any).authContext = authContext
      
      return next()
    } catch (error) {
      // Set empty context and continue
      (req as any).authContext = authContext
      return next()
    }
  } catch (error) {
    // If there's an error, continue with empty context
    (req as any).authContext = {
      user: null,
      authMethod: 'none',
      isSystemAdmin: false,
      organizationRoles: {},
      workspaceRoles: {},
      permissions: [],
      workspaces: {},
      organizations: {}
    }
    
    return next()
  }
}

/**
 * Get the current organization ID from the request
 * 
 * @param req - Express request object
 * @returns The current organization ID or undefined
 */
export const getCurrentOrganizationId = (req: Request): string | undefined => {
  const authContext = (req as any).authContext as AuthContext
  
  if (!authContext) {
    return undefined
  }
  
  return authContext.currentOrganizationId
}

/**
 * Get the current workspace ID from the request
 * 
 * @param req - Express request object
 * @returns The current workspace ID or undefined
 */
export const getCurrentWorkspaceId = (req: Request): string | undefined => {
  const authContext = (req as any).authContext as AuthContext
  
  if (!authContext) {
    return undefined
  }
  
  return authContext.currentWorkspaceId
}

/**
 * Set the current organization ID in the request
 * 
 * @param req - Express request object
 * @param organizationId - Organization ID to set
 * @returns Whether the organization ID was set successfully
 */
export const setCurrentOrganizationId = (req: Request, organizationId: string): boolean => {
  const authContext = (req as any).authContext as AuthContext
  
  if (!authContext || !authContext.organizations[organizationId]) {
    return false
  }
  
  authContext.currentOrganizationId = organizationId
  
  // If current workspace is set and doesn't belong to this organization, clear it
  if (authContext.currentWorkspaceId) {
    const workspace = authContext.workspaces[authContext.currentWorkspaceId]
    
    if (workspace && workspace.organizationId !== organizationId) {
      authContext.currentWorkspaceId = undefined
    }
  }
  
  return true
}

/**
 * Set the current workspace ID in the request
 * 
 * @param req - Express request object
 * @param workspaceId - Workspace ID to set
 * @returns Whether the workspace ID was set successfully
 */
export const setCurrentWorkspaceId = (req: Request, workspaceId: string): boolean => {
  const authContext = (req as any).authContext as AuthContext
  
  if (!authContext || !authContext.workspaces[workspaceId]) {
    return false
  }
  
  const workspace = authContext.workspaces[workspaceId]
  
  // Set current organization to workspace's organization
  authContext.currentOrganizationId = workspace.organizationId
  authContext.currentWorkspaceId = workspaceId
  
  return true
}