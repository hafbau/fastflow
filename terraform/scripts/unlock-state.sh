#!/bin/bash
# Script to force unlock Terraform state

set -e

echo "=== Terraform State Unlock Script ==="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the terraform directory
if [ ! -f "backend.tf" ]; then
    echo -e "${RED}Error: Not in terraform directory. Please run from terraform/directory${NC}"
    exit 1
fi

# Function to unlock state via DynamoDB
unlock_dynamodb() {
    local table_name="$1"
    local state_file="$2"
    
    echo -e "${YELLOW}Attempting to unlock state via DynamoDB...${NC}"
    
    # Try to delete the lock
    aws dynamodb delete-item \
        --table-name "$table_name" \
        --key "{\"LockID\": {\"S\": \"$state_file\"}}" \
        --region us-east-1 2>/dev/null || true
    
    echo -e "${GREEN}DynamoDB lock cleared (if it existed)${NC}"
}

# Function to check if lock exists
check_lock() {
    local table_name="$1"
    local state_file="$2"
    
    echo "Checking for existing locks..."
    
    LOCK_INFO=$(aws dynamodb get-item \
        --table-name "$table_name" \
        --key "{\"LockID\": {\"S\": \"$state_file\"}}" \
        --region us-east-1 2>/dev/null || echo "{}")
    
    if [ "$LOCK_INFO" != "{}" ] && [ -n "$LOCK_INFO" ]; then
        echo -e "${YELLOW}Lock found in DynamoDB${NC}"
        echo "$LOCK_INFO" | jq -r '.Item.Info.S' 2>/dev/null || true
        return 0
    else
        echo -e "${GREEN}No lock found in DynamoDB${NC}"
        return 1
    fi
}

# Main execution
STAGE="${1:-prod}"
TABLE_NAME="terraform-state-lock"
STATE_FILE="fastform-terraform-state-${STAGE}/terraform.tfstate-md5"

echo "Stage: $STAGE"
echo "Lock Table: $TABLE_NAME"
echo "State File: $STATE_FILE"
echo

# Check current lock status
if check_lock "$TABLE_NAME" "$STATE_FILE"; then
    echo
    read -p "Do you want to force unlock? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        unlock_dynamodb "$TABLE_NAME" "$STATE_FILE"
        echo
        echo -e "${GREEN}State unlocked successfully!${NC}"
    else
        echo -e "${YELLOW}Unlock cancelled${NC}"
        exit 0
    fi
else
    echo -e "${GREEN}No unlock needed - state is not locked${NC}"
fi

echo
echo "You can now run terraform commands again."