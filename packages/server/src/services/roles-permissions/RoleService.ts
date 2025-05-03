import { StatusCodes } from 'http-status-codes'
import { Permission, PermissionScope } from '../../database/entities/Permission'
import { Role, RoleType } from '../../database/entities/Role'
import { RolePermission } from '../../database/entities/RolePermission'
import { UserRole } from '../../database/entities/UserRole'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { permissionService } from './PermissionService'
import organizationsService from '../organizations'
import workspacesService from '../workspaces'

/**
 * Role Service
 * Handles role management, assignment, and hierarchy
 */
export class RoleService {
    // In-memory cache for roles
    private roleCache: Map<string, any>

    constructor() {
        this.roleCache = new Map<string, any>()
    }

    /**
     * Get all roles
     */
    async getAllRoles(): Promise<Role[]> {
        try {
            const cacheKey = 'all_roles'
            const cachedRoles = this.roleCache.get(cacheKey) as Role[] | undefined
            
            if (cachedRoles) {
                return cachedRoles
            }
            
            const appServer = getRunningExpressApp()
            const dbResponse = await appServer.AppDataSource.getRepository(Role).find({
                order: {
                    name: 'ASC'
                },
                relations: ['organization']
            })
            
            this.roleCache.set(cacheKey, dbResponse)
            return dbResponse
        } catch (error) {
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: RoleService.getAllRoles - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get system roles
     */
    async getSystemRoles(): Promise<Role[]> {
        try {
            const cacheKey = 'system_roles'
            const cachedRoles = this.roleCache.get(cacheKey) as Role[] | undefined
            
            if (cachedRoles) {
                return cachedRoles
            }
            
            const appServer = getRunningExpressApp()
            const dbResponse = await appServer.AppDataSource.getRepository(Role).find({
                where: {
                    type: RoleType.SYSTEM
                },
                order: {
                    name: 'ASC'
                }
            })
            
            this.roleCache.set(cacheKey, dbResponse)
            return dbResponse
        } catch (error) {
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: RoleService.getSystemRoles - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get roles by organization ID
     */
    async getRolesByOrganizationId(organizationId: string): Promise<Role[]> {
        try {
            const cacheKey = `org_roles_${organizationId}`
            const cachedRoles = this.roleCache.get(cacheKey) as Role[] | undefined
            
            if (cachedRoles) {
                return cachedRoles
            }
            
            // Verify organization exists
            await organizationsService.getOrganizationById(organizationId)
            
            const appServer = getRunningExpressApp()
            const dbResponse = await appServer.AppDataSource.getRepository(Role).find({
                where: {
                    organizationId: organizationId
                },
                order: {
                    name: 'ASC'
                },
                relations: ['organization']
            })
            
            this.roleCache.set(cacheKey, dbResponse)
            return dbResponse
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: RoleService.getRolesByOrganizationId - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get role by ID
     */
    async getRoleById(roleId: string): Promise<Role> {
        try {
            const cacheKey = `role_${roleId}`
            const cachedRole = this.roleCache.get(cacheKey) as Role | undefined
            
            if (cachedRole) {
                return cachedRole
            }
            
            const appServer = getRunningExpressApp()
            const dbResponse = await appServer.AppDataSource.getRepository(Role).findOne({
                where: {
                    id: roleId
                },
                relations: ['organization']
            })
            
            if (!dbResponse) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, `Role ${roleId} not found`)
            }
            
            this.roleCache.set(cacheKey, dbResponse)
            return dbResponse
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: RoleService.getRoleById - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Create a new role
     */
    async createRole(role: Partial<Role>): Promise<Role> {
        try {
            const appServer = getRunningExpressApp()
            
            // Verify organization exists if provided
            if (role.organizationId) {
                await organizationsService.getOrganizationById(role.organizationId)
            }
            
            const newRole = appServer.AppDataSource.getRepository(Role).create(role)
            const dbResponse = await appServer.AppDataSource.getRepository(Role).save(newRole)
            
            // Invalidate cache
            this.invalidateRoleCache()
            
            // Fetch the complete role with relations
            return this.getRoleById(dbResponse.id)
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: RoleService.createRole - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Update a role
     */
    async updateRole(roleId: string, updateData: Partial<Role>): Promise<Role> {
        try {
            const appServer = getRunningExpressApp()
            const role = await this.getRoleById(roleId)
            
            // Prevent updating system roles type
            if (role.type === RoleType.SYSTEM && updateData.type && updateData.type !== RoleType.SYSTEM) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Cannot change the type of a system role'
                )
            }
            
            // Verify organization exists if changing organization
            if (updateData.organizationId && updateData.organizationId !== role.organizationId) {
                await organizationsService.getOrganizationById(updateData.organizationId)
            }
            
            const updatedRole = appServer.AppDataSource.getRepository(Role).merge(role, updateData)
            await appServer.AppDataSource.getRepository(Role).save(updatedRole)
            
            // Invalidate cache
            this.invalidateRoleCache()
            
            // Fetch the complete updated role with relations
            return this.getRoleById(roleId)
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: RoleService.updateRole - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Delete a role
     */
    async deleteRole(roleId: string): Promise<void> {
        try {
            const appServer = getRunningExpressApp()
            const role = await this.getRoleById(roleId)
            
            // Prevent deleting system roles
            if (role.type === RoleType.SYSTEM) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Cannot delete a system role'
                )
            }
            
            await appServer.AppDataSource.getRepository(Role).delete({ id: roleId })
            
            // Invalidate cache
            this.invalidateRoleCache()
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: RoleService.deleteRole - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Clone a role
     */
    async cloneRole(roleId: string, newRoleData: Partial<Role>): Promise<Role> {
        try {
            const appServer = getRunningExpressApp()
            const sourceRole = await this.getRoleById(roleId)
            
            // Create new role
            const newRole = {
                name: newRoleData.name || `${sourceRole.name} (Clone)`,
                description: newRoleData.description || sourceRole.description,
                organizationId: newRoleData.organizationId || sourceRole.organizationId,
                type: RoleType.CUSTOM // Cloned roles are always custom
            }
            
            const createdRole = await this.createRole(newRole)
            
            // Copy permissions from source role
            const rolePermissions = await appServer.AppDataSource.getRepository(RolePermission).find({
                where: {
                    roleId: sourceRole.id
                },
                relations: ['permission']
            })
            
            for (const rp of rolePermissions) {
                await this.assignPermissionToRole(createdRole.id, rp.permissionId)
            }
            
            return createdRole
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: RoleService.cloneRole - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get permissions for a role
     */
    async getRolePermissions(roleId: string): Promise<Permission[]> {
        try {
            const cacheKey = `role_permissions_${roleId}`
            const cachedPermissions = this.roleCache.get(cacheKey) as Permission[] | undefined
            
            if (cachedPermissions) {
                return cachedPermissions
            }
            
            // Verify role exists
            await this.getRoleById(roleId)
            
            const appServer = getRunningExpressApp()
            const rolePermissions = await appServer.AppDataSource.getRepository(RolePermission).find({
                where: {
                    roleId: roleId
                },
                relations: ['permission']
            })
            
            const permissions = rolePermissions.map(rp => rp.permission)
            this.roleCache.set(cacheKey, permissions)
            
            return permissions
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: RoleService.getRolePermissions - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Assign permission to role
     */
    async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
        try {
            const appServer = getRunningExpressApp()
            
            // Verify role and permission exist
            await this.getRoleById(roleId)
            await permissionService.getPermissionById(permissionId)
            
            // Check if assignment already exists
            const existingAssignment = await appServer.AppDataSource.getRepository(RolePermission).findOneBy({
                roleId: roleId,
                permissionId: permissionId
            })
            
            if (existingAssignment) {
                return // Already assigned, no action needed
            }
            
            // Create new assignment
            const rolePermission = appServer.AppDataSource.getRepository(RolePermission).create({
                roleId: roleId,
                permissionId: permissionId
            })
            
            await appServer.AppDataSource.getRepository(RolePermission).save(rolePermission)
            
            // Invalidate cache
            this.invalidateRoleCache()
            this.invalidateRolePermissionCache(roleId)
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: RoleService.assignPermissionToRole - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Remove permission from role
     */
    async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
        try {
            const appServer = getRunningExpressApp()
            
            // Verify role and permission exist
            await this.getRoleById(roleId)
            await permissionService.getPermissionById(permissionId)
            
            await appServer.AppDataSource.getRepository(RolePermission).delete({
                roleId: roleId,
                permissionId: permissionId
            })
            
            // Invalidate cache
            this.invalidateRoleCache()
            this.invalidateRolePermissionCache(roleId)
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: RoleService.removePermissionFromRole - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Assign role to user
     */
    async assignRoleToUser(userId: string, roleId: string, workspaceId?: string): Promise<void> {
        try {
            const appServer = getRunningExpressApp()
            
            // Verify role exists
            const role = await this.getRoleById(roleId)
            
            // Verify workspace exists if provided
            if (workspaceId) {
                const workspace = await workspacesService.getWorkspaceById(workspaceId)
                
                // If role is organization-specific, ensure it belongs to the workspace's organization
                if (role.organizationId && role.organizationId !== workspace.organizationId) {
                    throw new InternalFastflowError(
                        StatusCodes.BAD_REQUEST,
                        `Role ${roleId} belongs to a different organization than workspace ${workspaceId}`
                    )
                }
            }
            
            // Check if assignment already exists
            const existingAssignment = await appServer.AppDataSource.getRepository(UserRole).findOneBy({
                userId: userId,
                roleId: roleId,
                workspaceId: workspaceId
            })
            
            if (existingAssignment) {
                return // Already assigned, no action needed
            }
            
            // Create new assignment
            const userRole = appServer.AppDataSource.getRepository(UserRole).create({
                userId: userId,
                roleId: roleId,
                workspaceId: workspaceId
            })
            
            await appServer.AppDataSource.getRepository(UserRole).save(userRole)
            
            // Invalidate user permission cache
            permissionService.invalidateUserPermissionCache(userId)
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: RoleService.assignRoleToUser - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Remove role from user
     */
    async removeRoleFromUser(userId: string, roleId: string, workspaceId?: string): Promise<void> {
        try {
            const appServer = getRunningExpressApp()
            
            // Verify role exists
            await this.getRoleById(roleId)
            
            // Verify workspace exists if provided
            if (workspaceId) {
                await workspacesService.getWorkspaceById(workspaceId)
            }
            
            const whereClause: any = {
                userId: userId,
                roleId: roleId
            }
            
            if (workspaceId !== undefined) {
                whereClause.workspaceId = workspaceId
            }
            
            await appServer.AppDataSource.getRepository(UserRole).delete(whereClause)
            
            // Invalidate user permission cache
            permissionService.invalidateUserPermissionCache(userId)
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: RoleService.removeRoleFromUser - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get user roles
     */
    async getUserRoles(userId: string): Promise<UserRole[]> {
        try {
            const appServer = getRunningExpressApp()
            const dbResponse = await appServer.AppDataSource.getRepository(UserRole).find({
                where: {
                    userId: userId
                },
                relations: ['role', 'workspace', 'workspace.organization']
            })
            return dbResponse
        } catch (error) {
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: RoleService.getUserRoles - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Invalidate role cache
     */
    invalidateRoleCache(): void {
        this.roleCache.clear()
    }

    /**
     * Invalidate specific role's permission cache
     */
    invalidateRolePermissionCache(roleId: string): void {
        const permissionCacheKey = `role_permissions_${roleId}`
        this.roleCache.delete(permissionCacheKey)
    }
}

// Export singleton instance
export const roleService = new RoleService()