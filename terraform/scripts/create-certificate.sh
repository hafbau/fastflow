#!/bin/bash
# Script to create ACM certificate for the domain

set -e

echo "=== ACM Certificate Creation Script ==="
echo

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN="${1:-studio.getflowstack.ai}"
REGION="${2:-us-east-1}"
STAGE="${3:-prod}"

echo "Configuration:"
echo "  Domain: $DOMAIN"
echo "  Region: $REGION"
echo "  Stage: $STAGE"
echo

# Check if certificate already exists
echo -e "${BLUE}Checking for existing certificates...${NC}"
EXISTING=$(aws acm list-certificates --region "$REGION" \
    --query "CertificateSummaryList[?contains(DomainName, '$DOMAIN')].CertificateArn" \
    --output text 2>/dev/null || echo "")

if [ -n "$EXISTING" ]; then
    echo -e "${YELLOW}Certificate already exists: $EXISTING${NC}"
    echo "Run ./scripts/check-certificate.sh to see its status"
    exit 0
fi

echo -e "${BLUE}No certificate found. Creating via Terraform...${NC}"
echo

# Apply just the certificate resources
echo "Creating ACM certificate..."
terraform apply -var="stage=$STAGE" -var="region=$REGION" -var="domain_name=$DOMAIN" \
    -target=aws_acm_certificate.main \
    -auto-approve

echo
echo -e "${GREEN}Certificate creation initiated!${NC}"
echo

# Get the certificate ARN
CERT_ARN=$(terraform output -raw acm_certificate_arn 2>/dev/null || echo "pending")
echo "Certificate ARN: $CERT_ARN"

echo
echo -e "${YELLOW}=== NEXT STEPS ===${NC}"
echo "1. Check certificate status:"
echo "   ./scripts/check-certificate.sh"
echo
echo "2. The output will show DNS validation records to add to GoDaddy"
echo
echo "3. After adding DNS records, wait 5-30 minutes for validation"
echo
echo "4. Once validated, apply the HTTPS listener:"
echo "   terraform apply -var=\"stage=$STAGE\" -var=\"region=$REGION\""