/**
 * API Key Migration Script
 * 
 * This script migrates API keys from the file-based system to the database
 * and associates them with Supabase users.
 * 
 * Usage:
 * 1. Set APIKEY_STORAGE_TYPE=database in .env
 * 2. Run: ts-node src/scripts/migrateApiKeys.ts
 */

import { createConnection } from 'typeorm'
import { randomUUID } from 'crypto'
import { getAPIKeys } from '../utils/apiKey'
import apiKeyService from '../services/apiKeyService'
import { getUserById, createUser } from '../utils/supabase'
import logger from '../utils/logger'
import { appConfig } from '../AppConfig'

// Configuration
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com'
const CREATE_SERVICE_ACCOUNTS = process.env.CREATE_SERVICE_ACCOUNTS === 'true'

/**
 * Main migration function
 */
async function migrateApiKeys() {
    // Check if database storage is enabled
    if (appConfig.apiKeys.storageType !== 'database') {
        logger.error('API key migration requires APIKEY_STORAGE_TYPE=database')
        process.exit(1)
    }

    try {
        // Connect to the database
        const connection = await createConnection()
        logger.info('Connected to database')

        // Get API keys from file
        const fileKeys = await getAPIKeys()
        logger.info(`Found ${fileKeys.length} API keys in file`)

        // Create a service account for API keys if needed
        let serviceAccountId: string | undefined
        
        if (CREATE_SERVICE_ACCOUNTS) {
            try {
                // Try to create a service account
                const serviceAccount = await createUser(
                    `service-account-${randomUUID().substring(0, 8)}@api.internal`,
                    randomUUID(),
                    { 
                        isServiceAccount: true,
                        name: 'API Key Service Account'
                    }
                )
                
                if (serviceAccount && serviceAccount.user) {
                    serviceAccountId = serviceAccount.user.id
                    logger.info(`Created service account with ID: ${serviceAccountId}`)
                }
            } catch (error) {
                logger.error(`Error creating service account: ${error}`)
            }
        }

        // Get admin user if available
        let adminUserId: string | undefined
        
        try {
            // Try to find admin user by email
            const adminUser = await getUserById(DEFAULT_ADMIN_EMAIL)
            
            if (adminUser && adminUser.user) {
                adminUserId = adminUser.user.id
                logger.info(`Found admin user with ID: ${adminUserId}`)
            }
        } catch (error) {
            logger.warn(`Admin user not found: ${error}`)
        }

        // Migrate each API key
        let migratedCount = 0
        let associatedCount = 0
        
        for (const key of fileKeys) {
            try {
                // Check if key already exists in database
                const existingKey = await apiKeyService.getApiKeyByKey(key.apiKey)
                
                if (!existingKey) {
                    // Create new key in database
                    const newKey = await apiKeyService.createApiKey(
                        key.keyName,
                        serviceAccountId || adminUserId, // Associate with service account or admin
                        undefined,
                        undefined
                    )
                    
                    if (newKey) {
                        migratedCount++
                        associatedCount++
                    }
                } else if (!existingKey.supabaseUserId && (serviceAccountId || adminUserId)) {
                    // Associate existing key with a user if we have a user ID
                    if (serviceAccountId || adminUserId) {
                        const updated = await apiKeyService.associateWithSupabaseUser(
                            existingKey.id,
                            serviceAccountId || adminUserId as string
                        )
                        
                        if (updated) {
                            associatedCount++
                        }
                    }
                    
                }
            } catch (error) {
                logger.error(`Error migrating key ${key.keyName}: ${error}`)
            }
        }
        
        logger.info(`Migration complete: ${migratedCount} keys migrated, ${associatedCount} keys associated with users`)
        
        // Close the database connection
        await connection.close()
        
    } catch (error) {
        logger.error(`Migration failed: ${error}`)
        process.exit(1)
    }
}

// Run the migration
migrateApiKeys()
    .then(() => {
        logger.info('API key migration completed successfully')
        process.exit(0)
    })
    .catch((error) => {
        logger.error(`API key migration failed: ${error}`)
        process.exit(1)
    })