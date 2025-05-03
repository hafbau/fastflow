import { getRepository, Between, In, MoreThan, LessThan, FindOptionsWhere } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { AnalyticsMetric, MetricType, TimeGranularity } from '../../database/entities/AnalyticsMetric'
import { AnalyticsAlert, AlertType, AlertStatus, AlertSeverity } from '../../database/entities/AnalyticsAlert'
import logger from '../../utils/logger'

/**
 * Service for analytics
 */
class AnalyticsService {
    /**
     * Record a metric
     * @param params Metric parameters
     * @returns Created metric
     */
    async recordMetric(params: {
        metricType: MetricType
        metricName: string
        value: number
        timestamp?: Date
        granularity?: TimeGranularity
        organizationId?: string
        workspaceId?: string
        userId?: string
        resourceId?: string
        resourceType?: string
        dimensions?: Record<string, any>
    }): Promise<AnalyticsMetric> {
        try {
            const metricRepository = getRepository(AnalyticsMetric)
            
            const metric = new AnalyticsMetric()
            metric.metricType = params.metricType
            metric.metricName = params.metricName
            metric.value = params.value
            metric.timestamp = params.timestamp || new Date()
            metric.granularity = params.granularity || TimeGranularity.HOURLY
            
            if (params.organizationId) {
                metric.organizationId = params.organizationId
            }
            
            if (params.workspaceId) {
                metric.workspaceId = params.workspaceId
            }
            
            if (params.userId) {
                metric.userId = params.userId
            }
            
            if (params.resourceId) {
                metric.resourceId = params.resourceId
            }
            
            if (params.resourceType) {
                metric.resourceType = params.resourceType
            }
            
            if (params.dimensions) {
                metric.dimensions = params.dimensions
            }
            
            return await metricRepository.save(metric)
        } catch (error) {
            logger.error(`[AnalyticsService] recordMetric error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to record metric')
        }
    }
    
    /**
     * Get metrics
     * @param params Query parameters
     * @returns Metrics
     */
    async getMetrics(params: {
        startTime: Date
        endTime: Date
        metricType?: MetricType
        metricName?: string
        granularity?: TimeGranularity
        organizationId?: string
        workspaceId?: string
        userId?: string
        resourceId?: string
        resourceType?: string
    }): Promise<AnalyticsMetric[]> {
        try {
            const metricRepository = getRepository(AnalyticsMetric)
            
            const whereConditions: FindOptionsWhere<AnalyticsMetric> = {
                timestamp: Between(params.startTime, params.endTime)
            }
            
            if (params.metricType) {
                whereConditions.metricType = params.metricType
            }
            
            if (params.metricName) {
                whereConditions.metricName = params.metricName
            }
            
            if (params.granularity) {
                whereConditions.granularity = params.granularity
            }
            
            if (params.organizationId) {
                whereConditions.organizationId = params.organizationId
            }
            
            if (params.workspaceId) {
                whereConditions.workspaceId = params.workspaceId
            }
            
            if (params.userId) {
                whereConditions.userId = params.userId
            }
            
            if (params.resourceId) {
                whereConditions.resourceId = params.resourceId
            }
            
            if (params.resourceType) {
                whereConditions.resourceType = params.resourceType
            }
            
            return await metricRepository.find({
                where: whereConditions,
                order: {
                    timestamp: 'ASC'
                }
            })
        } catch (error) {
            logger.error(`[AnalyticsService] getMetrics error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get metrics')
        }
    }
    
    /**
     * Get metrics aggregated by time
     * @param params Query parameters
     * @returns Aggregated metrics
     */
    async getMetricsAggregatedByTime(params: {
        startTime: Date
        endTime: Date
        metricType: MetricType
        metricName: string
        granularity: TimeGranularity
        organizationId?: string
        workspaceId?: string
    }): Promise<any[]> {
        try {
            const metrics = await this.getMetrics({
                startTime: params.startTime,
                endTime: params.endTime,
                metricType: params.metricType,
                metricName: params.metricName,
                granularity: params.granularity,
                organizationId: params.organizationId,
                workspaceId: params.workspaceId
            })
            
            // Group metrics by time
            const timeMap = new Map<string, { timestamp: Date, value: number }>()
            
            for (const metric of metrics) {
                const timeKey = this.getTimeKey(metric.timestamp, params.granularity)
                
                if (!timeMap.has(timeKey)) {
                    timeMap.set(timeKey, {
                        timestamp: metric.timestamp,
                        value: 0
                    })
                }
                
                const timeData = timeMap.get(timeKey)!
                timeData.value += metric.value
            }
            
            // Fill in missing time periods with zero values
            const result = this.fillMissingTimePeriods(
                Array.from(timeMap.values()),
                params.startTime,
                params.endTime,
                params.granularity
            )
            
            return result
        } catch (error) {
            logger.error(`[AnalyticsService] getMetricsAggregatedByTime error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get aggregated metrics')
        }
    }
    
    /**
     * Create an alert
     * @param params Alert parameters
     * @returns Created alert
     */
    async createAlert(params: {
        name: string
        description?: string
        alertType: AlertType
        severity: AlertSeverity
        detectedAt?: Date
        organizationId?: string
        workspaceId?: string
        userId?: string
        resourceId?: string
        resourceType?: string
        context?: Record<string, any>
    }): Promise<AnalyticsAlert> {
        try {
            const alertRepository = getRepository(AnalyticsAlert)
            
            const alert = new AnalyticsAlert()
            alert.name = params.name
            alert.alertType = params.alertType
            alert.severity = params.severity
            alert.status = AlertStatus.OPEN
            alert.detectedAt = params.detectedAt || new Date()
            
            if (params.description) {
                alert.description = params.description
            }
            
            if (params.organizationId) {
                alert.organizationId = params.organizationId
            }
            
            if (params.workspaceId) {
                alert.workspaceId = params.workspaceId
            }
            
            if (params.userId) {
                alert.userId = params.userId
            }
            
            if (params.resourceId) {
                alert.resourceId = params.resourceId
            }
            
            if (params.resourceType) {
                alert.resourceType = params.resourceType
            }
            
            if (params.context) {
                alert.context = params.context
            }
            
            return await alertRepository.save(alert)
        } catch (error) {
            logger.error(`[AnalyticsService] createAlert error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create alert')
        }
    }
    
    /**
     * Get alerts
     * @param params Query parameters
     * @returns Alerts
     */
    async getAlerts(params: {
        startTime: Date
        endTime: Date
        alertType?: AlertType
        severity?: AlertSeverity
        status?: AlertStatus
        organizationId?: string
        workspaceId?: string
        userId?: string
        resourceId?: string
        resourceType?: string
        limit?: number
    }): Promise<AnalyticsAlert[]> {
        try {
            const alertRepository = getRepository(AnalyticsAlert)
            
            const whereConditions: FindOptionsWhere<AnalyticsAlert> = {
                detectedAt: Between(params.startTime, params.endTime)
            }
            
            if (params.alertType) {
                whereConditions.alertType = params.alertType
            }
            
            if (params.severity) {
                whereConditions.severity = params.severity
            }
            
            if (params.status) {
                whereConditions.status = params.status
            }
            
            if (params.organizationId) {
                whereConditions.organizationId = params.organizationId
            }
            
            if (params.workspaceId) {
                whereConditions.workspaceId = params.workspaceId
            }
            
            if (params.userId) {
                whereConditions.userId = params.userId
            }
            
            if (params.resourceId) {
                whereConditions.resourceId = params.resourceId
            }
            
            if (params.resourceType) {
                whereConditions.resourceType = params.resourceType
            }
            
            return await alertRepository.find({
                where: whereConditions,
                order: {
                    detectedAt: 'DESC'
                },
                take: params.limit
            })
        } catch (error) {
            logger.error(`[AnalyticsService] getAlerts error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get alerts')
        }
    }
    
    /**
     * Update alert status
     * @param alertId Alert ID
     * @param status New status
     * @param resolution Resolution details (required for resolved status)
     * @returns Updated alert
     */
    async updateAlertStatus(alertId: string, status: AlertStatus, resolution?: string): Promise<AnalyticsAlert> {
        try {
            const alertRepository = getRepository(AnalyticsAlert)
            
            const alert = await alertRepository.findOne({ where: { id: alertId } })
            
            if (!alert) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'Alert not found')
            }
            
            alert.status = status
            
            if (status === AlertStatus.RESOLVED) {
                if (!resolution) {
                    throw new InternalFastflowError(StatusCodes.BAD_REQUEST, 'Resolution is required for resolved status')
                }
                
                alert.resolution = resolution
                alert.resolvedAt = new Date()
            }
            
            return await alertRepository.save(alert)
        } catch (error) {
            logger.error(`[AnalyticsService] updateAlertStatus error: ${error}`)
            
            if (error instanceof InternalFastflowError) {
                throw error
            }
            
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update alert status')
        }
    }
    
    /**
     * Get time key for grouping metrics by time
     * @param date Date
     * @param granularity Time granularity
     * @returns Time key
     */
    private getTimeKey(date: Date, granularity: TimeGranularity): string {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hour = date.getHours()
        
        switch (granularity) {
            case TimeGranularity.HOURLY:
                return `${year}-${month}-${day}-${hour}`
            case TimeGranularity.DAILY:
                return `${year}-${month}-${day}`
            case TimeGranularity.WEEKLY:
                // Get the week number (1-53)
                const weekNumber = Math.ceil((((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7)
                return `${year}-W${weekNumber}`
            case TimeGranularity.MONTHLY:
                return `${year}-${month}`
            default:
                return `${year}-${month}-${day}-${hour}`
        }
    }
    
    /**
     * Fill in missing time periods with zero values
     * @param data Existing data
     * @param startTime Start time
     * @param endTime End time
     * @param granularity Time granularity
     * @returns Complete data with missing time periods filled in
     */
    private fillMissingTimePeriods(
        data: { timestamp: Date, value: number }[],
        startTime: Date,
        endTime: Date,
        granularity: TimeGranularity
    ): { timestamp: Date, value: number }[] {
        const result: { timestamp: Date, value: number }[] = []
        
        // Create a map of existing data
        const dataMap = new Map<string, { timestamp: Date, value: number }>()
        
        for (const item of data) {
            const timeKey = this.getTimeKey(item.timestamp, granularity)
            dataMap.set(timeKey, item)
        }
        
        // Generate all time periods between start and end
        let currentTime = new Date(startTime)
        
        while (currentTime <= endTime) {
            const timeKey = this.getTimeKey(currentTime, granularity)
            
            if (dataMap.has(timeKey)) {
                result.push(dataMap.get(timeKey)!)
            } else {
                result.push({
                    timestamp: new Date(currentTime),
                    value: 0
                })
            }
            
            // Increment current time based on granularity
            switch (granularity) {
                case TimeGranularity.HOURLY:
                    currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000) // Add 1 hour
                    break
                case TimeGranularity.DAILY:
                    currentTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000) // Add 1 day
                    break
                case TimeGranularity.WEEKLY:
                    currentTime = new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000) // Add 1 week
                    break
                case TimeGranularity.MONTHLY:
                    // Add 1 month
                    const year = currentTime.getFullYear()
                    const month = currentTime.getMonth()
                    currentTime = new Date(year, month + 1, 1)
                    break
                default:
                    currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000) // Add 1 hour
            }
        }
        
        return result
    }
}

export default new AnalyticsService()