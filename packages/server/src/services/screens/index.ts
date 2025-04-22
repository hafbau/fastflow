import { StatusCodes } from 'http-status-codes'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { Screen } from '../../database/entities/Screen'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'
import logger from '../../utils/logger'

/**
 * Get all screens for a specific UI Flow
 */
const getScreensByUIFlowId = async (uiFlowId: string): Promise<Screen[]> => {
    try {
        const appServer = getRunningExpressApp()
        const screens = await appServer.AppDataSource.getRepository(Screen).find({
            where: { uiFlowId },
            order: { createdDate: 'ASC' }
        })
        return screens
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: screenService.getScreensByUIFlowId - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Get a specific screen by ID
 */
const getScreenById = async (screenId: string): Promise<Screen> => {
    try {
        const appServer = getRunningExpressApp()
        const screen = await appServer.AppDataSource.getRepository(Screen).findOne({
            where: { id: screenId }
        })
        
        if (!screen) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Screen ${screenId} not found`)
        }
        
        return screen
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            throw error
        }
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: screenService.getScreenById - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Create a new screen
 */
const createScreen = async (screenData: Partial<Screen>): Promise<Screen> => {
    try {
        const appServer = getRunningExpressApp()
        const screenRepository = appServer.AppDataSource.getRepository(Screen)
        
        const screen = screenRepository.create(screenData)
        return await screenRepository.save(screen)
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: screenService.createScreen - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Update an existing screen
 */
const updateScreen = async (screenId: string, screenData: Partial<Screen>): Promise<Screen> => {
    try {
        const appServer = getRunningExpressApp()
        const screenRepository = appServer.AppDataSource.getRepository(Screen)
        
        const screen = await screenRepository.findOne({
            where: { id: screenId }
        })
        
        if (!screen) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Screen ${screenId} not found`)
        }
        
        Object.assign(screen, screenData)
        return await screenRepository.save(screen)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            throw error
        }
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: screenService.updateScreen - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Delete a screen
 */
const deleteScreen = async (screenId: string): Promise<void> => {
    try {
        const appServer = getRunningExpressApp()
        const screenRepository = appServer.AppDataSource.getRepository(Screen)
        
        const screen = await screenRepository.findOne({
            where: { id: screenId }
        })
        
        if (!screen) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Screen ${screenId} not found`)
        }
        
        await screenRepository.remove(screen)
    } catch (error) {
        if (error instanceof InternalFlowiseError) {
            throw error
        }
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: screenService.deleteScreen - ${getErrorMessage(error)}`
        )
    }
}

export default {
    getScreensByUIFlowId,
    getScreenById,
    createScreen,
    updateScreen,
    deleteScreen
} 