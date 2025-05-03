import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import organizationSettingsService from '../../services/organization-settings'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'

/**
 * Get organization settings
 */
const getOrganizationSettings = async (req: Request, res: Response) => {
    try {
        const organizationId = req.params.id
        const settings = await organizationSettingsService.getOrganizationSettings(organizationId)
        return res.json(settings)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

/**
 * Update organization settings
 */
const updateOrganizationSettings = async (req: Request, res: Response) => {
    try {
        const organizationId = req.params.id
        const updateData = req.body
        
        // Prevent updating critical fields
        delete updateData.id
        delete updateData.organizationId
        delete updateData.createdAt
        
        const settings = await organizationSettingsService.updateOrganizationSettings(organizationId, updateData)
        return res.json(settings)
    } catch (error) {
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) })
    }
}

export default {
    getOrganizationSettings,
    updateOrganizationSettings
}