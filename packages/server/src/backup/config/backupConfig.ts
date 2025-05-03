/**
 * Backup and Recovery Configuration
 * 
 * This file contains configuration settings for the backup and recovery system.
 */

/**
 * Backup frequency types
 */
export enum BackupFrequency {
    HOURLY = 'hourly',
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly'
}

/**
 * Backup types
 */
export enum BackupType {
    FULL = 'full',
    INCREMENTAL = 'incremental',
    DIFFERENTIAL = 'differential'
}

/**
 * Backup storage types
 */
export enum BackupStorageType {
    LOCAL = 'local',
    S3 = 's3',
    GCS = 'gcs',
    AZURE = 'azure'
}

/**
 * Backup configuration interface
 */
export interface BackupConfig {
    enabled: boolean;
    frequency: BackupFrequency;
    type: BackupType;
    retention: {
        daily: number;    // days to keep daily backups
        weekly: number;   // days to keep weekly backups
        monthly: number;  // days to keep monthly backups
    };
    storage: {
        type: BackupStorageType;
        path: string;
        encrypted: boolean;
        encryptionKey?: string;
    };
    notification: {
        enabled: boolean;
        email?: string[];
        slack?: string;
    };
}

/**
 * Default backup configuration
 */
export const defaultBackupConfig: BackupConfig = {
    enabled: true,
    frequency: BackupFrequency.DAILY,
    type: BackupType.FULL,
    retention: {
        daily: 30,    // 30 days
        weekly: 90,   // 90 days
        monthly: 365  // 1 year
    },
    storage: {
        type: BackupStorageType.LOCAL,
        path: process.env.BACKUP_STORAGE_PATH || './backups',
        encrypted: true,
        encryptionKey: process.env.BACKUP_ENCRYPTION_KEY
    },
    notification: {
        enabled: true,
        email: process.env.BACKUP_NOTIFICATION_EMAIL ? 
            process.env.BACKUP_NOTIFICATION_EMAIL.split(',') : 
            undefined,
        slack: process.env.BACKUP_NOTIFICATION_SLACK
    }
};

/**
 * Get backup configuration
 * @returns {BackupConfig}
 */
export const getBackupConfig = (): BackupConfig => {
    // In a real implementation, this might load from a database or config file
    return {
        ...defaultBackupConfig,
        // Override with environment variables if provided
        enabled: process.env.BACKUP_ENABLED === 'true',
        frequency: (process.env.BACKUP_FREQUENCY as BackupFrequency) || defaultBackupConfig.frequency,
        type: (process.env.BACKUP_TYPE as BackupType) || defaultBackupConfig.type,
        retention: {
            daily: parseInt(process.env.BACKUP_RETENTION_DAILY || defaultBackupConfig.retention.daily.toString()),
            weekly: parseInt(process.env.BACKUP_RETENTION_WEEKLY || defaultBackupConfig.retention.weekly.toString()),
            monthly: parseInt(process.env.BACKUP_RETENTION_MONTHLY || defaultBackupConfig.retention.monthly.toString())
        },
        storage: {
            ...defaultBackupConfig.storage,
            type: (process.env.BACKUP_STORAGE_TYPE as BackupStorageType) || defaultBackupConfig.storage.type,
            path: process.env.BACKUP_STORAGE_PATH || defaultBackupConfig.storage.path,
            encrypted: process.env.BACKUP_STORAGE_ENCRYPTED === 'true'
        }
    };
};

/**
 * Recovery Point Objective (RPO) and Recovery Time Objective (RTO) settings
 */
export const recoveryObjectives = {
    rpo: {
        // Maximum acceptable data loss in hours
        auth: 24,          // Auth data can be lost up to 24 hours
        database: 4,       // Database data can be lost up to 4 hours
        criticalData: 1    // Critical data can be lost up to 1 hour
    },
    rto: {
        // Maximum acceptable downtime in hours
        auth: 4,           // Auth services should be restored within 4 hours
        database: 2,       // Database should be restored within 2 hours
        criticalServices: 1 // Critical services should be restored within 1 hour
    }
};