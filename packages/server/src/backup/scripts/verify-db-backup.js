#!/usr/bin/env node

/**
 * Database Backup Verification Script
 * 
 * This script verifies the integrity of database backups.
 * 
 * Usage:
 *   node verify-db-backup.js --path=/path/to/backup/file
 *   node verify-db-backup.js --latest
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { program } = require('commander');
const { decryptData } = require('../utils/encryption');
const { getBackupConfig } = require('../config/backupConfig');

// Promisify exec
const execAsync = promisify(exec);

// Configure command-line options
program
  .option('-p, --path <path>', 'Path to the backup file')
  .option('-l, --latest', 'Verify the latest backup')
  .option('-a, --all', 'Verify all backups')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-t, --temp-db <name>', 'Temporary database name for restoration test', 'backup_verify_temp')
  .parse(process.argv);

const options = program.opts();

// Main function
async function main() {
  try {
    const backupConfig = getBackupConfig();
    const backupDir = path.resolve(backupConfig.storage.path, 'database');
    
    // Determine which backup(s) to verify
    let backupPaths = [];
    
    if (options.path) {
      // Verify a specific backup
      backupPaths = [options.path];
    } else if (options.latest) {
      // Verify the latest backup
      const files = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('database-'))
        .map(file => path.join(backupDir, file));
      
      if (files.length === 0) {
        console.error('No backups found');
        process.exit(1);
      }
      
      // Sort by modification time (newest first)
      files.sort((a, b) => {
        return fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime();
      });
      
      backupPaths = [files[0]];
      console.log(`Verifying latest backup: ${path.basename(backupPaths[0])}`);
    } else if (options.all) {
      // Verify all backups
      backupPaths = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('database-'))
        .map(file => path.join(backupDir, file));
      
      console.log(`Verifying ${backupPaths.length} backups`);
    } else {
      console.error('Please specify a backup to verify using --path, --latest, or --all');
      program.help();
    }
    
    // Verify each backup
    let successCount = 0;
    let failureCount = 0;
    
    for (const backupPath of backupPaths) {
      const result = await verifyBackup(backupPath, options.verbose, options.tempDb);
      
      if (result.valid) {
        successCount++;
        console.log(`✅ ${path.basename(backupPath)}: Valid`);
      } else {
        failureCount++;
        console.error(`❌ ${path.basename(backupPath)}: Invalid`);
        if (options.verbose) {
          console.error('Issues:');
          result.issues.forEach(issue => console.error(`  - ${issue}`));
        }
      }
    }
    
    // Print summary
    console.log('\nVerification Summary:');
    console.log(`Total backups: ${backupPaths.length}`);
    console.log(`Valid backups: ${successCount}`);
    console.log(`Invalid backups: ${failureCount}`);
    
    // Exit with appropriate code
    process.exit(failureCount > 0 ? 1 : 0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Verify a database backup file
 * @param {string} backupPath - Path to the backup file
 * @param {boolean} verbose - Enable verbose output
 * @param {string} tempDb - Temporary database name for restoration test
 * @returns {Promise<{valid: boolean, issues: string[]}>} - Verification result
 */
async function verifyBackup(backupPath, verbose = false, tempDb = 'backup_verify_temp') {
  const issues = [];
  
  try {
    if (verbose) {
      console.log(`Verifying backup: ${backupPath}`);
    }
    
    // Check if file exists
    if (!fs.existsSync(backupPath)) {
      return { valid: false, issues: [`Backup file not found: ${backupPath}`] };
    }
    
    // Read backup file
    let backupData = fs.readFileSync(backupPath, 'utf8');
    
    // Decrypt backup data if encrypted
    const backupConfig = getBackupConfig();
    if (backupConfig.storage.encrypted && backupConfig.storage.encryptionKey) {
      try {
        backupData = decryptData(backupData, backupConfig.storage.encryptionKey);
      } catch (error) {
        return { valid: false, issues: [`Failed to decrypt backup: ${error.message}`] };
      }
    }
    
    // Basic validation: check if the backup contains SQL statements
    if (!backupData.includes('CREATE TABLE') && !backupData.includes('INSERT INTO')) {
      issues.push('Backup does not contain SQL statements');
    }
    
    // Check for common database objects
    const requiredObjects = [
      'organizations', 'workspaces', 'users', 'roles', 'permissions'
    ];
    
    for (const object of requiredObjects) {
      if (!backupData.includes(object)) {
        issues.push(`Backup does not contain references to '${object}'`);
      }
    }
    
    // For a more thorough validation, try to restore to a temporary database
    if (verbose) {
      console.log('Performing test restoration to temporary database');
    }
    
    // Create a temporary file for the decrypted backup
    const tempBackupPath = path.join(path.dirname(backupPath), `temp-${Date.now()}.sql`);
    fs.writeFileSync(tempBackupPath, backupData);
    
    try {
      // Get database connection details from environment variables
      const dbHost = process.env.DB_HOST || 'localhost';
      const dbPort = process.env.DB_PORT || '5432';
      const dbUser = process.env.DB_USER || 'postgres';
      const dbPassword = process.env.DB_PASSWORD || '';
      
      // Create temporary database
      await execAsync(`PGPASSWORD="${dbPassword}" dropdb -h ${dbHost} -p ${dbPort} -U ${dbUser} --if-exists ${tempDb}`);
      await execAsync(`PGPASSWORD="${dbPassword}" createdb -h ${dbHost} -p ${dbPort} -U ${dbUser} ${tempDb}`);
      
      if (verbose) {
        console.log(`Created temporary database: ${tempDb}`);
      }
      
      // Restore backup to temporary database
      await execAsync(`PGPASSWORD="${dbPassword}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${tempDb} -f ${tempBackupPath}`);
      
      if (verbose) {
        console.log('Backup restored to temporary database');
      }
      
      // Verify database structure
      const { stdout } = await execAsync(`PGPASSWORD="${dbPassword}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${tempDb} -c "\\dt"`);
      
      if (verbose) {
        console.log('Database tables:');
        console.log(stdout);
      }
      
      // Check if required tables exist
      for (const table of requiredObjects) {
        if (!stdout.includes(table)) {
          issues.push(`Required table '${table}' not found in restored database`);
        }
      }
      
      // Check row counts in key tables
      const tables = ['organizations', 'workspaces', 'users'];
      for (const table of tables) {
        try {
          const { stdout: countResult } = await execAsync(
            `PGPASSWORD="${dbPassword}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${tempDb} -t -c "SELECT COUNT(*) FROM ${table}"`
          );
          
          const count = parseInt(countResult.trim());
          if (verbose) {
            console.log(`Table ${table} has ${count} rows`);
          }
          
          if (count === 0) {
            issues.push(`Table '${table}' has 0 rows`);
          }
        } catch (error) {
          issues.push(`Failed to check row count for table '${table}': ${error.message}`);
        }
      }
    } catch (error) {
      issues.push(`Test restoration failed: ${error.message}`);
    } finally {
      // Clean up
      try {
        // Remove temporary file
        fs.unlinkSync(tempBackupPath);
        
        // Drop temporary database
        await execAsync(`PGPASSWORD="${dbPassword}" dropdb -h ${dbHost} -p ${dbPort} -U ${dbUser} --if-exists ${tempDb}`);
        
        if (verbose) {
          console.log('Cleanup completed');
        }
      } catch (cleanupError) {
        console.warn(`Warning: Cleanup failed: ${cleanupError.message}`);
      }
    }
    
    return { valid: issues.length === 0, issues };
  } catch (error) {
    return { valid: false, issues: [`Verification error: ${error.message}`] };
  }
}

// Run the script
main();