import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import auditLogsService from '../services/audit-logs'
import logger from '../utils/logger'

/**
 * Controller for audit log operations
 */
class AuditLogController {
    /**
     * Get audit logs with filtering and pagination
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    async getAuditLogs(req: Request, res: Response) {
        try {
            const {
                userId,
                action,
                resourceType,
                resourceId,
                startDate,
                endDate,
                limit = '10',
                offset = '0',
                sortBy = 'timestamp',
                sortOrder = 'desc'
            } = req.query as Record<string, string>

            // Parse dates if provided
            const parsedStartDate = startDate ? new Date(startDate) : undefined
            const parsedEndDate = endDate ? new Date(endDate) : undefined

            // Parse limit and offset
            const parsedLimit = parseInt(limit, 10)
            const parsedOffset = parseInt(offset, 10)

            // Get audit logs
            const { logs, total } = await auditLogsService.getAuditLogs({
                userId,
                action,
                resourceType,
                resourceId,
                startDate: parsedStartDate,
                endDate: parsedEndDate,
                limit: parsedLimit,
                offset: parsedOffset
            })

            res.status(StatusCodes.OK).json({
                logs,
                total,
                limit: parsedLimit,
                offset: parsedOffset
            })
        } catch (error: any) {
            logger.error(`[AuditLogController] getAuditLogs error: ${error}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to get audit logs'
            })
        }
    }

    /**
     * Get audit log by ID
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    async getAuditLogById(req: Request, res: Response) {
        try {
            const { id } = req.params

            const log = await auditLogsService.getAuditLogById(id)

            res.status(StatusCodes.OK).json(log)
        } catch (error: any) {
            logger.error(`[AuditLogController] getAuditLogById error: ${error}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to get audit log'
            })
        }
    }

    /**
     * Export audit logs as CSV
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    async exportAuditLogs(req: Request, res: Response) {
        try {
            const {
                userId,
                action,
                resourceType,
                resourceId,
                startDate,
                endDate,
                sortBy = 'timestamp',
                sortOrder = 'desc'
            } = req.query as Record<string, string>

            // Parse dates if provided
            const parsedStartDate = startDate ? new Date(startDate) : undefined
            const parsedEndDate = endDate ? new Date(endDate) : undefined

            // Get all audit logs for export (no pagination)
            const { logs } = await auditLogsService.getAuditLogs({
                userId,
                action,
                resourceType,
                resourceId,
                startDate: parsedStartDate,
                endDate: parsedEndDate,
                limit: 10000, // Set a reasonable limit for export
                offset: 0
            })

            // Format logs for CSV
            const csvData = logs.map(log => ({
                ...log,
                timestamp: new Date(log.timestamp).toISOString(),
                metadata: log.metadata ? JSON.stringify(log.metadata) : ''
            }))

            // Generate CSV manually
            const headers = ['ID', 'Timestamp', 'User ID', 'Action', 'Resource Type', 'Resource ID', 'IP Address', 'Metadata']
            const rows = csvData.map(log => [
                log.id,
                log.timestamp,
                log.userId || '',
                log.action,
                log.resourceType,
                log.resourceId || '',
                log.ipAddress || '',
                log.metadata
            ])
            
            // Convert to CSV string
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            ].join('\n')

            // Set response headers
            res.setHeader('Content-Type', 'text/csv')
            res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`)

            // Send CSV
            res.status(StatusCodes.OK).send(csvContent)
        } catch (error: any) {
            logger.error(`[AuditLogController] exportAuditLogs error: ${error}`)
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to export audit logs'
            })
        }
    }

}

export default new AuditLogController()