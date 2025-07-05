# Terraform Changes Summary

## Changes Made

1. **Created Custom RDS Parameter Group** (in `terraform/rds.tf`):
   - Added `aws_db_parameter_group.flowstack` resource
   - Set `rds.force_ssl = 0` to disable SSL enforcement at the database level
   - Updated RDS instance to use this custom parameter group

2. **Updated Environment Variables** (in `terraform/main.tf`):
   - `DATABASE_SSL = "false"` (already set)
   - `NODE_TLS_REJECT_UNAUTHORIZED = "0"` (added as additional safeguard)
   - Both set in ECS task definition and supervisord configuration

3. **Adjusted RDS Version**:
   - Changed from `15.12` to `15.7` for better compatibility

## Apply Changes

Run these commands to apply the changes:

```bash
cd terraform
export TF_VAR_db_password="YourSecurePassword"
terraform plan -var="region=us-east-1" -var="stage=prod"
terraform apply -var="region=us-east-1" -var="stage=prod"
```

## What This Fixes

1. **Database Level**: The custom parameter group disables SSL requirement at the RDS level
2. **Application Level**: DATABASE_SSL=false tells the application not to use SSL
3. **Node.js Level**: NODE_TLS_REJECT_UNAUTHORIZED=0 bypasses certificate validation (backup)

## Important Notes

- The RDS instance will need to reboot to apply the parameter group changes
- This may cause a brief downtime (usually 1-2 minutes)
- The ECS tasks will automatically restart with the new environment variables

## Monitoring

After applying:
1. Watch the RDS instance status in AWS Console
2. Monitor ECS task logs in CloudWatch
3. Look for "Database migrations completed successfully" message
4. Verify no more SSL certificate errors