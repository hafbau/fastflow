import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import logger from '../../utils/logger'
import attributeService from './AttributeService'
import permissionExpressionService from './PermissionExpressionService'
import conditionalPermissionService from './ConditionalPermissionService'
import timeBasedPermissionService from './TimeBasedPermissionService'
import rolesPermissionsService from '../RolesPermissionsService'
import resourcePermissionService from '../ResourcePermissionService'
import { createClient } from 'redis'
import config from '../../config'

/**
 * Service for managing fine-grained permissions
 * Integrates attribute-based access control, conditional permissions, and time-based permissions
 */
export class FineGrainedPermissionService {
    private redisClient: any

    /**
     * Constructor
     */
    constructor() {
        // Initialize Redis client if needed
        // this.initializeRedisClient()
    }

    /**
     * Initialize Redis client for caching
     */
    private async initializeRedisClient() {
        try {
            this.redisClient = createClient({
                url: 'redis://localhost:6379' // Default Redis URL
            })
            
            await this.redisClient.connect()
            
            this.redisClient.on('error', (err: any) => {
                logger.error(`[FineGrainedPermissionService] Redis client error: ${err.message}`)
            })
        } catch (error: any) {
            logger.error(`[FineGrainedPermissionService] Redis client initialization error: ${error.message}`)
        }
    }

    /**
     * Get cache key for permission checks
     */
    private getCacheKey(userId: string, resourceType: string, resourceId: string, action: string): string {
        return `fine_grained_permission:${userId}:${resourceType}:${resourceId}:${action}`
    }

    /**
     * Check if a user has permission for a specific resource and action
     * This method integrates all permission types:
     * 1. Role-based permissions
     * 2. Resource-specific permissions
     * 3. Conditional permissions
     * 4. Time-based permissions
     */
    async hasPermission(
        userId: string,
        resourceType: string,
        resourceId: string,
        action: string,
        context: Record<string, any> = {}
    ): Promise<boolean> {
        try {
            // Check cache first
            if (this.redisClient) {
                const cacheKey = this.getCacheKey(userId, resourceType, resourceId, action)
                const cachedResult = await this.redisClient.get(cacheKey)
                
                if (cachedResult !== null) {
                    return cachedResult === 'true'
                }
            }
            
            // Prepare context for permission evaluation
            const permissionContext = {
                userId,
                resourceType,
                resourceId,
                action,
                ...context
            }
            
            // Step 1: Check if the user has direct resource permission
            const hasResourcePermission = await resourcePermissionService.hasResourcePermission(
                userId,
                resourceType,
                resourceId,
                action
            )
            
            if (hasResourcePermission) {
                // Cache the result
                if (this.redisClient) {
                    const cacheKey = this.getCacheKey(userId, resourceType, resourceId, action)
                    await this.redisClient.set(cacheKey, 'true', {
                        EX: 60 // Cache for 1 minute
                    })
                }
                
                return true
            }
            
            // Step 2: Check if the user has role-based permission
            const hasRolePermission = await rolesPermissionsService.hasPermission(
                userId,
                resourceType,
                action
            )
            
            if (!hasRolePermission) {
                // If the user doesn't have the basic permission through roles,
                // there's no need to check conditional or time-based permissions
                
                // Cache the result
                if (this.redisClient) {
                    const cacheKey = this.getCacheKey(userId, resourceType, resourceId, action)
                    await this.redisClient.set(cacheKey, 'false', {
                        EX: 60 // Cache for 1 minute
                    })
                }
                
                return false
            }
            
            // Get the permission ID for the resource type and action
            const permissions = await rolesPermissionsService.getPermissionsByResourceType(resourceType)
            const permission = permissions.find(p => p.action === action)
            
            if (!permission) {
                // Permission doesn't exist
                return false
            }
            
            // Step 3: Check time-based permissions
            const hasTimeBasedPermission = await timeBasedPermissionService.hasTimeBasedPermission(
                userId,
                permission.id,
                resourceType,
                resourceId
            )
            
            if (hasTimeBasedPermission) {
                // Cache the result
                if (this.redisClient) {
                    const cacheKey = this.getCacheKey(userId, resourceType, resourceId, action)
                    await this.redisClient.set(cacheKey, 'true', {
                        EX: 60 // Cache for 1 minute
                    })
                }
                
                return true
            }
            
            // Step 4: Check conditional permissions
            const hasConditionalPermission = await conditionalPermissionService.hasConditionalPermission(
                userId,
                permission.id,
                permissionContext
            )
            
            // Cache the result
            if (this.redisClient) {
                const cacheKey = this.getCacheKey(userId, resourceType, resourceId, action)
                await this.redisClient.set(cacheKey, hasConditionalPermission.toString(), {
                    EX: 60 // Cache for 1 minute
                })
            }
            
            return hasConditionalPermission
        } catch (error: any) {
            logger.error(`[FineGrainedPermissionService] Check permission error: ${error.message}`)
            return false
        }
    }

    /**
     * Batch check permissions for multiple actions on a resource
     */
    async batchCheckPermissions(
        userId: string,
        resourceType: string,
        resourceId: string,
        actions: string[],
        context: Record<string, any> = {}
    ): Promise<Record<string, boolean>> {
        try {
            const result: Record<string, boolean> = {}
            
            // Initialize all actions as false
            for (const action of actions) {
                result[action] = false
            }
            
            // Step 1: Check resource permissions
            const resourcePermissions = await resourcePermissionService.batchCheckPermissions(
                userId,
                resourceType,
                resourceId,
                actions
            )
            
            // Add resource permissions to result
            for (const action in resourcePermissions) {
                if (resourcePermissions[action]) {
                    result[action] = true
                }
            }
            
            // Step 2: Get role-based permissions
            const rolePermissions = await rolesPermissionsService.getUserPermissionsForResourceType(
                userId,
                resourceType
            )
            
            // Get permission IDs for actions
            const permissions = await rolesPermissionsService.getPermissionsByResourceType(resourceType)
            const permissionMap: Record<string, string> = {}
            
            for (const permission of permissions) {
                permissionMap[permission.action] = permission.id
            }
            
            // Prepare context for permission evaluation
            const permissionContext = {
                userId,
                resourceType,
                resourceId,
                ...context
            }
            
            // Step 3: Check time-based and conditional permissions for actions with role permissions
            for (const action of actions) {
                // Skip if already granted through resource permissions
                if (result[action]) {
                    continue
                }
                
                // Check if user has role-based permission for this action
                const hasRolePermission = rolePermissions.some(p => p.action === action)
                
                if (!hasRolePermission) {
                    // No role permission, so skip time-based and conditional checks
                    continue
                }
                
                const permissionId = permissionMap[action]
                
                if (!permissionId) {
                    // Permission doesn't exist
                    continue
                }
                
                // Check time-based permission
                const hasTimeBasedPermission = await timeBasedPermissionService.hasTimeBasedPermission(
                    userId,
                    permissionId,
                    resourceType,
                    resourceId
                )
                
                if (hasTimeBasedPermission) {
                    result[action] = true
                    continue
                }
                
                // Check conditional permission
                const hasConditionalPermission = await conditionalPermissionService.hasConditionalPermission(
                    userId,
                    permissionId,
                    {
                        ...permissionContext,
                        action
                    }
                )
                
                if (hasConditionalPermission) {
                    result[action] = true
                }
            }
            
            return result
        } catch (error: any) {
            logger.error(`[FineGrainedPermissionService] Batch check permissions error: ${error.message}`)
            
            // Return all permissions as false on error
            const result: Record<string, boolean> = {}
            for (const action of actions) {
                result[action] = false
            }
            return result
        }
    }

    /**
     * Get all permissions for a user on a specific resource
     */
    async getUserPermissionsForResource(
        userId: string,
        resourceType: string,
        resourceId: string,
        context: Record<string, any> = {}
    ): Promise<string[]> {
        try {
            // Get all possible actions for this resource type
            const permissions = await rolesPermissionsService.getPermissionsByResourceType(resourceType)
            const actions = permissions.map(p => p.action)
            
            // Batch check permissions for all actions
            const permissionResults = await this.batchCheckPermissions(
                userId,
                resourceType,
                resourceId,
                actions,
                context
            )
            
            // Return actions that are allowed
            return Object.entries(permissionResults)
                .filter(([_, isAllowed]) => isAllowed)
                .map(([action, _]) => action)
        } catch (error: any) {
            logger.error(`[FineGrainedPermissionService] Get user permissions for resource error: ${error.message}`)
            return []
        }
    }

    /**
     * Get all resources of a type that a user has a specific permission for
     */
    async getResourcesWithPermission(
        userId: string,
        resourceType: string,
        action: string,
        context: Record<string, any> = {}
    ): Promise<string[]> {
        try {
            // Step 1: Get resources with direct resource permissions
            const resourcesWithDirectPermission = await resourcePermissionService.getResourcesWithPermission(
                userId,
                resourceType,
                action
            )
            
            // Step 2: Check if the user has role-based permission for this action
            const hasRolePermission = await rolesPermissionsService.hasPermission(
                userId,
                resourceType,
                action
            )
            
            if (!hasRolePermission) {
                // If the user doesn't have the basic permission through roles,
                // return only resources with direct permissions
                return resourcesWithDirectPermission
            }
            
            // Get the permission ID for the resource type and action
            const permissions = await rolesPermissionsService.getPermissionsByResourceType(resourceType)
            const permission = permissions.find(p => p.action === action)
            
            if (!permission) {
                // Permission doesn't exist
                return resourcesWithDirectPermission
            }
            
            // Step 3: Get resources with time-based permissions
            // This is a complex operation that would require checking all resources
            // For now, we'll return a warning that this operation is not fully supported
            logger.warn(`[FineGrainedPermissionService] getResourcesWithPermission does not fully support time-based and conditional permissions`)
            
            return resourcesWithDirectPermission
        } catch (error: any) {
            logger.error(`[FineGrainedPermissionService] Get resources with permission error: ${error.message}`)
            return []
        }
    }

    /**
     * Set a resource attribute
     */
    async setResourceAttribute(
        resourceType: string,
        resourceId: string,
        key: string,
        value: any
    ): Promise<any> {
        return attributeService.setResourceAttribute(resourceType, resourceId, key, value)
    }

    /**
     * Get a resource attribute
     */
    async getResourceAttribute(
        resourceType: string,
        resourceId: string,
        key: string
    ): Promise<any> {
        return attributeService.getResourceAttribute(resourceType, resourceId, key)
    }

    /**
     * Get all attributes for a resource
     */
    async getResourceAttributes(
        resourceType: string,
        resourceId: string
    ): Promise<Record<string, any>> {
        return attributeService.getResourceAttributes(resourceType, resourceId)
    }

    /**
     * Set a user attribute
     */
    async setUserAttribute(
        userId: string,
        key: string,
        value: any
    ): Promise<any> {
        return attributeService.setUserAttribute(userId, key, value)
    }

    /**
     * Get a user attribute
     */
    async getUserAttribute(
        userId: string,
        key: string
    ): Promise<any> {
        return attributeService.getUserAttribute(userId, key)
    }

    /**
     * Get all attributes for a user
     */
    async getUserAttributes(userId: string): Promise<Record<string, any>> {
        return attributeService.getUserAttributes(userId)
    }

    /**
     * Set an environment attribute
     */
    async setEnvironmentAttribute(
        key: string,
        value: any,
        organizationId?: string,
        workspaceId?: string
    ): Promise<any> {
        return attributeService.setEnvironmentAttribute(key, value, organizationId, workspaceId)
    }

    /**
     * Get an environment attribute
     */
    async getEnvironmentAttribute(
        key: string,
        organizationId?: string,
        workspaceId?: string
    ): Promise<any> {
        return attributeService.getEnvironmentAttribute(key, organizationId, workspaceId)
    }

    /**
     * Get all environment attributes
     */
    async getEnvironmentAttributes(
        organizationId?: string,
        workspaceId?: string
    ): Promise<Record<string, any>> {
        return attributeService.getEnvironmentAttributes(organizationId, workspaceId)
    }
}

export const fineGrainedPermissionService = new FineGrainedPermissionService()
export default fineGrainedPermissionService