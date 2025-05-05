import express from 'express'
import { attributeController } from '../controllers/AttributeController'
import conditionalPermissionService from '../services/roles-permissions/ConditionalPermissionService'
import timeBasedPermissionService from '../services/roles-permissions/TimeBasedPermissionService'
import fineGrainedPermissionService from '../services/roles-permissions/FineGrainedPermissionService'
import { StatusCodes } from 'http-status-codes'
import logger from '../utils/logger'
import { InternalFastflowError } from '../errors/InternalFastflowError'

const router = express.Router()

// ==============================|| ATTRIBUTE ROUTES ||============================== //

// Resource attributes
router.get('/attributes/resource/:resourceType/:resourceId', attributeController.getResourceAttributes.bind(attributeController))
router.get('/attributes/resource/:resourceType/:resourceId/:key', attributeController.getResourceAttribute.bind(attributeController))
router.post('/attributes/resource/:resourceType/:resourceId', attributeController.setResourceAttribute.bind(attributeController))
router.delete('/attributes/resource/:resourceType/:resourceId/:key', attributeController.deleteResourceAttribute.bind(attributeController))

// User attributes
router.get('/attributes/user/:userId', attributeController.getUserAttributes.bind(attributeController))
router.get('/attributes/user/:userId/:key', attributeController.getUserAttribute.bind(attributeController))
router.post('/attributes/user/:userId', attributeController.setUserAttribute.bind(attributeController))
router.delete('/attributes/user/:userId/:key', attributeController.deleteUserAttribute.bind(attributeController))

// Environment attributes
router.get('/attributes/environment', attributeController.getEnvironmentAttributes.bind(attributeController))
router.get('/attributes/environment/:key', attributeController.getEnvironmentAttribute.bind(attributeController))
router.post('/attributes/environment', attributeController.setEnvironmentAttribute.bind(attributeController))
router.delete('/attributes/environment/:key', attributeController.deleteEnvironmentAttribute.bind(attributeController))

// ==============================|| CONDITIONAL PERMISSION ROUTES ||============================== //

// Get conditional permissions
router.get('/conditional', async (req, res) => {
    try {
        const { userId, permissionId, resourceType, resourceId } = req.query as {
            userId?: string
            permissionId?: string
            resourceType?: string
            resourceId?: string
        }
        
        if (!userId) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'User ID is required'
            )
        }
        
        let permissions
        
        if (permissionId) {
            permissions = await conditionalPermissionService.getConditionalPermissionsForPermission(
                userId,
                permissionId,
                resourceType,
                resourceId
            )
        } else {
            permissions = await conditionalPermissionService.getConditionalPermissionsForUser(userId)
        }
        
        res.status(StatusCodes.OK).json(permissions)
    } catch (error: any) {
        logger.error(`[ConditionalPermissionController] Get conditional permissions error: ${error.message}`)
        
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
        const message = error.message || 'Failed to get conditional permissions'
        
        res.status(statusCode).json({ error: message })
    }
})

// Get conditional permission by ID
router.get('/conditional/:id', async (req, res) => {
    try {
        const { id } = req.params
        
        const permission = await conditionalPermissionService.getConditionalPermissionById(id)
        res.status(StatusCodes.OK).json(permission)
    } catch (error: any) {
        logger.error(`[ConditionalPermissionController] Get conditional permission error: ${error.message}`)
        
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
        const message = error.message || 'Failed to get conditional permission'
        
        res.status(statusCode).json({ error: message })
    }
})

// Create conditional permission
router.post('/conditional', async (req, res) => {
    try {
        const permission = await conditionalPermissionService.createConditionalPermission(req.body)
        res.status(StatusCodes.CREATED).json(permission)
    } catch (error: any) {
        logger.error(`[ConditionalPermissionController] Create conditional permission error: ${error.message}`)
        
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
        const message = error.message || 'Failed to create conditional permission'
        
        res.status(statusCode).json({ error: message })
    }
})

// Update conditional permission
router.put('/conditional/:id', async (req, res) => {
    try {
        const { id } = req.params
        
        const permission = await conditionalPermissionService.updateConditionalPermission(id, req.body)
        res.status(StatusCodes.OK).json(permission)
    } catch (error: any) {
        logger.error(`[ConditionalPermissionController] Update conditional permission error: ${error.message}`)
        
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
        const message = error.message || 'Failed to update conditional permission'
        
        res.status(statusCode).json({ error: message })
    }
})

// Delete conditional permission
router.delete('/conditional/:id', async (req, res) => {
    try {
        const { id } = req.params
        
        await conditionalPermissionService.deleteConditionalPermission(id)
        res.status(StatusCodes.NO_CONTENT).send()
    } catch (error: any) {
        logger.error(`[ConditionalPermissionController] Delete conditional permission error: ${error.message}`)
        
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
        const message = error.message || 'Failed to delete conditional permission'
        
        res.status(statusCode).json({ error: message })
    }
})

// ==============================|| TIME-BASED PERMISSION ROUTES ||============================== //

// Get time-based permissions
router.get('/time-based', async (req, res) => {
    try {
        const { userId, permissionId, resourceType, resourceId } = req.query as {
            userId?: string
            permissionId?: string
            resourceType?: string
            resourceId?: string
        }
        
        if (!userId) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'User ID is required'
            )
        }
        
        let permissions
        
        if (permissionId) {
            permissions = await timeBasedPermissionService.getTimeBasedPermissionsForPermission(
                userId,
                permissionId,
                resourceType,
                resourceId
            )
        } else {
            permissions = await timeBasedPermissionService.getTimeBasedPermissionsForUser(userId)
        }
        
        res.status(StatusCodes.OK).json(permissions)
    } catch (error: any) {
        logger.error(`[TimeBasedPermissionController] Get time-based permissions error: ${error.message}`)
        
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
        const message = error.message || 'Failed to get time-based permissions'
        
        res.status(statusCode).json({ error: message })
    }
})

// Get time-based permission by ID
router.get('/time-based/:id', async (req, res) => {
    try {
        const { id } = req.params
        
        const permission = await timeBasedPermissionService.getTimeBasedPermissionById(id)
        res.status(StatusCodes.OK).json(permission)
    } catch (error: any) {
        logger.error(`[TimeBasedPermissionController] Get time-based permission error: ${error.message}`)
        
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
        const message = error.message || 'Failed to get time-based permission'
        
        res.status(statusCode).json({ error: message })
    }
})

// Create time-based permission
router.post('/time-based', async (req, res) => {
    try {
        const permission = await timeBasedPermissionService.createTimeBasedPermission(req.body)
        res.status(StatusCodes.CREATED).json(permission)
    } catch (error: any) {
        logger.error(`[TimeBasedPermissionController] Create time-based permission error: ${error.message}`)
        
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
        const message = error.message || 'Failed to create time-based permission'
        
        res.status(statusCode).json({ error: message })
    }
})

// Update time-based permission
router.put('/time-based/:id', async (req, res) => {
    try {
        const { id } = req.params
        
        const permission = await timeBasedPermissionService.updateTimeBasedPermission(id, req.body)
        res.status(StatusCodes.OK).json(permission)
    } catch (error: any) {
        logger.error(`[TimeBasedPermissionController] Update time-based permission error: ${error.message}`)
        
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
        const message = error.message || 'Failed to update time-based permission'
        
        res.status(statusCode).json({ error: message })
    }
})

// Delete time-based permission
router.delete('/time-based/:id', async (req, res) => {
    try {
        const { id } = req.params
        
        await timeBasedPermissionService.deleteTimeBasedPermission(id)
        res.status(StatusCodes.NO_CONTENT).send()
    } catch (error: any) {
        logger.error(`[TimeBasedPermissionController] Delete time-based permission error: ${error.message}`)
        
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
        const message = error.message || 'Failed to delete time-based permission'
        
        res.status(statusCode).json({ error: message })
    }
})

// ==============================|| FINE-GRAINED PERMISSION ROUTES ||============================== //

// Check if a user has permission for a specific resource and action
router.get('/check', async (req, res) => {
    try {
        const { userId, resourceType, resourceId, action } = req.query as {
            userId: string
            resourceType: string
            resourceId: string
            action: string
        }
        
        if (!userId || !resourceType || !resourceId || !action) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'User ID, resource type, resource ID, and action are required'
            )
        }
        
        const hasPermission = await fineGrainedPermissionService.hasPermission(
            userId,
            resourceType,
            resourceId,
            action,
            req.query // Pass all query params as context
        )
        
        res.status(StatusCodes.OK).json({ hasPermission })
    } catch (error: any) {
        logger.error(`[FineGrainedPermissionController] Check permission error: ${error.message}`)
        
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
        const message = error.message || 'Failed to check permission'
        
        res.status(statusCode).json({ error: message })
    }
})

// Batch check permissions for multiple actions on a resource
router.post('/check-batch', async (req, res) => {
    try {
        const { userId, resourceType, resourceId, actions } = req.body
        
        if (!userId || !resourceType || !resourceId || !actions || !Array.isArray(actions)) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'User ID, resource type, resource ID, and actions array are required'
            )
        }
        
        const permissions = await fineGrainedPermissionService.batchCheckPermissions(
            userId,
            resourceType,
            resourceId,
            actions,
            req.body.context || {}
        )
        
        res.status(StatusCodes.OK).json(permissions)
    } catch (error: any) {
        logger.error(`[FineGrainedPermissionController] Batch check permissions error: ${error.message}`)
        
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
        const message = error.message || 'Failed to batch check permissions'
        
        res.status(statusCode).json({ error: message })
    }
})

// Get all permissions for a user on a specific resource
router.get('/user-resource-permissions', async (req, res) => {
    try {
        const { userId, resourceType, resourceId } = req.query as {
            userId: string
            resourceType: string
            resourceId: string
        }
        
        if (!userId || !resourceType || !resourceId) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'User ID, resource type, and resource ID are required'
            )
        }
        
        const permissions = await fineGrainedPermissionService.getUserPermissionsForResource(
            userId,
            resourceType,
            resourceId,
            req.query // Pass all query params as context
        )
        
        res.status(StatusCodes.OK).json(permissions)
    } catch (error: any) {
        logger.error(`[FineGrainedPermissionController] Get user resource permissions error: ${error.message}`)
        
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
        const message = error.message || 'Failed to get user resource permissions'
        
        res.status(statusCode).json({ error: message })
    }
})

// Get all resources of a type that a user has a specific permission for
router.get('/resources-with-permission', async (req, res) => {
    try {
        const { userId, resourceType, action } = req.query as {
            userId: string
            resourceType: string
            action: string
        }
        
        if (!userId || !resourceType || !action) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'User ID, resource type, and action are required'
            )
        }
        
        const resources = await fineGrainedPermissionService.getResourcesWithPermission(
            userId,
            resourceType,
            action,
            req.query // Pass all query params as context
        )
        
        res.status(StatusCodes.OK).json(resources)
    } catch (error: any) {
        logger.error(`[FineGrainedPermissionController] Get resources with permission error: ${error.message}`)
        
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
        const message = error.message || 'Failed to get resources with permission'
        
        res.status(statusCode).json({ error: message })
    }
})

export default router