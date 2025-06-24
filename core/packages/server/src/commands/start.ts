import * as Server from '../index'
import * as DataSource from '../DataSource'
import logger from '../utils/logger'
import { BaseCommand } from './base'
import * as fs from 'fs'

export default class Start extends BaseCommand {
    async run(): Promise<void> {
        const debugLog = (msg: string) => {
            const timestamp = new Date().toISOString()
            console.log(`${timestamp} [FLOWISE-START-DEBUG] ${msg}`)
            logger.info(`[DEBUG] ${msg}`)
            // Force flush stdout
            if (process.stdout.write) {
                process.stdout.write('')
            }
        }

        debugLog('=== Start command run() method called ===')
        debugLog(`Process ID: ${process.pid}`)
        debugLog(`Node version: ${process.version}`)
        debugLog(`Current directory: ${process.cwd()}`)
        debugLog(`Environment: ${JSON.stringify({
            DATABASE_TYPE: process.env.DATABASE_TYPE,
            DATABASE_HOST: process.env.DATABASE_HOST,
            DATABASE_PORT: process.env.DATABASE_PORT,
            DATABASE_NAME: process.env.DATABASE_NAME,
            DATABASE_USER: process.env.DATABASE_USER,
            DATABASE_SSL: process.env.DATABASE_SSL,
            PORT: process.env.PORT,
            NODE_ENV: process.env.NODE_ENV
        }, null, 2)}`)

        try {
            logger.info('Starting Flowise...')
            debugLog('About to initialize DataSource...')
            await DataSource.init()
            debugLog('DataSource initialized successfully')
            
            debugLog('About to start Server...')
            await Server.start()
            debugLog('Server started successfully')
        } catch (error) {
            debugLog(`Fatal error during startup: ${error}`)
            debugLog(`Error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`)
            throw error
        }
    }

    async catch(error: Error) {
        const timestamp = new Date().toISOString()
        console.error(`${timestamp} [FLOWISE-START-ERROR] Caught error in start command:`, error)
        console.error(`${timestamp} [FLOWISE-START-ERROR] Error message:`, error.message)
        console.error(`${timestamp} [FLOWISE-START-ERROR] Stack trace:`, error.stack)
        
        if (error.stack) logger.error(error.stack)
        
        // Force flush stderr
        if (process.stderr.write) {
            process.stderr.write('')
        }
        
        await new Promise((resolve) => {
            setTimeout(resolve, 1000)
        })
        await this.failExit()
    }

    async stopProcess() {
        try {
            logger.info(`Shutting down Flowise...`)
            const serverApp = Server.getInstance()
            if (serverApp) await serverApp.stopApp()
        } catch (error) {
            logger.error('There was an error shutting down Flowise...', error)
            await this.failExit()
        }

        await this.gracefullyExit()
    }
}
