import express, { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { UIComponent } from '../../../database/entities/UIComponent'
import { getRunningExpressApp } from '../../../utils/getRunningExpressApp'
import {
    getAllUINodes,
    getAllUINodesForCategory,
    getUINodeByName,
    registerUIComponent,
    unregisterUIComponent
} from '../../../services/uicomponents'
import { InternalFlowiseError } from '../../../errors/internalFlowiseError'
import { getErrorMessage } from '../../../errors/utils'

export const uiComponentsRouter = express.Router()

// Get all UI component nodes
uiComponentsRouter.get('/', async (_req: Request, res: Response) => {
    try {
        const nodes = await getAllUINodes()
        return res.json(nodes)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Get all UI component nodes for a specific category
uiComponentsRouter.get('/category/:category', async (req: Request, res: Response) => {
    try {
        const nodes = await getAllUINodesForCategory(req.params.category)
        return res.json(nodes)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Get a specific UI component node by name
uiComponentsRouter.get('/:name', async (req: Request, res: Response) => {
    try {
        const node = await getUINodeByName(req.params.name)
        return res.json(node)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Create a new UI component
uiComponentsRouter.post('/', async (req: Request, res: Response) => {
    try {
        const appServer = getRunningExpressApp()
        const componentData = req.body

        // Validate request
        if (!componentData.name || !componentData.type || !componentData.category || !componentData.schema || !componentData.template) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Missing required fields: name, type, category, schema, template'
            })
        }

        // Check if component already exists
        const existingComponent = await appServer.AppDataSource.getRepository(UIComponent).findOne({
            where: { name: componentData.name }
        })

        if (existingComponent) {
            return res.status(StatusCodes.CONFLICT).json({
                error: `Component with name ${componentData.name} already exists`
            })
        }

        // Create and save the component
        const component = new UIComponent()
        Object.assign(component, componentData)
        const savedComponent = await appServer.AppDataSource.getRepository(UIComponent).save(component)

        // Register the component with NodesPool
        const uiNode = await registerUIComponent(savedComponent)
        if (!uiNode) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: `Failed to register component ${componentData.name}`
            })
        }

        return res.status(StatusCodes.CREATED).json(savedComponent)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Update an existing UI component
uiComponentsRouter.put('/:id', async (req: Request, res: Response) => {
    try {
        const appServer = getRunningExpressApp()
        const { id } = req.params
        const componentData = req.body

        // Find the component
        const component = await appServer.AppDataSource.getRepository(UIComponent).findOne({
            where: { id }
        })

        if (!component) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: `Component with id ${id} not found`
            })
        }

        // Update the component
        Object.assign(component, componentData)
        const updatedComponent = await appServer.AppDataSource.getRepository(UIComponent).save(component)

        // Re-register the component with NodesPool
        const uiNode = await registerUIComponent(updatedComponent)
        if (!uiNode) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: `Failed to update component registration ${componentData.name}`
            })
        }

        return res.status(StatusCodes.OK).json(updatedComponent)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
})

// Delete a UI component
uiComponentsRouter.delete('/:id', async (req: Request, res: Response) => {
    try {
        const appServer = getRunningExpressApp()
        const { id } = req.params

        // Find the component
        const component = await appServer.AppDataSource.getRepository(UIComponent).findOne({
            where: { id }
        })

        if (!component) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: `Component with id ${id} not found`
            })
        }

        // Unregister the component from NodesPool
        await unregisterUIComponent(component.name)

        // Delete the component
        await appServer.AppDataSource.getRepository(UIComponent).remove(component)

        return res.status(StatusCodes.OK).json({ message: `Component ${component.name} deleted` })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}) 