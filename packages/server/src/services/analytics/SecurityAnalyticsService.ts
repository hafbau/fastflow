import { getRepository, Between, In, MoreThan, LessThan, FindOptionsWhere } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { AuditLog } from '../../database/entities/AuditLog'
import { AnalyticsMetric, MetricType, TimeGranularity } from '../../database/entities/AnalyticsMetric'
import { AnalyticsAlert, AlertType, AlertStatus, AlertSeverity } from '../../database/entities/AnalyticsAlert'
import analyticsService from './AnalyticsService'
import logger from '../../utils/logger'

/**
 * Service for security analytics
 */
class SecurityAnalyticsService {
    /**
     * Analyze security data
     * @param params Analysis parameters
     * @returns Security analysis
     */
    async analyzeSecurityData(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
        granularity: TimeGranularity
    }): Promise<any> {
        try {
            const { startTime, endTime, organizationId, workspaceId, granularity } = params
            
            // Get authentication failures
            const authFailures = await this.getAuthenticationFailures({
                startTime,
                endTime,
                organizationId,
                workspaceId,
                granularity
            })
            
            // Get permission denials
            const permissionDenials = await this.getPermissionDenials({
                startTime,
                endTime,
                organizationId,
                workspaceId,
                granularity
            })
            
            // Get suspicious activities
            const suspiciousActivities = await this.getSuspiciousActivities({
                startTime,
                endTime,
                organizationId,
                workspaceId
            })
            
            // Get security alerts
            const securityAlerts = await this.getSecurityAlerts({
                startTime,
                endTime,
                organizationId,
                workspaceId
            })
            
            // Calculate summary metrics
            const summary = this.calculateSecuritySummary({
                authFailures,
                permissionDenials,
                suspiciousActivities,
                securityAlerts
            })
            
            // Get alerts by severity
            const alertsBySeverity = this.getAlertsBySeverity(securityAlerts.alerts)
            
            // Get alerts by type
            const alertsByType = this.getAlertsByType(securityAlerts.alerts)
            
            // Get alerts trend
            const alertsTrend = await analyticsService.getMetricsAggregatedByTime({
                startTime,
                endTime,
                metricType: MetricType.SECURITY,
                metricName: 'security_alert',
                granularity,
                organizationId,
                workspaceId
            })
            
            return {
                summary,
                authFailures,
                permissionDenials,
                suspiciousActivities,
                securityAlerts,
                alertsBySeverity,
                alertsByType,
                alertsTrend
            }
        } catch (error) {
            logger.error(`[SecurityAnalyticsService] analyzeSecurityData error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to analyze security data')
        }
    }
    
    /**
     * Get security analytics (alias for analyzeSecurityData)
     * @param params Analysis parameters
     * @returns Security analysis
     */
    async getSecurityAnalytics(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
        granularity: TimeGranularity
    }): Promise<any> {
        return this.analyzeSecurityData(params);
    }
    
    /**
     * Get authentication failures
     * @param params Query parameters
     * @returns Authentication failures
     */
    private async getAuthenticationFailures(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
        granularity: TimeGranularity
    }): Promise<any> {
        try {
            const { startTime, endTime, organizationId, workspaceId, granularity } = params
            const auditLogRepository = getRepository(AuditLog)
            
            // Create metadata condition
            const metadata: Record<string, any> = {}
            
            if (organizationId) {
                metadata.organizationId = organizationId
            }
            
            if (workspaceId) {
                metadata.workspaceId = workspaceId
            }
            
            // Get all authentication failure logs
            const whereConditions: FindOptionsWhere<AuditLog> = {
                timestamp: Between(startTime, endTime),
                action: 'authentication'
            }
            
            // Add metadata condition for status
            if (!whereConditions.metadata) {
                whereConditions.metadata = { status: 'failure' }
            } else if (typeof whereConditions.metadata === 'object' && whereConditions.metadata !== null) {
                const metadataObj = whereConditions.metadata as Record<string, any>;
                whereConditions.metadata = { ...metadataObj, status: 'failure' }
            } else {
                // If metadata is not an object, create a new object
                whereConditions.metadata = { status: 'failure' }
            }
            
            if (Object.keys(metadata).length > 0) {
                whereConditions.metadata = metadata
            }
            
            const authFailureLogs = await auditLogRepository.find({
                where: whereConditions,
                select: ['userId', 'timestamp', 'metadata', 'ipAddress']
            })
            
            // Get authentication failure trends
            const authFailureTrends = await analyticsService.getMetricsAggregatedByTime({
                startTime,
                endTime,
                metricType: MetricType.SECURITY,
                metricName: 'auth_failure',
                granularity,
                organizationId,
                workspaceId
            })
            
            // Group by user
            const userFailureMap = new Map<string, {
                userId: string
                userName?: string
                failureCount: number
                lastFailure: Date
                ipAddresses: Set<string>
            }>()
            
            for (const log of authFailureLogs) {
                const userId = log.userId || log.metadata?.userId || 'unknown'
                
                if (!userFailureMap.has(userId)) {
                    userFailureMap.set(userId, {
                        userId,
                        userName: log.metadata?.userName,
                        failureCount: 0,
                        lastFailure: log.timestamp,
                        ipAddresses: new Set()
                    })
                }
                
                const userFailure = userFailureMap.get(userId)!
                userFailure.failureCount++
                
                if (log.timestamp > userFailure.lastFailure) {
                    userFailure.lastFailure = log.timestamp
                }
                
                if (log.ipAddress) {
                    userFailure.ipAddresses.add(log.ipAddress)
                }
            }
            
            // Convert to array and sort by failure count
            const topFailedUsers = Array.from(userFailureMap.values())
                .map(user => ({
                    ...user,
                    ipAddresses: Array.from(user.ipAddresses)
                }))
                .sort((a, b) => b.failureCount - a.failureCount)
                .slice(0, 10)
            
            // Calculate metrics
            const totalFailures = authFailureLogs.length
            const uniqueUsers = userFailureMap.size
            const uniqueIPs = new Set(authFailureLogs.map(log => log.ipAddress).filter(Boolean)).size
            
            return {
                metrics: {
                    totalFailures,
                    uniqueUsers,
                    uniqueIPs
                },
                trends: authFailureTrends,
                topFailedUsers
            }
        } catch (error) {
            logger.error(`[SecurityAnalyticsService] getAuthenticationFailures error: ${error}`)
            return {
                metrics: {
                    totalFailures: 0,
                    uniqueUsers: 0,
                    uniqueIPs: 0
                },
                trends: [],
                topFailedUsers: []
            }
        }
    }
    
    /**
     * Get permission denials
     * @param params Query parameters
     * @returns Permission denials
     */
    private async getPermissionDenials(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
        granularity: TimeGranularity
    }): Promise<any> {
        try {
            const { startTime, endTime, organizationId, workspaceId, granularity } = params
            const auditLogRepository = getRepository(AuditLog)
            
            // Create metadata condition
            const metadata: Record<string, any> = {}
            
            if (organizationId) {
                metadata.organizationId = organizationId
            }
            
            if (workspaceId) {
                metadata.workspaceId = workspaceId
            }
            
            // Get all permission denial logs
            const whereConditions: FindOptionsWhere<AuditLog> = {
                timestamp: Between(startTime, endTime),
                action: 'permission_check'
            }
            
            // Add metadata condition for status
            if (!whereConditions.metadata) {
                whereConditions.metadata = { status: 'denied' }
            } else if (typeof whereConditions.metadata === 'object' && whereConditions.metadata !== null) {
                const metadataObj = whereConditions.metadata as Record<string, any>;
                whereConditions.metadata = { ...metadataObj, status: 'denied' }
            } else {
                // If metadata is not an object, create a new object
                whereConditions.metadata = { status: 'denied' }
            }
            
            if (Object.keys(metadata).length > 0) {
                whereConditions.metadata = metadata
            }
            
            const permissionDenialLogs = await auditLogRepository.find({
                where: whereConditions,
                select: ['userId', 'timestamp', 'metadata', 'resourceId', 'resourceType']
            })
            
            // Get permission denial trends
            const permissionDenialTrends = await analyticsService.getMetricsAggregatedByTime({
                startTime,
                endTime,
                metricType: MetricType.SECURITY,
                metricName: 'permission_denial',
                granularity,
                organizationId,
                workspaceId
            })
            
            // Group by permission
            const permissionDenialMap = new Map<string, {
                permission: string
                denialCount: number
                uniqueUsers: Set<string>
                lastDenial: Date
            }>()
            
            for (const log of permissionDenialLogs) {
                if (!log.metadata?.permission) continue
                
                const permission = log.metadata.permission
                
                if (!permissionDenialMap.has(permission)) {
                    permissionDenialMap.set(permission, {
                        permission,
                        denialCount: 0,
                        uniqueUsers: new Set(),
                        lastDenial: log.timestamp
                    })
                }
                
                const permissionDenial = permissionDenialMap.get(permission)!
                permissionDenial.denialCount++
                
                if (log.userId) {
                    permissionDenial.uniqueUsers.add(log.userId)
                }
                
                if (log.timestamp > permissionDenial.lastDenial) {
                    permissionDenial.lastDenial = log.timestamp
                }
            }
            
            // Convert to array and sort by denial count
            const topDeniedPermissions = Array.from(permissionDenialMap.values())
                .map(permission => ({
                    ...permission,
                    uniqueUsers: permission.uniqueUsers.size
                }))
                .sort((a, b) => b.denialCount - a.denialCount)
                .slice(0, 10)
            
            // Group by user
            const userDenialMap = new Map<string, {
                userId: string
                userName?: string
                denialCount: number
                uniquePermissions: Set<string>
                lastDenial: Date
            }>()
            
            for (const log of permissionDenialLogs) {
                if (!log.userId) continue
                
                if (!userDenialMap.has(log.userId)) {
                    userDenialMap.set(log.userId, {
                        userId: log.userId,
                        userName: log.metadata?.userName,
                        denialCount: 0,
                        uniquePermissions: new Set(),
                        lastDenial: log.timestamp
                    })
                }
                
                const userDenial = userDenialMap.get(log.userId)!
                userDenial.denialCount++
                
                if (log.metadata?.permission) {
                    userDenial.uniquePermissions.add(log.metadata.permission)
                }
                
                if (log.timestamp > userDenial.lastDenial) {
                    userDenial.lastDenial = log.timestamp
                }
            }
            
            // Convert to array and sort by denial count
            const topDeniedUsers = Array.from(userDenialMap.values())
                .map(user => ({
                    ...user,
                    uniquePermissions: user.uniquePermissions.size
                }))
                .sort((a, b) => b.denialCount - a.denialCount)
                .slice(0, 10)
            
            // Calculate metrics
            const totalDenials = permissionDenialLogs.length
            const uniqueUsers = userDenialMap.size
            const uniquePermissions = permissionDenialMap.size
            
            return {
                metrics: {
                    totalDenials,
                    uniqueUsers,
                    uniquePermissions
                },
                trends: permissionDenialTrends,
                topDeniedPermissions,
                topDeniedUsers
            }
        } catch (error) {
            logger.error(`[SecurityAnalyticsService] getPermissionDenials error: ${error}`)
            return {
                metrics: {
                    totalDenials: 0,
                    uniqueUsers: 0,
                    uniquePermissions: 0
                },
                trends: [],
                topDeniedPermissions: [],
                topDeniedUsers: []
            }
        }
    }
    
    /**
     * Get suspicious activities
     * @param params Query parameters
     * @returns Suspicious activities
     */
    private async getSuspiciousActivities(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
    }): Promise<any> {
        try {
            const { startTime, endTime, organizationId, workspaceId } = params
            const alertRepository = getRepository(AnalyticsAlert)
            
            // Get all suspicious activity alerts
            const whereConditions: FindOptionsWhere<AnalyticsAlert> = {
                detectedAt: Between(startTime, endTime),
                alertType: AlertType.SECURITY,
                context: {
                    activityType: 'suspicious'
                }
            }
            
            if (organizationId) {
                whereConditions.organizationId = organizationId
            }
            
            if (workspaceId) {
                whereConditions.workspaceId = workspaceId
            }
            
            const suspiciousActivityAlerts = await alertRepository.find({
                where: whereConditions,
                order: {
                    detectedAt: 'DESC'
                }
            })
            
            // Group by activity type
            const activityTypeMap = new Map<string, {
                activityType: string
                count: number
                criticalCount: number
                highCount: number
                mediumCount: number
                lowCount: number
            }>()
            
            for (const alert of suspiciousActivityAlerts) {
                if (!alert.context?.activityType) continue
                
                const activityType = alert.context.activityType
                
                if (!activityTypeMap.has(activityType)) {
                    activityTypeMap.set(activityType, {
                        activityType,
                        count: 0,
                        criticalCount: 0,
                        highCount: 0,
                        mediumCount: 0,
                        lowCount: 0
                    })
                }
                
                const activityTypeStats = activityTypeMap.get(activityType)!
                activityTypeStats.count++
                
                switch (alert.severity) {
                    case AlertSeverity.CRITICAL:
                        activityTypeStats.criticalCount++
                        break
                    case AlertSeverity.HIGH:
                        activityTypeStats.highCount++
                        break
                    case AlertSeverity.MEDIUM:
                        activityTypeStats.mediumCount++
                        break
                    case AlertSeverity.LOW:
                        activityTypeStats.lowCount++
                        break
                }
            }
            
            // Convert to array and sort by count
            const activityTypes = Array.from(activityTypeMap.values())
                .sort((a, b) => b.count - a.count)
            
            // Calculate metrics
            const totalActivities = suspiciousActivityAlerts.length
            const criticalActivities = suspiciousActivityAlerts.filter(a => a.severity === AlertSeverity.CRITICAL).length
            const highActivities = suspiciousActivityAlerts.filter(a => a.severity === AlertSeverity.HIGH).length
            const openActivities = suspiciousActivityAlerts.filter(a => a.status === AlertStatus.OPEN).length
            
            return {
                metrics: {
                    totalActivities,
                    criticalActivities,
                    highActivities,
                    openActivities
                },
                activityTypes,
                recentActivities: suspiciousActivityAlerts.slice(0, 10)
            }
        } catch (error) {
            logger.error(`[SecurityAnalyticsService] getSuspiciousActivities error: ${error}`)
            return {
                metrics: {
                    totalActivities: 0,
                    criticalActivities: 0,
                    highActivities: 0,
                    openActivities: 0
                },
                activityTypes: [],
                recentActivities: []
            }
        }
    }
    
    /**
     * Get security alerts
     * @param params Query parameters
     * @returns Security alerts
     */
    private async getSecurityAlerts(params: {
        startTime: Date
        endTime: Date
        organizationId?: string
        workspaceId?: string
    }): Promise<any> {
        try {
            const { startTime, endTime, organizationId, workspaceId } = params
            
            // Get all security alerts
            const alerts = await analyticsService.getAlerts({
                startTime,
                endTime,
                alertType: AlertType.SECURITY,
                organizationId,
                workspaceId
            })
            
            // Calculate metrics
            const totalAlerts = alerts.length
            const criticalAlerts = alerts.filter(a => a.severity === AlertSeverity.CRITICAL).length
            const highAlerts = alerts.filter(a => a.severity === AlertSeverity.HIGH).length
            const openAlerts = alerts.filter(a => a.status === AlertStatus.OPEN).length
            
            return {
                metrics: {
                    totalAlerts,
                    criticalAlerts,
                    highAlerts,
                    openAlerts
                },
                alerts
            }
        } catch (error) {
            logger.error(`[SecurityAnalyticsService] getSecurityAlerts error: ${error}`)
            return {
                metrics: {
                    totalAlerts: 0,
                    criticalAlerts: 0,
                    highAlerts: 0,
                    openAlerts: 0
                },
                alerts: []
            }
        }
    }
    
    /**
     * Calculate security summary
     * @param params Analysis results
     * @returns Summary metrics
     */
    private calculateSecuritySummary(params: {
        authFailures: any
        permissionDenials: any
        suspiciousActivities: any
        securityAlerts: any
    }): any {
        try {
            const { authFailures, permissionDenials, suspiciousActivities, securityAlerts } = params
            
            // Calculate total metrics
            const totalAuthFailures = authFailures.metrics.totalFailures
            const totalPermissionDenials = permissionDenials.metrics.totalDenials
            const totalSuspiciousActivities = suspiciousActivities.metrics.totalActivities
            const totalAlerts = securityAlerts.metrics.totalAlerts
            
            // Calculate critical metrics
            const criticalAlerts = securityAlerts.metrics.criticalAlerts
            const highAlerts = securityAlerts.metrics.highAlerts
            const criticalActivities = suspiciousActivities.metrics.criticalActivities
            
            // Calculate security score (lower is better)
            // This is a simplified calculation - in a real system, this would be more sophisticated
            const securityScore = Math.max(0, 100 - (
                (criticalAlerts * 10) +
                (highAlerts * 5) +
                (criticalActivities * 8) +
                (totalAuthFailures > 100 ? 20 : totalAuthFailures / 5) +
                (totalPermissionDenials > 100 ? 15 : totalPermissionDenials / 7)
            ))
            
            return {
                totalAuthFailures,
                totalPermissionDenials,
                totalSuspiciousActivities,
                totalAlerts,
                criticalAlerts,
                highAlerts,
                securityScore
            }
        } catch (error) {
            logger.error(`[SecurityAnalyticsService] calculateSecuritySummary error: ${error}`)
            return {
                totalAuthFailures: 0,
                totalPermissionDenials: 0,
                totalSuspiciousActivities: 0,
                totalAlerts: 0,
                criticalAlerts: 0,
                highAlerts: 0,
                securityScore: 100
            }
        }
    }
    
    /**
     * Get alerts by severity
     * @param alerts Alerts
     * @returns Alerts grouped by severity
     */
    private getAlertsBySeverity(alerts: AnalyticsAlert[]): any[] {
        try {
            const severityMap = new Map<string, number>()
            
            // Initialize all severities
            severityMap.set(AlertSeverity.CRITICAL, 0)
            severityMap.set(AlertSeverity.HIGH, 0)
            severityMap.set(AlertSeverity.MEDIUM, 0)
            severityMap.set(AlertSeverity.LOW, 0)
            severityMap.set(AlertSeverity.INFO, 0)
            
            // Count alerts by severity
            for (const alert of alerts) {
                const count = severityMap.get(alert.severity) || 0
                severityMap.set(alert.severity, count + 1)
            }
            
            // Convert to array
            return Array.from(severityMap.entries()).map(([severity, count]) => ({
                severity,
                count
            }))
        } catch (error) {
            logger.error(`[SecurityAnalyticsService] getAlertsBySeverity error: ${error}`)
            return []
        }
    }
    
    /**
     * Get alerts by type
     * @param alerts Alerts
     * @returns Alerts grouped by type
     */
    private getAlertsByType(alerts: AnalyticsAlert[]): any[] {
        try {
            const typeMap = new Map<string, number>()
            
            // Count alerts by type
            for (const alert of alerts) {
                if (!alert.context?.type) continue
                
                const type = alert.context.type
                const count = typeMap.get(type) || 0
                typeMap.set(type, count + 1)
            }
            
            // Convert to array
            return Array.from(typeMap.entries()).map(([type, count]) => ({
                type,
                count
            })).sort((a, b) => b.count - a.count)
        } catch (error) {
            logger.error(`[SecurityAnalyticsService] getAlertsByType error: ${error}`)
            return []
        }
    }
}

export default new SecurityAnalyticsService()