import { cloneDeep } from 'lodash'
import { StatusCodes } from 'http-status-codes'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { IUIComponent, IUINode } from '../../Interface'
import { UIComponent } from '../../database/entities/UIComponent'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'
import logger from '../../utils/logger'

/**
 * Get all UI Component Nodes
 */
const getAllUINodes = async () => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = []
        for (const nodeName in appServer.nodesPool.componentUINodes) {
            const clonedNode = cloneDeep(appServer.nodesPool.componentUINodes[nodeName])
            dbResponse.push(clonedNode)
        }
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: uiComponentsService.getAllUINodes - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get all UI Component Nodes for a specific category
 */
const getAllUINodesForCategory = async (category: string) => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = []
        for (const nodeName in appServer.nodesPool.componentUINodes) {
            const componentNode = appServer.nodesPool.componentUINodes[nodeName]
            if (componentNode.category === category) {
                const clonedNode = cloneDeep(componentNode)
                dbResponse.push(clonedNode)
            }
        }
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: uiComponentsService.getAllUINodesForCategory - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get specific UI Component Node via name
 */
const getUINodeByName = async (nodeName: string) => {
    try {
        const appServer = getRunningExpressApp()
        if (Object.prototype.hasOwnProperty.call(appServer.nodesPool.componentUINodes, nodeName)) {
            const dbResponse = appServer.nodesPool.componentUINodes[nodeName]
            return dbResponse
        } else {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `UI Node ${nodeName} not found`)
        }
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: uiComponentsService.getUINodeByName - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Register UI Component from database
 */
const registerUIComponent = async (component: IUIComponent): Promise<IUINode | undefined> => {
    try {
        const appServer = getRunningExpressApp()
        // Check if component is already registered
        if (Object.prototype.hasOwnProperty.call(appServer.nodesPool.componentUINodes, component.name)) {
            logger.debug(`UI Component ${component.name} already registered, updating`)
            appServer.nodesPool.unregisterUINode(component.name)
        }
        // Register the component
        return appServer.nodesPool.registerUINode(component.name, component)
    } catch (error) {
        logger.error(`Error registering UI component: ${getErrorMessage(error)}`)
        return undefined
    }
}

/**
 * Unregister UI Component
 */
const unregisterUIComponent = async (componentName: string): Promise<boolean> => {
    try {
        const appServer = getRunningExpressApp()
        return appServer.nodesPool.unregisterUINode(componentName)
    } catch (error) {
        logger.error(`Error unregistering UI component: ${getErrorMessage(error)}`)
        return false
    }
}

/**
 * Initialize all UI Components from database
 */
const initializeUIComponents = async () => {
    try {
        const appServer = getRunningExpressApp()
        let components = []
        
        try {
            // Try to fetch components from the database
            components = await appServer.AppDataSource.getRepository(UIComponent).find()
        } catch (dbError) {
            // If there's a database error (like missing column), log and return empty
            logger.error(`Database error fetching UI components: ${getErrorMessage(dbError)}`)
            return { success: 0, failed: 0, error: getErrorMessage(dbError) }
        }
        
        let successCount = 0
        let failCount = 0
        
        for (const component of components) {
            const registered = await registerUIComponent(component)
            if (registered) {
                successCount++
            } else {
                failCount++
            }
        }
        
        logger.info(`UI Components initialized: ${successCount} registered, ${failCount} failed`)
        return { success: successCount, failed: failCount }
    } catch (error) {
        logger.error(`Error initializing UI components: ${getErrorMessage(error)}`)
        return { success: 0, failed: 0, error: getErrorMessage(error) }
    }
}

export {
    getAllUINodes,
    getAllUINodesForCategory,
    getUINodeByName,
    registerUIComponent,
    unregisterUIComponent,
    initializeUIComponents
} 