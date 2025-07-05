#!/bin/bash
# Comprehensive certificate check

set -e

echo "=== Comprehensive ACM Certificate Check ==="
echo

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

REGION="${1:-us-east-1}"

echo "Checking ALL certificates in region: $REGION"
echo

# List ALL certificates
echo -e "${BLUE}All certificates in the region:${NC}"
aws acm list-certificates --region "$REGION" \
    --query "CertificateSummaryList[*].[CertificateArn,DomainName,Status]" \
    --output table

echo
echo -e "${BLUE}Certificates containing 'flowstack':${NC}"
aws acm list-certificates --region "$REGION" \
    --query "CertificateSummaryList[?contains(DomainName, 'flowstack')].[CertificateArn,DomainName,Status]" \
    --output table

# Check for pending validation certificates
echo
echo -e "${BLUE}Certificates pending validation:${NC}"
PENDING=$(aws acm list-certificates --region "$REGION" \
    --certificate-statuses PENDING_VALIDATION \
    --query "CertificateSummaryList[*].[CertificateArn,DomainName]" \
    --output text)

if [ -z "$PENDING" ]; then
    echo "No certificates pending validation"
else
    echo "$PENDING"
    
    # Show validation details for pending certs
    while IFS=$'\t' read -r arn domain; do
        echo
        echo -e "${YELLOW}Validation details for $domain:${NC}"
        aws acm describe-certificate --certificate-arn "$arn" --region "$REGION" \
            --query 'Certificate.DomainValidationOptions[*].[DomainName,ValidationStatus,ResourceRecord.Name,ResourceRecord.Value]' \
            --output table
    done <<< "$PENDING"
fi

# Check Terraform state
echo
echo -e "${BLUE}Checking Terraform state for certificate resources:${NC}"
cd /Users/hafizsuara/Projects/flowstack/terraform
if terraform state list 2>/dev/null | grep -E "certificate|acm"; then
    terraform state list | grep -E "certificate|acm"
else
    echo "No certificate resources in Terraform state"
    echo
    echo -e "${YELLOW}The certificate might need to be created or imported.${NC}"
fi