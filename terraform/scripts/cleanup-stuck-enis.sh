#!/bin/bash
# Script to clean up stuck ENIs from RDS

set -e

echo "=== Stuck ENI Cleanup Script ==="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
REGION="${1:-us-east-1}"
SECURITY_GROUP_ID="${2}"

echo "Configuration:"
echo "  Region: $REGION"
echo "  Security Group: ${SECURITY_GROUP_ID:-All RDS ENIs}"
echo

# Function to find stuck RDS ENIs
find_stuck_enis() {
    echo -e "${BLUE}Finding RDS network interfaces...${NC}"
    
    if [ -n "$SECURITY_GROUP_ID" ]; then
        # Find ENIs for specific security group
        aws ec2 describe-network-interfaces \
            --region "$REGION" \
            --filters "Name=group-id,Values=$SECURITY_GROUP_ID" \
            --query 'NetworkInterfaces[?contains(Description, `RDS`) || contains(Description, `rds`) || contains(RequesterId, `rds`)].[NetworkInterfaceId,Status,Description,Attachment.AttachmentId,Groups[0].GroupId]' \
            --output text
    else
        # Find all RDS ENIs
        aws ec2 describe-network-interfaces \
            --region "$REGION" \
            --query 'NetworkInterfaces[?contains(Description, `RDS`) || contains(Description, `rds`) || contains(RequesterId, `rds`)].[NetworkInterfaceId,Status,Description,Attachment.AttachmentId,Groups[0].GroupId]' \
            --output text
    fi
}

# Function to check if ENI can be deleted
check_eni_status() {
    local eni_id="$1"
    
    local eni_info=$(aws ec2 describe-network-interfaces \
        --network-interface-ids "$eni_id" \
        --region "$REGION" \
        --query 'NetworkInterfaces[0]' \
        2>/dev/null || echo "{}")
    
    if [ "$eni_info" = "{}" ]; then
        echo "ENI $eni_id not found"
        return 1
    fi
    
    local status=$(echo "$eni_info" | jq -r '.Status')
    local attachment_id=$(echo "$eni_info" | jq -r '.Attachment.AttachmentId // "none"')
    local instance_id=$(echo "$eni_info" | jq -r '.Attachment.InstanceId // "none"')
    
    echo "ENI $eni_id: Status=$status, Attachment=$attachment_id, Instance=$instance_id"
    
    if [ "$status" = "available" ]; then
        return 0  # Can be deleted
    else
        return 1  # Cannot be deleted yet
    fi
}

# Function to wait for ENI to become available
wait_for_eni_available() {
    local eni_id="$1"
    local max_attempts=30  # 5 minutes
    local attempt=0
    
    echo -e "${BLUE}Waiting for ENI $eni_id to become available...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if check_eni_status "$eni_id" >/dev/null 2>&1; then
            echo -e "${GREEN}✓ ENI is now available${NC}"
            return 0
        fi
        
        echo -n "."
        sleep 10
        ((attempt++))
    done
    
    echo
    echo -e "${YELLOW}⚠ ENI still not available after 5 minutes${NC}"
    return 1
}

# Function to delete ENI
delete_eni() {
    local eni_id="$1"
    
    echo -e "${BLUE}Attempting to delete ENI $eni_id...${NC}"
    
    if aws ec2 delete-network-interface \
        --network-interface-id "$eni_id" \
        --region "$REGION" 2>/dev/null; then
        echo -e "${GREEN}✓ ENI deleted successfully${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to delete ENI${NC}"
        return 1
    fi
}

# Main execution
echo "=== Step 1: Find Stuck ENIs ==="
ENIS=$(find_stuck_enis)

if [ -z "$ENIS" ]; then
    echo -e "${GREEN}✓ No stuck RDS ENIs found${NC}"
    exit 0
fi

echo -e "${YELLOW}Found the following RDS ENIs:${NC}"
echo "$ENIS" | column -t
echo

# Process each ENI
echo "=== Step 2: Process ENIs ==="
while IFS=$'\t' read -r eni_id status description attachment_id sg_id; do
    if [ -n "$eni_id" ]; then
        echo
        echo "Processing ENI: $eni_id"
        echo "  Status: $status"
        echo "  Description: $description"
        echo "  Security Group: $sg_id"
        
        if [ "$status" = "available" ]; then
            delete_eni "$eni_id"
        else
            echo -e "${YELLOW}ENI is still attached. Checking if it can be cleaned up...${NC}"
            
            # Check if the associated RDS instance still exists
            if [[ "$description" =~ "DBInstance:"([a-zA-Z0-9-]+) ]]; then
                db_instance="${BASH_REMATCH[1]}"
                echo "  Associated DB Instance: $db_instance"
                
                if ! aws rds describe-db-instances --db-instance-identifier "$db_instance" --region "$REGION" >/dev/null 2>&1; then
                    echo -e "${YELLOW}DB instance no longer exists. ENI should detach automatically.${NC}"
                    
                    if wait_for_eni_available "$eni_id"; then
                        delete_eni "$eni_id"
                    fi
                else
                    echo -e "${RED}DB instance still exists. Delete it first using:${NC}"
                    echo "  ./scripts/check-and-delete-rds.sh"
                fi
            fi
        fi
    fi
done <<< "$ENIS"

echo
echo "=== Step 3: Verify Cleanup ==="
REMAINING=$(find_stuck_enis)

if [ -z "$REMAINING" ]; then
    echo -e "${GREEN}✓ All RDS ENIs have been cleaned up${NC}"
    echo
    echo "You can now run terraform destroy again"
else
    echo -e "${YELLOW}Some ENIs still remain:${NC}"
    echo "$REMAINING" | column -t
    echo
    echo "These may clear automatically in a few minutes, or you may need to:"
    echo "1. Ensure all RDS instances are deleted"
    echo "2. Wait for AWS to clean up the ENIs (can take up to 20 minutes)"
    echo "3. Contact AWS support if ENIs remain stuck"
fi