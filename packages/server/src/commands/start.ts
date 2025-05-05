import * as Server from '../index'
import { init, getInitializedDataSource } from '../DataSource'
import logger from '../utils/logger'
import { BaseCommand } from './base'

export default class Start extends BaseCommand {
    async run(): Promise<void> {
        try {
            logger.info('Starting Fastflow...')
            
            // Initialize database with proper async handling
            const dataSource = await init()
            
            // Ensure the data source is properly initialized and set as default
            if (!dataSource.isInitialized) {
                await dataSource.initialize()
            }
            
            // Start the server
            await Server.start()
        } catch (error: any) {
            logger.error(`Failed to start Fastflow: ${error.message || 'Unknown error'}`)
            if (error.stack) logger.error(error.stack)
            
            // If the database was initialized but server failed, try to clean up
            try {
                await this.stopProcess()
            } catch (err) {
                logger.error('Failed to clean up during error handling', err)
            }
            
            // We'll rethrow to let the BaseCommand catch() method handle it
            throw error
        }
    }

    async catch(error: Error) {
        if (error.stack) logger.error(error.stack)
        await new Promise((resolve) => {
            setTimeout(resolve, 1000)
        })
        await this.failExit()
    }

    async stopProcess() {
        try {
            logger.info(`Shutting down Fastflow...`)
            const serverApp = Server.getInstance()
            if (serverApp) await serverApp.stopApp()
        } catch (error) {
            logger.error('There was an error shutting down Fastflow...', error)
            await this.failExit()
        }

        await this.gracefullyExit()
    }
}
