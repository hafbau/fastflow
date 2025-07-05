#!/bin/bash
# Script to refresh AWS session and handle token expiration

set -e

echo "=== AWS Session Refresh Script ==="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check current identity
echo "Checking current AWS identity..."
if aws sts get-caller-identity; then
    echo -e "${GREEN}✓ AWS credentials are valid${NC}"
else
    echo -e "${RED}✗ AWS credentials are invalid or expired${NC}"
    echo
    echo "For GitHub Actions:"
    echo "  - The workflow will need to be re-run"
    echo "  - OIDC tokens expire after the job completes"
    echo
    echo "For local development:"
    echo "  - Run: aws sso login"
    echo "  - Or: aws configure"
    echo
    exit 1
fi

echo
echo "Session details:"
aws sts get-caller-identity --output table

# For GitHub Actions, show the token expiration
if [[ $(aws sts get-caller-identity --query 'Arn' --output text) == *"assumed-role/GitHubActionsTerraformRole"* ]]; then
    echo
    echo -e "${YELLOW}Note: Running under GitHub Actions assumed role${NC}"
    echo "Token will expire when the workflow completes"
    echo
    echo "To extend session for long operations:"
    echo "1. Use -lock-timeout flag: terraform apply -lock-timeout=30m"
    echo "2. Split operations into smaller chunks"
    echo "3. Use the destroy script which handles timeouts"
fi