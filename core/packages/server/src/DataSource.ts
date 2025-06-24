import 'reflect-metadata'
import path from 'path'
import * as fs from 'fs'
import { DataSource } from 'typeorm'
import { getUserHome } from './utils'
import { entities } from './database/entities'
import { sqliteMigrations } from './database/migrations/sqlite'
import { mysqlMigrations } from './database/migrations/mysql'
import { mariadbMigrations } from './database/migrations/mariadb'
import { postgresMigrations } from './database/migrations/postgres'
import logger from './utils/logger'

let appDataSource: DataSource

export const init = async (): Promise<void> => {
    const debugLog = (msg: string) => {
        const timestamp = new Date().toISOString()
        console.log(`${timestamp} [DATASOURCE-DEBUG] ${msg}`)
        logger.info(`[DATASOURCE-DEBUG] ${msg}`)
        // Force flush stdout
        if (process.stdout.write) {
            process.stdout.write('')
        }
    }

    try {
        debugLog('=== DataSource init() called ===')
        debugLog(`DATABASE_TYPE: ${process.env.DATABASE_TYPE}`)
        debugLog(`DATABASE_HOST: ${process.env.DATABASE_HOST}`)
        debugLog(`DATABASE_PORT: ${process.env.DATABASE_PORT}`)
        debugLog(`DATABASE_NAME: ${process.env.DATABASE_NAME}`)
        debugLog(`DATABASE_USER: ${process.env.DATABASE_USER}`)
        debugLog(`DATABASE_SSL: ${process.env.DATABASE_SSL}`)
        debugLog(`NODE_ENV: ${process.env.NODE_ENV}`)
        
        let homePath
        let flowisePath = path.join(getUserHome(), '.flowise')
        debugLog(`Flowise path: ${flowisePath}`)
        
        if (!fs.existsSync(flowisePath)) {
            debugLog(`Creating flowise directory: ${flowisePath}`)
            fs.mkdirSync(flowisePath)
        }
        
        debugLog(`Checking database type: ${process.env.DATABASE_TYPE}`)
        switch (process.env.DATABASE_TYPE) {
        case 'sqlite':
            homePath = process.env.DATABASE_PATH ?? flowisePath
            appDataSource = new DataSource({
                type: 'sqlite',
                database: path.resolve(homePath, 'database.sqlite'),
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: sqliteMigrations
            })
            break
        case 'mysql':
            appDataSource = new DataSource({
                type: 'mysql',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '3306'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                charset: 'utf8mb4',
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: mysqlMigrations,
                ssl: getDatabaseSSLFromEnv()
            })
            break
        case 'mariadb':
            appDataSource = new DataSource({
                type: 'mariadb',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '3306'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                charset: 'utf8mb4',
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: mariadbMigrations,
                ssl: getDatabaseSSLFromEnv()
            })
            break
        case 'postgres':
            debugLog('Configuring PostgreSQL datasource...')
            const sslConfig = getDatabaseSSLFromEnv()
            debugLog(`SSL config: ${JSON.stringify(sslConfig)}`)
            const pgConfig = {
                type: 'postgres' as const,
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '5432'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                ssl: sslConfig,
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: postgresMigrations,
                extra: {
                    idleTimeoutMillis: 120000
                },
                logging: true,
                logger: 'advanced-console' as const,
                logNotifications: true,
                poolErrorHandler: (err: any) => {
                    logger.error(`Database pool error: ${JSON.stringify(err)}`)
                },
                applicationName: 'Flowise'
            }
            debugLog(`PostgreSQL config: ${JSON.stringify({...pgConfig, password: '***'}, null, 2)}`)
            appDataSource = new DataSource(pgConfig)
            break
        default:
            homePath = process.env.DATABASE_PATH ?? flowisePath
            appDataSource = new DataSource({
                type: 'sqlite',
                database: path.resolve(homePath, 'database.sqlite'),
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: sqliteMigrations
            })
            break
    }
    
        debugLog('DataSource configuration completed')
        debugLog('Attempting to initialize database connection...')
        
        await appDataSource.initialize()
        debugLog('Database connection initialized successfully')
        
        debugLog('Running database migrations...')
        await appDataSource.runMigrations()
        debugLog('Database migrations completed successfully')
        
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        const errorStack = error instanceof Error ? error.stack : 'No stack trace'
        debugLog(`FATAL ERROR in DataSource init: ${errorMsg}`)
        debugLog(`Error stack: ${errorStack}`)
        logger.error(`DataSource initialization failed: ${errorMsg}`)
        logger.error(errorStack)
        throw error
    }
}

export function getDataSource(): DataSource {
    if (appDataSource === undefined) {
        init()
    }
    return appDataSource
}

export const getDatabaseSSLFromEnv = () => {
    if (process.env.DATABASE_SSL_KEY_BASE64) {
        return {
            rejectUnauthorized: false,
            ca: Buffer.from(process.env.DATABASE_SSL_KEY_BASE64, 'base64')
        }
    } else if (process.env.DATABASE_SSL === 'true') {
        return true
    }
    return undefined
}
