# Flowstack Backup and Recovery System

This directory contains the backup and recovery system for Flowstack, providing comprehensive backup capabilities for Supabase Auth data and application database.

## Features

- Multiple backup types (full, incremental, differential)
- Configurable backup frequency (daily, weekly, monthly)
- Secure backup storage with encryption
- Automated backup scheduling
- Backup verification and validation
- Comprehensive disaster recovery procedures
- Backup monitoring and alerting

## Directory Structure

- `config/` - Configuration files
- `services/` - Backup services
- `utils/` - Utility functions
- `scripts/` - Backup scripts
- `tests/` - Test files
- `docs/` - Documentation

## Installation

The backup system is included as part of the Flowstack server. To install the required dependencies:

```bash
cd packages/server/src/backup
npm install
```

## Configuration

The backup system is configured through environment variables:

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

## Usage

### Manual Backups

To create a manual backup:

```bash
# Create a full backup of all data
node scripts/run-backup.js --type=all --frequency=manual

# Create a backup of only Supabase Auth data
node scripts/run-backup.js --type=auth --frequency=manual

# Create a backup of only the database
node scripts/run-backup.js --type=database --frequency=manual

# Create a backup and verify it
node scripts/run-backup.js --type=all --verify
```

### Backup Verification

To verify backups:

```bash
# Verify the latest Supabase Auth backup
node scripts/verify-auth-backup.js --latest

# Verify a specific Supabase Auth backup
node scripts/verify-auth-backup.js --path=/path/to/backup/file

# Verify all Supabase Auth backups
node scripts/verify-auth-backup.js --all

# Verify the latest database backup
node scripts/verify-db-backup.js --latest

# Verify a specific database backup
node scripts/verify-db-backup.js --path=/path/to/backup/file

# Verify all database backups
node scripts/verify-db-backup.js --all
```

### Programmatic Usage

You can also use the backup system programmatically:

```javascript
const { 
    initializeBackupSystem, 
    runManualBackup, 
    verifyBackup, 
    restoreFromBackup 
} = require('./index');

// Initialize the backup system
initializeBackupSystem();

// Run a manual backup
const { authBackupPath, dbBackupPath } = await runManualBackup();

// Verify a backup
const isValid = await verifyBackup(authBackupPath, 'auth');

// Restore from a backup
const success = await restoreFromBackup(authBackupPath, 'auth');
```

## Documentation

For more detailed information, see the following documentation:

- [Backup System](./docs/backup-system.md) - Comprehensive guide to the backup system
- [Disaster Recovery Procedures](./docs/disaster-recovery-procedures.md) - Step-by-step recovery procedures

## Testing

To run the tests:

```bash
npm test
```

## License

This backup system is part of Flowstack and is subject to the same license.