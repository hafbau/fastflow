# Terraform Infrastructure Scripts

This directory contains helper scripts for managing the FlowStack Terraform infrastructure.

## Scripts Overview

### 1. `unlock-state.sh`
Handles Terraform state lock issues when operations fail or timeout.

**Usage:**
```bash
./scripts/unlock-state.sh [stage]
# Example: ./scripts/unlock-state.sh prod
```

**When to use:**
- After a failed terraform operation that left the state locked
- When you see "Error acquiring the state lock"
- After session timeout during long operations

### 2. `destroy-infrastructure.sh`
Safely destroys infrastructure in the correct order to avoid dependency issues.

**Usage:**
```bash
./scripts/destroy-infrastructure.sh [stage] [region] [timeout]
# Example: ./scripts/destroy-infrastructure.sh prod us-east-1 30m
```

**Features:**
- Destroys resources in correct order (ECS → RDS → EFS → Others)
- Handles timeouts gracefully
- Provides clear feedback on each step
- Includes troubleshooting tips

### 3. `refresh-aws-session.sh`
Checks AWS credentials and provides guidance for session issues.

**Usage:**
```bash
./scripts/refresh-aws-session.sh
```

**When to use:**
- Before running long operations
- When you get authentication errors
- To verify your AWS identity

## Common Issues and Solutions

### 1. State Lock Issues
```bash
# Check if state is locked
./scripts/refresh-aws-session.sh
./scripts/unlock-state.sh prod

# If unlock fails, manually remove lock
aws dynamodb delete-item \
  --table-name terraform-state-lock \
  --key '{"LockID": {"S": "fastform-terraform-state-prod/terraform.tfstate-md5"}}'
```

### 2. Destruction Failures
```bash
# Use the destroy script for proper ordering
./scripts/destroy-infrastructure.sh prod

# If specific resources fail, target them
terraform destroy -target=aws_db_instance.flowstack
terraform destroy -target=aws_ecs_service.fastflow
```

### 3. Permission Issues
```bash
# Ensure bootstrap is up to date
cd ../bootstrap
terraform apply

# Then retry your operation
cd ../
terraform plan
```

### 4. Session Timeouts
For long-running operations:
```bash
# Use lock timeout flag
terraform apply -lock-timeout=30m

# Or split into smaller operations
terraform apply -target=aws_vpc.this
terraform apply -target=aws_ecs_cluster.this
terraform apply
```

## Best Practices

1. **Always check credentials first:**
   ```bash
   ./scripts/refresh-aws-session.sh
   ```

2. **Use appropriate timeouts for long operations:**
   ```bash
   terraform apply -lock-timeout=30m
   ```

3. **For production changes:**
   - Take snapshots before destruction
   - Disable deletion protection manually if needed
   - Review the plan carefully

4. **If state gets corrupted:**
   ```bash
   # List resources in state
   terraform state list
   
   # Remove problematic resources
   terraform state rm aws_security_group.problematic
   
   # Import existing resources
   terraform import aws_security_group.existing sg-12345
   ```

## GitHub Actions Considerations

When running in GitHub Actions:
- OIDC tokens expire after ~1 hour
- Use job timeout settings appropriately
- Consider splitting long operations across multiple jobs
- The destroy operation may need to be run multiple times

## Emergency Procedures

If Terraform state is completely broken:

1. **Backup current state:**
   ```bash
   aws s3 cp s3://fastform-terraform-state-prod/terraform.tfstate ./backup.tfstate
   ```

2. **List resources manually:**
   ```bash
   aws ec2 describe-instances --filters "Name=tag:Name,Values=prod-*"
   aws ecs list-services --cluster prod-ecs-cluster
   aws rds describe-db-instances
   ```

3. **Delete manually if needed:**
   ```bash
   # Always delete in this order:
   # 1. ECS Services
   # 2. RDS Instances  
   # 3. Load Balancers
   # 4. ECS Cluster
   # 5. Security Groups
   # 6. VPC
   ```

4. **Clear state and start fresh:**
   ```bash
   terraform state list | xargs -n1 terraform state rm
   ```