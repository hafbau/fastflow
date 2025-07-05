#!/bin/bash
# Script to import existing resources and fix certificate issues

set -e

echo "=== Fix Existing Resources Script ==="
echo

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

STAGE="${1:-prod}"
REGION="${2:-us-east-1}"
DOMAIN="${3:-studio.getflowstack.ai}"

echo "Configuration:"
echo "  Stage: $STAGE"
echo "  Region: $REGION"
echo "  Domain: $DOMAIN"
echo

# Function to check certificate status
check_certificate() {
    echo -e "${BLUE}Checking ACM certificate status...${NC}"
    
    # Find certificate
    CERT_ARN=$(aws acm list-certificates --region "$REGION" \
        --query "CertificateSummaryList[?DomainName=='$DOMAIN'].CertificateArn" \
        --output text)
    
    if [ -z "$CERT_ARN" ]; then
        echo -e "${RED}No certificate found for $DOMAIN${NC}"
        return 1
    fi
    
    echo "Certificate ARN: $CERT_ARN"
    
    # Get certificate details
    CERT_STATUS=$(aws acm describe-certificate --certificate-arn "$CERT_ARN" --region "$REGION" \
        --query 'Certificate.Status' --output text)
    
    echo "Certificate Status: $CERT_STATUS"
    
    if [ "$CERT_STATUS" = "ISSUED" ]; then
        echo -e "${GREEN}✓ Certificate is valid and issued${NC}"
        return 0
    else
        echo -e "${YELLOW}Certificate is not yet validated${NC}"
        
        # Show validation records
        echo
        echo "DNS validation records needed:"
        aws acm describe-certificate --certificate-arn "$CERT_ARN" --region "$REGION" \
            --query 'Certificate.DomainValidationOptions[*].[DomainName,ResourceRecord.Name,ResourceRecord.Type,ResourceRecord.Value]' \
            --output table
        
        return 1
    fi
}

# Function to import existing resources
import_existing_resources() {
    echo -e "${BLUE}Importing existing resources into Terraform state...${NC}"
    
    # Check and import RDS instance FIRST (most important)
    if aws rds describe-db-instances --db-instance-identifier "$STAGE-flowstack-db" --region "$REGION" >/dev/null 2>&1; then
        echo "Found existing RDS instance: $STAGE-flowstack-db"
        if ! terraform state show aws_db_instance.flowstack >/dev/null 2>&1; then
            echo "Importing RDS instance..."
            terraform import -var="stage=$STAGE" -var="region=$REGION" \
                aws_db_instance.flowstack "$STAGE-flowstack-db" || {
                echo -e "${RED}Failed to import RDS instance${NC}"
                exit 1
            }
        else
            echo -e "${GREEN}RDS instance already in state${NC}"
        fi
    fi
    
    # Check and import RDS subnet group
    if aws rds describe-db-subnet-groups --db-subnet-group-name "$STAGE-flowstack-db-subnet-group" --region "$REGION" >/dev/null 2>&1; then
        if ! terraform state show aws_db_subnet_group.flowstack >/dev/null 2>&1; then
            echo "Importing RDS subnet group..."
            terraform import -var="stage=$STAGE" -var="region=$REGION" \
                aws_db_subnet_group.flowstack "$STAGE-flowstack-db-subnet-group" || {
                echo -e "${YELLOW}Subnet group import failed${NC}"
            }
        else
            echo -e "${GREEN}RDS subnet group already in state${NC}"
        fi
    fi
    
    # Find VPC ID
    VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=$STAGE-vpc" \
        --region "$REGION" --query 'Vpcs[0].VpcId' --output text)
    
    if [ "$VPC_ID" != "None" ] && [ -n "$VPC_ID" ]; then
        # Check and import RDS security group
        SG_ID=$(aws ec2 describe-security-groups \
            --filters "Name=group-name,Values=$STAGE-flowstack-rds-sg" "Name=vpc-id,Values=$VPC_ID" \
            --region "$REGION" --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null)
        
        if [ "$SG_ID" != "None" ] && [ -n "$SG_ID" ]; then
            if ! terraform state show aws_security_group.rds_sg >/dev/null 2>&1; then
                echo "Importing RDS security group ($SG_ID)..."
                terraform import -var="stage=$STAGE" -var="region=$REGION" \
                    aws_security_group.rds_sg "$SG_ID" || {
                    echo -e "${YELLOW}Security group import failed${NC}"
                }
            else
                echo -e "${GREEN}RDS security group already in state${NC}"
            fi
        fi
    fi
    
    # Import SSM parameters if they exist
    for param in "host" "port" "name"; do
        param_name="/${STAGE}/flowstack/db/${param}"
        if aws ssm get-parameter --name "$param_name" --region "$REGION" >/dev/null 2>&1; then
            if ! terraform state show "aws_ssm_parameter.db_${param}" >/dev/null 2>&1; then
                echo "Importing SSM parameter: $param_name"
                terraform import -var="stage=$STAGE" -var="region=$REGION" \
                    "aws_ssm_parameter.db_${param}" "$param_name" || true
            fi
        fi
    done
}

# Function to fix certificate issue
fix_certificate() {
    echo -e "${BLUE}Addressing certificate issue...${NC}"
    
    if ! check_certificate; then
        echo
        echo -e "${YELLOW}=== ACTION REQUIRED ===${NC}"
        echo "The ACM certificate is not validated. You need to:"
        echo
        echo "1. Add the CNAME records shown above to your DNS provider (GoDaddy)"
        echo "2. Wait 5-30 minutes for DNS propagation"
        echo "3. The certificate will automatically validate once DNS records are in place"
        echo
        echo "For now, we'll skip HTTPS configuration. To proceed:"
        echo
        read -p "Do you want to continue without HTTPS? (yes/no): " skip_https
        
        if [ "$skip_https" = "yes" ]; then
            echo
            echo "You can apply without HTTPS listener:"
            echo "  terraform apply -var=\"stage=$STAGE\" -var=\"region=$REGION\" -var=\"domain_name=\""
            return 0
        else
            return 1
        fi
    fi
}

# Main execution
echo "=== Step 1: Check Certificate Status ==="
fix_certificate || {
    echo -e "${RED}Certificate validation required. Exiting.${NC}"
    exit 1
}

echo
echo "=== Step 2: Import Existing Resources ==="
import_existing_resources

echo
echo "=== Step 3: Refresh State ==="
echo -e "${BLUE}Refreshing Terraform state...${NC}"
terraform refresh -var="stage=$STAGE" -var="region=$REGION" -lock-timeout=5m

echo
echo "=== Step 4: Apply Changes ==="
echo -e "${BLUE}Attempting to apply Terraform changes...${NC}"

# If certificate is not valid, apply without domain
if ! check_certificate >/dev/null 2>&1; then
    echo -e "${YELLOW}Applying without HTTPS (certificate not ready)...${NC}"
    terraform apply -var="stage=$STAGE" -var="region=$REGION" -var="domain_name="
else
    terraform apply -var="stage=$STAGE" -var="region=$REGION"
fi

echo
echo -e "${GREEN}✓ Process completed!${NC}"
echo
echo "Next steps:"
if ! check_certificate >/dev/null 2>&1; then
    echo "1. Add DNS validation records to GoDaddy"
    echo "2. Wait for certificate validation"
    echo "3. Re-run with: terraform apply -var=\"stage=$STAGE\" -var=\"region=$REGION\""
fi