/**
 * Backup Validation Utilities
 * 
 * This file contains utilities for validating backup integrity.
 */

import { hashData } from './encryption';
import logger from '../../utils/logger';

/**
 * Backup metadata interface
 */
export interface BackupMetadata {
    recordCount: number;
    contentHash: string;
    createdAt: string;
}

/**
 * Create backup metadata for validation
 * @param {any[]} data - Data to create metadata for
 * @returns {BackupMetadata} - Backup metadata
 */
export const createBackupMetadata = (data: any[]): BackupMetadata => {
    return {
        recordCount: data.length,
        contentHash: hashData(JSON.stringify(data)),
        createdAt: new Date().toISOString()
    };
};

/**
 * Validate backup data integrity
 * @param {any} backup - Backup data to validate
 * @returns {boolean} - True if backup is valid
 */
export const validateBackup = (backup: any): boolean => {
    try {
        // Check if backup has required fields
        if (!backup || !backup.users || !backup.metadata || !backup.timestamp || !backup.type) {
            logger.error('[BackupValidation] Backup is missing required fields');
            return false;
        }
        
        // Check record count
        if (backup.users.length !== backup.metadata.recordCount) {
            logger.error(`[BackupValidation] Record count mismatch: expected ${backup.metadata.recordCount}, got ${backup.users.length}`);
            return false;
        }
        
        // Verify content hash
        const calculatedHash = hashData(JSON.stringify(backup.users));
        if (calculatedHash !== backup.metadata.contentHash) {
            logger.error('[BackupValidation] Content hash mismatch');
            return false;
        }
        
        return true;
    } catch (error) {
        logger.error(`[BackupValidation] Validation error: ${error}`);
        return false;
    }
};

/**
 * Perform a deep validation of backup data
 * @param {any} backup - Backup data to validate
 * @returns {Promise<{valid: boolean, issues: string[]}>} - Validation result
 */
export const deepValidateBackup = async (backup: any): Promise<{valid: boolean, issues: string[]}> => {
    const issues: string[] = [];
    
    try {
        // Basic validation
        if (!validateBackup(backup)) {
            issues.push('Basic validation failed');
            return { valid: false, issues };
        }
        
        // Check user data integrity
        for (const [index, user] of backup.users.entries()) {
            // Check required user fields
            if (!user.id) {
                issues.push(`User at index ${index} is missing ID`);
            }
            
            if (!user.email && !user.phone) {
                issues.push(`User ${user.id || index} has no email or phone`);
            }
            
            // Check for valid email format if present
            if (user.email && !isValidEmail(user.email)) {
                issues.push(`User ${user.id || index} has invalid email format: ${user.email}`);
            }
            
            // Check for valid phone format if present
            if (user.phone && !isValidPhone(user.phone)) {
                issues.push(`User ${user.id || index} has invalid phone format: ${user.phone}`);
            }
            
            // Check metadata is an object if present
            if (user.user_metadata && typeof user.user_metadata !== 'object') {
                issues.push(`User ${user.id || index} has invalid user_metadata format`);
            }
            
            if (user.app_metadata && typeof user.app_metadata !== 'object') {
                issues.push(`User ${user.id || index} has invalid app_metadata format`);
            }
        }
        
        // Check for duplicate user IDs
        const userIds = backup.users.map((user: any) => user.id);
        const uniqueUserIds = new Set(userIds);
        if (userIds.length !== uniqueUserIds.size) {
            issues.push('Backup contains duplicate user IDs');
        }
        
        // Check timestamp is valid
        if (isNaN(Date.parse(backup.timestamp))) {
            issues.push(`Invalid timestamp format: ${backup.timestamp}`);
        }
        
        return { 
            valid: issues.length === 0,
            issues 
        };
    } catch (error) {
        issues.push(`Deep validation error: ${error}`);
        return { valid: false, issues };
    }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone format
 * @param {string} phone - Phone to validate
 * @returns {boolean} - True if phone is valid
 */
const isValidPhone = (phone: string): boolean => {
    // Simple validation for demonstration purposes
    // In a real implementation, this would be more sophisticated
    return phone.length >= 10 && /^\+?[0-9]+$/.test(phone);
};