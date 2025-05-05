import { getRepository } from 'typeorm'
import { Role, RoleType } from '../../database/entities/Role'
import { Permission } from '../../database/entities/Permission'
import { RolePermission } from '../../database/entities/RolePermission'
import { UserRole } from '../../database/entities/UserRole'
import permissionService from './PermissionService'
import roleService from './RoleService'
import customRoleService from './CustomRoleService'
import attributeService from './AttributeService'
import permissionExpressionService from './PermissionExpressionService'
import conditionalPermissionService from './ConditionalPermissionService'
import timeBasedPermissionService from './TimeBasedPermissionService'
import fineGrainedPermissionService from './FineGrainedPermissionService'
import { initializeRolesAndPermissions } from './initializeRolesAndPermissions'

/**
 * Get all roles
 * @returns {Promise<Role[]>} Array of roles
 */
const getAllRoles = async (): Promise<Role[]> => {
    const roleRepository = getRepository(Role)
    return roleRepository.find()
}

/**
 * Get roles by organization ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Role[]>} Array of roles for the organization
 */
const getRolesByOrganizationId = async (organizationId: string): Promise<Role[]> => {
    const roleRepository = getRepository(Role)
    return roleRepository.find({
        where: { organizationId }
    })
}

/**
 * Get role by ID
 * @param {string} roleId - Role ID
 * @returns {Promise<Role>} Role
 * @throws {Error} If role not found
 */
const getRoleById = async (roleId: string): Promise<Role> => {
    const roleRepository = getRepository(Role)
    const role = await roleRepository.findOne({
        where: { id: roleId }
    })
    
    if (!role) {
        const error: any = new Error('Role not found')
        error.statusCode = 404
        throw error
    }
    
    return role
}

/**
 * Create a new role
 * @param {Object} roleData - Role data
 * @param {string} roleData.name - Role name
 * @param {string} [roleData.description] - Role description
 * @param {string} [roleData.organizationId] - Organization ID
 * @param {string} [roleData.type] - Role type (system or custom)
 * @returns {Promise<Role>} Created role
 */
const createRole = async (roleData: {
    name: string
    description?: string
    organizationId?: string
    type?: 'system' | 'custom'
}): Promise<Role> => {
    const roleRepository = getRepository(Role)
    
    const role = roleRepository.create({
        name: roleData.name,
        description: roleData.description,
        organizationId: roleData.organizationId,
        type: roleData.type === 'system' ? RoleType.SYSTEM : RoleType.CUSTOM
    })
    
    return roleRepository.save(role)
}

/**
 * Update a role
 * @param {string} roleId - Role ID
 * @param {Object} roleData - Role data to update
 * @param {string} [roleData.name] - Role name
 * @param {string} [roleData.description] - Role description
 * @returns {Promise<Role>} Updated role
 * @throws {Error} If role not found
 */
const updateRole = async (
    roleId: string,
    roleData: {
        name?: string
        description?: string
    }
): Promise<Role> => {
    const roleRepository = getRepository(Role)
    const role = await getRoleById(roleId)
    
    if (roleData.name) {
        role.name = roleData.name
    }
    
    if (roleData.description !== undefined) {
        role.description = roleData.description
    }
    
    return roleRepository.save(role)
}

/**
 * Delete a role
 * @param {string} roleId - Role ID
 * @returns {Promise<void>}
 * @throws {Error} If role not found
 */
const deleteRole = async (roleId: string): Promise<void> => {
    const roleRepository = getRepository(Role)
    const role = await getRoleById(roleId)
    
    await roleRepository.remove(role)
}

/**
 * Clone a role with its permissions
 * @param {string} sourceRoleId - Source role ID
 * @param {Object} newRoleData - New role data
 * @param {string} newRoleData.name - New role name
 * @param {string} [newRoleData.description] - New role description
 * @param {string} [newRoleData.organizationId] - New role organization ID
 * @returns {Promise<Role>} Cloned role
 * @throws {Error} If source role not found
 */
const cloneRole = async (
    sourceRoleId: string,
    newRoleData: {
        name: string
        description?: string
        organizationId?: string
    }
): Promise<Role> => {
    const roleRepository = getRepository(Role)
    const rolePermissionRepository = getRepository(RolePermission)
    
    // Get source role
    const sourceRole = await getRoleById(sourceRoleId)
    
    // Create new role
    const newRole = roleRepository.create({
        name: newRoleData.name,
        description: newRoleData.description || sourceRole.description,
        organizationId: newRoleData.organizationId,
        type: RoleType.CUSTOM
    })
    
    const savedRole = await roleRepository.save(newRole)
    
    // Get source role permissions
    const sourceRolePermissions = await rolePermissionRepository.find({
        where: { roleId: sourceRoleId }
    })
    
    // Clone permissions
    if (sourceRolePermissions.length > 0) {
        const newRolePermissions = sourceRolePermissions.map(srp => {
            return rolePermissionRepository.create({
                roleId: savedRole.id,
                permissionId: srp.permissionId
            })
        })
        
        await rolePermissionRepository.save(newRolePermissions)
    }
    
    return savedRole
}

/**
 * Get all permissions
 * @returns {Promise<Permission[]>} Array of permissions
 */
const getAllPermissions = async (): Promise<Permission[]> => {
    const permissionRepository = getRepository(Permission)
    return permissionRepository.find()
}

/**
 * Get permission by ID
 * @param {string} permissionId - Permission ID
 * @returns {Promise<Permission>} Permission
 * @throws {Error} If permission not found
 */
const getPermissionById = async (permissionId: string): Promise<Permission> => {
    const permissionRepository = getRepository(Permission)
    const permission = await permissionRepository.findOne({
        where: { id: permissionId }
    })
    
    if (!permission) {
        const error: any = new Error('Permission not found')
        error.statusCode = 404
        throw error
    }
    
    return permission
}

/**
 * Get permissions for a role
 * @param {string} roleId - Role ID
 * @returns {Promise<Permission[]>} Array of permissions
 */
const getRolePermissions = async (roleId: string): Promise<Permission[]> => {
    const rolePermissionRepository = getRepository(RolePermission)
    const permissionRepository = getRepository(Permission)
    
    // Get role permission mappings
    const rolePermissions = await rolePermissionRepository.find({
        where: { roleId }
    })
    
    if (!rolePermissions.length) {
        return []
    }
    
    // Get permission IDs
    const permissionIds = rolePermissions.map(rp => rp.permissionId)
    
    // Get permissions
    return permissionRepository.find({
        where: { id: { $in: permissionIds } as any }
    })
}

/**
 * Assign a permission to a role
 * @param {string} roleId - Role ID
 * @param {string} permissionId - Permission ID
 * @returns {Promise<void>}
 * @throws {Error} If role or permission not found
 */
const assignPermissionToRole = async (roleId: string, permissionId: string): Promise<void> => {
    const rolePermissionRepository = getRepository(RolePermission)
    
    // Check if role exists
    await getRoleById(roleId)
    
    // Check if permission exists
    await getPermissionById(permissionId)
    
    // Check if mapping already exists
    const existingMapping = await rolePermissionRepository.findOne({
        where: { roleId, permissionId }
    })
    
    if (existingMapping) {
        return // Already assigned
    }
    
    // Create new mapping
    const rolePermission = rolePermissionRepository.create({
        roleId,
        permissionId
    })
    
    await rolePermissionRepository.save(rolePermission)
}

/**
 * Remove a permission from a role
 * @param {string} roleId - Role ID
 * @param {string} permissionId - Permission ID
 * @returns {Promise<void>}
 */
const removePermissionFromRole = async (roleId: string, permissionId: string): Promise<void> => {
    const rolePermissionRepository = getRepository(RolePermission)
    
    // Find the mapping
    const rolePermission = await rolePermissionRepository.findOne({
        where: { roleId, permissionId }
    })
    
    if (rolePermission) {
        await rolePermissionRepository.remove(rolePermission)
    }
}

/**
 * Get roles for a user
 * @param {string} userId - User ID
 * @returns {Promise<Role[]>} Array of roles
 */
const getUserRoles = async (userId: string): Promise<Role[]> => {
    const userRoleRepository = getRepository(UserRole)
    const roleRepository = getRepository(Role)
    
    // Get user role mappings
    const userRoles = await userRoleRepository.find({
        where: { userId }
    })
    
    if (!userRoles.length) {
        return []
    }
    
    // Get role IDs
    const roleIds = userRoles.map(ur => ur.roleId)
    
    // Get roles
    return roleRepository.find({
        where: { id: { $in: roleIds } as any }
    })
}

/**
 * Assign a role to a user
 * @param {string} userId - User ID
 * @param {string} roleId - Role ID
 * @returns {Promise<void>}
 * @throws {Error} If role not found
 */
const assignRoleToUser = async (userId: string, roleId: string): Promise<void> => {
    const userRoleRepository = getRepository(UserRole)
    
    // Check if role exists
    await getRoleById(roleId)
    
    // Check if mapping already exists
    const existingMapping = await userRoleRepository.findOne({
        where: { userId, roleId }
    })
    
    if (existingMapping) {
        return // Already assigned
    }
    
    // Create new mapping
    const userRole = userRoleRepository.create({
        userId,
        roleId
    })
    
    await userRoleRepository.save(userRole)
}

/**
 * Remove a role from a user
 * @param {string} userId - User ID
 * @param {string} roleId - Role ID
 * @returns {Promise<void>}
 */
const removeRoleFromUser = async (userId: string, roleId: string): Promise<void> => {
    const userRoleRepository = getRepository(UserRole)
    
    // Find the mapping
    const userRole = await userRoleRepository.findOne({
        where: { userId, roleId }
    })
    
    if (userRole) {
        await userRoleRepository.remove(userRole)
    }
}

/**
 * Get user permissions for a specific resource
 * @param {string} resourceType - Resource type
 * @param {string} resourceId - Resource ID
 * @param {string} userId - User ID
 * @returns {Promise<string[]>} Array of permission actions
 */
const getUserResourcePermissions = async (
    resourceType: string,
    resourceId: string,
    userId: string
): Promise<string[]> => {
    // Get user roles
    const roles = await getUserRoles(userId)
    
    if (!roles.length) {
        return []
    }
    
    // Get permissions for each role
    const permissionsByRole = await Promise.all(
        roles.map(role => getRolePermissions(role.id))
    )
    
    // Flatten permissions and filter by resource type
    const permissions = permissionsByRole
        .flat()
        .filter(
            permission =>
                permission.resourceType === resourceType
        )
    
    // Extract unique actions
    return [...new Set(permissions.map(permission => permission.action))]
}

export default {
    getAllRoles,
    getRolesByOrganizationId,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    cloneRole,
    getAllPermissions,
    getPermissionById,
    getRolePermissions,
    assignPermissionToRole,
    removePermissionFromRole,
    getUserRoles,
    assignRoleToUser,
    removeRoleFromUser,
    getUserResourcePermissions,
    permissionService,
    roleService,
    customRoleService,
    attributeService,
    permissionExpressionService,
    conditionalPermissionService,
    timeBasedPermissionService,
    fineGrainedPermissionService,
    initializeRolesAndPermissions
}