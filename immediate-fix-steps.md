# Immediate Fix Steps for ECS Deployment

## Current Status
- ❌ ECS is running old Docker image without SSL fixes
- ❌ Database connection failing with "no encryption" error
- ❌ SSO initialization error still occurring

## Required Actions

### 1. Verify Local Changes
```bash
# Check what files have been modified
git status

# Key files that MUST be changed:
# - core/packages/server/src/DataSource.ts (SSL handling)
# - terraform/main.tf (DATABASE_SSL=true)
# - Dockerfile (canvas dependencies)
```

### 2. Commit and Push Changes
```bash
git add -A
git commit -m "fix: enable SSL for RDS connection and fix canvas build deps"
git push origin main
```

### 3. Monitor GitHub Actions Build
- Go to: https://github.com/[your-repo]/actions
- Watch "Docker Build & Push" workflow
- Ensure it completes successfully
- Verify it pushed to `leadevs/fastflow:latest`

### 4. Apply Terraform Changes
```bash
cd terraform
terraform apply -var="region=us-east-1" -var="stage=prod"
```
This will update environment variables to `DATABASE_SSL=true`

### 5. Force ECS to Use New Image
After Docker image is pushed to DockerHub:
```bash
aws ecs update-service \
  --cluster prod-flowstack-cluster \
  --service fastflow-service \
  --force-new-deployment \
  --region us-east-1
```

### 6. Monitor Deployment
```bash
# Watch ECS service update
aws ecs describe-services \
  --cluster prod-flowstack-cluster \
  --services fastflow-service \
  --region us-east-1 \
  --query 'services[0].deployments'

# Check CloudWatch logs for new task
# Look for successful database connection
```

## Expected Result After Fix
- ✅ Database connects with SSL enabled
- ✅ No "no encryption" errors
- ✅ Application starts successfully
- ✅ Health checks pass

## If Still Failing
1. Check CloudWatch logs for the new ECS task
2. Verify environment variables are set correctly
3. Ensure the new Docker image was actually pulled
4. Check RDS security group allows connections from ECS subnet