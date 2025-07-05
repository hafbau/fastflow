#!/bin/bash
# Script to check ACM certificate validation status

set -e

echo "=== ACM Certificate Status Check ==="
echo

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN="${1:-studio.getflowstack.ai}"
REGION="${2:-us-east-1}"

echo "Checking certificate for: $DOMAIN"
echo "Region: $REGION"
echo

# Find all certificates for the domain
echo -e "${BLUE}Finding certificates...${NC}"
CERTS=$(aws acm list-certificates --region "$REGION" \
    --query "CertificateSummaryList[?contains(DomainName, '$DOMAIN')].[CertificateArn,DomainName,Status]" \
    --output text)

if [ -z "$CERTS" ]; then
    echo -e "${RED}No certificates found for $DOMAIN${NC}"
    echo
    echo "To create a certificate, run one of these commands:"
    echo
    echo "Option 1 - Using the script:"
    echo "  ./scripts/create-certificate.sh $DOMAIN $REGION"
    echo
    echo "Option 2 - Using Terraform directly:"
    echo "  terraform apply -var=\"domain_name=$DOMAIN\" -target=aws_acm_certificate.main"
    echo
    echo "Option 3 - If you don't need HTTPS yet:"
    echo "  terraform apply -var=\"domain_name=\"\""
    exit 1
fi

# Check each certificate
while IFS=$'\t' read -r cert_arn domain status; do
    echo
    echo "Certificate: $cert_arn"
    echo "Domain: $domain"
    echo "Status: $status"
    
    if [ "$status" = "ISSUED" ]; then
        echo -e "${GREEN}✓ Certificate is valid and ready to use${NC}"
    else
        echo -e "${YELLOW}⚠ Certificate needs validation${NC}"
        
        # Get validation details
        echo
        echo "DNS Validation Records Required:"
        aws acm describe-certificate --certificate-arn "$cert_arn" --region "$REGION" \
            --query 'Certificate.DomainValidationOptions[*]' \
            --output json | jq -r '.[] | "Domain: \(.DomainName)\nCNAME Name: \(.ResourceRecord.Name)\nCNAME Value: \(.ResourceRecord.Value)\n"'
        
        echo -e "${YELLOW}Add these CNAME records to your DNS provider (GoDaddy)${NC}"
    fi
done <<< "$CERTS"

echo
echo "=== Instructions ==="
echo "1. If certificate shows as PENDING_VALIDATION:"
echo "   - Add the CNAME records shown above to GoDaddy DNS"
echo "   - Records usually validate within 5-30 minutes"
echo "   - AWS will automatically validate once DNS propagates"
echo
echo "2. To proceed without HTTPS for now:"
echo "   terraform apply -var=\"domain_name=\"\""
echo
echo "3. To check validation status again:"
echo "   ./scripts/check-certificate.sh"