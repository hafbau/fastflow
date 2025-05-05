/**
 * TypeORM Global Setup
 * 
 * This file sets up TypeORM default connection to be used with global functions
 * like getRepository(). It's a workaround for the issue with oclif and TypeORM
 * where the connection needs to be available at module initialization time.
 */

import { getDataSource } from './DataSource'
import { DataSource } from 'typeorm'
import logger from './utils/logger'

/**
 * Initialize TypeORM global connection
 */
export async function initializeTypeORM(): Promise<DataSource> {
    try {
        // Initialize the data source
        await getDataSource()
        
        // Get the initialized data source and set it as default
        const dataSource = getDataSource()
        
        // The data source should already be configured with name: 'default'
        // which makes it available to getRepository globally
        if (dataSource) {
            return dataSource
        } else {
            throw new Error('Failed to get initialized DataSource')
        }
    } catch (error) {
        logger.error('Failed to initialize TypeORM global connection', error)
        throw error
    }
}