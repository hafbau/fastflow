import express, { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { validate } from 'uuid'
import { getRunningExpressApp } from '../../../utils/getRunningExpressApp'
import { InternalFlowiseError } from '../../../errors/internalFlowiseError'
import { getErrorMessage } from '../../../errors/utils'
import logger from '../../../utils/logger'

export const templatesRouter = express.Router()

// Interface for template structure
interface UITemplate {
    id: string
    name: string
    description?: string
    version: string
    category?: string
    tags?: string[]
    createdDate: Date
    updatedDate: Date
    screenshot?: string
    data: {
        screens: Array<{
            path: string
            title: string
            description?: string
            components: Array<{
                type: string
                name: string
                properties: Record<string, any>
            }>
        }>
        flowData?: Record<string, any>
        metadata?: Record<string, any>
    }
}

// Get all templates
templatesRouter.get('/', async (_req: Request, res: Response) => {
    try {
        const appServer = getRunningExpressApp()
        const templates = await appServer.AppDataSource.getRepository('UITemplate').find({
            order: { updatedDate: 'DESC' }
        })
        
        return res.json(templates)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Get templates by category
templatesRouter.get('/category/:category', async (req: Request, res: Response) => {
    try {
        const { category } = req.params
        
        const appServer = getRunningExpressApp()
        const templates = await appServer.AppDataSource.getRepository('UITemplate').find({
            where: { category },
            order: { updatedDate: 'DESC' }
        })
        
        return res.json(templates)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Get a specific template by ID
templatesRouter.get('/:templateId', async (req: Request, res: Response) => {
    try {
        const { templateId } = req.params
        
        if (!validate(templateId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid Template ID format' })
        }
        
        const appServer = getRunningExpressApp()
        const template = await appServer.AppDataSource.getRepository('UITemplate').findOne({
            where: { id: templateId }
        })
        
        if (!template) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `Template ${templateId} not found` })
        }
        
        return res.json(template)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Create a new template from a UI Flow
templatesRouter.post('/create-from-uiflow/:uiFlowId', async (req: Request, res: Response) => {
    try {
        const { uiFlowId } = req.params
        const { name, description, category, tags } = req.body
        
        if (!validate(uiFlowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid UI Flow ID format' })
        }
        
        // Validate required fields
        if (!name) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Missing required field: name'
            })
        }
        
        const appServer = getRunningExpressApp()
        
        // Get the UI Flow with screens and components
        const uiFlowRepository = appServer.AppDataSource.getRepository('UIFlow')
        const uiFlow = await uiFlowRepository.findOne({
            where: { id: uiFlowId },
            relations: ['screens', 'screens.components']
        })
        
        if (!uiFlow) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `UIFlow ${uiFlowId} not found` })
        }
        
        // Create template data structure
        const templateData = {
            name,
            description,
            category,
            tags,
            version: '1.0.0',
            data: {
                screens: uiFlow.screens.map((screen: any) => ({
                    path: screen.path,
                    title: screen.title,
                    description: screen.description,
                    components: screen.components.map((component: any) => ({
                        type: component.type,
                        name: component.name,
                        properties: component.properties || {}
                    }))
                })),
                flowData: uiFlow.flowData,
                metadata: {}
            }
        }
        
        // Save the template
        const templateRepository = appServer.AppDataSource.getRepository('UITemplate')
        const template = templateRepository.create(templateData)
        const savedTemplate = await templateRepository.save(template)
        
        return res.status(StatusCodes.CREATED).json(savedTemplate)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Create a UI Flow from a template
templatesRouter.post('/:templateId/create-uiflow', async (req: Request, res: Response) => {
    try {
        const { templateId } = req.params
        const { name, description, chatflowId } = req.body
        
        if (!validate(templateId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid Template ID format' })
        }
        
        // Validate required fields
        if (!name || !chatflowId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Missing required fields: name, chatflowId'
            })
        }
        
        if (!validate(chatflowId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid ChatFlow ID format' })
        }
        
        const appServer = getRunningExpressApp()
        
        // Get the template
        const templateRepository = appServer.AppDataSource.getRepository('UITemplate')
        const template = await templateRepository.findOne({
            where: { id: templateId }
        })
        
        if (!template) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `Template ${templateId} not found` })
        }
        
        // Check if the ChatFlow exists
        const chatflowRepository = appServer.AppDataSource.getRepository('ChatFlow')
        const chatflow = await chatflowRepository.findOne({
            where: { id: chatflowId }
        })
        
        if (!chatflow) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: `ChatFlow ${chatflowId} not found` })
        }
        
        // Create the UI Flow
        const uiFlowRepository = appServer.AppDataSource.getRepository('UIFlow')
        const screenRepository = appServer.AppDataSource.getRepository('Screen')
        const componentRepository = appServer.AppDataSource.getRepository('UIComponent')
        
        // Use a transaction to ensure data integrity
        const result = await appServer.AppDataSource.transaction(async transactionalEntityManager => {
            // Create UI Flow
            const uiFlow = uiFlowRepository.create({
                name,
                description,
                chatflowId,
                flowData: template.data.flowData || {}
            })
            
            const savedUiFlow = await transactionalEntityManager.save(uiFlow)
            
            // Create screens and components
            const createdScreens = []
            
            for (const screenTemplate of template.data.screens) {
                const screen = screenRepository.create({
                    path: screenTemplate.path,
                    title: screenTemplate.title,
                    description: screenTemplate.description,
                    uiFlowId: savedUiFlow.id
                })
                
                const savedScreen = await transactionalEntityManager.save(screen)
                createdScreens.push(savedScreen)
                
                // Create components for this screen
                for (const componentTemplate of screenTemplate.components) {
                    const component = componentRepository.create({
                        name: componentTemplate.name,
                        type: componentTemplate.type,
                        properties: componentTemplate.properties,
                        screenId: savedScreen.id
                    })
                    
                    await transactionalEntityManager.save(component)
                }
            }
            
            return { uiFlow: savedUiFlow, screens: createdScreens }
        })
        
        return res.status(StatusCodes.CREATED).json(result)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Delete a template
templatesRouter.delete('/:templateId', async (req: Request, res: Response) => {
    try {
        const { templateId } = req.params
        
        if (!validate(templateId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid Template ID format' })
        }
        
        const appServer = getRunningExpressApp()
        const templateRepository = appServer.AppDataSource.getRepository('UITemplate')
        
        const template = await templateRepository.findOne({
            where: { id: templateId }
        })
        
        if (!template) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `Template ${templateId} not found` })
        }
        
        await templateRepository.remove(template)
        
        return res.status(StatusCodes.NO_CONTENT).send()
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Update a template
templatesRouter.patch('/:templateId', async (req: Request, res: Response) => {
    try {
        const { templateId } = req.params
        const templateData = req.body
        
        if (!validate(templateId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid Template ID format' })
        }
        
        const appServer = getRunningExpressApp()
        const templateRepository = appServer.AppDataSource.getRepository('UITemplate')
        
        const template = await templateRepository.findOne({
            where: { id: templateId }
        })
        
        if (!template) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `Template ${templateId} not found` })
        }
        
        // Update version if data is being changed
        if (templateData.data) {
            // Simple version increment - in a real implementation, semantic versioning would be better
            const versionParts = template.version.split('.')
            const patchVersion = parseInt(versionParts[2]) + 1
            templateData.version = `${versionParts[0]}.${versionParts[1]}.${patchVersion}`
        }
        
        // Update the template
        Object.assign(template, templateData)
        const updatedTemplate = await templateRepository.save(template)
        
        return res.json(updatedTemplate)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}) 