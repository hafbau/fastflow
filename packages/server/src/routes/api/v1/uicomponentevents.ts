import { Request, Response, Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import { UIComponentEventService } from '../../../services/uiflow/UIComponentEventService'
import { UIComponentQueueService } from '../../../services/uiflow/UIComponentQueueService'
import { UIEventType } from '../../../events/UIEventManager'
import { getDataSource } from '../../../DataSource'
import { UIFlow } from '../../../database/entities/UIFlow'
import { Screen } from '../../../database/entities/Screen'
import { UIComponent } from '../../../database/entities/UIComponent'
import { InternalFlowiseError } from '../../../errors/internalFlowiseError'
import { getErrorMessage } from '../../../errors/utils'
import logger from '../../../utils/logger'

export const uiComponentEventsRouter = Router()

// Extend Request type to include custom properties
declare global {
    namespace Express {
        interface Request {
            uiFlow?: UIFlow
            uiComponent?: UIComponent
        }
    }
}

// Extend UIComponent interface to include properties
interface UIComponentWithProperties extends UIComponent {
    properties?: Record<string, any>
}

// Middleware to validate UIFlow and Component existence
const validateUIComponentExistence = async (req: Request, res: Response, next: Function) => {
    try {
        const { uiFlowId, componentId } = req.params
        
        // Get UI flow and component from database
        const uiFlow = await getDataSource().getRepository(UIFlow).findOne({
            where: { id: uiFlowId },
            relations: ['screens', 'screens.components']
        })
        
        if (!uiFlow) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `UI Flow with ID ${uiFlowId} not found` })
        }
        
        // Find component across all screens
        let foundComponent: UIComponentWithProperties | undefined
        for (const screen of uiFlow.screens) {
            const component = screen.components.find((c: UIComponent) => c.id === componentId) as UIComponentWithProperties
            if (component) {
                foundComponent = component
                break
            }
        }
        
        if (!foundComponent) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `Component with ID ${componentId} not found in UI Flow ${uiFlowId}` })
        }
        
        // Add to request for use in next handlers
        req.uiFlow = uiFlow
        req.uiComponent = foundComponent
        
        next()
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * @route POST /api/v1/uicomponentevents/:uiFlowId/:componentId
 * @description Process UI component event
 * @access Private
 */
uiComponentEventsRouter.post(
    '/:uiFlowId/:componentId',
    validateUIComponentExistence,
    async (req: Request, res: Response) => {
        try {
            const { uiFlowId, componentId } = req.params
            const { eventType, payload } = req.body
            
            // Get UIComponent properties from database
            const componentData = {
                id: req.uiComponent?.id || '',
                name: req.uiComponent?.type || '',
                type: req.uiComponent?.type || '',
                label: req.uiComponent?.type || '',
                icon: 'ui-component',
                version: 1,
                properties: (req.uiComponent as UIComponentWithProperties)?.properties || {},
                baseClasses: ['UINode'],
                category: 'UI',
                inputs: req.body.inputs || {}
            }
            
            // Map string eventType to enum
            let mappedEventType: UIEventType
            switch (eventType) {
                case 'component-update':
                    mappedEventType = UIEventType.COMPONENT_UPDATE
                    break
                case 'component-interaction':
                    mappedEventType = UIEventType.COMPONENT_INTERACTION
                    break
                case 'flow-progress':
                    mappedEventType = UIEventType.FLOW_PROGRESS
                    break
                case 'flow-complete':
                    mappedEventType = UIEventType.FLOW_COMPLETE
                    break
                case 'flow-error':
                    mappedEventType = UIEventType.FLOW_ERROR
                    break
                case 'navigation':
                    mappedEventType = UIEventType.NAVIGATION
                    break
                default:
                    return res.status(StatusCodes.BAD_REQUEST).json({ error: `Invalid event type: ${eventType}` })
            }
            
            // Construct the event payload
            const eventPayload = {
                uiFlowId,
                componentId,
                ...payload,
                timestamp: Date.now()
            }
            
            // Process the event
            const eventService = UIComponentEventService.getInstance()
            await eventService.processComponentEvent(componentData, mappedEventType, eventPayload)
            
            // Return success response
            return res.status(StatusCodes.OK).json({
                success: true,
                message: `Event ${eventType} processed for component ${componentId}`
            })
        } catch (error) {
            logger.error('Error processing UI component event:', error)
            
            if (error instanceof InternalFlowiseError) {
                return res.status(error.statusCode).json({ error: error.message })
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
        }
    }
)

/**
 * @route POST /api/v1/uicomponentevents/batch/:uiFlowId
 * @description Process batch UI component updates
 * @access Private
 */
uiComponentEventsRouter.post(
    '/batch/:uiFlowId',
    async (req: Request, res: Response) => {
        try {
            const { uiFlowId } = req.params
            const { updates } = req.body
            
            // Validate updates structure
            if (!Array.isArray(updates) || updates.length === 0) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Updates array is empty or invalid' })
            }
            
            for (const update of updates) {
                if (!update.componentId || !update.properties) {
                    return res.status(StatusCodes.BAD_REQUEST).json({ 
                        error: 'Each update must include componentId and properties' 
                    })
                }
            }
            
            // Process batch updates
            const eventService = UIComponentEventService.getInstance()
            await eventService.processBatchUpdates(uiFlowId, updates)
            
            // Return success response
            return res.status(StatusCodes.OK).json({
                success: true,
                message: `Processed ${updates.length} component updates for UI Flow ${uiFlowId}`
            })
        } catch (error) {
            logger.error('Error processing batch UI component updates:', error)
            
            if (error instanceof InternalFlowiseError) {
                return res.status(error.statusCode).json({ error: error.message })
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
        }
    }
)

/**
 * @route POST /api/v1/uicomponentevents/queue/:uiFlowId/:componentId
 * @description Queue UI component event for async processing
 * @access Private
 */
uiComponentEventsRouter.post(
    '/queue/:uiFlowId/:componentId',
    validateUIComponentExistence,
    async (req: Request, res: Response) => {
        try {
            const { uiFlowId, componentId } = req.params
            const { eventType, payload, queueOptions } = req.body
            
            // Get UIComponent properties from database
            const componentData = {
                id: req.uiComponent?.id || '',
                name: req.uiComponent?.type || '',
                type: req.uiComponent?.type || '',
                label: req.uiComponent?.type || '',
                icon: 'ui-component',
                version: 1,
                inputs: {
                    ...((req.uiComponent as UIComponentWithProperties)?.properties || {}),
                    queueEnabled: true,
                    queueOptions
                },
                baseClasses: ['UINode'],
                category: 'UI'
            }
            
            // Map string eventType to enum
            let mappedEventType: UIEventType
            switch (eventType) {
                case 'component-update':
                    mappedEventType = UIEventType.COMPONENT_UPDATE
                    break
                case 'component-interaction':
                    mappedEventType = UIEventType.COMPONENT_INTERACTION
                    break
                case 'flow-progress':
                    mappedEventType = UIEventType.FLOW_PROGRESS
                    break
                case 'flow-complete':
                    mappedEventType = UIEventType.FLOW_COMPLETE
                    break
                case 'flow-error':
                    mappedEventType = UIEventType.FLOW_ERROR
                    break
                case 'navigation':
                    mappedEventType = UIEventType.NAVIGATION
                    break
                default:
                    return res.status(StatusCodes.BAD_REQUEST).json({ error: `Invalid event type: ${eventType}` })
            }
            
            // Construct the event payload
            const eventPayload = {
                uiFlowId,
                componentId,
                ...payload,
                timestamp: Date.now()
            }
            
            // Create event object
            const event = {
                type: mappedEventType,
                payload: eventPayload
            }
            
            // Get queue service and queue the event
            const queueService = UIComponentQueueService.getInstance()
            const jobId = await queueService.queueEvent(componentData, event)
            
            // Return success response with job ID
            return res.status(StatusCodes.OK).json({
                success: true,
                message: `Event ${eventType} queued for component ${componentId}`,
                jobId
            })
        } catch (error) {
            logger.error('Error queueing UI component event:', error)
            
            if (error instanceof InternalFlowiseError) {
                return res.status(error.statusCode).json({ error: error.message })
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
        }
    }
)

/**
 * @route GET /api/v1/uicomponentevents/queue/stats
 * @description Get statistics for the UI component event queue
 * @access Private
 */
uiComponentEventsRouter.get(
    '/queue/stats',
    async (_req: Request, res: Response) => {
        try {
            const queueService = UIComponentQueueService.getInstance()
            const stats = await queueService.getJobCounts()
            
            return res.status(StatusCodes.OK).json({
                success: true,
                stats
            })
        } catch (error) {
            logger.error('Error getting UI component queue stats:', error)
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
        }
    }
) 