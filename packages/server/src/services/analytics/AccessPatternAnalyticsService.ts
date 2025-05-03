import { getRepository, Between, In, MoreThan, LessThan } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { AuditLog } from '../../database/entities/AuditLog'
import { AnalyticsMetric, MetricType, TimeGranularity } from '../../database/entities/AnalyticsMetric'
import { AnalyticsAlert, AlertType, AlertSeverity } from '../../database/entities/AnalyticsAlert'
import analyticsService from './AnalyticsService'
import logger from '../../utils/logger'

/**
 * Service for access pattern analytics
 */
class AccessPatternAnalyticsService {
    /**
     * Analyze access patterns
     * @param params Analysis parameters
     * @returns Access pattern analytics
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
            const metrics: AnalyticsMetric[] = []

            // Generate access metrics
            const accessMetrics = await this.generateAccessMetrics(params)
            metrics.push(...accessMetrics)

            // Generate resource usage metrics
            const resourceUsageMetrics = await this.generateResourceUsageMetrics(params)
            metrics.push(...resourceUsageMetrics)

            // Generate user activity metrics
            const userActivityMetrics = await this.generateUserActivityMetrics(params)
            metrics.push(...userActivityMetrics)

            // Prepare response data
            const accessPatternData = {
                metrics,
                summary: await this.generateAccessSummary(params),
                topResources: await this.getTopResources(params),
                topUsers: await this.getTopUsers(params),
                accessTrends: await analyticsService.getMetricsAggregatedByTime({
                    startTime,
                    endTime,
                    metricType: MetricType.ACCESS_PATTERN,
                    metricName: 'access_count',
                    granularity,
                    organizationId,
                    workspaceId
                })
            }

            return accessPatternData
        } catch (error) {
            logger.error(`[AccessPatternAnalyticsService] analyzeAccessPatterns error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to analyze access patterns')
        }
    }

    /**
     * Generate access metrics
     * @param params Analysis parameters
     * @returns Access metrics
     */
    private async generateAccessMetrics(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
        granularity: TimeGranularity
    }): Promise<AnalyticsMetric[]> {
        try {
            const { startTime, endTime, organizationId, workspaceId, granularity } = params
            const auditLogRepository = getRepository(AuditLog)
            const metrics: AnalyticsMetric[] = []

            // Define access actions
            const accessActions = [
                'resource_access',
                'page_view',
                'api_call',
                'login',
                'logout'
            ]

            // Build where conditions for access logs
            const whereConditions: any = {
                timestamp: Between(startTime, endTime),
                action: In(accessActions)
            }

            if (organizationId) {
                whereConditions.metadata = { organizationId }
            }

            if (workspaceId) {
                whereConditions.metadata = { ...whereConditions.metadata, workspaceId }
            }

            // Get access logs
            const accessLogs = await auditLogRepository.find({
                where: whereConditions
            })

            if (accessLogs.length === 0) {
                return metrics
            }

            // Create overall access metric
            const overallMetric = await analyticsService.recordMetric({
                metricType: MetricType.ACCESS_PATTERN,
                metricName: 'access_count',
                value: accessLogs.length,
                granularity,
                timestamp: new Date(),
                organizationId,
                workspaceId,
                dimensions: {
                    uniqueUsers: new Set(accessLogs.filter(log => log.userId).map(log => log.userId)).size,
                    uniqueResources: new Set(accessLogs.filter(log => log.resourceId).map(log => log.resourceId)).size
                }
            })

            metrics.push(overallMetric)

            // Group logs by action
            const actionMap = new Map<string, AuditLog[]>()
            
            for (const log of accessLogs) {
                if (!actionMap.has(log.action)) {
                    actionMap.set(log.action, [])
                }
                actionMap.get(log.action)!.push(log)
            }
            
            // Create metrics for each action
            for (const [action, actionLogs] of actionMap.entries()) {
                const metric = await analyticsService.recordMetric({
                    metricType: MetricType.ACCESS_PATTERN,
                    metricName: `${action}_count`,
                    value: actionLogs.length,
                    granularity,
                    timestamp: new Date(),
                    organizationId,
                    workspaceId,
                    dimensions: {
                        action,
                        count: actionLogs.length,
                        uniqueUsers: new Set(actionLogs.filter(log => log.userId).map(log => log.userId)).size,
                        uniqueResources: new Set(actionLogs.filter(log => log.resourceId).map(log => log.resourceId)).size
                    }
                })
                
                metrics.push(metric)
            }

            return metrics
        } catch (error) {
            logger.error(`[AccessPatternAnalyticsService] generateAccessMetrics error: ${error}`)
            return []
        }
    }

    /**
     * Generate resource usage metrics
     * @param params Analysis parameters
     * @returns Resource usage metrics
     */
    private async generateResourceUsageMetrics(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
        granularity: TimeGranularity
    }): Promise<AnalyticsMetric[]> {
        try {
            const { startTime, endTime, organizationId, workspaceId, granularity } = params
            const auditLogRepository = getRepository(AuditLog)
            const metrics: AnalyticsMetric[] = []

            // Build where conditions for resource access logs
            const whereConditions: any = {
                timestamp: Between(startTime, endTime),
                action: 'resource_access'
            }

            if (organizationId) {
                whereConditions.metadata = { organizationId }
            }

            if (workspaceId) {
                whereConditions.metadata = { ...whereConditions.metadata, workspaceId }
            }

            // Get resource access logs
            const resourceLogs = await auditLogRepository.find({
                where: whereConditions
            })

            if (resourceLogs.length === 0) {
                return metrics
            }

            // Group logs by resource type
            const resourceTypeMap = new Map<string, AuditLog[]>()
            
            for (const log of resourceLogs) {
                if (log.resourceType) {
                    if (!resourceTypeMap.has(log.resourceType)) {
                        resourceTypeMap.set(log.resourceType, [])
                    }
                    resourceTypeMap.get(log.resourceType)!.push(log)
                }
            }
            
            // Create metrics for each resource type
            for (const [resourceType, typeLogs] of resourceTypeMap.entries()) {
                const metric = await analyticsService.recordMetric({
                    metricType: MetricType.ACCESS_PATTERN,
                    metricName: 'resource_usage_by_type',
                    value: typeLogs.length,
                    granularity,
                    timestamp: new Date(),
                    organizationId,
                    workspaceId,
                    dimensions: {
                        resourceType,
                        count: typeLogs.length,
                        uniqueUsers: new Set(typeLogs.filter(log => log.userId).map(log => log.userId)).size,
                        uniqueResources: new Set(typeLogs.filter(log => log.resourceId).map(log => log.resourceId)).size
                    }
                })
                
                metrics.push(metric)
            }

            // Group logs by specific resource
            const resourceMap = new Map<string, AuditLog[]>()
            
            for (const log of resourceLogs) {
                if (log.resourceId) {
                    const resourceKey = `${log.resourceType || 'unknown'}:${log.resourceId}`
                    if (!resourceMap.has(resourceKey)) {
                        resourceMap.set(resourceKey, [])
                    }
                    resourceMap.get(resourceKey)!.push(log)
                }
            }
            
            // Create metrics for top resources
            const topResources = Array.from(resourceMap.entries())
                .sort((a, b) => b[1].length - a[1].length)
                .slice(0, 10)

            for (const [resourceKey, logs] of topResources) {
                const [resourceType, resourceId] = resourceKey.split(':')
                
                const metric = await analyticsService.recordMetric({
                    metricType: MetricType.ACCESS_PATTERN,
                    metricName: 'resource_usage',
                    value: logs.length,
                    granularity,
                    timestamp: new Date(),
                    organizationId,
                    workspaceId,
                    dimensions: {
                        resourceType,
                        resourceId,
                        count: logs.length,
                        uniqueUsers: new Set(logs.filter(log => log.userId).map(log => log.userId)).size
                    }
                })
                
                metrics.push(metric)
            }

            return metrics
        } catch (error) {
            logger.error(`[AccessPatternAnalyticsService] generateResourceUsageMetrics error: ${error}`)
            return []
        }
    }

    /**
     * Generate user activity metrics
     * @param params Analysis parameters
     * @returns User activity metrics
     */
    private async generateUserActivityMetrics(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
        granularity: TimeGranularity
    }): Promise<AnalyticsMetric[]> {
        try {
            const { startTime, endTime, organizationId, workspaceId, granularity } = params
            const auditLogRepository = getRepository(AuditLog)
            const metrics: AnalyticsMetric[] = []

            // Build where conditions for user activity logs
            const whereConditions: any = {
                timestamp: Between(startTime, endTime)
            }

            if (organizationId) {
                whereConditions.metadata = { organizationId }
            }

            if (workspaceId) {
                whereConditions.metadata = { ...whereConditions.metadata, workspaceId }
            }

            // Get user activity logs
            const activityLogs = await auditLogRepository.find({
                where: whereConditions
            })

            if (activityLogs.length === 0) {
                return metrics
            }

            // Group logs by user
            const userMap = new Map<string, AuditLog[]>()
            
            for (const log of activityLogs) {
                if (log.userId) {
                    if (!userMap.has(log.userId)) {
                        userMap.set(log.userId, [])
                    }
                    userMap.get(log.userId)!.push(log)
                }
            }
            
            // Create metrics for top users
            const topUsers = Array.from(userMap.entries())
                .sort((a, b) => b[1].length - a[1].length)
                .slice(0, 10)

            for (const [userId, logs] of topUsers) {
                // Get unique actions
                const uniqueActions = new Set(logs.map(log => log.action))
                
                // Get unique resources
                const uniqueResources = new Set(logs.filter(log => log.resourceId).map(log => log.resourceId))
                
                const metric = await analyticsService.recordMetric({
                    metricType: MetricType.ACCESS_PATTERN,
                    metricName: 'user_activity',
                    value: logs.length,
                    granularity,
                    timestamp: new Date(),
                    organizationId,
                    workspaceId,
                    userId,
                    dimensions: {
                        userId,
                        activityCount: logs.length,
                        uniqueActionsCount: uniqueActions.size,
                        uniqueResourcesCount: uniqueResources.size,
                        actions: Array.from(uniqueActions)
                    }
                })
                
                metrics.push(metric)
            }

            return metrics
        } catch (error) {
            logger.error(`[AccessPatternAnalyticsService] generateUserActivityMetrics error: ${error}`)
            return []
        }
    }

    /**
     * Generate access summary
     * @param params Analysis parameters
     * @returns Access summary
     */
    private async generateAccessSummary(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
    }): Promise<any> {
        try {
            const { startTime, endTime, organizationId, workspaceId } = params
            const auditLogRepository = getRepository(AuditLog)

            // Build where conditions
            const whereConditions: any = {
                timestamp: Between(startTime, endTime)
            }

            if (organizationId) {
                whereConditions.metadata = { organizationId }
            }

            if (workspaceId) {
                whereConditions.metadata = { ...whereConditions.metadata, workspaceId }
            }

            // Get access logs
            const accessLogs = await auditLogRepository.find({
                where: whereConditions
            })

            if (accessLogs.length === 0) {
                return {
                    totalAccesses: 0,
                    uniqueUsers: 0,
                    uniqueResources: 0,
                    actionDistribution: {}
                }
            }

            // Count unique users and resources
            const uniqueUsers = new Set(accessLogs.filter(log => log.userId).map(log => log.userId))
            const uniqueResources = new Set(accessLogs.filter(log => log.resourceId).map(log => log.resourceId))

            // Calculate action distribution
            const actionCounts: Record<string, number> = {}
            
            for (const log of accessLogs) {
                if (!actionCounts[log.action]) {
                    actionCounts[log.action] = 0
                }
                actionCounts[log.action]++
            }

            return {
                totalAccesses: accessLogs.length,
                uniqueUsers: uniqueUsers.size,
                uniqueResources: uniqueResources.size,
                actionDistribution: actionCounts
            }
        } catch (error) {
            logger.error(`[AccessPatternAnalyticsService] generateAccessSummary error: ${error}`)
            return {
                totalAccesses: 0,
                uniqueUsers: 0,
                uniqueResources: 0,
                actionDistribution: {}
            }
        }
    }

    /**
     * Get top resources by usage
     * @param params Analysis parameters
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

            // Build where conditions
            const whereConditions: any = {
                timestamp: Between(startTime, endTime),
                action: 'resource_access'
            }

            if (organizationId) {
                whereConditions.metadata = { organizationId }
            }

            if (workspaceId) {
                whereConditions.metadata = { ...whereConditions.metadata, workspaceId }
            }

            // Get resource access logs
            const resourceLogs = await auditLogRepository.find({
                where: whereConditions
            })

            if (resourceLogs.length === 0) {
                return []
            }

            // Group logs by resource
            const resourceMap = new Map<string, { logs: AuditLog[], resourceType: string, resourceId: string }>()
            
            for (const log of resourceLogs) {
                if (log.resourceId) {
                    const resourceKey = `${log.resourceType || 'unknown'}:${log.resourceId}`
                    if (!resourceMap.has(resourceKey)) {
                        resourceMap.set(resourceKey, {
                            logs: [],
                            resourceType: log.resourceType || 'unknown',
                            resourceId: log.resourceId
                        })
                    }
                    resourceMap.get(resourceKey)!.logs.push(log)
                }
            }

            // Sort resources by usage count
            const topResources = Array.from(resourceMap.values())
                .map(({ logs, resourceType, resourceId }) => ({
                    resourceType,
                    resourceId,
                    count: logs.length,
                    uniqueUsers: new Set(logs.filter(log => log.userId).map(log => log.userId)).size
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, limit)

            return topResources
        } catch (error) {
            logger.error(`[AccessPatternAnalyticsService] getTopResources error: ${error}`)
            return []
        }
    }

    /**
     * Get top users by activity
     * @param params Analysis parameters
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

            // Build where conditions
            const whereConditions: any = {
                timestamp: Between(startTime, endTime)
            }

            if (organizationId) {
                whereConditions.metadata = { organizationId }
            }

            if (workspaceId) {
                whereConditions.metadata = { ...whereConditions.metadata, workspaceId }
            }

            // Get activity logs
            const activityLogs = await auditLogRepository.find({
                where: whereConditions
            })

            if (activityLogs.length === 0) {
                return []
            }

            // Group logs by user
            const userMap = new Map<string, AuditLog[]>()
            
            for (const log of activityLogs) {
                if (log.userId) {
                    if (!userMap.has(log.userId)) {
                        userMap.set(log.userId, [])
                    }
                    userMap.get(log.userId)!.push(log)
                }
            }

            // Sort users by activity count
            const topUsers = Array.from(userMap.entries())
                .map(([userId, logs]) => {
                    // Get unique actions
                    const uniqueActions = new Set(logs.map(log => log.action))
                    
                    // Get unique resources
                    const uniqueResources = new Set(logs.filter(log => log.resourceId).map(log => log.resourceId))
                    
                    return {
                        userId,
                        activityCount: logs.length,
                        uniqueActionsCount: uniqueActions.size,
                        uniqueResourcesCount: uniqueResources.size,
                        mostFrequentAction: this.getMostFrequentValue(logs.map(log => log.action))
                    }
                })
                .sort((a, b) => b.activityCount - a.activityCount)
                .slice(0, limit)

            return topUsers
        } catch (error) {
            logger.error(`[AccessPatternAnalyticsService] getTopUsers error: ${error}`)
            return []
        }
    }

    /**
     * Get resource usage statistics
     * @param resourceType Resource type
     * @param resourceId Resource ID
     * @param startTime Start time
     * @param endTime End time
     * @returns Resource usage statistics
     */
    async getResourceUsageStats(
        resourceType: string,
        resourceId: string,
        startTime: Date,
        endTime: Date
    ): Promise<any> {
        try {
            const auditLogRepository = getRepository(AuditLog)

            // Build where conditions
            const whereConditions: any = {
                timestamp: Between(startTime, endTime),
                resourceType,
                resourceId
            }

            // Get resource access logs
            const resourceLogs = await auditLogRepository.find({
                where: whereConditions
            })

            if (resourceLogs.length === 0) {
                return {
                    resourceType,
                    resourceId,
                    totalAccesses: 0,
                    uniqueUsers: 0,
                    actionDistribution: {},
                    userDistribution: []
                }
            }

            // Count unique users
            const uniqueUsers = new Set(resourceLogs.filter(log => log.userId).map(log => log.userId))

            // Calculate action distribution
            const actionCounts: Record<string, number> = {}
            
            for (const log of resourceLogs) {
                if (!actionCounts[log.action]) {
                    actionCounts[log.action] = 0
                }
                actionCounts[log.action]++
            }

            // Calculate user distribution
            const userMap = new Map<string, AuditLog[]>()
            
            for (const log of resourceLogs) {
                if (log.userId) {
                    if (!userMap.has(log.userId)) {
                        userMap.set(log.userId, [])
                    }
                    userMap.get(log.userId)!.push(log)
                }
            }
            
            const userDistribution = Array.from(userMap.entries())
                .map(([userId, logs]) => ({
                    userId,
                    accessCount: logs.length,
                    percentage: (logs.length / resourceLogs.length) * 100,
                    actions: Array.from(new Set(logs.map(log => log.action)))
                }))
                .sort((a, b) => b.accessCount - a.accessCount)

            return {
                resourceType,
                resourceId,
                totalAccesses: resourceLogs.length,
                uniqueUsers: uniqueUsers.size,
                actionDistribution: actionCounts,
                userDistribution
            }
        } catch (error) {
            logger.error(`[AccessPatternAnalyticsService] getResourceUsageStats error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get resource usage statistics')
        }
    }

    /**
     * Get the most frequent value in an array
     * @param arr Array of values
     * @returns Most frequent value
     */
    private getMostFrequentValue(arr: any[]): any {
        if (arr.length === 0) {
            return null
        }

        const counts = new Map<any, number>()
        
        for (const value of arr) {
            if (!counts.has(value)) {
                counts.set(value, 0)
            }
            counts.set(value, counts.get(value)! + 1)
        }
        
        let mostFrequent = arr[0]
        let maxCount = 0
        
        for (const [value, count] of counts.entries()) {
            if (count > maxCount) {
                mostFrequent = value
                maxCount = count
            }
        }
        
        return mostFrequent
    }
}

export default new AccessPatternAnalyticsService()