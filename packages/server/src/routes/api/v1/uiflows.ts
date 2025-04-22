import express, { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { validate } from 'uuid'
import uiFlowService from '../../../services/uiflows'
import { InternalFlowiseError } from '../../../errors/internalFlowiseError'
import { getErrorMessage } from '../../../errors/utils'
import { getRunningExpressApp } from '../../../utils/getRunningExpressApp'
import logger from '../../../utils/logger'
import { createPreviewEventService } from '../../../services/preview-events'

export const uiFlowsRouter = express.Router()

// Get all UI Flows
uiFlowsRouter.get('/', async (_req: Request, res: Response) => {
    try {
        const uiFlows = await uiFlowService.getAllUIFlows()
        return res.json(uiFlows)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Get UI Flows by ChatFlow ID
uiFlowsRouter.get('/chatflow/:chatflowId', async (req: Request, res: Response) => {
    try {
        const { chatflowId } = req.params
        
        if (!validate(chatflowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid ChatFlow ID format' })
        }
        
        const uiFlows = await uiFlowService.getUIFlowsByChatFlowId(chatflowId)
        return res.json(uiFlows)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Get a specific UI Flow by ID
uiFlowsRouter.get('/:uiFlowId', async (req: Request, res: Response) => {
    try {
        const { uiFlowId } = req.params
        
        if (!validate(uiFlowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid UI Flow ID format' })
        }
        
        const uiFlow = await uiFlowService.getUIFlowById(uiFlowId)
        return res.json(uiFlow)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Create a new UI Flow
uiFlowsRouter.post('/', async (req: Request, res: Response) => {
    try {
        const uiFlowData = req.body
        
        // Validate required fields
        if (!uiFlowData.name || !uiFlowData.flowData || !uiFlowData.chatflowId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Missing required fields: name, flowData, chatflowId'
            })
        }
        
        // Validate chatflowId format
        if (!validate(uiFlowData.chatflowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid ChatFlow ID format' })
        }
        
        const uiFlow = await uiFlowService.createUIFlow(uiFlowData)
        return res.status(StatusCodes.CREATED).json(uiFlow)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Update an existing UI Flow
uiFlowsRouter.patch('/:uiFlowId', async (req: Request, res: Response) => {
    try {
        const { uiFlowId } = req.params
        const uiFlowData = req.body
        
        if (!validate(uiFlowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid UI Flow ID format' })
        }
        
        // If chatflowId is provided, validate its format
        if (uiFlowData.chatflowId && !validate(uiFlowData.chatflowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid ChatFlow ID format' })
        }
        
        const uiFlow = await uiFlowService.updateUIFlow(uiFlowId, uiFlowData)
        return res.json(uiFlow)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Delete a UI Flow
uiFlowsRouter.delete('/:uiFlowId', async (req: Request, res: Response) => {
    try {
        const { uiFlowId } = req.params
        
        if (!validate(uiFlowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid UI Flow ID format' })
        }
        
        await uiFlowService.deleteUIFlow(uiFlowId)
        return res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Deploy a UI Flow
uiFlowsRouter.post('/:uiFlowId/deploy', async (req: Request, res: Response) => {
    try {
        const { uiFlowId } = req.params
        
        if (!validate(uiFlowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid UI Flow ID format' })
        }
        
        const uiFlow = await uiFlowService.deployUIFlow(uiFlowId)
        return res.json(uiFlow)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Undeploy a UI Flow
uiFlowsRouter.post('/:uiFlowId/undeploy', async (req: Request, res: Response) => {
    try {
        const { uiFlowId } = req.params
        
        if (!validate(uiFlowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid UI Flow ID format' })
        }
        
        const uiFlow = await uiFlowService.undeployUIFlow(uiFlowId)
        return res.json(uiFlow)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Preview a UI Flow with SSE (Server-Sent Events)
uiFlowsRouter.get('/:uiFlowId/preview', async (req: Request, res: Response) => {
    try {
        const { uiFlowId } = req.params
        
        if (!validate(uiFlowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid UI Flow ID format' })
        }
        
        // Set up SSE connection
        const appServer = getRunningExpressApp()
        
        // Check if the UI Flow exists
        const uiFlow = await uiFlowService.getUIFlowById(uiFlowId)
        if (!uiFlow) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `UIFlow ${uiFlowId} not found` })
        }
        
        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.setHeader('X-Accel-Buffering', 'no') // Disable Nginx buffering
        
        // Register client for SSE
        const previewId = uiFlowId
        appServer.sseStreamer.addClient(previewId, res)
        
        // Create preview event service
        const previewEventService = createPreviewEventService(appServer.sseStreamer)
        
        // Initial data event
        await previewEventService.sendPreviewReady(previewId)
        
        // Send initial UI Flow data
        await appServer.sseStreamer.streamCustomEvent(previewId, 'preview-init', {
            uiFlow,
            timestamp: Date.now(),
            status: 'initialized'
        })
        
        // Handle client disconnect
        req.on('close', () => {
            appServer.sseStreamer.removeClient(previewId)
            logger.debug(`Preview client disconnected for UI Flow ${uiFlowId}`)
        })
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Preview endpoint for deployed UI Flow (public access)
uiFlowsRouter.get('/:uiFlowId/deployed-preview', async (req: Request, res: Response) => {
    try {
        const { uiFlowId } = req.params
        
        if (!validate(uiFlowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid UI Flow ID format' })
        }
        
        // Set up SSE connection
        const appServer = getRunningExpressApp()
        
        // Check if the UI Flow exists and is deployed
        const uiFlow = await uiFlowService.getUIFlowById(uiFlowId)
        if (!uiFlow) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `UIFlow ${uiFlowId} not found` })
        }
        
        // Verify the UI Flow is deployed
        if (!uiFlow.deployed) {
            return res.status(StatusCodes.FORBIDDEN).json({ error: `UIFlow ${uiFlowId} is not deployed` })
        }
        
        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.setHeader('X-Accel-Buffering', 'no') // Disable Nginx buffering
        
        // Register client for SSE
        const previewId = `deployed-${uiFlowId}`
        appServer.sseStreamer.addExternalClient(previewId, res)
        
        // Create preview event service
        const previewEventService = createPreviewEventService(appServer.sseStreamer)
        
        // Initial data event
        await previewEventService.sendPreviewReady(previewId)
        
        // Send initial UI Flow data (filter out sensitive information)
        const filteredUIFlow = {
            id: uiFlow.id,
            name: uiFlow.name,
            description: uiFlow.description,
            screens: uiFlow.screens.map(screen => ({
                id: screen.id,
                path: screen.path,
                title: screen.title,
                description: screen.description,
                queryParameters: screen.queryParameters,
                pathParameters: screen.pathParameters
            }))
        }
        
        await appServer.sseStreamer.streamCustomEvent(previewId, 'preview-init', {
            uiFlow: filteredUIFlow,
            timestamp: Date.now(),
            status: 'initialized'
        })
        
        // Handle client disconnect
        req.on('close', () => {
            appServer.sseStreamer.removeClient(previewId)
            logger.debug(`Deployed preview client disconnected for UI Flow ${uiFlowId}`)
        })
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Receive user interaction events from preview
uiFlowsRouter.post('/:uiFlowId/preview/interaction', async (req: Request, res: Response) => {
    try {
        const { uiFlowId } = req.params
        const { interactionId, componentId, eventType, data } = req.body
        
        if (!validate(uiFlowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid UI Flow ID format' })
        }
        
        // Validate required fields
        if (!interactionId || !componentId || !eventType) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Missing required fields: interactionId, componentId, eventType'
            })
        }
        
        // Check if the UI Flow exists
        const appServer = getRunningExpressApp()
        const uiFlow = await uiFlowService.getUIFlowById(uiFlowId)
        if (!uiFlow) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `UIFlow ${uiFlowId} not found` })
        }
        
        // Process the interaction (in a real implementation, this would trigger flows, etc.)
        // For now, just echo back the interaction
        
        // Create preview event service
        const previewEventService = createPreviewEventService(appServer.sseStreamer)
        
        // Send interaction result
        await previewEventService.sendUserInteractionEvent(
            uiFlowId,
            interactionId,
            componentId,
            eventType,
            { 
                status: 'success',
                message: 'Interaction processed',
                data 
            }
        )
        
        return res.status(StatusCodes.OK).json({ 
            status: 'success', 
            message: 'Interaction received' 
        })
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}) 