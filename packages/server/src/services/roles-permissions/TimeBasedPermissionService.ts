import { getRepository } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import logger from '../../utils/logger'
import { TimeBasedPermission, TimeBasedPermissionType } from '../../database/entities/TimeBasedPermission'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { createClient } from 'redis'
import config from '../../config'

/**
 * Service for managing time-based permissions
 */
export class TimeBasedPermissionService {
    private timeBasedPermissionRepository: any
    private redisClient: any

    /**
     * Constructor
     */
    constructor() {
        const appServer = getRunningExpressApp()
        this.timeBasedPermissionRepository = appServer.AppDataSource.getRepository(TimeBasedPermission)
        
        // Initialize Redis client if needed
        // this.initializeRedisClient()
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
                logger.error(`[TimeBasedPermissionService] Redis client error: ${err.message}`)
            })
        } catch (error: any) {
            logger.error(`[TimeBasedPermissionService] Redis client initialization error: ${error.message}`)
        }
    }

    /**
     * Get cache key for time-based permissions
     */
    private getCacheKey(userId: string, permissionId?: string, resourceType?: string, resourceId?: string): string {
        if (permissionId && resourceType && resourceId) {
            return `time_based_permission:${userId}:${permissionId}:${resourceType}:${resourceId}`
        } else if (permissionId) {
            return `time_based_permission:${userId}:${permissionId}`
        } else {
            return `time_based_permissions:${userId}`
        }
    }

    /**
     * Clear cache for time-based permissions
     */
    private async clearCache(userId: string, permissionId?: string, resourceType?: string, resourceId?: string): Promise<void> {
        if (!this.redisClient) return

        try {
            if (permissionId && resourceType && resourceId) {
                // Clear specific time-based permission
                await this.redisClient.del(this.getCacheKey(userId, permissionId, resourceType, resourceId))
            } else if (permissionId) {
                // Clear all time-based permissions for a specific permission
                const pattern = this.getCacheKey(userId, permissionId, '*', '*')
                const keys = await this.redisClient.keys(pattern)
                if (keys.length > 0) {
                    await this.redisClient.del(keys)
                }
            } else {
                // Clear all time-based permissions for user
                const pattern = this.getCacheKey(userId, '*')
                const keys = await this.redisClient.keys(pattern)
                if (keys.length > 0) {
                    await this.redisClient.del(keys)
                }
            }
        } catch (error: any) {
            logger.error(`[TimeBasedPermissionService] Clear cache error: ${error.message}`)
        }
    }

    /**
     * Create a time-based permission
     */
    async createTimeBasedPermission(timeBasedPermission: Partial<TimeBasedPermission>): Promise<TimeBasedPermission> {
        try {
            // Validate time-based permission
            this.validateTimeBasedPermission(timeBasedPermission)
            
            const newPermission = this.timeBasedPermissionRepository.create(timeBasedPermission)
            const result = await this.timeBasedPermissionRepository.save(newPermission)
            
            // Clear cache
            if (timeBasedPermission.userId) {
                await this.clearCache(
                    timeBasedPermission.userId,
                    timeBasedPermission.permissionId,
                    timeBasedPermission.resourceType,
                    timeBasedPermission.resourceId
                )
            }
            
            return result
        } catch (error: any) {
            if (error instanceof InternalFastflowError) throw error
            
            logger.error(`[TimeBasedPermissionService] Create time-based permission error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to create time-based permission: ${error.message}`
            )
        }
    }

    /**
     * Get a time-based permission by ID
     */
    async getTimeBasedPermissionById(id: string): Promise<TimeBasedPermission> {
        try {
            const timeBasedPermission = await this.timeBasedPermissionRepository.findOne({
                where: { id },
                relations: ['permission']
            })
            
            if (!timeBasedPermission) {
                throw new InternalFastflowError(
                    StatusCodes.NOT_FOUND,
                    `Time-based permission with ID ${id} not found`
                )
            }
            
            return timeBasedPermission
        } catch (error: any) {
            if (error instanceof InternalFastflowError) throw error
            
            logger.error(`[TimeBasedPermissionService] Get time-based permission error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to get time-based permission: ${error.message}`
            )
        }
    }

    /**
     * Get time-based permissions for a user
     */
    async getTimeBasedPermissionsForUser(userId: string): Promise<TimeBasedPermission[]> {
        try {
            // Check cache first
            if (this.redisClient) {
                const cacheKey = this.getCacheKey(userId)
                const cachedPermissions = await this.redisClient.get(cacheKey)
                
                if (cachedPermissions) {
                    return JSON.parse(cachedPermissions)
                }
            }
            
            const timeBasedPermissions = await this.timeBasedPermissionRepository.find({
                where: {
                    userId,
                    isActive: true
                },
                relations: ['permission']
            })
            
            // Cache the result
            if (this.redisClient) {
                const cacheKey = this.getCacheKey(userId)
                await this.redisClient.set(cacheKey, JSON.stringify(timeBasedPermissions), {
                    EX: 300 // Cache for 5 minutes
                })
            }
            
            return timeBasedPermissions
        } catch (error: any) {
            logger.error(`[TimeBasedPermissionService] Get time-based permissions for user error: ${error.message}`)
            return []
        }
    }

    /**
     * Get time-based permissions for a specific permission
     */
    async getTimeBasedPermissionsForPermission(
        userId: string,
        permissionId: string,
        resourceType?: string,
        resourceId?: string
    ): Promise<TimeBasedPermission[]> {
        try {
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
            
            const timeBasedPermissions = await this.timeBasedPermissionRepository.find({
                where: whereClause,
                relations: ['permission']
            })
            
            // Cache the result
            if (this.redisClient) {
                const cacheKey = this.getCacheKey(userId, permissionId, resourceType, resourceId)
                await this.redisClient.set(cacheKey, JSON.stringify(timeBasedPermissions), {
                    EX: 300 // Cache for 5 minutes
                })
            }
            
            return timeBasedPermissions
        } catch (error: any) {
            logger.error(`[TimeBasedPermissionService] Get time-based permissions for permission error: ${error.message}`)
            return []
        }
    }

    /**
     * Update a time-based permission
     */
    async updateTimeBasedPermission(
        id: string,
        updates: Partial<TimeBasedPermission>
    ): Promise<TimeBasedPermission> {
        try {
            const timeBasedPermission = await this.getTimeBasedPermissionById(id)
            
            // Validate updates
            if (updates.startTime || updates.endTime || updates.schedule) {
                this.validateTimeBasedPermission({
                    ...timeBasedPermission,
                    ...updates
                })
            }
            
            Object.assign(timeBasedPermission, updates)
            const result = await this.timeBasedPermissionRepository.save(timeBasedPermission)
            
            // Clear cache
            if (timeBasedPermission.userId) {
                await this.clearCache(
                    timeBasedPermission.userId,
                    timeBasedPermission.permissionId,
                    timeBasedPermission.resourceType,
                    timeBasedPermission.resourceId
                )
            }
            
            return result
        } catch (error: any) {
            if (error instanceof InternalFastflowError) throw error
            
            logger.error(`[TimeBasedPermissionService] Update time-based permission error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to update time-based permission: ${error.message}`
            )
        }
    }

    /**
     * Delete a time-based permission
     */
    async deleteTimeBasedPermission(id: string): Promise<void> {
        try {
            const timeBasedPermission = await this.getTimeBasedPermissionById(id)
            
            await this.timeBasedPermissionRepository.delete(id)
            
            // Clear cache
            if (timeBasedPermission.userId) {
                await this.clearCache(
                    timeBasedPermission.userId,
                    timeBasedPermission.permissionId,
                    timeBasedPermission.resourceType,
                    timeBasedPermission.resourceId
                )
            }
        } catch (error: any) {
            if (error instanceof InternalFastflowError) throw error
            
            logger.error(`[TimeBasedPermissionService] Delete time-based permission error: ${error.message}`)
            throw new InternalFastflowError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to delete time-based permission: ${error.message}`
            )
        }
    }

    /**
     * Check if a user has a time-based permission
     */
    async hasTimeBasedPermission(
        userId: string,
        permissionId: string,
        resourceType?: string,
        resourceId?: string
    ): Promise<boolean> {
        try {
            // Get all time-based permissions for this user and permission
            const timeBasedPermissions = await this.getTimeBasedPermissionsForPermission(
                userId,
                permissionId,
                resourceType,
                resourceId
            )
            
            if (timeBasedPermissions.length === 0) {
                return false
            }
            
            const now = new Date()
            
            // Check each time-based permission
            for (const timeBasedPermission of timeBasedPermissions) {
                // Skip inactive permissions
                if (!timeBasedPermission.isActive) {
                    continue
                }
                
                // Check if the permission is currently valid based on time constraints
                if (this.isPermissionActive(timeBasedPermission, now)) {
                    return true
                }
            }
            
            return false
        } catch (error: any) {
            logger.error(`[TimeBasedPermissionService] Check time-based permission error: ${error.message}`)
            return false
        }
    }

    /**
     * Batch check time-based permissions
     */
    async batchCheckTimeBasedPermissions(
        userId: string,
        permissionIds: string[],
        resourceType?: string,
        resourceId?: string
    ): Promise<Record<string, boolean>> {
        try {
            const result: Record<string, boolean> = {}
            
            // Initialize all permissions as false
            for (const permissionId of permissionIds) {
                result[permissionId] = false
            }
            
            // Get all time-based permissions for this user
            const timeBasedPermissions = await this.getTimeBasedPermissionsForUser(userId)
            
            if (timeBasedPermissions.length === 0) {
                return result
            }
            
            const now = new Date()
            
            // Group time-based permissions by permissionId
            const permissionMap: Record<string, TimeBasedPermission[]> = {}
            
            for (const timeBasedPermission of timeBasedPermissions) {
                if (!permissionIds.includes(timeBasedPermission.permissionId)) {
                    continue
                }
                
                // Skip if resource type/id doesn't match
                if (resourceType && timeBasedPermission.resourceType && 
                    timeBasedPermission.resourceType !== resourceType) {
                    continue
                }
                
                if (resourceId && timeBasedPermission.resourceId && 
                    timeBasedPermission.resourceId !== resourceId) {
                    continue
                }
                
                if (!permissionMap[timeBasedPermission.permissionId]) {
                    permissionMap[timeBasedPermission.permissionId] = []
                }
                
                permissionMap[timeBasedPermission.permissionId].push(timeBasedPermission)
            }
            
            // Check each permission
            for (const permissionId of permissionIds) {
                const permissions = permissionMap[permissionId] || []
                
                for (const timeBasedPermission of permissions) {
                    // Skip inactive permissions
                    if (!timeBasedPermission.isActive) {
                        continue
                    }
                    
                    // Check if the permission is currently valid based on time constraints
                    if (this.isPermissionActive(timeBasedPermission, now)) {
                        result[permissionId] = true
                        break // No need to check other time-based permissions for this permission
                    }
                }
            }
            
            return result
        } catch (error: any) {
            logger.error(`[TimeBasedPermissionService] Batch check time-based permissions error: ${error.message}`)
            
            // Return all permissions as false on error
            const result: Record<string, boolean> = {}
            for (const permissionId of permissionIds) {
                result[permissionId] = false
            }
            return result
        }
    }

    /**
     * Check if a time-based permission is currently active
     */
    private isPermissionActive(permission: TimeBasedPermission, now: Date): boolean {
        try {
            // Check if the permission is active
            if (!permission.isActive) {
                return false
            }
            
            // Check start time
            if (permission.startTime && now < permission.startTime) {
                return false
            }
            
            // Check end time
            if (permission.endTime && now > permission.endTime) {
                return false
            }
            
            // Check schedule for recurring permissions
            if (permission.type === TimeBasedPermissionType.RECURRING && permission.schedule) {
                return this.checkSchedule(permission.schedule, now)
            }
            
            return true
        } catch (error: any) {
            logger.error(`[TimeBasedPermissionService] Check permission active error: ${error.message}`)
            return false
        }
    }

    /**
     * Check if a date matches a schedule
     */
    private checkSchedule(schedule: any, date: Date): boolean {
        try {
            const { days, hours, months, daysOfMonth } = schedule
            
            // Check day of week (0 = Sunday, 1 = Monday, etc.)
            if (Array.isArray(days) && days.length > 0) {
                if (!days.includes(date.getDay())) {
                    return false
                }
            }
            
            // Check hour of day (0-23)
            if (Array.isArray(hours) && hours.length > 0) {
                if (!hours.includes(date.getHours())) {
                    return false
                }
            }
            
            // Check month (0 = January, 11 = December)
            if (Array.isArray(months) && months.length > 0) {
                if (!months.includes(date.getMonth())) {
                    return false
                }
            }
            
            // Check day of month (1-31)
            if (Array.isArray(daysOfMonth) && daysOfMonth.length > 0) {
                if (!daysOfMonth.includes(date.getDate())) {
                    return false
                }
            }
            
            return true
        } catch (error: any) {
            logger.error(`[TimeBasedPermissionService] Check schedule error: ${error.message}`)
            return false
        }
    }

    /**
     * Validate a time-based permission
     */
    private validateTimeBasedPermission(permission: Partial<TimeBasedPermission>): void {
        // Check required fields
        if (!permission.userId) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'User ID is required'
            )
        }
        
        if (!permission.permissionId) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'Permission ID is required'
            )
        }
        
        if (!permission.startTime) {
            throw new InternalFastflowError(
                StatusCodes.BAD_REQUEST,
                'Start time is required'
            )
        }
        
        // Validate time window
        if (permission.startTime && permission.endTime) {
            const startTime = new Date(permission.startTime)
            const endTime = new Date(permission.endTime)
            
            if (startTime >= endTime) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'End time must be after start time'
                )
            }
        }
        
        // Validate schedule for recurring permissions
        if (permission.type === TimeBasedPermissionType.RECURRING) {
            if (!permission.schedule) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Schedule is required for recurring permissions'
                )
            }
            
            // Validate schedule format
            const { days, hours, months, daysOfMonth } = permission.schedule || {}
            
            if (!days && !hours && !months && !daysOfMonth) {
                throw new InternalFastflowError(
                    StatusCodes.BAD_REQUEST,
                    'Schedule must include at least one time constraint (days, hours, months, or daysOfMonth)'
                )
            }
            
            // Validate days (0-6)
            if (days && Array.isArray(days)) {
                for (const day of days) {
                    if (day < 0 || day > 6) {
                        throw new InternalFastflowError(
                            StatusCodes.BAD_REQUEST,
                            'Days must be between 0 and 6 (0 = Sunday, 6 = Saturday)'
                        )
                    }
                }
            }
            
            // Validate hours (0-23)
            if (hours && Array.isArray(hours)) {
                for (const hour of hours) {
                    if (hour < 0 || hour > 23) {
                        throw new InternalFastflowError(
                            StatusCodes.BAD_REQUEST,
                            'Hours must be between 0 and 23'
                        )
                    }
                }
            }
            
            // Validate months (0-11)
            if (months && Array.isArray(months)) {
                for (const month of months) {
                    if (month < 0 || month > 11) {
                        throw new InternalFastflowError(
                            StatusCodes.BAD_REQUEST,
                            'Months must be between 0 and 11 (0 = January, 11 = December)'
                        )
                    }
                }
            }
            
            // Validate days of month (1-31)
            if (daysOfMonth && Array.isArray(daysOfMonth)) {
                for (const day of daysOfMonth) {
                    if (day < 1 || day > 31) {
                        throw new InternalFastflowError(
                            StatusCodes.BAD_REQUEST,
                            'Days of month must be between 1 and 31'
                        )
                    }
                }
            }
        }
    }

    /**
     * Clean up expired time-based permissions
     */
    async cleanupExpiredPermissions(): Promise<number> {
        try {
            const now = new Date()
            
            // Find expired temporary permissions
            const result = await this.timeBasedPermissionRepository.update(
                {
                    type: TimeBasedPermissionType.TEMPORARY,
                    endTime: { $lt: now },
                    isActive: true
                },
                {
                    isActive: false
                }
            )
            
            return result.affected || 0
        } catch (error: any) {
            logger.error(`[TimeBasedPermissionService] Cleanup expired permissions error: ${error.message}`)
            return 0
        }
    }
}

export const timeBasedPermissionService = new TimeBasedPermissionService()
export default timeBasedPermissionService