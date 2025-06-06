import { StatusCodes } from 'http-status-codes'
import { CustomRole } from '../../database/entities/CustomRole'
import { Role, RoleType } from '../../database/entities/Role'
import { RolePermission } from '../../database/entities/RolePermission'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'
import roleService from './RoleService'
import permissionService from './PermissionService'
import organizationsService from '../organizations'
import logger from '../../utils/logger'
import { Repository } from 'typeorm'
import { getInitializedDataSource } from '../../DataSource'

/**
 * Custom Role Service
 * Handles custom role management, inheritance, and templates
 */
class CustomRoleService {
    // In-memory cache for custom roles
    private customRoleCache: Map<string, any>
    
    // Repository instances
    private customRoleRepository: Repository<CustomRole> | null = null
    private rolePermissionRepository: Repository<RolePermission> | null = null
    
    // Initialization flag
    private isInitialized: boolean = false

    constructor() {
        this.customRoleCache = new Map<string, any>()
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
            this.customRoleRepository = dataSource.getRepository(CustomRole)
            this.rolePermissionRepository = dataSource.getRepository(RolePermission)
            
            // Mark as initialized
            this.isInitialized = true
        } catch (error) {
            logger.error('Failed to initialize CustomRoleService repositories', error)
            throw error
        }
    }

    /**
     * Get all custom roles
     */
    async getAllCustomRoles(): Promise<CustomRole[]> {
        try {
            await this.ensureInitialized()
            
            const cacheKey = 'all_custom_roles'
            const cachedRoles = this.customRoleCache.get(cacheKey) as CustomRole[] | undefined
            
            if (cachedRoles) {
                return cachedRoles
            }
            
            const dbResponse = await this.customRoleRepository!.find({
                order: {
                    name: 'ASC'
                },
                relations: ['organization', 'parentRole', 'template']
            })
            
            this.customRoleCache.set(cacheKey, dbResponse)
            return dbResponse
        } catch (error) {
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: CustomRoleService.getAllCustomRoles - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get custom roles by organization ID
     */
    async getCustomRolesByOrganizationId(organizationId: string): Promise<CustomRole[]> {
        try {
            await this.ensureInitialized()
            
            const cacheKey = `org_custom_roles_${organizationId}`
            const cachedRoles = this.customRoleCache.get(cacheKey) as CustomRole[] | undefined
            
            if (cachedRoles) {
                return cachedRoles
            }
            
            // Verify organization exists
            await organizationsService.getOrganizationById(organizationId)
            
            const dbResponse = await this.customRoleRepository!.find({
                where: {
                    organizationId: organizationId
                },
                order: {
                    name: 'ASC'
                },
                relations: ['organization', 'parentRole', 'template']
            })
            
            this.customRoleCache.set(cacheKey, dbResponse)
            return dbResponse
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: CustomRoleService.getCustomRolesByOrganizationId - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get custom role by ID
     */
    async getCustomRoleById(roleId: string): Promise<CustomRole> {
        try {
            await this.ensureInitialized()
            
            const cacheKey = `custom_role_${roleId}`
            const cachedRole = this.customRoleCache.get(cacheKey) as CustomRole | undefined
            
            if (cachedRole) {
                return cachedRole
            }
            
            const dbResponse = await this.customRoleRepository!.findOne({
                where: {
                    id: roleId
                },
                relations: ['organization', 'parentRole', 'template', 'childRoles']
            })
            
            if (!dbResponse) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, `Custom role ${roleId} not found`)
            }
            
            this.customRoleCache.set(cacheKey, dbResponse)
            return dbResponse
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: CustomRoleService.getCustomRoleById - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Create a new custom role
     */
    async createCustomRole(customRole: Partial<CustomRole>): Promise<CustomRole> {
        try {
            await this.ensureInitialized()
            
            // Verify organization exists if provided
            if (customRole.organizationId) {
                await organizationsService.getOrganizationById(customRole.organizationId)
            }
            
            // Verify parent role exists if provided
            if (customRole.parentRoleId) {
                await roleService.getRoleById(customRole.parentRoleId)
            }
            
            // Verify template role exists if provided
            if (customRole.templateId) {
                await this.getCustomRoleById(customRole.templateId)
            }
            
            // Ensure type is set to custom
            customRole.type = RoleType.CUSTOM
            
            const newCustomRole = this.customRoleRepository!.create(customRole)
            const dbResponse = await this.customRoleRepository!.save(newCustomRole)
            
            // Invalidate cache
            this.invalidateCustomRoleCache()
            
            // Fetch the complete role with relations
            return this.getCustomRoleById(dbResponse.id)
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: CustomRoleService.createCustomRole - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Update a custom role
     */
    async updateCustomRole(roleId: string, updateData: Partial<CustomRole>): Promise<CustomRole> {
        try {
            await this.ensureInitialized()
            
            const customRole = await this.getCustomRoleById(roleId)
            
            // Verify organization exists if changing organization
            if (updateData.organizationId && updateData.organizationId !== customRole.organizationId) {
                await organizationsService.getOrganizationById(updateData.organizationId)
            }
            
            // Verify parent role exists if changing parent
            if (updateData.parentRoleId && updateData.parentRoleId !== customRole.parentRoleId) {
                await roleService.getRoleById(updateData.parentRoleId)
                
                // Check for circular references
                if (await this.wouldCreateCircularReference(roleId, updateData.parentRoleId)) {
                    throw new InternalFastflowError(
                        StatusCodes.BAD_REQUEST,
                        'Cannot set parent role: would create a circular reference'
                    )
                }
            }
            
            // Verify template role exists if changing template
            if (updateData.templateId && updateData.templateId !== customRole.templateId) {
                await this.getCustomRoleById(updateData.templateId)
            }
            
            // Ensure type remains custom
            updateData.type = RoleType.CUSTOM
            
            const updatedCustomRole = this.customRoleRepository!.merge(customRole, updateData)
            await this.customRoleRepository!.save(updatedCustomRole)
            
            // Invalidate cache
            this.invalidateCustomRoleCache()
            
            // Fetch the complete updated role with relations
            return this.getCustomRoleById(roleId)
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: CustomRoleService.updateCustomRole - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Delete a custom role
     */
    async deleteCustomRole(roleId: string): Promise<void> {
        try {
            await this.ensureInitialized()
            
            const customRole = await this.getCustomRoleById(roleId)
            
            // Check if this role is a parent to other roles
            const childRoles = await this.customRoleRepository!.find({
                where: {
                    parentRoleId: roleId
                }
            })
            
            if (childRoles.length > 0) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Cannot delete role: it is a parent to other roles'
                )
            }
            
            // Check if this role is a template for other roles
            const derivedRoles = await this.customRoleRepository!.find({
                where: {
                    templateId: roleId
                }
            })
            
            if (derivedRoles.length > 0) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Cannot delete role: it is a template for other roles'
                )
            }
            
            await this.customRoleRepository!.delete({ id: roleId })
            
            // Invalidate cache
            this.invalidateCustomRoleCache()
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: CustomRoleService.deleteCustomRole - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Create a role template
     */
    async createRoleTemplate(templateData: Partial<CustomRole>): Promise<CustomRole> {
        try {
            // Set template flag
            templateData.isTemplate = true
            
            // Create the template role
            return this.createCustomRole(templateData)
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: CustomRoleService.createRoleTemplate - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get all role templates
     */
    async getRoleTemplates(organizationId?: string): Promise<CustomRole[]> {
        try {
            await this.ensureInitialized()
            
            const cacheKey = organizationId ? `org_templates_${organizationId}` : 'all_templates'
            const cachedTemplates = this.customRoleCache.get(cacheKey) as CustomRole[] | undefined
            
            if (cachedTemplates) {
                return cachedTemplates
            }
            
            const whereClause: any = {
                isTemplate: true
            }
            
            if (organizationId) {
                whereClause.organizationId = organizationId
            }
            
            const dbResponse = await this.customRoleRepository!.find({
                where: whereClause,
                order: {
                    name: 'ASC'
                },
                relations: ['organization']
            })
            
            this.customRoleCache.set(cacheKey, dbResponse)
            return dbResponse
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: CustomRoleService.getRoleTemplates - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Create a role from template
     */
    async createRoleFromTemplate(templateId: string, roleData: Partial<CustomRole>): Promise<CustomRole> {
        try {
            await this.ensureInitialized()
            
            const template = await this.getCustomRoleById(templateId)
            
            if (!template.isTemplate) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    `Role ${templateId} is not a template`
                )
            }
            
            // Create new role based on template
            const newRole = {
                name: roleData.name || `${template.name} (from template)`,
                description: roleData.description || template.description,
                organizationId: roleData.organizationId || template.organizationId,
                parentRoleId: roleData.parentRoleId || template.parentRoleId,
                priority: roleData.priority !== undefined ? roleData.priority : template.priority,
                templateId: templateId,
                isTemplate: false,
                type: RoleType.CUSTOM
            }
            
            const createdRole = await this.createCustomRole(newRole)
            
            // Copy permissions from template
            const rolePermissions = await this.rolePermissionRepository!.find({
                where: {
                    roleId: template.id
                },
                relations: ['permission']
            })
            
            for (const rp of rolePermissions) {
                await roleService.assignPermissionToRole(createdRole.id, rp.permissionId)
            }
            
            return createdRole
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: CustomRoleService.createRoleFromTemplate - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get all effective permissions for a role, including inherited permissions
     */
    async getEffectiveRolePermissions(roleId: string): Promise<any[]> {
        try {
            await this.ensureInitialized()
            
            const customRole = await this.getCustomRoleById(roleId)
            
            // Get direct permissions
            const directPermissions = await roleService.getRolePermissions(roleId)
            const permissionMap = new Map<string, any>()
            
            // Add direct permissions to map
            for (const permission of directPermissions) {
                permissionMap.set(permission.id, {
                    permission,
                    source: 'direct',
                    roleId: roleId
                })
            }
            
            // If there's a parent role, get inherited permissions
            if (customRole.parentRoleId) {
                const parentPermissions = await this.getEffectiveRolePermissions(customRole.parentRoleId)
                
                // Add parent permissions to map (if not already present)
                for (const permInfo of parentPermissions) {
                    if (!permissionMap.has(permInfo.permission.id)) {
                        permissionMap.set(permInfo.permission.id, {
                            permission: permInfo.permission,
                            source: 'inherited',
                            roleId: permInfo.roleId
                        })
                    }
                }
            }
            
            // Convert map to array
            return Array.from(permissionMap.values())
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: CustomRoleService.getEffectiveRolePermissions - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Get role hierarchy
     */
    async getRoleHierarchy(roleId: string): Promise<any> {
        try {
            await this.ensureInitialized()
            
            const customRole = await this.getCustomRoleById(roleId)
            const hierarchy: any = {
                id: customRole.id,
                name: customRole.name,
                description: customRole.description,
                priority: customRole.priority,
                children: []
            }
            
            // Get child roles
            const childRoles = await this.customRoleRepository!.find({
                where: {
                    parentRoleId: roleId
                }
            })
            
            // Recursively build hierarchy
            for (const childRole of childRoles) {
                const childHierarchy = await this.getRoleHierarchy(childRole.id)
                hierarchy.children.push(childHierarchy)
            }
            
            return hierarchy
        } catch (error) {
            if (error instanceof InternalFastflowError) throw error
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Error: CustomRoleService.getRoleHierarchy - ${getErrorMessage(error)}`
            )
        }
    }

    /**
     * Check if setting a parent role would create a circular reference
     */
    private async wouldCreateCircularReference(roleId: string, parentRoleId: string): Promise<boolean> {
        // If the parent is the same as the role, it's circular
        if (roleId === parentRoleId) {
            return true
        }
        
        try {
            await this.ensureInitialized()
            
            const parentRole = await this.customRoleRepository!.findOne({
                where: {
                    id: parentRoleId
                }
            })
            
            // If parent has no parent, we're good
            if (!parentRole || !parentRole.parentRoleId) {
                return false
            }
            
            // If parent's parent is the role, it's circular
            if (parentRole.parentRoleId === roleId) {
                return true
            }
            
            // Check parent's parent recursively
            return this.wouldCreateCircularReference(roleId, parentRole.parentRoleId)
        } catch (error) {
            logger.error(`Error checking circular reference: ${getErrorMessage(error)}`)
            return false // Assume no circular reference in case of error
        }
    }

    /**
     * Invalidate custom role cache
     */
    invalidateCustomRoleCache(): void {
        this.customRoleCache.clear()
    }
}

// Create a singleton instance
const customRoleService = new CustomRoleService()
export default customRoleService

// Export the class for use with the service factory
export { CustomRoleService }