# ECS Configuration Alignment Changes

## Changes Made to Match Docker Compose

### 1. Fixed SSL Certificate Issue
**File**: `core/packages/server/src/DataSource.ts`
- Modified `getDatabaseSSLFromEnv()` to explicitly return `false` when `DATABASE_SSL=false`
- This prevents TypeORM from attempting SSL with AWS RDS

### 2. Path Consistency Fix
**File**: `terraform/main.tf`
- Changed all paths from `/root/.fastflow` to `/root/.flowise`:
  - `APIKEY_PATH`: `/root/.flowise`
  - `SECRETKEY_PATH`: `/root/.flowise`
  - `LOG_PATH`: `/root/.flowise/logs`
  - `BLOB_STORAGE_PATH`: `/root/.flowise/storage`
  - EFS mount `containerPath`: `/root/.flowise`

### 3. Added Missing Environment Variables
**File**: `terraform/main.tf`
- Added environment variables present in docker-compose but missing in ECS:
  - `NODE_ENV=production`
  - `FLOWISE_FILE_SIZE_LIMIT=50mb`
  - `EXECUTION_MODE=main`
  - `QUEUE_PROVIDER=memory`
  - `FLOWISE_SKIP_OFFLINE_LICENSE_VERIFY=true`

### 4. RDS Configuration
**File**: `terraform/rds.tf`
- Added custom parameter group to disable SSL enforcement
- Set `rds.force_ssl=0` to allow non-SSL connections
- Maintained engine version at `15.12`

## Remaining Differences (Intentional)

1. **Credentials**: ECS uses different admin credentials (hafiz@leadevs.com) vs docker-compose default
2. **Secret Key**: ECS uses `flowstack-secret-key` vs `myFlowiseSecretKey` in docker-compose
3. **Database Host**: ECS uses RDS endpoint vs `postgres` container name
4. **Volumes**: ECS uses EFS vs local Docker volumes
5. **Logging**: ECS uses CloudWatch vs local file logging

## Next Steps

1. **Rebuild and Deploy**:
   ```bash
   # Commit changes
   git add -A
   git commit -m "fix: align ECS configuration with docker-compose"
   
   # Push to trigger GitHub Actions
   git push origin main
   ```

2. **Apply Terraform Changes**:
   ```bash
   cd terraform
   terraform apply -var="region=us-east-1" -var="stage=prod"
   ```

3. **Force ECS Update** (after Docker image is pushed):
   ```bash
   aws ecs update-service \
     --cluster prod-flowstack-cluster \
     --service fastflow-service \
     --force-new-deployment \
     --region us-east-1
   ```

## Verification

Monitor CloudWatch logs for:
- No SSL certificate errors
- Successful database connection: "Database migrations completed successfully"
- Both services starting: flowise-core and flowstack-proxy
- Health check passing on ALB