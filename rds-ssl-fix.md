# RDS SSL Connection Fix

## Problem
Even after setting `DATABASE_SSL=false` and creating a parameter group with `rds.force_ssl=0`, AWS RDS is still rejecting non-encrypted connections with the error:
```
no pg_hba.conf entry for host "10.0.2.6", user "flowstack_admin", database "flowstack", no encryption
```

## Root Cause
AWS RDS PostgreSQL instances are configured by default to require SSL connections for security. The pg_hba.conf file (PostgreSQL's host-based authentication configuration) is managed by AWS and typically requires SSL for all connections from VPC addresses.

## Solution
Instead of fighting RDS's security requirements, we're embracing SSL and configuring the connection properly:

### 1. Terraform Changes (terraform/main.tf)
- Changed `DATABASE_SSL` from `"false"` to `"true"`
- Added `PGSSLMODE=require` environment variable
- Kept `NODE_TLS_REJECT_UNAUTHORIZED=0` to accept RDS's certificate

### 2. Code Changes (core/packages/server/src/DataSource.ts)
Updated `getDatabaseSSLFromEnv()` to handle AWS RDS SSL properly:
```typescript
if (process.env.DATABASE_SSL === 'true') {
    if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
        return {
            rejectUnauthorized: false
        }
    }
    return true
}
```

This configuration tells TypeORM/pg to:
- Use SSL for the connection
- Accept the RDS certificate without validation

## Why This Works
1. RDS requires SSL connections for security
2. We enable SSL to satisfy RDS requirements
3. We disable certificate validation to avoid certificate chain issues
4. The connection is still encrypted, just not validated

## Alternative (If You Really Need Non-SSL)
If you absolutely need to disable SSL:
1. Check if the parameter group was applied: `aws rds describe-db-instances --db-instance-identifier prod-flowstack-db`
2. Reboot the RDS instance to apply parameter group changes
3. Ensure security group allows connections from ECS subnet

## Next Steps
1. Commit the changes
2. Push to trigger GitHub Actions build
3. Apply Terraform changes
4. Force ECS service update

The connection should now work with SSL enabled and certificate validation disabled.