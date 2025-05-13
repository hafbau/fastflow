import { StatusCodes } from 'http-status-codes'
import { Permission, PermissionScope } from '../../database/entities/Permission'
import { Role, RoleType } from '../../database/entities/Role'
import { RolePermission } from '../../database/entities/RolePermission'
import { UserRole } from '../../database/entities/UserRole'
import { ResourcePermission } from '../../database/entities/ResourcePermission'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'
import { Repository } from 'typeorm'
import { getInitializedDataSource } from '../../DataSource'
import logger from '../../utils/logger'
import permissionCacheService from '../roles-permissions/PermissionCacheService'

/**
 * Permission Service
 * Handles permission management, checking, and caching
 */
class PermissionService {
    // Repository instances
    private permissionRepository: Repository<Permission> | null = null
    private rolePermissionRepository: Repository<RolePermission> | null = null
    private userRoleRepository: Repository<UserRole> | null = null
    private resourcePermissionRepository: Repository<ResourcePermission> | null = null
    
    // Initialization flag
    private isInitialized: boolean = false

    constructor() {
        // Repositories will be initialized lazily when needed
    }
    
    /**
     * Initialize repositories lazily to avoid connection issues
     */
    private async ensureInitialized(): Promise<void> {
        if (this.isInitialized) {
            return
        }
        
        try {
            // Get initialized data source
            const dataSource = await getInitializedDataSource()
            
            // Get repositories
            this.permissionRepository = dataSource.getRepository(Permission)
            this.rolePermissionRepository = dataSource.getRepository(RolePermission)
            this.userRoleRepository = dataSource.getRepository(UserRole)
            this.resourcePermissionRepository = dataSource.getRepository(ResourcePermission)
            
            // Mark as initialized
            this.isInitialized = true
        } catch (error) {
            logger.error('Failed to initialize PermissionService repositories', error)
            throw error
        }
    }

    /**
     * Get all permissions
     */
    async getAllPermissions(): Promise<Permission[]> {
        try {
            await this.ensureInitialized()
            
            const cacheKey = 'all_permissions'
            const cachedResult = await permissionCacheService.getPermission('system', 'permissions', 'all', 'read')
            
            if (cachedResult !== null && typeof cachedResult === 'object') {
                return cachedResult as unknown as Permission[]
            }
            
            const dbResponse = await this.permissionRepository!.find({
                order: {
                    resourceType: 'ASC',
                    action: 'ASC'
                }
            })
            
            // Cache permissions as special case
            await permissionCacheService.cachePermission('system', 'permissions', 'all', 'read', dbResponse as any, 600) // 10 min TTL
            
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
            await this.ensureInitialized()
            
            const cachedResult = await permissionCacheService.getPermission('system', 'permission', permissionId, 'read')
            
            if (cachedResult !== null && typeof cachedResult === 'object') {
                return cachedResult as unknown as Permission
            }
            
            const dbResponse = await this.permissionRepository!.findOneBy({
                id: permissionId
            })
            
            if (!dbResponse) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, `Permission ${permissionId} not found`)
            }
            
            // Cache result
            await permissionCacheService.cachePermission('system', 'permission', permissionId, 'read', dbResponse as any, 600) // 10 min TTL
            
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
            await this.ensureInitialized()
            
            const cachedResult = await permissionCacheService.getPermission('system', 'permission', `name:${name}`, 'read')
            
            if (cachedResult !== null && typeof cachedResult === 'object') {
                return cachedResult as unknown as Permission
            }
            
            const dbResponse = await this.permissionRepository!.findOneBy({
                name
            })
            
            if (!dbResponse) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, `Permission ${name} not found`)
            }
            
            // Cache result
            await permissionCacheService.cachePermission('system', 'permission', `name:${name}`, 'read', dbResponse as any, 600) // 10 min TTL
            
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
            await this.ensureInitialized()
            
            const cachedResult = await permissionCacheService.getPermission('system', 'permissions', `type:${resourceType}`, 'read')
            
            if (cachedResult !== null && typeof cachedResult === 'object') {
                return cachedResult as unknown as Permission[]
            }
            
            const dbResponse = await this.permissionRepository!.find({
                where: {
                    resourceType
                },
                order: {
                    action: 'ASC'
                }
            })
            
            // Cache result
            await permissionCacheService.cachePermission('system', 'permissions', `type:${resourceType}`, 'read', dbResponse as any, 600) // 10 min TTL
            
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
            await this.ensureInitialized()
            
            // Generate permission name if not provided
            if (!permission.name && permission.resourceType && permission.action) {
                permission.name = `${permission.resourceType}:${permission.action}`
            }
            
            try {
                const newPermission = this.permissionRepository!.create(permission)
                const dbResponse = await this.permissionRepository!.save(newPermission)
                
                // Invalidate cache
                await this.invalidatePermissionCache()
                
                return dbResponse
            } catch (error) {
                // If the error is about scope column, try creating without scope
                if (error instanceof Error && error.toString().includes('no column named scope')) {
                    const { scope, ...permissionWithoutScope } = permission as any
                    const newPermission = this.permissionRepository!.create(permissionWithoutScope)
                    const result = await this.permissionRepository!.save(newPermission)
                    
                    // Invalidate cache
                    await this.invalidatePermissionCache()
                    
                    // Handle the result which could be an array or a single entity
                    return Array.isArray(result) ? result[0] : result
                }
                throw error
            }
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
            await this.ensureInitialized()
            
            const permission = await this.getPermissionById(permissionId)
            
            // Generate permission name if resourceType or action changed
            if ((updateData.resourceType || updateData.action) && !updateData.name) {
                const resourceType = updateData.resourceType || permission.resourceType
                const action = updateData.action || permission.action
                updateData.name = `${resourceType}:${action}`
            }
            
            const updatedPermission = this.permissionRepository!.merge(permission, updateData)
            await this.permissionRepository!.save(updatedPermission)
            
            // Invalidate cache
            await this.invalidatePermissionCache()
            
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
            await this.ensureInitialized()
            
            await this.getPermissionById(permissionId) // Check if permission exists
            await this.permissionRepository!.delete({ id: permissionId })
            
            // Invalidate cache
            await this.invalidatePermissionCache()
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
            await this.ensureInitialized()
            
            // Check cache first
            const cachedResult = await permissionCacheService.getPermission(userId, resourceType, resourceId, action)
            if (cachedResult !== null) {
                return cachedResult
            }
            
            // Check direct resource permission
            const directPermission = await this.resourcePermissionRepository!.findOneBy({
                userId,
                resourceType,
                resourceId,
                permission: action
            })
            
            if (directPermission) {
                // Cache positive result with longer TTL (5 minutes)
                await permissionCacheService.cachePermission(userId, resourceType, resourceId, action, true, 300)
                return true
            }
            
            // Check role-based permissions
            const userRoles = await this.userRoleRepository!.find({
                where: {
                    userId
                },
                relations: ['role']
            })
            
            for (const userRole of userRoles) {
                const rolePermissions = await this.rolePermissionRepository!.find({
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
                        // Cache positive result with longer TTL (5 minutes)
                        await permissionCacheService.cachePermission(userId, resourceType, resourceId, action, true, 300)
                        return true
                    }
                }
            }
            
            // Cache negative result with shorter TTL (1 minute)
            await permissionCacheService.cachePermission(userId, resourceType, resourceId, action, false, 60)
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
            await this.ensureInitialized()
            
            // Try to get from cache
            const cachedResult = await permissionCacheService.getPermission(userId, 'permissions', 'all', 'list')
            
            if (cachedResult !== null && typeof cachedResult === 'object') {
                return cachedResult as unknown as Permission[]
            }
            
            // Get user roles
            const userRoles = await this.userRoleRepository!.find({
                where: {
                    userId
                }
            })
            
            // Get permissions from roles
            const permissions: Permission[] = []
            const processedPermissionIds = new Set<string>()
            
            for (const userRole of userRoles) {
                const rolePermissions = await this.rolePermissionRepository!.find({
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
            
            // Cache the results for 5 minutes
            await permissionCacheService.cachePermission(userId, 'permissions', 'all', 'list', permissions as any, 300)
            
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
            // Try to get from cache
            const cachedResult = await permissionCacheService.getPermission(userId, 'permissions', `type:${resourceType}`, 'list')
            
            if (cachedResult !== null && typeof cachedResult === 'object') {
                return cachedResult as unknown as string[]
            }
            
            const userPermissions = await this.getUserPermissions(userId)
            const resourcePermissions = userPermissions
                .filter(p => p.resourceType === resourceType)
                .map(p => p.action)
            
            // Cache the results for 5 minutes
            await permissionCacheService.cachePermission(userId, 'permissions', `type:${resourceType}`, 'list', resourcePermissions as any, 300)
            
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
    async invalidatePermissionCache(): Promise<void> {
        await permissionCacheService.clearAll()
    }

    /**
     * Invalidate specific user's permission cache
     */
    async invalidateUserPermissionCache(userId: string): Promise<void> {
        await permissionCacheService.invalidateUserPermissions(userId)
    }
}

// Create a singleton instance
const permissionService = new PermissionService()
export default permissionService

// Export the class for use with the service factory
export { PermissionService }