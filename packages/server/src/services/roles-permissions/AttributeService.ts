import { Repository } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import logger from '../../utils/logger'
import { ResourceAttribute } from '../../database/entities/ResourceAttribute'
import { UserAttribute } from '../../database/entities/UserAttribute'
import { EnvironmentAttribute } from '../../database/entities/EnvironmentAttribute'
import { createClient } from 'redis'
import config from '../../config'
import { getInitializedDataSource } from '../../DataSource'

/**
 * Service for managing attributes for ABAC (Attribute-Based Access Control)
 */
class AttributeService {
    private resourceAttributeRepository: Repository<ResourceAttribute> | null = null
    private userAttributeRepository: Repository<UserAttribute> | null = null
    private environmentAttributeRepository: Repository<EnvironmentAttribute> | null = null
    private redisClient: any
    private isInitialized: boolean = false

    /**
     * Constructor
     */
    constructor() {
        // Repositories will be initialized lazily
        // Initialize Redis client if needed
        // this.initializeRedisClient()
    }
    
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
            this.resourceAttributeRepository = dataSource.getRepository(ResourceAttribute)
            this.userAttributeRepository = dataSource.getRepository(UserAttribute)
            this.environmentAttributeRepository = dataSource.getRepository(EnvironmentAttribute)
            
            // Mark as initialized
            this.isInitialized = true
        } catch (error) {
            logger.error('Failed to initialize AttributeService repositories', error)
            throw error
        }
    }

    /**
     * Initialize Redis client for caching
     */
    private async initializeRedisClient() {
        try {
            this.redisClient = createClient({
                url: 'redis://localhost:6379' // Default Redis URL
            })
            
            await this.redisClient.connect()
            
            this.redisClient.on('error', (err: any) => {
                logger.error(`[AttributeService] Redis client error: ${err.message}`)
            })
        } catch (error: any) {
            logger.error(`[AttributeService] Redis client initialization error: ${error.message}`)
        }
    }

    /**
     * Get cache key for attributes
     */
    private getCacheKey(type: string, id: string, key?: string): string {
        return `attribute:${type}:${id}${key ? `:${key}` : ''}`
    }

    /**
     * Clear cache for attributes
     */
    private async clearCache(type: string, id: string, key?: string): Promise<void> {
        if (!this.redisClient) return

        try {
            if (key) {
                // Clear specific attribute
                await this.redisClient.del(this.getCacheKey(type, id, key))
            } else {
                // Clear all attributes for an entity
                const pattern = this.getCacheKey(type, id, '*')
                const keys = await this.redisClient.keys(pattern)
                if (keys.length > 0) {
                    await this.redisClient.del(keys)
                }
            }
        } catch (error: any) {
            logger.error(`[AttributeService] Clear cache error: ${error.message}`)
        }
    }

    // Resource Attribute Methods

    /**
     * Set a resource attribute
     */
    async setResourceAttribute(
        resourceType: string,
        resourceId: string,
        key: string,
        value: any
    ): Promise<ResourceAttribute> {
        try {
            await this.ensureInitialized()
            
            // Check if attribute already exists
            const existingAttribute = await this.resourceAttributeRepository!.findOne({
                where: {
                    resourceType,
                    resourceId,
                    key
                }
            })

            if (existingAttribute) {
                // Update existing attribute
                existingAttribute.value = value
                existingAttribute.updatedAt = new Date()
                const result = await this.resourceAttributeRepository!.save(existingAttribute)
                
                // Clear cache
                await this.clearCache('resource', `${resourceType}:${resourceId}`, key)
                
                return result
            } else {
                // Create new attribute
                const attribute = new ResourceAttribute()
                attribute.resourceType = resourceType
                attribute.resourceId = resourceId
                attribute.key = key
                attribute.value = value
                
                const result = await this.resourceAttributeRepository!.save(attribute)
                
                // Clear cache
                await this.clearCache('resource', `${resourceType}:${resourceId}`, key)
                
                return result
            }
        } catch (error: any) {
            logger.error(`[AttributeService] Set resource attribute error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to set resource attribute: ${error.message}`
            )
        }
    }

    /**
     * Get a resource attribute
     */
    async getResourceAttribute(
        resourceType: string,
        resourceId: string,
        key: string
    ): Promise<any> {
        try {
            await this.ensureInitialized()
            // Check cache first
            if (this.redisClient) {
                const cacheKey = this.getCacheKey('resource', `${resourceType}:${resourceId}`, key)
                const cachedValue = await this.redisClient.get(cacheKey)
                
                if (cachedValue) {
                    return JSON.parse(cachedValue)
                }
            }
            
            const attribute = await this.resourceAttributeRepository!.findOne({
                where: {
                    resourceType,
                    resourceId,
                    key
                }
            })
            
            const value = attribute ? attribute.value : null
            
            // Cache the result
            if (this.redisClient) {
                const cacheKey = this.getCacheKey('resource', `${resourceType}:${resourceId}`, key)
                await this.redisClient.set(cacheKey, JSON.stringify(value), {
                    EX: 300 // Cache for 5 minutes
                })
            }
            
            return value
        } catch (error: any) {
            logger.error(`[AttributeService] Get resource attribute error: ${error.message}`)
            return null
        }
    }

    /**
     * Get all attributes for a resource
     */
    async getResourceAttributes(
        resourceType: string,
        resourceId: string
    ): Promise<Record<string, any>> {
        try {
            await this.ensureInitialized()
            // Check cache first
            if (this.redisClient) {
                const cacheKey = this.getCacheKey('resource', `${resourceType}:${resourceId}`)
                const cachedValue = await this.redisClient.get(cacheKey)
                
                if (cachedValue) {
                    return JSON.parse(cachedValue)
                }
            }
            
            const attributes = await this.resourceAttributeRepository!.find({
                where: {
                    resourceType,
                    resourceId
                }
            })
            
            const result: Record<string, any> = {}
            
            for (const attribute of attributes) {
                result[attribute.key] = attribute.value
            }
            
            // Cache the result
            if (this.redisClient) {
                const cacheKey = this.getCacheKey('resource', `${resourceType}:${resourceId}`)
                await this.redisClient.set(cacheKey, JSON.stringify(result), {
                    EX: 300 // Cache for 5 minutes
                })
            }
            
            return result
        } catch (error: any) {
            logger.error(`[AttributeService] Get resource attributes error: ${error.message}`)
            return {}
        }
    }

    /**
     * Delete a resource attribute
     */
    async deleteResourceAttribute(
        resourceType: string,
        resourceId: string,
        key: string
    ): Promise<boolean> {
        try {
            await this.ensureInitialized()
            const result = await this.resourceAttributeRepository!.delete({
                resourceType,
                resourceId,
                key
            })
            
            // Clear cache
            await this.clearCache('resource', `${resourceType}:${resourceId}`, key)
            
            return (result.affected ?? 0) > 0
        } catch (error: any) {
            logger.error(`[AttributeService] Delete resource attribute error: ${error.message}`)
            return false
        }
    }

    // User Attribute Methods

    /**
     * Set a user attribute
     */
    async setUserAttribute(
        userId: string,
        key: string,
        value: any
    ): Promise<UserAttribute> {
        try {
            await this.ensureInitialized()
            // Check if attribute already exists
            const existingAttribute = await this.userAttributeRepository!.findOne({
                where: {
                    userId,
                    key
                }
            })

            if (existingAttribute) {
                // Update existing attribute
                existingAttribute.value = value
                existingAttribute.updatedAt = new Date()
                const result = await this.userAttributeRepository!.save(existingAttribute)
                
                // Clear cache
                await this.clearCache('user', userId, key)
                
                return result
            } else {
                // Create new attribute
                const attribute = new UserAttribute()
                attribute.userId = userId
                attribute.key = key
                attribute.value = value
                
                const result = await this.userAttributeRepository!.save(attribute)
                
                // Clear cache
                await this.clearCache('user', userId, key)
                
                return result
            }
        } catch (error: any) {
            logger.error(`[AttributeService] Set user attribute error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to set user attribute: ${error.message}`
            )
        }
    }

    /**
     * Get a user attribute
     */
    async getUserAttribute(
        userId: string,
        key: string
    ): Promise<any> {
        try {
            await this.ensureInitialized()
            // Check cache first
            if (this.redisClient) {
                const cacheKey = this.getCacheKey('user', userId, key)
                const cachedValue = await this.redisClient.get(cacheKey)
                
                if (cachedValue) {
                    return JSON.parse(cachedValue)
                }
            }
            
            const attribute = await this.userAttributeRepository!.findOne({
                where: {
                    userId,
                    key
                }
            })
            
            const value = attribute ? attribute.value : null
            
            // Cache the result
            if (this.redisClient) {
                const cacheKey = this.getCacheKey('user', userId, key)
                await this.redisClient.set(cacheKey, JSON.stringify(value), {
                    EX: 300 // Cache for 5 minutes
                })
            }
            
            return value
        } catch (error: any) {
            logger.error(`[AttributeService] Get user attribute error: ${error.message}`)
            return null
        }
    }

    /**
     * Get all attributes for a user
     */
    async getUserAttributes(userId: string): Promise<Record<string, any>> {
        try {
            await this.ensureInitialized()
            // Check cache first
            if (this.redisClient) {
                const cacheKey = this.getCacheKey('user', userId)
                const cachedValue = await this.redisClient.get(cacheKey)
                
                if (cachedValue) {
                    return JSON.parse(cachedValue)
                }
            }
            
            const attributes = await this.userAttributeRepository!.find({
                where: {
                    userId
                }
            })
            
            const result: Record<string, any> = {}
            
            for (const attribute of attributes) {
                result[attribute.key] = attribute.value
            }
            
            // Cache the result
            if (this.redisClient) {
                const cacheKey = this.getCacheKey('user', userId)
                await this.redisClient.set(cacheKey, JSON.stringify(result), {
                    EX: 300 // Cache for 5 minutes
                })
            }
            
            return result
        } catch (error: any) {
            logger.error(`[AttributeService] Get user attributes error: ${error.message}`)
            return {}
        }
    }

    /**
     * Delete a user attribute
     */
    async deleteUserAttribute(
        userId: string,
        key: string
    ): Promise<boolean> {
        try {
            await this.ensureInitialized()
            
            const result = await this.userAttributeRepository!.delete({
                userId,
                key
            })
            
            // Clear cache
            await this.clearCache('user', userId, key)
            
            return (result.affected ?? 0) > 0
        } catch (error: any) {
            logger.error(`[AttributeService] Delete user attribute error: ${error.message}`)
            return false
        }
    }

    // Environment Attribute Methods

    /**
     * Set an environment attribute
     */
    async setEnvironmentAttribute(
        key: string,
        value: any,
        organizationId?: string,
        workspaceId?: string
    ): Promise<EnvironmentAttribute> {
        try {
            await this.ensureInitialized()
            // Check if attribute already exists
            const whereClause: any = { key }
            if (organizationId) whereClause.organizationId = organizationId
            if (workspaceId) whereClause.workspaceId = workspaceId
            
            const existingAttribute = await this.environmentAttributeRepository!.findOne({
                where: whereClause
            })

            if (existingAttribute) {
                // Update existing attribute
                existingAttribute.value = value
                existingAttribute.updatedAt = new Date()
                const result = await this.environmentAttributeRepository!.save(existingAttribute)
                
                // Clear cache
                const envId = this.getEnvironmentId(organizationId, workspaceId)
                await this.clearCache('env', envId, key)
                
                return result
            } else {
                // Create new attribute
                const attribute = new EnvironmentAttribute()
                attribute.key = key
                attribute.value = value
                attribute.organizationId = organizationId
                attribute.workspaceId = workspaceId
                
                const result = await this.environmentAttributeRepository!.save(attribute)
                
                // Clear cache
                const envId = this.getEnvironmentId(organizationId, workspaceId)
                await this.clearCache('env', envId, key)
                
                return result
            }
        } catch (error: any) {
            logger.error(`[AttributeService] Set environment attribute error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to set environment attribute: ${error.message}`
            )
        }
    }

    /**
     * Get an environment attribute
     */
    async getEnvironmentAttribute(
        key: string,
        organizationId?: string,
        workspaceId?: string
    ): Promise<any> {
        try {
            await this.ensureInitialized()
            const envId = this.getEnvironmentId(organizationId, workspaceId)
            
            // Check cache first
            if (this.redisClient) {
                const cacheKey = this.getCacheKey('env', envId, key)
                const cachedValue = await this.redisClient.get(cacheKey)
                
                if (cachedValue) {
                    return JSON.parse(cachedValue)
                }
            }
            
            // Build where clause based on provided context
            const whereClause: any = { key, isActive: true }
            if (organizationId) whereClause.organizationId = organizationId
            if (workspaceId) whereClause.workspaceId = workspaceId
            
            // Try to find the most specific attribute first
            let attribute = null
            
            if (workspaceId && organizationId) {
                // Try workspace-specific
                attribute = await this.environmentAttributeRepository!.findOne({
                    where: {
                        key,
                        workspaceId,
                        isActive: true
                    }
                })
            }
            
            if (!attribute && organizationId) {
                // Try organization-specific
                attribute = await this.environmentAttributeRepository!.findOne({
                    where: {
                        key,
                        organizationId,
                        workspaceId: undefined,
                        isActive: true
                    } as any
                })
            }
            
            if (!attribute) {
                // Try global
                attribute = await this.environmentAttributeRepository!.findOne({
                    where: {
                        key,
                        organizationId: undefined,
                        workspaceId: undefined,
                        isActive: true
                    } as any
                })
            }
            
            const value = attribute ? attribute.value : null
            
            // Cache the result
            if (this.redisClient) {
                const cacheKey = this.getCacheKey('env', envId, key)
                await this.redisClient.set(cacheKey, JSON.stringify(value), {
                    EX: 300 // Cache for 5 minutes
                })
            }
            
            return value
        } catch (error: any) {
            logger.error(`[AttributeService] Get environment attribute error: ${error.message}`)
            return null
        }
    }

    /**
     * Get all environment attributes for a context
     */
    async getEnvironmentAttributes(
        organizationId?: string,
        workspaceId?: string
    ): Promise<Record<string, any>> {
        try {
            await this.ensureInitialized()
            const envId = this.getEnvironmentId(organizationId, workspaceId)
            
            // Check cache first
            if (this.redisClient) {
                const cacheKey = this.getCacheKey('env', envId)
                const cachedValue = await this.redisClient.get(cacheKey)
                
                if (cachedValue) {
                    return JSON.parse(cachedValue)
                }
            }
            
            // Get global attributes
            const globalAttributes = await this.environmentAttributeRepository!.find({
                where: {
                    organizationId: undefined,
                    workspaceId: undefined,
                    isActive: true
                } as any
            })
            
            const result: Record<string, any> = {}
            
            // Add global attributes
            for (const attribute of globalAttributes) {
                result[attribute.key] = attribute.value
            }
            
            // Add organization-specific attributes (overriding globals)
            if (organizationId) {
                const orgAttributes = await this.environmentAttributeRepository!.find({
                    where: {
                        organizationId,
                        workspaceId: undefined,
                        isActive: true
                    } as any
                })
                
                for (const attribute of orgAttributes) {
                    result[attribute.key] = attribute.value
                }
            }
            
            // Add workspace-specific attributes (overriding org and globals)
            if (workspaceId) {
                const workspaceAttributes = await this.environmentAttributeRepository!.find({
                    where: {
                        workspaceId,
                        isActive: true
                    }
                })
                
                for (const attribute of workspaceAttributes) {
                    result[attribute.key] = attribute.value
                }
            }
            
            // Cache the result
            if (this.redisClient) {
                const cacheKey = this.getCacheKey('env', envId)
                await this.redisClient.set(cacheKey, JSON.stringify(result), {
                    EX: 300 // Cache for 5 minutes
                })
            }
            
            return result
        } catch (error: any) {
            logger.error(`[AttributeService] Get environment attributes error: ${error.message}`)
            return {}
        }
    }

    /**
     * Delete an environment attribute
     */
    async deleteEnvironmentAttribute(
        key: string,
        organizationId?: string,
        workspaceId?: string
    ): Promise<boolean> {
        try {
            await this.ensureInitialized()
            
            const whereClause: any = { key }
            if (organizationId) whereClause.organizationId = organizationId
            if (workspaceId) whereClause.workspaceId = workspaceId
            
            const result = await this.environmentAttributeRepository!.delete(whereClause)
            
            // Clear cache
            const envId = this.getEnvironmentId(organizationId, workspaceId)
            await this.clearCache('env', envId, key)
            
            return (result.affected ?? 0) > 0
        } catch (error: any) {
            logger.error(`[AttributeService] Delete environment attribute error: ${error.message}`)
            return false
        }
    }

    /**
     * Get environment ID for caching
     */
    private getEnvironmentId(organizationId?: string, workspaceId?: string): string {
        if (workspaceId) {
            return `ws:${workspaceId}`
        } else if (organizationId) {
            return `org:${organizationId}`
        } else {
            return 'global'
        }
    }
}

// Create a singleton instance
const attributeService = new AttributeService()
export default attributeService

// Export the class for use with the service factory
export { AttributeService }