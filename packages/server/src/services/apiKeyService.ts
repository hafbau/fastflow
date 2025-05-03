import { randomBytes } from 'crypto'
import moment from 'moment'
import { getRepository } from 'typeorm'
import { ApiKey } from '../database/entities/ApiKey'
import { generateAPIKey, generateSecretHash, compareKeys } from '../utils/apiKey'
import logger from '../utils/logger'
import { appConfig } from '../AppConfig'

/**
 * API Key Service
 * Provides methods for managing API keys in the database
 * Includes compatibility with the existing file-based API key system
 */
class ApiKeyService {
    /**
     * Get all API keys
     * @returns {Promise<ApiKey[]>}
     */
    async getAllApiKeys(): Promise<ApiKey[]> {
        try {
            // If using database storage
            if (appConfig.apiKeys.storageType === 'database') {
                const apiKeyRepository = getRepository(ApiKey)
                return apiKeyRepository.find()
            }
            
            // Fall back to file-based storage (legacy mode)
            const { getAPIKeys } = require('../utils/apiKey')
            return await getAPIKeys()
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
                const apiKeyRepository = getRepository(ApiKey)
                return apiKeyRepository.findOne({ where: { id } })
            }
            
            // Fall back to file-based storage (legacy mode)
            const { getAPIKeys } = require('../utils/apiKey')
            const keys = await getAPIKeys()
            return keys.find((key: any) => key.id === id) || null
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
                const apiKeyRepository = getRepository(ApiKey)
                return apiKeyRepository.findOne({ where: { apiKey } })
            }
            
            // Fall back to file-based storage (legacy mode)
            const { getAPIKeys } = require('../utils/apiKey')
            const keys = await getAPIKeys()
            return keys.find((key: any) => key.apiKey === apiKey) || null
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
                const apiKeyRepository = getRepository(ApiKey)
                const newApiKey = apiKeyRepository.create({
                    id,
                    keyName,
                    apiKey,
                    apiSecret,
                    supabaseUserId,
                    organizationId,
                    workspaceId
                })
                
                return await apiKeyRepository.save(newApiKey)
            }
            
            // Fall back to file-based storage (legacy mode)
            const { addAPIKey } = require('../utils/apiKey')
            await addAPIKey(keyName)
            
            // Get the newly created key
            return this.getApiKeyByKey(apiKey)
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
                const apiKeyRepository = getRepository(ApiKey)
                const apiKey = await apiKeyRepository.findOne({ where: { id } })
                
                if (!apiKey) {
                    return null
                }
                
                if (keyName) apiKey.keyName = keyName
                if (supabaseUserId) apiKey.supabaseUserId = supabaseUserId
                if (organizationId) apiKey.organizationId = organizationId
                if (workspaceId) apiKey.workspaceId = workspaceId
                
                return await apiKeyRepository.save(apiKey)
            }
            
            // Fall back to file-based storage (legacy mode)
            const { updateAPIKey } = require('../utils/apiKey')
            if (keyName) {
                await updateAPIKey(id, keyName)
            }
            
            return this.getApiKeyById(id)
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
                const apiKeyRepository = getRepository(ApiKey)
                const result = await apiKeyRepository.delete(id)
                return result.affected ? result.affected > 0 : false
            }
            
            // Fall back to file-based storage (legacy mode)
            const { deleteAPIKey } = require('../utils/apiKey')
            await deleteAPIKey(id)
            return true
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
                const apiKeyRepository = getRepository(ApiKey)
                return apiKeyRepository.find({ where: { supabaseUserId } })
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
            
            // Get keys from file
            const { getAPIKeys } = require('../utils/apiKey')
            const fileKeys = await getAPIKeys()
            
            if (!fileKeys || !fileKeys.length) {
                return 0
            }
            
            // Save keys to database
            const apiKeyRepository = getRepository(ApiKey)
            let migratedCount = 0
            
            for (const key of fileKeys) {
                // Check if key already exists in database
                const existingKey = await apiKeyRepository.findOne({ where: { apiKey: key.apiKey } })
                
                if (!existingKey) {
                    const newKey = apiKeyRepository.create({
                        id: key.id || randomBytes(10).toString('hex'),
                        keyName: key.keyName,
                        apiKey: key.apiKey,
                        apiSecret: key.apiSecret,
                        updatedDate: key.updatedDate || new Date()
                    })
                    
                    await apiKeyRepository.save(newKey)
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