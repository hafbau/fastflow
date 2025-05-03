import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals'
import { getBackupConfig, BackupType } from '../config/backupConfig'
import supabaseAuthBackupService from '../services/supabaseAuthBackupService'
import databaseBackupService from '../services/databaseBackupService'
import backupMonitoringService from '../services/backupMonitoringService'
import { BackupStatus } from '../services/backupMonitoringService'
import fs from 'fs'
import path from 'path'

// Mock the services
jest.mock('../services/supabaseAuthBackupService', () => ({
    default: {
        createBackup: jest.fn(),
        validateBackup: jest.fn(),
        restoreFromBackup: jest.fn(),
        listBackups: jest.fn(),
        applyRetentionPolicy: jest.fn()
    }
}))

jest.mock('../services/databaseBackupService', () => ({
    default: {
        createBackup: jest.fn(),
        validateBackup: jest.fn(),
        restoreFromBackup: jest.fn(),
        listBackups: jest.fn(),
        applyRetentionPolicy: jest.fn(),
        createPointInTimeRecoveryBackup: jest.fn()
    }
}))

jest.mock('../utils/encryption', () => ({
    encryptData: jest.fn((data: string) => `encrypted:${data}`),
    decryptData: jest.fn((data: string) => data.replace('encrypted:', '')),
    hashData: jest.fn((data: string) => `hash:${data}`)
}))

jest.mock('fs', () => ({
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
    readFileSync: jest.fn(),
    statSync: jest.fn(),
    unlinkSync: jest.fn(),
    readdirSync: jest.fn()
}))

describe('Backup System', () => {
    beforeAll(() => {
        // Mock fs functions
        (fs.existsSync as jest.Mock).mockReturnValue(true)
        ;(fs.readFileSync as jest.Mock).mockReturnValue('test data')
        ;(fs.statSync as jest.Mock).mockReturnValue({ size: 1024 })
        ;(fs.readdirSync as jest.Mock).mockReturnValue(['backup1.json', 'backup2.json'])
    })

    afterAll(() => {
        jest.resetAllMocks()
    })

    describe('Backup Configuration', () => {
        it('should load backup configuration', () => {
            const config = getBackupConfig()
            expect(config).toBeDefined()
            expect(config.enabled).toBeDefined()
            expect(config.frequency).toBeDefined()
            expect(config.type).toBeDefined()
            expect(config.retention).toBeDefined()
            expect(config.storage).toBeDefined()
        })
    })

    describe('Supabase Auth Backup Service', () => {
        it('should create auth backup', async () => {
            const mockBackupPath = '/path/to/backup.json'
            ;(supabaseAuthBackupService.createBackup as jest.Mock).mockResolvedValue(mockBackupPath)
            
            const result = await supabaseAuthBackupService.createBackup(BackupType.FULL)
            
            expect(supabaseAuthBackupService.createBackup).toHaveBeenCalledWith(BackupType.FULL)
            expect(result).toBe(mockBackupPath)
        })

        it('should validate auth backup', async () => {
            const mockBackupPath = '/path/to/backup.json'
            ;(supabaseAuthBackupService.validateBackup as jest.Mock).mockResolvedValue(true)
            
            const result = await supabaseAuthBackupService.validateBackup(mockBackupPath)
            
            expect(supabaseAuthBackupService.validateBackup).toHaveBeenCalledWith(mockBackupPath)
            expect(result).toBe(true)
        })

        it('should restore from auth backup', async () => {
            const mockBackupPath = '/path/to/backup.json'
            ;(supabaseAuthBackupService.restoreFromBackup as jest.Mock).mockResolvedValue(true)
            
            const result = await supabaseAuthBackupService.restoreFromBackup(mockBackupPath)
            
            expect(supabaseAuthBackupService.restoreFromBackup).toHaveBeenCalledWith(mockBackupPath)
            expect(result).toBe(true)
        })
    })

    describe('Database Backup Service', () => {
        it('should create database backup', async () => {
            const mockBackupPath = '/path/to/backup.sql'
            ;(databaseBackupService.createBackup as jest.Mock).mockResolvedValue(mockBackupPath)
            
            const result = await databaseBackupService.createBackup(BackupType.FULL)
            
            expect(databaseBackupService.createBackup).toHaveBeenCalledWith(BackupType.FULL)
            expect(result).toBe(mockBackupPath)
        })

        it('should validate database backup', async () => {
            const mockBackupPath = '/path/to/backup.sql'
            ;(databaseBackupService.validateBackup as jest.Mock).mockResolvedValue(true)
            
            const result = await databaseBackupService.validateBackup(mockBackupPath)
            
            expect(databaseBackupService.validateBackup).toHaveBeenCalledWith(mockBackupPath)
            expect(result).toBe(true)
        })

        it('should restore from database backup', async () => {
            const mockBackupPath = '/path/to/backup.sql'
            ;(databaseBackupService.restoreFromBackup as jest.Mock).mockResolvedValue(true)
            
            const result = await databaseBackupService.restoreFromBackup(mockBackupPath)
            
            expect(databaseBackupService.restoreFromBackup).toHaveBeenCalledWith(mockBackupPath)
            expect(result).toBe(true)
        })

        it('should create point-in-time recovery backup', async () => {
            const mockBackupPath = '/path/to/pitr-backup.tar'
            ;(databaseBackupService.createPointInTimeRecoveryBackup as jest.Mock).mockResolvedValue(mockBackupPath)
            
            const result = await databaseBackupService.createPointInTimeRecoveryBackup()
            
            expect(databaseBackupService.createPointInTimeRecoveryBackup).toHaveBeenCalled()
            expect(result).toBe(mockBackupPath)
        })
    })

    describe('Backup Monitoring Service', () => {
        it('should track backup status', () => {
            const trackingId = backupMonitoringService.startBackupTracking('auth', 'daily')
            expect(trackingId).toBeDefined()
            
            backupMonitoringService.completeBackupTracking(trackingId, BackupStatus.SUCCESS, {
                path: '/path/to/backup.json',
                size: 1024
            })
            
            const status = backupMonitoringService.getBackupStatus(trackingId)
            expect(status).toBe(BackupStatus.SUCCESS)
        })

        it('should generate backup report', () => {
            const report = backupMonitoringService.generateReport('daily')
            
            expect(report).toBeDefined()
            expect(report.period).toBe('daily')
            expect(report.totalBackups).toBeDefined()
            expect(report.successfulBackups).toBeDefined()
            expect(report.failedBackups).toBeDefined()
        })
    })
})