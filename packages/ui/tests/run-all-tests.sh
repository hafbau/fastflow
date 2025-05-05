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
echo -e "${PURPLE}FlowStack User & Organization Management Tests${NC}"
echo -e "${PURPLE}===============================================${NC}"

# Track overall test status
OVERALL_STATUS=0

# Function to run a command and track its status
run_command() {
  local cmd="$1"
  local description="$2"
  
  echo -e "\n${CYAN}>> $description${NC}"
  echo -e "${YELLOW}Running: $cmd${NC}"
  
  eval "$cmd"
  local status=$?
  
  if [ $status -ne 0 ]; then
    echo -e "${RED}✗ Failed: $description${NC}"
    OVERALL_STATUS=1
  else
    echo -e "${GREEN}✓ Passed: $description${NC}"
  fi
  
  return $status
}

# Make sure test scripts are executable
chmod +x tests/run-management-tests.sh tests/run-e2e-tests.sh

# Create test results directory
mkdir -p test-results

echo -e "\n${BLUE}===== Phase 1: Running Linting =====${NC}"
run_command "npm run lint:ui" "Linting UI code"

echo -e "\n${BLUE}===== Phase 2: Running Unit Tests =====${NC}"
run_command "npm run test:ui" "Running UI unit tests"

echo -e "\n${BLUE}===== Phase 3: Running Component Tests =====${NC}"
run_command "./tests/run-management-tests.sh" "Running component and integration tests"

echo -e "\n${BLUE}===== Phase 4: Running E2E Tests =====${NC}"
run_command "./tests/run-e2e-tests.sh" "Running end-to-end tests with Playwright"

# Print final status
echo -e "\n${PURPLE}===============================================${NC}"
echo -e "${PURPLE}Test Results Summary${NC}"
echo -e "${PURPLE}===============================================${NC}"

if [ $OVERALL_STATUS -eq 0 ]; then
  echo -e "${GREEN}✓ All test phases passed successfully!${NC}"
  echo -e "${GREEN}Tasks 3 (User Management) and 4 (Organization Management) verified.${NC}"
else
  echo -e "${RED}✗ Some tests failed. Please check the output above for details.${NC}"
  echo -e "${YELLOW}Review the test failures and address the issues before proceeding.${NC}"
fi

# Implementation status based on our documentation
echo -e "\n${BLUE}Implementation Status:${NC}"
echo -e "  ${CYAN}• User Management:${NC} 80% complete"
echo -e "  ${CYAN}• Organization Management:${NC} 75% complete"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Address any failed tests"
echo -e "2. Complete the remaining work items from implementation plan"
echo -e "3. Run load and security tests for multi-tenant features"
echo -e "4. Validate with product requirements document"

echo -e "\n${PURPLE}See implementation-plan-user-org-management.md for full details${NC}"

# Exit with the overall status
exit $OVERALL_STATUS
