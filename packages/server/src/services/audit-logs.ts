import { getRepository } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { AuditLog } from '../database/entities/AuditLog'
import { InternalFastflowError } from '../errors/InternalFastflowError'
import logger from '../utils/logger'

/**
 * Interface for audit log creation parameters
 */
interface AuditLogParams {
    userId?: string
    action: string
    resourceType: string
    resourceId?: string
    metadata?: Record<string, any>
    ipAddress?: string
    timestamp?: Date
}

/**
 * Interface for audit log filtering parameters
 */
interface AuditLogFilters {
    userId?: string
    action?: string
    resourceType?: string
    resourceId?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
}

/**
 * Service for managing audit logs
 */
class AuditLogsService {
    /**
     * Create a new audit log
     * @param {AuditLogParams} params - Audit log parameters
     * @returns {Promise<AuditLog>} Created audit log
     */
    async createAuditLog(params: AuditLogParams): Promise<AuditLog> {
        try {
            const auditLogRepository = getRepository(AuditLog)
            
            // Create audit log
            const auditLog = auditLogRepository.create({
                userId: params.userId,
                action: params.action,
                resourceType: params.resourceType,
                resourceId: params.resourceId,
                metadata: params.metadata || {},
                ipAddress: params.ipAddress,
                timestamp: params.timestamp || new Date()
            })
            
            // Save audit log
            return await auditLogRepository.save(auditLog)
        } catch (error) {
            logger.error(`[AuditLogsService] createAuditLog error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create audit log')
        }
    }
    
    /**
     * Log a user action
     * @param {string} userId - User ID
     * @param {string} action - Action performed
     * @param {string} resourceType - Type of resource
     * @param {string} resourceId - ID of resource
     * @param {object} metadata - Additional metadata
     * @param {string} ipAddress - IP address
     * @returns {Promise<AuditLog>} Created audit log
     */
    async logUserAction(
        userId: string | undefined,
        action: string,
        resourceType: string,
        resourceId?: string,
        metadata?: Record<string, any>,
        ipAddress?: string
    ): Promise<AuditLog> {
        return this.createAuditLog({
            userId,
            action,
            resourceType,
            resourceId,
            metadata,
            ipAddress
        })
    }
    
    /**
     * Get audit log by ID
     * @param {string} id - Audit log ID
     * @returns {Promise<AuditLog>} Audit log
     */
    async getAuditLogById(id: string): Promise<AuditLog> {
        try {
            const auditLogRepository = getRepository(AuditLog)
            
            // Find audit log
            const auditLog = await auditLogRepository.findOne({ where: { id } })
            
            if (!auditLog) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'Audit log not found')
            }
            
            return auditLog
        } catch (error) {
            if (error instanceof InternalFastflowError) {
                throw error
            }
            
            logger.error(`[AuditLogsService] getAuditLogById error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get audit log')
        }
    }
    
    /**
     * Get audit logs with filtering and pagination
     * @param {AuditLogFilters} filters - Filters
     * @returns {Promise<{logs: AuditLog[], total: number}>} Audit logs and total count
     */
    async getAuditLogs(filters: AuditLogFilters): Promise<{ logs: AuditLog[], total: number }> {
        try {
            const auditLogRepository = getRepository(AuditLog)
            
            // Build query
            const query: any = {}
            
            if (filters.userId) {
                query.userId = filters.userId
            }
            
            if (filters.action) {
                query.action = filters.action
            }
            
            if (filters.resourceType) {
                query.resourceType = filters.resourceType
            }
            
            if (filters.resourceId) {
                query.resourceId = filters.resourceId
            }
            
            // Date range filtering
            const whereClause: any = { ...query }
            
            if (filters.startDate || filters.endDate) {
                whereClause.timestamp = {}
                
                if (filters.startDate) {
                    whereClause.timestamp.gte = filters.startDate
                }
                
                if (filters.endDate) {
                    whereClause.timestamp.lte = filters.endDate
                }
            }
            
            // Get logs with pagination
            const logs = await auditLogRepository.find({
                where: whereClause,
                order: { timestamp: 'DESC' },
                skip: filters.offset || 0,
                take: filters.limit || 10
            })
            
            // Get total count
            const total = await auditLogRepository.count({ where: whereClause })
            
            return { logs, total }
        } catch (error) {
            logger.error(`[AuditLogsService] getAuditLogs error: ${error}`)
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get audit logs')
        }
    }
}

export default new AuditLogsService()