/**
 * Authorization Types
 * 
 * This module defines types for the authorization middleware.
 */

import { User } from '@supabase/supabase-js'
import { Request } from 'express'
/**
 * Authentication method
 */
export type AuthMethod = 'none' | 'jwt' | 'apiKey'

/**
 * Organization info
 */
export interface OrganizationInfo {
  id: string
  name: string
}

/**
 * Workspace info
 */
export interface WorkspaceInfo {
  id: string
  name: string
  organizationId: string
}

/**
 * API key info
 */
export interface ApiKeyInfo {
  id: string
  keyName: string
  supabaseUserId: string
}

/**
 * Authentication context
 */
export interface AuthContext {
  // User information
  user: User | null
  
  // Authentication method
  authMethod: AuthMethod
  
  // System admin flag
  isSystemAdmin: boolean
  
  // Organization roles
  organizationRoles: Record<string, string>
  
  // Workspace roles
  workspaceRoles: Record<string, string>
  
  // Permissions
  permissions: string[]
  
  // Organizations
  organizations: Record<string, OrganizationInfo>
  
  // Workspaces
  workspaces: Record<string, WorkspaceInfo>
  
  // Current organization ID
  currentOrganizationId?: string
  
  // Current workspace ID
  currentWorkspaceId?: string
  
  // API key info (if authenticated with API key)
  apiKey?: ApiKeyInfo
}

/**
 * Permission check scope type
 */
export type PermissionScopeType = 'system' | 'organization' | 'workspace' | 'resource'

/**
 * Permission check options
 */
export interface PermissionCheckOptions {
  // Resource type (e.g., 'chatflow', 'credential', 'tool')
  resourceType: string
  
  // Action (e.g., 'read', 'create', 'update', 'delete')
  action: string
  
  // Resource ID (for resource-level permissions)
  resourceId?: string | ((req: Request) => string)
  
  // Scope type (default: 'resource')
  scopeType?: PermissionScopeType
  
  // Allow public access (default: false)
  allowPublic?: boolean
}