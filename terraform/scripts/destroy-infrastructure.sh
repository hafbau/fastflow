#!/bin/bash
# Script to destroy Terraform infrastructure in the correct order

set -e

echo "=== Terraform Infrastructure Destroy Script ==="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the terraform directory
if [ ! -f "backend.tf" ]; then
    echo -e "${RED}Error: Not in terraform directory. Please run from terraform directory${NC}"
    exit 1
fi

# Variables
STAGE="${1:-prod}"
REGION="${2:-us-east-1}"
LOCK_TIMEOUT="${3:-30m}"

echo "Configuration:"
echo "  Stage: $STAGE"
echo "  Region: $REGION"
echo "  Lock timeout: $LOCK_TIMEOUT"
echo

# Function to run terraform with timeout and error handling
run_terraform() {
    local command="$1"
    local description="$2"
    
    echo -e "${BLUE}>>> $description${NC}"
    
    if timeout "$LOCK_TIMEOUT" terraform $command -var="stage=$STAGE" -var="region=$REGION" -lock-timeout=5m; then
        echo -e "${GREEN}✓ $description completed successfully${NC}"
        return 0
    else
        echo -e "${RED}✗ $description failed${NC}"
        return 1
    fi
}

# Function to destroy specific targets
destroy_target() {
    local target="$1"
    local description="$2"
    
    echo -e "${BLUE}>>> Destroying $description${NC}"
    
    if terraform destroy -target="$target" -var="stage=$STAGE" -var="region=$REGION" -auto-approve -lock-timeout=5m; then
        echo -e "${GREEN}✓ $description destroyed successfully${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ $description destruction failed or not needed${NC}"
        return 1
    fi
}

# Confirmation
echo -e "${RED}WARNING: This will destroy all infrastructure for stage: $STAGE${NC}"
read -p "Are you sure you want to continue? Type 'yes' to confirm: " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Destruction cancelled${NC}"
    exit 0
fi

echo
echo "Starting infrastructure destruction..."
echo

# Step 1: Remove ECS Services first (they hold references to other resources)
echo -e "${YELLOW}=== Step 1: Removing ECS Services ===${NC}"
destroy_target "aws_ecs_service.fastflow" "ECS Service"
echo

# Step 2: Remove RDS instance (this can take a while)
echo -e "${YELLOW}=== Step 2: Removing RDS Instance ===${NC}"
if [ "$STAGE" == "prod" ]; then
    echo -e "${YELLOW}Note: Production RDS has deletion protection enabled${NC}"
    echo "You may need to manually disable deletion protection first:"
    echo "  aws rds modify-db-instance --db-instance-identifier $STAGE-flowstack-db --no-deletion-protection --apply-immediately"
    echo
fi
destroy_target "aws_db_instance.flowstack" "RDS Instance"
echo

# Step 3: Remove EFS mount targets
echo -e "${YELLOW}=== Step 3: Removing EFS Mount Targets ===${NC}"
destroy_target "aws_efs_mount_target.efs_mt" "EFS Mount Targets"
echo

# Step 4: Remove remaining resources
echo -e "${YELLOW}=== Step 4: Removing All Remaining Resources ===${NC}"
echo "This will remove:"
echo "  - Load Balancers"
echo "  - ECS Cluster and Task Definitions"
echo "  - Security Groups"
echo "  - VPC and Networking"
echo "  - IAM Roles and Policies"
echo "  - CloudWatch Logs"
echo "  - SSM Parameters"
echo

if run_terraform "destroy -auto-approve" "Full infrastructure destruction"; then
    echo -e "${GREEN}✓ Infrastructure destroyed successfully!${NC}"
else
    echo -e "${RED}✗ Some resources may have failed to delete${NC}"
    echo
    echo "Common issues and solutions:"
    echo "1. State lock: Run ./scripts/unlock-state.sh"
    echo "2. Dependency issues: Re-run this script"
    echo "3. Permission issues: Ensure bootstrap IAM role is up to date"
    echo "4. Manual cleanup may be required for:"
    echo "   - S3 buckets with content"
    echo "   - CloudWatch log groups"
    echo "   - Retained snapshots"
fi

echo
echo -e "${BLUE}=== Destruction Summary ===${NC}"
echo "To verify all resources are deleted:"
echo "  terraform show"
echo
echo "To check AWS Console:"
echo "  - EC2 > Instances, Security Groups, Load Balancers"
echo "  - ECS > Clusters"
echo "  - RDS > Databases"
echo "  - VPC > Your VPCs"
echo
echo "If state is corrupted, you may need to:"
echo "  terraform state list  # List remaining resources"
echo "  terraform state rm <resource>  # Remove from state"