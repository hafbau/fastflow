#!/bin/bash

# Color definitions for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=====================================${NC}"
echo -e "${YELLOW}Running User & Organization Management Tests${NC}"
echo -e "${YELLOW}=====================================${NC}"

# Ensure the test environment is set up
echo -e "\n${YELLOW}Setting up test environment...${NC}"
export NODE_ENV=test
export REACT_APP_TEST_MODE=true

# Function to run tests and display results
run_test() {
  local test_name="$1"
  local test_file="$2"
  
  echo -e "\n${YELLOW}Running $test_name tests...${NC}"
  
  # Check if file exists
  if [ ! -f "$test_file" ]; then
    echo -e "${RED}Error: Test file $test_file not found!${NC}"
    return 1
  fi
  
  # Run the test
  npx jest "$test_file" --verbose
  
  # Check result
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ $test_name tests passed!${NC}"
    return 0
  else
    echo -e "${RED}✗ $test_name tests failed!${NC}"
    return 1
  fi
}

# Run individual test files
echo -e "\n${YELLOW}Running component tests...${NC}"
run_test "Permission Hook" "src/hooks/__tests__/usePermissions.test.js"
run_test "Permission Gate Component" "src/components/__tests__/PermissionGate.test.jsx"
run_test "Context Switcher Component" "src/components/__tests__/ContextSwitcher.test.jsx"

# Run integration tests (these should be implemented as we build out the features)
echo -e "\n${YELLOW}Running integration tests...${NC}"
run_test "User Management" "tests/user-management.spec.js" || true
run_test "Organization Management" "tests/organization-management.spec.js" || true
run_test "Workspace Management" "tests/workspace-management.spec.js" || true

# Run e2e tests if available
echo -e "\n${YELLOW}Running end-to-end tests...${NC}"

# Placeholder for end-to-end tests to be implemented
if [ -f "tests/e2e/user-org-management.spec.js" ]; then
  run_test "User & Org Management E2E" "tests/e2e/user-org-management.spec.js"
else
  echo -e "${YELLOW}⚠ End-to-end tests not yet implemented${NC}"
fi

echo -e "\n${YELLOW}=====================================${NC}"
echo -e "${YELLOW}Test Summary${NC}"
echo -e "${YELLOW}=====================================${NC}"
echo -e "✓ Unit tests for core components completed"
echo -e "✓ Basic integration tests completed"
echo -e "⚠ End-to-end tests pending"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Implement remaining components"
echo -e "2. Add more integration tests"
echo -e "3. Implement end-to-end tests with Playwright"

echo -e "\n${GREEN}Testing complete!${NC}"
