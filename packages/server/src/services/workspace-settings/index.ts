import { StatusCodes } from 'http-status-codes'
import { WorkspaceSettings } from '../../database/entities/WorkspaceSettings'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { getErrorMessage } from '../../errors/utils'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import workspacesService from '../workspaces'

/**
 * Get workspace settings
 */
const getWorkspaceSettings = async (workspaceId: string): Promise<WorkspaceSettings> => {
    try {
        // Verify workspace exists
        await workspacesService.getWorkspaceById(workspaceId)
        
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(WorkspaceSettings).findOne({
            where: {
                workspaceId: workspaceId
            },
            relations: ['workspace']
        })
        
        if (!dbResponse) {
            // If settings don't exist, create default settings
            return createDefaultSettings(workspaceId)
        }
        
        return dbResponse
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspaceSettingsService.getWorkspaceSettings - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Create default workspace settings
 */
const createDefaultSettings = async (workspaceId: string): Promise<WorkspaceSettings> => {
    try {
        const appServer = getRunningExpressApp()
        
        // Get workspace to get organization ID
        const workspace = await workspacesService.getWorkspaceById(workspaceId)
        
        // Default settings
        const defaultSettings: Partial<WorkspaceSettings> = {
            workspaceId,
            theme: 'light',
            defaultRole: 'member',
            isPublic: false,
            allowMemberInvites: false,
            maxMembers: 10,
            settings: {
                notifications: {
                    email: true,
                    inApp: true
                },
                features: {
                    chatEnabled: true,
                    fileUploadEnabled: true,
                    apiAccessEnabled: true
                }
            }
        }
        
        const newSettings = appServer.AppDataSource.getRepository(WorkspaceSettings).create(defaultSettings)
        const dbResponse = await appServer.AppDataSource.getRepository(WorkspaceSettings).save(newSettings)
        
        return {
            ...dbResponse,
            workspace
        }
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspaceSettingsService.createDefaultSettings - ${getErrorMessage(error)}`
        )
    }
}

/**
 * Update workspace settings
 */
const updateWorkspaceSettings = async (
    workspaceId: string,
    updateData: Partial<WorkspaceSettings>
): Promise<WorkspaceSettings> => {
    try {
        const appServer = getRunningExpressApp()
        
        // Ensure workspaceId is not changed
        delete updateData.id
        delete updateData.workspaceId
        delete updateData.createdAt
        
        // Get current settings or create if they don't exist
        let settings: WorkspaceSettings
        try {
            settings = await getWorkspaceSettings(workspaceId)
        } catch (error) {
            if (error instanceof InternalFastflowError && error.statusCode === StatusCodes.NOT_FOUND) {
                settings = await createDefaultSettings(workspaceId)
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
        
        await appServer.AppDataSource.getRepository(WorkspaceSettings).save(settings)
        
        // Fetch updated settings with relations
        return getWorkspaceSettings(workspaceId)
    } catch (error) {
        if (error instanceof InternalFastflowError) throw error
        throw new InternalFastflowError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: workspaceSettingsService.updateWorkspaceSettings - ${getErrorMessage(error)}`
        )
    }
}

export default {
    getWorkspaceSettings,
    updateWorkspaceSettings
}