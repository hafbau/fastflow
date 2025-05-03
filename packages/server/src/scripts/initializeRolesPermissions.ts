import { App } from '../index'
import rolesPermissionsService from '../services/roles-permissions'
import logger from '../utils/logger'

/**
 * Initialize roles and permissions
 * This script should be run when the server starts
 */
export async function initializeRolesPermissions(app: App): Promise<void> {
    try {
        logger.info('Initializing roles and permissions...')
        
        // Initialize roles and permissions
        await rolesPermissionsService.initializeRolesAndPermissions()
        
        logger.info('Roles and permissions initialized successfully')
    } catch (error) {
        logger.error('Error initializing roles and permissions:', error)
    }
}