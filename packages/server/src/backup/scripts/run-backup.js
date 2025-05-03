#!/usr/bin/env node

/**
 * Backup Script
 * 
 * This script runs manual backups of Supabase Auth data and database.
 * 
 * Usage:
 *   node run-backup.js --type=all --frequency=daily
 *   node run-backup.js --type=auth --frequency=weekly
 *   node run-backup.js --type=database --frequency=monthly
 */

const { program } = require('commander');
const path = require('path');
const fs = require('fs');

// Import services
const supabaseAuthBackupService = require('../services/supabaseAuthBackupService').default;
const databaseBackupService = require('../services/databaseBackupService').default;
const backupMonitoringService = require('../services/backupMonitoringService').default;
const { BackupType } = require('../config/backupConfig');
const { BackupStatus } = require('../services/backupMonitoringService');

// Configure command-line options
program
  .option('-t, --type <type>', 'Backup type (auth, database, all)', 'all')
  .option('-f, --frequency <frequency>', 'Backup frequency (daily, weekly, monthly)', 'manual')
  .option('-v, --verify', 'Verify backup after creation', false)
  .option('--verbose', 'Enable verbose output', false)
  .parse(process.argv);

const options = program.opts();

// Main function
async function main() {
  try {
    console.log(`Starting ${options.frequency} backup of ${options.type}`);
    
    // Determine backup type
    const backupType = options.frequency === 'daily' ? BackupType.INCREMENTAL : BackupType.FULL;
    
    // Run auth backup if requested
    if (options.type === 'auth' || options.type === 'all') {
      await runAuthBackup(backupType, options.frequency);
    }
    
    // Run database backup if requested
    if (options.type === 'database' || options.type === 'all') {
      await runDatabaseBackup(backupType, options.frequency);
    }
    
    console.log('Backup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error(`Backup failed: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Run Supabase Auth backup
 * @param {BackupType} backupType - Backup type
 * @param {string} frequency - Backup frequency
 * @returns {Promise<string>} - Path to the created backup file
 */
async function runAuthBackup(backupType, frequency) {
  console.log(`Running ${frequency} Supabase Auth backup...`);
  
  // Start tracking the backup
  const trackingId = backupMonitoringService.startBackupTracking('auth', frequency);
  
  try {
    // Create the backup
    const backupPath = await supabaseAuthBackupService.createBackup(backupType);
    console.log(`Auth backup created: ${backupPath}`);
    
    // Rename the file to include frequency
    const newPath = renameBackupFile(backupPath, frequency);
    console.log(`Auth backup renamed: ${path.basename(newPath)}`);
    
    // Verify the backup if requested
    if (options.verify) {
      console.log('Verifying auth backup...');
      const isValid = await supabaseAuthBackupService.validateBackup(newPath);
      
      if (isValid) {
        console.log('Auth backup verification successful');
      } else {
        throw new Error('Auth backup verification failed');
      }
    }
    
    // Complete tracking with success status
    backupMonitoringService.completeBackupTracking(trackingId, BackupStatus.SUCCESS, {
      path: newPath,
      size: fs.statSync(newPath).size
    });
    
    return newPath;
  } catch (error) {
    // Complete tracking with failure status
    backupMonitoringService.completeBackupTracking(trackingId, BackupStatus.FAILURE, {
      error: error.message
    });
    
    throw error;
  }
}

/**
 * Run database backup
 * @param {BackupType} backupType - Backup type
 * @param {string} frequency - Backup frequency
 * @returns {Promise<string>} - Path to the created backup file
 */
async function runDatabaseBackup(backupType, frequency) {
  console.log(`Running ${frequency} database backup...`);
  
  // Start tracking the backup
  const trackingId = backupMonitoringService.startBackupTracking('database', frequency);
  
  try {
    // Create the backup
    const backupPath = await databaseBackupService.createBackup(backupType);
    console.log(`Database backup created: ${backupPath}`);
    
    // Rename the file to include frequency
    const newPath = renameBackupFile(backupPath, frequency);
    console.log(`Database backup renamed: ${path.basename(newPath)}`);
    
    // Verify the backup if requested
    if (options.verify) {
      console.log('Verifying database backup...');
      const isValid = await databaseBackupService.validateBackup(newPath);
      
      if (isValid) {
        console.log('Database backup verification successful');
      } else {
        throw new Error('Database backup verification failed');
      }
    }
    
    // Complete tracking with success status
    backupMonitoringService.completeBackupTracking(trackingId, BackupStatus.SUCCESS, {
      path: newPath,
      size: fs.statSync(newPath).size
    });
    
    return newPath;
  } catch (error) {
    // Complete tracking with failure status
    backupMonitoringService.completeBackupTracking(trackingId, BackupStatus.FAILURE, {
      error: error.message
    });
    
    throw error;
  }
}

/**
 * Rename backup file to include frequency
 * @param {string} filePath - Path to the backup file
 * @param {string} frequency - Backup frequency (daily, weekly, monthly, manual)
 * @returns {string} - New file path
 */
function renameBackupFile(filePath, frequency) {
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
}

// Run the script
main();