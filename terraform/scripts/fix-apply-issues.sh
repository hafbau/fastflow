#!/bin/bash
# Script to fix terraform apply issues with existing resources

set -e

echo "=== Terraform Apply Issues Fixer ==="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
STAGE="${1:-prod}"
REGION="${2:-us-east-1}"

echo "Configuration:"
echo "  Stage: $STAGE"
echo "  Region: $REGION"
echo

# Function to check terraform state
check_state() {
    echo -e "${BLUE}Checking Terraform state...${NC}"
    
    # List resources in state
    echo "Resources in Terraform state:"
    terraform state list | head -20
    
    local state_count=$(terraform state list | wc -l)
    echo "Total resources in state: $state_count"
}

# Function to check actual AWS resources
check_aws_resources() {
    echo -e "${BLUE}Checking actual AWS resources...${NC}"
    
    # Check RDS
    echo -n "RDS Instance ($STAGE-flowstack-db): "
    if aws rds describe-db-instances --db-instance-identifier "$STAGE-flowstack-db" --region "$REGION" >/dev/null 2>&1; then
        echo -e "${GREEN}EXISTS${NC}"
    else
        echo -e "${RED}NOT FOUND${NC}"
    fi
    
    # Check ECS Service
    echo -n "ECS Service ($STAGE-fastflow-service): "
    if aws ecs describe-services --cluster "$STAGE-ecs-cluster" --services "$STAGE-fastflow-service" --region "$REGION" >/dev/null 2>&1; then
        echo -e "${GREEN}EXISTS${NC}"
    else
        echo -e "${RED}NOT FOUND${NC}"
    fi
    
    # Check VPC
    local vpc_id=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=$STAGE-vpc" --region "$REGION" --query 'Vpcs[0].VpcId' --output text 2>/dev/null)
    echo -n "VPC ($STAGE-vpc): "
    if [ "$vpc_id" != "None" ] && [ -n "$vpc_id" ]; then
        echo -e "${GREEN}EXISTS ($vpc_id)${NC}"
    else
        echo -e "${RED}NOT FOUND${NC}"
    fi
}

# Function to refresh state
refresh_state() {
    echo -e "${BLUE}Refreshing Terraform state...${NC}"
    
    terraform refresh -var="stage=$STAGE" -var="region=$REGION" -lock-timeout=5m
    
    echo -e "${GREEN}✓ State refreshed${NC}"
}

# Function to remove problematic resources from state
remove_from_state() {
    local resource="$1"
    
    echo -e "${YELLOW}Removing $resource from state...${NC}"
    terraform state rm "$resource" || true
}

# Function to import existing resources
import_resource() {
    local resource_type="$1"
    local resource_id="$2"
    
    echo -e "${BLUE}Importing $resource_type with ID $resource_id...${NC}"
    terraform import -var="stage=$STAGE" -var="region=$REGION" "$resource_type" "$resource_id"
}

# Main execution
echo "=== Step 1: Diagnose Current State ==="
check_state
echo
check_aws_resources
echo

echo "=== Step 2: Analyze Issues ==="
echo -e "${BLUE}Running terraform plan to see what's wrong...${NC}"

# Capture plan output
PLAN_OUTPUT=$(terraform plan -var="stage=$STAGE" -var="region=$REGION" -detailed-exitcode 2>&1 || true)

# Check for specific issues
if echo "$PLAN_OUTPUT" | grep -q "DependencyViolation"; then
    echo -e "${YELLOW}Found dependency violations. Resources may be partially deleted.${NC}"
    NEEDS_CLEANUP=true
fi

if echo "$PLAN_OUTPUT" | grep -q "already exists"; then
    echo -e "${YELLOW}Found resources that already exist. State may be out of sync.${NC}"
    NEEDS_IMPORT=true
fi

if echo "$PLAN_OUTPUT" | grep -q "AuthFailure"; then
    echo -e "${RED}Permission issues detected. Bootstrap may need updating.${NC}"
    NEEDS_BOOTSTRAP=true
fi

echo
echo "=== Step 3: Recommended Actions ==="

if [ "$NEEDS_BOOTSTRAP" = "true" ]; then
    echo -e "${YELLOW}1. Update IAM permissions:${NC}"
    echo "   cd ../bootstrap && terraform apply"
    echo
fi

if [ "$NEEDS_CLEANUP" = "true" ]; then
    echo -e "${YELLOW}2. Clean up stuck resources:${NC}"
    echo "   # Check for stuck RDS:"
    echo "   ./scripts/check-and-delete-rds.sh $STAGE"
    echo "   # Check for stuck ENIs:"
    echo "   ./scripts/cleanup-stuck-enis.sh $REGION"
    echo
fi

if [ "$NEEDS_IMPORT" = "true" ]; then
    echo -e "${YELLOW}3. Fix state synchronization:${NC}"
    echo "   # Option A: Refresh state"
    echo "   terraform refresh -var=\"stage=$STAGE\" -var=\"region=$REGION\""
    echo
    echo "   # Option B: Remove and re-import specific resources"
    echo "   # Example for RDS:"
    echo "   terraform state rm aws_db_instance.flowstack"
    echo "   terraform import -var=\"stage=$STAGE\" aws_db_instance.flowstack $STAGE-flowstack-db"
    echo
fi

echo -e "${YELLOW}4. Common quick fixes:${NC}"
echo "   # Force refresh all resources:"
echo "   terraform refresh -var=\"stage=$STAGE\" -var=\"region=$REGION\""
echo
echo "   # Try apply with parallelism limit:"
echo "   terraform apply -var=\"stage=$STAGE\" -var=\"region=$REGION\" -parallelism=10"
echo
echo "   # If security groups are stuck, wait and retry:"
echo "   sleep 300 && terraform apply -var=\"stage=$STAGE\" -var=\"region=$REGION\""

echo
read -p "Do you want to try automatic state refresh? (yes/no): " do_refresh

if [ "$do_refresh" = "yes" ]; then
    echo
    refresh_state
    echo
    echo "State refreshed. Try running terraform apply again."
fi

echo
echo "=== Additional Diagnostics ==="
echo "To see detailed state of a specific resource:"
echo "  terraform state show aws_db_instance.flowstack"
echo
echo "To see what will be changed:"
echo "  terraform plan -var=\"stage=$STAGE\" -var=\"region=$REGION\" -target=aws_db_instance.flowstack"