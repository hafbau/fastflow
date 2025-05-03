/**
 * Backup Encryption Utilities
 * 
 * This file contains utilities for encrypting and decrypting backup data.
 */

import crypto from 'crypto';

/**
 * Algorithm used for encryption
 */
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt data using AES-256-GCM
 * @param {string} data - Data to encrypt
 * @param {string} key - Encryption key
 * @returns {string} - Encrypted data in format: iv:authTag:encryptedData
 */
export const encryptData = (data: string, key: string): string => {
    try {
        // Create a buffer from the key (using SHA-256 to ensure correct length)
        const keyBuffer = crypto.createHash('sha256').update(key).digest();
        
        // Generate a random initialization vector
        const iv = crypto.randomBytes(16);
        
        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
        
        // Encrypt the data
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Get the authentication tag
        const authTag = cipher.getAuthTag().toString('hex');
        
        // Return the IV, auth tag, and encrypted data as a single string
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error) {
        throw new Error(`Encryption failed: ${error}`);
    }
};

/**
 * Decrypt data using AES-256-GCM
 * @param {string} encryptedData - Encrypted data in format: iv:authTag:encryptedData
 * @param {string} key - Encryption key
 * @returns {string} - Decrypted data
 */
export const decryptData = (encryptedData: string, key: string): string => {
    try {
        // Create a buffer from the key (using SHA-256 to ensure correct length)
        const keyBuffer = crypto.createHash('sha256').update(key).digest();
        
        // Split the encrypted data into IV, auth tag, and encrypted content
        const [ivHex, authTagHex, encryptedContent] = encryptedData.split(':');
        
        if (!ivHex || !authTagHex || !encryptedContent) {
            throw new Error('Invalid encrypted data format');
        }
        
        // Convert hex strings back to buffers
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        
        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
        decipher.setAuthTag(authTag);
        
        // Decrypt the data
        let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        throw new Error(`Decryption failed: ${error}`);
    }
};

/**
 * Generate a random encryption key
 * @returns {string} - Random encryption key
 */
export const generateEncryptionKey = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash data using SHA-256
 * @param {string} data - Data to hash
 * @returns {string} - Hashed data
 */
export const hashData = (data: string): string => {
    return crypto.createHash('sha256').update(data).digest('hex');
};