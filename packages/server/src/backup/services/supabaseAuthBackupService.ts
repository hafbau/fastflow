/**
 * Supabase Auth Backup Service
 * 
 * This service handles the backup and recovery of Supabase Auth data.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '../../config/supabase';
import { getBackupConfig, BackupType } from '../config/backupConfig';
import { encryptData, decryptData } from '../utils/encryption';
import { createBackupMetadata, validateBackup } from '../utils/backupValidation';
import logger from '../../utils/logger';

/**
 * Supabase Auth Backup Service
 */
export class SupabaseAuthBackupService {
    private supabaseAdmin;
    private backupConfig;
    private backupDir: string;

    /**
     * Constructor
     */
    constructor() {
        const supabaseConfig = getSupabaseConfig();
        this.supabaseAdmin = createClient(
            supabaseConfig.url,
            supabaseConfig.serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );
        this.backupConfig = getBackupConfig();
        this.backupDir = path.resolve(this.backupConfig.storage.path, 'auth');
        
        // Ensure backup directory exists
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    /**
     * Create a backup of Supabase Auth data
     * @param {BackupType} backupType - Type of backup to create
     * @returns {Promise<string>} - Path to the created backup file
     */
    async createBackup(backupType: BackupType = BackupType.FULL): Promise<string> {
        try {
            logger.info(`[SupabaseAuthBackup] Starting ${backupType} backup of Supabase Auth data`);
            
            // Generate backup filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFilename = `supabase-auth-${backupType}-${timestamp}.json`;
            const backupPath = path.join(this.backupDir, backupFilename);
            
            // Fetch users from Supabase Auth
            const { data: users, error } = await this.supabaseAdmin.auth.admin.listUsers();
            
            if (error) {
                throw new Error(`Failed to fetch users: ${error.message}`);
            }
            
            // Create backup data object
            const backupData = {
                timestamp: new Date().toISOString(),
                type: backupType,
                users: users.users,
                metadata: createBackupMetadata(users.users)
            };
            
            // Encrypt backup data if configured
            let dataToStore = JSON.stringify(backupData, null, 2);
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
            
            logger.info(`[SupabaseAuthBackup] Successfully created backup: ${backupFilename}`);
            return backupPath;
        } catch (error: any) {
            logger.error(`[SupabaseAuthBackup] Backup failed: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Restore Supabase Auth data from a backup
     * @param {string} backupPath - Path to the backup file
     * @returns {Promise<boolean>} - True if restore was successful
     */
    async restoreFromBackup(backupPath: string): Promise<boolean> {
        try {
            logger.info(`[SupabaseAuthBackup] Starting restoration from backup: ${backupPath}`);
            
            // Read backup file
            let backupData = fs.readFileSync(backupPath, 'utf8');
            
            // Decrypt backup data if encrypted
            if (this.backupConfig.storage.encrypted && this.backupConfig.storage.encryptionKey) {
                backupData = decryptData(backupData, this.backupConfig.storage.encryptionKey);
            }
            
            const backup = JSON.parse(backupData);
            
            // Validate backup integrity
            if (!validateBackup(backup)) {
                throw new Error('Backup validation failed');
            }
            
            // In a real implementation, we would restore users to Supabase Auth
            // This is a simplified example that would need to be expanded
            // with proper error handling and transaction support
            
            for (const user of backup.users) {
                // Check if user exists
                const { data: existingUser } = await this.supabaseAdmin.auth.admin.getUserById(user.id);
                
                if (existingUser && existingUser.user) {
                    // Update existing user
                    await this.supabaseAdmin.auth.admin.updateUserById(user.id, {
                        email: user.email,
                        phone: user.phone,
                        user_metadata: user.user_metadata,
                        app_metadata: user.app_metadata
                    });
                } else {
                    // Create new user
                    // Note: In a real implementation, we would need to handle passwords securely
                    await this.supabaseAdmin.auth.admin.createUser({
                        email: user.email,
                        phone: user.phone,
                        password: 'temporary-password', // This would need to be handled properly
                        email_confirm: true,
                        user_metadata: user.user_metadata,
                        app_metadata: user.app_metadata
                    });
                }
            }
            
            logger.info(`[SupabaseAuthBackup] Successfully restored from backup: ${backupPath}`);
            return true;
        } catch (error: any) {
            logger.error(`[SupabaseAuthBackup] Restoration failed: ${error.message}`);
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
            
            const backup = JSON.parse(backupData);
            
            // Validate backup structure and integrity
            return validateBackup(backup);
        } catch (error) {
            logger.error(`[SupabaseAuthBackup] Validation failed: ${error}`);
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
                .filter(file => file.startsWith('supabase-auth-'))
                .map(file => path.join(this.backupDir, file));
        } catch (error) {
            logger.error(`[SupabaseAuthBackup] Failed to list backups: ${error}`);
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
                    logger.info(`[SupabaseAuthBackup] Deleted expired daily backup: ${backup}`);
                }
            });
            
            // Apply retention policy for weekly backups
            weeklyBackups.forEach(backup => {
                const backupDate = this.extractDateFromBackupPath(backup);
                const daysDiff = Math.floor((now.getTime() - backupDate.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysDiff > this.backupConfig.retention.weekly) {
                    fs.unlinkSync(backup);
                    deletedCount++;
                    logger.info(`[SupabaseAuthBackup] Deleted expired weekly backup: ${backup}`);
                }
            });
            
            // Apply retention policy for monthly backups
            monthlyBackups.forEach(backup => {
                const backupDate = this.extractDateFromBackupPath(backup);
                const daysDiff = Math.floor((now.getTime() - backupDate.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysDiff > this.backupConfig.retention.monthly) {
                    fs.unlinkSync(backup);
                    deletedCount++;
                    logger.info(`[SupabaseAuthBackup] Deleted expired monthly backup: ${backup}`);
                }
            });
            
            return deletedCount;
        } catch (error) {
            logger.error(`[SupabaseAuthBackup] Failed to apply retention policy: ${error}`);
            return 0;
        }
    }
    
    /**
     * Extract date from backup file path
     * @param {string} backupPath - Path to the backup file
     * @returns {Date} - Date extracted from the backup filename
     */
    private extractDateFromBackupPath(backupPath: string): Date {
        const filename = path.basename(backupPath);
        // Extract timestamp from filename (format: supabase-auth-full-2023-01-01T00-00-00-000Z.json)
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

export default new SupabaseAuthBackupService();