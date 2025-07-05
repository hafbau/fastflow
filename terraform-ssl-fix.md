# Fix for ECS Startup Issues

## Problem Summary
1. **SSL Certificate Error**: AWS RDS uses self-signed certificates that fail validation
2. **SSO Initialization Error**: Likely caused by the database connection failing before IdentityManager can initialize

## Solution 1: Disable SSL (Quick Fix)

Edit `terraform/main.tf` line 460:
```terraform
# Change from:
{ name = "DATABASE_SSL", value = "true" },

# To:
{ name = "DATABASE_SSL", value = "false" },
```

Then apply Terraform changes:
```bash
cd terraform
terraform apply -var="region=us-east-1" -var="stage=prod"
```

## Solution 2: Configure SSL with RDS Certificate (Recommended)

1. Download the RDS certificate bundle:
```bash
wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
base64 global-bundle.pem > rds-cert-base64.txt
```

2. Add a new environment variable in `terraform/main.tf` after line 460:
```terraform
{ name = "DATABASE_SSL", value = "true" },
{ name = "DATABASE_SSL_KEY_BASE64", value = file("${path.module}/rds-cert-base64.txt") },
```

3. Apply Terraform changes

## Solution 3: Modify Database Connection (Code Fix)

Apply the patch to handle SSL certificates properly:
```bash
cd /Users/hafizsuara/Projects/flowstack
git apply patches/fix-ecs-startup.patch
```

Then rebuild and deploy the Docker image:
```bash
./scripts/build-docker.sh
./scripts/deploy-to-ecr.sh
```

## Verification Steps

1. Check ECS task logs in CloudWatch
2. Verify the health check passes: `http://{ALB_DNS}/api/v1/ping`
3. Confirm database connection: Look for "Database migrations completed successfully" in logs

## Additional Debugging

If issues persist, check:
- ECS task has proper IAM permissions
- Security groups allow database connection (port 5432)
- RDS instance is in the same VPC as ECS tasks