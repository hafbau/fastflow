import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { In } from 'typeorm'
import { UserRole } from '../database/entities/UserRole'
import { RolePermission } from '../database/entities/RolePermission'
import { Permission } from '../database/entities/Permission'
import logger from '../utils/logger'
import { getInitializedDataSource } from '../DataSource'

/**
 * Middleware to check if a user has the required permission
 * @param {string} permissionName - The permission name to check
 * @returns {Function} Express middleware
 */
export const checkRolePermission = (permissionName: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id

            // If no user is authenticated, deny access
            if (!userId) {
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    error: 'Authentication required'
                })
            }

            // Get initialized data source
            const dataSource = await getInitializedDataSource()
            
            // Get user roles
            const userRoleRepository = dataSource.getRepository(UserRole)
            const userRoles = await userRoleRepository.find({
                where: { userId },
                relations: ['role']
            })

            if (!userRoles.length) {
                return res.status(StatusCodes.FORBIDDEN).json({
                    success: false,
                    error: 'No roles assigned to user'
                })
            }

            // Get role IDs
            const roleIds = userRoles.map(userRole => userRole.roleId)

            // Check if any of the user's roles has the required permission
            const rolePermissionRepository = dataSource.getRepository(RolePermission)
            const permissionRepository = dataSource.getRepository(Permission)

            // Find the permission ID by name
            const permission = await permissionRepository.findOne({
                where: { name: permissionName } as any
            })

            if (!permission) {
                logger.error(`Permission not found: ${permissionName}`)
                return res.status(StatusCodes.FORBIDDEN).json({
                    success: false,
                    error: 'Permission not found'
                })
            }

            // Check if any of the user's roles has this permission
            const rolePermission = await rolePermissionRepository.findOne({
                where: {
                    roleId: In(roleIds),
                    permissionId: permission.id
                } as any
            })

            if (!rolePermission) {
                return res.status(StatusCodes.FORBIDDEN).json({
                    success: false,
                    error: 'Insufficient permissions'
                })
            }

            // User has the required permission
            next()
        } catch (error: any) {
            logger.error(`Role permission check error: ${error.message}`)
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: 'Error checking permissions'
            })
        }
    }
}

/**
 * Middleware to check if a user has admin role
 * @returns {Function} Express middleware
 */
export const checkAdminRole = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id

            // If no user is authenticated, deny access
            if (!userId) {
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    error: 'Authentication required'
                })
            }

            // Get initialized data source
            const dataSource = await getInitializedDataSource()
            
            // Get user roles
            const userRoleRepository = dataSource.getRepository(UserRole)
            const userRoles = await userRoleRepository.find({
                where: { userId },
                relations: ['role']
            })

            // Check if user has admin role
            const isAdmin = userRoles.some(userRole => userRole.role.name === 'admin')

            if (!isAdmin) {
                return res.status(StatusCodes.FORBIDDEN).json({
                    success: false,
                    error: 'Admin role required'
                })
            }

            // User has admin role
            next()
        } catch (error: any) {
            logger.error(`Admin role check error: ${error.message}`)
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: 'Error checking admin role'
            })
        }
    }
}