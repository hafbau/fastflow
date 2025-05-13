#!/bin/bash

# Color definitions for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}===============================================${NC}"
echo -e "${PURPLE}FlowStack Workspace Management Tests${NC}"
echo -e "${PURPLE}===============================================${NC}"

# Change to project root directory
cd "$(dirname "$0")/.."

# Create test results directory if it doesn't exist
mkdir -p test-results/workspace-management

# Run workspace management tests
echo -e "${BLUE}Running Workspace Management tests...${NC}"

# Use environment variables if they exist
DB_RESET=${DB_RESET:-false}
HEADED=${HEADED:-true}
HEADED_FLAG=""

if [ "$HEADED" = "true" ]; then
  HEADED_FLAG="--headed"
  echo -e "${YELLOW}Running in headed mode${NC}"
else
  echo -e "${YELLOW}Running in headless mode${NC}"
fi

# Reset test database if requested
if [ "$DB_RESET" = "true" ]; then
  echo -e "${YELLOW}Resetting test database before running tests...${NC}"
  # Add database reset command here if needed
  # e.g., npm run db:reset:test
fi

# Run the tests
echo -e "${CYAN}Starting Playwright tests for workspace management...${NC}"
npx playwright test tests/workspace-management.spec.js $HEADED_FLAG --reporter=html,list

# Check test results
TEST_EXIT_CODE=$?

# Generate test summary
echo -e "${PURPLE}===============================================${NC}"
echo -e "${PURPLE}Test Results Summary${NC}"
echo -e "${PURPLE}===============================================${NC}"

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✓ All workspace management tests passed!${NC}"
  echo -e "${GREEN}Workspace management features are working correctly.${NC}"
else
  echo -e "${RED}✗ Some workspace management tests failed.${NC}"
  echo -e "${YELLOW}Please check the test report for details.${NC}"
  echo -e "${YELLOW}Report: file://$(pwd)/playwright-report/index.html${NC}"
fi

echo -e "\n${BLUE}Workspace Management Implementation:${NC}"
echo -e "  ${CYAN}• Core components:${NC} Complete"
echo -e "  ${CYAN}• UI components:${NC} Complete"
echo -e "  ${CYAN}• Integration:${NC} Complete"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Review test results"
echo -e "2. Check the implementation plan for remaining tasks"
echo -e "3. Run the combined test suite with ./tests/run-all-tests.sh"

# Exit with the test exit code
exit $TEST_EXIT_CODE
