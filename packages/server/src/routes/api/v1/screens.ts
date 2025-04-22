import express, { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { validate } from 'uuid'
import screenService from '../../../services/screens'
import { InternalFlowiseError } from '../../../errors/internalFlowiseError'
import { getErrorMessage } from '../../../errors/utils'

export const screensRouter = express.Router()

// Get all screens for a specific UI Flow
screensRouter.get('/ui-flow/:uiFlowId', async (req: Request, res: Response) => {
    try {
        const { uiFlowId } = req.params
        
        if (!validate(uiFlowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid UI Flow ID format' })
        }
        
        const screens = await screenService.getScreensByUIFlowId(uiFlowId)
        return res.json(screens)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Get a specific screen by ID
screensRouter.get('/:screenId', async (req: Request, res: Response) => {
    try {
        const { screenId } = req.params
        
        if (!validate(screenId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid Screen ID format' })
        }
        
        const screen = await screenService.getScreenById(screenId)
        return res.json(screen)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Create a new screen
screensRouter.post('/', async (req: Request, res: Response) => {
    try {
        const screenData = req.body
        
        // Validate required fields
        if (!screenData.path || !screenData.title || !screenData.uiFlowId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Missing required fields: path, title, uiFlowId'
            })
        }
        
        // Validate uiFlowId format
        if (!validate(screenData.uiFlowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid UI Flow ID format' })
        }
        
        const screen = await screenService.createScreen(screenData)
        return res.status(StatusCodes.CREATED).json(screen)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Update an existing screen
screensRouter.patch('/:screenId', async (req: Request, res: Response) => {
    try {
        const { screenId } = req.params
        const screenData = req.body
        
        if (!validate(screenId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid Screen ID format' })
        }
        
        const screen = await screenService.updateScreen(screenId, screenData)
        return res.json(screen)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Delete a screen
screensRouter.delete('/:screenId', async (req: Request, res: Response) => {
    try {
        const { screenId } = req.params
        
        if (!validate(screenId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid Screen ID format' })
        }
        
        await screenService.deleteScreen(screenId)
        return res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}) 