/**
 * Database Backup Service
 * 
 * This service handles the backup and recovery of database schema and data.
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getBackupConfig, BackupType } from '../config/backupConfig';
import { encryptData, decryptData } from '../utils/encryption';
import logger from '../../utils/logger';

// Promisify exec
const execAsync = promisify(exec);

/**
 * Database Backup Service
 */
export class DatabaseBackupService {
    private backupConfig;
    private backupDir: string;

    /**
     * Constructor
     */
    constructor() {
        this.backupConfig = getBackupConfig();
        this.backupDir = path.resolve(this.backupConfig.storage.path, 'database');
        
        // Ensure backup directory exists
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    /**
     * Create a database backup
     * @param {BackupType} backupType - Type of backup to create
     * @returns {Promise<string>} - Path to the created backup file
     */
    async createBackup(backupType: BackupType = BackupType.FULL): Promise<string> {
        try {
            logger.info(`[DatabaseBackup] Starting ${backupType} backup of database`);
            
            // Generate backup filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFilename = `database-${backupType}-${timestamp}.sql`;
            const backupPath = path.join(this.backupDir, backupFilename);
            
            // Get database connection details from environment variables
            const dbHost = process.env.DB_HOST || 'localhost';
            const dbPort = process.env.DB_PORT || '5432';
            const dbName = process.env.DB_NAME || 'postgres';
            const dbUser = process.env.DB_USER || 'postgres';
            const dbPassword = process.env.DB_PASSWORD || '';
            
            // Create pg_dump command
            // Note: In a production environment, you would want to handle the password more securely
            const pgDumpCmd = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p`;
            
            // For incremental backups, we would add additional options
            // This is a simplified example
            const pgDumpOptions = backupType === BackupType.INCREMENTAL 
                ? ' --data-only'  // Only data for incremental backups
                : '';             // Full schema and data for full backups
            
            // Execute pg_dump and capture output
            const { stdout } = await execAsync(`${pgDumpCmd}${pgDumpOptions}`);
            
            // Encrypt backup data if configured
            let dataToStore = stdout;
            if (this.backupConfig.storage.encrypted && this.backupConfig.storage.encryptionKey) {
                dataToStore = encryptData(dataToStore, this.backupConfig.storage.encryptionKey);
            }
            
            // Write backup to file
            fs.writeFileSync(backupPath, dataToStore);
            
            // Validate the backup
            const isValid = await this.validateBackup(backupPath);
            if (!isValid) {
                throw new Error('Backup validation failed');
            }
            
            logger.info(`[DatabaseBackup] Successfully created backup: ${backupFilename}`);
            return backupPath;
        } catch (error: any) {
            logger.error(`[DatabaseBackup] Backup failed: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Restore database from a backup
     * @param {string} backupPath - Path to the backup file
     * @returns {Promise<boolean>} - True if restore was successful
     */
    async restoreFromBackup(backupPath: string): Promise<boolean> {
        try {
            logger.info(`[DatabaseBackup] Starting restoration from backup: ${backupPath}`);
            
            // Read backup file
            let backupData = fs.readFileSync(backupPath, 'utf8');
            
            // Decrypt backup data if encrypted
            if (this.backupConfig.storage.encrypted && this.backupConfig.storage.encryptionKey) {
                backupData = decryptData(backupData, this.backupConfig.storage.encryptionKey);
            }
            
            // Get database connection details from environment variables
            const dbHost = process.env.DB_HOST || 'localhost';
            const dbPort = process.env.DB_PORT || '5432';
            const dbName = process.env.DB_NAME || 'postgres';
            const dbUser = process.env.DB_USER || 'postgres';
            const dbPassword = process.env.DB_PASSWORD || '';
            
            // Create a temporary file for the decrypted backup
            const tempBackupPath = path.join(this.backupDir, `temp-${Date.now()}.sql`);
            fs.writeFileSync(tempBackupPath, backupData);
            
            // Create psql command to restore the database
            const psqlCmd = `PGPASSWORD="${dbPassword}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f ${tempBackupPath}`;
            
            // Execute psql command
            await execAsync(psqlCmd);
            
            // Remove temporary file
            fs.unlinkSync(tempBackupPath);
            
            logger.info(`[DatabaseBackup] Successfully restored from backup: ${backupPath}`);
            return true;
        } catch (error: any) {
            logger.error(`[DatabaseBackup] Restoration failed: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Validate a backup file
     * @param {string} backupPath - Path to the backup file
     * @returns {Promise<boolean>} - True if backup is valid
     */
    async validateBackup(backupPath: string): Promise<boolean> {
        try {
            // Read backup file
            let backupData = fs.readFileSync(backupPath, 'utf8');
            
            // Decrypt backup data if encrypted
            if (this.backupConfig.storage.encrypted && this.backupConfig.storage.encryptionKey) {
                backupData = decryptData(backupData, this.backupConfig.storage.encryptionKey);
            }
            
            // Basic validation: check if the backup contains SQL statements
            if (!backupData.includes('CREATE TABLE') && !backupData.includes('INSERT INTO')) {
                logger.error('[DatabaseBackup] Backup validation failed: No SQL statements found');
                return false;
            }
            
            // For a more thorough validation, we could:
            // 1. Create a temporary database
            // 2. Restore the backup to the temporary database
            // 3. Verify the schema and data
            // 4. Drop the temporary database
            
            return true;
        } catch (error) {
            logger.error(`[DatabaseBackup] Validation failed: ${error}`);
            return false;
        }
    }
    
    /**
     * List available backups
     * @returns {Promise<string[]>} - List of backup file paths
     */
    async listBackups(): Promise<string[]> {
        try {
            const files = fs.readdirSync(this.backupDir);
            return files
                .filter(file => file.startsWith('database-'))
                .map(file => path.join(this.backupDir, file));
        } catch (error) {
            logger.error(`[DatabaseBackup] Failed to list backups: ${error}`);
            return [];
        }
    }
    
    /**
     * Apply backup retention policy
     * @returns {Promise<number>} - Number of backups deleted
     */
    async applyRetentionPolicy(): Promise<number> {
        try {
            const backups = await this.listBackups();
            const now = new Date();
            let deletedCount = 0;
            
            // Group backups by type
            const dailyBackups = backups.filter(b => b.includes('-daily-'));
            const weeklyBackups = backups.filter(b => b.includes('-weekly-'));
            const monthlyBackups = backups.filter(b => b.includes('-monthly-'));
            
            // Apply retention policy for daily backups
            dailyBackups.forEach(backup => {
                const backupDate = this.extractDateFromBackupPath(backup);
                const daysDiff = Math.floor((now.getTime() - backupDate.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysDiff > this.backupConfig.retention.daily) {
                    fs.unlinkSync(backup);
                    deletedCount++;
                    logger.info(`[DatabaseBackup] Deleted expired daily backup: ${backup}`);
                }
            });
            
            // Apply retention policy for weekly backups
            weeklyBackups.forEach(backup => {
                const backupDate = this.extractDateFromBackupPath(backup);
                const daysDiff = Math.floor((now.getTime() - backupDate.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysDiff > this.backupConfig.retention.weekly) {
                    fs.unlinkSync(backup);
                    deletedCount++;
                    logger.info(`[DatabaseBackup] Deleted expired weekly backup: ${backup}`);
                }
            });
            
            // Apply retention policy for monthly backups
            monthlyBackups.forEach(backup => {
                const backupDate = this.extractDateFromBackupPath(backup);
                const daysDiff = Math.floor((now.getTime() - backupDate.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysDiff > this.backupConfig.retention.monthly) {
                    fs.unlinkSync(backup);
                    deletedCount++;
                    logger.info(`[DatabaseBackup] Deleted expired monthly backup: ${backup}`);
                }
            });
            
            return deletedCount;
        } catch (error) {
            logger.error(`[DatabaseBackup] Failed to apply retention policy: ${error}`);
            return 0;
        }
    }
    
    /**
     * Create a point-in-time recovery backup
     * This would typically use WAL (Write-Ahead Logging) in PostgreSQL
     * @returns {Promise<string>} - Path to the created backup file
     */
    async createPointInTimeRecoveryBackup(): Promise<string> {
        try {
            logger.info('[DatabaseBackup] Starting point-in-time recovery backup');
            
            // Generate backup filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFilename = `database-pitr-${timestamp}.tar`;
            const backupPath = path.join(this.backupDir, backupFilename);
            
            // Get database connection details from environment variables
            const dbHost = process.env.DB_HOST || 'localhost';
            const dbPort = process.env.DB_PORT || '5432';
            const dbName = process.env.DB_NAME || 'postgres';
            const dbUser = process.env.DB_USER || 'postgres';
            const dbPassword = process.env.DB_PASSWORD || '';
            
            // Create pg_basebackup command for PITR
            const pgBaseBackupCmd = `PGPASSWORD="${dbPassword}" pg_basebackup -h ${dbHost} -p ${dbPort} -U ${dbUser} -D - -Ft -z -X fetch | cat > ${backupPath}`;
            
            // Execute pg_basebackup command
            await execAsync(pgBaseBackupCmd);
            
            logger.info(`[DatabaseBackup] Successfully created PITR backup: ${backupFilename}`);
            return backupPath;
        } catch (error: any) {
            logger.error(`[DatabaseBackup] PITR backup failed: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Extract date from backup file path
     * @param {string} backupPath - Path to the backup file
     * @returns {Date} - Date extracted from the backup filename
     */
    private extractDateFromBackupPath(backupPath: string): Date {
        const filename = path.basename(backupPath);
        // Extract timestamp from filename (format: database-full-2023-01-01T00-00-00-000Z.sql)
        const timestampMatch = filename.match(/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)/);
        
        if (timestampMatch && timestampMatch[1]) {
            const timestamp = timestampMatch[1].replace(/-/g, (match, offset) => {
                // Replace only the dashes that are part of the time portion
                return offset > 10 ? ':' : match;
            });
            return new Date(timestamp);
        }
        
        // If no timestamp found, return epoch
        return new Date(0);
    }
}

export default new DatabaseBackupService();