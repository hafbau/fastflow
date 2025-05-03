import { getRepository } from 'typeorm'
import { AuditLog } from '../database/entities/AuditLog'
import auditLogsService from '../services/audit-logs'
import { InternalFastflowError } from '../errors/InternalFastflowError'

// Mock TypeORM's getRepository
jest.mock('typeorm', () => ({
  getRepository: jest.fn()
}))

describe('Audit Logs Service', () => {
    let mockRepository: {
        create: jest.Mock;
        save: jest.Mock;
        findOne: jest.Mock;
        find: jest.Mock;
        count: jest.Mock;
    } & Record<string, any>

    beforeEach(() => {
        // Mock the repository
        const repoFunctions = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn()
        };
        mockRepository = repoFunctions;
        
        // Set up the mock repository
        (getRepository as jest.MockedFunction<typeof getRepository>).mockReturnValue(mockRepository as any)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('createAuditLog', () => {
        it('should create an audit log successfully', async () => {
            // Arrange
            const auditLogData = {
                userId: 'user123',
                action: 'user_login',
                resourceType: 'auth',
                resourceId: undefined,
                metadata: { ip: '127.0.0.1' },
                ipAddress: '127.0.0.1',
                timestamp: new Date()
            }
            
            const createdAuditLog = { id: 'log123', ...auditLogData }
            
            mockRepository.create.mockReturnValue(auditLogData)
            mockRepository.save.mockResolvedValue(createdAuditLog)
            
            // Act
            const result = await auditLogsService.createAuditLog(auditLogData)
            
            // Assert
            expect(mockRepository.create).toHaveBeenCalledTimes(1)
            expect(mockRepository.save).toHaveBeenCalledTimes(1)
            expect(result).toEqual(createdAuditLog)
        })
        
        it('should throw an error when save fails', async () => {
            // Arrange
            mockRepository.create.mockReturnValue({})
            mockRepository.save.mockRejectedValue(new Error('Database error'))
            
            // Act & Assert
            await expect(auditLogsService.createAuditLog({
                userId: 'user123',
                action: 'user_login',
                resourceType: 'auth',
                resourceId: undefined,
                metadata: {},
                ipAddress: '127.0.0.1'
            })).rejects.toThrow(InternalFastflowError)
        })
    })
    
    describe('logUserAction', () => {
        it('should log a user action successfully', async () => {
            // Arrange
            const auditLogData = {
                userId: 'user123',
                action: 'user_login',
                resourceType: 'auth',
                resourceId: undefined,
                metadata: { ip: '127.0.0.1' },
                ipAddress: '127.0.0.1'
            }
            
            const createdAuditLog = { id: 'log123', ...auditLogData, timestamp: new Date() }
            
            mockRepository.create.mockReturnValue(auditLogData)
            mockRepository.save.mockResolvedValue(createdAuditLog)
            
            // Act
            const result = await auditLogsService.logUserAction(
                auditLogData.userId,
                auditLogData.action,
                auditLogData.resourceType,
                auditLogData.resourceId,
                auditLogData.metadata,
                auditLogData.ipAddress
            )
            
            // Assert
            expect(mockRepository.create).toHaveBeenCalledTimes(1)
            expect(mockRepository.save).toHaveBeenCalledTimes(1)
            expect(result).toEqual(createdAuditLog)
        })
    })
    
    describe('getAuditLogById', () => {
        it('should return an audit log by ID', async () => {
            // Arrange
            const auditLog = {
                id: 'log123',
                userId: 'user123',
                action: 'user_login',
                resourceType: 'auth',
                timestamp: new Date()
            }
            
            mockRepository.findOne.mockResolvedValue(auditLog)
            
            // Act
            const result = await auditLogsService.getAuditLogById('log123')
            
            // Assert
            expect(mockRepository.findOne).toHaveBeenCalledTimes(1)
            expect(result).toEqual(auditLog)
        })
        
        it('should throw an error when audit log not found', async () => {
            // Arrange
            mockRepository.findOne.mockResolvedValue(null)
            
            // Act & Assert
            await expect(auditLogsService.getAuditLogById('nonexistent'))
                .rejects.toThrow(InternalFastflowError)
        })
    })
    
    describe('getAuditLogs', () => {
        it('should return audit logs with filtering and pagination', async () => {
            // Arrange
            const filters = {
                userId: 'user123',
                action: 'user_login',
                resourceType: 'auth',
                limit: 10,
                offset: 0
            }
            
            const auditLogs = [
                { id: 'log1', userId: 'user123', action: 'user_login', resourceType: 'auth' },
                { id: 'log2', userId: 'user123', action: 'user_login', resourceType: 'auth' }
            ]
            
            mockRepository.find.mockResolvedValue(auditLogs)
            mockRepository.count.mockResolvedValue(2)
            
            // Act
            const result = await auditLogsService.getAuditLogs(filters)
            
            // Assert
            expect(mockRepository.find).toHaveBeenCalledTimes(1)
            expect(mockRepository.count).toHaveBeenCalledTimes(1)
            expect(result.logs).toEqual(auditLogs)
            expect(result.total).toBe(2)
        })
        
        it('should handle empty filters', async () => {
            // Arrange
            mockRepository.find.mockResolvedValue([])
            mockRepository.count.mockResolvedValue(0)
            
            // Act
            const result = await auditLogsService.getAuditLogs({})
            
            // Assert
            expect(mockRepository.find).toHaveBeenCalledTimes(1)
            expect(mockRepository.count).toHaveBeenCalledTimes(1)
            expect(result.logs).toEqual([])
            expect(result.total).toBe(0)
        })
    })
})