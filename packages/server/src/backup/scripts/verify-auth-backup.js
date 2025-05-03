#!/usr/bin/env node

/**
 * Supabase Auth Backup Verification Script
 * 
 * This script verifies the integrity of Supabase Auth backups.
 * 
 * Usage:
 *   node verify-auth-backup.js --path=/path/to/backup/file
 *   node verify-auth-backup.js --latest
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const { createClient } = require('@supabase/supabase-js');
const { decryptData } = require('../utils/encryption');
const { deepValidateBackup } = require('../utils/backupValidation');
const { getBackupConfig } = require('../config/backupConfig');
const { getSupabaseConfig } = require('../../config/supabase');

// Configure command-line options
program
  .option('-p, --path <path>', 'Path to the backup file')
  .option('-l, --latest', 'Verify the latest backup')
  .option('-a, --all', 'Verify all backups')
  .option('-v, --verbose', 'Enable verbose output')
  .parse(process.argv);

const options = program.opts();

// Main function
async function main() {
  try {
    const backupConfig = getBackupConfig();
    const backupDir = path.resolve(backupConfig.storage.path, 'auth');
    
    // Determine which backup(s) to verify
    let backupPaths = [];
    
    if (options.path) {
      // Verify a specific backup
      backupPaths = [options.path];
    } else if (options.latest) {
      // Verify the latest backup
      const files = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('supabase-auth-'))
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
        .filter(file => file.startsWith('supabase-auth-'))
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
      const result = await verifyBackup(backupPath, options.verbose);
      
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
 * Verify a backup file
 * @param {string} backupPath - Path to the backup file
 * @param {boolean} verbose - Enable verbose output
 * @returns {Promise<{valid: boolean, issues: string[]}>} - Verification result
 */
async function verifyBackup(backupPath, verbose = false) {
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
    
    // Parse backup data
    let backup;
    try {
      backup = JSON.parse(backupData);
    } catch (error) {
      return { valid: false, issues: [`Failed to parse backup JSON: ${error.message}`] };
    }
    
    // Perform deep validation
    const validationResult = await deepValidateBackup(backup);
    
    if (verbose && validationResult.valid) {
      console.log('Backup structure is valid');
      console.log(`Backup contains ${backup.users.length} users`);
      console.log(`Backup timestamp: ${backup.timestamp}`);
      console.log(`Backup type: ${backup.type}`);
    }
    
    // Verify against Supabase if possible
    if (validationResult.valid) {
      try {
        const supabaseConfig = getSupabaseConfig();
        const supabaseAdmin = createClient(
          supabaseConfig.url,
          supabaseConfig.serviceRoleKey,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        );
        
        // Sample a few users to verify they exist in Supabase
        const sampleSize = Math.min(5, backup.users.length);
        const sampleUsers = backup.users
          .sort(() => 0.5 - Math.random()) // Shuffle array
          .slice(0, sampleSize);
        
        for (const user of sampleUsers) {
          if (verbose) {
            console.log(`Verifying user: ${user.id}`);
          }
          
          const { data, error } = await supabaseAdmin.auth.admin.getUserById(user.id);
          
          if (error) {
            validationResult.issues.push(`User ${user.id} not found in Supabase: ${error.message}`);
          } else if (verbose) {
            console.log(`User ${user.id} verified in Supabase`);
          }
        }
        
        // Update validation result based on Supabase verification
        validationResult.valid = validationResult.issues.length === 0;
      } catch (error) {
        console.warn(`Warning: Could not verify against Supabase: ${error.message}`);
        // Don't fail validation just because we couldn't connect to Supabase
      }
    }
    
    return validationResult;
  } catch (error) {
    return { valid: false, issues: [`Verification error: ${error.message}`] };
  }
}

// Run the script
main();