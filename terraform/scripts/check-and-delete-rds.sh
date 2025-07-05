#!/bin/bash
# Script to check RDS instance status and delete if necessary

set -e

echo "=== RDS Instance Check and Delete Script ==="
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
DB_INSTANCE_ID="${STAGE}-flowstack-db"

echo "Configuration:"
echo "  Stage: $STAGE"
echo "  Region: $REGION"
echo "  DB Instance: $DB_INSTANCE_ID"
echo

# Function to check RDS instance status
check_rds_status() {
    echo -e "${BLUE}Checking RDS instance status...${NC}"
    
    local status=$(aws rds describe-db-instances \
        --db-instance-identifier "$DB_INSTANCE_ID" \
        --region "$REGION" \
        --query 'DBInstances[0].DBInstanceStatus' \
        --output text 2>/dev/null || echo "not-found")
    
    if [ "$status" = "not-found" ]; then
        echo -e "${GREEN}✓ RDS instance does not exist${NC}"
        return 1
    else
        echo -e "${YELLOW}RDS instance exists with status: $status${NC}"
        
        # Get more details
        aws rds describe-db-instances \
            --db-instance-identifier "$DB_INSTANCE_ID" \
            --region "$REGION" \
            --query 'DBInstances[0].[DBInstanceIdentifier,DBInstanceStatus,DeletionProtection,DBInstanceClass,AllocatedStorage]' \
            --output table
        
        return 0
    fi
}

# Function to disable deletion protection
disable_deletion_protection() {
    echo -e "${BLUE}Checking deletion protection...${NC}"
    
    local protection=$(aws rds describe-db-instances \
        --db-instance-identifier "$DB_INSTANCE_ID" \
        --region "$REGION" \
        --query 'DBInstances[0].DeletionProtection' \
        --output text 2>/dev/null)
    
    if [ "$protection" = "true" ] || [ "$protection" = "True" ]; then
        echo -e "${YELLOW}Deletion protection is enabled. Disabling...${NC}"
        
        aws rds modify-db-instance \
            --db-instance-identifier "$DB_INSTANCE_ID" \
            --region "$REGION" \
            --no-deletion-protection \
            --apply-immediately
        
        echo -e "${GREEN}✓ Deletion protection disabled${NC}"
        echo "Waiting for modification to complete..."
        
        # Wait a bit for the modification to take effect
        sleep 10
    else
        echo -e "${GREEN}✓ Deletion protection is already disabled${NC}"
    fi
}

# Function to delete RDS instance
delete_rds_instance() {
    local skip_snapshot="$1"
    
    echo -e "${BLUE}Deleting RDS instance...${NC}"
    
    if [ "$skip_snapshot" = "true" ]; then
        echo -e "${YELLOW}Skipping final snapshot${NC}"
        aws rds delete-db-instance \
            --db-instance-identifier "$DB_INSTANCE_ID" \
            --region "$REGION" \
            --skip-final-snapshot \
            --delete-automated-backups
    else
        local snapshot_id="${DB_INSTANCE_ID}-final-$(date +%Y%m%d-%H%M%S)"
        echo -e "${YELLOW}Creating final snapshot: $snapshot_id${NC}"
        aws rds delete-db-instance \
            --db-instance-identifier "$DB_INSTANCE_ID" \
            --region "$REGION" \
            --final-db-snapshot-identifier "$snapshot_id" \
            --delete-automated-backups
    fi
    
    echo -e "${GREEN}✓ RDS deletion initiated${NC}"
}

# Function to wait for deletion
wait_for_deletion() {
    echo -e "${BLUE}Waiting for RDS instance to be deleted...${NC}"
    echo "This may take 5-10 minutes..."
    
    local max_attempts=60  # 10 minutes with 10 second intervals
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if ! check_rds_status >/dev/null 2>&1; then
            echo -e "${GREEN}✓ RDS instance has been deleted${NC}"
            return 0
        fi
        
        echo -n "."
        sleep 10
        ((attempt++))
    done
    
    echo
    echo -e "${RED}✗ Timeout waiting for RDS deletion${NC}"
    return 1
}

# Main execution
echo "=== Step 1: Check Current Status ==="
if ! check_rds_status; then
    echo
    echo "No RDS instance found. Checking for stuck ENIs..."
    
    # List ENIs that might be stuck
    echo -e "${BLUE}Checking for RDS-related ENIs...${NC}"
    aws ec2 describe-network-interfaces \
        --filters "Name=group-id,Values=sg-03f34fa302fac4df4" \
        --region "$REGION" \
        --query 'NetworkInterfaces[?contains(Description, `RDS`) || contains(Description, `rds`)].[NetworkInterfaceId,Status,Description]' \
        --output table
    
    echo
    echo "If ENIs are stuck, they should clear automatically after a few minutes."
    echo "You can also try running: terraform refresh"
    exit 0
fi

echo
echo -e "${RED}WARNING: RDS instance '$DB_INSTANCE_ID' exists and will be deleted!${NC}"
echo

# Check for snapshots
echo "Existing snapshots:"
aws rds describe-db-snapshots \
    --db-instance-identifier "$DB_INSTANCE_ID" \
    --region "$REGION" \
    --query 'DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime,Status]' \
    --output table

echo
read -p "Do you want to create a final snapshot? (yes/no): " create_snapshot
read -p "Are you sure you want to delete the RDS instance? Type 'DELETE' to confirm: " confirm

if [ "$confirm" != "DELETE" ]; then
    echo -e "${YELLOW}Deletion cancelled${NC}"
    exit 0
fi

echo
echo "=== Step 2: Disable Deletion Protection ==="
disable_deletion_protection

echo
echo "=== Step 3: Delete RDS Instance ==="
if [ "$create_snapshot" = "yes" ]; then
    delete_rds_instance "false"
else
    delete_rds_instance "true"
fi

echo
echo "=== Step 4: Wait for Deletion ==="
if wait_for_deletion; then
    echo
    echo -e "${GREEN}✓ RDS instance successfully deleted!${NC}"
    echo
    echo "You can now run terraform destroy again to clean up remaining resources:"
    echo "  terraform destroy -var=\"stage=$STAGE\" -var=\"region=$REGION\""
else
    echo
    echo -e "${YELLOW}RDS is still deleting. You can:${NC}"
    echo "1. Wait a few more minutes and check: aws rds describe-db-instances --db-instance-identifier $DB_INSTANCE_ID"
    echo "2. Run terraform destroy again later"
fi

echo
echo "=== Checking Related Resources ==="
echo "Security Groups with RDS ENIs:"
aws ec2 describe-network-interfaces \
    --filters "Name=description,Values=*RDS*" \
    --region "$REGION" \
    --query 'NetworkInterfaces[*].[NetworkInterfaceId,Status,Groups[0].GroupId,Description]' \
    --output table