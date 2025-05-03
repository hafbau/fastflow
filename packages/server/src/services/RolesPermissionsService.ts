/**
 * Roles and Permissions Service
 * 
 * This service provides methods for managing roles and permissions.
 */

import { getRepository } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../errors/InternalFastflowError'
import logger from '../utils/logger'
import { Permission } from '../database/entities/Permission'
import { Role } from '../database/entities/Role'
import { UserRole } from '../database/entities/UserRole'
import { RolePermission } from '../database/entities/RolePermission'

/**
 * Service for managing roles and permissions
 */
export class RolesPermissionsService {
    private permissionRepository: any
    private roleRepository: any
    private userRoleRepository: any
    private rolePermissionRepository: any

    /**
     * Constructor
     */
    constructor() {
        this.permissionRepository = getRepository(Permission)
        this.roleRepository = getRepository(Role)
        this.userRoleRepository = getRepository(UserRole)
        this.rolePermissionRepository = getRepository(RolePermission)
    }

    /**
     * Get all roles
     * @returns {Promise<Role[]>}
     */
    async getAllRoles(): Promise<Role[]> {
        try {
            return await this.roleRepository.find()
        } catch (error: any) {
            logger.error(`[RolesPermissionsService] Get all roles error: ${error.message}`)
            throw error
        }
    }

    /**
     * Get all permissions
     * @returns {Promise<Permission[]>}
     */
    async getAllPermissions(): Promise<Permission[]> {
        try {
            return await this.permissionRepository.find()
        } catch (error: any) {
            logger.error(`[RolesPermissionsService] Get all permissions error: ${error.message}`)
            throw error
        }
    }

    /**
     * Get permissions by resource type
     * @param {string} resourceType - Resource type
     * @returns {Promise<Permission[]>}
     */
    async getPermissionsByResourceType(resourceType: string): Promise<Permission[]> {
        try {
            return await this.permissionRepository.find({
                where: { resourceType } as any
            })
        } catch (error: any) {
            logger.error(`[RolesPermissionsService] Get permissions by resource type error: ${error.message}`)
            throw error
        }
    }

    /**
     * Get user roles
     * @param {string} userId - User ID
     * @returns {Promise<Role[]>}
     */
    async getUserRoles(userId: string): Promise<Role[]> {
        try {
            const userRoles = await this.userRoleRepository.find({
                where: { userId } as any,
                relations: ['role']
            })

            return userRoles.map((userRole: UserRole) => userRole.role)
        } catch (error: any) {
            logger.error(`[RolesPermissionsService] Get user roles error: ${error.message}`)
            throw error
        }
    }

    /**
     * Get role permissions
     * @param {string} roleId - Role ID
     * @returns {Promise<Permission[]>}
     */
    async getRolePermissions(roleId: string): Promise<Permission[]> {
        try {
            const rolePermissions = await this.rolePermissionRepository.find({
                where: { roleId } as any,
                relations: ['permission']
            })

            return rolePermissions.map((rolePermission: RolePermission) => rolePermission.permission)
        } catch (error: any) {
            logger.error(`[RolesPermissionsService] Get role permissions error: ${error.message}`)
            throw error
        }
    }

    /**
     * Get user permissions
     * @param {string} userId - User ID
     * @returns {Promise<Permission[]>}
     */
    async getUserPermissions(userId: string): Promise<Permission[]> {
        try {
            // Get user roles
            const userRoles = await this.getUserRoles(userId)
            
            // Get permissions for each role
            const permissionsByRole = await Promise.all(
                userRoles.map(role => this.getRolePermissions(role.id))
            )
            
            // Flatten permissions and remove duplicates
            const uniquePermissions = new Map<string, Permission>()
            
            permissionsByRole.flat().forEach(permission => {
                uniquePermissions.set(permission.id, permission)
            })
            
            return Array.from(uniquePermissions.values())
        } catch (error: any) {
            logger.error(`[RolesPermissionsService] Get user permissions error: ${error.message}`)
            throw error
        }
    }

    /**
     * Check if user has permission
     * @param {string} userId - User ID
     * @param {string} resourceType - Resource type
     * @param {string} action - Action
     * @returns {Promise<boolean>}
     */
    async hasPermission(userId: string, resourceType: string, action: string): Promise<boolean> {
        try {
            const permissions = await this.getUserPermissions(userId)
            
            return permissions.some(
                permission => permission.resourceType === resourceType && permission.action === action
            )
        } catch (error: any) {
            logger.error(`[RolesPermissionsService] Check permission error: ${error.message}`)
            throw error
        }
    }

    /**
     * Get user permissions for a specific resource type
     * @param {string} userId - User ID
     * @param {string} resourceType - Resource type
     * @returns {Promise<Permission[]>}
     */
    async getUserPermissionsForResourceType(userId: string, resourceType: string): Promise<Permission[]> {
        try {
            const permissions = await this.getUserPermissions(userId)
            
            return permissions.filter(permission => permission.resourceType === resourceType)
        } catch (error: any) {
            logger.error(`[RolesPermissionsService] Get user permissions for resource type error: ${error.message}`)
            throw error
        }
    }
}

export default new RolesPermissionsService()