/**
 * Backup Scheduler Service
 * 
 * This service handles scheduling and execution of automated backups.
 */

import { CronJob } from 'cron';
import { getBackupConfig, BackupFrequency, BackupType } from '../config/backupConfig';
import supabaseAuthBackupService from './supabaseAuthBackupService';
import databaseBackupService from './databaseBackupService';
import { sendBackupNotification } from '../utils/notifications';
import logger from '../../utils/logger';

/**
 * Backup Scheduler Service
 */
export class BackupSchedulerService {
    private backupConfig;
    private dailyBackupJob: CronJob | null = null;
    private weeklyBackupJob: CronJob | null = null;
    private monthlyBackupJob: CronJob | null = null;
    private retentionJob: CronJob | null = null;

    /**
     * Constructor
     */
    constructor() {
        this.backupConfig = getBackupConfig();
    }

    /**
     * Initialize backup scheduler
     */
    initialize(): void {
        if (!this.backupConfig.enabled) {
            logger.info('[BackupScheduler] Backup scheduler is disabled');
            return;
        }

        logger.info('[BackupScheduler] Initializing backup scheduler');
        
        // Schedule daily backups (runs at 1:00 AM every day)
        this.dailyBackupJob = new CronJob('0 1 * * *', async () => {
            try {
                logger.info('[BackupScheduler] Starting daily backup');
                await this.runDailyBackup();
                logger.info('[BackupScheduler] Daily backup completed');
            } catch (error) {
                logger.error(`[BackupScheduler] Daily backup failed: ${error}`);
                await this.sendBackupFailureNotification('daily', error);
            }
        });
        
        // Schedule weekly backups (runs at 2:00 AM every Sunday)
        this.weeklyBackupJob = new CronJob('0 2 * * 0', async () => {
            try {
                logger.info('[BackupScheduler] Starting weekly backup');
                await this.runWeeklyBackup();
                logger.info('[BackupScheduler] Weekly backup completed');
            } catch (error) {
                logger.error(`[BackupScheduler] Weekly backup failed: ${error}`);
                await this.sendBackupFailureNotification('weekly', error);
            }
        });
        
        // Schedule monthly backups (runs at 3:00 AM on the 1st of each month)
        this.monthlyBackupJob = new CronJob('0 3 1 * *', async () => {
            try {
                logger.info('[BackupScheduler] Starting monthly backup');
                await this.runMonthlyBackup();
                logger.info('[BackupScheduler] Monthly backup completed');
            } catch (error) {
                logger.error(`[BackupScheduler] Monthly backup failed: ${error}`);
                await this.sendBackupFailureNotification('monthly', error);
            }
        });
        
        // Schedule retention policy job (runs at 4:00 AM every day)
        this.retentionJob = new CronJob('0 4 * * *', async () => {
            try {
                logger.info('[BackupScheduler] Applying retention policy');
                await this.applyRetentionPolicy();
                logger.info('[BackupScheduler] Retention policy applied');
            } catch (error) {
                logger.error(`[BackupScheduler] Retention policy application failed: ${error}`);
            }
        });
        
        // Start the scheduled jobs
        this.startScheduledJobs();
    }
    
    /**
     * Start scheduled backup jobs
     */
    startScheduledJobs(): void {
        if (this.dailyBackupJob && !this.dailyBackupJob.isCallbackRunning) {
            this.dailyBackupJob.start();
            logger.info('[BackupScheduler] Daily backup job started');
        }
        
        if (this.weeklyBackupJob && !this.weeklyBackupJob.isCallbackRunning) {
            this.weeklyBackupJob.start();
            logger.info('[BackupScheduler] Weekly backup job started');
        }
        
        if (this.monthlyBackupJob && !this.monthlyBackupJob.isCallbackRunning) {
            this.monthlyBackupJob.start();
            logger.info('[BackupScheduler] Monthly backup job started');
        }
        
        if (this.retentionJob && !this.retentionJob.isCallbackRunning) {
            this.retentionJob.start();
            logger.info('[BackupScheduler] Retention policy job started');
        }
    }
    
    /**
     * Stop scheduled backup jobs
     */
    stopScheduledJobs(): void {
        if (this.dailyBackupJob && this.dailyBackupJob.isCallbackRunning) {
            this.dailyBackupJob.stop();
            logger.info('[BackupScheduler] Daily backup job stopped');
        }
        
        if (this.weeklyBackupJob && this.weeklyBackupJob.isCallbackRunning) {
            this.weeklyBackupJob.stop();
            logger.info('[BackupScheduler] Weekly backup job stopped');
        }
        
        if (this.monthlyBackupJob && this.monthlyBackupJob.isCallbackRunning) {
            this.monthlyBackupJob.stop();
            logger.info('[BackupScheduler] Monthly backup job stopped');
        }
        
        if (this.retentionJob && this.retentionJob.isCallbackRunning) {
            this.retentionJob.stop();
            logger.info('[BackupScheduler] Retention policy job stopped');
        }
    }
    
    /**
     * Run a daily backup
     * @returns {Promise<void>}
     */
    async runDailyBackup(): Promise<void> {
        try {
            // Create incremental backups for daily backups
            const authBackupPath = await supabaseAuthBackupService.createBackup(BackupType.INCREMENTAL);
            const dbBackupPath = await databaseBackupService.createBackup(BackupType.INCREMENTAL);
            
            // Rename the files to include 'daily' in the name
            this.renameBackupFile(authBackupPath, 'daily');
            this.renameBackupFile(dbBackupPath, 'daily');
            
            // Send success notification
            if (this.backupConfig.notification.enabled) {
                await sendBackupNotification({
                    type: 'success',
                    frequency: 'daily',
                    message: 'Daily backup completed successfully',
                    details: {
                        authBackupPath,
                        dbBackupPath
                    }
                });
            }
        } catch (error) {
            logger.error(`[BackupScheduler] Daily backup failed: ${error}`);
            throw error;
        }
    }
    
    /**
     * Run a weekly backup
     * @returns {Promise<void>}
     */
    async runWeeklyBackup(): Promise<void> {
        try {
            // Create full backups for weekly backups
            const authBackupPath = await supabaseAuthBackupService.createBackup(BackupType.FULL);
            const dbBackupPath = await databaseBackupService.createBackup(BackupType.FULL);
            
            // Rename the files to include 'weekly' in the name
            this.renameBackupFile(authBackupPath, 'weekly');
            this.renameBackupFile(dbBackupPath, 'weekly');
            
            // Send success notification
            if (this.backupConfig.notification.enabled) {
                await sendBackupNotification({
                    type: 'success',
                    frequency: 'weekly',
                    message: 'Weekly backup completed successfully',
                    details: {
                        authBackupPath,
                        dbBackupPath
                    }
                });
            }
        } catch (error) {
            logger.error(`[BackupScheduler] Weekly backup failed: ${error}`);
            throw error;
        }
    }
    
    /**
     * Run a monthly backup
     * @returns {Promise<void>}
     */
    async runMonthlyBackup(): Promise<void> {
        try {
            // Create full backups for monthly backups
            const authBackupPath = await supabaseAuthBackupService.createBackup(BackupType.FULL);
            const dbBackupPath = await databaseBackupService.createBackup(BackupType.FULL);
            
            // Create point-in-time recovery backup for the database
            const pitrBackupPath = await databaseBackupService.createPointInTimeRecoveryBackup();
            
            // Rename the files to include 'monthly' in the name
            this.renameBackupFile(authBackupPath, 'monthly');
            this.renameBackupFile(dbBackupPath, 'monthly');
            this.renameBackupFile(pitrBackupPath, 'monthly');
            
            // Send success notification
            if (this.backupConfig.notification.enabled) {
                await sendBackupNotification({
                    type: 'success',
                    frequency: 'monthly',
                    message: 'Monthly backup completed successfully',
                    details: {
                        authBackupPath,
                        dbBackupPath,
                        pitrBackupPath
                    }
                });
            }
        } catch (error) {
            logger.error(`[BackupScheduler] Monthly backup failed: ${error}`);
            throw error;
        }
    }
    
    /**
     * Run a manual backup
     * @param {BackupType} backupType - Type of backup to create
     * @returns {Promise<{authBackupPath: string, dbBackupPath: string}>}
     */
    async runManualBackup(backupType: BackupType = BackupType.FULL): Promise<{authBackupPath: string, dbBackupPath: string}> {
        try {
            logger.info(`[BackupScheduler] Starting manual ${backupType} backup`);
            
            // Create backups
            const authBackupPath = await supabaseAuthBackupService.createBackup(backupType);
            const dbBackupPath = await databaseBackupService.createBackup(backupType);
            
            // Rename the files to include 'manual' in the name
            this.renameBackupFile(authBackupPath, 'manual');
            this.renameBackupFile(dbBackupPath, 'manual');
            
            logger.info('[BackupScheduler] Manual backup completed');
            
            // Send success notification
            if (this.backupConfig.notification.enabled) {
                await sendBackupNotification({
                    type: 'success',
                    frequency: 'manual',
                    message: 'Manual backup completed successfully',
                    details: {
                        authBackupPath,
                        dbBackupPath
                    }
                });
            }
            
            return { authBackupPath, dbBackupPath };
        } catch (error) {
            logger.error(`[BackupScheduler] Manual backup failed: ${error}`);
            
            // Send failure notification
            await this.sendBackupFailureNotification('manual', error);
            
            throw error;
        }
    }
    
    /**
     * Apply retention policy to backups
     * @returns {Promise<void>}
     */
    async applyRetentionPolicy(): Promise<void> {
        try {
            // Apply retention policy to auth backups
            const authDeletedCount = await supabaseAuthBackupService.applyRetentionPolicy();
            
            // Apply retention policy to database backups
            const dbDeletedCount = await databaseBackupService.applyRetentionPolicy();
            
            logger.info(`[BackupScheduler] Retention policy applied: ${authDeletedCount + dbDeletedCount} backups deleted`);
        } catch (error) {
            logger.error(`[BackupScheduler] Failed to apply retention policy: ${error}`);
            throw error;
        }
    }
    
    /**
     * Send backup failure notification
     * @param {string} frequency - Backup frequency (daily, weekly, monthly, manual)
     * @param {any} error - Error object
     * @returns {Promise<void>}
     */
    private async sendBackupFailureNotification(frequency: string, error: any): Promise<void> {
        if (this.backupConfig.notification.enabled) {
            await sendBackupNotification({
                type: 'failure',
                frequency,
                message: `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} backup failed`,
                details: {
                    error: error.message || String(error)
                }
            });
        }
    }
    
    /**
     * Rename backup file to include frequency
     * @param {string} filePath - Path to the backup file
     * @param {string} frequency - Backup frequency (daily, weekly, monthly, manual)
     * @returns {string} - New file path
     */
    private renameBackupFile(filePath: string, frequency: string): string {
        try {
            const path = require('path');
            const fs = require('fs');
            
            const dir = path.dirname(filePath);
            const filename = path.basename(filePath);
            
            // Replace the backup type in the filename with the frequency
            // Example: supabase-auth-full-2023-01-01T00-00-00-000Z.json -> supabase-auth-daily-2023-01-01T00-00-00-000Z.json
            const newFilename = filename.replace(
                /(supabase-auth|database)-(full|incremental|differential)/,
                `$1-${frequency}`
            );
            
            const newFilePath = path.join(dir, newFilename);
            
            // Rename the file
            fs.renameSync(filePath, newFilePath);
            
            return newFilePath;
        } catch (error) {
            logger.error(`[BackupScheduler] Failed to rename backup file: ${error}`);
            return filePath; // Return original path if rename fails
        }
    }
}

export default new BackupSchedulerService();