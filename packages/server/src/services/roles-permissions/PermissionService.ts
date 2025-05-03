import { StatusCodes } from 'http-status-codes'
import { Permission, PermissionScope } from '../../database/entities/Permission'
import { Role, RoleType } from '../../database/entities/Role'
import { RolePermission } from '../../database/entities/RolePermission'
import { UserRole } from '../../database/entities/UserRole'
import { ResourcePermission } from '../../database/entities/ResourcePermission'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'

/**
 * Permission Service
 * Handles permission management, checking, and caching
 */
export class PermissionService {
    // In-memory cache for permissions
    private permissionCache: Map<string, any>

    constructor() {
        this.permissionCache = new Map<string, any>()
    }

    /**
     * Get all permissions
     */
    async getAllPermissions(): Promise<Permission[]> {
        try {
            const cacheKey = 'all_permissions'
            const cachedPermissions = this.permissionCache.get(cacheKey) as Permission[] | undefined
            
            if (cachedPermissions) {
                return cachedPermissions
            }
            
            const appServer = getRunningExpressApp()
            const dbResponse = await appServer.AppDataSource.getRepository(Permission).find({
                order: {
                    resourceType: 'ASC',
                    action: 'ASC'
                }
            })
            
            this.permissionCache.set(cacheKey, dbResponse)
            return dbResponse
        } catch (error) {
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: PermissionService.getAllPermissions - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get permission by ID
     */
    async getPermissionById(permissionId: string): Promise<Permission> {
        try {
            const cacheKey = `permission_${permissionId}`
            const cachedPermission = this.permissionCache.get(cacheKey) as Permission | undefined
            
            if (cachedPermission) {
                return cachedPermission
            }
            
            const appServer = getRunningExpressApp()
            const dbResponse = await appServer.AppDataSource.getRepository(Permission).findOneBy({
                id: permissionId
            })
            
            if (!dbResponse) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, `Permission ${permissionId} not found`)
            }
            
            this.permissionCache.set(cacheKey, dbResponse)
            return dbResponse
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: PermissionService.getPermissionById - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get permission by name
     */
    async getPermissionByName(name: string): Promise<Permission> {
        try {
            const cacheKey = `permission_name_${name}`
            const cachedPermission = this.permissionCache.get(cacheKey) as Permission | undefined
            
            if (cachedPermission) {
                return cachedPermission
            }
            
            const appServer = getRunningExpressApp()
            const dbResponse = await appServer.AppDataSource.getRepository(Permission).findOneBy({
                name
            })
            
            if (!dbResponse) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, `Permission ${name} not found`)
            }
            
            this.permissionCache.set(cacheKey, dbResponse)
            return dbResponse
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: PermissionService.getPermissionByName - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get permissions by resource type
     */
    async getPermissionsByResourceType(resourceType: string): Promise<Permission[]> {
        try {
            const cacheKey = `permissions_resource_${resourceType}`
            const cachedPermissions = this.permissionCache.get(cacheKey) as Permission[] | undefined
            
            if (cachedPermissions) {
                return cachedPermissions
            }
            
            const appServer = getRunningExpressApp()
            const dbResponse = await appServer.AppDataSource.getRepository(Permission).find({
                where: {
                    resourceType
                },
                order: {
                    action: 'ASC'
                }
            })
            
            this.permissionCache.set(cacheKey, dbResponse)
            return dbResponse
        } catch (error) {
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: PermissionService.getPermissionsByResourceType - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Create a new permission
     */
    async createPermission(permission: Partial<Permission>): Promise<Permission> {
        try {
            const appServer = getRunningExpressApp()
            
            // Generate permission name if not provided
            if (!permission.name && permission.resourceType && permission.action) {
                permission.name = `${permission.resourceType}:${permission.action}`
            }
            
            const newPermission = appServer.AppDataSource.getRepository(Permission).create(permission)
            const dbResponse = await appServer.AppDataSource.getRepository(Permission).save(newPermission)
            
            // Invalidate cache
            this.invalidatePermissionCache()
            
            return dbResponse
        } catch (error) {
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: PermissionService.createPermission - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Update a permission
     */
    async updatePermission(permissionId: string, updateData: Partial<Permission>): Promise<Permission> {
        try {
            const appServer = getRunningExpressApp()
            const permission = await this.getPermissionById(permissionId)
            
            // Generate permission name if resourceType or action changed
            if ((updateData.resourceType || updateData.action) && !updateData.name) {
                const resourceType = updateData.resourceType || permission.resourceType
                const action = updateData.action || permission.action
                updateData.name = `${resourceType}:${action}`
            }
            
            const updatedPermission = appServer.AppDataSource.getRepository(Permission).merge(permission, updateData)
            await appServer.AppDataSource.getRepository(Permission).save(updatedPermission)
            
            // Invalidate cache
            this.invalidatePermissionCache()
            
            return this.getPermissionById(permissionId)
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: PermissionService.updatePermission - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Delete a permission
     */
    async deletePermission(permissionId: string): Promise<void> {
        try {
            const appServer = getRunningExpressApp()
            await this.getPermissionById(permissionId) // Check if permission exists
            await appServer.AppDataSource.getRepository(Permission).delete({ id: permissionId })
            
            // Invalidate cache
            this.invalidatePermissionCache()
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: PermissionService.deletePermission - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Check if user has permission for a resource
     */
    async hasPermission(
        userId: string,
        resourceType: string,
        resourceId: string,
        action: string
    ): Promise<boolean> {
        try {
            const cacheKey = `permission_check_${userId}_${resourceType}_${resourceId}_${action}`
            const cachedResult = this.permissionCache.get(cacheKey) as boolean | undefined
            
            if (cachedResult !== undefined) {
                return cachedResult
            }
            
            const appServer = getRunningExpressApp()
            
            // Check direct resource permission
            const directPermission = await appServer.AppDataSource.getRepository(ResourcePermission).findOneBy({
                userId,
                resourceType,
                resourceId,
                permission: action
            })
            
            if (directPermission) {
                this.permissionCache.set(cacheKey, true)
                return true
            }
            
            // Check role-based permissions
            const userRoles = await appServer.AppDataSource.getRepository(UserRole).find({
                where: {
                    userId
                },
                relations: ['role']
            })
            
            for (const userRole of userRoles) {
                const rolePermissions = await appServer.AppDataSource.getRepository(RolePermission).find({
                    where: {
                        roleId: userRole.roleId
                    },
                    relations: ['permission']
                })
                
                for (const rolePermission of rolePermissions) {
                    if (
                        rolePermission.permission.resourceType === resourceType &&
                        rolePermission.permission.action === action
                    ) {
                        this.permissionCache.set(cacheKey, true)
                        return true
                    }
                }
            }
            
            this.permissionCache.set(cacheKey, false)
            return false
        } catch (error) {
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: PermissionService.hasPermission - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get all permissions for a user
     */
    async getUserPermissions(userId: string): Promise<Permission[]> {
        try {
            const cacheKey = `user_permissions_${userId}`
            const cachedPermissions = this.permissionCache.get(cacheKey) as Permission[] | undefined
            
            if (cachedPermissions) {
                return cachedPermissions
            }
            
            const appServer = getRunningExpressApp()
            
            // Get user roles
            const userRoles = await appServer.AppDataSource.getRepository(UserRole).find({
                where: {
                    userId
                }
            })
            
            // Get permissions from roles
            const permissions: Permission[] = []
            const processedPermissionIds = new Set<string>()
            
            for (const userRole of userRoles) {
                const rolePermissions = await appServer.AppDataSource.getRepository(RolePermission).find({
                    where: {
                        roleId: userRole.roleId
                    },
                    relations: ['permission']
                })
                
                for (const rolePermission of rolePermissions) {
                    if (!processedPermissionIds.has(rolePermission.permission.id)) {
                        permissions.push(rolePermission.permission)
                        processedPermissionIds.add(rolePermission.permission.id)
                    }
                }
            }
            
            this.permissionCache.set(cacheKey, permissions)
            return permissions
        } catch (error) {
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: PermissionService.getUserPermissions - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get user permissions for a specific resource type
     */
    async getUserResourceTypePermissions(userId: string, resourceType: string): Promise<string[]> {
        try {
            const cacheKey = `user_resource_permissions_${userId}_${resourceType}`
            const cachedPermissions = this.permissionCache.get(cacheKey) as string[] | undefined
            
            if (cachedPermissions) {
                return cachedPermissions
            }
            
            const userPermissions = await this.getUserPermissions(userId)
            const resourcePermissions = userPermissions
                .filter(p => p.resourceType === resourceType)
                .map(p => p.action)
            
            this.permissionCache.set(cacheKey, resourcePermissions)
            return resourcePermissions
        } catch (error) {
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: PermissionService.getUserResourceTypePermissions - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Invalidate permission cache
     */
    invalidatePermissionCache(): void {
        this.permissionCache.clear()
    }

    /**
     * Invalidate specific user's permission cache
     */
    invalidateUserPermissionCache(userId: string): void {
        const userCacheKey = `user_permissions_${userId}`
        this.permissionCache.delete(userCacheKey)
        
        // Also delete any resource-specific permissions for this user
        for (const key of this.permissionCache.keys()) {
            if (key.includes(`user_permissions_${userId}`) || key.includes(`permission_check_${userId}_`)) {
                this.permissionCache.delete(key)
            }
        }
    }
}

// Export singleton instance
export const permissionService = new PermissionService()