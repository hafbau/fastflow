/**
 * Resource Permissions Controller
 * 
 * This module provides API endpoints for managing resource permissions.
 */

import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import resourcePermissionService from '../../services/ResourcePermissionService'
import { InternalFastflowError } from '../../errors/InternalFastflowError/index'
import logger from '../../utils/logger'

/**
 * Get resource permissions for a user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getResourcePermissions = async (req: Request, res: Response) => {
    try {
        const { userId, resourceType, resourceId } = req.params

        const permissions = await resourcePermissionService.getResourcePermissions(
            userId,
            resourceType,
            resourceId
        )

        res.status(StatusCodes.OK).json({
            permissions
        })
    } catch (error: any) {
        logger.error(`[ResourcePermissionsController] Get resource permissions error: ${error.message}`)
        
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to get resource permissions',
            message: error.message
        })
    }
}

/**
 * Assign permission to a resource for a user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const assignPermission = async (req: Request, res: Response) => {
    try {
        const { userId, resourceType, resourceId } = req.params
        const { permission } = req.body

        if (!permission) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Missing required fields',
                message: 'Permission is required'
            })
        }

        const result = await resourcePermissionService.assignPermission(
            userId,
            resourceType,
            resourceId,
            permission
        )

        res.status(StatusCodes.OK).json({
            message: 'Permission assigned successfully',
            resourcePermission: result
        })
    } catch (error: any) {
        logger.error(`[ResourcePermissionsController] Assign permission error: ${error.message}`)
        
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to assign permission',
            message: error.message
        })
    }
}

/**
 * Remove permission from a resource for a user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const removePermission = async (req: Request, res: Response) => {
    try {
        const { userId, resourceType, resourceId } = req.params
        const { permission } = req.body

        if (!permission) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Missing required fields',
                message: 'Permission is required'
            })
        }

        const result = await resourcePermissionService.removePermission(
            userId,
            resourceType,
            resourceId,
            permission
        )

        if (!result) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Permission not found',
                message: 'The specified permission does not exist'
            })
        }

        res.status(StatusCodes.OK).json({
            message: 'Permission removed successfully'
        })
    } catch (error: any) {
        logger.error(`[ResourcePermissionsController] Remove permission error: ${error.message}`)
        
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to remove permission',
            message: error.message
        })
    }
}

/**
 * Get resources with a specific permission for a user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getResourcesWithPermission = async (req: Request, res: Response) => {
    try {
        const { userId, resourceType } = req.params
        const { permission } = req.query

        if (!permission || typeof permission !== 'string') {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Missing required fields',
                message: 'Permission query parameter is required'
            })
        }

        const resourceIds = await resourcePermissionService.getResourcesWithPermission(
            userId,
            resourceType,
            permission
        )

        res.status(StatusCodes.OK).json({
            resourceIds
        })
    } catch (error: any) {
        logger.error(`[ResourcePermissionsController] Get resources with permission error: ${error.message}`)
        
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to get resources with permission',
            message: error.message
        })
    }
}

/**
 * Get users with a specific permission for a resource
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getUsersWithPermission = async (req: Request, res: Response) => {
    try {
        const { resourceType, resourceId } = req.params
        const { permission } = req.query

        if (!permission || typeof permission !== 'string') {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Missing required fields',
                message: 'Permission query parameter is required'
            })
        }

        const userIds = await resourcePermissionService.getUsersWithPermission(
            resourceType,
            resourceId,
            permission
        )

        res.status(StatusCodes.OK).json({
            userIds
        })
    } catch (error: any) {
        logger.error(`[ResourcePermissionsController] Get users with permission error: ${error.message}`)
        
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to get users with permission',
            message: error.message
        })
    }
}

/**
 * Check if a user has a specific permission for a resource
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const checkPermission = async (req: Request, res: Response) => {
    try {
        const { userId, resourceType, resourceId } = req.params
        const { permission } = req.query

        if (!permission || typeof permission !== 'string') {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Missing required fields',
                message: 'Permission query parameter is required'
            })
        }

        const hasPermission = await resourcePermissionService.hasResourcePermission(
            userId,
            resourceType,
            resourceId,
            permission
        )

        res.status(StatusCodes.OK).json({
            hasPermission
        })
    } catch (error: any) {
        logger.error(`[ResourcePermissionsController] Check permission error: ${error.message}`)
        
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to check permission',
            message: error.message
        })
    }
}

/**
 * Batch check permissions for a user and resource
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const batchCheckPermissions = async (req: Request, res: Response) => {
    try {
        const { userId, resourceType, resourceId } = req.params
        const { permissions } = req.body

        if (!permissions || !Array.isArray(permissions)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Missing required fields',
                message: 'Permissions array is required'
            })
        }

        const permissionResults = await resourcePermissionService.batchCheckPermissions(
            userId,
            resourceType,
            resourceId,
            permissions
        )

        res.status(StatusCodes.OK).json({
            permissions: permissionResults
        })
    } catch (error: any) {
        logger.error(`[ResourcePermissionsController] Batch check permissions error: ${error.message}`)
        
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to batch check permissions',
            message: error.message
        })
    }
}

/**
 * Remove all permissions for a resource
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const removeAllPermissionsForResource = async (req: Request, res: Response) => {
    try {
        const { resourceType, resourceId } = req.params

        const result = await resourcePermissionService.removeAllPermissionsForResource(
            resourceType,
            resourceId
        )

        res.status(StatusCodes.OK).json({
            message: 'All permissions removed successfully',
            removed: result
        })
    } catch (error: any) {
        logger.error(`[ResourcePermissionsController] Remove all permissions for resource error: ${error.message}`)
        
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to remove all permissions for resource',
            message: error.message
        })
    }
}