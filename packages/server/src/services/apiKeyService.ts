import { randomBytes } from 'crypto'
import moment from 'moment'
import { Repository } from 'typeorm'
import { ApiKey } from '../database/entities/ApiKey'
import { generateAPIKey, generateSecretHash, compareKeys } from '../utils/apiKey'
import logger from '../utils/logger'
import { appConfig } from '../AppConfig'
import { getInitializedDataSource } from '../DataSource'

/**
 * API Key Service
 * Provides methods for managing API keys in the database
 * Includes compatibility with the existing file-based API key system
 */
class ApiKeyService {
    // Repository instance
    private apiKeyRepository: Repository<ApiKey> | null = null
    
    // Initialization flag
    private isInitialized: boolean = false
    
    /**
     * Initialize repositories lazily to avoid connection issues
     */
    private async ensureInitialized(): Promise<void> {
        if (this.isInitialized) {
            return
        }
        
        try {
            // Get initialized data source
            const dataSource = await getInitializedDataSource()
            
            // Get repositories
            this.apiKeyRepository = dataSource.getRepository(ApiKey)
            
            // Mark as initialized
            this.isInitialized = true
        } catch (error) {
            logger.error('Failed to initialize ApiKeyService repositories', error)
            throw error
        }
    }
    /**
     * Get all API keys
     * @returns {Promise<ApiKey[]>}
     */
    async getAllApiKeys(): Promise<ApiKey[]> {
        try {
            // If using database storage
            if (appConfig.apiKeys.storageType === 'database') {
                await this.ensureInitialized()
                return this.apiKeyRepository!.find()
            }
            
            // Log warning for deprecated storage type
            logger.warn(`[ApiKeyService] File-based API key storage is deprecated. Please configure 'database' as apiKeys.storageType in app config.`)
            return []
        } catch (error) {
            logger.error(`[ApiKeyService] Error getting API keys: ${error}`)
            return []
        }
    }

    /**
     * Get API key by ID
     * @param {string} id
     * @returns {Promise<ApiKey | null>}
     */
    async getApiKeyById(id: string): Promise<ApiKey | null> {
        try {
            // If using database storage
            if (appConfig.apiKeys.storageType === 'database') {
                await this.ensureInitialized()
                return this.apiKeyRepository!.findOne({ where: { id } })
            }
            
            // Log warning for deprecated storage type
            logger.warn(`[ApiKeyService] File-based API key storage is deprecated. Please configure 'database' as apiKeys.storageType in app config.`)
            return null
        } catch (error) {
            logger.error(`[ApiKeyService] Error getting API key by ID: ${error}`)
            return null
        }
    }

    /**
     * Get API key by key value
     * @param {string} apiKey
     * @returns {Promise<ApiKey | null>}
     */
    async getApiKeyByKey(apiKey: string): Promise<ApiKey | null> {
        try {
            // If using database storage
            if (appConfig.apiKeys.storageType === 'database') {
                await this.ensureInitialized()
                return this.apiKeyRepository!.findOne({ where: { apiKey } })
            }
            
            // Log warning for deprecated storage type
            logger.warn(`[ApiKeyService] File-based API key storage is deprecated. Please configure 'database' as apiKeys.storageType in app config.`)
            return null
        } catch (error) {
            logger.error(`[ApiKeyService] Error getting API key by key: ${error}`)
            return null
        }
    }

    /**
     * Create a new API key
     * @param {string} keyName
     * @param {string} supabaseUserId
     * @param {string} organizationId
     * @param {string} workspaceId
     * @returns {Promise<ApiKey | null>}
     */
    async createApiKey(
        keyName: string, 
        supabaseUserId?: string, 
        organizationId?: string, 
        workspaceId?: string
    ): Promise<ApiKey | null> {
        try {
            const apiKey = generateAPIKey()
            const apiSecret = generateSecretHash(apiKey)
            const id = randomBytes(10).toString('hex')
            
            // If using database storage
            if (appConfig.apiKeys.storageType === 'database') {
                await this.ensureInitialized()
                const newApiKey = this.apiKeyRepository!.create({
                    id,
                    keyName,
                    apiKey,
                    apiSecret,
                    supabaseUserId,
                    organizationId,
                    workspaceId
                })
                
                return await this.apiKeyRepository!.save(newApiKey)
            }
            
            // Log warning for deprecated storage type
            logger.warn(`[ApiKeyService] File-based API key storage is deprecated. Please configure 'database' as apiKeys.storageType in app config.`)
            return null
        } catch (error) {
            logger.error(`[ApiKeyService] Error creating API key: ${error}`)
            return null
        }
    }

    /**
     * Update an API key
     * @param {string} id
     * @param {string} keyName
     * @param {string} supabaseUserId
     * @param {string} organizationId
     * @param {string} workspaceId
     * @returns {Promise<ApiKey | null>}
     */
    async updateApiKey(
        id: string, 
        keyName?: string, 
        supabaseUserId?: string, 
        organizationId?: string, 
        workspaceId?: string
    ): Promise<ApiKey | null> {
        try {
            // If using database storage
            if (appConfig.apiKeys.storageType === 'database') {
                await this.ensureInitialized()
                const apiKey = await this.apiKeyRepository!.findOne({ where: { id } })
                
                if (!apiKey) {
                    return null
                }
                
                if (keyName) apiKey.keyName = keyName
                if (supabaseUserId) apiKey.supabaseUserId = supabaseUserId
                if (organizationId) apiKey.organizationId = organizationId
                if (workspaceId) apiKey.workspaceId = workspaceId
                
                return await this.apiKeyRepository!.save(apiKey)
            }
            
            // Log warning for deprecated storage type
            logger.warn(`[ApiKeyService] File-based API key storage is deprecated. Please configure 'database' as apiKeys.storageType in app config.`)
            return null
        } catch (error) {
            logger.error(`[ApiKeyService] Error updating API key: ${error}`)
            return null
        }
    }

    /**
     * Delete an API key
     * @param {string} id
     * @returns {Promise<boolean>}
     */
    async deleteApiKey(id: string): Promise<boolean> {
        try {
            // If using database storage
            if (appConfig.apiKeys.storageType === 'database') {
                await this.ensureInitialized()
                const result = await this.apiKeyRepository!.delete(id)
                return result.affected ? result.affected > 0 : false
            }
            
            // Log warning for deprecated storage type
            logger.warn(`[ApiKeyService] File-based API key storage is deprecated. Please configure 'database' as apiKeys.storageType in app config.`)
            return false
        } catch (error) {
            logger.error(`[ApiKeyService] Error deleting API key: ${error}`)
            return false
        }
    }

    /**
     * Validate an API key
     * @param {string} apiKey
     * @returns {Promise<boolean>}
     */
    async validateApiKey(apiKey: string): Promise<boolean> {
        try {
            const key = await this.getApiKeyByKey(apiKey)
            
            if (!key || !key.apiSecret) {
                return false
            }
            
            return compareKeys(key.apiSecret, apiKey)
        } catch (error) {
            logger.error(`[ApiKeyService] Error validating API key: ${error}`)
            return false
        }
    }

    /**
     * Associate an API key with a Supabase user
     * @param {string} id
     * @param {string} supabaseUserId
     * @returns {Promise<ApiKey | null>}
     */
    async associateWithSupabaseUser(id: string, supabaseUserId: string): Promise<ApiKey | null> {
        return this.updateApiKey(id, undefined, supabaseUserId)
    }

    /**
     * Get API keys for a Supabase user
     * @param {string} supabaseUserId
     * @returns {Promise<ApiKey[]>}
     */
    async getApiKeysForSupabaseUser(supabaseUserId: string): Promise<ApiKey[]> {
        try {
            // If using database storage
            if (appConfig.apiKeys.storageType === 'database') {
                await this.ensureInitialized()
                return this.apiKeyRepository!.find({ where: { supabaseUserId } })
            }
            
            // For file-based storage, we can't filter by Supabase user ID
            // since the file-based system doesn't support this field
            return []
        } catch (error) {
            logger.error(`[ApiKeyService] Error getting API keys for Supabase user: ${error}`)
            return []
        }
    }

    /**
     * Migrate API keys from file to database
     * @returns {Promise<number>} Number of migrated keys
     */
    async migrateFileKeysToDatabase(): Promise<number> {
        try {
            // Only proceed if we're using database storage
            if (appConfig.apiKeys.storageType !== 'database') {
                logger.warn('[ApiKeyService] Cannot migrate keys: Database storage not enabled')
                return 0
            }
            
            await this.ensureInitialized()
            
            // Get keys from file
            const { getAPIKeys } = require('../utils/apiKey')
            const fileKeys = await getAPIKeys()
            
            if (!fileKeys || !fileKeys.length) {
                return 0
            }
            
            // Save keys to database
            let migratedCount = 0
            
            for (const key of fileKeys) {
                // Check if key already exists in database
                const existingKey = await this.apiKeyRepository!.findOne({ where: { apiKey: key.apiKey } })
                
                if (!existingKey) {
                    const newKey = this.apiKeyRepository!.create({
                        id: key.id || randomBytes(10).toString('hex'),
                        keyName: key.keyName,
                        apiKey: key.apiKey,
                        apiSecret: key.apiSecret,
                        updatedDate: key.updatedDate || new Date()
                    })
                    
                    await this.apiKeyRepository!.save(newKey)
                    migratedCount++
                }
            }
            
            logger.info(`[ApiKeyService] Migrated ${migratedCount} API keys from file to database`)
            return migratedCount
        } catch (error) {
            logger.error(`[ApiKeyService] Error migrating API keys: ${error}`)
            return 0
        }
    }
}

// Create a singleton instance
const apiKeyService = new ApiKeyService()

export default apiKeyService