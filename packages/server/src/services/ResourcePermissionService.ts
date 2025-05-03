/**
 * Resource Permission Service
 * 
 * This service provides methods for managing resource-level permissions.
 */

import { getRepository } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../errors/InternalFastflowError/index'
import logger from '../utils/logger'
import { ResourcePermission } from '../database/entities/ResourcePermission'
import { Permission } from '../database/entities/Permission'
import rolesPermissionsService from './RolesPermissionsService'
import { createClient } from 'redis'
import config from '../config'

/**
 * Service for managing resource-level permissions
 */
export class ResourcePermissionService {
    private resourcePermissionRepository: any
    private redisClient: any

    /**
     * Constructor
     */
    constructor() {
        this.resourcePermissionRepository = getRepository(ResourcePermission)
        
        // Initialize Redis client if needed
        // Commented out for now as caching config is not available
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
                logger.error(`[ResourcePermissionService] Redis client error: ${err.message}`)
            })
        } catch (error: any) {
            logger.error(`[ResourcePermissionService] Redis client initialization error: ${error.message}`)
        }
    }

    /**
     * Get cache key for resource permissions
     * @param {string} userId - User ID
     * @param {string} resourceType - Resource type
     * @param {string} resourceId - Resource ID
     * @returns {string} Cache key
     */
    private getCacheKey(userId: string, resourceType: string, resourceId?: string): string {
        return `resource_permission:${userId}:${resourceType}${resourceId ? `:${resourceId}` : ''}`
    }

    /**
     * Clear cache for user's resource permissions
     * @param {string} userId - User ID
     * @param {string} resourceType - Resource type (optional)
     * @param {string} resourceId - Resource ID (optional)
     */
    private async clearCache(userId: string, resourceType?: string, resourceId?: string): Promise<void> {
        if (!this.redisClient) return

        try {
            if (resourceType && resourceId) {
                // Clear specific resource permission
                await this.redisClient.del(this.getCacheKey(userId, resourceType, resourceId))
            } else if (resourceType) {
                // Clear all permissions for a resource type
                const pattern = this.getCacheKey(userId, resourceType, '*')
                const keys = await this.redisClient.keys(pattern)
                if (keys.length > 0) {
                    await this.redisClient.del(keys)
                }
            } else {
                // Clear all resource permissions for user
                const pattern = this.getCacheKey(userId, '*')
                const keys = await this.redisClient.keys(pattern)
                if (keys.length > 0) {
                    await this.redisClient.del(keys)
                }
            }
        } catch (error: any) {
            logger.error(`[ResourcePermissionService] Clear cache error: ${error.message}`)
        }
    }

    /**
     * Assign permission to a resource for a user
     * @param {string} userId - User ID
     * @param {string} resourceType - Resource type
     * @param {string} resourceId - Resource ID
     * @param {string} permission - Permission (e.g., 'read', 'write', 'delete')
     * @returns {Promise<ResourcePermission>} Created resource permission
     */
    async assignPermission(
        userId: string,
        resourceType: string,
        resourceId: string,
        permission: string
    ): Promise<ResourcePermission> {
        try {
            // Check if permission already exists
            const existingPermission = await this.resourcePermissionRepository.findOne({
                where: {
                    userId,
                    resourceType,
                    resourceId,
                    permission
                } as any
            })

            if (existingPermission) {
                return existingPermission
            }

            // Create new permission
            const resourcePermission = new ResourcePermission()
            resourcePermission.userId = userId
            resourcePermission.resourceType = resourceType
            resourcePermission.resourceId = resourceId
            resourcePermission.permission = permission

            const result = await this.resourcePermissionRepository.save(resourcePermission)
            
            // Clear cache
            await this.clearCache(userId, resourceType, resourceId)
            
            return result
        } catch (error: any) {
            logger.error(`[ResourcePermissionService] Assign permission error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to assign permission: ${error.message}`
            )
        }
    }

    /**
     * Remove permission from a resource for a user
     * @param {string} userId - User ID
     * @param {string} resourceType - Resource type
     * @param {string} resourceId - Resource ID
     * @param {string} permission - Permission (e.g., 'read', 'write', 'delete')
     * @returns {Promise<boolean>} Whether the permission was removed
     */
    async removePermission(
        userId: string,
        resourceType: string,
        resourceId: string,
        permission: string
    ): Promise<boolean> {
        try {
            const result = await this.resourcePermissionRepository.delete({
                userId,
                resourceType,
                resourceId,
                permission
            })
            
            // Clear cache
            await this.clearCache(userId, resourceType, resourceId)
            
            return result.affected > 0
        } catch (error: any) {
            logger.error(`[ResourcePermissionService] Remove permission error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to remove permission: ${error.message}`
            )
        }
    }

    /**
     * Remove all permissions for a resource
     * @param {string} resourceType - Resource type
     * @param {string} resourceId - Resource ID
     * @returns {Promise<boolean>} Whether any permissions were removed
     */
    async removeAllPermissionsForResource(
        resourceType: string,
        resourceId: string
    ): Promise<boolean> {
        try {
            const result = await this.resourcePermissionRepository.delete({
                resourceType,
                resourceId
            })
            
            // We can't efficiently clear cache for all users, so we'll let it expire naturally
            
            return result.affected > 0
        } catch (error: any) {
            logger.error(`[ResourcePermissionService] Remove all permissions for resource error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to remove all permissions for resource: ${error.message}`
            )
        }
    }

    /**
     * Get resource permissions for a user
     * @param {string} userId - User ID
     * @param {string} resourceType - Resource type
     * @param {string} resourceId - Resource ID
     * @returns {Promise<string[]>} Permissions
     */
    async getResourcePermissions(
        userId: string,
        resourceType: string,
        resourceId: string
    ): Promise<string[]> {
        try {
            // Check cache first
            if (this.redisClient) {
                const cacheKey = this.getCacheKey(userId, resourceType, resourceId)
                const cachedPermissions = await this.redisClient.get(cacheKey)
                
                if (cachedPermissions) {
                    return JSON.parse(cachedPermissions)
                }
            }
            
            const resourcePermissions = await this.resourcePermissionRepository.find({
                where: {
                    userId,
                    resourceType,
                    resourceId
                } as any
            })
            
            const permissions = resourcePermissions.map((rp: ResourcePermission) => rp.permission)
            
            // Cache the result
            if (this.redisClient) {
                const cacheKey = this.getCacheKey(userId, resourceType, resourceId)
                await this.redisClient.set(cacheKey, JSON.stringify(permissions), {
                    EX: 300 // Cache for 5 minutes
                })
            }
            
            return permissions
        } catch (error: any) {
            logger.error(`[ResourcePermissionService] Get resource permissions error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to get resource permissions: ${error.message}`
            )
        }
    }

    /**
     * Get all resources of a type that a user has a specific permission for
     * @param {string} userId - User ID
     * @param {string} resourceType - Resource type
     * @param {string} permission - Permission (e.g., 'read', 'write', 'delete')
     * @returns {Promise<string[]>} Resource IDs
     */
    async getResourcesWithPermission(
        userId: string,
        resourceType: string,
        permission: string
    ): Promise<string[]> {
        try {
            const resourcePermissions = await this.resourcePermissionRepository.find({
                where: {
                    userId,
                    resourceType,
                    permission
                } as any
            })
            
            return resourcePermissions.map((rp: ResourcePermission) => rp.resourceId)
        } catch (error: any) {
            logger.error(`[ResourcePermissionService] Get resources with permission error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to get resources with permission: ${error.message}`
            )
        }
    }

    /**
     * Check if a user has a specific permission for a resource
     * @param {string} userId - User ID
     * @param {string} resourceType - Resource type
     * @param {string} resourceId - Resource ID
     * @param {string} permission - Permission (e.g., 'read', 'write', 'delete')
     * @returns {Promise<boolean>} Whether the user has the permission
     */
    async hasResourcePermission(
        userId: string,
        resourceType: string,
        resourceId: string,
        permission: string
    ): Promise<boolean> {
        try {
            // Check cache first
            if (this.redisClient) {
                const cacheKey = this.getCacheKey(userId, resourceType, resourceId)
                const cachedPermissions = await this.redisClient.get(cacheKey)
                
                if (cachedPermissions) {
                    const permissions = JSON.parse(cachedPermissions)
                    return permissions.includes(permission)
                }
            }
            
            // First check if the user has a direct resource permission
            const count = await this.resourcePermissionRepository.count({
                where: {
                    userId,
                    resourceType,
                    resourceId,
                    permission
                } as any
            })
            
            if (count > 0) {
                return true
            }
            
            // If not, check if the user has the permission through their roles
            return await rolesPermissionsService.hasPermission(userId, resourceType, permission)
        } catch (error: any) {
            logger.error(`[ResourcePermissionService] Check resource permission error: ${error.message}`)
            return false
        }
    }

    /**
     * Check multiple permissions for a user and resource in a single call
     * @param {string} userId - User ID
     * @param {string} resourceType - Resource type
     * @param {string} resourceId - Resource ID
     * @param {string[]} permissions - Permissions to check
     * @returns {Promise<Record<string, boolean>>} Map of permission to boolean indicating if user has that permission
     */
    async batchCheckPermissions(
        userId: string,
        resourceType: string,
        resourceId: string,
        permissions: string[]
    ): Promise<Record<string, boolean>> {
        try {
            const result: Record<string, boolean> = {}
            
            // Get all resource permissions for this resource
            const resourcePermissions = await this.getResourcePermissions(userId, resourceType, resourceId)
            
            // Get all role-based permissions for this user and resource type
            const rolePermissions = await rolesPermissionsService.getUserPermissionsForResourceType(userId, resourceType)
            const roleActions = rolePermissions.map(p => p.action)
            
            // Check each permission
            for (const permission of permissions) {
                result[permission] = resourcePermissions.includes(permission) || roleActions.includes(permission)
            }
            
            return result
        } catch (error: any) {
            logger.error(`[ResourcePermissionService] Batch check permissions error: ${error.message}`)
            
            // Return all permissions as false if there's an error
            return permissions.reduce((acc, permission) => {
                acc[permission] = false
                return acc
            }, {} as Record<string, boolean>)
        }
    }

    /**
     * Get users who have a specific permission for a resource
     * @param {string} resourceType - Resource type
     * @param {string} resourceId - Resource ID
     * @param {string} permission - Permission (e.g., 'read', 'write', 'delete')
     * @returns {Promise<string[]>} User IDs
     */
    async getUsersWithPermission(
        resourceType: string,
        resourceId: string,
        permission: string
    ): Promise<string[]> {
        try {
            const resourcePermissions = await this.resourcePermissionRepository.find({
                where: {
                    resourceType,
                    resourceId,
                    permission
                } as any
            })
            
            return resourcePermissions.map((rp: ResourcePermission) => rp.userId)
        } catch (error: any) {
            logger.error(`[ResourcePermissionService] Get users with permission error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to get users with permission: ${error.message}`
            )
        }
    }
}

export default new ResourcePermissionService()