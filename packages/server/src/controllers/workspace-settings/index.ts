import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import workspaceSettingsService from '../../services/workspace-settings'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'

/**
 * Get workspace settings
 */
const getWorkspaceSettings = async (req: Request, res: Response) => {
    try {
        const workspaceId = req.params.id
        const settings = await workspaceSettingsService.getWorkspaceSettings(workspaceId)
        return res.json(settings)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Update workspace settings
 */
const updateWorkspaceSettings = async (req: Request, res: Response) => {
    try {
        const workspaceId = req.params.id
        const updateData = req.body
        
        // Prevent updating critical fields
        delete updateData.id
        delete updateData.workspaceId
        delete updateData.createdAt
        
        const settings = await workspaceSettingsService.updateWorkspaceSettings(workspaceId, updateData)
        return res.json(settings)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

export default {
    getWorkspaceSettings,
    updateWorkspaceSettings
}