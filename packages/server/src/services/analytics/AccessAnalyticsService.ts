import { getRepository, Between, In, MoreThan, LessThan, FindOptionsWhere } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { AuditLog } from '../../database/entities/AuditLog'
import { AnalyticsMetric, MetricType, TimeGranularity } from '../../database/entities/AnalyticsMetric'
import analyticsService from './AnalyticsService'
import logger from '../../utils/logger'

/**
 * Service for access analytics
 */
class AccessAnalyticsService {
    /**
     * Analyze access patterns
     * @param params Analysis parameters
     * @returns Access pattern analysis
     */
    async analyzeAccessPatterns(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
        granularity: TimeGranularity
    }): Promise<any> {
        try {
            const { startTime, endTime, organizationId, workspaceId, granularity } = params
            
            // Get access trends
            const accessTrends = await analyticsService.getMetricsAggregatedByTime({
                startTime,
                endTime,
                metricType: MetricType.RESOURCE_USAGE,
                metricName: 'resource_access',
                granularity,
                organizationId,
                workspaceId
            })
            
            // Get top resources
            const topResources = await this.getTopResources({
                startTime,
                endTime,
                organizationId,
                workspaceId,
                limit: 10
            })
            
            // Get top users
            const topUsers = await this.getTopUsers({
                startTime,
                endTime,
                organizationId,
                workspaceId,
                limit: 10
            })
            
            // Calculate summary metrics
            const summary = this.calculateAccessSummary({
                accessTrends,
                topResources,
                topUsers
            })
            
            return {
                summary,
                accessTrends,
                topResources,
                topUsers
            }
        } catch (error) {
            logger.error(`[AccessAnalyticsService] analyzeAccessPatterns error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to analyze access patterns')
        }
    }
    
    /**
     * Get top resources
     * @param params Query parameters
     * @returns Top resources
     */
    private async getTopResources(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
        limit?: number
    }): Promise<any[]> {
        try {
            const { startTime, endTime, organizationId, workspaceId, limit = 10 } = params
            const auditLogRepository = getRepository(AuditLog)
            
            // Create metadata condition
            const metadata: Record<string, any> = {}
            
            if (organizationId) {
                metadata.organizationId = organizationId
            }
            
            if (workspaceId) {
                metadata.workspaceId = workspaceId
            }
            
            // Get all resource access logs
            const whereConditions: FindOptionsWhere<AuditLog> = {
                timestamp: Between(startTime, endTime),
                action: In(['read', 'create', 'update', 'delete'])
            }
            
            if (Object.keys(metadata).length > 0) {
                whereConditions.metadata = metadata
            }
            
            const accessLogs = await auditLogRepository.find({
                where: whereConditions,
                select: ['resourceId', 'resourceType', 'action', 'userId', 'timestamp']
            })
            
            // Group by resource
            const resourceAccessMap = new Map<string, {
                resourceId: string
                resourceType: string
                resourceName?: string
                accessCount: number
                uniqueUsers: Set<string>
                lastAccessed: Date
                readCount: number
                writeCount: number
            }>()
            
            for (const log of accessLogs) {
                if (!log.resourceId || !log.resourceType) continue
                
                const resourceKey = `${log.resourceType}:${log.resourceId}`
                
                if (!resourceAccessMap.has(resourceKey)) {
                    resourceAccessMap.set(resourceKey, {
                        resourceId: log.resourceId,
                        resourceType: log.resourceType,
                        resourceName: log.metadata?.resourceName,
                        accessCount: 0,
                        uniqueUsers: new Set(),
                        lastAccessed: log.timestamp,
                        readCount: 0,
                        writeCount: 0
                    })
                }
                
                const resourceAccess = resourceAccessMap.get(resourceKey)!
                resourceAccess.accessCount++
                
                if (log.userId) {
                    resourceAccess.uniqueUsers.add(log.userId)
                }
                
                if (log.timestamp > resourceAccess.lastAccessed) {
                    resourceAccess.lastAccessed = log.timestamp
                }
                
                if (log.action === 'read') {
                    resourceAccess.readCount++
                } else {
                    resourceAccess.writeCount++
                }
            }
            
            // Convert to array and sort by access count
            const topResources = Array.from(resourceAccessMap.values())
                .map(resource => ({
                    ...resource,
                    uniqueUsers: resource.uniqueUsers.size
                }))
                .sort((a, b) => b.accessCount - a.accessCount)
                .slice(0, limit)
            
            return topResources
        } catch (error) {
            logger.error(`[AccessAnalyticsService] getTopResources error: ${error}`)
            return []
        }
    }
    
    /**
     * Get top users
     * @param params Query parameters
     * @returns Top users
     */
    private async getTopUsers(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
        limit?: number
    }): Promise<any[]> {
        try {
            const { startTime, endTime, organizationId, workspaceId, limit = 10 } = params
            const auditLogRepository = getRepository(AuditLog)
            
            // Create metadata condition
            const metadata: Record<string, any> = {}
            
            if (organizationId) {
                metadata.organizationId = organizationId
            }
            
            if (workspaceId) {
                metadata.workspaceId = workspaceId
            }
            
            // Get all resource access logs
            const whereConditions: FindOptionsWhere<AuditLog> = {
                timestamp: Between(startTime, endTime),
                action: In(['read', 'create', 'update', 'delete'])
            }
            
            if (Object.keys(metadata).length > 0) {
                whereConditions.metadata = metadata
            }
            
            const accessLogs = await auditLogRepository.find({
                where: whereConditions,
                select: ['userId', 'resourceId', 'resourceType', 'action', 'timestamp', 'metadata']
            })
            
            // Group by user
            const userAccessMap = new Map<string, {
                userId: string
                userName?: string
                accessCount: number
                uniqueResources: Set<string>
                lastActive: Date
                readCount: number
                writeCount: number
                resourceTypes: Set<string>
            }>()
            
            for (const log of accessLogs) {
                if (!log.userId) continue
                
                if (!userAccessMap.has(log.userId)) {
                    userAccessMap.set(log.userId, {
                        userId: log.userId,
                        userName: log.metadata?.userName,
                        accessCount: 0,
                        uniqueResources: new Set(),
                        lastActive: log.timestamp,
                        readCount: 0,
                        writeCount: 0,
                        resourceTypes: new Set()
                    })
                }
                
                const userAccess = userAccessMap.get(log.userId)!
                userAccess.accessCount++
                
                if (log.resourceId && log.resourceType) {
                    userAccess.uniqueResources.add(`${log.resourceType}:${log.resourceId}`)
                    userAccess.resourceTypes.add(log.resourceType)
                }
                
                if (log.timestamp > userAccess.lastActive) {
                    userAccess.lastActive = log.timestamp
                }
                
                if (log.action === 'read') {
                    userAccess.readCount++
                } else {
                    userAccess.writeCount++
                }
            }
            
            // Convert to array and sort by access count
            const topUsers = Array.from(userAccessMap.values())
                .map(user => ({
                    ...user,
                    uniqueResources: user.uniqueResources.size,
                    resourceTypes: Array.from(user.resourceTypes)
                }))
                .sort((a, b) => b.accessCount - a.accessCount)
                .slice(0, limit)
            
            return topUsers
        } catch (error) {
            logger.error(`[AccessAnalyticsService] getTopUsers error: ${error}`)
            return []
        }
    }
    
    /**
     * Calculate access summary
     * @param params Analysis results
     * @returns Summary metrics
     */
    private calculateAccessSummary(params: {
        accessTrends: any[]
        topResources: any[]
        topUsers: any[]
    }): any {
        try {
            const { accessTrends, topResources, topUsers } = params
            
            // Calculate total access count
            const totalAccessCount = accessTrends.reduce((sum, trend) => sum + trend.sum, 0)
            
            // Calculate average daily access count
            const avgDailyAccessCount = accessTrends.length > 0
                ? Math.round(totalAccessCount / accessTrends.length)
                : 0
            
            // Calculate read/write ratio
            const totalReadCount = topResources.reduce((sum, resource) => sum + resource.readCount, 0)
            const totalWriteCount = topResources.reduce((sum, resource) => sum + resource.writeCount, 0)
            const readWriteRatio = totalWriteCount > 0
                ? Math.round((totalReadCount / totalWriteCount) * 100) / 100
                : 0
            
            // Calculate unique users and resources
            const uniqueUsers = topUsers.length
            const uniqueResources = topResources.length
            
            // Calculate most active resource type
            const resourceTypeCount = new Map<string, number>()
            
            for (const resource of topResources) {
                const count = resourceTypeCount.get(resource.resourceType) || 0
                resourceTypeCount.set(resource.resourceType, count + resource.accessCount)
            }
            
            let mostActiveResourceType = ''
            let mostActiveResourceTypeCount = 0
            
            for (const [resourceType, count] of resourceTypeCount.entries()) {
                if (count > mostActiveResourceTypeCount) {
                    mostActiveResourceType = resourceType
                    mostActiveResourceTypeCount = count
                }
            }
            
            return {
                totalAccessCount,
                avgDailyAccessCount,
                readWriteRatio,
                uniqueUsers,
                uniqueResources,
                mostActiveResourceType
            }
        } catch (error) {
            logger.error(`[AccessAnalyticsService] calculateAccessSummary error: ${error}`)
            return {
                totalAccessCount: 0,
                avgDailyAccessCount: 0,
                readWriteRatio: 0,
                uniqueUsers: 0,
                uniqueResources: 0,
                mostActiveResourceType: ''
            }
        }
    }
    
    /**
     * Get resource usage
     * @param params Query parameters
     * @returns Resource usage
     */
    async getResourceUsage(params: {
        resourceId: string
        resourceType: string
        startTime: Date
        endTime: Date
        granularity: TimeGranularity
    }): Promise<any> {
        try {
            const { resourceId, resourceType, startTime, endTime, granularity } = params
            
            // Get usage trends
            // First get metrics with resource filter
            // Create a parameters object with the required fields
            const metricsParams = {
                startTime,
                endTime,
                metricType: MetricType.RESOURCE_USAGE,
                metricName: 'resource_access',
                granularity,
                resourceId,
                resourceType
            };
            
            // Get metrics for this resource
            const metrics = await analyticsService.getMetrics(metricsParams);
            
            // Then aggregate them by time
            const usageTrends = await analyticsService.getMetricsAggregatedByTime({
                startTime,
                endTime,
                metricType: MetricType.RESOURCE_USAGE,
                metricName: 'resource_access',
                granularity
            })
            
            // Get top users for this resource
            const topUsers = await this.getResourceTopUsers({
                resourceId,
                resourceType,
                startTime,
                endTime,
                limit: 10
            })
            
            // Get access breakdown
            const accessBreakdown = await this.getResourceAccessBreakdown({
                resourceId,
                resourceType,
                startTime,
                endTime
            })
            
            return {
                resourceId,
                resourceType,
                usageTrends,
                topUsers,
                accessBreakdown
            }
        } catch (error) {
            logger.error(`[AccessAnalyticsService] getResourceUsage error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get resource usage')
        }
    }
    
    /**
     * Get top users for a resource
     * @param params Query parameters
     * @returns Top users
     */
    private async getResourceTopUsers(params: {
        resourceId: string
        resourceType: string
        startTime: Date
        endTime: Date
        limit?: number
    }): Promise<any[]> {
        try {
            const { resourceId, resourceType, startTime, endTime, limit = 10 } = params
            const auditLogRepository = getRepository(AuditLog)
            
            // Get all access logs for this resource
            const accessLogs = await auditLogRepository.find({
                where: {
                    timestamp: Between(startTime, endTime),
                    resourceId,
                    resourceType,
                    action: In(['read', 'create', 'update', 'delete'])
                },
                select: ['userId', 'action', 'timestamp', 'metadata']
            })
            
            // Group by user
            const userAccessMap = new Map<string, {
                userId: string
                userName?: string
                accessCount: number
                lastAccessed: Date
                readCount: number
                writeCount: number
            }>()
            
            for (const log of accessLogs) {
                if (!log.userId) continue
                
                if (!userAccessMap.has(log.userId)) {
                    userAccessMap.set(log.userId, {
                        userId: log.userId,
                        userName: log.metadata?.userName,
                        accessCount: 0,
                        lastAccessed: log.timestamp,
                        readCount: 0,
                        writeCount: 0
                    })
                }
                
                const userAccess = userAccessMap.get(log.userId)!
                userAccess.accessCount++
                
                if (log.timestamp > userAccess.lastAccessed) {
                    userAccess.lastAccessed = log.timestamp
                }
                
                if (log.action === 'read') {
                    userAccess.readCount++
                } else {
                    userAccess.writeCount++
                }
            }
            
            // Convert to array and sort by access count
            const topUsers = Array.from(userAccessMap.values())
                .sort((a, b) => b.accessCount - a.accessCount)
                .slice(0, limit)
            
            return topUsers
        } catch (error) {
            logger.error(`[AccessAnalyticsService] getResourceTopUsers error: ${error}`)
            return []
        }
    }
    
    /**
     * Get access breakdown for a resource
     * @param params Query parameters
     * @returns Access breakdown
     */
    private async getResourceAccessBreakdown(params: {
        resourceId: string
        resourceType: string
        startTime: Date
        endTime: Date
    }): Promise<any> {
        try {
            const { resourceId, resourceType, startTime, endTime } = params
            const auditLogRepository = getRepository(AuditLog)
            
            // Get all access logs for this resource
            const accessLogs = await auditLogRepository.find({
                where: {
                    timestamp: Between(startTime, endTime),
                    resourceId,
                    resourceType,
                    action: In(['read', 'create', 'update', 'delete'])
                },
                select: ['action', 'timestamp']
            })
            
            // Count by action
            const actionCounts: Record<string, number> = {
                read: 0,
                create: 0,
                update: 0,
                delete: 0
            }
            
            for (const log of accessLogs) {
                if (log.action === 'read' || log.action === 'create' || log.action === 'update' || log.action === 'delete') {
                    actionCounts[log.action]++
                }
            }
            
            // Calculate percentages
            const totalCount = accessLogs.length
            
            const actionPercentages = {
                read: totalCount > 0 ? Math.round((actionCounts.read / totalCount) * 100) : 0,
                create: totalCount > 0 ? Math.round((actionCounts.create / totalCount) * 100) : 0,
                update: totalCount > 0 ? Math.round((actionCounts.update / totalCount) * 100) : 0,
                delete: totalCount > 0 ? Math.round((actionCounts.delete / totalCount) * 100) : 0
            }
            
            return {
                totalCount,
                actionCounts,
                actionPercentages
            }
        } catch (error) {
            logger.error(`[AccessAnalyticsService] getResourceAccessBreakdown error: ${error}`)
            return {
                totalCount: 0,
                actionCounts: {
                    read: 0,
                    create: 0,
                    update: 0,
                    delete: 0
                },
                actionPercentages: {
                    read: 0,
                    create: 0,
                    update: 0,
                    delete: 0
                }
            }
        }
    }
    
    /**
     * Get user activity
     * @param params Query parameters
     * @returns User activity
     */
    async getUserActivity(params: {
        userId: string
        startTime: Date
        endTime: Date
        granularity: TimeGranularity
    }): Promise<any> {
        try {
            const { userId, startTime, endTime, granularity } = params
            
            // Get activity trends
            // First get metrics with user filter
            const metrics = await analyticsService.getMetrics({
                startTime,
                endTime,
                metricType: MetricType.USER_ACTIVITY,
                metricName: 'user_activity',
                granularity,
                userId
            });
            
            // Then aggregate them by time
            const activityTrends = await analyticsService.getMetricsAggregatedByTime({
                startTime,
                endTime,
                metricType: MetricType.USER_ACTIVITY,
                metricName: 'user_activity',
                granularity
            })
            
            // Get top resources for this user
            const topResources = await this.getUserTopResources({
                userId,
                startTime,
                endTime,
                limit: 10
            })
            
            // Get activity breakdown
            const activityBreakdown = await this.getUserActivityBreakdown({
                userId,
                startTime,
                endTime
            })
            
            return {
                userId,
                activityTrends,
                topResources,
                activityBreakdown
            }
        } catch (error) {
            logger.error(`[AccessAnalyticsService] getUserActivity error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get user activity')
        }
    }
    
    /**
     * Get top resources for a user
     * @param params Query parameters
     * @returns Top resources
     */
    private async getUserTopResources(params: {
        userId: string
        startTime: Date
        endTime: Date
        limit?: number
    }): Promise<any[]> {
        try {
            const { userId, startTime, endTime, limit = 10 } = params
            const auditLogRepository = getRepository(AuditLog)
            
            // Get all access logs for this user
            const accessLogs = await auditLogRepository.find({
                where: {
                    timestamp: Between(startTime, endTime),
                    userId,
                    action: In(['read', 'create', 'update', 'delete'])
                },
                select: ['resourceId', 'resourceType', 'action', 'timestamp', 'metadata']
            })
            
            // Group by resource
            const resourceAccessMap = new Map<string, {
                resourceId: string
                resourceType: string
                resourceName?: string
                accessCount: number
                lastAccessed: Date
                readCount: number
                writeCount: number
            }>()
            
            for (const log of accessLogs) {
                if (!log.resourceId || !log.resourceType) continue
                
                const resourceKey = `${log.resourceType}:${log.resourceId}`
                
                if (!resourceAccessMap.has(resourceKey)) {
                    resourceAccessMap.set(resourceKey, {
                        resourceId: log.resourceId,
                        resourceType: log.resourceType,
                        resourceName: log.metadata?.resourceName,
                        accessCount: 0,
                        lastAccessed: log.timestamp,
                        readCount: 0,
                        writeCount: 0
                    })
                }
                
                const resourceAccess = resourceAccessMap.get(resourceKey)!
                resourceAccess.accessCount++
                
                if (log.timestamp > resourceAccess.lastAccessed) {
                    resourceAccess.lastAccessed = log.timestamp
                }
                
                if (log.action === 'read') {
                    resourceAccess.readCount++
                } else {
                    resourceAccess.writeCount++
                }
            }
            
            // Convert to array and sort by access count
            const topResources = Array.from(resourceAccessMap.values())
                .sort((a, b) => b.accessCount - a.accessCount)
                .slice(0, limit)
            
            return topResources
        } catch (error) {
            logger.error(`[AccessAnalyticsService] getUserTopResources error: ${error}`)
            return []
        }
    }
    
    /**
     * Get activity breakdown for a user
     * @param params Query parameters
     * @returns Activity breakdown
     */
    private async getUserActivityBreakdown(params: {
        userId: string
        startTime: Date
        endTime: Date
    }): Promise<any> {
        try {
            const { userId, startTime, endTime } = params
            const auditLogRepository = getRepository(AuditLog)
            
            // Get all access logs for this user
            const accessLogs = await auditLogRepository.find({
                where: {
                    timestamp: Between(startTime, endTime),
                    userId,
                    action: In(['read', 'create', 'update', 'delete'])
                },
                select: ['action', 'resourceType', 'timestamp']
            })
            
            // Count by action
            const actionCounts: Record<string, number> = {
                read: 0,
                create: 0,
                update: 0,
                delete: 0
            }
            
            for (const log of accessLogs) {
                if (log.action === 'read' || log.action === 'create' || log.action === 'update' || log.action === 'delete') {
                    actionCounts[log.action]++
                }
            }
            
            // Count by resource type
            const resourceTypeCounts = new Map<string, number>()
            
            for (const log of accessLogs) {
                if (!log.resourceType) continue
                
                const count = resourceTypeCounts.get(log.resourceType) || 0
                resourceTypeCounts.set(log.resourceType, count + 1)
            }
            
            // Calculate percentages
            const totalCount = accessLogs.length
            
            const actionPercentages = {
                read: totalCount > 0 ? Math.round((actionCounts.read / totalCount) * 100) : 0,
                create: totalCount > 0 ? Math.round((actionCounts.create / totalCount) * 100) : 0,
                update: totalCount > 0 ? Math.round((actionCounts.update / totalCount) * 100) : 0,
                delete: totalCount > 0 ? Math.round((actionCounts.delete / totalCount) * 100) : 0
            }
            
            const resourceTypePercentages = new Map<string, number>()
            
            for (const [resourceType, count] of resourceTypeCounts.entries()) {
                resourceTypePercentages.set(resourceType, totalCount > 0 ? Math.round((count / totalCount) * 100) : 0)
            }
            
            return {
                totalCount,
                actionCounts,
                actionPercentages,
                resourceTypeCounts: Object.fromEntries(resourceTypeCounts),
                resourceTypePercentages: Object.fromEntries(resourceTypePercentages)
            }
        } catch (error) {
            logger.error(`[AccessAnalyticsService] getUserActivityBreakdown error: ${error}`)
            return {
                totalCount: 0,
                actionCounts: {
                    read: 0,
                    create: 0,
                    update: 0,
                    delete: 0
                },
                actionPercentages: {
                    read: 0,
                    create: 0,
                    update: 0,
                    delete: 0
                },
                resourceTypeCounts: {},
                resourceTypePercentages: {}
            }
        }
    }
}

export default new AccessAnalyticsService()