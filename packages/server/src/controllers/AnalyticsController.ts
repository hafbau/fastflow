import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { TimeGranularity } from '../database/entities/AnalyticsMetric'
import analyticsService from '../services/analytics/AnalyticsService'
import permissionAnalyticsService from '../services/analytics/PermissionAnalyticsService'
import complianceAnalyticsService from '../services/analytics/ComplianceAnalyticsService'
import securityAnalyticsService from '../services/analytics/SecurityAnalyticsService'
import logger from '../utils/logger'

/**
 * Analytics Controller
 * Handles analytics API requests
 */
class AnalyticsController {
    /**
     * Get permission analytics
     * @param req Request
     * @param res Response
     */
    async getPermissionAnalytics(req: Request, res: Response): Promise<void> {
        try {
            const { startTime, endTime, granularity = TimeGranularity.DAILY } = req.query
            const organizationId = req.query.organizationId as string
            const workspaceId = req.query.workspaceId as string
            
            // Validate required parameters
            if (!startTime || !endTime) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'startTime and endTime are required'
                })
                return
            }
            
            // Parse dates
            const startDate = new Date(startTime as string)
            const endDate = new Date(endTime as string)
            
            // Validate dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Invalid date format'
                })
                return
            }
            
            // Get permission analytics
            const permissionAnalytics = await permissionAnalyticsService.analyzePermissionUsage({
                startTime: startDate,
                endTime: endDate,
                organizationId,
                workspaceId,
                granularity: granularity as TimeGranularity
            })
            
            res.status(StatusCodes.OK).json(permissionAnalytics)
        } catch (error) {
            logger.error(`[AnalyticsController] getPermissionAnalytics error: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: 'Failed to get permission analytics'
            })
        }
    }
    
    /**
     * Get compliance analytics
     * @param req Request
     * @param res Response
     */
    async getComplianceAnalytics(req: Request, res: Response): Promise<void> {
        try {
            const { startTime, endTime } = req.query
            const organizationId = req.query.organizationId as string
            const workspaceId = req.query.workspaceId as string
            
            // Validate required parameters
            if (!startTime || !endTime) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'startTime and endTime are required'
                })
                return
            }
            
            // Parse dates
            const startDate = new Date(startTime as string)
            const endDate = new Date(endTime as string)
            
            // Validate dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Invalid date format'
                })
                return
            }
            
            // Get compliance analytics
            const complianceAnalytics = await complianceAnalyticsService.getComplianceStatus({
                startTime: startDate,
                endTime: endDate,
                organizationId,
                workspaceId
            })
            
            res.status(StatusCodes.OK).json(complianceAnalytics)
        } catch (error) {
            logger.error(`[AnalyticsController] getComplianceAnalytics error: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: 'Failed to get compliance analytics'
            })
        }
    }
    
    /**
     * Get security analytics
     * @param req Request
     * @param res Response
     */
    async getSecurityAnalytics(req: Request, res: Response): Promise<void> {
        try {
            const { startTime, endTime, granularity = TimeGranularity.DAILY } = req.query
            const organizationId = req.query.organizationId as string
            const workspaceId = req.query.workspaceId as string
            
            // Validate required parameters
            if (!startTime || !endTime) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'startTime and endTime are required'
                })
                return
            }
            
            // Parse dates
            const startDate = new Date(startTime as string)
            const endDate = new Date(endTime as string)
            
            // Validate dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Invalid date format'
                })
                return
            }
            
            // Get security analytics
            const securityAnalytics = await securityAnalyticsService.getSecurityAnalytics({
                startTime: startDate,
                endTime: endDate,
                organizationId,
                workspaceId,
                granularity: granularity as TimeGranularity
            })
            
            res.status(StatusCodes.OK).json(securityAnalytics)
        } catch (error) {
            logger.error(`[AnalyticsController] getSecurityAnalytics error: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: 'Failed to get security analytics'
            })
        }
    }
    
    /**
     * Get alerts
     * @param req Request
     * @param res Response
     */
    async getAlerts(req: Request, res: Response): Promise<void> {
        try {
            const { startTime, endTime, alertType, severity, status, limit = 100 } = req.query
            const organizationId = req.query.organizationId as string
            const workspaceId = req.query.workspaceId as string
            const userId = req.query.userId as string
            const resourceId = req.query.resourceId as string
            const resourceType = req.query.resourceType as string
            
            // Validate required parameters
            if (!startTime || !endTime) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'startTime and endTime are required'
                })
                return
            }
            
            // Parse dates
            const startDate = new Date(startTime as string)
            const endDate = new Date(endTime as string)
            
            // Validate dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Invalid date format'
                })
                return
            }
            
            // Get alerts
            const alerts = await analyticsService.getAlerts({
                startTime: startDate,
                endTime: endDate,
                alertType: alertType as any,
                severity: severity as any,
                status: status as any,
                organizationId,
                workspaceId,
                userId,
                resourceId,
                resourceType,
                limit: Number(limit)
            })
            
            res.status(StatusCodes.OK).json(alerts)
        } catch (error) {
            logger.error(`[AnalyticsController] getAlerts error: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: 'Failed to get alerts'
            })
        }
    }
    
    /**
     * Update alert status
     * @param req Request
     * @param res Response
     */
    async updateAlertStatus(req: Request, res: Response): Promise<void> {
        try {
            const { alertId } = req.params
            const { status, resolution } = req.body
            
            // Validate required parameters
            if (!alertId || !status) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'alertId and status are required'
                })
                return
            }
            
            // Update alert status
            const updatedAlert = await analyticsService.updateAlertStatus(alertId, status, resolution)
            
            res.status(StatusCodes.OK).json(updatedAlert)
        } catch (error) {
            logger.error(`[AnalyticsController] updateAlertStatus error: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: 'Failed to update alert status'
            })
        }
    }
    
    /**
     * Get user permission utilization
     * @param req Request
     * @param res Response
     */
    async getUserPermissionUtilization(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params
            const { startTime, endTime } = req.query
            
            // Validate required parameters
            if (!userId || !startTime || !endTime) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'userId, startTime, and endTime are required'
                })
                return
            }
            
            // Parse dates
            const startDate = new Date(startTime as string)
            const endDate = new Date(endTime as string)
            
            // Validate dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Invalid date format'
                })
                return
            }
            
            // Get user permission utilization
            const utilization = await permissionAnalyticsService.getUserPermissionUtilization(
                userId,
                startDate,
                endDate
            )
            
            res.status(StatusCodes.OK).json(utilization)
        } catch (error) {
            logger.error(`[AnalyticsController] getUserPermissionUtilization error: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: 'Failed to get user permission utilization'
            })
        }
    }
}

export default new AnalyticsController()