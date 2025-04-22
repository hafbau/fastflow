import express, { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { validate } from 'uuid'
import { getRunningExpressApp } from '../../../utils/getRunningExpressApp'
import { InternalFlowiseError } from '../../../errors/internalFlowiseError'
import { getErrorMessage } from '../../../errors/utils'
import { UIComponent } from '../../../database/entities/UIComponent'

export const uiComponentsRouter = express.Router()

// Get all UI Components
uiComponentsRouter.get('/', async (_req: Request, res: Response) => {
    try {
        const appServer = getRunningExpressApp()
        const uiComponents = await appServer.AppDataSource.getRepository(UIComponent).find({
            order: { createdDate: 'DESC' }
        })
        return res.json(uiComponents)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Get UI Components by Screen ID
uiComponentsRouter.get('/screen/:screenId', async (req: Request, res: Response) => {
    try {
        const { screenId } = req.params
        
        if (!validate(screenId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid Screen ID format' })
        }
        
        const appServer = getRunningExpressApp()
        const uiComponents = await appServer.AppDataSource.getRepository(UIComponent).find({
            where: { screenId },
            order: { createdDate: 'ASC' }
        })
        
        return res.json(uiComponents)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Get a specific UI Component by ID
uiComponentsRouter.get('/:componentId', async (req: Request, res: Response) => {
    try {
        const { componentId } = req.params
        
        if (!validate(componentId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid UI Component ID format' })
        }
        
        const appServer = getRunningExpressApp()
        const uiComponent = await appServer.AppDataSource.getRepository(UIComponent).findOne({
            where: { id: componentId }
        })
        
        if (!uiComponent) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `UIComponent ${componentId} not found` })
        }
        
        return res.json(uiComponent)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Create a new UI Component
uiComponentsRouter.post('/', async (req: Request, res: Response) => {
    try {
        const componentData = req.body
        
        // Validate required fields
        if (!componentData.name || !componentData.type || !componentData.screenId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Missing required fields: name, type, screenId'
            })
        }
        
        // Validate screenId format
        if (!validate(componentData.screenId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid Screen ID format' })
        }
        
        // Verify the Screen exists
        const appServer = getRunningExpressApp()
        const screen = await appServer.AppDataSource.getRepository('Screen').findOne({
            where: { id: componentData.screenId }
        })
        
        if (!screen) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: `Screen ${componentData.screenId} not found` 
            })
        }
        
        // Create the component
        const uiComponentRepository = appServer.AppDataSource.getRepository(UIComponent)
        const uiComponent = uiComponentRepository.create(componentData)
        const savedComponent = await uiComponentRepository.save(uiComponent)
        
        return res.status(StatusCodes.CREATED).json(savedComponent)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Update an existing UI Component
uiComponentsRouter.patch('/:componentId', async (req: Request, res: Response) => {
    try {
        const { componentId } = req.params
        const componentData = req.body
        
        if (!validate(componentId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid UI Component ID format' })
        }
        
        // If screenId is provided, validate its format
        if (componentData.screenId && !validate(componentData.screenId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid Screen ID format' })
        }
        
        // Verify the component exists
        const appServer = getRunningExpressApp()
        const uiComponentRepository = appServer.AppDataSource.getRepository(UIComponent)
        const existingComponent = await uiComponentRepository.findOne({
            where: { id: componentId }
        })
        
        if (!existingComponent) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                error: `UIComponent ${componentId} not found` 
            })
        }
        
        // If screenId is changing, verify the new Screen exists
        if (componentData.screenId && componentData.screenId !== existingComponent.screenId) {
            const screen = await appServer.AppDataSource.getRepository('Screen').findOne({
                where: { id: componentData.screenId }
            })
            
            if (!screen) {
                return res.status(StatusCodes.BAD_REQUEST).json({ 
                    error: `Screen ${componentData.screenId} not found` 
                })
            }
        }
        
        // Update and save the component
        Object.assign(existingComponent, componentData)
        const updatedComponent = await uiComponentRepository.save(existingComponent)
        
        return res.json(updatedComponent)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Delete a UI Component
uiComponentsRouter.delete('/:componentId', async (req: Request, res: Response) => {
    try {
        const { componentId } = req.params
        
        if (!validate(componentId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid UI Component ID format' })
        }
        
        // Verify the component exists
        const appServer = getRunningExpressApp()
        const uiComponentRepository = appServer.AppDataSource.getRepository(UIComponent)
        const component = await uiComponentRepository.findOne({
            where: { id: componentId }
        })
        
        if (!component) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                error: `UIComponent ${componentId} not found` 
            })
        }
        
        // Delete the component
        await uiComponentRepository.remove(component)
        
        return res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Bulk create UI Components for a screen
uiComponentsRouter.post('/screen/:screenId/bulk', async (req: Request, res: Response) => {
    try {
        const { screenId } = req.params
        const { components } = req.body
        
        if (!validate(screenId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid Screen ID format' })
        }
        
        if (!Array.isArray(components) || components.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Request must include an array of components' 
            })
        }
        
        // Verify the Screen exists
        const appServer = getRunningExpressApp()
        const screen = await appServer.AppDataSource.getRepository('Screen').findOne({
            where: { id: screenId }
        })
        
        if (!screen) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: `Screen ${screenId} not found` 
            })
        }
        
        // Create components in a transaction
        const uiComponentRepository = appServer.AppDataSource.getRepository(UIComponent)
        const createdComponents: any[] = []
        
        await appServer.AppDataSource.transaction(async transactionalEntityManager => {
            for (const componentData of components) {
                // Set screenId for each component
                componentData.screenId = screenId
                
                // Validate required fields
                if (!componentData.name || !componentData.type) {
                    throw new Error('Each component must include name and type')
                }
                
                const component = uiComponentRepository.create(componentData)
                const savedComponent = await transactionalEntityManager.save(component)
                createdComponents.push(savedComponent)
            }
        })
        
        return res.status(StatusCodes.CREATED).json(createdComponents)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}) 