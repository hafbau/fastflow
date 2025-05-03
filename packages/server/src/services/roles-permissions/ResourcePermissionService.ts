import { StatusCodes } from 'http-status-codes'
import { ResourcePermission } from '../../database/entities/ResourcePermission'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { roleService } from './RoleService'

/**
 * Grant direct resource permission to user
 */
export const grantResourcePermission = async (
    resourceType: string,
    resourceId: string,
    userId: string,
    permission: string
): Promise<void> => {
    try {
        const appServer = getRunningExpressApp()
        
        // Check if permission already exists
        const existingPermission = await appServer.AppDataSource.getRepository(ResourcePermission).findOneBy({
            resourceType: resourceType,
            resourceId: resourceId,
            userId: userId,
            permission: permission
        })
        
        if (existingPermission) {
            return // Already granted, no action needed
        }
        
        // Create new permission
        const resourcePermission = appServer.AppDataSource.getRepository(ResourcePermission).create({
            resourceType: resourceType,
            resourceId: resourceId,
            userId: userId,
            permission: permission
        })
        
        await appServer.AppDataSource.getRepository(ResourcePermission).save(resourcePermission)
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
export const revokeResourcePermission = async (
    resourceType: string,
    resourceId: string,
    userId: string,
    permission: string
): Promise<void> => {
    try {
        const appServer = getRunningExpressApp()
        
        await appServer.AppDataSource.getRepository(ResourcePermission).delete({
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
export const getUserResourcePermissions = async (
    resourceType: string,
    resourceId: string,
    userId: string
): Promise<string[]> => {
    try {
        const appServer = getRunningExpressApp()
        
        // Get direct resource permissions
        const directPermissions = await appServer.AppDataSource.getRepository(ResourcePermission).find({
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