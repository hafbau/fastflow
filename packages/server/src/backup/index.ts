/**
 * Backup and Recovery System
 * 
 * This file initializes and exports the backup and recovery system.
 */

import supabaseAuthBackupService from './services/supabaseAuthBackupService';
import databaseBackupService from './services/databaseBackupService';
import backupSchedulerService from './services/backupSchedulerService';
import backupMonitoringService from './services/backupMonitoringService';
import { getBackupConfig, BackupFrequency, BackupType, BackupStorageType } from './config/backupConfig';
import logger from '../utils/logger';

/**
 * Initialize the backup and recovery system
 */
export const initializeBackupSystem = (): void => {
    try {
        const backupConfig = getBackupConfig();
        
        if (!backupConfig.enabled) {
            logger.info('[Backup] Backup system is disabled');
            return;
        }
        
        logger.info('[Backup] Initializing backup and recovery system');
        
        // Initialize the backup scheduler
        backupSchedulerService.initialize();
        
        logger.info('[Backup] Backup and recovery system initialized successfully');
    } catch (error) {
        logger.error(`[Backup] Failed to initialize backup system: ${error}`);
    }
};

/**
 * Run a manual backup
 * @param {BackupType} backupType - Type of backup to create
 * @returns {Promise<{authBackupPath?: string, dbBackupPath?: string}>}
 */
export const runManualBackup = async (backupType: BackupType = BackupType.FULL): Promise<{authBackupPath?: string, dbBackupPath?: string}> => {
    try {
        logger.info(`[Backup] Starting manual ${backupType} backup`);
        
        // Create backups
        const authBackupPath = await supabaseAuthBackupService.createBackup(backupType);
        const dbBackupPath = await databaseBackupService.createBackup(backupType);
        
        logger.info('[Backup] Manual backup completed successfully');
        
        return { authBackupPath, dbBackupPath };
    } catch (error) {
        logger.error(`[Backup] Manual backup failed: ${error}`);
        throw error;
    }
};

/**
 * Verify backup integrity
 * @param {string} backupPath - Path to the backup file
 * @param {string} backupType - Type of backup (auth or database)
 * @returns {Promise<boolean>}
 */
export const verifyBackup = async (backupPath: string, backupType: 'auth' | 'database'): Promise<boolean> => {
    try {
        logger.info(`[Backup] Verifying ${backupType} backup: ${backupPath}`);
        
        let isValid = false;
        
        if (backupType === 'auth') {
            isValid = await supabaseAuthBackupService.validateBackup(backupPath);
        } else if (backupType === 'database') {
            isValid = await databaseBackupService.validateBackup(backupPath);
        }
        
        if (isValid) {
            logger.info(`[Backup] ${backupType} backup verification successful`);
        } else {
            logger.error(`[Backup] ${backupType} backup verification failed`);
        }
        
        return isValid;
    } catch (error) {
        logger.error(`[Backup] Backup verification failed: ${error}`);
        return false;
    }
};

/**
 * Restore from backup
 * @param {string} backupPath - Path to the backup file
 * @param {string} backupType - Type of backup (auth or database)
 * @returns {Promise<boolean>}
 */
export const restoreFromBackup = async (backupPath: string, backupType: 'auth' | 'database'): Promise<boolean> => {
    try {
        logger.info(`[Backup] Restoring from ${backupType} backup: ${backupPath}`);
        
        let success = false;
        
        if (backupType === 'auth') {
            success = await supabaseAuthBackupService.restoreFromBackup(backupPath);
        } else if (backupType === 'database') {
            success = await databaseBackupService.restoreFromBackup(backupPath);
        }
        
        if (success) {
            logger.info(`[Backup] ${backupType} backup restoration successful`);
        } else {
            logger.error(`[Backup] ${backupType} backup restoration failed`);
        }
        
        return success;
    } catch (error) {
        logger.error(`[Backup] Backup restoration failed: ${error}`);
        return false;
    }
};

/**
 * Generate backup monitoring report
 * @param {string} period - Report period (daily, weekly, monthly)
 * @returns {Promise<any>}
 */
export const generateBackupReport = async (period: string = 'daily'): Promise<any> => {
    try {
        logger.info(`[Backup] Generating ${period} backup report`);
        
        const report = backupMonitoringService.generateReport(period);
        
        logger.info(`[Backup] ${period} backup report generated successfully`);
        
        return report;
    } catch (error) {
        logger.error(`[Backup] Failed to generate backup report: ${error}`);
        throw error;
    }
};

/**
 * Check for backup alerts
 * @returns {Promise<string[]>}
 */
export const checkBackupAlerts = async (): Promise<string[]> => {
    try {
        logger.info('[Backup] Checking for backup alerts');
        
        const alerts = await backupMonitoringService.checkForAlerts();
        
        if (alerts.length > 0) {
            logger.warn(`[Backup] Found ${alerts.length} backup alerts`);
        } else {
            logger.info('[Backup] No backup alerts found');
        }
        
        return alerts;
    } catch (error) {
        logger.error(`[Backup] Failed to check for backup alerts: ${error}`);
        return [`Error checking for alerts: ${error}`];
    }
};

// Export services and types
export {
    supabaseAuthBackupService,
    databaseBackupService,
    backupSchedulerService,
    backupMonitoringService,
    BackupFrequency,
    BackupType,
    BackupStorageType
};

export default {
    initializeBackupSystem,
    runManualBackup,
    verifyBackup,
    restoreFromBackup,
    generateBackupReport,
    checkBackupAlerts,
    supabaseAuthBackupService,
    databaseBackupService,
    backupSchedulerService,
    backupMonitoringService
};