import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import attributeService from '../services/roles-permissions/AttributeService'
import logger from '../utils/logger'
import { InternalFastflowError } from '../errors/InternalFastflowError'

/**
 * Controller for managing attributes
 */
export class AttributeController {
    /**
     * Get resource attributes
     */
    async getResourceAttributes(req: Request, res: Response): Promise<void> {
        try {
            const { resourceType, resourceId } = req.params
            
            if (!resourceType || !resourceId) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Resource type and ID are required'
                )
            }
            
            const attributes = await attributeService.getResourceAttributes(resourceType, resourceId)
            res.status(StatusCodes.OK).json(attributes)
        } catch (error: any) {
            logger.error(`[AttributeController] Get resource attributes error: ${error.message}`)
            
            const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
            const message = error.message || 'Failed to get resource attributes'
            
            res.status(statusCode).json({ error: message })
        }
    }

    /**
     * Get resource attribute
     */
    async getResourceAttribute(req: Request, res: Response): Promise<void> {
        try {
            const { resourceType, resourceId, key } = req.params
            
            if (!resourceType || !resourceId || !key) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Resource type, ID, and key are required'
                )
            }
            
            const value = await attributeService.getResourceAttribute(resourceType, resourceId, key)
            
            if (value === undefined) {
                res.status(StatusCodes.NOT_FOUND).json({ error: 'Attribute not found' })
                return
            }
            
            res.status(StatusCodes.OK).json({ value })
        } catch (error: any) {
            logger.error(`[AttributeController] Get resource attribute error: ${error.message}`)
            
            const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
            const message = error.message || 'Failed to get resource attribute'
            
            res.status(statusCode).json({ error: message })
        }
    }

    /**
     * Set resource attribute
     */
    async setResourceAttribute(req: Request, res: Response): Promise<void> {
        try {
            const { resourceType, resourceId } = req.params
            const { key, value } = req.body
            
            if (!resourceType || !resourceId) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Resource type and ID are required'
                )
            }
            
            if (!key) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Attribute key is required'
                )
            }
            
            const result = await attributeService.setResourceAttribute(resourceType, resourceId, key, value)
            res.status(StatusCodes.OK).json(result)
        } catch (error: any) {
            logger.error(`[AttributeController] Set resource attribute error: ${error.message}`)
            
            const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
            const message = error.message || 'Failed to set resource attribute'
            
            res.status(statusCode).json({ error: message })
        }
    }

    /**
     * Delete resource attribute
     */
    async deleteResourceAttribute(req: Request, res: Response): Promise<void> {
        try {
            const { resourceType, resourceId, key } = req.params
            
            if (!resourceType || !resourceId || !key) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Resource type, ID, and key are required'
                )
            }
            
            await attributeService.deleteResourceAttribute(resourceType, resourceId, key)
            res.status(StatusCodes.NO_CONTENT).send()
        } catch (error: any) {
            logger.error(`[AttributeController] Delete resource attribute error: ${error.message}`)
            
            const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
            const message = error.message || 'Failed to delete resource attribute'
            
            res.status(statusCode).json({ error: message })
        }
    }

    /**
     * Get user attributes
     */
    async getUserAttributes(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params
            
            if (!userId) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'User ID is required'
                )
            }
            
            const attributes = await attributeService.getUserAttributes(userId)
            res.status(StatusCodes.OK).json(attributes)
        } catch (error: any) {
            logger.error(`[AttributeController] Get user attributes error: ${error.message}`)
            
            const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
            const message = error.message || 'Failed to get user attributes'
            
            res.status(statusCode).json({ error: message })
        }
    }

    /**
     * Get user attribute
     */
    async getUserAttribute(req: Request, res: Response): Promise<void> {
        try {
            const { userId, key } = req.params
            
            if (!userId || !key) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'User ID and key are required'
                )
            }
            
            const value = await attributeService.getUserAttribute(userId, key)
            
            if (value === undefined) {
                res.status(StatusCodes.NOT_FOUND).json({ error: 'Attribute not found' })
                return
            }
            
            res.status(StatusCodes.OK).json({ value })
        } catch (error: any) {
            logger.error(`[AttributeController] Get user attribute error: ${error.message}`)
            
            const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
            const message = error.message || 'Failed to get user attribute'
            
            res.status(statusCode).json({ error: message })
        }
    }

    /**
     * Set user attribute
     */
    async setUserAttribute(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params
            const { key, value } = req.body
            
            if (!userId) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'User ID is required'
                )
            }
            
            if (!key) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Attribute key is required'
                )
            }
            
            const result = await attributeService.setUserAttribute(userId, key, value)
            res.status(StatusCodes.OK).json(result)
        } catch (error: any) {
            logger.error(`[AttributeController] Set user attribute error: ${error.message}`)
            
            const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
            const message = error.message || 'Failed to set user attribute'
            
            res.status(statusCode).json({ error: message })
        }
    }

    /**
     * Delete user attribute
     */
    async deleteUserAttribute(req: Request, res: Response): Promise<void> {
        try {
            const { userId, key } = req.params
            
            if (!userId || !key) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'User ID and key are required'
                )
            }
            
            await attributeService.deleteUserAttribute(userId, key)
            res.status(StatusCodes.NO_CONTENT).send()
        } catch (error: any) {
            logger.error(`[AttributeController] Delete user attribute error: ${error.message}`)
            
            const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
            const message = error.message || 'Failed to delete user attribute'
            
            res.status(statusCode).json({ error: message })
        }
    }

    /**
     * Get environment attributes
     */
    async getEnvironmentAttributes(req: Request, res: Response): Promise<void> {
        try {
            const { organizationId, workspaceId } = req.query as { organizationId?: string; workspaceId?: string }
            
            const attributes = await attributeService.getEnvironmentAttributes(organizationId, workspaceId)
            res.status(StatusCodes.OK).json(attributes)
        } catch (error: any) {
            logger.error(`[AttributeController] Get environment attributes error: ${error.message}`)
            
            const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
            const message = error.message || 'Failed to get environment attributes'
            
            res.status(statusCode).json({ error: message })
        }
    }

    /**
     * Get environment attribute
     */
    async getEnvironmentAttribute(req: Request, res: Response): Promise<void> {
        try {
            const { key } = req.params
            const { organizationId, workspaceId } = req.query as { organizationId?: string; workspaceId?: string }
            
            if (!key) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Attribute key is required'
                )
            }
            
            const value = await attributeService.getEnvironmentAttribute(key, organizationId, workspaceId)
            
            if (value === undefined) {
                res.status(StatusCodes.NOT_FOUND).json({ error: 'Attribute not found' })
                return
            }
            
            res.status(StatusCodes.OK).json({ value })
        } catch (error: any) {
            logger.error(`[AttributeController] Get environment attribute error: ${error.message}`)
            
            const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
            const message = error.message || 'Failed to get environment attribute'
            
            res.status(statusCode).json({ error: message })
        }
    }

    /**
     * Set environment attribute
     */
    async setEnvironmentAttribute(req: Request, res: Response): Promise<void> {
        try {
            const { key, value, organizationId, workspaceId } = req.body
            
            if (!key) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Attribute key is required'
                )
            }
            
            const result = await attributeService.setEnvironmentAttribute(key, value, organizationId, workspaceId)
            res.status(StatusCodes.OK).json(result)
        } catch (error: any) {
            logger.error(`[AttributeController] Set environment attribute error: ${error.message}`)
            
            const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
            const message = error.message || 'Failed to set environment attribute'
            
            res.status(statusCode).json({ error: message })
        }
    }

    /**
     * Delete environment attribute
     */
    async deleteEnvironmentAttribute(req: Request, res: Response): Promise<void> {
        try {
            const { key } = req.params
            const { organizationId, workspaceId } = req.query as { organizationId?: string; workspaceId?: string }
            
            if (!key) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Attribute key is required'
                )
            }
            
            await attributeService.deleteEnvironmentAttribute(key, organizationId, workspaceId)
            res.status(StatusCodes.NO_CONTENT).send()
        } catch (error: any) {
            logger.error(`[AttributeController] Delete environment attribute error: ${error.message}`)
            
            const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
            const message = error.message || 'Failed to delete environment attribute'
            
            res.status(statusCode).json({ error: message })
        }
    }
}

export const attributeController = new AttributeController()
export default attributeController