import { StatusCodes } from 'http-status-codes'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { UIFlow } from '../../database/entities/UIFlow'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'
import logger from '../../utils/logger'

/**
 * Get all UI Flows
 */
const getAllUIFlows = async (): Promise<UIFlow[]> => {
    try {
        const appServer = getRunningExpressApp()
        const uiFlows = await appServer.AppDataSource.getRepository(UIFlow).find({
            order: { createdDate: 'DESC' }
        })
        return uiFlows
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: uiFlowService.getAllUIFlows - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get UI Flow by ID
 */
const getUIFlowById = async (id: string): Promise<UIFlow> => {
    try {
        const appServer = getRunningExpressApp()
        const uiFlow = await appServer.AppDataSource.getRepository(UIFlow).findOne({
            where: { id },
            relations: ['screens', 'screens.components']
        })
        
        if (!uiFlow) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `UIFlow ${id} not found`)
        }
        
        return uiFlow
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            throw error
        }
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: uiFlowService.getUIFlowById - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get UI Flows by ChatFlow ID
 */
const getUIFlowsByChatFlowId = async (chatflowId: string): Promise<UIFlow[]> => {
    try {
        const appServer = getRunningExpressApp()
        const uiFlows = await appServer.AppDataSource.getRepository(UIFlow).find({
            where: { chatflowId },
            order: { createdDate: 'DESC' }
        })
        return uiFlows
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: uiFlowService.getUIFlowsByChatFlowId - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Create a new UI Flow
 */
const createUIFlow = async (uiFlowData: Partial<UIFlow>): Promise<UIFlow> => {
    try {
        const appServer = getRunningExpressApp()
        const uiFlowRepository = appServer.AppDataSource.getRepository(UIFlow)
        
        // Validate that the ChatFlow exists
        if (uiFlowData.chatflowId) {
            const chatflowRepository = appServer.AppDataSource.getRepository('ChatFlow')
            const chatflow = await chatflowRepository.findOne({
                where: { id: uiFlowData.chatflowId }
            })
            
            if (!chatflow) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, `ChatFlow ${uiFlowData.chatflowId} not found`)
            }
        }
        
        const uiFlow = uiFlowRepository.create(uiFlowData)
        return await uiFlowRepository.save(uiFlow)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            throw error
        }
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: uiFlowService.createUIFlow - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Update an existing UI Flow
 */
const updateUIFlow = async (id: string, uiFlowData: Partial<UIFlow>): Promise<UIFlow> => {
    try {
        const appServer = getRunningExpressApp()
        const uiFlowRepository = appServer.AppDataSource.getRepository(UIFlow)
        
        // First check if the UI Flow exists
        const uiFlow = await uiFlowRepository.findOne({
            where: { id }
        })
        
        if (!uiFlow) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `UIFlow ${id} not found`)
        }
        
        // If chatflowId is being updated, verify the ChatFlow exists
        if (uiFlowData.chatflowId && uiFlowData.chatflowId !== uiFlow.chatflowId) {
            const chatflowRepository = appServer.AppDataSource.getRepository('ChatFlow')
            const chatflow = await chatflowRepository.findOne({
                where: { id: uiFlowData.chatflowId }
            })
            
            if (!chatflow) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, `ChatFlow ${uiFlowData.chatflowId} not found`)
            }
        }
        
        // Update the uiFlow properties
        Object.assign(uiFlow, uiFlowData)
        return await uiFlowRepository.save(uiFlow)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            throw error
        }
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: uiFlowService.updateUIFlow - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Delete a UI Flow
 */
const deleteUIFlow = async (id: string): Promise<void> => {
    try {
        const appServer = getRunningExpressApp()
        const uiFlowRepository = appServer.AppDataSource.getRepository(UIFlow)
        
        // First check if the UI Flow exists
        const uiFlow = await uiFlowRepository.findOne({
            where: { id }
        })
        
        if (!uiFlow) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `UIFlow ${id} not found`)
        }
        
        // Delete the UIFlow
        await uiFlowRepository.remove(uiFlow)
        logger.info(`UIFlow ${id} deleted successfully`)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            throw error
        }
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: uiFlowService.deleteUIFlow - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Deploy a UI Flow
 */
const deployUIFlow = async (id: string): Promise<UIFlow> => {
    try {
        const appServer = getRunningExpressApp()
        const uiFlowRepository = appServer.AppDataSource.getRepository(UIFlow)
        
        // First check if the UI Flow exists
        const uiFlow = await uiFlowRepository.findOne({
            where: { id }
        })
        
        if (!uiFlow) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `UIFlow ${id} not found`)
        }
        
        // Update the deployed status
        uiFlow.deployed = true
        
        // Save the updated UIFlow
        return await uiFlowRepository.save(uiFlow)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            throw error
        }
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: uiFlowService.deployUIFlow - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Undeploy a UI Flow
 */
const undeployUIFlow = async (id: string): Promise<UIFlow> => {
    try {
        const appServer = getRunningExpressApp()
        const uiFlowRepository = appServer.AppDataSource.getRepository(UIFlow)
        
        // First check if the UI Flow exists
        const uiFlow = await uiFlowRepository.findOne({
            where: { id }
        })
        
        if (!uiFlow) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `UIFlow ${id} not found`)
        }
        
        // Update the deployed status
        uiFlow.deployed = false
        
        // Save the updated UIFlow
        return await uiFlowRepository.save(uiFlow)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            throw error
        }
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: uiFlowService.undeployUIFlow - ${getErrorMessage(error)}`
        )
    }
}

export default {
    getAllUIFlows,
    getUIFlowById,
    getUIFlowsByChatFlowId,
    createUIFlow,
    updateUIFlow,
    deleteUIFlow,
    deployUIFlow,
    undeployUIFlow
} 