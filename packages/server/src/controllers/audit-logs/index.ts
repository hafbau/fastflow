import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import auditLogsService from '../../services/audit-logs'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import logger from '../../utils/logger'


/**
 * Get audit logs with filtering and pagination
 */
const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const { 
            userId, 
            action, 
            resourceType, 
            resourceId, 
            startDate, 
            endDate,
            limit = 50,
            offset = 0
        } = req.query

        // Parse dates if provided
        const parsedStartDate = startDate ? new Date(startDate as string) : undefined
        const parsedEndDate = endDate ? new Date(endDate as string) : undefined
        
        // Parse limit and offset
        const parsedLimit = limit ? parseInt(limit as string, 10) : 50
        const parsedOffset = offset ? parseInt(offset as string, 10) : 0

        const result = await auditLogsService.getAuditLogs({
            userId: userId as string,
            action: action as string,
            resourceType: resourceType as string,
            resourceId: resourceId as string,
            startDate: parsedStartDate,
            endDate: parsedEndDate,
            limit: parsedLimit,
            offset: parsedOffset
        })

        return res.status(StatusCodes.OK).json(result)
    } catch (error) {
        logger.error(`[AuditLogController] getAuditLogs error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get audit logs' })
    }
}

/**
 * Get audit log by ID
 */
const getAuditLogById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const auditLog = await auditLogsService.getAuditLogById(id)
        return res.status(StatusCodes.OK).json(auditLog)
    } catch (error) {
        logger.error(`[AuditLogController] getAuditLogById error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get audit log' })
    }
}

/**
 * Create a new audit log entry
 * This is primarily for internal use, but exposed as an API for testing
 */
const createAuditLog = async (req: Request, res: Response) => {
    try {
        const auditLogData = req.body
        
        // Set user ID from authenticated user if not provided
        const userId = (req as any).user?.id
        if (userId && !auditLogData.userId) {
            auditLogData.userId = userId
        }
        
        // Set IP address if not provided
        if (!auditLogData.ipAddress) {
            auditLogData.ipAddress = req.ip
        }
        
        // Set timestamp if not provided
        if (!auditLogData.timestamp) {
            auditLogData.timestamp = new Date()
        }
        
        const auditLog = await auditLogsService.createAuditLog(auditLogData)
        return res.status(StatusCodes.CREATED).json(auditLog)
    } catch (error) {
        logger.error(`[AuditLogController] createAuditLog error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create audit log' })
    }
}

/**
 * Export audit logs to CSV
 */
const exportAuditLogs = async (req: Request, res: Response) => {
    try {
        const { 
            userId, 
            action, 
            resourceType, 
            resourceId, 
            startDate, 
            endDate
        } = req.query

        // Parse dates if provided
        const parsedStartDate = startDate ? new Date(startDate as string) : undefined
        const parsedEndDate = endDate ? new Date(endDate as string) : undefined

        // Get all logs matching the filters (no pagination for export)
        const { logs } = await auditLogsService.getAuditLogs({
            userId: userId as string,
            action: action as string,
            resourceType: resourceType as string,
            resourceId: resourceId as string,
            startDate: parsedStartDate,
            endDate: parsedEndDate
        })

        // Convert logs to CSV format
        let csv = 'ID,Timestamp,User ID,Action,Resource Type,Resource ID,IP Address,Metadata\n'
        
        logs.forEach(log => {
            const metadata = log.metadata ? JSON.stringify(log.metadata).replace(/"/g, '""') : ''
            csv += `"${log.id}","${log.timestamp.toISOString()}","${log.userId || ''}","${log.action}","${log.resourceType}","${log.resourceId || ''}","${log.ipAddress || ''}","${metadata}"\n`
        })

        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv')
        
        return res.status(StatusCodes.OK).send(csv)
    } catch (error) {
        logger.error(`[AuditLogController] exportAuditLogs error: ${error}`)
        if (error instanceof InternalFastflowError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to export audit logs' })
    }
}

export default {
    getAuditLogs,
    getAuditLogById,
    createAuditLog,
    exportAuditLogs
}