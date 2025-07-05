#!/bin/bash
# Quick script to import RDS instance

set -e

echo "=== RDS Import Script ==="
echo

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

STAGE="${1:-prod}"
REGION="${2:-us-east-1}"

echo "Importing RDS resources for:"
echo "  Stage: $STAGE"
echo "  Region: $REGION"
echo

# Check if RDS instance exists in AWS
echo -e "${BLUE}Checking if RDS instance exists in AWS...${NC}"
if aws rds describe-db-instances --db-instance-identifier "$STAGE-flowstack-db" --region "$REGION" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ RDS instance found${NC}"
    
    # Check if already in state
    if terraform state show aws_db_instance.flowstack >/dev/null 2>&1; then
        echo -e "${YELLOW}RDS instance already in Terraform state${NC}"
        echo "Removing from state to re-import..."
        terraform state rm aws_db_instance.flowstack
    fi
    
    # Import RDS instance
    echo -e "${BLUE}Importing RDS instance...${NC}"
    terraform import -var="stage=$STAGE" -var="region=$REGION" \
        aws_db_instance.flowstack "$STAGE-flowstack-db"
    
    echo -e "${GREEN}✓ RDS instance imported successfully${NC}"
else
    echo -e "${RED}✗ RDS instance not found in AWS${NC}"
fi

echo
echo "Now running terraform plan to verify..."
terraform plan -var="stage=$STAGE" -var="region=$REGION" -target=aws_db_instance.flowstack