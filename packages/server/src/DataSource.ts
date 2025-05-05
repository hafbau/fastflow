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

let appDataSource: DataSource

export const init = async (): Promise<DataSource> => {
    let homePath
    let fastflowPath = path.join(getUserHome(), '.fastflow')
    if (!fs.existsSync(fastflowPath)) {
        fs.mkdirSync(fastflowPath)
    }
    
    // If we already have an initialized DataSource, return it
    if (appDataSource && appDataSource.isInitialized) {
        return appDataSource
    }
    
    // If we have a DataSource but it's not initialized, destroy it first
    if (appDataSource && !appDataSource.isInitialized) {
        try {
            await appDataSource.destroy()
        } catch (error) {
            // Ignore errors during destroy
            console.error('Error destroying data source:', error)
        }
    }
    
    // Create a new DataSource based on configuration
    switch (process.env.DATABASE_TYPE) {
        case 'sqlite':
            homePath = process.env.DATABASE_PATH ?? fastflowPath
            appDataSource = new DataSource({
                name: 'default', // Name it 'default' to work with global getRepository
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
                name: 'default', // Name it 'default' to work with global getRepository
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
                name: 'default', // Name it 'default' to work with global getRepository
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
            appDataSource = new DataSource({
                name: 'default', // Name it 'default' to work with global getRepository
                type: 'postgres',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '5432'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                ssl: getDatabaseSSLFromEnv(),
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: postgresMigrations
            })
            break
        default:
            homePath = process.env.DATABASE_PATH ?? fastflowPath
            appDataSource = new DataSource({
                name: 'default', // Name it 'default' to work with global getRepository
                type: 'sqlite',
                database: path.resolve(homePath, 'database.sqlite'),
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: sqliteMigrations
            })
            break
    }
    
    // Initialize the connection
    try {
        if (appDataSource && !appDataSource.isInitialized) {
            await appDataSource.initialize()
            console.log('Database connection initialized successfully')
        }
        return appDataSource
    } catch (error) {
        console.error('Failed to initialize database connection:', error)
        throw error
    }
}

/**
 * Get data source synchronously - only use this when you know it's been initialized
 * This returns the current DataSource instance without initializing it
 */
export function getDataSource(): DataSource {
    if (!appDataSource) {
        // Create a data source but don't initialize it
        const homePath = process.env.DATABASE_PATH ?? path.join(getUserHome(), '.fastflow')
        appDataSource = new DataSource({
            name: 'default',
            type: 'sqlite',
            database: path.resolve(homePath, 'database.sqlite'),
            synchronize: false,
            migrationsRun: false,
            entities: Object.values(entities),
            migrations: sqliteMigrations
        })
    }
    return appDataSource
}

/**
 * Get initialized data source asynchronously - this will initialize it if needed
 * Always use this in service constructors or before using TypeORM repositories
 */
export async function getInitializedDataSource(): Promise<DataSource> {
    if (!appDataSource) {
        // If we don't have a data source yet, create one
        await init()
    } else if (!appDataSource.isInitialized) {
        // If we have a data source but it's not initialized, initialize it
        await appDataSource.initialize()
    }
    return appDataSource
}

const getDatabaseSSLFromEnv = () => {
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
