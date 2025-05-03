import { getRepository, Between, In, MoreThan } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { AuditLog } from '../../database/entities/AuditLog'
import { AnalyticsMetric, MetricType, TimeGranularity } from '../../database/entities/AnalyticsMetric'
import analyticsService from './AnalyticsService'
import logger from '../../utils/logger'

/**
 * Service for analyzing permission usage
 */
class PermissionUsageAnalyticsService {
    /**
     * Analyze permission usage and generate metrics
     * @param params Analysis parameters
     * @returns Generated metrics
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
            const metrics: AnalyticsMetric[] = []

            // Generate permission usage metrics
            const permissionUsageMetrics = await this.generatePermissionUsageMetrics(params)
            metrics.push(...permissionUsageMetrics)

            // Generate permission utilization metrics
            const permissionUtilizationMetrics = await this.generatePermissionUtilizationMetrics(params)
            metrics.push(...permissionUtilizationMetrics)

            // Generate excessive permissions metrics
            const excessivePermissionsMetrics = await this.detectExcessivePermissions(params)
            metrics.push(...excessivePermissionsMetrics)

            // Prepare response data
            const permissionUsageData = {
                metrics,
                summary: await this.generatePermissionUsageSummary(params),
                topPermissions: await this.getTopPermissions(params),
                unusedPermissions: await this.getUnusedPermissions(params),
                excessivePermissions: await this.getExcessivePermissions(params)
            }

            return permissionUsageData
        } catch (error) {
            logger.error(`[PermissionUsageAnalyticsService] analyzePermissionUsage error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to analyze permission usage')
        }
    }

    /**
     * Generate permission usage metrics
     * @param params Analysis parameters
     * @returns Permission usage metrics
     */
    private async generatePermissionUsageMetrics(params: {
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

            // Define permission actions
            const permissionActions = [
                'permission_check',
                'permission_granted',
                'permission_denied'
            ]

            // Build where conditions for permission logs
            const whereConditions: any = {
                timestamp: Between(startTime, endTime),
                action: In(permissionActions)
            }

            if (organizationId) {
                whereConditions.metadata = { organizationId }
            }

            if (workspaceId) {
                whereConditions.metadata = { ...whereConditions.metadata, workspaceId }
            }

            // Get permission logs
            const permissionLogs = await auditLogRepository.find({
                where: whereConditions
            })

            if (permissionLogs.length === 0) {
                return metrics
            }

            // Create overall permission usage metric
            const overallMetric = await analyticsService.recordMetric({
                metricType: MetricType.PERMISSION_USAGE,
                metricName: 'permission_check_count',
                value: permissionLogs.length,
                granularity,
                timestamp: new Date(),
                organizationId,
                workspaceId,
                dimensions: {
                    uniqueUsers: new Set(permissionLogs.filter(log => log.userId).map(log => log.userId)).size,
                    uniquePermissions: new Set(permissionLogs.filter(log => log.metadata?.permission)
                        .map(log => log.metadata?.permission)).size
                }
            })

            metrics.push(overallMetric)

            // Group logs by permission
            const permissionMap = new Map<string, AuditLog[]>()
            
            for (const log of permissionLogs) {
                if (log.metadata?.permission) {
                    const permission = log.metadata.permission
                    if (!permissionMap.has(permission)) {
                        permissionMap.set(permission, [])
                    }
                    permissionMap.get(permission)!.push(log)
                }
            }
            
            // Create metrics for each permission
            for (const [permission, permLogs] of permissionMap.entries()) {
                // Count granted vs denied
                const grantedLogs = permLogs.filter(log => log.action === 'permission_granted')
                const deniedLogs = permLogs.filter(log => log.action === 'permission_denied')
                
                const metric = await analyticsService.recordMetric({
                    metricType: MetricType.PERMISSION_USAGE,
                    metricName: 'permission_usage_by_type',
                    value: permLogs.length,
                    granularity,
                    timestamp: new Date(),
                    organizationId,
                    workspaceId,
                    dimensions: {
                        permission,
                        count: permLogs.length,
                        grantedCount: grantedLogs.length,
                        deniedCount: deniedLogs.length,
                        grantRate: permLogs.length > 0 ? (grantedLogs.length / permLogs.length) * 100 : 0,
                        uniqueUsers: new Set(permLogs.filter(log => log.userId).map(log => log.userId)).size
                    }
                })
                
                metrics.push(metric)
            }

            // Group logs by user
            const userMap = new Map<string, AuditLog[]>()
            
            for (const log of permissionLogs) {
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
                // Count granted vs denied
                const grantedLogs = logs.filter(log => log.action === 'permission_granted')
                const deniedLogs = logs.filter(log => log.action === 'permission_denied')
                
                // Get unique permissions used
                const uniquePermissions = new Set(logs.filter(log => log.metadata?.permission)
                    .map(log => log.metadata?.permission))
                
                const metric = await analyticsService.recordMetric({
                    metricType: MetricType.PERMISSION_USAGE,
                    metricName: 'user_permission_usage',
                    value: logs.length,
                    granularity,
                    timestamp: new Date(),
                    organizationId,
                    workspaceId,
                    userId,
                    dimensions: {
                        userId,
                        checkCount: logs.length,
                        grantedCount: grantedLogs.length,
                        deniedCount: deniedLogs.length,
                        grantRate: logs.length > 0 ? (grantedLogs.length / logs.length) * 100 : 0,
                        uniquePermissionsCount: uniquePermissions.size,
                        uniquePermissions: Array.from(uniquePermissions)
                    }
                })
                
                metrics.push(metric)
            }

            return metrics
        } catch (error) {
            logger.error(`[PermissionUsageAnalyticsService] generatePermissionUsageMetrics error: ${error}`)
            return []
        }
    }

    /**
     * Generate permission utilization metrics
     * @param params Analysis parameters
     * @returns Permission utilization metrics
     */
    private async generatePermissionUtilizationMetrics(params: {
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

            // Get all users with permissions
            // This would typically come from a user-permission mapping table
            // For this implementation, we'll use a mock approach
            const userPermissions = await this.getUserPermissionMappings(organizationId, workspaceId)

            if (userPermissions.length === 0) {
                return metrics
            }

            // For each user, check which permissions they've actually used
            for (const userPerm of userPermissions) {
                const { userId, permissions } = userPerm

                // Get permission usage logs for this user
                const permissionLogs = await auditLogRepository.find({
                    where: {
                        userId,
                        timestamp: Between(startTime, endTime),
                        action: In(['permission_granted']),
                        ...(organizationId ? { metadata: { organizationId } } : {}),
                        ...(workspaceId ? { metadata: { workspaceId } } : {})
                    }
                })

                // Calculate which permissions were used
                const usedPermissions = new Set(permissionLogs
                    .filter(log => log.metadata?.permission)
                    .map(log => log.metadata?.permission))

                // Calculate utilization rate
                const utilizationRate = permissions.length > 0 
                    ? (usedPermissions.size / permissions.length) * 100 
                    : 0

                // Create utilization metric
                const metric = await analyticsService.recordMetric({
                    metricType: MetricType.PERMISSION_USAGE,
                    metricName: 'permission_utilization',
                    value: utilizationRate,
                    granularity,
                    timestamp: new Date(),
                    organizationId,
                    workspaceId,
                    userId,
                    dimensions: {
                        userId,
                        totalPermissions: permissions.length,
                        usedPermissions: usedPermissions.size,
                        unusedPermissions: permissions.length - usedPermissions.size,
                        utilizationRate,
                        usedPermissionsList: Array.from(usedPermissions),
                        unusedPermissionsList: permissions.filter((p: string) => !usedPermissions.has(p))
                    }
                })

                metrics.push(metric)
            }

            return metrics
        } catch (error) {
            logger.error(`[PermissionUsageAnalyticsService] generatePermissionUtilizationMetrics error: ${error}`)
            return []
        }
    }

    /**
     * Detect excessive permissions
     * @param params Analysis parameters
     * @returns Excessive permissions metrics
     */
    private async detectExcessivePermissions(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
        granularity: TimeGranularity
    }): Promise<AnalyticsMetric[]> {
        try {
            const { startTime, endTime, organizationId, workspaceId, granularity } = params
            const metrics: AnalyticsMetric[] = []

            // Get user permission utilization data
            const userPermissions = await this.getUserPermissionMappings(organizationId, workspaceId)

            if (userPermissions.length === 0) {
                return metrics
            }

            // For each user, analyze their permission utilization
            for (const userPerm of userPermissions) {
                const { userId, permissions } = userPerm

                // Get permission utilization for this user
                const utilization = await this.getUserPermissionUtilization(userId, startTime, endTime)

                // Check for excessive permissions (unused permissions over a threshold)
                if (utilization.utilizationRate < 30 && utilization.unusedPermissions.length > 5) {
                    // Create excessive permissions metric
                    const metric = await analyticsService.recordMetric({
                        metricType: MetricType.PERMISSION_USAGE,
                        metricName: 'excessive_permissions',
                        value: utilization.unusedPermissions.length,
                        granularity,
                        timestamp: new Date(),
                        organizationId,
                        workspaceId,
                        userId,
                        dimensions: {
                            userId,
                            totalPermissions: permissions.length,
                            unusedPermissions: utilization.unusedPermissions.length,
                            utilizationRate: utilization.utilizationRate,
                            unusedPermissionsList: utilization.unusedPermissions
                        }
                    })

                    metrics.push(metric)
                }
            }

            return metrics
        } catch (error) {
            logger.error(`[PermissionUsageAnalyticsService] detectExcessivePermissions error: ${error}`)
            return []
        }
    }

    /**
     * Generate permission usage summary
     * @param params Analysis parameters
     * @returns Permission usage summary
     */
    private async generatePermissionUsageSummary(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
        granularity?: TimeGranularity
    }): Promise<any> {
        try {
            const { startTime, endTime, organizationId, workspaceId } = params
            const auditLogRepository = getRepository(AuditLog)

            // Define permission actions
            const permissionActions = [
                'permission_check',
                'permission_granted',
                'permission_denied'
            ]

            // Build where conditions for permission logs
            const whereConditions: any = {
                timestamp: Between(startTime, endTime),
                action: In(permissionActions)
            }

            if (organizationId) {
                whereConditions.metadata = { organizationId }
            }

            if (workspaceId) {
                whereConditions.metadata = { ...whereConditions.metadata, workspaceId }
            }

            // Get permission logs
            const permissionLogs = await auditLogRepository.find({
                where: whereConditions
            })

            if (permissionLogs.length === 0) {
                return {
                    totalChecks: 0,
                    grantedCount: 0,
                    deniedCount: 0,
                    grantRate: 0,
                    uniqueUsers: 0,
                    uniquePermissions: 0
                }
            }

            // Count granted vs denied
            const grantedLogs = permissionLogs.filter(log => log.action === 'permission_granted')
            const deniedLogs = permissionLogs.filter(log => log.action === 'permission_denied')

            // Get unique users and permissions
            const uniqueUsers = new Set(permissionLogs.filter(log => log.userId).map(log => log.userId))
            const uniquePermissions = new Set(permissionLogs.filter(log => log.metadata?.permission)
                .map(log => log.metadata?.permission))

            return {
                totalChecks: permissionLogs.length,
                grantedCount: grantedLogs.length,
                deniedCount: deniedLogs.length,
                grantRate: permissionLogs.length > 0 ? (grantedLogs.length / permissionLogs.length) * 100 : 0,
                uniqueUsers: uniqueUsers.size,
                uniquePermissions: uniquePermissions.size
            }
        } catch (error) {
            logger.error(`[PermissionUsageAnalyticsService] generatePermissionUsageSummary error: ${error}`)
            return {
                totalChecks: 0,
                grantedCount: 0,
                deniedCount: 0,
                grantRate: 0,
                uniqueUsers: 0,
                uniquePermissions: 0
            }
        }
    }

    /**
     * Get top permissions by usage
     * @param params Analysis parameters
     * @returns Top permissions
     */
    private async getTopPermissions(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
        limit?: number
    }): Promise<any[]> {
        try {
            const { startTime, endTime, organizationId, workspaceId, limit = 10 } = params
            const auditLogRepository = getRepository(AuditLog)

            // Build where conditions for permission logs
            const whereConditions: any = {
                timestamp: Between(startTime, endTime),
                action: 'permission_granted'
            }

            if (organizationId) {
                whereConditions.metadata = { organizationId }
            }

            if (workspaceId) {
                whereConditions.metadata = { ...whereConditions.metadata, workspaceId }
            }

            // Get permission logs
            const permissionLogs = await auditLogRepository.find({
                where: whereConditions
            })

            if (permissionLogs.length === 0) {
                return []
            }

            // Group logs by permission
            const permissionMap = new Map<string, AuditLog[]>()
            
            for (const log of permissionLogs) {
                if (log.metadata?.permission) {
                    const permission = log.metadata.permission
                    if (!permissionMap.has(permission)) {
                        permissionMap.set(permission, [])
                    }
                    permissionMap.get(permission)!.push(log)
                }
            }

            // Sort permissions by usage count
            const topPermissions = Array.from(permissionMap.entries())
                .map(([permission, logs]: [string, AuditLog[]]) => ({
                    permission,
                    count: logs.length,
                    uniqueUsers: new Set(logs.filter(log => log.userId).map(log => log.userId)).size
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, limit)

            return topPermissions
        } catch (error) {
            logger.error(`[PermissionUsageAnalyticsService] getTopPermissions error: ${error}`)
            return []
        }
    }

    /**
     * Get unused permissions
     * @param params Analysis parameters
     * @returns Unused permissions
     */
    private async getUnusedPermissions(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
        limit?: number
    }): Promise<any[]> {
        try {
            const { startTime, endTime, organizationId, workspaceId, limit = 10 } = params

            // Get all user permission mappings
            const userPermissions = await this.getUserPermissionMappings(organizationId, workspaceId)

            if (userPermissions.length === 0) {
                return []
            }

            // Collect all unused permissions across users
            const unusedPermissionsMap = new Map<string, { permission: string, userCount: number, users: string[] }>()

            for (const userPerm of userPermissions) {
                const { userId, permissions } = userPerm

                // Get permission utilization for this user
                const utilization = await this.getUserPermissionUtilization(userId, startTime, endTime)

                // Add unused permissions to the map
                for (const permission of utilization.unusedPermissions) {
                    if (!unusedPermissionsMap.has(permission)) {
                        unusedPermissionsMap.set(permission, {
                            permission,
                            userCount: 0,
                            users: []
                        })
                    }

                    const permData = unusedPermissionsMap.get(permission)!
                    permData.userCount++
                    permData.users.push(userId)
                }
            }

            // Sort unused permissions by user count
            const unusedPermissions = Array.from(unusedPermissionsMap.values())
                .sort((a, b) => b.userCount - a.userCount)
                .slice(0, limit)

            return unusedPermissions
        } catch (error) {
            logger.error(`[PermissionUsageAnalyticsService] getUnusedPermissions error: ${error}`)
            return []
        }
    }

    /**
     * Get excessive permissions
     * @param params Analysis parameters
     * @returns Excessive permissions
     */
    private async getExcessivePermissions(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
        limit?: number
    }): Promise<any[]> {
        try {
            const { startTime, endTime, organizationId, workspaceId, limit = 10 } = params

            // Get all user permission mappings
            const userPermissions = await this.getUserPermissionMappings(organizationId, workspaceId)

            if (userPermissions.length === 0) {
                return []
            }

            // Collect users with excessive permissions
            const excessivePermissions = []

            for (const userPerm of userPermissions) {
                const { userId, permissions } = userPerm

                // Get permission utilization for this user
                const utilization = await this.getUserPermissionUtilization(userId, startTime, endTime)

                // Check for excessive permissions (unused permissions over a threshold)
                if (utilization.utilizationRate < 30 && utilization.unusedPermissions.length > 5) {
                    excessivePermissions.push({
                        userId,
                        totalPermissions: permissions.length,
                        usedPermissions: utilization.usedPermissions.length,
                        unusedPermissions: utilization.unusedPermissions.length,
                        utilizationRate: utilization.utilizationRate,
                        unusedPermissionsList: utilization.unusedPermissions
                    })
                }
            }

            // Sort by number of unused permissions
            return excessivePermissions
                .sort((a, b) => b.unusedPermissions - a.unusedPermissions)
                .slice(0, limit)
        } catch (error) {
            logger.error(`[PermissionUsageAnalyticsService] getExcessivePermissions error: ${error}`)
            return []
        }
    }

    /**
     * Get user permission utilization
     * @param userId User ID
     * @param startTime Start time
     * @param endTime End time
     * @returns User permission utilization
     */
    async getUserPermissionUtilization(userId: string, startTime: Date, endTime: Date): Promise<any> {
        try {
            const auditLogRepository = getRepository(AuditLog)

            // Get all permissions assigned to the user
            const userPermissions = await this.getUserPermissions(userId)

            if (userPermissions.length === 0) {
                return {
                    userId,
                    totalPermissions: 0,
                    usedPermissions: [],
                    unusedPermissions: [],
                    utilizationRate: 0
                }
            }

            // Get permission usage logs for this user
            const permissionLogs = await auditLogRepository.find({
                where: {
                    userId,
                    timestamp: Between(startTime, endTime),
                    action: 'permission_granted'
                }
            })

            // Calculate which permissions were used
            const usedPermissionsSet = new Set(permissionLogs
                .filter(log => log.metadata?.permission)
                .map(log => log.metadata?.permission))

            const usedPermissions = Array.from(usedPermissionsSet)
            const unusedPermissions = userPermissions.filter((p: string) => !usedPermissionsSet.has(p))

            // Calculate utilization rate
            const utilizationRate = userPermissions.length > 0 
                ? (usedPermissions.length / userPermissions.length) * 100 
                : 0

            return {
                userId,
                totalPermissions: userPermissions.length,
                usedPermissions,
                unusedPermissions,
                utilizationRate
            }
        } catch (error) {
            logger.error(`[PermissionUsageAnalyticsService] getUserPermissionUtilization error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get user permission utilization')
        }
    }

    /**
     * Get user permissions
     * @param userId User ID
     * @returns User permissions
     */
    private async getUserPermissions(userId: string): Promise<string[]> {
        // This would typically come from a user-permission mapping table
        // For this implementation, we'll use a mock approach
        const userPermissionMappings = [
            {
                userId: 'user1',
                permissions: [
                    'read:users',
                    'write:users',
                    'read:roles',
                    'write:roles',
                    'read:permissions',
                    'read:organizations',
                    'read:workspaces',
                    'write:workspaces',
                    'read:resources',
                    'write:resources',
                    'delete:resources'
                ]
            },
            {
                userId: 'user2',
                permissions: [
                    'read:users',
                    'read:roles',
                    'read:permissions',
                    'read:organizations',
                    'read:workspaces',
                    'read:resources'
                ]
            }
        ]

        const userMapping = userPermissionMappings.find(mapping => mapping.userId === userId)
        return userMapping ? userMapping.permissions : []
    }

    /**
     * Get user permission mappings
     * @param organizationId Organization ID
     * @param workspaceId Workspace ID
     * @returns User permission mappings
     */
    private async getUserPermissionMappings(organizationId?: string, workspaceId?: string): Promise<any[]> {
        // This would typically come from a user-permission mapping table
        // For this implementation, we'll use a mock approach
        return [
            {
                userId: 'user1',
                permissions: [
                    'read:users',
                    'write:users',
                    'read:roles',
                    'write:roles',
                    'read:permissions',
                    'read:organizations',
                    'read:workspaces',
                    'write:workspaces',
                    'read:resources',
                    'write:resources',
                    'delete:resources'
                ]
            },
            {
                userId: 'user2',
                permissions: [
                    'read:users',
                    'read:roles',
                    'read:permissions',
                    'read:organizations',
                    'read:workspaces',
                    'read:resources'
                ]
            }
        ]
    }
}

export default new PermissionUsageAnalyticsService()