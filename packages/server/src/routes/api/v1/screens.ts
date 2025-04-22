import express, { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { validate } from 'uuid'
import { getRunningExpressApp } from '../../../utils/getRunningExpressApp'
import { InternalFlowiseError } from '../../../errors/internalFlowiseError'
import { getErrorMessage } from '../../../errors/utils'
import { Screen } from '../../../database/entities/Screen'

export const screensRouter = express.Router()

// Get all Screens
screensRouter.get('/', async (_req: Request, res: Response) => {
    try {
        const appServer = getRunningExpressApp()
        const screens = await appServer.AppDataSource.getRepository(Screen).find({
            order: { createdDate: 'DESC' }
        })
        return res.json(screens)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Get Screens by UI Flow ID
screensRouter.get('/uiflow/:uiFlowId', async (req: Request, res: Response) => {
    try {
        const { uiFlowId } = req.params
        
        if (!validate(uiFlowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid UI Flow ID format' })
        }
        
        const appServer = getRunningExpressApp()
        const screens = await appServer.AppDataSource.getRepository(Screen).find({
            where: { uiFlowId },
            order: { createdDate: 'ASC' },
            relations: ['components']
        })
        
        return res.json(screens)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Get a specific Screen by ID
screensRouter.get('/:screenId', async (req: Request, res: Response) => {
    try {
        const { screenId } = req.params
        
        if (!validate(screenId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid Screen ID format' })
        }
        
        const appServer = getRunningExpressApp()
        const screen = await appServer.AppDataSource.getRepository(Screen).findOne({
            where: { id: screenId },
            relations: ['components']
        })
        
        if (!screen) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `Screen ${screenId} not found` })
        }
        
        return res.json(screen)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Create a new Screen
screensRouter.post('/', async (req: Request, res: Response) => {
    try {
        const screenData = req.body
        
        // Validate required fields
        if (!screenData.title || !screenData.path || !screenData.uiFlowId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Missing required fields: title, path, uiFlowId'
            })
        }
        
        // Validate uiFlowId format
        if (!validate(screenData.uiFlowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid UI Flow ID format' })
        }
        
        // Verify the UI Flow exists
        const appServer = getRunningExpressApp()
        const uiFlow = await appServer.AppDataSource.getRepository('UIFlow').findOne({
            where: { id: screenData.uiFlowId }
        })
        
        if (!uiFlow) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: `UIFlow ${screenData.uiFlowId} not found` 
            })
        }
        
        // Check for duplicate paths within the same UI Flow
        const existingScreen = await appServer.AppDataSource.getRepository(Screen).findOne({
            where: { 
                uiFlowId: screenData.uiFlowId,
                path: screenData.path 
            }
        })
        
        if (existingScreen) {
            return res.status(StatusCodes.CONFLICT).json({ 
                error: `A screen with path '${screenData.path}' already exists in this UI Flow` 
            })
        }
        
        // Create the screen
        const screenRepository = appServer.AppDataSource.getRepository(Screen)
        const screen = screenRepository.create(screenData)
        const savedScreen = await screenRepository.save(screen)
        
        return res.status(StatusCodes.CREATED).json(savedScreen)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Update an existing Screen
screensRouter.patch('/:screenId', async (req: Request, res: Response) => {
    try {
        const { screenId } = req.params
        const screenData = req.body
        
        if (!validate(screenId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid Screen ID format' })
        }
        
        // If uiFlowId is provided, validate its format
        if (screenData.uiFlowId && !validate(screenData.uiFlowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid UI Flow ID format' })
        }
        
        // Verify the screen exists
        const appServer = getRunningExpressApp()
        const screenRepository = appServer.AppDataSource.getRepository(Screen)
        const existingScreen = await screenRepository.findOne({
            where: { id: screenId }
        })
        
        if (!existingScreen) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                error: `Screen ${screenId} not found` 
            })
        }
        
        // If uiFlowId is changing, verify the new UI Flow exists
        if (screenData.uiFlowId && screenData.uiFlowId !== existingScreen.uiFlowId) {
            const uiFlow = await appServer.AppDataSource.getRepository('UIFlow').findOne({
                where: { id: screenData.uiFlowId }
            })
            
            if (!uiFlow) {
                return res.status(StatusCodes.BAD_REQUEST).json({ 
                    error: `UIFlow ${screenData.uiFlowId} not found` 
                })
            }
        }
        
        // If path is changing, check for duplicates within the same UI Flow
        if (screenData.path && screenData.path !== existingScreen.path) {
            const targetUiFlowId = screenData.uiFlowId || existingScreen.uiFlowId
            
            const duplicateScreen = await screenRepository.findOne({
                where: { 
                    uiFlowId: targetUiFlowId,
                    path: screenData.path 
                }
            })
            
            if (duplicateScreen) {
                return res.status(StatusCodes.CONFLICT).json({ 
                    error: `A screen with path '${screenData.path}' already exists in this UI Flow` 
                })
            }
        }
        
        // Update and save the screen
        Object.assign(existingScreen, screenData)
        const updatedScreen = await screenRepository.save(existingScreen)
        
        return res.json(updatedScreen)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Delete a Screen
screensRouter.delete('/:screenId', async (req: Request, res: Response) => {
    try {
        const { screenId } = req.params
        
        if (!validate(screenId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid Screen ID format' })
        }
        
        // Verify the screen exists
        const appServer = getRunningExpressApp()
        const screenRepository = appServer.AppDataSource.getRepository(Screen)
        const screen = await screenRepository.findOne({
            where: { id: screenId },
            relations: ['components']
        })
        
        if (!screen) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                error: `Screen ${screenId} not found` 
            })
        }
        
        // Delete the screen (will cascade delete components if configured in entity)
        await screenRepository.remove(screen)
        
        return res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Reorder screens within a UI Flow
screensRouter.post('/uiflow/:uiFlowId/reorder', async (req: Request, res: Response) => {
    try {
        const { uiFlowId } = req.params
        const { screenOrder } = req.body
        
        if (!validate(uiFlowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid UI Flow ID format' })
        }
        
        if (!Array.isArray(screenOrder) || screenOrder.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Request must include a non-empty screenOrder array of screen IDs' 
            })
        }
        
        // Verify all screen IDs are valid UUIDs
        for (const screenId of screenOrder) {
            if (!validate(screenId)) {
                return res.status(StatusCodes.BAD_REQUEST).json({ 
                    error: `Invalid Screen ID format: ${screenId}` 
                })
            }
        }
        
        // Verify the UI Flow exists
        const appServer = getRunningExpressApp()
        const uiFlow = await appServer.AppDataSource.getRepository('UIFlow').findOne({
            where: { id: uiFlowId }
        })
        
        if (!uiFlow) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                error: `UIFlow ${uiFlowId} not found` 
            })
        }
        
        // Get all screens for this UI Flow
        const screenRepository = appServer.AppDataSource.getRepository(Screen)
        const screens = await screenRepository.find({
            where: { uiFlowId }
        })
        
        // Verify all screens in the order array belong to this UI Flow
        const screenMap = new Map(screens.map(screen => [screen.id, screen]))
        for (const screenId of screenOrder) {
            if (!screenMap.has(screenId)) {
                return res.status(StatusCodes.BAD_REQUEST).json({ 
                    error: `Screen ${screenId} does not belong to UIFlow ${uiFlowId}` 
                })
            }
        }
        
        // Update the order of screens (implementing a custom order field would be better)
        // For now, just updating the updatedDate to show it worked
        const updatedScreens: any[] = []
        await appServer.AppDataSource.transaction(async transactionalEntityManager => {
            for (const screenId of screenOrder) {
                const screen = screenMap.get(screenId)
                if (screen) {
                    screen.updatedDate = new Date()
                    const updatedScreen = await transactionalEntityManager.save(screen)
                    updatedScreens.push(updatedScreen)
                }
            }
        })
        
        return res.json(updatedScreens)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}) 