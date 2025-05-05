import { Repository } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import logger from '../../utils/logger'
import { ConditionalPermission } from '../../database/entities/ConditionalPermission'
import permissionExpressionService from './PermissionExpressionService'
import { createClient } from 'redis'
import config from '../../config'
import { getInitializedDataSource } from '../../DataSource'

/**
 * Service for managing conditional permissions
 */
class ConditionalPermissionService {
    private conditionalPermissionRepository: Repository<ConditionalPermission> | null = null
    private redisClient: any
    private isInitialized: boolean = false

    /**
     * Constructor
     */
    constructor() {
        // Repositories will be initialized lazily when needed
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
            this.conditionalPermissionRepository = dataSource.getRepository(ConditionalPermission)
            
            // Mark as initialized
            this.isInitialized = true
        } catch (error) {
            logger.error('Failed to initialize ConditionalPermissionService repositories', error)
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
                logger.error(`[ConditionalPermissionService] Redis client error: ${err.message}`)
            })
        } catch (error: any) {
            logger.error(`[ConditionalPermissionService] Redis client initialization error: ${error.message}`)
        }
    }

    /**
     * Get cache key for conditional permissions
     */
    private getCacheKey(userId: string, permissionId?: string, resourceType?: string, resourceId?: string): string {
        if (permissionId && resourceType && resourceId) {
            return `conditional_permission:${userId}:${permissionId}:${resourceType}:${resourceId}`
        } else if (permissionId) {
            return `conditional_permission:${userId}:${permissionId}`
        } else {
            return `conditional_permissions:${userId}`
        }
    }

    /**
     * Clear cache for conditional permissions
     */
    private async clearCache(userId: string, permissionId?: string, resourceType?: string, resourceId?: string): Promise<void> {
        if (!this.redisClient) return

        try {
            if (permissionId && resourceType && resourceId) {
                // Clear specific conditional permission
                await this.redisClient.del(this.getCacheKey(userId, permissionId, resourceType, resourceId))
            } else if (permissionId) {
                // Clear all conditional permissions for a specific permission
                const pattern = this.getCacheKey(userId, permissionId, '*', '*')
                const keys = await this.redisClient.keys(pattern)
                if (keys.length > 0) {
                    await this.redisClient.del(keys)
                }
            } else {
                // Clear all conditional permissions for user
                const pattern = this.getCacheKey(userId, '*')
                const keys = await this.redisClient.keys(pattern)
                if (keys.length > 0) {
                    await this.redisClient.del(keys)
                }
            }
        } catch (error: any) {
            logger.error(`[ConditionalPermissionService] Clear cache error: ${error.message}`)
        }
    }

    /**
     * Create a conditional permission
     */
    async createConditionalPermission(conditionalPermission: Partial<ConditionalPermission>): Promise<ConditionalPermission> {
        try {
            await this.ensureInitialized()
            
            const newPermission = this.conditionalPermissionRepository!.create(conditionalPermission)
            const result = await this.conditionalPermissionRepository!.save(newPermission)
            
            // Clear cache
            if (conditionalPermission.userId) {
                await this.clearCache(
                    conditionalPermission.userId,
                    conditionalPermission.permissionId,
                    conditionalPermission.resourceType,
                    conditionalPermission.resourceId
                )
            }
            
            return result
        } catch (error: any) {
            logger.error(`[ConditionalPermissionService] Create conditional permission error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to create conditional permission: ${error.message}`
            )
        }
    }

    /**
     * Get a conditional permission by ID
     */
    async getConditionalPermissionById(id: string): Promise<ConditionalPermission> {
        try {
            await this.ensureInitialized()
            
            const conditionalPermission = await this.conditionalPermissionRepository!.findOne({
                where: { id },
                relations: ['permission', 'expression']
            })
            
            if (!conditionalPermission) {
                throw new InternalFastflowError(
                    StatusCodes.NOT_FOUND,
                    `Conditional permission with ID ${id} not found`
                )
            }
            
            return conditionalPermission
        } catch (error: any) {
            if (error instanceof InternalFastflowError) throw error
            
            logger.error(`[ConditionalPermissionService] Get conditional permission error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to get conditional permission: ${error.message}`
            )
        }
    }

    /**
     * Get conditional permissions for a user
     */
    async getConditionalPermissionsForUser(userId: string): Promise<ConditionalPermission[]> {
        try {
            await this.ensureInitialized()
            // Check cache first
            if (this.redisClient) {
                const cacheKey = this.getCacheKey(userId)
                const cachedPermissions = await this.redisClient.get(cacheKey)
                
                if (cachedPermissions) {
                    return JSON.parse(cachedPermissions)
                }
            }
            
            const conditionalPermissions = await this.conditionalPermissionRepository!.find({
                where: {
                    userId,
                    isActive: true
                },
                relations: ['permission', 'expression']
            })
            
            // Cache the result
            if (this.redisClient) {
                const cacheKey = this.getCacheKey(userId)
                await this.redisClient.set(cacheKey, JSON.stringify(conditionalPermissions), {
                    EX: 300 // Cache for 5 minutes
                })
            }
            
            return conditionalPermissions
        } catch (error: any) {
            logger.error(`[ConditionalPermissionService] Get conditional permissions for user error: ${error.message}`)
            return []
        }
    }

    /**
     * Get conditional permissions for a specific permission
     */
    async getConditionalPermissionsForPermission(
        userId: string,
        permissionId: string,
        resourceType?: string,
        resourceId?: string
    ): Promise<ConditionalPermission[]> {
        try {
            await this.ensureInitialized()
            // Check cache first
            if (this.redisClient) {
                const cacheKey = this.getCacheKey(userId, permissionId, resourceType, resourceId)
                const cachedPermissions = await this.redisClient.get(cacheKey)
                
                if (cachedPermissions) {
                    return JSON.parse(cachedPermissions)
                }
            }
            
            const whereClause: any = {
                userId,
                permissionId,
                isActive: true
            }
            
            if (resourceType) whereClause.resourceType = resourceType
            if (resourceId) whereClause.resourceId = resourceId
            
            const conditionalPermissions = await this.conditionalPermissionRepository!.find({
                where: whereClause,
                relations: ['permission', 'expression']
            })
            
            // Cache the result
            if (this.redisClient) {
                const cacheKey = this.getCacheKey(userId, permissionId, resourceType, resourceId)
                await this.redisClient.set(cacheKey, JSON.stringify(conditionalPermissions), {
                    EX: 300 // Cache for 5 minutes
                })
            }
            
            return conditionalPermissions
        } catch (error: any) {
            logger.error(`[ConditionalPermissionService] Get conditional permissions for permission error: ${error.message}`)
            return []
        }
    }

    /**
     * Update a conditional permission
     */
    async updateConditionalPermission(
        id: string,
        updates: Partial<ConditionalPermission>
    ): Promise<ConditionalPermission> {
        try {
            await this.ensureInitialized()
            const conditionalPermission = await this.getConditionalPermissionById(id)
            
            Object.assign(conditionalPermission, updates)
            const result = await this.conditionalPermissionRepository!.save(conditionalPermission)
            
            // Clear cache
            if (conditionalPermission.userId) {
                await this.clearCache(
                    conditionalPermission.userId,
                    conditionalPermission.permissionId,
                    conditionalPermission.resourceType,
                    conditionalPermission.resourceId
                )
            }
            
            return result
        } catch (error: any) {
            if (error instanceof InternalFastflowError) throw error
            
            logger.error(`[ConditionalPermissionService] Update conditional permission error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to update conditional permission: ${error.message}`
            )
        }
    }

    /**
     * Delete a conditional permission
     */
    async deleteConditionalPermission(id: string): Promise<void> {
        try {
            await this.ensureInitialized()
            const conditionalPermission = await this.getConditionalPermissionById(id)
            
            await this.conditionalPermissionRepository!.delete(id)
            
            // Clear cache
            if (conditionalPermission.userId) {
                await this.clearCache(
                    conditionalPermission.userId,
                    conditionalPermission.permissionId,
                    conditionalPermission.resourceType,
                    conditionalPermission.resourceId
                )
            }
        } catch (error: any) {
            if (error instanceof InternalFastflowError) throw error
            
            logger.error(`[ConditionalPermissionService] Delete conditional permission error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to delete conditional permission: ${error.message}`
            )
        }
    }

    /**
     * Check if a user has a conditional permission
     */
    async hasConditionalPermission(
        userId: string,
        permissionId: string,
        context: {
            resourceType?: string,
            resourceId?: string,
            organizationId?: string,
            workspaceId?: string,
            [key: string]: any
        }
    ): Promise<boolean> {
        try {
            const { resourceType, resourceId } = context
            
            // Get all conditional permissions for this user and permission
            const conditionalPermissions = await this.getConditionalPermissionsForPermission(
                userId,
                permissionId,
                resourceType,
                resourceId
            )
            
            if (conditionalPermissions.length === 0) {
                return false
            }
            
            // Check each conditional permission
            for (const conditionalPermission of conditionalPermissions) {
                // Skip inactive permissions
                if (!conditionalPermission.isActive) {
                    continue
                }
                
                // Evaluate the expression
                const expressionResult = await permissionExpressionService.evaluateExpressionObject(
                    conditionalPermission.expression,
                    {
                        userId,
                        ...context
                    }
                )
                
                if (expressionResult) {
                    return true
                }
            }
            
            return false
        } catch (error: any) {
            logger.error(`[ConditionalPermissionService] Check conditional permission error: ${error.message}`)
            return false
        }
    }

    /**
     * Batch check conditional permissions
     */
    async batchCheckConditionalPermissions(
        userId: string,
        permissionIds: string[],
        context: {
            resourceType?: string,
            resourceId?: string,
            organizationId?: string,
            workspaceId?: string,
            [key: string]: any
        }
    ): Promise<Record<string, boolean>> {
        try {
            const result: Record<string, boolean> = {}
            
            // Initialize all permissions as false
            for (const permissionId of permissionIds) {
                result[permissionId] = false
            }
            
            // Get all conditional permissions for this user
            const conditionalPermissions = await this.getConditionalPermissionsForUser(userId)
            
            if (conditionalPermissions.length === 0) {
                return result
            }
            
            // Group conditional permissions by permissionId
            const permissionMap: Record<string, ConditionalPermission[]> = {}
            
            for (const conditionalPermission of conditionalPermissions) {
                if (!permissionIds.includes(conditionalPermission.permissionId)) {
                    continue
                }
                
                if (!permissionMap[conditionalPermission.permissionId]) {
                    permissionMap[conditionalPermission.permissionId] = []
                }
                
                permissionMap[conditionalPermission.permissionId].push(conditionalPermission)
            }
            
            // Check each permission
            for (const permissionId of permissionIds) {
                const permissions = permissionMap[permissionId] || []
                
                for (const conditionalPermission of permissions) {
                    // Skip inactive permissions
                    if (!conditionalPermission.isActive) {
                        continue
                    }
                    
                    // Skip if resource type/id doesn't match
                    if (conditionalPermission.resourceType && context.resourceType && 
                        conditionalPermission.resourceType !== context.resourceType) {
                        continue
                    }
                    
                    if (conditionalPermission.resourceId && context.resourceId && 
                        conditionalPermission.resourceId !== context.resourceId) {
                        continue
                    }
                    
                    // Evaluate the expression
                    const expressionResult = await permissionExpressionService.evaluateExpressionObject(
                        conditionalPermission.expression,
                        {
                            userId,
                            ...context
                        }
                    )
                    
                    if (expressionResult) {
                        result[permissionId] = true
                        break // No need to check other conditions for this permission
                    }
                }
            }
            
            return result
        } catch (error: any) {
            logger.error(`[ConditionalPermissionService] Batch check conditional permissions error: ${error.message}`)
            
            // Return all permissions as false on error
            const result: Record<string, boolean> = {}
            for (const permissionId of permissionIds) {
                result[permissionId] = false
            }
            return result
        }
    }
}

// Create a singleton instance
const conditionalPermissionService = new ConditionalPermissionService()
export default conditionalPermissionService

// Export the class for use with the service factory
export { ConditionalPermissionService }