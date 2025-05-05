import { StatusCodes } from 'http-status-codes'
import { ResourcePermission } from '../../database/entities/ResourcePermission'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'
import roleService from './RoleService'
import { Repository } from 'typeorm'
import { getInitializedDataSource } from '../../DataSource'
import logger from '../../utils/logger'

/**
 * Service for managing resource permissions
 */
class ResourcePermissionService {
    // Repository instance
    private resourcePermissionRepository: Repository<ResourcePermission> | null = null
    
    // Initialization flag
    private isInitialized: boolean = false
    
    /**
     * Constructor
     */
    constructor() {
        // Repository will be initialized lazily when needed
    }
    
    /**
     * Initialize repository lazily to avoid connection issues
     */
    private async ensureInitialized(): Promise<void> {
        if (this.isInitialized) {
            return
        }
        
        try {
            // Get initialized data source
            const dataSource = await getInitializedDataSource()
            
            // Get repository
            this.resourcePermissionRepository = dataSource.getRepository(ResourcePermission)
            
            // Mark as initialized
            this.isInitialized = true
        } catch (error) {
            logger.error('Failed to initialize ResourcePermissionService repository', error)
            throw error
        }
    }
    
    /**
     * Grant direct resource permission to user
     */
    async grantResourcePermission(
        resourceType: string,
        resourceId: string,
        userId: string,
        permission: string
    ): Promise<void> {
        try {
            await this.ensureInitialized()
            
            // Check if permission already exists
            const existingPermission = await this.resourcePermissionRepository!.findOneBy({
                resourceType: resourceType,
                resourceId: resourceId,
                userId: userId,
                permission: permission
            })
            
            if (existingPermission) {
                return // Already granted, no action needed
            }
            
            // Create new permission
            const resourcePermission = this.resourcePermissionRepository!.create({
                resourceType: resourceType,
                resourceId: resourceId,
                userId: userId,
                permission: permission
            })
            
            await this.resourcePermissionRepository!.save(resourcePermission)
        } catch (error) {
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: grantResourcePermission - ${getErrorMessage(error)}`
            )
        }
    }
    
    /**
     * Revoke direct resource permission from user
     */
    async revokeResourcePermission(
        resourceType: string,
        resourceId: string,
        userId: string,
        permission: string
    ): Promise<void> {
        try {
            await this.ensureInitialized()
            
            await this.resourcePermissionRepository!.delete({
                resourceType: resourceType,
                resourceId: resourceId,
                userId: userId,
                permission: permission
            })
        } catch (error) {
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: revokeResourcePermission - ${getErrorMessage(error)}`
            )
        }
    }
    
    /**
     * Get user permissions for a resource
     */
    async getUserResourcePermissions(
        resourceType: string,
        resourceId: string,
        userId: string
    ): Promise<string[]> {
        try {
            await this.ensureInitialized()
            
            // Get direct resource permissions
            const directPermissions = await this.resourcePermissionRepository!.find({
                where: {
                    resourceType: resourceType,
                    resourceId: resourceId,
                    userId: userId
                }
            })
            
            // Get user roles
            const userRoles = await roleService.getUserRoles(userId)
            
            // Get permissions from roles
            const rolePermissions = []
            for (const userRole of userRoles) {
                const permissions = await roleService.getRolePermissions(userRole.roleId)
                rolePermissions.push(...permissions)
            }
            
            // Combine permissions
            const allPermissions = new Set<string>()
            
            // Add direct permissions
            directPermissions.forEach(p => allPermissions.add(p.permission))
            
            // Add role permissions that match the resource type
            rolePermissions
                .filter(p => p.resourceType === resourceType)
                .forEach(p => allPermissions.add(p.action))
            
            return Array.from(allPermissions)
        } catch (error) {
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: getUserResourcePermissions - ${getErrorMessage(error)}`
            )
        }
    }
}

// Create a singleton instance
const resourcePermissionService = new ResourcePermissionService()
export default resourcePermissionService

// Export the class for use with the service factory
export { ResourcePermissionService }

// Export individual methods for backward compatibility
export const grantResourcePermission = async (
    resourceType: string,
    resourceId: string,
    userId: string,
    permission: string
): Promise<void> => {
    return resourcePermissionService.grantResourcePermission(resourceType, resourceId, userId, permission)
}

export const revokeResourcePermission = async (
    resourceType: string,
    resourceId: string,
    userId: string,
    permission: string
): Promise<void> => {
    return resourcePermissionService.revokeResourcePermission(resourceType, resourceId, userId, permission)
}

export const getUserResourcePermissions = async (
    resourceType: string,
    resourceId: string,
    userId: string
): Promise<string[]> => {
    return resourcePermissionService.getUserResourcePermissions(resourceType, resourceId, userId)
}