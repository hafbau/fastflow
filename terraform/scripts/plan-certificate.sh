#!/bin/bash
# Check what Terraform plans to do with certificates

set -e

echo "=== Terraform Certificate Plan ==="
echo

STAGE="${1:-prod}"
REGION="${2:-us-east-1}"

cd /Users/hafizsuara/Projects/flowstack/terraform

echo "Running terraform plan for certificate resources..."
echo

terraform plan -var="stage=$STAGE" -var="region=$REGION" \
    -target=aws_acm_certificate.main \
    -target=aws_acm_certificate_validation.main \
    -target=data.aws_route53_zone.main 2>&1 | grep -A 10 -B 5 "certificate\|acm" || \
terraform plan -var="stage=$STAGE" -var="region=$REGION" \
    -target=aws_acm_certificate.main

echo
echo "If the plan shows 'will be created', run:"
echo "  terraform apply -var=\"stage=$STAGE\" -var=\"region=$REGION\" -target=aws_acm_certificate.main"