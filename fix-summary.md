# ECS SSL Fix Summary

## Root Cause
The issue occurs because:
1. **Docker Compose**: Connects to a local PostgreSQL container that doesn't advertise SSL support
2. **ECS**: Connects to AWS RDS PostgreSQL which advertises SSL support by default
3. **TypeORM Bug**: When `getDatabaseSSLFromEnv()` returns `undefined` (which it did when `DATABASE_SSL=false`), TypeORM still attempts SSL if the server advertises it
4. **AWS RDS**: Uses self-signed certificates that fail validation

## The Fix Applied

### 1. Code Fix (REQUIRED - This is the main fix)
Modified `core/packages/server/src/DataSource.ts` to explicitly return `false` when `DATABASE_SSL=false`:

```typescript
export const getDatabaseSSLFromEnv = () => {
    if (process.env.DATABASE_SSL_KEY_BASE64) {
        return {
            rejectUnauthorized: false,
            ca: Buffer.from(process.env.DATABASE_SSL_KEY_BASE64, 'base64')
        }
    } else if (process.env.DATABASE_SSL === 'true') {
        return true
    } else if (process.env.DATABASE_SSL === 'false') {
        // Explicitly return false to disable SSL when DATABASE_SSL=false
        return false
    }
    return undefined
}
```

### 2. Terraform Changes (Already Applied)
- Added custom RDS parameter group with `rds.force_ssl = 0`
- Kept `DATABASE_SSL = "false"` in environment variables
- Added `NODE_TLS_REJECT_UNAUTHORIZED = "0"` as backup

## Next Steps

1. **Rebuild and Push Docker Image to DockerHub** (REQUIRED):
   
   **Option A: Using GitHub Actions (Recommended)**
   - Commit and push the changes to `main` branch
   - GitHub Actions will automatically build and push to DockerHub
   
   **Option B: Manual Build and Push**
   ```bash
   # Build locally
   ./scripts/build-docker.sh
   
   # Login to DockerHub
   docker login
   
   # Push to DockerHub
   docker push leadevs/fastflow:latest
   ```

2. **Apply Terraform Changes** (if not already done):
   ```bash
   cd terraform
   terraform apply -var="region=us-east-1" -var="stage=prod"
   ```

3. **Force ECS to Pull New Image**:
   ```bash
   aws ecs update-service \
     --cluster prod-flowstack-cluster \
     --service fastflow-service \
     --force-new-deployment \
     --region us-east-1
   ```

## Why Docker Compose Works
- Uses a local PostgreSQL container that doesn't require SSL
- The connection is over Docker's internal network
- PostgreSQL in the container doesn't advertise SSL support, so TypeORM doesn't attempt it

## Why ECS Fails Without the Fix
- AWS RDS advertises SSL support
- TypeORM sees SSL is available and attempts to use it
- The `undefined` return value from `getDatabaseSSLFromEnv()` doesn't explicitly disable SSL
- RDS's self-signed certificate fails validation

The code fix ensures that when you set `DATABASE_SSL=false`, it actually disables SSL completely.