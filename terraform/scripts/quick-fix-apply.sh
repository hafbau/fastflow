#!/bin/bash
# Quick fix for terraform apply issues

set -e

echo "=== Quick Fix for Terraform Apply ==="
echo

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

STAGE="${1:-prod}"
REGION="${2:-us-east-1}"

echo "This script will attempt to fix common terraform apply issues."
echo

# Step 1: Refresh state
echo -e "${BLUE}Step 1: Refreshing Terraform state...${NC}"
terraform refresh -var="stage=$STAGE" -var="region=$REGION" -lock-timeout=10m || {
    echo -e "${YELLOW}Refresh failed, but continuing...${NC}"
}

# Step 2: Check for locked state
echo -e "${BLUE}Step 2: Checking for state lock...${NC}"
if ! terraform plan -var="stage=$STAGE" -var="region=$REGION" -lock=false >/dev/null 2>&1; then
    echo -e "${YELLOW}State might be locked. Attempting unlock...${NC}"
    ./scripts/unlock-state.sh "$STAGE" || true
fi

# Step 3: Try targeted apply for non-dependent resources first
echo -e "${BLUE}Step 3: Applying base infrastructure...${NC}"
echo "Applying VPC and networking first..."
terraform apply -var="stage=$STAGE" -var="region=$REGION" \
    -target=aws_vpc.this \
    -target=aws_subnet.public \
    -target=aws_subnet.private \
    -target=aws_internet_gateway.this \
    -target=aws_nat_gateway.nat \
    -auto-approve || true

# Step 4: Apply security groups
echo -e "${BLUE}Step 4: Applying security groups...${NC}"
terraform apply -var="stage=$STAGE" -var="region=$REGION" \
    -target=aws_security_group.alb_sg \
    -target=aws_security_group.container_sg \
    -target=aws_security_group.efs_sg \
    -auto-approve || true

# Step 5: Apply RDS separately (this often has issues)
echo -e "${BLUE}Step 5: Checking RDS resources...${NC}"
if terraform state show aws_db_instance.flowstack >/dev/null 2>&1; then
    echo "RDS instance exists in state"
    
    # Check if it exists in AWS
    if aws rds describe-db-instances --db-instance-identifier "$STAGE-flowstack-db" >/dev/null 2>&1; then
        echo -e "${GREEN}RDS instance exists in AWS${NC}"
    else
        echo -e "${YELLOW}RDS instance missing in AWS, removing from state${NC}"
        terraform state rm aws_db_instance.flowstack
        terraform state rm aws_db_subnet_group.flowstack || true
        terraform state rm aws_security_group.rds_sg || true
    fi
fi

# Step 6: Final apply
echo -e "${BLUE}Step 6: Running final terraform apply...${NC}"
echo "This will create/update all remaining resources..."

terraform apply -var="stage=$STAGE" -var="region=$REGION" \
    -parallelism=10 \
    -lock-timeout=10m

echo
echo -e "${GREEN}✓ Quick fix completed!${NC}"
echo
echo "If you still see errors:"
echo "1. Wait 5-10 minutes for AWS to clean up resources"
echo "2. Run: terraform refresh -var=\"stage=$STAGE\" -var=\"region=$REGION\""
echo "3. Try again: terraform apply -var=\"stage=$STAGE\" -var=\"region=$REGION\""