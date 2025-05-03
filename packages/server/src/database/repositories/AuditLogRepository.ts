import { EntityRepository, Repository, Between } from 'typeorm'
import { AuditLog } from '../entities/AuditLog'

@EntityRepository(AuditLog)
export class AuditLogRepository extends Repository<AuditLog> {
    async findByUser(userId: string, limit: number = 100): Promise<AuditLog[]> {
        return this.find({
            where: { userId },
            order: { timestamp: 'DESC' },
            take: limit
        })
    }

    async findByResource(resourceType: string, resourceId: string, limit: number = 100): Promise<AuditLog[]> {
        return this.find({
            where: { resourceType, resourceId },
            order: { timestamp: 'DESC' },
            take: limit
        })
    }

    async findByAction(action: string, limit: number = 100): Promise<AuditLog[]> {
        return this.find({
            where: { action },
            order: { timestamp: 'DESC' },
            take: limit
        })
    }

    async findByDateRange(startDate: Date, endDate: Date, limit: number = 100): Promise<AuditLog[]> {
        return this.find({
            where: {
                timestamp: Between(startDate, endDate)
            },
            order: { timestamp: 'DESC' },
            take: limit
        })
    }

    async createLog(
        userId: string | undefined,
        action: string,
        resourceType: string,
        resourceId: string | undefined,
        metadata?: Record<string, any>,
        ipAddress?: string
    ): Promise<AuditLog> {
        const log = new AuditLog()
        log.timestamp = new Date()
        log.userId = userId || null
        log.action = action
        log.resourceType = resourceType
        log.resourceId = resourceId || null
        log.metadata = metadata || null
        log.ipAddress = ipAddress || null

        return this.save(log)
    }
}