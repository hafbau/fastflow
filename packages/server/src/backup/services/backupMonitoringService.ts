/**
 * Backup Monitoring Service
 * 
 * This service handles monitoring of backup processes, sizes, and status.
 */

import fs from 'fs';
import path from 'path';
import { getBackupConfig } from '../config/backupConfig';
import supabaseAuthBackupService from './supabaseAuthBackupService';
import databaseBackupService from './databaseBackupService';
import { sendBackupNotification } from '../utils/notifications';
import logger from '../../utils/logger';

/**
 * Backup status
 */
export enum BackupStatus {
    SUCCESS = 'success',
    FAILURE = 'failure',
    IN_PROGRESS = 'in_progress',
    NOT_STARTED = 'not_started'
}

/**
 * Backup record interface
 */
export interface BackupRecord {
    id: string;
    type: string;
    frequency: string;
    status: BackupStatus;
    startTime: string;
    endTime?: string;
    size?: number;
    path?: string;
    error?: string;
}

/**
 * Backup monitoring report interface
 */
export interface BackupMonitoringReport {
    period: string;
    startDate: string;
    endDate: string;
    totalBackups: number;
    successfulBackups: number;
    failedBackups: number;
    totalSize: number;
    averageSize: number;
    backups: BackupRecord[];
}

/**
 * Backup Monitoring Service
 */
export class BackupMonitoringService {
    private backupConfig;
    private backupRecords: BackupRecord[] = [];
    private backupRecordsFile: string;
    private maxRecords: number = 1000; // Maximum number of records to keep

    /**
     * Constructor
     */
    constructor() {
        this.backupConfig = getBackupConfig();
        this.backupRecordsFile = path.resolve(this.backupConfig.storage.path, 'backup-records.json');
        
        // Load existing backup records
        this.loadBackupRecords();
    }

    /**
     * Load backup records from file
     */
    private loadBackupRecords(): void {
        try {
            if (fs.existsSync(this.backupRecordsFile)) {
                const data = fs.readFileSync(this.backupRecordsFile, 'utf8');
                this.backupRecords = JSON.parse(data);
                logger.info(`[BackupMonitoring] Loaded ${this.backupRecords.length} backup records`);
            } else {
                this.backupRecords = [];
                logger.info('[BackupMonitoring] No existing backup records found');
            }
        } catch (error) {
            logger.error(`[BackupMonitoring] Failed to load backup records: ${error}`);
            this.backupRecords = [];
        }
    }

    /**
     * Save backup records to file
     */
    private saveBackupRecords(): void {
        try {
            // Ensure the directory exists
            const dir = path.dirname(this.backupRecordsFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            // Limit the number of records to keep
            if (this.backupRecords.length > this.maxRecords) {
                this.backupRecords = this.backupRecords.slice(-this.maxRecords);
            }
            
            // Save records to file
            fs.writeFileSync(this.backupRecordsFile, JSON.stringify(this.backupRecords, null, 2));
            logger.debug(`[BackupMonitoring] Saved ${this.backupRecords.length} backup records`);
        } catch (error) {
            logger.error(`[BackupMonitoring] Failed to save backup records: ${error}`);
        }
    }

    /**
     * Start tracking a backup
     * @param {string} type - Backup type (auth, database)
     * @param {string} frequency - Backup frequency (daily, weekly, monthly, manual)
     * @returns {string} - Backup record ID
     */
    startBackupTracking(type: string, frequency: string): string {
        const id = `${type}-${frequency}-${Date.now()}`;
        
        const record: BackupRecord = {
            id,
            type,
            frequency,
            status: BackupStatus.IN_PROGRESS,
            startTime: new Date().toISOString()
        };
        
        this.backupRecords.push(record);
        this.saveBackupRecords();
        
        logger.info(`[BackupMonitoring] Started tracking backup: ${id}`);
        return id;
    }

    /**
     * Complete backup tracking
     * @param {string} id - Backup record ID
     * @param {BackupStatus} status - Backup status
     * @param {object} details - Additional details
     */
    completeBackupTracking(id: string, status: BackupStatus, details?: { path?: string, size?: number, error?: string }): void {
        const recordIndex = this.backupRecords.findIndex(r => r.id === id);
        
        if (recordIndex === -1) {
            logger.error(`[BackupMonitoring] Backup record not found: ${id}`);
            return;
        }
        
        const record = this.backupRecords[recordIndex];
        record.status = status;
        record.endTime = new Date().toISOString();
        
        if (details) {
            if (details.path) record.path = details.path;
            if (details.size) record.size = details.size;
            if (details.error) record.error = details.error;
        }
        
        this.backupRecords[recordIndex] = record;
        this.saveBackupRecords();
        
        logger.info(`[BackupMonitoring] Completed tracking backup: ${id} with status: ${status}`);
        
        // Send alert for failed backups
        if (status === BackupStatus.FAILURE && this.backupConfig.notification.enabled) {
            sendBackupNotification({
                type: 'failure',
                frequency: record.frequency,
                message: `${record.type} backup failed`,
                details: {
                    error: record.error || 'Unknown error'
                }
            });
        }
    }

    /**
     * Get backup status
     * @param {string} id - Backup record ID
     * @returns {BackupStatus|null} - Backup status or null if not found
     */
    getBackupStatus(id: string): BackupStatus | null {
        const record = this.backupRecords.find(r => r.id === id);
        return record ? record.status : null;
    }

    /**
     * Get recent backup records
     * @param {number} limit - Maximum number of records to return
     * @returns {BackupRecord[]} - Recent backup records
     */
    getRecentBackups(limit: number = 10): BackupRecord[] {
        return this.backupRecords
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            .slice(0, limit);
    }

    /**
     * Get backup records by type
     * @param {string} type - Backup type (auth, database)
     * @param {number} limit - Maximum number of records to return
     * @returns {BackupRecord[]} - Backup records of the specified type
     */
    getBackupsByType(type: string, limit: number = 10): BackupRecord[] {
        return this.backupRecords
            .filter(r => r.type === type)
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            .slice(0, limit);
    }

    /**
     * Get backup records by frequency
     * @param {string} frequency - Backup frequency (daily, weekly, monthly, manual)
     * @param {number} limit - Maximum number of records to return
     * @returns {BackupRecord[]} - Backup records of the specified frequency
     */
    getBackupsByFrequency(frequency: string, limit: number = 10): BackupRecord[] {
        return this.backupRecords
            .filter(r => r.frequency === frequency)
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            .slice(0, limit);
    }

    /**
     * Get backup records by status
     * @param {BackupStatus} status - Backup status
     * @param {number} limit - Maximum number of records to return
     * @returns {BackupRecord[]} - Backup records with the specified status
     */
    getBackupsByStatus(status: BackupStatus, limit: number = 10): BackupRecord[] {
        return this.backupRecords
            .filter(r => r.status === status)
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            .slice(0, limit);
    }

    /**
     * Get backup records by date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {BackupRecord[]} - Backup records within the specified date range
     */
    getBackupsByDateRange(startDate: Date, endDate: Date): BackupRecord[] {
        return this.backupRecords
            .filter(r => {
                const recordDate = new Date(r.startTime);
                return recordDate >= startDate && recordDate <= endDate;
            })
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }

    /**
     * Generate backup monitoring report
     * @param {string} period - Report period (daily, weekly, monthly)
     * @returns {BackupMonitoringReport} - Backup monitoring report
     */
    generateReport(period: string = 'daily'): BackupMonitoringReport {
        const now = new Date();
        let startDate: Date;
        
        // Determine start date based on period
        switch (period) {
            case 'weekly':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'monthly':
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'daily':
            default:
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 1);
                break;
        }
        
        // Get backups within the date range
        const backups = this.getBackupsByDateRange(startDate, now);
        
        // Calculate statistics
        const totalBackups = backups.length;
        const successfulBackups = backups.filter(b => b.status === BackupStatus.SUCCESS).length;
        const failedBackups = backups.filter(b => b.status === BackupStatus.FAILURE).length;
        
        // Calculate size statistics
        const backupsWithSize = backups.filter(b => b.size !== undefined);
        const totalSize = backupsWithSize.reduce((sum, b) => sum + (b.size || 0), 0);
        const averageSize = backupsWithSize.length > 0 ? totalSize / backupsWithSize.length : 0;
        
        // Create report
        const report: BackupMonitoringReport = {
            period,
            startDate: startDate.toISOString(),
            endDate: now.toISOString(),
            totalBackups,
            successfulBackups,
            failedBackups,
            totalSize,
            averageSize,
            backups
        };
        
        return report;
    }

    /**
     * Monitor backup sizes and growth
     * @returns {Promise<{totalSize: number, growthRate: number}>} - Backup size statistics
     */
    async monitorBackupSizes(): Promise<{totalSize: number, growthRate: number}> {
        try {
            // Get all backup files
            const authBackups = await supabaseAuthBackupService.listBackups();
            const dbBackups = await databaseBackupService.listBackups();
            const allBackups = [...authBackups, ...dbBackups];
            
            // Calculate total size
            let totalSize = 0;
            for (const backup of allBackups) {
                const stats = fs.statSync(backup);
                totalSize += stats.size;
            }
            
            // Calculate growth rate (comparing to previous measurement)
            const previousSizeFile = path.resolve(this.backupConfig.storage.path, 'previous-size.json');
            let growthRate = 0;
            
            if (fs.existsSync(previousSizeFile)) {
                const previousData = JSON.parse(fs.readFileSync(previousSizeFile, 'utf8'));
                const previousSize = previousData.size || 0;
                const previousDate = new Date(previousData.date);
                const currentDate = new Date();
                
                // Calculate days between measurements
                const daysDiff = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);
                
                if (daysDiff > 0) {
                    // Calculate daily growth rate
                    growthRate = (totalSize - previousSize) / daysDiff;
                }
            }
            
            // Save current size for future comparison
            fs.writeFileSync(previousSizeFile, JSON.stringify({
                size: totalSize,
                date: new Date().toISOString()
            }));
            
            return { totalSize, growthRate };
        } catch (error) {
            logger.error(`[BackupMonitoring] Failed to monitor backup sizes: ${error}`);
            return { totalSize: 0, growthRate: 0 };
        }
    }

    /**
     * Check for backup alerts
     * @returns {Promise<string[]>} - List of alert messages
     */
    async checkForAlerts(): Promise<string[]> {
        const alerts: string[] = [];
        
        try {
            // Check for failed backups in the last 24 hours
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            
            const recentBackups = this.getBackupsByDateRange(oneDayAgo, new Date());
            const failedBackups = recentBackups.filter(b => b.status === BackupStatus.FAILURE);
            
            if (failedBackups.length > 0) {
                alerts.push(`${failedBackups.length} backup(s) failed in the last 24 hours`);
            }
            
            // Check for missing backups
            const dailyBackups = recentBackups.filter(b => b.frequency === 'daily');
            if (dailyBackups.length === 0) {
                alerts.push('No daily backups found in the last 24 hours');
            }
            
            // Check backup size growth
            const { totalSize, growthRate } = await this.monitorBackupSizes();
            
            // Alert if growth rate is unusually high (more than 20% per day)
            if (growthRate > 0.2 * totalSize) {
                alerts.push(`Backup size growing rapidly: ${(growthRate / (1024 * 1024)).toFixed(2)} MB/day`);
            }
            
            // Alert if total size is approaching storage limit
            const storageLimit = parseInt(process.env.BACKUP_STORAGE_LIMIT || '0');
            if (storageLimit > 0 && totalSize > 0.8 * storageLimit) {
                const percentUsed = (totalSize / storageLimit * 100).toFixed(2);
                alerts.push(`Backup storage usage at ${percentUsed}% of limit`);
            }
            
            return alerts;
        } catch (error) {
            logger.error(`[BackupMonitoring] Failed to check for alerts: ${error}`);
            return [`Error checking for alerts: ${error}`];
        }
    }
}

export default new BackupMonitoringService();