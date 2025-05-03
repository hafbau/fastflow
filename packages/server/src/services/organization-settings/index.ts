import { StatusCodes } from 'http-status-codes'
import { OrganizationSettings } from '../../database/entities/OrganizationSettings'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import organizationsService from '../organizations'

/**
 * Get organization settings
 */
const getOrganizationSettings = async (organizationId: string): Promise<OrganizationSettings> => {
    try {
        // Verify organization exists
        await organizationsService.getOrganizationById(organizationId)
        
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(OrganizationSettings).findOne({
            where: {
                organizationId: organizationId
            },
            relations: ['organization']
        })
        
        if (!dbResponse) {
            // If settings don't exist, create default settings
            return createDefaultSettings(organizationId)
        }
        
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationSettingsService.getOrganizationSettings - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Create default organization settings
 */
const createDefaultSettings = async (organizationId: string): Promise<OrganizationSettings> => {
    try {
        const appServer = getRunningExpressApp()
        
        // Default settings
        const defaultSettings: Partial<OrganizationSettings> = {
            organizationId,
            theme: 'light',
            defaultRole: 'member',
            allowPublicWorkspaces: false,
            allowMemberInvites: false,
            maxWorkspaces: 10,
            maxMembersPerWorkspace: 10,
            settings: {
                notifications: {
                    email: true,
                    inApp: true
                },
                security: {
                    mfaRequired: false,
                    passwordPolicy: {
                        minLength: 8,
                        requireUppercase: true,
                        requireLowercase: true,
                        requireNumbers: true,
                        requireSpecialChars: false
                    }
                }
            }
        }
        
        const newSettings = appServer.AppDataSource.getRepository(OrganizationSettings).create(defaultSettings)
        const dbResponse = await appServer.AppDataSource.getRepository(OrganizationSettings).save(newSettings)
        
        return {
            ...dbResponse,
            organization: await organizationsService.getOrganizationById(organizationId)
        }
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationSettingsService.createDefaultSettings - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Update organization settings
 */
const updateOrganizationSettings = async (
    organizationId: string,
    updateData: Partial<OrganizationSettings>
): Promise<OrganizationSettings> => {
    try {
        const appServer = getRunningExpressApp()
        
        // Ensure organizationId is not changed
        delete updateData.id
        delete updateData.organizationId
        delete updateData.createdAt
        
        // Get current settings or create if they don't exist
        let settings: OrganizationSettings
        try {
            settings = await getOrganizationSettings(organizationId)
        } catch (error) {
            if (error instanceof InternalFastflowError && error.statusCode === StatusCodes.NOT_FOUND) {
                settings = await createDefaultSettings(organizationId)
            } else {
                throw error
            }
        }
        
        // If settings contains a nested JSON object, merge it instead of replacing
        if (updateData.settings && settings.settings) {
            updateData.settings = {
                ...settings.settings,
                ...updateData.settings
            }
        }
        
        // Update settings
        Object.assign(settings, updateData)
        
        await appServer.AppDataSource.getRepository(OrganizationSettings).save(settings)
        
        // Fetch updated settings with relations
        return getOrganizationSettings(organizationId)
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: organizationSettingsService.updateOrganizationSettings - ${getErrorMessage(error)}`
        )
    }
}

export default {
    getOrganizationSettings,
    updateOrganizationSettings
}