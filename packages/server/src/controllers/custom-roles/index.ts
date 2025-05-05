import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import customRoleService from '../../services/roles-permissions/CustomRoleService'
import roleService from '../../services/roles-permissions/RoleService'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'
import logger from '../../utils/logger'

/**
 * Get all custom roles
 */
export const getAllCustomRoles = async (req: Request, res: Response) => {
    try {
        const customRoles = await customRoleService.getAllCustomRoles()
        return res.status(StatusCodes.OK).json(customRoles)
    } catch (error) {
        logger.error(`Error getting all custom roles: ${getErrorMessage(error)}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get custom roles' })
    }
}

/**
 * Get custom roles by organization ID
 */
export const getCustomRolesByOrganization = async (req: Request, res: Response) => {
    try {
        const { organizationId } = req.params
        const customRoles = await customRoleService.getCustomRolesByOrganizationId(organizationId)
        return res.status(StatusCodes.OK).json(customRoles)
    } catch (error) {
        logger.error(`Error getting custom roles for organization: ${getErrorMessage(error)}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get custom roles for organization' })
    }
}

/**
 * Get custom role by ID
 */
export const getCustomRoleById = async (req: Request, res: Response) => {
    try {
        const { roleId } = req.params
        const customRole = await customRoleService.getCustomRoleById(roleId)
        return res.status(StatusCodes.OK).json(customRole)
    } catch (error) {
        logger.error(`Error getting custom role: ${getErrorMessage(error)}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get custom role' })
    }
}

/**
 * Create a new custom role
 */
export const createCustomRole = async (req: Request, res: Response) => {
    try {
        const { organizationId } = req.params
        const roleData = req.body
        
        // Set organization ID from path parameter
        roleData.organizationId = organizationId
        
        const customRole = await customRoleService.createCustomRole(roleData)
        return res.status(StatusCodes.CREATED).json(customRole)
    } catch (error) {
        logger.error(`Error creating custom role: ${getErrorMessage(error)}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create custom role' })
    }
}

/**
 * Update a custom role
 */
export const updateCustomRole = async (req: Request, res: Response) => {
    try {
        const { roleId } = req.params
        const updateData = req.body
        
        const updatedRole = await customRoleService.updateCustomRole(roleId, updateData)
        return res.status(StatusCodes.OK).json(updatedRole)
    } catch (error) {
        logger.error(`Error updating custom role: ${getErrorMessage(error)}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update custom role' })
    }
}

/**
 * Delete a custom role
 */
export const deleteCustomRole = async (req: Request, res: Response) => {
    try {
        const { roleId } = req.params
        await customRoleService.deleteCustomRole(roleId)
        return res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
        logger.error(`Error deleting custom role: ${getErrorMessage(error)}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete custom role' })
    }
}

/**
 * Get role templates
 */
export const getRoleTemplates = async (req: Request, res: Response) => {
    try {
        const { organizationId } = req.params
        const templates = await customRoleService.getRoleTemplates(organizationId)
        return res.status(StatusCodes.OK).json(templates)
    } catch (error) {
        logger.error(`Error getting role templates: ${getErrorMessage(error)}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get role templates' })
    }
}

/**
 * Create a role template
 */
export const createRoleTemplate = async (req: Request, res: Response) => {
    try {
        const { organizationId } = req.params
        const templateData = req.body
        
        // Set organization ID from path parameter
        templateData.organizationId = organizationId
        
        const template = await customRoleService.createRoleTemplate(templateData)
        return res.status(StatusCodes.CREATED).json(template)
    } catch (error) {
        logger.error(`Error creating role template: ${getErrorMessage(error)}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create role template' })
    }
}

/**
 * Create a role from template
 */
export const createRoleFromTemplate = async (req: Request, res: Response) => {
    try {
        const { templateId } = req.params
        const roleData = req.body
        
        const customRole = await customRoleService.createRoleFromTemplate(templateId, roleData)
        return res.status(StatusCodes.CREATED).json(customRole)
    } catch (error) {
        logger.error(`Error creating role from template: ${getErrorMessage(error)}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create role from template' })
    }
}

/**
 * Get effective permissions for a role
 */
export const getEffectiveRolePermissions = async (req: Request, res: Response) => {
    try {
        const { roleId } = req.params
        const permissions = await customRoleService.getEffectiveRolePermissions(roleId)
        return res.status(StatusCodes.OK).json(permissions)
    } catch (error) {
        logger.error(`Error getting effective role permissions: ${getErrorMessage(error)}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get effective role permissions' })
    }
}

/**
 * Get role hierarchy
 */
export const getRoleHierarchy = async (req: Request, res: Response) => {
    try {
        const { roleId } = req.params
        const hierarchy = await customRoleService.getRoleHierarchy(roleId)
        return res.status(StatusCodes.OK).json(hierarchy)
    } catch (error) {
        logger.error(`Error getting role hierarchy: ${getErrorMessage(error)}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get role hierarchy' })
    }
}

/**
 * Assign permission to role
 */
export const assignPermissionToRole = async (req: Request, res: Response) => {
    try {
        const { roleId, permissionId } = req.params
        await roleService.assignPermissionToRole(roleId, permissionId)
        return res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
        logger.error(`Error assigning permission to role: ${getErrorMessage(error)}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to assign permission to role' })
    }
}

/**
 * Remove permission from role
 */
export const removePermissionFromRole = async (req: Request, res: Response) => {
    try {
        const { roleId, permissionId } = req.params
        await roleService.removePermissionFromRole(roleId, permissionId)
        return res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
        logger.error(`Error removing permission from role: ${getErrorMessage(error)}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to remove permission from role' })
    }
}