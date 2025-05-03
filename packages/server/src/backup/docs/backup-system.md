# Backup and Recovery System

This document provides an overview of the Flowstack backup and recovery system, including configuration, usage, and best practices.

## Table of Contents

1. [Overview](#overview)
2. [Backup Types](#backup-types)
3. [Backup Frequency](#backup-frequency)
4. [Backup Storage](#backup-storage)
5. [Configuration](#configuration)
6. [Manual Backups](#manual-backups)
7. [Automated Backups](#automated-backups)
8. [Backup Verification](#backup-verification)
9. [Backup Monitoring](#backup-monitoring)
10. [Disaster Recovery](#disaster-recovery)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

## Overview

The Flowstack backup and recovery system provides comprehensive backup capabilities for Supabase Auth data and application database. The system is designed to ensure data durability, disaster recovery capabilities, and compliance with data protection requirements.

Key features of the backup system include:

- Multiple backup types (full, incremental, differential)
- Configurable backup frequency (daily, weekly, monthly)
- Secure backup storage with encryption
- Automated backup scheduling
- Backup verification and validation
- Comprehensive disaster recovery procedures
- Backup monitoring and alerting

## Backup Types

The system supports the following backup types:

- **Full Backup**: A complete backup of all data. Full backups are self-contained and do not depend on other backups.
- **Incremental Backup**: A backup of only the data that has changed since the last backup (full or incremental). Incremental backups are smaller and faster to create but require previous backups for restoration.
- **Differential Backup**: A backup of all data that has changed since the last full backup. Differential backups are larger than incremental backups but only require the last full backup for restoration.

## Backup Frequency

The system supports the following backup frequencies:

- **Daily Backups**: Incremental backups performed daily, retained for 30 days.
- **Weekly Backups**: Full backups performed weekly (typically on Sundays), retained for 90 days.
- **Monthly Backups**: Full backups performed monthly (typically on the 1st of each month), retained for 1 year.

## Backup Storage

Backups are stored in the configured backup storage location. The system supports the following storage types:

- **Local Storage**: Backups are stored on the local filesystem.
- **S3-Compatible Storage**: Backups are stored in an S3-compatible object storage service (AWS S3, MinIO, etc.).
- **Google Cloud Storage**: Backups are stored in Google Cloud Storage.
- **Azure Blob Storage**: Backups are stored in Azure Blob Storage.

All backups are encrypted using AES-256-GCM encryption with a configurable encryption key.

## Configuration

The backup system is configured through environment variables and the `backupConfig.ts` file. The following environment variables are available:

| Variable | Description | Default |
|----------|-------------|---------|
| `BACKUP_ENABLED` | Enable or disable the backup system | `true` |
| `BACKUP_FREQUENCY` | Default backup frequency | `daily` |
| `BACKUP_TYPE` | Default backup type | `full` |
| `BACKUP_STORAGE_PATH` | Path to store backups | `./backups` |
| `BACKUP_STORAGE_TYPE` | Storage type (local, s3, gcs, azure) | `local` |
| `BACKUP_STORAGE_ENCRYPTED` | Enable or disable backup encryption | `true` |
| `BACKUP_ENCRYPTION_KEY` | Encryption key for backups | Generated |
| `BACKUP_RETENTION_DAILY` | Days to keep daily backups | `30` |
| `BACKUP_RETENTION_WEEKLY` | Days to keep weekly backups | `90` |
| `BACKUP_RETENTION_MONTHLY` | Days to keep monthly backups | `365` |
| `BACKUP_NOTIFICATION_EMAIL` | Email addresses for notifications | None |
| `BACKUP_NOTIFICATION_SLACK` | Slack webhook URL for notifications | None |

## Manual Backups

Manual backups can be created using the `run-backup.js` script:

```bash
# Create a full backup of all data
node packages/server/src/backup/scripts/run-backup.js --type=all --frequency=manual

# Create a backup of only Supabase Auth data
node packages/server/src/backup/scripts/run-backup.js --type=auth --frequency=manual

# Create a backup of only the database
node packages/server/src/backup/scripts/run-backup.js --type=database --frequency=manual

# Create a backup and verify it
node packages/server/src/backup/scripts/run-backup.js --type=all --verify
```

## Automated Backups

Automated backups are scheduled using the backup scheduler service. The scheduler creates backups according to the configured frequency and type.

The scheduler runs the following jobs:

- **Daily Backup Job**: Runs at 1:00 AM every day
- **Weekly Backup Job**: Runs at 2:00 AM every Sunday
- **Monthly Backup Job**: Runs at 3:00 AM on the 1st of each month
- **Retention Policy Job**: Runs at 4:00 AM every day

## Backup Verification

Backups can be verified using the verification scripts:

```bash
# Verify the latest Supabase Auth backup
node packages/server/src/backup/scripts/verify-auth-backup.js --latest

# Verify a specific Supabase Auth backup
node packages/server/src/backup/scripts/verify-auth-backup.js --path=/path/to/backup/file

# Verify all Supabase Auth backups
node packages/server/src/backup/scripts/verify-auth-backup.js --all

# Verify the latest database backup
node packages/server/src/backup/scripts/verify-db-backup.js --latest

# Verify a specific database backup
node packages/server/src/backup/scripts/verify-db-backup.js --path=/path/to/backup/file

# Verify all database backups
node packages/server/src/backup/scripts/verify-db-backup.js --all
```

## Backup Monitoring

The backup monitoring service tracks backup status, sizes, and provides monitoring capabilities. The service:

- Tracks backup processes
- Monitors backup sizes and growth
- Provides status information
- Generates reports
- Sends alerts for backup failures

Backup monitoring reports can be generated using the monitoring service:

```javascript
const backupMonitoringService = require('./services/backupMonitoringService').default;

// Generate a daily report
const dailyReport = backupMonitoringService.generateReport('daily');

// Generate a weekly report
const weeklyReport = backupMonitoringService.generateReport('weekly');

// Generate a monthly report
const monthlyReport = backupMonitoringService.generateReport('monthly');
```

## Disaster Recovery

The disaster recovery procedures are documented in the [Disaster Recovery Procedures](./disaster-recovery-procedures.md) document. The procedures cover various scenarios, including:

- Supabase Auth data loss
- Database corruption
- Complete system failure
- Ransomware or security breach

## Best Practices

The following best practices are recommended for the backup and recovery system:

1. **Regular Testing**: Regularly test the backup and recovery procedures to ensure they work when needed.
2. **Multiple Storage Locations**: Store backups in multiple geographic locations to protect against regional disasters.
3. **Encryption**: Always encrypt backups to protect sensitive data.
4. **Monitoring**: Monitor backup processes and set up alerts for backup failures.
5. **Documentation**: Keep documentation up to date and ensure all team members are familiar with the recovery procedures.
6. **Automation**: Automate as much of the backup and recovery process as possible to reduce human error.
7. **Retention Policy**: Implement a retention policy to manage backup storage and ensure compliance with data protection requirements.

## Troubleshooting

### Common Issues

#### Backup Creation Fails

If backup creation fails, check the following:

- Ensure the backup directory exists and is writable
- Check database connection details
- Verify that the required tools (pg_dump, etc.) are installed
- Check for disk space issues

#### Backup Verification Fails

If backup verification fails, check the following:

- Ensure the backup file exists and is readable
- Check if the backup is encrypted and the encryption key is correct
- Verify that the backup contains the expected data
- Check for corruption in the backup file

#### Scheduled Backups Not Running

If scheduled backups are not running, check the following:

- Ensure the backup scheduler service is running
- Check the cron job configuration
- Verify that the backup system is enabled
- Check for errors in the scheduler logs

### Getting Help

If you encounter issues with the backup and recovery system, please contact the system administrator or open an issue in the project repository.