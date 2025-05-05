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

/**
 * Permission Service
 * Handles permission management, checking, and caching
 */
class PermissionService {
    // In-memory cache for permissions
    private permissionCache: Map<string, any>
    
    // Repository instances
    private permissionRepository: Repository<Permission> | null = null
    private rolePermissionRepository: Repository<RolePermission> | null = null
    private userRoleRepository: Repository<UserRole> | null = null
    private resourcePermissionRepository: Repository<ResourcePermission> | null = null
    
    // Initialization flag
    private isInitialized: boolean = false

    constructor() {
        this.permissionCache = new Map<string, any>()
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
            const cachedPermissions = this.permissionCache.get(cacheKey) as Permission[] | undefined
            
            if (cachedPermissions) {
                return cachedPermissions
            }
            
            const dbResponse = await this.permissionRepository!.find({
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
            await this.ensureInitialized()
            
            const cacheKey = `permission_${permissionId}`
            const cachedPermission = this.permissionCache.get(cacheKey) as Permission | undefined
            
            if (cachedPermission) {
                return cachedPermission
            }
            
            const dbResponse = await this.permissionRepository!.findOneBy({
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
            await this.ensureInitialized()
            
            const cacheKey = `permission_name_${name}`
            const cachedPermission = this.permissionCache.get(cacheKey) as Permission | undefined
            
            if (cachedPermission) {
                return cachedPermission
            }
            
            const dbResponse = await this.permissionRepository!.findOneBy({
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
            await this.ensureInitialized()
            
            const cacheKey = `permissions_resource_${resourceType}`
            const cachedPermissions = this.permissionCache.get(cacheKey) as Permission[] | undefined
            
            if (cachedPermissions) {
                return cachedPermissions
            }
            
            const dbResponse = await this.permissionRepository!.find({
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
            await this.ensureInitialized()
            
            // Generate permission name if not provided
            if (!permission.name && permission.resourceType && permission.action) {
                permission.name = `${permission.resourceType}:${permission.action}`
            }
            
            const newPermission = this.permissionRepository!.create(permission)
            const dbResponse = await this.permissionRepository!.save(newPermission)
            
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
            await this.ensureInitialized()
            
            await this.getPermissionById(permissionId) // Check if permission exists
            await this.permissionRepository!.delete({ id: permissionId })
            
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
            await this.ensureInitialized()
            
            const cacheKey = `permission_check_${userId}_${resourceType}_${resourceId}_${action}`
            const cachedResult = this.permissionCache.get(cacheKey) as boolean | undefined
            
            if (cachedResult !== undefined) {
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
                this.permissionCache.set(cacheKey, true)
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
            await this.ensureInitialized()
            
            const cacheKey = `user_permissions_${userId}`
            const cachedPermissions = this.permissionCache.get(cacheKey) as Permission[] | undefined
            
            if (cachedPermissions) {
                return cachedPermissions
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

// Create a singleton instance
const permissionService = new PermissionService()
export default permissionService

// Export the class for use with the service factory
export { PermissionService }