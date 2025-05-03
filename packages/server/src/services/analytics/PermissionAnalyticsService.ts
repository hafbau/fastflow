import { getRepository, Between, In, MoreThan, LessThan, FindOptionsWhere } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { AuditLog } from '../../database/entities/AuditLog'
import { AnalyticsMetric, MetricType, TimeGranularity } from '../../database/entities/AnalyticsMetric'
import analyticsService from './AnalyticsService'
import logger from '../../utils/logger'
import rolesPermissionsService from '../RolesPermissionsService'

/**
 * Service for permission analytics
 */
class PermissionAnalyticsService {
    /**
     * Analyze permission usage
     * @param params Analysis parameters
     * @returns Permission usage analysis
     */
    async analyzePermissionUsage(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
        granularity: TimeGranularity
    }): Promise<any> {
        try {
            const { startTime, endTime, organizationId, workspaceId, granularity } = params
            
            // Get permission usage trends
            const permissionUsageTrends = await analyticsService.getMetricsAggregatedByTime({
                startTime,
                endTime,
                metricType: MetricType.PERMISSION_USAGE,
                metricName: 'permission_check',
                granularity,
                organizationId,
                workspaceId
            })
            
            // Get most used permissions
            const mostUsedPermissions = await this.getMostUsedPermissions({
                startTime,
                endTime,
                organizationId,
                workspaceId,
                limit: 10
            })
            
            // Get unused permissions
            const unusedPermissions = await this.getUnusedPermissions({
                startTime,
                endTime,
                organizationId,
                workspaceId
            })
            
            // Calculate summary metrics
            const summary = this.calculatePermissionSummary({
                permissionUsageTrends,
                mostUsedPermissions,
                unusedPermissions
            })
            
            return {
                summary,
                permissionUsageTrends,
                mostUsedPermissions,
                unusedPermissions
            }
        } catch (error) {
            logger.error(`[PermissionAnalyticsService] analyzePermissionUsage error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to analyze permission usage')
        }
    }
    
    /**
     * Get most used permissions
     * @param params Query parameters
     * @returns Most used permissions
     */
    private async getMostUsedPermissions(params: {
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
            
            // Get all permission check logs
            const whereConditions: FindOptionsWhere<AuditLog> = {
                timestamp: Between(startTime, endTime),
                action: 'permission_check'
            }
            
            if (Object.keys(metadata).length > 0) {
                whereConditions.metadata = metadata
            }
            
            const permissionLogs = await auditLogRepository.find({
                where: whereConditions,
                select: ['metadata', 'timestamp', 'userId']
            })
            
            // Group by permission
            const permissionUsageMap = new Map<string, {
                permission: string
                usageCount: number
                uniqueUsers: Set<string>
                successCount: number
                deniedCount: number
            }>()
            
            for (const log of permissionLogs) {
                if (!log.metadata?.permission) continue
                
                const permission = log.metadata.permission
                
                if (!permissionUsageMap.has(permission)) {
                    permissionUsageMap.set(permission, {
                        permission,
                        usageCount: 0,
                        uniqueUsers: new Set(),
                        successCount: 0,
                        deniedCount: 0
                    })
                }
                
                const permissionUsage = permissionUsageMap.get(permission)!
                permissionUsage.usageCount++
                
                if (log.userId) {
                    permissionUsage.uniqueUsers.add(log.userId)
                }
                
                if (log.metadata.status === 'success') {
                    permissionUsage.successCount++
                } else if (log.metadata.status === 'denied') {
                    permissionUsage.deniedCount++
                }
            }
            
            // Convert to array and sort by usage count
            const mostUsedPermissions = Array.from(permissionUsageMap.values())
                .map(usage => ({
                    ...usage,
                    uniqueUsers: usage.uniqueUsers.size,
                    successRate: usage.usageCount > 0
                        ? Math.round((usage.successCount / usage.usageCount) * 100)
                        : 0
                }))
                .sort((a, b) => b.usageCount - a.usageCount)
                .slice(0, limit)
            
            return mostUsedPermissions
        } catch (error) {
            logger.error(`[PermissionAnalyticsService] getMostUsedPermissions error: ${error}`)
            return []
        }
    }
    
    /**
     * Get unused permissions
     * @param params Query parameters
     * @returns Unused permissions
     */
    private async getUnusedPermissions(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
    }): Promise<any[]> {
        try {
            const { startTime, endTime, organizationId, workspaceId } = params
            const auditLogRepository = getRepository(AuditLog)
            
            // Create metadata condition
            const metadata: Record<string, any> = {}
            
            if (organizationId) {
                metadata.organizationId = organizationId
            }
            
            if (workspaceId) {
                metadata.workspaceId = workspaceId
            }
            
            // Get all permission check logs
            const whereConditions: FindOptionsWhere<AuditLog> = {
                timestamp: Between(startTime, endTime),
                action: 'permission_check'
            }
            
            if (Object.keys(metadata).length > 0) {
                whereConditions.metadata = metadata
            }
            
            const permissionLogs = await auditLogRepository.find({
                where: whereConditions,
                select: ['metadata']
            })
            
            // Get all used permissions
            const usedPermissions = new Set<string>()
            
            for (const log of permissionLogs) {
                if (log.metadata?.permission) {
                    usedPermissions.add(log.metadata.permission)
                }
            }
            
            // Get all available permissions
            let allPermissions = [] as string[]
            
            try {
                // Get system-wide permissions
                const permissions = await rolesPermissionsService.getAllPermissions() as Array<{
                    name?: string;
                    resourceType?: string;
                    action?: string;
                }>
                
                // Extract permission names
                allPermissions = permissions.map(p => p.name || `${p.resourceType || ''}:${p.action || ''}`)
            } catch (error) {
                logger.error(`[PermissionAnalyticsService] Error getting all permissions: ${error}`)
                allPermissions = []
            }
            
            // Find unused permissions
            const unusedPermissions = allPermissions
                .filter(permission => !usedPermissions.has(permission))
                .map(permission => ({
                    permission,
                    lastUsed: null,
                    assignedRolesCount: 0 // This would require additional logic to calculate
                }))
            
            return unusedPermissions
        } catch (error) {
            logger.error(`[PermissionAnalyticsService] getUnusedPermissions error: ${error}`)
            return []
        }
    }
    
    /**
     * Calculate permission summary
     * @param params Analysis results
     * @returns Summary metrics
     */
    private calculatePermissionSummary(params: {
        permissionUsageTrends: any[]
        mostUsedPermissions: any[]
        unusedPermissions: any[]
    }): any {
        try {
            const { permissionUsageTrends, mostUsedPermissions, unusedPermissions } = params
            
            // Calculate total usage count
            const totalUsageCount = permissionUsageTrends.reduce((sum, trend) => sum + trend.value, 0)
            
            // Calculate average daily usage
            const avgDailyUsage = permissionUsageTrends.length > 0
                ? Math.round(totalUsageCount / permissionUsageTrends.length)
                : 0
            
            // Calculate unused permissions count
            const unusedPermissionsCount = unusedPermissions.length
            
            // Calculate overall utilization percentage
            const totalPermissionsCount = mostUsedPermissions.length + unusedPermissionsCount
            const overallUtilizationPercentage = totalPermissionsCount > 0
                ? Math.round(((totalPermissionsCount - unusedPermissionsCount) / totalPermissionsCount) * 100)
                : 0
            
            // Calculate success rate
            const totalSuccessCount = mostUsedPermissions.reduce((sum, permission) => sum + permission.successCount, 0)
            const successRate = totalUsageCount > 0
                ? Math.round((totalSuccessCount / totalUsageCount) * 100)
                : 0
            
            return {
                totalUsageCount,
                avgDailyUsage,
                unusedPermissionsCount,
                overallUtilizationPercentage,
                successRate
            }
        } catch (error) {
            logger.error(`[PermissionAnalyticsService] calculatePermissionSummary error: ${error}`)
            return {
                totalUsageCount: 0,
                avgDailyUsage: 0,
                unusedPermissionsCount: 0,
                overallUtilizationPercentage: 0,
                successRate: 0
            }
        }
    }
    
    /**
     * Get user permission utilization
     * @param userId User ID
     * @param startTime Start time
     * @param endTime End time
     * @returns User permission utilization
     */
    async getUserPermissionUtilization(
        userId: string,
        startTime: Date,
        endTime: Date
    ): Promise<any> {
        try {
            const auditLogRepository = getRepository(AuditLog)
            
            // Get all permission check logs for this user
            const permissionLogs = await auditLogRepository.find({
                where: {
                    timestamp: Between(startTime, endTime),
                    userId,
                    action: 'permission_check'
                },
                select: ['metadata', 'timestamp', 'resourceId', 'resourceType']
            })
            
            // Group by permission
            const permissionUsageMap = new Map<string, {
                permission: string
                usageCount: number
                successCount: number
                deniedCount: number
                lastUsed: Date
                resources: Set<string>
            }>()
            
            for (const log of permissionLogs) {
                if (!log.metadata?.permission) continue
                
                const permission = log.metadata.permission
                
                if (!permissionUsageMap.has(permission)) {
                    permissionUsageMap.set(permission, {
                        permission,
                        usageCount: 0,
                        successCount: 0,
                        deniedCount: 0,
                        lastUsed: log.timestamp,
                        resources: new Set()
                    })
                }
                
                const permissionUsage = permissionUsageMap.get(permission)!
                permissionUsage.usageCount++
                
                if (log.metadata.status === 'success') {
                    permissionUsage.successCount++
                } else if (log.metadata.status === 'denied') {
                    permissionUsage.deniedCount++
                }
                
                if (log.timestamp > permissionUsage.lastUsed) {
                    permissionUsage.lastUsed = log.timestamp
                }
                
                if (log.resourceId && log.resourceType) {
                    permissionUsage.resources.add(`${log.resourceType}:${log.resourceId}`)
                }
            }
            
            // Convert to array and sort by usage count
            const permissionUsage = Array.from(permissionUsageMap.values())
                .map(usage => ({
                    ...usage,
                    resources: usage.resources.size,
                    successRate: usage.usageCount > 0
                        ? Math.round((usage.successCount / usage.usageCount) * 100)
                        : 0
                }))
                .sort((a, b) => b.usageCount - a.usageCount)
            
            // Get assigned permissions
            let assignedPermissions = [] as string[]
            
            try {
                // Get user permissions
                const permissions = await rolesPermissionsService.getUserPermissions(userId) as Array<{
                    name?: string;
                    resourceType?: string;
                    action?: string;
                }>
                
                // Extract permission names
                assignedPermissions = permissions.map(p => p.name || `${p.resourceType || ''}:${p.action || ''}`)
            } catch (error) {
                logger.error(`[PermissionAnalyticsService] Error getting user permissions: ${error}`)
                assignedPermissions = []
            }
            
            // Find unused assigned permissions
            const usedPermissions = new Set(permissionUsage.map(usage => usage.permission))
            const unusedAssignedPermissions = assignedPermissions
                .filter(permission => !usedPermissions.has(permission))
                .map(permission => ({
                    permission,
                    usageCount: 0,
                    successCount: 0,
                    deniedCount: 0,
                    lastUsed: null,
                    resources: 0,
                    successRate: 0
                }))
            
            // Calculate summary metrics
            const totalUsageCount = permissionUsage.reduce((sum, usage) => sum + usage.usageCount, 0)
            const totalSuccessCount = permissionUsage.reduce((sum, usage) => sum + usage.successCount, 0)
            const totalDeniedCount = permissionUsage.reduce((sum, usage) => sum + usage.deniedCount, 0)
            
            const overallSuccessRate = totalUsageCount > 0
                ? Math.round((totalSuccessCount / totalUsageCount) * 100)
                : 0
            
            const utilizationRate = assignedPermissions.length > 0
                ? Math.round((permissionUsage.length / assignedPermissions.length) * 100)
                : 0
            
            const summary = {
                totalUsageCount,
                totalSuccessCount,
                totalDeniedCount,
                overallSuccessRate,
                utilizationRate,
                assignedPermissionsCount: assignedPermissions.length,
                usedPermissionsCount: permissionUsage.length,
                unusedPermissionsCount: unusedAssignedPermissions.length
            }
            
            return {
                userId,
                summary,
                permissionUsage,
                unusedPermissions: unusedAssignedPermissions
            }
        } catch (error) {
            logger.error(`[PermissionAnalyticsService] getUserPermissionUtilization error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get user permission utilization')
        }
    }
}

export default new PermissionAnalyticsService()